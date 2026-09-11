"use client";

import { useState } from "react";
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

function fmtClock(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export default function PlayCase({ params }: { params: { id: string } }) {
  const { id } = params;
  const caseData = CASES.find((c) => c.id === id);

  const [progress, setProgress] = useState<CaseProgress>(() => newProgress(id));
  const [diagnosis, setDiagnosis] = useState("");
  const [staging, setStaging] = useState("");
  const [management, setManagement] = useState<string[]>([]);
  const [result, setResult] = useState<ScoreBreakdown | null>(null);
  const [harmBanner, setHarmBanner] = useState<any[]>([]);

  if (!caseData) {
    return (
      <div className="container">
        <p>Case not found.</p>
        <Link href="/play">← back</Link>
      </div>
    );
  }

  // ---------------------------------------------------------------- helpers
  const applyHarm = (p: CaseProgress) => {
    const { progress: p2, firedNow } = checkHarmStates(p, caseData.harmStates);
    if (firedNow.length) {
      setHarmBanner(firedNow);
      setTimeout(() => setHarmBanner([]), 8000);
    }
    return p2;
  };

  const doAsk = (h: any) => {
    setProgress((p) => applyHarm(askHistory(p, h)));
  };
  const doOrder = (t: any) => {
    setProgress((p) => applyHarm(orderTest(p, t)));
  };

  const advanceToDiagnosis = () => {
    setProgress((p) => applyHarm({ ...p, status: "diagnosis" }));
  };
  const submitDiagnosis = () => {
    if (!diagnosis) return;
    setProgress((p) => applyHarm({ ...p, status: "staging" }));
  };
  const submitStaging = () => {
    setProgress((p) => applyHarm({ ...p, status: "management" }));
  };
  const toggleManagement = (mid: string) => {
    setManagement((m) => (m.includes(mid) ? m.filter((x) => x !== mid) : [...m, mid]));
  };
  const finish = () => {
    const r = scoreCase(progress, caseData, diagnosis, staging, management);
    setResult(r);
    try {
      const prev = JSON.parse(localStorage.getItem("nq_scores") || "{}");
      const best = prev[caseData.id];
      if (best === undefined || r.total > best) {
        prev[caseData.id] = r.total;
        localStorage.setItem("nq_scores", JSON.stringify(prev));
      }
    } catch {}
  };

  const testName = (tid: string) => caseData.testOptions.find((t) => t.id === tid)?.name || tid;

  // ---------------------------------------------------------------- render
  const budgetLeft = STARTING_BUDGET - progress.budgetUsed;

  return (
    <div className="container">
      {/* header stats */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Link href="/" className="small">← Menu</Link>
          <h2 style={{ margin: "4px 0 2px" }}>
            {caseData.title} <span className="badge topic">{caseData.topic}</span>
          </h2>
          <span className="small muted">{caseData.presentation}</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div className="stat">
            <span className="label">Clock</span>
            <span className="value mono">⏱ {fmtClock(progress.clock)}</span>
          </div>
          <div className="stat">
            <span className="label">Budget</span>
            <span className="value mono" style={{ color: budgetLeft <= 3 ? "var(--bad)" : "inherit" }}>
              ◆ {budgetLeft}/{STARTING_BUDGET}
            </span>
          </div>
          <div className="stat">
            <span className="label">Phase</span>
            <span className="value">{progress.status}</span>
          </div>
        </div>
      </div>

      {/* harm banners */}
      {harmBanner.map((h) => (
        <div key={h.id} className="banner danger">
          <strong>⚠ {h.name}</strong> — {h.message} <span className="small muted">(-{h.penalty} pts)</span>
        </div>
      ))}

      {/* ================================================== PLAYING PHASE */}
      {progress.status === "playing" && (
        <>
          <div className="card">
            <h3>Patient</h3>
            <p style={{ fontSize: 14 }}>{caseData.vignette}</p>
            <div style={{ marginTop: 12 }}>
              <div className="small muted" style={{ marginBottom: 4 }}>Initial labs:</div>
              {caseData.initialLabs.map((l) => (
                <div key={l.name} className="lab-row">
                  <span>{l.name}</span>
                  <span className="mono">
                    {l.value}{" "}
                    {l.flag === "H" && <span className="badge h">H</span>}
                    {l.flag === "L" && <span className="badge l">L</span>}
                    {l.flag === "crit" && <span className="badge crit">CRIT</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid2">
            {/* history */}
            <div className="card">
              <h3>History</h3>
              {caseData.historyOptions.map((h) => {
                const asked = progress.historyAsked.includes(h.id);
                return asked ? (
                  <div key={h.id} className="history-item">
                    <div className="q">❓ {h.question}</div>
                    <div className="a">💬 {h.answer}</div>
                  </div>
                ) : (
                  <button key={h.id} className="option-btn" onClick={() => doAsk(h)}>
                    ❓ {h.question} <span className="small muted">(+{h.time}m)</span>
                  </button>
                );
              })}
            </div>

            {/* tests */}
            <div className="card">
              <h3>Investigations</h3>
              {caseData.testOptions.map((t) => {
                const ordered = progress.testsOrdered.includes(t.id);
                const affordable = progress.budgetUsed + t.cost <= STARTING_BUDGET;
                return ordered ? null : (
                  <button
                    key={t.id}
                    className="option-btn"
                    onClick={() => doOrder(t)}
                    disabled={!affordable}
                    title={affordable ? "" : "Not enough budget"}
                  >
                    <div className="test-btn">
                      <span>🧪 {t.name}</span>
                      <span className="small muted">◆{t.cost} · {fmtClock(t.time)}</span>
                    </div>
                  </button>
                );
              })}
              {progress.testsOrdered.length === caseData.testOptions.length && (
                <p className="small muted">All tests ordered.</p>
              )}
            </div>
          </div>

          {/* results */}
          {progress.testsOrdered.length > 0 && (
            <div className="card">
              <h3>Results</h3>
              {progress.testsOrdered.map((tid) => {
                const t = caseData.testOptions.find((x) => x.id === tid)!;
                return (
                  <div key={tid} style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>🧪 {t.name}</div>
                    {t.results.map((r) => (
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
                    {t.reveals && (
                      <div className="teach small" style={{ marginTop: 6 }}>{t.reveals}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn primary" onClick={advanceToDiagnosis}>
              {progress.testsOrdered.length === 0 && progress.historyAsked.length === 0
                ? "Skip straight to diagnosis (risky!)"
                : "I'm ready to diagnose →"}
            </button>
          </div>
        </>
      )}

      {/* ================================================== DIAGNOSIS PHASE */}
      {progress.status === "diagnosis" && (
        <div className="card">
          <h3>What is your diagnosis?</h3>
          {caseData.diagnosisOptions.map((d) => (
            <button
              key={d}
              className={`option-btn ${diagnosis === d ? "picked" : ""}`}
              onClick={() => setDiagnosis(d)}
            >
              {d}
            </button>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              className="btn sm"
              onClick={() => setProgress((p) => ({ ...p, status: "playing" }))}
            >
              ← order more tests
            </button>
            <button className="btn primary" onClick={submitDiagnosis} disabled={!diagnosis}>
              Submit diagnosis
            </button>
          </div>
        </div>
      )}

      {/* ================================================== STAGING PHASE */}
      {progress.status === "staging" && caseData.stagingQuestion && (
        <div className="card">
          <h3>Staging question</h3>
          <p style={{ marginBottom: 12 }}>{caseData.stagingQuestion.question}</p>
          {caseData.stagingQuestion.options.map((o) => (
            <button
              key={o}
              className={`option-btn ${staging === o ? "picked" : ""}`}
              onClick={() => setStaging(o)}
            >
              {o}
            </button>
          ))}
          <button className="btn primary" onClick={submitStaging} disabled={!staging} style={{ marginTop: 12 }}>
            Submit
          </button>
        </div>
      )}
      {progress.status === "staging" && !caseData.stagingQuestion && (
        <div className="card">
          <button className="btn primary" onClick={submitStaging}>Continue →</button>
        </div>
      )}

      {/* ================================================== MANAGEMENT PHASE */}
      {progress.status === "management" && !result && (
        <div className="card">
          <h3>{caseData.managementPrompt}</h3>
          {caseData.managementOptions.map((m) => (
            <button
              key={m.id}
              className={`option-btn ${management.includes(m.id) ? "picked" : ""}`}
              onClick={() => toggleManagement(m.id)}
            >
              {management.includes(m.id) ? "☑" : "☐"} {m.step}
            </button>
          ))}
          <button className="btn primary" onClick={finish} style={{ marginTop: 12 }}>
            Finish case & see score
          </button>
        </div>
      )}

      {/* ================================================== RESULTS */}
      {result && (
        <>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, fontWeight: 800 }}>{result.total}</div>
            <div style={{ fontSize: 20, color: result.grade === "A" ? "var(--good)" : result.grade === "D" ? "var(--bad)" : "var(--warn)" }}>
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
              <div className="score-row"><span>Harm penalties</span><b style={{ color: "var(--bad)" }}>{result.penalties}</b></div>
              {progress.penalties.map((p) => (
                <div key={p.name} className="small" style={{ color: "var(--bad)", padding: "4px 0" }}>
                  ⚠ {p.name}: {p.message}
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Your workup vs. expert</h3>
              <p className="small muted">Expert&apos;s minimal sufficient workup:</p>
              <p className="small" style={{ marginBottom: 10 }}>
                {result.expertComparison.expert.map((t) => testName(t)).join(" · ")}
              </p>
              {result.expertComparison.missed.length > 0 && (
                <p className="small" style={{ color: "var(--warn)" }}>
                  Missed: {result.expertComparison.missed.map((t) => testName(t)).join(", ")}
                </p>
              )}
              {result.expertComparison.unnecessary.length > 0 && (
                <p className="small" style={{ color: "var(--bad)" }}>
                  Unnecessary: {result.expertComparison.unnecessary.map((t) => testName(t)).join(", ")}
                </p>
              )}
              {result.expertComparison.missed.length === 0 && result.expertComparison.unnecessary.length === 0 && (
                <p className="small" style={{ color: "var(--good)" }}>Perfect workup — exactly the expert set. 🎯</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Explanation</h3>
            <p className="small" style={{ marginBottom: 12 }}>{caseData.diagnosisExplanation}</p>
            <h3>Management rationale</h3>
            {caseData.managementOptions.map((m) => (
              <div key={m.id} className="history-item">
                <div className="q">
                  {m.correct ? "✅" : "❌"} {m.step}
                </div>
                <div className="a">{m.rationale}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Teaching points</h3>
            {caseData.teachingPoints.map((tp, i) => (
              <div key={i} className="teach">{tp}</div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/play" className="btn">More cases</Link>
            <Link href="/" className="btn primary">Home</Link>
          </div>
        </>
      )}
    </div>
  );
}
