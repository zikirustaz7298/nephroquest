// NephroQuest case library — structured JSON-style case data.
// Each case: presentation, history questions, orderable tests (with cost+time),
// dynamic patient state (evolves per tick), harm states, diagnoses, management.

export interface LabValue {
  name: string;
  value: string;
  flag?: "H" | "L" | "crit";
}

export interface TestOption {
  id: string;
  name: string;
  cost: number;      // virtual budget cost
  time: number;      // minutes of in-game time
  results: LabValue[];
  reveals?: string;  // narrative revealed with results
}

export interface HistoryOption {
  id: string;
  question: string;
  answer: string;
  time: number;      // minutes
  cost: number;
  key?: boolean;     // part of the "minimal sufficient" workup
}

export interface HarmState {
  id: string;
  name: string;
  triggerAtMinutes?: number;   // fires at this in-game time if not prevented
  triggerIfUnordered?: string; // test id that must be ordered to prevent
  message: string;
  penalty: number;
}

export interface ManagementOption {
  id: string;
  step: string;
  correct: boolean;
  rationale: string;
}

export interface CaseData {
  id: string;
  title: string;
  topic: "AKI" | "CKD" | "Electrolytes" | "Glomerular" | "Dialysis";
  difficulty: 1 | 2 | 3;
  presentation: string;
  vignette: string;
  initialLabs: LabValue[];
  historyOptions: HistoryOption[];
  testOptions: TestOption[];
  expertWorkup: string[];      // test ids — the minimal sufficient set
  diagnosisOptions: string[];
  correctDiagnosis: string;
  diagnosisExplanation: string;
  stagingQuestion?: {
    question: string;
    options: string[];
    correct: string;
  };
  managementOptions: ManagementOption[];
  managementPrompt: string;
  harmStates: HarmState[];
  teachingPoints: string[];
}

export const CASES: CaseData[] = [
  // ================================================================
  // CASE 1 — Prerenal AKI
  // ================================================================
  {
    id: "aki-prerenal-001",
    title: "The Dry Gardener",
    topic: "AKI",
    difficulty: 1,
    presentation: "68M, creatinine 2.9 mg/dL (baseline 1.1), 3 days of vomiting and poor intake",
    vignette: "Encik Ahmad, 68, is brought in by his daughter. He's had 3 days of vomiting and diarrhoea, barely drinking. His legs feel weak. BP 95/60 lying, 78/55 standing. Mucous membranes dry. Creatinine today: 2.9 (baseline 1.1 from a clinic letter 3 months ago).",
    initialLabs: [
      { name: "Na+", value: "133 mmol/L", flag: "L" },
      { name: "K+", value: "3.4 mmol/L", flag: "L" },
      { name: "Creatinine", value: "2.9 mg/dL", flag: "H" },
      { name: "BUN", value: "42 mg/dL", flag: "H" },
    ],
    historyOptions: [
      { id: "h1", question: "Ask about fluid intake and losses", answer: "Vomiting ~5x/day for 3 days, taking frusemide 40mg BD for leg swelling, drinking very little.", time: 3, cost: 0, key: true },
      { id: "h2", question: "Ask about urine output", answer: "He thinks he's passed 'very little' since yesterday.", time: 2, cost: 0, key: true },
      { id: "h3", question: "Ask about medications (NSAIDs, contrast)", answer: "No NSAIDs. No recent contrast. Frusemide and a 'water pill' from the GP.", time: 3, cost: 0 },
      { id: "h4", question: "Ask about weight loss / appetite", answer: "Lost about 3 kg in the past week, mostly from the vomiting.", time: 2, cost: 0 },
    ],
    testOptions: [
      { id: "bmp", name: "Basic Metabolic Panel", cost: 1, time: 30, results: [
        { name: "Na+", value: "133 mmol/L", flag: "L" },
        { name: "K+", value: "3.4 mmol/L", flag: "L" },
        { name: "Cl-", value: "98 mmol/L", flag: "L" },
        { name: "HCO3-", value: "26 mmol/L" },
        { name: "Cr", value: "2.9 mg/dL", flag: "H" },
        { name: "BUN", value: "42 mg/dL", flag: "H" },
        { name: "BUN/Cr ratio", value: "14.5 (>20 in prerenal)", flag: "H" },
      ], reveals: "High BUN/Cr ratio suggests prerenal physiology." },
      { id: "ua", name: "Urinalysis + microscopy", cost: 1, time: 45, results: [
        { name: "Specific gravity", value: "1.030 (concentrated)" },
        { name: "Protein", value: "Trace" },
        { name: "Blood", value: "Negative" },
        { name: "Muddy brown casts", value: "ABSENT" },
        { name: "WBC/ RBC", value: "0-1 / 0-2 per hpf" },
      ], reveals: "Bland sediment with concentrated urine — against ATN or glomerulonephritis." },
      { id: "fena", name: "Fractional excretion of Na+ (FeNa)", cost: 2, time: 60, results: [
        { name: "FeNa", value: "0.4% (<1% = prerenal)", flag: "L" },
        { name: "Urine Na+", value: "12 mmol/L", flag: "L" },
        { name: "Urine osmolality", value: "540 mOsm/kg", flag: "H" },
      ], reveals: "FeNa <1% with maximal urine concentration — kidney is holding onto sodium. Prerenal." },
      { id: "us", name: "Renal ultrasound", cost: 3, time: 120, results: [
        { name: "Both kidneys", value: "10.4 cm, no hydronephrosis" },
        { name: "Cortical thickness", value: "Normal" },
      ], reveals: "No obstruction. (Not strictly needed if history is this clear — watch your budget.)" },
      { id: "cbc", name: "Full blood count", cost: 1, time: 30, results: [
        { name: "Hb", value: "13.2 g/dL" },
        { name: "WBC", value: "9.1" },
        { name: "Platelets", value: "245" },
      ], reveals: "Unremarkable." },
      { id: "ecg", name: "ECG", cost: 1, time: 15, results: [
        { name: "Rhythm", value: "Sinus tachycardia 108" },
        { name: "ST/T changes", value: "None — K+ 3.4, no U waves seen" },
      ], reveals: "Tachycardia consistent with volume depletion." },
      { id: "lactate", name: "Serum lactate", cost: 2, time: 30, results: [
        { name: "Lactate", value: "2.1 mmol/L" },
      ], reveals: "Not frankly shocked. (Was this necessary?)" },
    ],
    expertWorkup: ["bmp", "ua", "fena"],
    diagnosisOptions: ["Prerenal AKI (volume depletion)", "Acute tubular necrosis (ATN)", "Acute interstitial nephritis (AIN)", "Postrenal obstruction"],
    correctDiagnosis: "Prerenal AKI (volume depletion)",
    diagnosisExplanation: "Clear volume-loss history + orthostatic hypotension + BUN/Cr >20 + FeNa <1% + concentrated urine with bland sediment + no casts = prerenal AKI from GI losses compounded by a loop diuretic. ATN would show muddy brown casts, FeNa >2%, isotonic urine. Obstruction excluded clinically (no ANuria pattern) and sonographically if you looked.",
    stagingQuestion: {
      question: "AKI KDIGO stage (creatinine 2.9 from baseline 1.1, oliguric)?",
      options: ["Stage 1", "Stage 2", "Stage 3"],
      correct: "Stage 3",
    },
    managementPrompt: "Select the immediate management steps for this prerenal AKI:",
    managementOptions: [
      { id: "m1", step: "Stop frusemide", correct: true, rationale: "Ongoing diuresis worsens the volume depletion — the driver of his AKI." },
      { id: "m2", step: "IV fluid challenge (e.g. 500mL crystalloid, reassess)", correct: true, rationale: "Prerenal AKI responds to volume restoration. Reassess for overload after each bolus." },
      { id: "m3", step: "Dialyse urgently", correct: false, rationale: "No dialysis indications (no AEIOU: no refractory hyperkalaemia/acidosis, not anuric, no ureamic encephalopathy)." },
      { id: "m4", step: "Start NSAIDs for his leg pain", correct: false, rationale: "NSAIDs reduce afferent arteriolar flow — dangerous in any AKI." },
      { id: "m5", step: "Send urine for culture", correct: false, rationale: "No infective features; low yield here." },
      { id: "m6", step: "Recheck creatinine after fluid resuscitation", correct: true, rationale: "Prerenal AKI should improve within 24-48h of volume correction — failure to improve should trigger a rethink (ATN?)." },
    ],
    harmStates: [
      { id: "harm1", name: "Escalating AKI", triggerAtMinutes: 240, message: "Encik Ahmad becomes oliguric and confused. The window for simple volume correction is closing — you spent too long investigating before treating.", penalty: 15 },
    ],
    teachingPoints: [
      "BUN/Cr ratio >20, FeNa <1%, concentrated urine (high specific gravity/osmolality) = prerenal physiology.",
      "Prerenal AKI is a perfusion problem — find and fix the volume deficit. First-line: fluids, not more tests.",
      "Loop diuretics + GI losses is the classic outpatient prerenal AKI setup.",
      "Muddy brown casts = ATN; eosinophiluria/rash = AIN; hydronephrosis = postrenal.",
    ],
  },

  // ================================================================
  // CASE 2 — ATN (contrast + sepsis)
  // ================================================================
  {
    id: "aki-atn-002",
    title: "The Cath Lab Callback",
    topic: "AKI",
    difficulty: 2,
    presentation: "61F, creatinine 4.2 mg/dL (baseline 1.3), oliguric 2 days after PCI with contrast",
    vignette: "Madam Tan, 61, underwent PCI with drug-eluting stent 3 days ago for NSTEMI. Contrast load was significant. She was also briefly hypotensive during the procedure (SBP 80s for ~20 min). She's now oliguric. Creatinine has climbed from 1.3 to 4.2. She's on a proton pump inhibitor, metformin (held post-contrast), and was started on gentamicin yesterday for a wound infection.",
    initialLabs: [
      { name: "Na+", value: "136 mmol/L" },
      { name: "K+", value: "5.6 mmol/L", flag: "H" },
      { name: "Creatinine", value: "4.2 mg/dL", flag: "H" },
      { name: "BUN", value: "68 mg/dL", flag: "H" },
    ],
    historyOptions: [
      { id: "h1", question: "Review the procedure notes", answer: "120 mL iodinated contrast. Intra-procedure hypotension, treated with fluids. No branch aortic dissection seen.", time: 5, cost: 0, key: true },
      { id: "h2", question: "Ask about urine appearance", answer: "She noticed the urine has become dark 'like tea' since yesterday.", time: 2, cost: 0 },
      { id: "h3", question: "Review all medications started recently", answer: "Gentamicin started yesterday for wound infection; paracetamol; PPI. Metformin held since the procedure.", time: 4, cost: 0, key: true },
      { id: "h4", question: "Ask about rashes, fevers, joint pain", answer: "Low-grade fever 37.8°C attributed to the wound. No rash, no arthralgia.", time: 2, cost: 0 },
    ],
    testOptions: [
      { id: "ua", name: "Urinalysis + microscopy", cost: 1, time: 45, results: [
        { name: "Protein", value: "1+" },
        { name: "Blood", value: "Trace" },
        { name: "Muddy brown/granular casts", value: "PRESENT", flag: "crit" },
        { name: "Renal tubular epithelial cells", value: "Present" },
      ], reveals: "Muddy brown casts — the signature of acute tubular necrosis." },
      { id: "fena", name: "Fractional excretion of Na+ (FeNa)", cost: 2, time: 60, results: [
        { name: "FeNa", value: "2.8% (>2% = tubular injury)" , flag: "H"},
        { name: "Urine Na+", value: "48 mmol/L", flag: "H" },
        { name: "Urine osmolality", value: "290 mOsm/kg (isosthenuria)" },
      ], reveals: "FeNa >2%, urine sodium wasted, isosthenuria — tubules can't concentrate. ATN." },
      { id: "bmp", name: "Repeat BMP + acid-base", cost: 1, time: 30, results: [
        { name: "K+", value: "5.8 mmol/L", flag: "crit" },
        { name: "HCO3-", value: "15 mmol/L", flag: "L" },
        { name: "Anion gap", value: "18 (mildly elevated)", flag: "H" },
        { name: "Cr", value: "4.4 mg/dL", flag: "H" },
      ], reveals: "Worsening hyperkalaemia with metabolic acidosis — ureamic territory approaching." },
      { id: "ecg", name: "ECG (for the K+)", cost: 1, time: 15, results: [
        { name: "Rhythm", value: "Sinus, rate 96" },
        { name: "T waves", value: "Tall, peaked (hyperkalaemia changes)", flag: "crit" },
        { name: "QRS", value: "Narrow (still)" },
      ], reveals: "Peaked T waves — treat the K+ NOW." },
      { id: "us", name: "Renal ultrasound", cost: 3, time: 120, results: [
        { name: "Both kidneys", value: "Normal size, no hydronephrosis" },
      ], reveals: "Obstruction excluded — but the history already made this unlikely. Cost matters." },
      { id: "eos", name: "Urine eosinophils", cost: 2, time: 90, results: [
        { name: "Urine eosinophils", value: "Negative" },
      ], reveals: "Against AIN. (Also of limited sensitivity — most workups skip this now.)" },
      { id: "ana", name: "ANA / ANCA / complement panel", cost: 3, time: 240, results: [
        { name: "ANA", value: "Negative" },
        { name: "ANCA", value: "Negative" },
        { name: "C3/C4", value: "Normal" },
      ], reveals: "No evidence of glomerulonephritis. An expensive way to learn what the sediment already told you." },
    ],
    expertWorkup: ["ua", "fena", "bmp", "ecg"],
    diagnosisOptions: ["Prerenal AKI", "Acute tubular necrosis (contrast ± nephrotoxic ± hypoperfusion)", "Acute interstitial nephritis", "Acute glomerulonephritis"],
    correctDiagnosis: "Acute tubular necrosis (contrast ± nephrotoxic ± hypoperfusion)",
    diagnosisExplanation: "The triple hit: iodinated contrast + intra-procedure hypotension + gentamicin — all tubular toxins. Oliguria, dark urine, muddy brown casts, FeNa 2.8%, isosthenuria: textbook ATN. AIN needs drug exposure with rash/eosinophilia (absent here). GN would show active sediment (RBC casts, dysmorphic RBCs).",
    stagingQuestion: {
      question: "AKI KDIGO stage (Cr 1.3 → 4.2, oliguric)?",
      options: ["Stage 1", "Stage 2", "Stage 3"],
      correct: "Stage 3",
    },
    managementPrompt: "Select the correct management steps:",
    managementOptions: [
      { id: "m1", step: "Stop gentamicin (or switch to renally-dosed alternative)", correct: true, rationale: "Aminoglycoside is an ongoing tubular insult — remove the nephrotoxin." },
      { id: "m2", step: "Treat hyperkalaemia: IV calcium gluconate + insulin/dextrose ± salbutamol nebs", correct: true, rationale: "K+ 5.8 with ECG changes = emergency. Stabilise myocardium first, shift K+ intracellularly." },
      { id: "m3", step: "Aggressive IV fluid boluses to 'flush the kidneys'", correct: false, rationale: "In established oliguric ATN, fluids risk overload and pulmonary oedema. Fluids are for *prerenal* AKI." },
      { id: "m4", step: "Low-dose frusemide to 'convert' oliguric to non-oliguric AKI", correct: false, rationale: "Evidence shows furosemide does NOT improve renal recovery or mortality in ATN — only fluid balance management." },
      { id: "m5", step: "Monitor for dialysis indications (AEIOU) and involve nephrology", correct: true, rationale: "ATN is supportive: watch for refractory hyperkalaemia, acidosis, fluid overload, uraemia → dialyse when indicated." },
      { id: "m6", step: "N-acetylcysteine for contrast nephropathy", correct: false, rationale: "NAC has failed in trials for both prevention and treatment of contrast-associated AKI." },
    ],
    harmStates: [
      { id: "harm1", name: "Hyperkalaemic deterioration", triggerAtMinutes: 180, triggerIfUnordered: "ecg", message: "Madam Tan's K+ has climbed with widening QRS. You didn't check the ECG early — arrhythmia risk escalated and the ICU is now involved.", penalty: 20 },
      { id: "harm2", name: "Pulmonary oedema", triggerAtMinutes: 300, message: "The overnight team gave 3L of fluids for 'renal protection'. She's now in pulmonary oedema. Fluid strategy matters in ATN.", penalty: 15 },
    ],
    teachingPoints: [
      "Muddy brown casts + FeNa >2% + isosthenuria = ATN. The urine sediment is your cheapest and most decisive test.",
      "ATN is managed supportively: remove nephrotoxins, manage K+ and volume, dialyse only for indications (AEIOU).",
      "Diuretics don't heal ATN — they only help manage volume overload.",
      "Contrast + hypotension + aminoglycoside is a classic multi-hit ATN scenario.",
    ],
  },

  // ================================================================
  // CASE 3 — Hyperkalaemia emergency
  // ================================================================
  {
    id: "hyperkalemia-003",
    title: "Twelve Seconds of T Wave",
    topic: "Electrolytes",
    difficulty: 1,
    presentation: "54M on lisinopril + spironolactone for HFrEF, K+ 7.1 mmol/L, palpitations",
    vignette: "Mr. Rajan, 54, with HFrEF on lisinopril, spironolactone, and bisoprolol, presents with palpitations and muscle weakness for 2 days. He's also been taking potassium supplements 'for cramps'. ECG at triage shows peaked T waves. Repeat K+: 7.1 mmol/L — this is a code-level electrolyte emergency.",
    initialLabs: [
      { name: "K+", value: "7.1 mmol/L", flag: "crit" },
      { name: "Na+", value: "137 mmol/L" },
      { name: "Creatinine", value: "2.1 mg/dL", flag: "H" },
      { name: "Hb", value: "12.8 g/dL" },
    ],
    historyOptions: [
      { id: "h1", question: "Confirm the sample isn't haemolysed", answer: "The lab confirms: repeat sample, no haemolysis, K+ 7.1. This is real.", time: 10, cost: 0, key: true },
      { id: "h2", question: "Full medication and supplement review", answer: "Lisinopril, spironolactone, bisoprolol, OTC potassium chloride effervescent tablets daily for a week.", time: 4, cost: 0, key: true },
      { id: "h3", question: "Ask about urine output", answer: "Reduced over the past 2 days.", time: 2, cost: 0 },
      { id: "h4", question: "Ask about weakness pattern / paralysis", answer: "Proximal weakness, no frank paralysis, no family history of periodic paralysis.", time: 3, cost: 0 },
    ],
    testOptions: [
      { id: "ecg", name: "ECG", cost: 1, time: 10, results: [
        { name: "Rhythm", value: "Sinus bradycardia 52" },
        { name: "T waves", value: "Tall, peaked, tented", flag: "crit" },
        { name: "PR interval", value: "Prolonged (0.24s)" },
        { name: "QRS", value: "Wide, 0.13s", flag: "crit" },
      ], reveals: "Peaked T waves + wide QRS = immediately life-threatening hyperkalaemia. Cardiology stability first." },
      { id: "bmp", name: "BMP + creatinine", cost: 1, time: 30, results: [
        { name: "K+", value: "7.1 mmol/L", flag: "crit" },
        { name: "Cr", value: "2.1 mg/dL (baseline 1.4)", flag: "H" },
        { name: "HCO3-", value: "19 mmol/L", flag: "L" },
      ], reveals: "AKI on CKD — impaired K+ excretion is the driver." },
      { id: "gas", name: "Venous blood gas (rapid K+)", cost: 1, time: 10, results: [
        { name: "K+ (VBG)", value: "7.3 mmol/L", flag: "crit" },
        { name: "pH", value: "7.29", flag: "L" },
        { name: "HCO3-", value: "18 mmol/L" },
      ], reveals: "Confirms true hyperkalaemia with metabolic acidosis — within minutes, not hours." },
      { id: "ua", name: "Urinalysis", cost: 1, time: 45, results: [
        { name: "Protein", value: "Trace" },
        { name: "Blood", value: "Negative" },
        { name: "Casts", value: "None" },
      ], reveals: "Bland. The AKI here is likely haemodynamic/medication-related, not GN." },
      { id: "us", name: "Renal ultrasound", cost: 3, time: 120, results: [
        { name: "Kidneys", value: "CKD changes, no obstruction" },
      ], reveals: "Chronic changes only. Not the priority in an unstable electrolyte emergency." },
      { id: "aldo", name: "Aldosterone / renin levels", cost: 3, time: 480, results: [
        { name: "Aldosterone", value: "Suppressed (on spironolactone context, uninterpretable)" },
      ], reveals: "Endocrine workup is not the emergency here. You just spent 8 game-hours on the wrong question." },
    ],
    expertWorkup: ["ecg", "gas", "bmp"],
    diagnosisOptions: ["Pseudohyperkalaemia (haemolysed sample)", "True hyperkalaemia: RAAS blockade + K+ supplements + AKI on CKD", "Adrenal insufficiency (hypoaldosteronism)", "Familial periodic paralysis"],
    correctDiagnosis: "True hyperkalaemia: RAAS blockade + K+ supplements + AKI on CKD",
    diagnosisExplanation: "ACE-i + MRA + oral K+ supplements on a backdrop of worsening renal function is the perfect storm. VBG confirmed true K+, ECG shows conduction effects. Adrenal insufficiency needs hyperpigmentation, hypotension, hyponatraemia with hyperkalaemia out of proportion — not this pattern. The key clinical habit: in K+ ≥6.5 with ECG changes, you treat while you investigate.",
    stagingQuestion: {
      question: "First pharmacologic step for K+ 7.1 with wide QRS?",
      options: ["IV calcium gluconate", "Insulin + dextrose", "Nebulised salbutamol", "Sodium bicarbonate"],
      correct: "IV calcium gluconate",
    },
    managementPrompt: "Select the correct management steps (multiple):",
    managementOptions: [
      { id: "m1", step: "IV calcium gluconate (myocardial stabilisation)", correct: true, rationale: "First move with ECG changes — stabilises the myocardium within minutes. Does NOT lower K+." },
      { id: "m2", step: "Insulin 10U + 25g dextrose IV", correct: true, rationale: "Shifts K+ intracellularly within 15-30 min. Expect ~0.5-1.0 mmol/L drop." },
      { id: "m3", step: "Nebulised salbutamol 10-20mg", correct: true, rationale: "Additive K+-shifting; works in ~30 min. Safe adjunct." },
      { id: "m4", step: "Stop lisinopril, spironolactone, and K+ supplements", correct: true, rationale: "Remove the drivers — RAAS blockade and exogenous K+ must go." },
      { id: "m5", step: "Oral sodium polystyrene sulfonate (kayexalate) as definitive treatment", correct: false, rationale: "Resins are slow (hours), unreliable, and carry colonic necrosis risk — never the emergency treatment." },
      { id: "m6", step: "Arrange haemodialysis if refractory / ongoing K+ rise", correct: true, rationale: "AKI + refractory hyperkalaemia = definitive K+ removal is dialysis. Know when to call for it." },
    ],
    harmStates: [
      { id: "harm1", name: "Arrhythmia", triggerAtMinutes: 90, message: "While waiting for ward results, Mr. Rajan develops a broad-complex bradycardia and required CPR. ECG + treatment first — investigations later.", penalty: 30 },
    ],
    teachingPoints: [
      "K+ ≥6.5 + ECG changes: treat FIRST (calcium stabilises, insulin/dextrose + salbutamol shift), investigate after.",
      "Calcium gluconate doesn't lower K+ — it stabilises the myocardium. You still need shifting + removal.",
      "The commonest real-world cause: RAAS inhibitors + K+ supplements + declining renal function.",
      "Definitive removal = dialysis (or stopping the source). Resins are not emergency therapy.",
    ],
  },

  // ================================================================
  // CASE 4 — Nephrotic syndrome (MCD vs membranous flavour)
  // ================================================================
  {
    id: "nephrotic-004",
    title: "The Puffy Morning Face",
    topic: "Glomerular",
    difficulty: 2,
    presentation: "24F, periorbital + dependent oedema for 3 weeks, urine 'frothy', albumin 1.8 g/dL",
    vignette: "Miss Aina, 24, presents with 3 weeks of swelling — worse in the face each morning, ankles by evening. Urine has been noticeably frothy. She's gained 4 kg. No rash, no joint pains, no fever. She takes no medications. BP 128/78. Dipstick at GP surgery: protein 4+, blood trace.",
    initialLabs: [
      { name: "Albumin", value: "1.8 g/dL", flag: "L" },
      { name: "Total cholesterol", value: "9.2 mmol/L", flag: "H" },
      { name: "Creatinine", value: "0.7 mg/dL" },
      { name: "Urine protein dipstick", value: "4+" },
    ],
    historyOptions: [
      { id: "h1", question: "Ask about preceding infections (especially sore throat, skin infection)", answer: "A mild URTI 4 weeks ago, resolved on its own. No documented strep pharyngitis, no impetigo.", time: 3, cost: 0, key: true },
      { id: "h2", question: "Ask about drugs (NSAIDs, lithium, gold, heroin, Chinese traditional meds)", answer: "Nil. No supplements. Occasional paracetamol.", time: 3, cost: 0, key: true },
      { id: "h3", question: "Ask about systemic symptoms: joints, rashes, hair loss, photosensitivity", answer: "None. Feels well apart from the swelling and tiredness.", time: 3, cost: 0, key: true },
      { id: "h4", question: "Screen for diabetes / check glucose history", answer: "No known diabetes. Fasting glucose from GP: 4.9 mmol/L.", time: 2, cost: 0 },
    ],
    testOptions: [
      { id: "pcr", name: "Urine protein:creatinine ratio", cost: 1, time: 60, results: [
        { name: "uPCR", value: "9.5 g/g (nephrotic range ≥3.5)", flag: "H" },
      ], reveals: "Confirms nephrotic-range proteinuria. You can't manage what you can't quantify." },
      { id: "ua", name: "Urinalysis + microscopy", cost: 1, time: 45, results: [
        { name: "Protein", value: "4+" },
        { name: "Blood", value: "Trace" },
        { name: "RBC casts", value: "None" },
        { name: "Dysmorphic RBCs", value: "None" },
        { name: "Lipid (oval fat bodies)", value: "Present" },
      ], reveals: "Bland sediment — a 'pure' nephrotic picture (no nephritic features)." },
      { id: "serology", name: "Hepatitis B/C, HIV serology, ANA, complement (C3/C4)", cost: 2, time: 240, results: [
        { name: "HBsAg", value: "Negative" },
        { name: "Anti-HCV", value: "Negative" },
        { name: "HIV", value: "Negative" },
        { name: "ANA", value: "Negative" },
        { name: "C3 / C4", value: "Normal" },
      ], reveals: "Secondary causes excluded — essential before labelling any glomerular disease primary." },
      { id: "biopsy", name: "Renal biopsy", cost: 3, time: 480, results: [
        { name: "Light microscopy", value: "Glomeruli appear normal" },
        { name: "Immunofluorescence", value: "No immune deposits" },
        { name: "Electron microscopy", value: "Diffuse podocyte foot process effacement", flag: "crit" },
      ], reveals: "Minimal change disease. (In a low-risk young patient, many nephrologists trial steroids first and biopsy only non-responders — the game accepts both, but see expert comparison.)" },
      { id: "asot", name: "ASO titre / anti-DNase B", cost: 1, time: 240, results: [
        { name: "ASO", value: "Not elevated" },
      ], reveals: "No evidence of recent streptococcal infection — against post-infectious GN (which is nephritic anyway)." },
      { id: "spep", name: "Serum protein electrophoresis + free light chains", cost: 2, time: 240, results: [
        { name: "SPEP", value: "No monoclonal band" },
        { name: "Free light chains", value: "Normal ratio" },
      ], reveals: "Myeloma-related disease excluded (she's 24 — pretest probability was already very low)." },
    ],
    expertWorkup: ["pcr", "ua", "serology"],
    diagnosisOptions: ["Nephrotic syndrome, minimal change disease", "Nephritic syndrome (post-infectious GN)", "Membranous nephropathy with anti-PLA2R", "Diabetic nephropathy"],
    correctDiagnosis: "Nephrotic syndrome, minimal change disease",
    diagnosisExplanation: "Young patient + pure nephrotic syndrome (massive proteinuria, hypoalbuminaemia, oedema, hyperlipidaemia) + bland sediment + negative secondary screen + foot process effacement on EM = minimal change disease. Membranous is more common in older patients (and would show subepithelial deposits); post-infectious GN is nephritic (RBC casts, low C3); diabetic nephropathy needs diabetes.",
    stagingQuestion: {
      question: "Which combination defines nephrotic syndrome?",
      options: ["Proteinuria ≥3.5 g/day + hypoalbuminaemia + oedema ± hyperlipidaemia", "Hematuria + RBC casts + hypertension + AKI", "Proteinuria + hematuria equally", "Isolated low albumin"],
      correct: "Proteinuria ≥3.5 g/day + hypoalbuminaemia + oedema ± hyperlipidaemia",
    },
    managementPrompt: "Select the correct management steps:",
    managementOptions: [
      { id: "m1", step: "Start prednisolone 1 mg/kg/day", correct: true, rationale: "MCD is steroid-responsive in >80% of adults — first-line unless contraindicated." },
      { id: "m2", step: "Salt restriction + loop diuretic for oedema", correct: true, rationale: "Oedema in nephrotic syndrome is sodium-retention driven — restrict salt, use loop diuretics carefully (she's intravascularly 'twitchy')." },
      { id: "m3", step: "Start ACE inhibitor for proteinuria", correct: true, rationale: "Reduces proteinuria and is renoprotective — monitor K+ and creatinine closely." },
      { id: "m4", step: "IV albumin as first-line for her oedema", correct: false, rationale: "IV albumin is reserved for refractory oedema with intravascular depletion, not first-line." },
      { id: "m5", step: "Statin for hyperlipidaemia", correct: true, rationale: "Nephrotic hyperlipidaemia is atherosclerotic risk — treat it, and it improves with remission anyway." },
      { id: "m6", step: "Prophylactic antibiotics (she's 'immunocompromised from protein loss')", correct: false, rationale: "No fever, no infection — prophylaxis isn't indicated. Vaccinate (e.g. pneumococcal, influenza) yes; antibiotics no." },
    ],
    harmStates: [
      { id: "harm1", name: "Missed secondary cause", triggerIfUnordered: "serology", message: "Six months later her 'MCD' isn't responding to steroids. The HBV screen you skipped comes back positive — this was HBV-associated membranous disease all along. Always screen before labelling primary.", penalty: 20 },
    ],
    teachingPoints: [
      "Nephrotic syndrome = proteinuria ≥3.5 g/day + hypoalbuminaemia + oedema ± hyperlipidaemia. Nephritic = hematuria, casts, hypertension, AKI.",
      "Young adult + pure nephrotic picture + clean secondary screen = MCD until proven otherwise; steroids are first-line.",
      "Always exclude hepatitis B/C, HIV, SLE, and diabetes before calling any glomerular disease 'primary'.",
      "Manage the oedema with salt restriction + loop diuretics; reserve IV albumin for refractory cases.",
    ],
  },

  // ================================================================
  // CASE 5 — CKD progression
  // ================================================================
  {
    id: "ckd-005",
    title: "The Twenty-Year Diabetic",
    topic: "CKD",
    difficulty: 2,
    presentation: "58M, T2DM 20 years, eGFR 28 mL/min/1.73m², ACR 850 mg/g — referred to renal clinic",
    vignette: "Encik Ismail, 58, has had type 2 diabetes for 20 years and hypertension for 15. His GP referred him: latest labs show eGFR 28, ACR 850 mg/g (macroalbuminuria), HbA1c 8.2%, BP 152/88 on amlodipine alone. He has mild ankle oedema and tingling feet. He's heard 'kidney failure' from a friend and is frightened of dialysis.",
    initialLabs: [
      { name: "eGFR", value: "28 mL/min/1.73m²", flag: "L" },
      { name: "Creatinine", value: "2.4 mg/dL", flag: "H" },
      { name: "ACR", value: "850 mg/g", flag: "H" },
      { name: "HbA1c", value: "8.2%", flag: "H" },
    ],
    historyOptions: [
      { id: "h1", question: "Ask about urinary symptoms (nocturia, frothy urine)", answer: "Frothy urine for a year. No dysuria. Nocturia twice nightly.", time: 3, cost: 0, key: true },
      { id: "h2", question: "Ask about medications: NSAIDs, traditional supplements, contrast exposure", answer: "Regular ibuprofen for knee pain for months. A Chinese herbal supplement 'for energy'. No recent contrast.", time: 4, cost: 0, key: true },
      { id: "h3", question: "Screen for uraemic symptoms: nausea, itch, appetite, sleep", answer: "Occasional nausea in the mornings, mild itching, sleeping poorly. No confusion.", time: 3, cost: 0, key: true },
      { id: "h4", question: "Family history of kidney disease", answer: "Mother had 'kidney failure' late in life — also diabetic. No known polycystic disease.", time: 2, cost: 0 },
    ],
    testOptions: [
      { id: "bmp", name: "BMP: electrolytes, K+, HCO3-", cost: 1, time: 30, results: [
        { name: "K+", value: "5.2 mmol/L", flag: "H" },
        { name: "HCO3-", value: "20 mmol/L", flag: "L" },
        { name: "Phosphate", value: "1.9 mmol/L", flag: "H" },
        { name: "Calcium (corrected)", value: "1.98 mmol/L", flag: "L" },
      ], reveals: "Early mineral-bone disease pattern: high phosphate, low calcium, mild acidosis, borderline K+." },
      { id: "hb", name: "Full blood count (anaemia of CKD)", cost: 1, time: 30, results: [
        { name: "Hb", value: "9.4 g/dL", flag: "L" },
        { name: "MCV", value: "88 fL (normocytic)" },
      ], reveals: "Normocytic anaemia — classic CKD complication. Check iron studies before ESA." },
      { id: "iron", name: "Iron studies (TSAT + ferritin)", cost: 1, time: 60, results: [
        { name: "TSAT", value: "18% (low-normal)", flag: "L" },
        { name: "Ferritin", value: "120 ng/mL" },
      ], reveals: "Iron stores are marginal — replete iron before or alongside ESA therapy." },
      { id: "pth", name: "PTH + vitamin D", cost: 2, time: 240, results: [
        { name: "PTH", value: "38 pmol/L (elevated, ~4x ULN)", flag: "H" },
        { name: "25-OH vitamin D", value: "insufficient" },
      ], reveals: "Secondary hyperparathyroidism from CKD-MBD. Phosphate binder + vitamin D territory." },
      { id: "us", name: "Renal ultrasound", cost: 3, time: 120, results: [
        { name: "Kidney size", value: "9.1 / 9.3 cm — mildly small" },
        { name: "Cortical echogenicity", value: "Increased, consistent with chronic changes" },
        { name: "Hydronephrosis", value: "None" },
      ], reveals: "Chronic-appearing kidneys, symmetric. Supports CKD rather than an acute process." },
      { id: "ua", name: "Urinalysis + sediment", cost: 1, time: 45, results: [
        { name: "Protein", value: "4+" },
        { name: "Blood", value: "1+" },
        { name: "Casts", value: "No RBC casts" },
      ], reveals: "Heavy proteinuria without an active nephritic sediment — consistent with diabetic nephropathy." },
      { id: "mra", name: "Renal artery imaging (duplex/MRA)", cost: 3, time: 480, results: [
        { name: "Renal arteries", value: "No significant stenosis" },
      ], reveals: "Normal. At this pretest probability, renal artery stenosis workup is rarely first-line — an expensive detour." },
    ],
    expertWorkup: ["bmp", "hb", "iron", "pth", "ua"],
    diagnosisOptions: ["CKD G4 A3, diabetic kidney disease with CKD-MBD and anaemia", "Acute-on-chronic kidney injury from NSAIDs", "Hypertensive nephrosclerosis alone", "Renal artery stenosis"],
    correctDiagnosis: "CKD G4 A3, diabetic kidney disease with CKD-MBD and anaemia",
    diagnosisExplanation: "20 years of diabetes + 15 of hypertension + macroalbuminuria (ACR 850) + bland sediment + symmetric chronic-appearing kidneys = diabetic kidney disease, CKD stage G4 (eGFR 28) with severely increased albuminuria (A3). Complications already present: anaemia (Hb 9.4, iron marginal), CKD-MBD (high PTH/phosphate), metabolic acidosis. The NSAIDs and supplements are accelerating injury — stop them. The chronic history and symmetric kidneys make acute-on-chronic AKI less dominant, though stopping nephrotoxins is correct regardless.",
    stagingQuestion: {
      question: "CKD stage for eGFR 28, ACR 850 mg/g (KDIGO)?",
      options: ["G3b A3", "G4 A3", "G5 A2", "G4 A2"],
      correct: "G4 A3",
    },
    managementPrompt: "Select the correct management steps:",
    managementOptions: [
      { id: "m1", step: "Stop ibuprofen and the herbal supplement", correct: true, rationale: "NSAIDs (and unknown nephrotoxic herbs) accelerate CKD — remove them immediately." },
      { id: "m2", step: "Start/optimise ACE inhibitor (or ARB) for BP 152/88 and proteinuria", correct: true, rationale: "RAAS blockade is the single most proven kidney-protective intervention in diabetic CKD with albuminuria. Monitor K+ and creatinine after starting." },
      { id: "m3", step: "Add an SGLT2 inhibitor (e.g. dapagliflozin)", correct: true, rationale: "SGLT2i slow CKD progression in diabetic kidney disease independent of glucose lowering — current guideline pillar alongside RAAS blockade." },
      { id: "m4", step: "Start iron repletion, then ESA if Hb remains <10", correct: true, rationale: "Iron first (TSAT is marginal), then ESA targeting Hb 10-11.5 — don't overcorrect." },
      { id: "m5", step: "Phosphate restriction + phosphate binder; cholecalciferol for vitamin D", correct: true, rationale: "Treat CKD-MBD: lower phosphate, replace vitamin D, monitor PTH." },
      { id: "m6", step: "Refer for urgent dialysis initiation", correct: false, rationale: "eGFR 28 is G4 — prep for renal replacement (access planning, education) but dialysis isn't urgent. Start dialysis education now; dialyse when indicated." },
    ],
    harmStates: [
      { id: "harm1", name: "Progression acceleration", triggerAtMinutes: 480, message: "At review 3 months later, eGFR has fallen to 19. The NSAIDs were never stopped and BP remains 150+. CKD management is about the long game — but you have to start it now.", penalty: 15 },
    ],
    teachingPoints: [
      "Diabetic kidney disease = long diabetes + macroalbuminuria + bland sediment + symmetric chronic kidneys. Complications cluster: anaemia, MBD, acidosis.",
      "The four pillars of diabetic CKD management: RAAS blockade + SGLT2i + BP/glycaemic control + toxin avoidance (NSAIDs!)",
      "Anaemia of CKD: check and replete iron FIRST, then ESA targeting Hb 10-11.5 g/dL.",
      "G4 (eGFR 15-29) is the dialysis-preparation zone: access planning, modality education, transplant referral — before G5 arrives.",
    ],
  },
];
