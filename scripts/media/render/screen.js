// The phone's screen, drawn fresh for every frame of the hero. It tells the same
// story as the hero copy: a customer chat answered, a call picked up, and a day's
// work handled. Everything is illustrative, with no real business or person named.

import { GLASS } from './phone.js';

const TEXTURE_WIDTH = 1080;
const TEXTURE_HEIGHT = Math.round((TEXTURE_WIDTH * GLASS.height) / GLASS.width);
const BEZEL = Math.round((0.017 / GLASS.width) * TEXTURE_WIDTH);
const DISPLAY_RADIUS = Math.round(((GLASS.radius - 0.017) / GLASS.width) * TEXTURE_WIDTH);

// Drawing happens in points on a 340pt-wide display: a little larger than a real
// phone's UI, so the conversation still reads when the phone is small on the page.
const W = 340;
const S = (TEXTURE_WIDTH - 2 * BEZEL) / W;
const H = (TEXTURE_HEIGHT - 2 * BEZEL) / S;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const span = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (x) => 1 - Math.pow(1 - clamp01(x), 3);

const BLUE = '#0a84ff';
const GRAY = '#8e8e93';

const CHAT = [
  { from: 'customer', at: 0.17, text: 'Hi! Can I move my appointment to Friday?' },
  { from: 'assistant', typing: 0.21, at: 0.26, text: 'Of course. Friday has 10:00 or 2:30 free. Which works best?' },
  { from: 'customer', at: 0.32, text: '2:30, please.' },
  { from: 'assistant', typing: 0.35, at: 0.4, text: 'Done. You’re booked for Friday at 2:30, and a confirmation is on its way.' },
];

const CALL = [
  { who: 'Caller', at: 0.55, text: '“Hi, do you have anything free this afternoon?”' },
  { who: 'Assistant', at: 0.625, text: '“Yes, 3:00 is open. Can I take your name?”' },
];

const TODAY = [
  { icon: 'chat', color: '#0a84ff', title: 'Appointment moved', detail: 'Friday, 2:30 · Website chat', time: '10:02', at: 0.8 },
  { icon: 'phone', color: '#30d158', title: 'Call answered', detail: 'Booked in for 3:00 today', time: '10:09', at: 0.84 },
  { icon: 'sheet', color: '#ff9f0a', title: 'Order logged', detail: 'Added to your sheet, invoice sent', time: '10:15', at: 0.88 },
  { icon: 'doc', color: '#bf5af2', title: 'Question answered', detail: 'From your returns policy', time: '10:21', at: 0.92 },
];

export function createScreenCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  return canvas;
}

function font(ctx, weight, size) {
  ctx.font = `${weight} ${size}px Inter`;
  ctx.letterSpacing = size >= 20 ? `${-0.02 * size}px` : `${-0.01 * size}px`;
}

function wrap(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function statusBar(ctx, { callPill = false } = {}) {
  if (callPill) {
    ctx.fillStyle = '#30d158';
    ctx.beginPath();
    ctx.roundRect(22, 13, 62, 25, 12.5);
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  font(ctx, 600, 16);
  ctx.textAlign = 'center';
  ctx.fillText('10:24', 53, 31);

  for (let i = 0; i < 4; i++) {
    const h = 4.5 + i * 2.6;
    ctx.beginPath();
    ctx.roundRect(W - 100 + i * 5, 30 - h, 3.3, h, 1);
    ctx.fill();
  }
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(W - 66, 31, 2.5 + i * 3.8, -Math.PI * 0.76, -Math.PI * 0.24);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(W - 50.5, 19.5, 25, 12.5, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(W - 48.5, 21.5, 17, 8.5, 2.2);
  ctx.fill();

  // Front camera.
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(W / 2, 25, 6.5, 0, Math.PI * 2);
  ctx.fill();
}

function homeIndicator(ctx) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 67, H - 12, 134, 5, 2.5);
  ctx.fill();
}

function glyph(ctx, kind, x, y, size = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (kind === 'chat') {
    ctx.beginPath();
    ctx.roundRect(-8, -7, 16, 12, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, 3);
    ctx.lineTo(-7, 8.5);
    ctx.lineTo(0, 4);
    ctx.fill();
  } else if (kind === 'phone' || kind === 'hangup') {
    ctx.rotate(kind === 'phone' ? -Math.PI / 4 : 0);
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.arc(0, 7, 9.5, Math.PI * 1.18, Math.PI * 1.82);
    ctx.stroke();
  } else if (kind === 'sheet') {
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-7.5, -7.5, 15, 15, 2.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7.5, -2.5);
    ctx.lineTo(7.5, -2.5);
    ctx.moveTo(-7.5, 2.5);
    ctx.lineTo(7.5, 2.5);
    ctx.moveTo(-2, -7.5);
    ctx.lineTo(-2, 7.5);
    ctx.stroke();
  } else if (kind === 'doc') {
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-6, -8, 12, 16, 2.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2.5, -3);
    ctx.lineTo(2.5, -3);
    ctx.moveTo(-2.5, 1);
    ctx.lineTo(2.5, 1);
    ctx.moveTo(-2.5, 4.5);
    ctx.lineTo(1, 4.5);
    ctx.stroke();
  } else if (kind === 'person') {
    ctx.beginPath();
    ctx.arc(0, -5, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 10, 10, 6.5, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function lock(ctx, p) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b0d12');
  bg.addColorStop(0.55, '#000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  statusBar(ctx);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  font(ctx, 500, 78);
  ctx.fillText('10:24', W / 2, 172);
  ctx.fillStyle = GRAY;
  font(ctx, 500, 16);
  ctx.fillText('Friday 18 September', W / 2, 202);

  // The message that starts the conversation, arriving.
  const k = ease(span(p, 0.03, 0.08));
  if (k > 0) {
    ctx.save();
    ctx.globalAlpha *= k;
    ctx.translate(0, (1 - k) * 22);
    ctx.fillStyle = 'rgba(46,46,52,0.94)';
    ctx.beginPath();
    ctx.roundRect(16, 250, W - 32, 104, 24);
    ctx.fill();
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(48, 282, 16, 0, Math.PI * 2);
    ctx.fill();
    glyph(ctx, 'chat', 48, 282, 0.8);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    font(ctx, 600, 15);
    ctx.fillText('Your business', 74, 287);
    ctx.textAlign = 'right';
    ctx.fillStyle = GRAY;
    font(ctx, 400, 13);
    ctx.fillText('now', W - 32, 287);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e5e5ea';
    font(ctx, 400, 15);
    wrap(ctx, CHAT[0].text, W - 106).forEach((line, i) => ctx.fillText(line, 74, 310 + i * 20));
    ctx.restore();
  }
  homeIndicator(ctx);
}

function chat(ctx, p, frame) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Header.
  ctx.fillStyle = '#161618';
  ctx.fillRect(0, 0, W, 112);
  ctx.fillStyle = '#2c2c2e';
  ctx.fillRect(0, 112, W, 0.7);
  statusBar(ctx);

  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(25, 69);
  ctx.lineTo(16, 79);
  ctx.lineTo(25, 89);
  ctx.stroke();

  const avatar = ctx.createLinearGradient(0, 60, 0, 100);
  avatar.addColorStop(0, '#aeaeb2');
  avatar.addColorStop(1, '#636366');
  ctx.fillStyle = avatar;
  ctx.beginPath();
  ctx.arc(60, 79, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  font(ctx, 600, 14);
  ctx.textAlign = 'center';
  ctx.fillText('YB', 60, 84);

  ctx.textAlign = 'left';
  font(ctx, 600, 17);
  ctx.fillText('Your business', 90, 76);
  ctx.fillStyle = '#30d158';
  ctx.beginPath();
  ctx.arc(94, 90, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = GRAY;
  font(ctx, 400, 13);
  ctx.fillText('Assistant · Online', 102, 95);

  // Conversation, anchored above the composer like a real messaging app.
  const padX = 14;
  const padY = 9;
  const lineHeight = 21.5;
  const items = [];
  for (const m of CHAT) {
    if (m.typing != null && p >= m.typing && p < m.at) {
      items.push({ typing: true, k: ease(span(p, m.typing, m.typing + 0.012)), height: 38 });
      break;
    }
    if (p < m.at) break;
    font(ctx, 400, 17);
    const lines = wrap(ctx, m.text, 244 - padX * 2);
    items.push({
      lines,
      mine: m.from === 'customer',
      k: ease(span(p, m.at, m.at + 0.02)),
      width: Math.max(...lines.map((l) => ctx.measureText(l).width)) + padX * 2,
      height: lines.length * lineHeight + padY * 2,
    });
  }
  const stack = 22 + items.reduce((sum, item) => sum + item.height + 8, 0);
  let y = Math.max(140, H - 92 - stack);

  ctx.fillStyle = GRAY;
  font(ctx, 500, 12);
  ctx.textAlign = 'center';
  ctx.fillText('Today 10:02', W / 2, y + 10);
  y += 22;

  for (const item of items) {
    ctx.save();
    ctx.globalAlpha *= item.k;
    if (item.typing) {
      ctx.fillStyle = '#262628';
      ctx.beginPath();
      ctx.roundRect(14, y, 66, 38, 19);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * Math.abs(Math.sin(frame * 0.9 + i * 0.9))})`;
        ctx.beginPath();
        ctx.arc(33 + i * 14, y + 19, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const x = item.mine ? W - 14 - item.width : 14;
      ctx.translate(item.mine ? (1 - item.k) * 10 : -(1 - item.k) * 10, (1 - item.k) * 14);
      ctx.fillStyle = item.mine ? BLUE : '#262628';
      ctx.beginPath();
      ctx.roundRect(x, y, item.width, item.height, 19);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      font(ctx, 400, 17);
      item.lines.forEach((line, i) => ctx.fillText(line, x + padX, y + padY + 16 + i * lineHeight));
    }
    ctx.restore();
    y += item.height + 8;
  }

  // Composer.
  ctx.fillStyle = '#1c1c1e';
  ctx.beginPath();
  ctx.arc(32, H - 58, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8e8e93';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, H - 65);
  ctx.lineTo(32, H - 51);
  ctx.moveTo(25, H - 58);
  ctx.lineTo(39, H - 58);
  ctx.stroke();
  ctx.strokeStyle = '#3a3a3c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(58.5, H - 76.5, W - 74, 36, 18);
  ctx.stroke();
  ctx.fillStyle = '#636366';
  ctx.textAlign = 'left';
  font(ctx, 400, 17);
  ctx.fillText('Message', 74, H - 52);
  homeIndicator(ctx);
}

function call(ctx, p, frame) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a1d24');
  bg.addColorStop(0.55, '#08090b');
  bg.addColorStop(1, '#000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  statusBar(ctx, { callPill: true });

  ctx.textAlign = 'center';
  ctx.fillStyle = GRAY;
  font(ctx, 500, 15);
  ctx.fillText('Answered by your assistant', W / 2, 122);
  ctx.fillStyle = '#fff';
  font(ctx, 600, 34);
  ctx.fillText('New caller', W / 2, 166);
  const seconds = 4 + Math.max(0, Math.floor((p - 0.5) * 95));
  ctx.fillStyle = GRAY;
  font(ctx, 400, 17);
  ctx.fillText(`Mobile · 0:${String(seconds).padStart(2, '0')}`, W / 2, 194);

  // Voice waveform.
  const bars = 39;
  const cy = 288;
  const barGradient = ctx.createLinearGradient(0, cy - 44, 0, cy + 44);
  barGradient.addColorStop(0, '#64d2ff');
  barGradient.addColorStop(1, BLUE);
  ctx.fillStyle = barGradient;
  for (let i = 0; i < bars; i++) {
    const d = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2);
    const envelope = Math.pow(1 - d, 1.3);
    const noise = 0.55 + 0.45 * Math.sin(i * 1.37 + frame * 1.9) * Math.sin(i * 0.41 - frame * 0.73);
    const h = 5 + envelope * noise * 84;
    const x = W / 2 + (i - (bars - 1) / 2) * 6.8;
    ctx.beginPath();
    ctx.roundRect(x - 1.8, cy - h / 2, 3.6, h, 1.8);
    ctx.fill();
  }

  // Live transcript.
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.roundRect(16, 358, W - 32, 236, 24);
  ctx.fill();
  let y = 394;
  ctx.textAlign = 'left';
  for (const line of CALL) {
    if (p < line.at) break;
    const k = ease(span(p, line.at, line.at + 0.02));
    ctx.save();
    ctx.globalAlpha *= k;
    ctx.translate(0, (1 - k) * 10);
    ctx.fillStyle = line.who === 'Assistant' ? '#64d2ff' : GRAY;
    font(ctx, 600, 13);
    ctx.fillText(line.who, 36, y);
    ctx.fillStyle = '#fff';
    font(ctx, 400, 19);
    const lines = wrap(ctx, line.text, W - 72);
    lines.forEach((l, i) => ctx.fillText(l, 36, y + 28 + i * 25));
    ctx.restore();
    y += 28 + lines.length * 25 + 20;
  }

  // Controls.
  const by = H - 104;
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.arc(W / 2 - 72, by, 37, 0, Math.PI * 2);
  ctx.fill();
  glyph(ctx, 'person', W / 2 - 72, by - 2, 1.25);
  ctx.fillStyle = '#ff453a';
  ctx.beginPath();
  ctx.arc(W / 2 + 72, by, 37, 0, Math.PI * 2);
  ctx.fill();
  glyph(ctx, 'hangup', W / 2 + 72, by - 4, 1.4);
  ctx.fillStyle = '#fff';
  font(ctx, 500, 13);
  ctx.textAlign = 'center';
  ctx.fillText('Take over', W / 2 - 72, by + 60);
  ctx.fillText('End', W / 2 + 72, by + 60);
  homeIndicator(ctx);
}

function today(ctx, p) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  statusBar(ctx);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  font(ctx, 700, 34);
  ctx.fillText('Today', 20, 106);
  ctx.fillStyle = GRAY;
  font(ctx, 400, 16);
  ctx.fillText('Handled by your assistant', 20, 132);

  let y = 160;
  for (const item of TODAY) {
    if (p < item.at) break;
    const k = ease(span(p, item.at, item.at + 0.025));
    ctx.save();
    ctx.globalAlpha *= k;
    ctx.translate(0, (1 - k) * 18);
    ctx.fillStyle = '#1c1c1e';
    ctx.beginPath();
    ctx.roundRect(16, y, W - 32, 80, 20);
    ctx.fill();
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(52, y + 40, 20, 0, Math.PI * 2);
    ctx.fill();
    glyph(ctx, item.icon, 52, y + 40, 1);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    font(ctx, 600, 16);
    ctx.fillText(item.title, 84, y + 35);
    ctx.fillStyle = GRAY;
    font(ctx, 400, 14);
    ctx.fillText(item.detail, 84, y + 57);
    ctx.textAlign = 'right';
    font(ctx, 400, 13);
    ctx.fillText(item.time, W - 34, y + 35);
    ctx.restore();
    y += 92;
  }
  homeIndicator(ctx);
}

/** Draws the screen for scroll progress `p` (0–1) at hero frame `frame`. */
export function drawHeroScreen(canvas, p, frame) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(BEZEL, BEZEL, canvas.width - 2 * BEZEL, canvas.height - 2 * BEZEL, DISPLAY_RADIUS);
  ctx.clip();
  ctx.setTransform(S, 0, 0, S, BEZEL, BEZEL);

  // Short hand-offs: a long cross-fade leaves both screens legible at once.
  const toChat = span(p, 0.115, 0.15);
  const toCall = span(p, 0.485, 0.52);
  const toToday = span(p, 0.775, 0.81);
  if (toChat < 1) lock(ctx, p);
  if (toChat > 0 && toCall < 1) {
    ctx.globalAlpha = toChat;
    chat(ctx, p, frame);
    ctx.globalAlpha = 1;
  }
  if (toCall > 0 && toToday < 1) {
    ctx.globalAlpha = toCall;
    call(ctx, p, frame);
    ctx.globalAlpha = 1;
  }
  if (toToday > 0) {
    ctx.globalAlpha = toToday;
    today(ctx, p);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
