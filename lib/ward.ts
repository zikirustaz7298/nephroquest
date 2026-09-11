// 2D ward world: map, entities, movement, collision, interaction zones.

export interface Vec {
  x: number;
  y: number;
}

export const WORLD = { w: 960, h: 640 };

export interface Zone {
  id: "bed" | "lab" | "phone" | "chart" | "exit";
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  icon: string;
}

export const ZONES: Zone[] = [
  { id: "bed", x: 60, y: 60, w: 220, h: 190, label: "Patient", icon: "🛏" },
  { id: "lab", x: 700, y: 60, w: 220, h: 150, label: "Lab bench", icon: "🧪" },
  { id: "chart", x: 700, y: 430, w: 220, h: 150, label: "Chart trolley", icon: "📋" },
  { id: "phone", x: 60, y: 470, w: 110, h: 110, label: "Phone", icon: "☎️" },
  { id: "exit", x: 420, y: 560, w: 120, h: 70, label: "Exit door", icon: "🚪" },
];

// walls: rectangles the doctor can't walk through (besides zones)
export const WALLS: { x: number; y: number; w: number; h: number }[] = [
  // border
  { x: 0, y: 0, w: WORLD.w, h: 16 },
  { x: 0, y: WORLD.h - 16, w: WORLD.w, h: 16 },
  { x: 0, y: 0, w: 16, h: WORLD.h },
  { x: WORLD.w - 16, y: 0, w: 16, h: WORLD.h },
  // ward desk island
  { x: 400, y: 240, w: 160, h: 60 },
];

export const PLAYER_START: Vec = { x: 480, y: 460 };
export const PLAYER_SPEED = 3.4; // px per frame at 60fps
export const PLAYER_SIZE = 26;

export function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function zoneAt(p: Vec): Zone | null {
  const box = { x: p.x - PLAYER_SIZE / 2, y: p.y - PLAYER_SIZE / 2, w: PLAYER_SIZE, h: PLAYER_SIZE };
  for (const z of ZONES) {
    if (rectsOverlap(box, z)) return z;
  }
  return null;
}

export function canMove(p: Vec, dx: number, dy: number): Vec {
  const nx = p.x + dx;
  const ny = p.y + dy;
  const box = { x: nx - PLAYER_SIZE / 2, y: ny - PLAYER_SIZE / 2, w: PLAYER_SIZE, h: PLAYER_SIZE };
  // walls block
  for (const w of WALLS) {
    if (rectsOverlap(box, w)) return p;
  }
  // furniture zones block movement INTO them (interaction happens at the edge)
  for (const z of ZONES) {
    if (z.id === "exit") continue; // door is walk-through
    if (rectsOverlap(box, z)) return p;
  }
  // clamp to world
  const cx = Math.max(20, Math.min(WORLD.w - 20, nx));
  const cy = Math.max(20, Math.min(WORLD.h - 20, ny));
  return { x: cx, y: cy };
}

// --------------------------------------------------------------- rendering

export interface DoctorAnim {
  frame: number;     // walk cycle frame 0..3
  facing: "down" | "up" | "left" | "right";
  moving: boolean;
}

// Pixel-art doctor drawn procedurally on canvas
export function drawDoctor(
  ctx: CanvasRenderingContext2D,
  p: Vec,
  anim: DoctorAnim,
  t: number,
) {
  const { x, y } = p;
  const bob = anim.moving ? Math.sin(t / 90) * 2 : Math.sin(t / 500) * 1;
  const legSwing = anim.moving ? Math.sin(anim.frame * Math.PI) * 4 : 0;

  ctx.save();
  ctx.translate(x, y + bob);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 14 - bob, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(-7, 6, 5, 10 + legSwing);
  ctx.fillRect(2, 6, 5, 10 - legSwing);
  // shoes
  ctx.fillStyle = "#111";
  ctx.fillRect(-8, 14 + legSwing, 6, 3);
  ctx.fillRect(2, 14 - legSwing, 6, 3);

  // body (white coat)
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(-9, -10, 18, 18);
  // coat opening
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(-1, -10, 3, 18);
  // stethoscope
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -2, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.arc(0, 4, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = "#f5c396";
  ctx.beginPath();
  ctx.arc(0, -16, 7, 0, Math.PI * 2);
  ctx.fill();
  // hair
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(0, -18, 7, Math.PI, Math.PI * 2);
  ctx.fill();
  // eyes (based on facing)
  ctx.fillStyle = "#0f172a";
  if (anim.facing === "down") {
    ctx.fillRect(-3.5, -17, 2, 2);
    ctx.fillRect(1.5, -17, 2, 2);
  } else if (anim.facing === "left") {
    ctx.fillRect(-5, -17, 2, 2);
  } else if (anim.facing === "right") {
    ctx.fillRect(3, -17, 2, 2);
  }
  // ID badge
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(3, -8, 5, 7);

  ctx.restore();
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  t: number,
  patientState: { severity: number }, // 0 stable .. 1 critical
) {
  const { w, h } = WORLD;

  // floor - hospital tiles
  ctx.fillStyle = "#e8edf2";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(100,116,139,0.25)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= w; gx += 48) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy <= h; gy += 48) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // walls
  ctx.fillStyle = "#cbd5e1";
  for (const wl of WALLS) ctx.fillRect(wl.x, wl.y, wl.w, wl.h);

  // --- bed zone ---
  const bed = ZONES[0];
  ctx.fillStyle = "#dbeafe";
  ctx.fillRect(bed.x, bed.y, bed.w, bed.h);
  ctx.strokeStyle = "#93c5fd";
  ctx.strokeRect(bed.x, bed.y, bed.w, bed.h);
  // bed
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(bed.x + 24, bed.y + 60, 150, 60);
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(bed.x + 24, bed.y + 112, 150, 8);
  // patient in bed (head + body, breathing)
  const breathe = Math.sin(t / 700) * 1.5;
  ctx.fillStyle = "#f5c396"; // head
  ctx.beginPath();
  ctx.arc(bed.x + 45, bed.y + 75 + breathe * 0.3, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#64748b"; // blanket body
  ctx.fillRect(bed.x + 60, bed.y + 65 + breathe, 90, 45);
  ctx.fillStyle = "#475569";
  ctx.fillRect(bed.x + 60, bed.y + 62 + breathe, 90, 8);

  // vitals monitor above bed
  const mx = bed.x + bed.w - 92;
  const my = bed.y + 8;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(mx, my, 84, 52);
  // heartbeat line
  ctx.strokeStyle =
    patientState.severity > 0.66 ? "#f87171" : patientState.severity > 0.33 ? "#fbbf24" : "#4ade80";
  ctx.lineWidth = 2;
  ctx.beginPath();
  const beatT = (t / 600) % 1;
  for (let i = 0; i <= 12; i++) {
    const px = mx + 6 + i * 6;
    const phase = (i / 12 + beatT) % 1;
    let py = my + 26;
    if (phase > 0.1 && phase < 0.18) py = my + 12;
    else if (phase >= 0.18 && phase < 0.26) py = my + 40;
    else if (phase >= 0.26 && phase < 0.34) py = my + 18;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  // HR number
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "10px monospace";
  const hr = Math.round(72 + patientState.severity * 55);
  ctx.fillText(`${hr}`, mx + 6, my + 48);
  ctx.fillText("bpm", mx + 30, my + 48);

  // --- lab bench ---
  const lab = ZONES[1];
  ctx.fillStyle = "#dcfce7";
  ctx.fillRect(lab.x, lab.y, lab.w, lab.h);
  ctx.strokeStyle = "#86efac";
  ctx.strokeRect(lab.x, lab.y, lab.w, lab.h);
  ctx.fillStyle = "#a7f3d0";
  ctx.fillRect(lab.x + 16, lab.y + 60, lab.w - 32, 26);
  // test tubes
  const tubeCols = ["#f87171", "#fbbf24", "#38bdf8", "#4ade80", "#c084fc"];
  tubeCols.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(lab.x + 28 + i * 26, lab.y + 40, 9, 20);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(lab.x + 28 + i * 26, lab.y + 36, 9, 4);
  });
  ctx.fillStyle = "#166534";
  ctx.font = "11px sans-serif";
  ctx.fillText("LAB — order investigations", lab.x + 30, lab.y + 105);

  // --- chart trolley ---
  const ch = ZONES[2];
  ctx.fillStyle = "#fef9c3";
  ctx.fillRect(ch.x, ch.y, ch.w, ch.h);
  ctx.strokeStyle = "#fde047";
  ctx.strokeRect(ch.x, ch.y, ch.w, ch.h);
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(ch.x + 20, ch.y + 40, 60, 46);
  ctx.fillRect(ch.x + 92, ch.y + 40, 60, 46);
  ctx.fillRect(ch.x + 164, ch.y + 40, 40, 46);
  // clipboard
  ctx.fillStyle = "#78350f";
  ctx.fillRect(ch.x + 44, ch.y + 48, 34, 44);
  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(ch.x + 47, ch.y + 54, 28, 34);
  ctx.fillStyle = "#a8531a";
  ctx.fillRect(ch.x + 52, ch.y + 46, 18, 7);
  ctx.fillStyle = "#854d0e";
  ctx.font = "11px sans-serif";
  ctx.fillText("CHART — diagnose & manage", ch.x + 24, ch.y + 120);

  // --- phone ---
  const ph = ZONES[3];
  ctx.fillStyle = "#f3e8ff";
  ctx.fillRect(ph.x, ph.y, ph.w, ph.h);
  ctx.strokeStyle = "#d8b4fe";
  ctx.strokeRect(ph.x, ph.y, ph.w, ph.h);
  ctx.fillStyle = "#7c3aed";
  ctx.fillRect(ph.x + 30, ph.y + 30, 50, 70);
  ctx.fillStyle = "#ede9fe";
  ctx.fillRect(ph.x + 36, ph.y + 38, 38, 30);
  ctx.fillStyle = "#5b21b6";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      ctx.fillRect(ph.x + 38 + c * 12, ph.y + 74 + r * 7, 9, 5);
  ctx.fillStyle = "#4c1d95";
  ctx.font = "10px sans-serif";
  ctx.fillText("PHONE a consultant", ph.x + 12, ph.y + 114);

  // --- exit door ---
  const ex = ZONES[4];
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.strokeStyle = "#94a3b8";
  ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
  ctx.fillStyle = "#64748b";
  ctx.fillRect(ex.x + 30, ex.y + 12, 60, 46);
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(ex.x + 84, ex.y + 35, 3, 0, Math.PI * 2);
  ctx.fill();
}
