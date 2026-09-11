// Game engine: state transitions, scoring, harm states, expert comparison.
// Client-side only — progress persists to localStorage.

export interface CaseProgress {
  caseId: string;
  clock: number;               // in-game minutes elapsed
  budgetUsed: number;
  historyAsked: string[];
  testsOrdered: string[];
  labResults: { testId: string; results: any[]; reveals?: string }[];
  diagnosesMade?: string;
  stagingAnswer?: string;
  managementPicked?: string[];
  harmFired: string[];
  status: "playing" | "diagnosis" | "staging" | "management" | "complete";
  score: number;
  penalties: { name: string; penalty: number; message: string }[];
}

export const STARTING_BUDGET = 12;

export function newProgress(caseId: string): CaseProgress {
  return {
    caseId,
    clock: 0,
    budgetUsed: 0,
    historyAsked: [],
    testsOrdered: [],
    labResults: [],
    harmFired: [],
    status: "playing",
    score: 0,
    penalties: [],
  };
}

export function canAfford(progress: CaseProgress, cost: number): boolean {
  return progress.budgetUsed + cost <= STARTING_BUDGET;
}

export function orderTest(progress: CaseProgress, test: { id: string; cost: number; time: number }): CaseProgress {
  if (progress.testsOrdered.includes(test.id) || !canAfford(progress, test.cost)) {
    return progress;
  }
  return {
    ...progress,
    clock: progress.clock + test.time,
    budgetUsed: progress.budgetUsed + test.cost,
    testsOrdered: [...progress.testsOrdered, test.id],
  };
}

export function askHistory(progress: CaseProgress, h: { id: string; time: number; cost: number }): CaseProgress {
  if (progress.historyAsked.includes(h.id)) return progress;
  return {
    ...progress,
    clock: progress.clock + h.time,
    budgetUsed: progress.budgetUsed + h.cost,
    historyAsked: [...progress.historyAsked, h.id],
  };
}

export function checkHarmStates(
  progress: CaseProgress,
  harmStates: any[],
): { progress: CaseProgress; firedNow: any[] } {
  const firedNow: any[] = [];
  let penalties = [...progress.penalties];
  let harmFired = [...progress.harmFired];

  for (const harm of harmStates) {
    if (harmFired.includes(harm.id)) continue;

    // time-triggered harm
    if (harm.triggerAtMinutes !== undefined && progress.clock >= harm.triggerAtMinutes) {
      // preventable by having ordered a specific test early? only if that test
      // was ordered BEFORE the trigger time — we approximate: ordered at all
      // AND ordered within budget-wise reasonable time (first ordering wins)
      const ordered = progress.testsOrdered.includes(harm.triggerIfUnordered);
      if (harm.triggerIfUnordered && ordered) continue;
      firedNow.push(harm);
      penalties.push({ name: harm.name, penalty: harm.penalty, message: harm.message });
      harmFired.push(harm.id);
    }
  }
  return {
    progress: { ...progress, harmFired, penalties },
    firedNow,
  };
}

export interface ScoreBreakdown {
  diagnosticAccuracy: number;   // 0-40
  testEfficiency: number;       // 0-25
  timeEfficiency: number;       // 0-15
  staging: number;              // 0-10
  management: number;           // 0-10
  penalties: number;            // negative
  total: number;
  grade: "A" | "B" | "C" | "D";
  expertComparison: {
    yours: string[];
    expert: string[];
    unnecessary: string[];
    missed: string[];
  };
}

export function scoreCase(
  progress: CaseProgress,
  caseData: any,
  diagnosis: string,
  staging: string,
  management: string[],
): ScoreBreakdown {
  // Diagnostic accuracy (40)
  const diagnosticAccuracy = diagnosis === caseData.correctDiagnosis ? 40 : 0;

  // Test efficiency (25): reward minimal sufficient workup
  const expertSet: Set<string> = new Set<string>(caseData.expertWorkup);
  const orderedSet: Set<string> = new Set<string>(progress.testsOrdered);
  const missed: string[] = Array.from(expertSet).filter((t: string) => !orderedSet.has(t));
  const unnecessary: string[] = Array.from(orderedSet).filter((t: string) => !expertSet.has(t));
  // full marks if all expert tests ordered; -4 per unnecessary, -8 per missed key test
  let testEfficiency = 25 - missed.length * 8 - unnecessary.length * 4;
  testEfficiency = Math.max(0, testEfficiency);

  // Time efficiency (15): expert path takes some time; being much slower loses marks
  const expertTime = caseData.expertWorkup.reduce((sum, id) => {
    const t = caseData.testOptions.find((x) => x.id === id);
    return sum + (t ? t.time : 0);
  }, 0);
  const expertHistoryTime = 20; // approx expert asks ~3 focused questions
  const expertTotal = expertTime + expertHistoryTime;
  let timeEfficiency: number;
  if (progress.clock <= expertTotal * 1.25) timeEfficiency = 15;
  else if (progress.clock <= expertTotal * 2) timeEfficiency = 8;
  else timeEfficiency = 0;

  // Staging (10)
  const stagingScore = caseData.stagingQuestion
    ? (staging === caseData.stagingQuestion.correct ? 10 : 0)
    : 10;

  // Management (10): fraction of correct picks minus wrong picks
  const correctIds: Set<string> = new Set<string>(
    caseData.managementOptions.filter((m: any) => m.correct).map((m: any) => m.id as string),
  );
  const pickedCorrect = management.filter((m) => correctIds.has(m)).length;
  const pickedWrong = management.filter((m) => !correctIds.has(m)).length;
  let managementScore = Math.round((pickedCorrect / correctIds.size) * 10) - pickedWrong * 3;
  managementScore = Math.max(0, Math.min(10, managementScore));

  // Penalties
  const penaltyTotal = progress.penalties.reduce((s, p) => s + p.penalty, 0);

  const total = Math.max(0,
    diagnosticAccuracy + testEfficiency + timeEfficiency + stagingScore + managementScore - penaltyTotal,
  );

  const grade: ScoreBreakdown["grade"] =
    total >= 85 ? "A" : total >= 70 ? "B" : total >= 50 ? "C" : "D";

  return {
    diagnosticAccuracy,
    testEfficiency,
    timeEfficiency,
    staging: stagingScore,
    management: managementScore,
    penalties: -penaltyTotal,
    total,
    grade,
    expertComparison: {
      yours: Array.from(orderedSet),
      expert: Array.from(expertSet),
      unnecessary,
      missed,
    },
  };
}
