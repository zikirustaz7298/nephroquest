"use client";

import Link from "next/link";
import { CASES } from "../../data/cases";

export default function CaseList() {
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Link href="/" className="small">← Menu</Link>
          <h1 style={{ marginTop: 4 }}>Case Rush</h1>
          <p className="muted small">Pick a patient. Manage budget and time. Diagnose correctly.</p>
        </div>
        <Link href="/drill" className="btn">⚡ Lab Drill</Link>
      </div>

      {CASES.map((c) => (
        <Link key={c.id} href={`/play/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {c.title}{" "}
                <span className="badge topic">{c.topic}</span>{" "}
                <span className="badge diff">{"★".repeat(c.difficulty)}</span>
              </div>
              <div className="small muted" style={{ marginTop: 2 }}>{c.presentation}</div>
            </div>
            <span className="muted">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
