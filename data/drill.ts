// Lab Interpretation Drill — question bank.
// Each item: lab panel + correct pattern. Distractors are generated per topic.

export interface DrillItem {
  id: string;
  topic: string;
  stem: string;
  labs: { name: string; value: string; flag?: "H" | "L" }[];
  options: string[];
  correct: string;
  explanation: string;
}

export const DRILL_ITEMS: DrillItem[] = [
  {
    id: "d1",
    topic: "AKI",
    stem: "72M, AKI. Interpret the workup:",
    labs: [
      { name: "Cr (baseline→now)", value: "1.0 → 2.6 mg/dL" },
      { name: "BUN/Cr ratio", value: "24", flag: "H" },
      { name: "FeNa", value: "0.4%", flag: "L" },
      { name: "Urine osmolality", value: "560 mOsm/kg", flag: "H" },
      { name: "Urine sediment", value: "Bland" },
    ],
    options: ["Prerenal AKI", "Acute tubular necrosis", "Acute interstitial nephritis", "Postrenal obstruction"],
    correct: "Prerenal AKI",
    explanation: "BUN/Cr >20 + FeNa <1% + maximally concentrated urine + bland sediment = prerenal.",
  },
  {
    id: "d2",
    topic: "AKI",
    stem: "58F, septic shock, oliguric. Interpret:",
    labs: [
      { name: "Cr", value: "3.4 mg/dL", flag: "H" },
      { name: "FeNa", value: "3.1%", flag: "H" },
      { name: "Urine osmolality", value: "285 mOsm/kg" },
      { name: "Urine sediment", value: "Muddy brown casts" },
    ],
    options: ["Prerenal AKI", "Acute tubular necrosis", "Acute interstitial nephritis", "Contrast nephropathy (pre-renal pattern)"],
    correct: "Acute tubular necrosis",
    explanation: "FeNa >2%, isosthenuria (~290 = same as plasma), muddy brown casts = ATN.",
  },
  {
    id: "d3",
    topic: "AKI",
    stem: "45M on PPI + recent NSAIDs, rash and fever. Interpret:",
    labs: [
      { name: "Cr", value: "2.1 mg/dL", flag: "H" },
      { name: "Urine WBC", value: "10-20/hpf", flag: "H" },
      { name: "Urine eosinophils", value: "Present", flag: "H" },
      { name: "Urine sediment", value: "WBC casts" },
    ],
    options: ["Acute pyelonephritis", "Acute interstitial nephritis", "Acute tubular necrosis", "Minimal change disease"],
    correct: "Acute interstitial nephritis",
    explanation: "Drug exposure + rash/fever + WBC casts + eosinophiluria = AIN. Pyelo needs positive culture + flank pain.",
  },
  {
    id: "d4",
    topic: "Acid-base",
    stem: "24M diabetic, vomiting and polyuria. Interpret:",
    labs: [
      { name: "pH", value: "7.18", flag: "L" },
      { name: "HCO3-", value: "8 mmol/L", flag: "L" },
      { name: "Anion gap", value: "26", flag: "H" },
      { name: "Glucose", value: "540 mg/dL", flag: "H" },
      { name: "Ketones", value: "4+" },
    ],
    options: ["High anion gap metabolic acidosis (DKA)", "Normal anion gap metabolic acidosis", "Respiratory alkalosis with compensation", "Metabolic alkalosis"],
    correct: "High anion gap metabolic acidosis (DKA)",
    explanation: "Low pH, very low HCO3, high AG + hyperglycaemia + ketones = DKA.",
  },
  {
    id: "d5",
    topic: "Acid-base",
    stem: "68F on long-term diuretics, vomiting 3 days. Interpret:",
    labs: [
      { name: "pH", value: "7.52", flag: "H" },
      { name: "HCO3-", value: "36 mmol/L", flag: "H" },
      { name: "K+", value: "2.9 mmol/L", flag: "L" },
      { name: "Cl-", value: "88 mmol/L", flag: "L" },
    ],
    options: ["Metabolic alkalosis (volume contraction + diuretic)", "Respiratory acidosis", "High anion gap acidosis", "Normal anion gap acidosis"],
    correct: "Metabolic alkalosis (volume contraction + diuretic)",
    explanation: "High pH + high HCO3 + low K + low Cl = chloride-responsive metabolic alkalosis.",
  },
  {
    id: "d6",
    topic: "Electrolytes",
    stem: "80M on thiazide, confusion. Interpret:",
    labs: [
      { name: "Na+", value: "116 mmol/L", flag: "L" },
      { name: "Serum osmolality", value: "242 mOsm/kg", flag: "L" },
      { name: "Urine osmolality", value: "520 mOsm/kg", flag: "H" },
      { name: "Urine Na+", value: "60 mmol/L", flag: "H" },
      { name: "TSH / cortisol", value: "Normal" },
    ],
    options: ["SIADH", "Hypovolaemic hyponatraemia", "Pseudohyponatraemia", "Cerebral salt wasting"],
    correct: "SIADH",
    explanation: "Hypotonic hyponatraemia + inappropriately concentrated urine + high urine Na + euvolaemic + normal hormones = SIADH.",
  },
  {
    id: "d7",
    topic: "Electrolytes",
    stem: "64F CKD5, missed dialysis. Interpret:",
    labs: [
      { name: "K+", value: "6.9 mmol/L", flag: "H" },
      { name: "ECG", value: "Peaked T waves, wide QRS" },
      { name: "Cr", value: "7.8 mg/dL", flag: "H" },
    ],
    options: ["Hyperkalaemia — emergency: calcium first, then shift + dialyse", "Hyperkalaemia — oral resin first", "Pseudohyperkalaemia — repeat only", "Hypokalaemia"],
    correct: "Hyperkalaemia — emergency: calcium first, then shift + dialyse",
    explanation: "K+ ≥6.5 with ECG changes: IV calcium to stabilise the myocardium, insulin/dextrose + salbutamol to shift, then dialysis for definitive removal.",
  },
  {
    id: "d8",
    topic: "Glomerular",
    stem: "19M, 2 weeks post sore throat. Interpret:",
    labs: [
      { name: "Urinalysis", value: "Blood 3+, Protein 2+" },
      { name: "Sediment", value: "RBC casts, dysmorphic RBCs", flag: "H" },
      { name: "C3", value: "Low", flag: "L" },
      { name: "ASO titre", value: "Elevated", flag: "H" },
      { name: "Cr", value: "1.6 mg/dL", flag: "H" },
    ],
    options: ["Post-infectious (post-strep) glomerulonephritis", "Minimal change disease", "Membranous nephropathy", "IgA nephropathy (synpharyngitic)"],
    correct: "Post-infectious (post-strep) glomerulonephritis",
    explanation: "Nephritic sediment + low C3 + high ASO + 1-3 week lag after infection = post-infectious GN. IgA nephropathy is synpharyngitic (during the infection) with normal C3.",
  },
  {
    id: "d9",
    topic: "Glomerular",
    stem: "28F, facial rash, joint pain. Interpret:",
    labs: [
      { name: "Urinalysis", value: "Protein 3+, Blood 3+" },
      { name: "C3 / C4", value: "Both low", flag: "L" },
      { name: "ANA", value: "1:640, positive", flag: "H" },
      { name: "Anti-dsDNA", value: "Positive", flag: "H" },
    ],
    options: ["Lupus nephritis", "Post-infectious GN", "ANCA vasculitis", "Thin basement membrane disease"],
    correct: "Lupus nephritis",
    explanation: "Nephritic-nephrotic picture + low C3 AND C4 (classic/alternative pathway activation) + positive ANA/dsDNA = lupus nephritis.",
  },
  {
    id: "d10",
    topic: "CKD",
    stem: "62M, eGFR 22, fatigue. Interpret:",
    labs: [
      { name: "Hb", value: "8.9 g/dL", flag: "L" },
      { name: "MCV", value: "86 fL" },
      { name: "Ferritin", value: "95 ng/mL" },
      { name: "TSAT", value: "15%", flag: "L" },
      { name: "Stool occult blood", value: "Negative" },
    ],
    options: ["Anaemia of CKD with iron deficiency", "Anaemia of CKD alone (pure EPO deficiency)", "Anaemia of chronic disease", "Haemolytic anaemia"],
    correct: "Anaemia of CKD with iron deficiency",
    explanation: "Normocytic anaemia in CKD with TSAT <20% — iron deficiency coexists and must be repleted before/with ESA.",
  },
  {
    id: "d11",
    topic: "CKD",
    stem: "55F CKD G4, bone pain. Interpret:",
    labs: [
      { name: "Ca (corrected)", value: "1.92 mmol/L", flag: "L" },
      { name: "Phosphate", value: "2.1 mmol/L", flag: "H" },
      { name: "PTH", value: "5x ULN", flag: "H" },
      { name: "Vitamin D", value: "Insufficient", flag: "L" },
    ],
    options: ["Secondary hyperparathyroidism (CKD-MBD)", "Primary hyperparathyroidism", "Multiple myeloma", "Osteomalacia alone"],
    correct: "Secondary hyperparathyroidism (CKD-MBD)",
    explanation: "CKD + low Ca + high PO4 + high PTH = secondary hyperparathyroidism. Primary would show high Ca.",
  },
  {
    id: "d12",
    topic: "Dialysis",
    stem: "48M on HD, hypotension and cramps mid-session. Most likely cause?",
    labs: [
      { name: "Pre-dialysis weight", value: "Target +3.2 kg" },
      { name: "BP mid-session", value: "82/50", flag: "L" },
    ],
    options: ["Excessive ultrafiltration rate", "Dialyser reaction", "Hyperkalaemia", "Air embolism"],
    correct: "Excessive ultrafiltration",
    explanation: "Large interdialytic weight gain → high UF rate → intravascular depletion → hypotension + cramps. Fix: longer/slower dialysis, sodium modelling, fluid restriction.",
  },
];
