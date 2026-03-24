// =====================================
// GYMTRACK PREMIUM — CORE APP
// Nav, Timer, Exercises, Progress, Init
// =====================================

// ── AUDIO BEEP PARA TIMER ──
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function playFanfare() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  } catch(e) {}
}

// ── TIMER ──
let tmInt = null, tmTotal = 120, tmLeft = 120;
const CIRC = 553;

function startTimer(sec) {
  clearInterval(tmInt); tmTotal = sec; tmLeft = sec;
  document.getElementById('timerOv').classList.add('open');
  updTm();
  tmInt = setInterval(() => {
    tmLeft--;
    updTm();
    // Vibración progresiva a 10 seg
    if (tmLeft === 10) haptic([100, 80, 100, 80, 100]);
    if (tmLeft <= 0) {
      clearInterval(tmInt);
      playBeep();
      haptic([200, 100, 200, 100, 300]);
      closeTm();
      showToast('✅ ¡VAMOS! — SIGUIENTE SERIE');
    }
  }, 1000);
}

function updTm() {
  const m = Math.floor(tmLeft / 60), s = tmLeft % 60;
  document.getElementById('tSec').textContent = `${m}:${s.toString().padStart(2, '0')}`;
  const off = CIRC * (1 - tmLeft / tmTotal);
  const ring = document.getElementById('tRing');
  ring.style.strokeDashoffset = off;
  ring.style.stroke = tmLeft <= 10 ? 'var(--acc)' : tmLeft <= 30 ? 'var(--gld)' : 'var(--grn)';
  document.getElementById('tSec').style.color = tmLeft <= 10 ? 'var(--acc)' : '';
}

function setTm(s, el) {
  document.querySelectorAll('.tp').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  startTimer(s);
}

function closeTm() { clearInterval(tmInt); document.getElementById('timerOv').classList.remove('open'); }

function adjustTimer(delta) {
  tmLeft = Math.max(0, tmLeft + delta);
  tmTotal = Math.max(tmTotal, tmLeft);
  updTm();
}

// ── NAV ──
let currentPage = 'rutina';
function showPg(n) {
  haptic(10);
  currentPage = n;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + n)?.classList.add('active');
  document.getElementById('nav-' + n)?.classList.add('active');
  // Render page-specific content
  if (n === 'progreso') { renderProg(); renderChart(); }
  if (n === 'dieta') { renderMeals(); renderDailyMacros(); renderScannedHistory(); }
  if (n === 'stats') { renderStats(); }
  if (n === 'diary') renderDiary();
  if (n === 'library') renderLibrary();
  if (n === 'calc') renderCalc();
  if (n === 'share') renderShareCard();
  if (n === 'settings') renderSettings();
  if (n === 'bodyscan') renderBodyScan();
  if (n === 'bodymap') renderBodyMapPage();
  if (n === 'ranks') renderRanks();
}

// ── EDIT MODE ──
let editMode = false;
function toggleEdit() {
  editMode = !editMode;
  const b = document.getElementById('editBtn');
  b.classList.toggle('on', editMode);
  b.textContent = editMode ? '✓ GUARDAR CAMBIOS' : '✏️ EDITAR';
  document.getElementById('editHint').textContent = editMode ? 'Edita nombre, agarre, series, reps' : '';
  if (!editMode) { save(); showToast('✅ CAMBIOS GUARDADOS'); }
  renderEx();
}

// ── DAY ──
function selDay(i) {
  if (!DAYS[i]) return;
  S.selDay = i; save();
  document.querySelectorAll('.db').forEach((b, j) => b.classList.toggle('active', j === i));
  renderEx();
  haptic(10);
}

function updHdr() {
  const days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const d = new Date().getDay();
  document.getElementById('hdrSub').textContent = `${days[d === 0 ? 6 : d - 1]} · Semana ${S.week} de 16`;
}

// ── EXERCISES RENDER ──
function renderEx() {
  const day = DAYS[S.selDay];
  const list = document.getElementById('exList');
  if (!day) {
    list.innerHTML = `<div style="text-align:center;padding:50px;color:var(--mut)"><div style="font-size:48px;margin-bottom:10px">🛌</div><div style="font-family:var(--fd);font-size:24px;letter-spacing:2px">DÍA DE DESCANSO</div><div style="font-size:12px;margin-top:8px">Duerme 8–9 horas · Come bien · Recupera</div></div>`;
    return;
  }
  const wm = Math.floor((S.week - 1) / 2) * 2.5;
  const fmt = s => Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');

  list.innerHTML = day.exercises.map((ex, i) => {
    const sw = S.weights[ex.name] !== undefined ? S.weights[ex.name] : (ex.sw + wm);
    const done = S.doneEx[ex.name + S.week] || false;
    const sets = S.doneSets[ex.name + S.week] || Array(ex.sets).fill(false);
    
    let imgD = IMG[ex.name];
    if (!imgD) {
      for (const k in IMG) {
        if (ex.name.toLowerCase().includes(k.split(' ')[0].toLowerCase())) {
          imgD = IMG[k];
          break;
        }
      }
    }
    
    const hasPR = S.prs[ex.name] && S.weights[ex.name] >= S.prs[ex.name];

    const imgHtml = imgD
      ? `<div class="img-wrap"><img src="${imgD.url}" alt="${ex.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'img-ph\\'><div class=\\'e\\'>🏋️</div><div>Busca <strong>${ex.name}</strong> en YouTube</div></div>'"><div class="img-cap">${imgD.cap}</div></div>`
      : `<div class="img-wrap"><div class="img-ph"><div class="e">🏋️</div><div>Busca <strong>${ex.name}</strong> en YouTube para ver la técnica</div></div></div>`;

    const editHtml = `
      <span class="el">NOMBRE</span><input class="ef" value="${ex.name}" onchange="DAYS[S.selDay].exercises[${i}].name=this.value">
      <div class="er">
        <div style="flex:1"><span class="el">SERIES</span><input class="es" type="number" value="${ex.sets}" min="1" max="8" onchange="DAYS[S.selDay].exercises[${i}].sets=parseInt(this.value)||ex.sets"></div>
        <div style="flex:1"><span class="el">REPS</span><input class="es" value="${ex.reps}" onchange="DAYS[S.selDay].exercises[${i}].reps=this.value"></div>
        <div style="flex:1"><span class="el">DESC.</span><input class="es" type="number" value="${ex.rest}" onchange="DAYS[S.selDay].exercises[${i}].rest=parseInt(this.value)||ex.rest"></div>
        <div style="flex:1"><span class="el">RIR</span><input class="es" value="${ex.rir}" onchange="DAYS[S.selDay].exercises[${i}].rir=this.value"></div>
      </div>
      <span class="el">AGARRE</span><textarea class="ef" rows="2" onchange="DAYS[S.selDay].exercises[${i}].grip=this.value">${ex.grip}</textarea>
      <span class="el">¿POR QUÉ?</span><textarea class="ef" rows="2" onchange="DAYS[S.selDay].exercises[${i}].why=this.value">${ex.why}</textarea>`;

    const normalHtml = `
      ${imgHtml}
      <div class="gb"><strong>🤜 AGARRE:</strong> ${ex.grip}</div>
      <div class="wb">💡 ${ex.why}</div>
      <div class="str">
        <div class="stl">SERIES — SEM ${S.week} · ⏱️ pulsa reloj para descansar</div>
        ${Array.from({length: ex.sets}, (_, si) => {
          const sr = (S.setReps[ex.name + S.week] || [])[si] || '';
          return `<div class="sr">
            <div class="sn">S${si + 1}</div>
            <input type="number" class="si" placeholder="${sw}kg" step="1.25" min="0" value="${S.weights[ex.name] || ''}" onchange="S.weights['${ex.name}']=parseFloat(this.value)||0;save();checkPR('${ex.name}',parseFloat(this.value))&&showToast('🏆 ¡PR en ${ex.name.split(' ').slice(0,3).join(' ')}!')">
            <div class="su">kg</div>
            <input type="number" class="ri" placeholder="reps" min="0" max="30" value="${sr}" onchange="updReps(${i},${si},this.value)">
            <div class="rb" onclick="startTimer(${ex.rest})">⏱️ ${fmt(ex.rest)}</div>
            <div class="sc-btn ${sets[si] ? 'done' : ''}" onclick="togSet(${i},${si})">${sets[si] ? '✓' : ''}</div>
          </div>`;
        }).join('')}
      </div>
      <button class="mdb ${done ? 'undone' : ''}" onclick="togDone(${i})">${done ? '↩ DESMARCAR' : '✓ COMPLETADO'}</button>`;

    return `<div class="ec ${done ? 'done' : ''}" id="ec${i}">
      <div class="eh" onclick="togEx(${i})">
        <div class="en">${done ? '✓' : i + 1}</div>
        <div class="ei"><div class="en2">${ex.name}${hasPR ? '<span class="pr-badge">🏆 PR</span>' : ''}</div><div class="em">${ex.sets}×${ex.reps} · ${fmt(ex.rest)} desc · ${ex.rir}</div></div>
        <div class="ea">›</div>
      </div>
      <div class="eb">
        <div class="cr">
          <div class="ch r"><span class="cl">SERIES</span><span class="cv">${ex.sets}</span></div>
          <div class="ch g"><span class="cl">REPS</span><span class="cv">${ex.reps}</span></div>
          <div class="ch b"><span class="cl">DESCANSO</span><span class="cv">${fmt(ex.rest)}</span></div>
          <div class="ch gd"><span class="cl">RIR</span><span class="cv">${ex.rir}</span></div>
          <div class="ch o"><span class="cl">PESO EST.</span><span class="cv">${sw}kg</span></div>
        </div>
        ${editMode ? editHtml : normalHtml}
      </div>
    </div>`;
  }).join('');
}

function togEx(i) {
  const c = document.getElementById('ec' + i);
  const o = c.classList.contains('open');
  document.querySelectorAll('.ec').forEach(x => x.classList.remove('open'));
  if (!o) c.classList.add('open');
}

function updReps(ei, si, v) {
  const key = DAYS[S.selDay].exercises[ei].name + S.week;
  if (!S.setReps[key]) S.setReps[key] = [];
  S.setReps[key][si] = parseInt(v) || 0;
  save();
}

function togSet(ei, si) {
  const ex = DAYS[S.selDay].exercises[ei];
  const k = ex.name + S.week;
  if (!S.doneSets[k]) S.doneSets[k] = Array(ex.sets).fill(false);
  const wasOff = !S.doneSets[k][si];
  S.doneSets[k][si] = !S.doneSets[k][si];
  save(); haptic(20); renderEx();
  setTimeout(() => document.getElementById('ec' + ei)?.classList.add('open'), 10);
  // XP por completar serie
  if (wasOff) {
    earnXP(10, 'Serie completada');
    earnExerciseXP(ex.name, 10);
    // Registrar para sobrecarga
    const kg = S.weights[ex.name] || ex.sw;
    const reps = (S.setReps[k] || [])[si] || 0;
    recordOverload(ex.name, kg, reps);
  }
}

function togDone(ei) {
  const ex = DAYS[S.selDay].exercises[ei];
  const k = ex.name + S.week;
  S.doneEx[k] = !S.doneEx[k];
  save(); renderEx();
  if (S.doneEx[k]) {
    showToast('✅ ' + ex.name.split(' ').slice(0, 3).join(' '));
    haptic([30, 50, 30]);
    earnXP(25, 'Ejercicio completado');
    earnExerciseXP(ex.name, 25);
    // Check all done
    const day = DAYS[S.selDay];
    const allDone = day.exercises.every(e => S.doneEx[e.name + S.week]);
    if (allDone) {
      earnXP(100, '¡Sesión completa!');
      checkAchievement('first_workout', true);
      checkAchievement('sessions_10', (S.sessions || []).length >= 10);
      checkAchievement('sessions_50', (S.sessions || []).length >= 50);
      if (S.liveSession) stopLiveSession();
      else { launchConfetti(); playFanfare(); showToast('🎉 ¡SESIÓN COMPLETADA!'); updateStreak(); checkAchievement('streak_3', S.streak >= 3); checkAchievement('streak_7', S.streak >= 7); }
    }
  }
}

// ── PROGRESS ──
function renderProg() {
  const bw = S.bw || 50.5;
  document.getElementById('cwDisp').textContent = bw.toFixed(1);
  const target = S.goalWeight || 55;
  const pct = Math.max(0, Math.min(100, ((bw - 50.5) / (target - 50.5)) * 100));
  document.getElementById('wpb').style.width = pct.toFixed(1) + '%';
  document.getElementById('wpt').textContent = pct.toFixed(1) + '%';
  document.getElementById('wr').textContent = Math.max(0, target - bw).toFixed(1);
  document.getElementById('liftList').innerHTML = LIFTS.map(l => `
    <div class="lr">
      <div class="ln">${l.n}${S.prs[l.n] ? ' <span class="pr-badge">🏆 '+S.prs[l.n]+'kg</span>' : ''}</div>
      <div style="font-size:10px;color:var(--mut);font-family:var(--fm)">${S.lifts[l.k] ? S.lifts[l.k] + ' kg' : '—'}</div>
      <input type="number" class="li" placeholder="kg" step="2.5" value="${S.lifts[l.k] || ''}" onchange="S.lifts['${l.k}']=parseFloat(this.value)||0">
    </div>`).join('');
}

let wChart = null;
function renderChart() {
  const h = S.bwHist || [];
  const cv = document.getElementById('wChart');
  const ce = document.getElementById('cEmpty');
  if (h.length < 2) { cv.style.display = 'none'; ce.style.display = 'block'; return; }
  cv.style.display = 'block'; ce.style.display = 'none';
  if (wChart) wChart.destroy();
  wChart = new Chart(cv, {
    type: 'line',
    data: {
      labels: h.map((_, i) => `S${i + 1}`),
      datasets: [
        {label: 'Peso (kg)', data: h.map(x => x.w), borderColor: '#00d68f', backgroundColor: 'rgba(0,214,143,.1)', pointBackgroundColor: '#00d68f', pointRadius: 5, tension: .4, fill: true},
        {label: 'Objetivo ' + (S.goalWeight||55) + 'kg', data: h.map(() => S.goalWeight||55), borderColor: 'rgba(255,215,0,.4)', borderDash: [6, 4], pointRadius: 0, fill: false}
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {legend: {labels: {color: '#7070a0', font: {size: 10}}}},
      scales: {
        x: {ticks: {color: '#7070a0', font:{size:10}}, grid: {color: '#2a2a3a'}},
        y: {ticks: {color: '#7070a0', font:{size:10}}, grid: {color: '#2a2a3a'}, min: 48, max: 70}
      }
    }
  });
}

function saveW() {
  const v = parseFloat(document.getElementById('wInput').value);
  if (!v || v < 30 || v > 150) { showToast('❌ PESO INVÁLIDO', true); return; }
  S.bw = v;
  if (!S.bwHist) S.bwHist = [];
  S.bwHist.push({week: S.week, w: v, date: todayStr()});
  save(); renderProg(); renderChart();
  showToast('💪 PESO GUARDADO: ' + v + ' KG');
  haptic([30, 50]);
}

function saveLifts() { save(); showToast('✅ LEVANTAMIENTOS GUARDADOS'); haptic(20); }

// ── MEALS ──
function renderMeals() {
  document.getElementById('mealList').innerHTML = MEALS.map((m, i) => `
    <div class="mlc" id="ml${i}">
      <div class="mlh" onclick="document.getElementById('ml${i}').classList.toggle('open')">
        <div class="me">${m.emoji}</div>
        <div style="flex:1"><div class="mn">${m.name}</div><div class="mt">${m.time} · ${m.tot}</div></div>
        <div class="mk">${m.kcal}</div>
      </div>
      <div class="mlb">${m.foods.map(f => `<div class="fi"><div class="fd-dot"></div><div class="fn">${f.n}</div><div class="fp">${f.p} prot</div></div>`).join('')}</div>
    </div>`).join('');
}

// ── WEEK MODAL ──
function openWkModal() {
  const g = document.getElementById('wkGrid'); g.innerHTML = '';
  for (let i = 1; i <= 16; i++) {
    const b = document.createElement('div');
    b.style.cssText = `background:${i === S.week ? 'var(--acc)' : 'var(--sur2)'};border:1px solid ${i === S.week ? 'var(--acc)' : 'var(--brd)'};border-radius:10px;padding:10px 6px;text-align:center;cursor:pointer;font-family:var(--fm);font-size:12px;color:${i === S.week ? '#fff' : 'var(--mut)'};transition:all .2s`;
    b.textContent = `S ${i}`;
    b.onclick = () => { S.week = i; document.getElementById('wkNum').textContent = i; save(); closeWkModal(); renderEx(); updHdr(); };
    g.appendChild(b);
  }
  document.getElementById('wkModal').style.display = 'flex';
}

function closeWkModal(e) {
  if (!e || e.target === document.getElementById('wkModal'))
    document.getElementById('wkModal').style.display = 'none';
}

// ── TOAST ──
function showToast(msg, err) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = err ? 'var(--acc)' : 'var(--grn)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── SERVICE WORKER ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// ── APP INIT ──
function initApp() {
  applyTheme();
  checkDailyReset();
  document.getElementById('wkNum').textContent = S.week;
  updHdr();
  selDay(S.selDay);
  renderMeals();
  setupNotifications();
  // Render mode selector
  const modeSel = document.getElementById('modeSelector');
  if (modeSel) modeSel.innerHTML = renderModeSelector();
  // Update XP bar
  updateXPBar();
  if (S.liveSession) {
    liveInterval = setInterval(updateLiveBanner, 1000);
    updateLiveBanner();
  }
}

// Arranque
checkOnboarding();
if (S.onboarded) initApp();
