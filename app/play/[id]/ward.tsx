"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CASES } from "../../../data/cases";
import {
  CaseProgress,
  ScoreBreakdown,
  STARTING_BUDGET,
  newProgress,
  orderTest,
  askHistory,
  checkHarmStates,
  scoreCase,
} from "../../../lib/engine";
import { drawWoodland } from "../../../lib/woodland";
import { saveCase } from "../../../lib/journey";
import { sfx } from "../../../lib/sfx";
import {
  WORLD,
  ZONES,
  PLAYER_START,
  PLAYER_SPEED,
  DoctorAnim,
  drawDoctor,
  drawWorld,
  canMove,
  zoneAt,
} from "../../../lib/ward";

type Phase = "intro" | "playing" | "diagnosis" | "staging" | "management" | "result";

interface Props {
  caseId: string;
  onExit: () => void;
}

export default function WardGame({ caseId, onExit }: Props) {
  const caseData = CASES.find((c) => c.id === caseId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef({ ...PLAYER_START });
  const animRef = useRef<DoctorAnim>({ frame: 0, facing: "down", moving: false });
  const keysRef = useRef<Record<string, boolean>>({});
  const touchRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const rafRef = useRef<number>(0);
  const lastBeepRef = useRef(0);
  const stepRef = useRef(0);

  const [progress, setProgress] = useState<CaseProgress>(() => newProgress(caseId));
  const [phase, setPhase] = useState<Phase>("intro");
  const [dialog, setDialog] = useState<{ title: string; body: React.ReactNode } | null>(null);
  const [harmToast, setHarmToast] = useState<{ name: string; message: string; penalty: number } | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [staging, setStaging] = useState("");
  const [management, setManagement] = useState<string[]>([]);
  const [result, setResult] = useState<ScoreBreakdown | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [labOpen, setLabOpen] = useState(false);
  const [nearZone, setNearZone] = useState<string | null>(null);

  const severity = Math.min(1, progress.clock / 400 + progress.penalties.length * 0.25);

  // ------------------------------------------------------------- game loop
  useEffect(() => {
    if (phase !== "playing" || !caseData || dialog) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const loop = (t: number) => {
      // input
      const k = keysRef.current;
      const touch = touchRef.current;
      let dx = 0;
      let dy = 0;
      if (k["w"] || k["arrowup"]) dy -= 1;
      if (k["s"] || k["arrowdown"]) dy += 1;
      if (k["a"] || k["arrowleft"]) dx -= 1;
      if (k["d"] || k["arrowright"]) dx += 1;
      dx += touch.dx;
      dy += touch.dy;
      const len = Math.hypot(dx, dy) || 1;
      dx = (dx / len) * PLAYER_SPEED;
      dy = (dy / len) * PLAYER_SPEED;

      const moving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
      const p = posRef.current;
      const prev = { ...p };
      const np = canMove(p, dx, dy);
      posRef.current = np;

      // animation
      const a = animRef.current;
      a.moving = moving;
      if (moving) {
        a.frame = (a.frame + 0.18) % 4;
        if (Math.abs(dx) > Math.abs(dy)) a.facing = dx > 0 ? "right" : "left";
        else a.facing = dy > 0 ? "down" : "up";
        // footsteps
        stepRef.current += Math.hypot(np.x - prev.x, np.y - prev.y);
        if (stepRef.current > 26) {
          stepRef.current = 0;
          sfx.footstep();
        }
      }

      // which zone are we near? (interaction radius around zone edges)
      const zp = { x: np.x, y: np.y };
      let near: string | null = null;
      for (const z of ZONES) {
        const box = { x: z.x - 26, y: z.y - 26, w: z.w + 52, h: z.h + 52 };
        if (zp.x > box.x && zp.x < box.x + box.w && zp.y > box.y && zp.y < box.y + box.h) {
          near = z.id;
          break;
        }
      }
      if (near !== nearZone) {
        setNearZone(near);
        if (near) sfx.uiClick();
      }

      // monitor beep tempo by severity
      const interval = Math.max(400, 1500 - severity * 1000);
      if (t - lastBeepRef.current > interval) {
        lastBeepRef.current = t;
        sfx.monitorBeep(severity > 0.6);
      }

      // render
      const motionTime = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : t;
      drawWoodland(ctx, motionTime, { severity });
      drawDoctor(ctx, np, a, motionTime);
      canvas.dataset.position = `${Math.round(np.x)},${Math.round(np.y)}`;

      // interaction hint above nearest zone
      if (near) {
        const z = ZONES.find((zz) => zz.id === near)!;
        ctx.font = "bold 13px sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 4;
        const label = `E / tap: ${z.label}`;
        const tw = ctx.measureText(label).width;
        const lx = z.x + z.w / 2 - tw / 2;
        const ly = z.y - 34;
        ctx.strokeText(label, lx, ly);
        ctx.fillText(label, lx, ly);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, severity, nearZone, caseData, dialog]);

  // ---------------------------------------------------------------- input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (dialog || phase !== "playing" || document.activeElement !== canvasRef.current) return;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === "e") interact();
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  // ---------------------------------------------------------------- helpers
  const applyHarm = (p: CaseProgress) => {
    if (!caseData) return p;
    const { progress: p2, firedNow } = checkHarmStates(p, caseData.harmStates);
    if (firedNow.length) {
      const h = firedNow[0];
      setHarmToast({ name: h.name, message: h.message, penalty: h.penalty });
      sfx.alarm();
      setTimeout(() => setHarmToast(null), 9000);
    }
    return p2;
  };

  const interact = useCallback((station?: string) => {
    if (phase !== "playing" || !caseData) return;
    const z = (station ? ZONES.find(z => z.id === station) : zoneAt(posRef.current)) || ZONES.find((zz) => {
      const box = { x: zz.x - 20, y: zz.y - 20, w: zz.w + 40, h: zz.h + 40 };
      const p = posRef.current;
      return p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h;
    });
    if (!z) return;
    setLabOpen(z.id === "lab");
    sfx.doorOpen();

    if (z.id === "bed") {
      // history dialog
      const items = caseData.historyOptions.map((h) => {
        const asked = progress.historyAsked.includes(h.id);
        return (
          <button
            key={h.id}
            className="option-btn"
            disabled={asked}
            onClick={() => {
              setProgress((pp) => applyHarm(askHistory(pp, h)));
              setDialog(null);
              sfx.pageSound();
              setTimeout(() => {
                setDialog({
                  title: `✦ ${h.question}`,
                  body: <p style={{ fontSize: 15 }}>{h.answer}</p>,
                });
              }, 50);
            }}
          >
            {asked ? "✓ " : ""}{h.question} <span className="small muted">+{h.time}m</span>
          </button>
        );
      });
      setDialog({ title: "Patient history", body: <>{items}</> });
    } else if (z.id === "lab") {
      const items = caseData.testOptions.map((t) => {
        const ordered = progress.testsOrdered.includes(t.id);
        const affordable = progress.budgetUsed + t.cost <= STARTING_BUDGET;
        if (ordered) {
          return (
            <div key={t.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600 }}>✓ {t.name} — results:</div>
              {t.results.map((r: any) => (
                <div key={r.name} className="lab-row">
                  <span className="small">{r.name}</span>
                  <span className="mono small">
                    {r.value}{" "}
                    {r.flag === "H" && <span className="badge h">H</span>}
                    {r.flag === "L" && <span className="badge l">L</span>}
                    {r.flag === "crit" && <span className="badge crit">CRIT</span>}
                  </span>
                </div>
              ))}
              {t.reveals && <div className="teach small" style={{ marginTop: 4 }}>{t.reveals}</div>}
            </div>
          );
        }
        return (
          <button
            key={t.id}
            className="option-btn"
            disabled={!affordable}
            onClick={() => {
              setProgress((pp) => applyHarm(orderTest(pp, t)));
              sfx.ding();
            }}
          >
            ✦ {t.name} <span className="small muted">◆{t.cost} · {t.time}m</span>
          </button>
        );
      });
      setDialog({
        title: `✦ Lab bench — budget ◆${STARTING_BUDGET - progress.budgetUsed} remaining`,
        body: <>{items}</>,
      });
    } else if (z.id === "phone") {
      // consultant hint: costs 2 budget, reveals one key teaching point
      setDialog({
        title: "The woodland mentor",
        body: (
          <>
            <p className="small" style={{ marginBottom: 10 }}>
              A mentor’s hint costs <b>◆2 budget</b> and the consultant will nudge you toward one key point.
            </p>
            <button
              className="btn primary"
              disabled={progress.budgetUsed + 2 > STARTING_BUDGET || !!hint}
              onClick={() => {
                setProgress((pp) => ({ ...pp, budgetUsed: pp.budgetUsed + 2 }));
                const tp = caseData.teachingPoints[0];
                setHint(tp);
                setDialog(null);
                sfx.pageSound();
              }}
            >
              Ask mentor (◆2)
            </button>
            {hint && <div className="teach" style={{ marginTop: 10 }}>Consultant: {hint}</div>}
          </>
        ),
      });
    } else if (z.id === "chart") {
      if (progress.testsOrdered.length === 0 && progress.historyAsked.length === 0) {
        setDialog({
          title: "✦ Chart trolley",
          body: <p>You haven't even met the patient yet. (Go to the bed first!)</p>,
        });
        return;
      }
      setDialog(null);
      setPhase("diagnosis");
    } else if (z.id === "exit") {
      setDialog({
        title: "✦ Leave the ward?",
        body: (
          <>
            <p className="small" style={{ marginBottom: 10 }}>
              The case isn't finished — leaving now counts as abandoning it.
            </p>
            <button className="btn bad" onClick={onExit}>Abandon case</button>
          </>
        ),
      });
    }
  }, [phase, progress, caseData, hint]);

  // Keep an open investigation panel in sync with the paid workup.
  useEffect(() => { if (labOpen && dialog) interact("lab"); }, [progress]);
  useEffect(() => {
    if (!dialog) return;
    keysRef.current = {}; touchRef.current = {dx:0,dy:0};
    const previous = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setDialog(null); }
      if (e.key === "Tab") {
        const nodes = modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]');
        if (!nodes?.length) { e.preventDefault(); return; }
        const first = nodes[0], last = nodes[nodes.length-1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) { e.preventDefault();last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault();first.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown",key); previous?.focus(); };
  }, [!!dialog]);

  // touch joystick
  const joyRef = useRef<HTMLDivElement>(null);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0 });
  const handleJoy = (e: React.TouchEvent | React.MouseEvent) => {
    const joy = joyRef.current;
    if (!joy) return;
    const rect = joy.getBoundingClientRect();
    const pt = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    if (!pt) return;
    const dx = pt.clientX - (rect.left + rect.width / 2);
    const dy = pt.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(1, len / (rect.width / 2));
    touchRef.current = { dx: (dx / len) * clamped, dy: (dy / len) * clamped };
    setJoyKnob({ x: (dx / len) * clamped * 28, y: (dy / len) * clamped * 28 });
  };
  const endJoy = () => {
    touchRef.current = { dx: 0, dy: 0 };
    setJoyKnob({ x: 0, y: 0 });
  };

  // ---------------------------------------------------------------- phases
  const submitDiagnosis = () => {
    if (!diagnosis) return;
    sfx.uiClick();
    setPhase(caseData?.stagingQuestion ? "staging" : "management");
  };
  const submitStaging = () => {
    if (!staging) return;
    sfx.uiClick();
    setPhase("management");
  };
  const finish = () => {
    if (!caseData) return;
    const r = scoreCase(progress, caseData, diagnosis, staging, management);
    setResult(r);
    setPhase("result");
    if (r.grade === "A" || r.grade === "B") sfx.success();
    else sfx.fail();
    try {
      saveCase(localStorage, caseData.id, r.total, "");
    } catch {}
  };

  if (!caseData) return <div className="container">Case not found.</div>;

  const testName = (tid: string) => caseData.testOptions.find((t) => t.id === tid)?.name || tid;
  const budgetLeft = STARTING_BUDGET - progress.budgetUsed;
  const clockH = Math.floor(progress.clock / 60);
  const clockM = progress.clock % 60;

  // ---------------------------------------------------------------- render
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "12px 10px 30px" }}>
      <section className="chapter-banner"><p className="eyebrow">DEWDROP MEADOWS · THE WOODLAND INFIRMARY</p><h1>{caseData.title === "The Dry Gardener" ? "A gardener. A quiet plea for help." : "Another story along the path."}</h1><p>The lantern is lit. Listen to your patient, gather evidence and write the next page of your healer’s journal.</p></section>
      {/* HUD */}
      <div className="card" style={{ width: "min(96vw, 960px)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <b>{caseData.title}</b> <span className="badge topic">{caseData.topic}</span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <span className="mono">⏱ {clockH}h{String(clockM).padStart(2, "0")}m</span>
          <span className="mono" style={{ color: budgetLeft <= 3 ? "#f87171" : undefined }}>◆ {budgetLeft}</span>
          <span style={{ color: severity > 0.66 ? "#f87171" : severity > 0.33 ? "#fbbf24" : "#4ade80", fontWeight: 700 }}>
            {severity > 0.66 ? "UNSTABLE" : severity > 0.33 ? "WATCH" : "STABLE"}
          </span>
        </div>
      </div>

      {/* harm toast */}
      {harmToast && (
        <div className="banner danger" style={{ width: "min(96vw, 960px)" }}>
          <b>⚠ {harmToast.name}</b> — {harmToast.message} <span className="small muted">(-{harmToast.penalty} pts)</span>
        </div>
      )}

      {/* intro */}
      {phase === "intro" && (
        <div className="card" style={{ width: "min(96vw, 700px)" }}>
          <h2 style={{ marginTop: 0 }}>{caseData.title}</h2>
          <p className="small muted" style={{ marginBottom: 10 }}>{caseData.presentation}</p>
          <p style={{ fontSize: 15 }}>{caseData.vignette}</p>
          <div style={{ margin: "14px 0", padding: 12, background: "var(--surface2)", borderRadius: 8 }} className="small">
            <b>How to play:</b> WASD / arrows / joystick to move. Walk to the <b>bed</b> to take history,
            the <b>lab bench</b> to order tests, the <b>mentor</b> for a consultant hint, and the
            <b> journal desk</b> when ready to diagnose. Or use the station buttons below the scene. The game clock advances with questions and tests, not real time.
          </div>
          <button className="btn primary" style={{ fontSize: 16 }} onClick={() => { sfx.pageSound(); setPhase("playing"); }}>
            Enter the woodland infirmary
          </button>
        </div>
      )}

      {/* canvas world */}
      {phase === "playing" && (
        <div style={{ position: "relative", width: "min(96vw, 960px)" }}>
          <canvas
            ref={canvasRef}
            width={WORLD.w}
            height={WORLD.h}
            style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid var(--border)", display: "block", cursor: "pointer" }}
            aria-label="Walkable woodland infirmary. Arrow keys or WASD to move, E to interact. Station buttons offer an equivalent path."
            tabIndex={0}
            onBlur={() => { keysRef.current = {}; }}
            onClick={() => { canvasRef.current?.focus(); interact(); }}
          />
          {/* mobile joystick */}
          <div
            ref={joyRef}
            onTouchStart={handleJoy}
            onTouchMove={handleJoy}
            onTouchEnd={endJoy}
            style={{
              position: "absolute", right: 14, bottom: 14,
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(15,23,42,0.55)", border: "2px solid rgba(148,163,184,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "none",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(226,232,240,0.85)",
              transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)`,
            }} />
          </div>
          <div className="small muted" style={{ textAlign: "center", marginTop: 6 }}>
            WASD / arrows / joystick to move · <b>E</b> or tap to interact {nearZone ? `· near: ${nearZone}` : ""}
          </div>
        </div>
      )}

      {phase === "playing" && <section className="journal">
        <nav className="station-nav" aria-label="Accessible infirmary stations">
          <button className="btn" onClick={() => interact("bed")}>Patient · history</button>
          <button className="btn" onClick={() => interact("lab")}>Investigations · lab</button>
          <button className="btn" onClick={() => interact("phone")}>Mentor · guidance</button>
          <button className="btn primary" onClick={() => interact("chart")}>Journal · diagnose</button>
          <button className="btn" onClick={() => interact("exit")}>Leave</button>
        </nav>
        <p className="small muted">Your path: listen → investigate → diagnose → stage → manage → reflect. Station buttons do the same work as walking; no precision movement required.</p>
        {hint && <div className="teach"><b>Mentor’s note</b><p>{hint}</p></div>}
        <details className="card" open><summary>Patient journal · initial observations & gathered clues</summary>
          {caseData.initialLabs.map(r=><div className="lab-row" key={r.name}><span>{r.name}</span><b>{r.value} {r.flag}</b></div>)}
          {caseData.historyOptions.filter(h=>progress.historyAsked.includes(h.id)).map(h=><div className="history-item" key={h.id}><b>{h.question}</b><p>{h.answer}</p></div>)}
          {caseData.testOptions.filter(t=>progress.testsOrdered.includes(t.id)).map(t=><details key={t.id}><summary>{t.name}</summary>{t.results.map(r=><div className="lab-row" key={r.name}><span>{r.name}</span><b>{r.value} {r.flag}</b></div>)}</details>)}
        </details>
      </section>}
      {/* dialog modal */}
      {dialog && phase === "playing" && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setDialog(null); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(2,6,23,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
          }}
        >
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1} className="card" style={{ width: "min(94vw, 640px)", maxHeight: "80vh", overflowY: "auto", margin: 0 }}>
            <h3 id="dialog-title" style={{ marginTop: 0 }}>{dialog.title}</h3>
            {dialog.body}
            <button className="btn sm" style={{ marginTop: 10 }} onClick={() => { setDialog(null); sfx.uiClick(); }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* diagnosis */}
      {phase === "diagnosis" && (
        <div className="card" style={{ width: "min(96vw, 640px)" }}>
          <h3>Working diagnosis</h3>
          {caseData.diagnosisOptions.map((d) => (
            <button key={d} className={`option-btn ${diagnosis === d ? "picked" : ""}`} onClick={() => { setDiagnosis(d); sfx.uiClick(); }}>
              {d}
            </button>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn sm" onClick={() => setPhase("playing")}>← back to ward</button>
            <button className="btn primary" onClick={submitDiagnosis} disabled={!diagnosis}>Submit</button>
          </div>
        </div>
      )}

      {/* staging */}
      {phase === "staging" && caseData.stagingQuestion && (
        <div className="card" style={{ width: "min(96vw, 640px)" }}>
          <h3>{caseData.stagingQuestion.question}</h3>
          {caseData.stagingQuestion.options.map((o) => (
            <button key={o} className={`option-btn ${staging === o ? "picked" : ""}`} onClick={() => { setStaging(o); sfx.uiClick(); }}>
              {o}
            </button>
          ))}
          <button className="btn primary" onClick={submitStaging} disabled={!staging} style={{ marginTop: 10 }}>Submit</button>
        </div>
      )}

      {/* management */}
      {phase === "management" && (
        <div className="card" style={{ width: "min(96vw, 640px)" }}>
          <h3>{caseData.managementPrompt}</h3>
          {caseData.managementOptions.map((m) => (
            <button
              key={m.id}
              className={`option-btn ${management.includes(m.id) ? "picked" : ""}`}
              onClick={() => {
                setManagement((mm) => (mm.includes(m.id) ? mm.filter((x) => x !== m.id) : [...mm, m.id]));
                sfx.uiClick();
              }}
            >
              {management.includes(m.id) ? "☑" : "☐"} {m.step}
            </button>
          ))}
          <button className="btn primary" onClick={finish} style={{ marginTop: 10 }}>Finish & see score</button>
        </div>
      )}

      {/* result */}
      {phase === "result" && result && (
        <div style={{ width: "min(96vw, 960px)" }}>
          <div className="card" style={{ textAlign: "center", padding: 30 }}>
            <h2>Chapter complete</h2><p className="reward">✦ Woodland healer · Best-score reward: 100 + your best score in journey XP. Replays improve your best, never farm duplicate rewards.</p>
            <div style={{ fontSize: 52, fontWeight: 800 }}>{result.total}</div>
            <div style={{ fontSize: 20, color: result.grade === "A" ? "#4ade80" : result.grade === "D" ? "#f87171" : "#fbbf24" }}>
              Grade {result.grade}
            </div>
          </div>
          <div className="grid2">
            <div className="card">
              <h3>Score breakdown</h3>
              <div className="score-row"><span>Diagnostic accuracy</span><b>{result.diagnosticAccuracy}/40</b></div>
              <div className="score-row"><span>Test efficiency</span><b>{result.testEfficiency}/25</b></div>
              <div className="score-row"><span>Time efficiency</span><b>{result.timeEfficiency}/15</b></div>
              <div className="score-row"><span>Staging</span><b>{result.staging}/10</b></div>
              <div className="score-row"><span>Management</span><b>{result.management}/10</b></div>
              <div className="score-row"><span>Harm penalties</span><b style={{ color: "#f87171" }}>{result.penalties}</b></div>
              {progress.penalties.map((p) => (
                <div key={p.name} className="small" style={{ color: "#f87171", padding: "4px 0" }}>⚠ {p.name}: {p.message}</div>
              ))}
            </div>
            <div className="card">
              <h3>Your workup vs expert</h3>
              <p className="small muted">Expert: {result.expertComparison.expert.map(testName).join(" · ")}</p>
              {result.expertComparison.missed.length > 0 && (
                <p className="small" style={{ color: "#fbbf24" }}>Missed: {result.expertComparison.missed.map(testName).join(", ")}</p>
              )}
              {result.expertComparison.unnecessary.length > 0 && (
                <p className="small" style={{ color: "#f87171" }}>Unnecessary: {result.expertComparison.unnecessary.map(testName).join(", ")}</p>
              )}
              {!result.expertComparison.missed.length && !result.expertComparison.unnecessary.length && (
                <p className="small" style={{ color: "#4ade80" }}>Perfect workup — exactly the expert set! ✦</p>
              )}
            </div>
          </div>
          <div className="card">
            <h3>Explanation</h3>
            <p className="small" style={{ marginBottom: 10 }}>{caseData.diagnosisExplanation}</p>
            <h3>Management rationale</h3>
            {caseData.managementOptions.map((m) => (
              <div key={m.id} className="history-item">
                <div className="q">{m.correct ? "✅" : "❌"} {m.step}</div>
                <div className="a">{m.rationale}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Teaching points</h3>
            {caseData.teachingPoints.map((tp, i) => <div key={i} className="teach">{tp}</div>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={onExit}>More cases</button>
          </div>
        </div>
      )}
    </div>
  );
}
