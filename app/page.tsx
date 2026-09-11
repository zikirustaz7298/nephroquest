"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CASES } from "../data/cases";

function useLocalScores() {
  const [scores, setScores] = useState<Record<string, number>>({});
  useEffect(() => {
    try {
      setScores(JSON.parse(localStorage.getItem("nq_scores") || "{}"));
    } catch {}
  }, []);
  return scores;
}

export default function Home() {
  const scores = useLocalScores();
  const topicCounts: Record<string, number> = {};
  for (const c of CASES) topicCounts[c.topic] = (topicCounts[c.topic] || 0) + 1;

  return (
    <div className="container">
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <h1>
          Nephro<span style={{ color: "var(--accent)" }}>Quest</span>
        </h1>
        <p className="muted" style={{ fontSize: 17, maxWidth: 560, margin: "0 auto 8px" }}>
          A case-based nephrology learning game. Order labs, interpret results,
          manage the patient — and get scored on doing it <em>right</em>, not just fast.
        </p>
        <p className="small muted">For medical education. Not for real patient care.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <Link href="/play" className="btn primary" style={{ fontSize: 16, padding: "12px 28px" }}>
            ▶ Case Rush
          </Link>
          <Link href="/drill" className="btn" style={{ fontSize: 16, padding: "12px 28px" }}>
            ⚡ Lab Drill
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>How it works</h2>
        <div className="grid2">
          <div>
            <p className="small" style={{ marginBottom: 8 }}>
              Every action costs <strong>time</strong> and <strong>budget</strong>. The patient
              evolves while you investigate — wait too long and harm states fire.
              Shotgun-ordering wastes budget and loses points.
            </p>
            <p className="small">
              After each case, compare <strong>your workup vs. the expert&apos;s minimal
              sufficient set</strong>, and review the teaching points.
            </p>
          </div>
          <div>
            <h3>Scoring (100 points)</h3>
            <div className="score-row"><span>Diagnostic accuracy</span><b>40</b></div>
            <div className="score-row"><span>Test efficiency (avoid shotgun)</span><b>25</b></div>
            <div className="score-row"><span>Time efficiency</span><b>15</b></div>
            <div className="score-row"><span>Staging (KDIGO / CKD)</span><b>10</b></div>
            <div className="score-row"><span>Management</span><b>10</b></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Case library ({CASES.length})</h2>
        {CASES.map((c) => {
          const best = scores[c.id];
          return (
            <Link key={c.id} href={`/play/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 12px",
                  background: "var(--surface2)",
                  borderRadius: 8,
                  marginBottom: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {c.title}{" "}
                    <span className="badge topic">{c.topic}</span>{" "}
                    <span className="badge diff">{"★".repeat(c.difficulty)}</span>
                  </div>
                  <div className="small muted">{c.presentation}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {best !== undefined ? (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{best}</div>
                      <div className="small muted">best</div>
                    </div>
                  ) : (
                    <span className="small muted">not attempted</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="small muted" style={{ textAlign: "center" }}>
        Topics: {Object.entries(topicCounts).map(([t, n]) => `${t} (${n})`).join(" · ")} — more cases coming.
      </p>
    </div>
  );
}
