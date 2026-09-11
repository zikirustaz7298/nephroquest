"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DRILL_ITEMS } from "../../data/drill";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROUND_SIZE = 10;
const SECONDS_PER_ITEM = 45;

export default function Drill() {
  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState<typeof DRILL_ITEMS>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_ITEM);

  const item = queue[idx];

  // timer
  useMemo(() => {
    if (!started || picked !== null || finished) return;
    if (timeLeft <= 0) {
      setPicked("__timeout__");
      setStreak(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, picked, finished]);

  const start = () => {
    setQueue(shuffle(DRILL_ITEMS).slice(0, ROUND_SIZE));
    setIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
    setTimeLeft(SECONDS_PER_ITEM);
    setStarted(true);
  };

  const pick = (option: string) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === item.correct) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (idx + 1 >= queue.length) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setTimeLeft(SECONDS_PER_ITEM);
    }
  };

  // ---------------------------------------------------------------- screens
  if (!started) {
    return (
      <div className="container">
        <Link href="/" className="small">← Menu</Link>
        <div className="card" style={{ textAlign: "center", padding: 40, marginTop: 16 }}>
          <h1>⚡ Lab Drill</h1>
          <p className="muted" style={{ margin: "8px 0 20px" }}>
            {ROUND_SIZE} rapid-fire lab interpretation questions. {SECONDS_PER_ITEM}s each.
            Streaks are tracked — how many can you chain?
          </p>
          <button className="btn primary" style={{ fontSize: 16, padding: "12px 32px" }} onClick={start}>
            Start round
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / queue.length) * 100);
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <h1>{correctCount}/{queue.length}</h1>
          <p style={{ fontSize: 44, fontWeight: 800, color: pct >= 80 ? "var(--good)" : pct >= 50 ? "var(--warn)" : "var(--bad)" }}>
            {pct}%
          </p>
          <p className="muted">Best streak: {bestStreak} 🔥</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
            <button className="btn primary" onClick={start}>Play again</button>
            <Link href="/" className="btn">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="small muted">{idx + 1} / {queue.length} · {item.topic}</span>
        <span className="small">🔥 {streak}</span>
        <span className="mono" style={{ color: timeLeft <= 10 ? "var(--bad)" : "inherit" }}>⏱ {timeLeft}s</span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 16 }}>
        <div style={{ width: `${(timeLeft / SECONDS_PER_ITEM) * 100}%` }} />
      </div>

      <div className="card">
        <p style={{ marginBottom: 10, fontWeight: 600 }}>{item.stem}</p>
        {item.labs.map((l) => (
          <div key={l.name} className="lab-row">
            <span className="small">{l.name}</span>
            <span className="mono small">
              {l.value}{" "}
              {l.flag === "H" && <span className="badge h">H</span>}
              {l.flag === "L" && <span className="badge l">L</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        {item.options.map((o) => {
          let cls = "";
          if (picked !== null) {
            if (o === item.correct) cls = "correct";
            else if (o === picked) cls = "wrong";
          }
          return (
            <button
              key={o}
              className={`option-btn ${cls}`}
              onClick={() => pick(o)}
              disabled={picked !== null}
            >
              {o}
            </button>
          );
        })}
        {picked !== null && (
          <>
            <div className={`banner ${picked === item.correct ? "good" : "danger"}`} style={{ marginTop: 8 }}>
              {picked === item.correct
                ? "✅ Correct!"
                : picked === "__timeout__"
                  ? "⏱ Time's up."
                  : "❌ Incorrect."}{" "}
              {item.explanation}
            </div>
            <button className="btn primary" onClick={next} style={{ width: "100%" }}>
              {idx + 1 >= queue.length ? "See results" : "Next →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
