// =====================================
// GYMTRACK PREMIUM — FUNCIONES EXTRA
// Onboarding, Confetti, Stats, Diary, Export, etc.
// =====================================

// ── ONBOARDING ──
function checkOnboarding() {
  if (!S.onboarded) showOnboarding();
}

let obStep = 0;
const OB_STEPS = [
  {icon:'💪',title:'BIENVENIDO A <span>GYMTRACK</span>',text:'Tu app de entrenamiento personal premium. Registra tus entrenamientos, controla tu nutrición y alcanza tus objetivos.'},
  {icon:'📷',title:'ESCÁNER DE <span>COMIDA IA</span>',text:'Escanea tu comida con la cámara y la IA calculará automáticamente las calorías y macronutrientes.'},
  {icon:'📊',title:'SEGUIMIENTO <span>TOTAL</span>',text:'Gráficas de progreso, récords personales, racha de entrenamientos y diario completo. Todo guardado.'},
  {icon:'⚙️',title:'TUS <span>DATOS</span>',text:'Introduce tus datos para personalizar tu plan.',form:true}
];

function showOnboarding() {
  obStep = 0;
  renderObStep();
  document.getElementById('onboarding').style.display = 'flex';
}

function renderObStep() {
  const s = OB_STEPS[obStep];
  const isLast = obStep === OB_STEPS.length - 1;
  const dots = OB_STEPS.map((_,i) => `<div class="ob-dot ${i===obStep?'active':''}"></div>`).join('');

  let formHtml = '';
  if (s.form) {
    formHtml = `
      <div class="ob-input-group"><label class="ob-input-label">PESO ACTUAL (KG)</label><input type="number" class="ob-input" id="obWeight" value="${S.bw}" step="0.1" min="30" max="150"></div>
      <div class="ob-input-group"><label class="ob-input-label">ALTURA (CM)</label><input type="number" class="ob-input" id="obHeight" value="${S.height}" min="100" max="220"></div>
      <div class="ob-input-group"><label class="ob-input-label">PESO OBJETIVO (KG)</label><input type="number" class="ob-input" id="obGoal" value="${S.goalWeight}" step="0.5" min="40" max="120"></div>
      <div class="ob-input-group"><label class="ob-input-label">API KEY DE GEMINI (opcional)</label><input type="text" class="ob-input" id="obApiKey" value="${S.apiKey}" placeholder="AIza..."></div>`;
  }

  document.getElementById('onboarding').innerHTML = `
    <div class="ob-graphic">${s.icon}</div>
    <div class="ob-title">${s.title}</div>
    <div class="ob-text">${s.text}</div>
    ${formHtml}
    <div class="ob-dots">${dots}</div>
    <button class="ob-next" onclick="nextOb()">${isLast?'¡EMPEZAR!':'SIGUIENTE →'}</button>`;
}

function nextOb() {
  haptic(20);
  if (obStep === OB_STEPS.length - 1) {
    // Guardar datos del formulario
    const w = parseFloat(document.getElementById('obWeight')?.value);
    const h = parseInt(document.getElementById('obHeight')?.value);
    const g = parseFloat(document.getElementById('obGoal')?.value);
    const k = document.getElementById('obApiKey')?.value?.trim();
    if (w && w > 30) S.bw = w;
    if (h && h > 100) S.height = h;
    if (g && g > 30) S.goalWeight = g;
    if (k) S.apiKey = k;
    S.onboarded = true;
    save();
    document.getElementById('onboarding').style.display = 'none';
    initApp();
    return;
  }
  obStep++;
  renderObStep();
}

// ── CONFETTI ──
function launchConfetti() {
  const emojis = ['🎉','🏆','💪','⭐','🔥','✨','🎊','💥'];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      el.style.fontSize = (14 + Math.random() * 14) + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 60);
  }
}

// ── THEME TOGGLE ──
function toggleTheme() {
  S.theme = S.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  save();
  haptic(15);
}

function applyTheme() {
  document.body.classList.toggle('light', S.theme === 'light');
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = S.theme === 'dark' ? '☀️' : '🌙';
}

// ── LIVE TRAINING MODE ──
let liveInterval = null;
let wakelock = null;

function startLiveSession() {
  S.liveSession = {startTime: Date.now(), dayIdx: S.selDay, paused: false, pausedAt: 0, totalPaused: 0};
  save();
  updateLiveBanner();
  liveInterval = setInterval(updateLiveBanner, 1000);
  // Keep screen on
  requestWakeLock();
  haptic([50, 100, 50]);
  showToast('🔴 MODO ENTRENAMIENTO ACTIVADO');
}

function stopLiveSession() {
  const duration = getLiveTime();
  clearInterval(liveInterval);
  liveInterval = null;
  releaseWakeLock();
  // Guardar sesión
  saveSession(S.liveSession.dayIdx, Math.round(duration / 60));
  showSessionSummary(duration);
  S.liveSession = null;
  save();
  document.getElementById('liveBanner').classList.remove('active');
}

function toggleLivePause() {
  if (!S.liveSession) return;
  if (S.liveSession.paused) {
    S.liveSession.totalPaused += Date.now() - S.liveSession.pausedAt;
    S.liveSession.paused = false;
  } else {
    S.liveSession.pausedAt = Date.now();
    S.liveSession.paused = true;
  }
  save();
  updateLiveBanner();
}

function getLiveTime() {
  if (!S.liveSession) return 0;
  let elapsed = Date.now() - S.liveSession.startTime - (S.liveSession.totalPaused || 0);
  if (S.liveSession.paused) elapsed -= (Date.now() - S.liveSession.pausedAt);
  return Math.max(0, Math.floor(elapsed / 1000));
}

function updateLiveBanner() {
  const banner = document.getElementById('liveBanner');
  if (!S.liveSession) { banner.classList.remove('active'); return; }
  banner.classList.add('active');
  const sec = getLiveTime();
  const m = Math.floor(sec / 60), s = sec % 60;
  const day = DAYS[S.liveSession.dayIdx];
  document.getElementById('liveTimeDisp').textContent = `${m}:${s.toString().padStart(2,'0')}`;
  document.getElementById('liveInfoDisp').textContent = day ? day.name : 'SESIÓN';
  document.getElementById('livePauseBtn').textContent = S.liveSession.paused ? '▶ REANUDAR' : '⏸ PAUSAR';
}

async function requestWakeLock() {
  try { if ('wakeLock' in navigator) wakelock = await navigator.wakeLock.request('screen'); } catch(e) {}
}
function releaseWakeLock() {
  try { if (wakelock) { wakelock.release(); wakelock = null; } } catch(e) {}
}

function showSessionSummary(durationSec) {
  const vol = calcCurrentVolume();
  const mins = Math.round(durationSec / 60);
  const day = DAYS[S.selDay];
  const completed = day ? day.exercises.filter(ex => S.doneEx[ex.name + S.week]).length : 0;
  const total = day ? day.exercises.length : 0;
  const cal = estimateCalories(mins, vol);

  launchConfetti();

  const modal = document.getElementById('wkModal');
  const content = modal.querySelector('.modal-box') || modal.children[0];
  content.innerHTML = `
    <div class="modal-title" style="text-align:center">🏆 SESIÓN COMPLETADA</div>
    <div class="session-summary">
      <div class="sg" style="margin:16px 0">
        <div class="sc2"><div class="slb">VOLUMEN TOTAL</div><div class="sv">${vol.toLocaleString()}</div><div class="sb">kg total</div></div>
        <div class="sc2"><div class="slb">DURACIÓN</div><div class="sv bl">${mins}</div><div class="sb">minutos</div></div>
        <div class="sc2"><div class="slb">EJERCICIOS</div><div class="sv gd">${completed}/${total}</div><div class="sb">completados</div></div>
        <div class="sc2"><div class="slb">CALORÍAS</div><div class="sv ac">${cal}</div><div class="sb">kcal quemadas</div></div>
      </div>
      <div style="font-size:12px;color:var(--txt2);margin-bottom:16px">${MOTIV[Math.floor(Math.random()*MOTIV.length)]}</div>
      <button class="btn-primary" style="width:100%" onclick="closeWkModal()">¡GENIAL! 💪</button>
    </div>`;
  modal.style.display = 'flex';
}

// ── STATS RENDERING ──
function renderStats() {
  const container = document.getElementById('statsContent');
  if (!container) return;

  const vol = calcCurrentVolume();
  const sessions = S.sessions || [];
  const totalSessions = sessions.length;

  // PRs
  const prs = Object.entries(S.prs || {}).map(([name, kg]) => ({name, kg})).sort((a,b) => b.kg - a.kg);

  let html = `
    <div class="streak-banner">
      <div class="streak-num">🔥 ${S.streak || 0}</div>
      <div class="streak-lbl">DÍAS DE RACHA</div>
    </div>
    <div class="sg">
      <div class="sc2"><div class="slb">SESIONES TOTALES</div><div class="sv">${totalSessions}</div><div class="sb">entrenamientos</div></div>
      <div class="sc2"><div class="slb">VOLUMEN HOY</div><div class="sv bl">${vol.toLocaleString()}</div><div class="sb">kg</div></div>
    </div>`;

  if (prs.length > 0) {
    html += `<div class="pg-sub" style="margin-top:6px">🏆 RÉCORDS PERSONALES</div>`;
    prs.forEach(pr => {
      html += `<div class="pr-card"><div class="pr-icon">🏆</div><div class="pr-info"><div class="pr-name">${pr.name}</div><div class="pr-sub">Peso máximo registrado</div></div><div class="pr-val">${pr.kg}kg</div></div>`;
    });
  }

  // Gráfica de progreso por ejercicio (últimas sesiones)
  html += `<div class="cw" style="margin-top:14px"><div class="ct">📈 PROGRESO POR EJERCICIO</div><canvas id="exProgressChart" height="200"></canvas></div>`;

  // Advanced Metrics
  html += `<div class="pg-sub" style="margin-top:20px">⚡ MÉTRICAS AVANZADAS</div>`;
  html += renderAdvancedMetrics();

  container.innerHTML = html;

  // Dibujar gráficas si hay datos
  setTimeout(() => { renderExProgressChart(); renderVolumeChart(); }, 100);
}

function renderExProgressChart() {
  const canvas = document.getElementById('exProgressChart');
  if (!canvas || !S.sessions.length) return;

  // Obtener datos de Press Banca, Sentadilla, y Peso Muerto
  const tracked = ['Press de Banca con Barra','Sentadilla con Barra (Back Squat)','Peso Muerto Rumano con Barra'];
  const colors = ['#ff3a5c','#3a9fff','#00d68f'];
  const labels = [];
  const datasets = tracked.map((name, idx) => ({label:name.split(' ').slice(0,3).join(' '),data:[],borderColor:colors[idx],backgroundColor:colors[idx]+'22',pointRadius:4,tension:.3,fill:false}));

  S.sessions.slice(-12).forEach((ses, i) => {
    labels.push(`S${i+1}`);
    tracked.forEach((name, idx) => {
      const ex = ses.exercises.find(e => e.name === name);
      const maxKg = ex ? Math.max(...ex.sets.map(s => s.kg || 0)) : null;
      datasets[idx].data.push(maxKg);
    });
  });

  if (window._exChart) window._exChart.destroy();
  window._exChart = new Chart(canvas, {
    type:'line',data:{labels,datasets},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#7070a0',font:{size:9}}}},
      scales:{
        x:{ticks:{color:'#7070a0',font:{size:9}},grid:{color:'#2a2a3a'}},
        y:{ticks:{color:'#7070a0',font:{size:9}},grid:{color:'#2a2a3a'}}
      }
    }
  });
}

// ── DIARY RENDERING ──
function renderDiary() {
  const container = document.getElementById('diaryContent');
  if (!container) return;

  const sessions = [...(S.sessions || [])].reverse();
  if (sessions.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--mut);font-size:12px"><div style="font-size:48px;margin-bottom:10px">📝</div>Completa entrenamientos para ver tu diario aquí</div>';
    return;
  }

  container.innerHTML = sessions.map((ses, i) => `
    <div class="diary-session" id="diary${i}">
      <div class="diary-header" onclick="document.getElementById('diary${i}').classList.toggle('open')">
        <div><div class="diary-date">${ses.dayName}</div><div class="diary-meta">${ses.date} · Semana ${ses.week} · ${ses.duration||0}min</div></div>
        <div class="diary-vol">${ses.volume.toLocaleString()}kg</div>
      </div>
      <div class="diary-body">
        ${ses.exercises.map(ex => `
          <div class="diary-ex-row">
            <span>${ex.name}</span>
            <span style="font-family:var(--fm);font-size:10px;color:var(--mut)">${ex.sets.map(s=>s.reps?s.kg+'×'+s.reps:'—').join(' · ')}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

// ── LIBRARY RENDERING ──
let libFilter = 'Todos';
function renderLibrary() {
  const container = document.getElementById('libraryContent');
  if (!container) return;

  const filtered = libFilter === 'Todos' ? EXERCISE_LIB : EXERCISE_LIB.filter(e => e.muscle === libFilter || (e.secondary && e.secondary.includes(libFilter)));

  let html = `<input type="text" class="lib-search" id="libSearchInput" placeholder="🔍 Buscar ejercicio..." oninput="filterLib(this.value)">
    <div class="muscle-filters" id="muscleFilters">${MUSCLE_GROUPS.map(m => `<button class="mf-btn ${m===libFilter?'active':''}" onclick="setLibFilter('${m}')">${m}</button>`).join('')}</div>
    <div id="libResults">`;

  filtered.forEach((ex, i) => {
    const imgData = IMG[ex.name];
    html += `
      <div class="lib-card" id="lib${i}">
        <div class="lib-card-header" onclick="document.getElementById('lib${i}').classList.toggle('open')">
          <div style="flex:1"><div class="en2">${ex.name}</div><div class="em">${ex.muscle}${ex.secondary.length?' · '+ex.secondary.join(', '):''}</div></div>
          <div class="ea">›</div>
        </div>
        <div class="lib-card-body">
          ${imgData?`<div class="img-wrap" style="margin-bottom:10px"><img src="${imgData.url}" alt="${ex.name}" loading="lazy" onerror="this.parentElement.style.display='none'"><div class="img-cap">${imgData.cap}</div></div>`:''}
          <div style="font-size:12px;color:var(--txt2);line-height:1.6;margin-bottom:10px">${ex.desc}</div>
          <div style="margin-bottom:8px">${[ex.muscle,...ex.secondary].map(m=>`<span class="lib-muscle-tag">${m}</span>`).join('')}</div>
          <div class="gb"><strong>❌ Errores comunes:</strong><br>${ex.errors.map(e=>'• '+e).join('<br>')}</div>
          <div class="wb">💡 <strong>Consejo:</strong> ${ex.tip}</div>
        </div>
      </div>`;
  });

  html += '</div>';
  container.innerHTML = html;
}

function setLibFilter(m) { libFilter = m; renderLibrary(); haptic(10); }
function filterLib(q) {
  const items = document.querySelectorAll('.lib-card');
  items.forEach(el => {
    const name = el.querySelector('.en2')?.textContent?.toLowerCase() || '';
    el.style.display = name.includes(q.toLowerCase()) ? '' : 'none';
  });
}

// ── MACROS CALCULATOR ──
function renderCalc() {
  const container = document.getElementById('calcContent');
  if (!container) return;
  const m = calcMacros(S.bw);

  container.innerHTML = `
    <div class="calc-input-row"><div class="calc-label">PESO (KG)</div><input type="number" class="calc-field" id="calcWeight" value="${S.bw}" step="0.5" oninput="updateCalc()"></div>
    <div class="calc-input-row"><div class="calc-label">OBJETIVO (KG)</div><input type="number" class="calc-field" id="calcGoal" value="${S.goalWeight}" step="0.5" oninput="updateCalc()"></div>
    <div id="calcResults"></div>`;
  updateCalc();
}

function updateCalc() {
  const w = parseFloat(document.getElementById('calcWeight')?.value) || S.bw;
  const g = parseFloat(document.getElementById('calcGoal')?.value) || S.goalWeight;
  const m = calcMacros(w);
  const diff = g - w;
  const months = diff > 0 ? Math.ceil(diff / 1.5) : 0; // ~1.5 kg/mes ganancia limpia

  document.getElementById('calcResults').innerHTML = `
    <div class="calc-result-box">
      <div class="calc-result-title">📊 TUS MACROS RECOMENDADOS</div>
      <div class="calc-macro-row kcal"><span class="name">Calorías diarias</span><span class="val">${m.kcal} kcal</span></div>
      <div class="calc-macro-row prot"><span class="name">Proteína</span><span class="val">${m.prot}g</span></div>
      <div class="calc-macro-row carb"><span class="name">Carbohidratos</span><span class="val">${m.carb}g</span></div>
      <div class="calc-macro-row fat"><span class="name">Grasas</span><span class="val">${m.fat}g</span></div>
    </div>
    ${diff > 0 ? `<div class="tip">📈 Para llegar a <strong>${g}kg</strong> desde ${w}kg te faltan <strong>${diff.toFixed(1)}kg</strong>. A ritmo saludable (~1.5 kg/mes sin grasa excesiva), lo lograrías en <strong>~${months} meses</strong> manteniendo superávit calórico.</div>` : ''}`;
}

// ── EXPORT / SHARE ──
function renderShareCard() {
  const container = document.getElementById('shareContent');
  if (!container) return;
  const m = calcMacros(S.bw);
  const goalPct = Math.min(100, ((S.bw - 50.5) / (S.goalWeight - 50.5) * 100)).toFixed(0);

  container.innerHTML = `
    <div class="share-card" id="shareCardEl">
      <div class="share-card-header"><div class="share-card-logo">GYM<span>TRACK</span></div><div class="share-card-date">Semana ${S.week} · ${todayStr()}</div></div>
      <div class="share-stat-grid">
        <div class="share-stat"><div class="val" style="color:var(--grn)">${S.bw}kg</div><div class="lbl">PESO ACTUAL</div></div>
        <div class="share-stat"><div class="val" style="color:var(--gld)">${S.goalWeight}kg</div><div class="lbl">OBJETIVO</div></div>
        <div class="share-stat"><div class="val" style="color:var(--acc)">${S.streak||0}🔥</div><div class="lbl">RACHA</div></div>
        <div class="share-stat"><div class="val" style="color:var(--blu)">${goalPct}%</div><div class="lbl">PROGRESO</div></div>
      </div>
      ${Object.entries(S.prs||{}).slice(0,3).map(([n,kg])=>`<div style="font-family:var(--fm);font-size:11px;color:var(--mut);padding:3px 0">🏆 ${n.split(' ').slice(0,3).join(' ')}: <span style="color:var(--gld)">${kg}kg</span></div>`).join('')}
    </div>
    <button class="share-btn" onclick="shareProgress()">📤 COMPARTIR PROGRESO</button>
    <p style="font-size:10px;color:var(--mut);text-align:center;margin-top:8px;font-family:var(--fm)">Se genera una imagen para compartir</p>`;
}

async function shareProgress() {
  const card = document.getElementById('shareCardEl');
  if (!card) return;

  try {
    // Usar canvas para exportar
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // Fondo
    const grad = ctx.createLinearGradient(0,0,400,320);
    grad.addColorStop(0,'#12121a'); grad.addColorStop(1,'#1a0a2a');
    ctx.fillStyle = grad; ctx.fillRect(0,0,400,320);

    // Borde
    ctx.strokeStyle = 'rgba(255,58,92,.5)'; ctx.lineWidth = 2;
    ctx.roundRect(2,2,396,316,16); ctx.stroke();

    // Logo
    ctx.font = '700 28px "Bebas Neue", sans-serif'; ctx.fillStyle = '#f0f0f8';
    ctx.fillText('GYM', 20, 40); ctx.fillStyle = '#ff3a5c'; ctx.fillText('TRACK', 72, 40);

    // Fecha
    ctx.font = '400 11px "JetBrains Mono", monospace'; ctx.fillStyle = '#7070a0';
    ctx.fillText(`Semana ${S.week} · ${todayStr()}`, 20, 60);

    // Stats
    ctx.font = '700 32px "Bebas Neue", sans-serif';
    ctx.fillStyle = '#00d68f'; ctx.fillText(`${S.bw}kg`, 30, 110);
    ctx.fillStyle = '#ffd700'; ctx.fillText(`${S.goalWeight}kg`, 220, 110);
    ctx.font = '400 10px monospace'; ctx.fillStyle = '#7070a0';
    ctx.fillText('PESO ACTUAL', 30, 125); ctx.fillText('OBJETIVO', 220, 125);

    ctx.font = '700 32px "Bebas Neue", sans-serif';
    ctx.fillStyle = '#ff3a5c'; ctx.fillText(`${S.streak||0}🔥`, 30, 175);
    ctx.fillStyle = '#3a9fff';
    const pct = Math.min(100, ((S.bw-50.5) / (S.goalWeight-50.5) * 100)).toFixed(0);
    ctx.fillText(`${pct}%`, 220, 175);
    ctx.font = '400 10px monospace'; ctx.fillStyle = '#7070a0';
    ctx.fillText('RACHA', 30, 190); ctx.fillText('PROGRESO', 220, 190);

    // PRs
    let y = 220;
    ctx.font = '400 12px monospace';
    Object.entries(S.prs||{}).slice(0,3).forEach(([n,kg]) => {
      ctx.fillStyle = '#7070a0'; ctx.fillText(`🏆 ${n.split(' ').slice(0,3).join(' ')}:`, 30, y);
      ctx.fillStyle = '#ffd700'; ctx.fillText(`${kg}kg`, 280, y);
      y += 22;
    });

    // Watermark
    ctx.font = '400 10px monospace'; ctx.fillStyle = 'rgba(112,112,160,.5)';
    ctx.fillText('gymtrack.app', 150, 305);

    canvas.toBlob(async blob => {
      if (navigator.share) {
        const file = new File([blob], 'gymtrack-progress.png', {type:'image/png'});
        try {
          await navigator.share({title:'Mi progreso en GymTrack',files:[file]});
        } catch(e) {
          downloadBlob(blob);
        }
      } else {
        downloadBlob(blob);
      }
    },'image/png');
  } catch(e) {
    showToast('❌ Error al compartir', true);
  }
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gymtrack-progress.png';
  a.click(); URL.revokeObjectURL(url);
  showToast('📥 Imagen descargada');
}

// ── NOTIFICATIONS ──
function setupNotifications() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    document.getElementById('notifBanner').style.display = 'flex';
  }
}

async function reqNotif() {
  const p = await Notification.requestPermission();
  document.getElementById('notifBanner').style.display = 'none';
  if (p === 'granted') {
    S.notifsEnabled = true; save();
    showToast('🔔 RECORDATORIOS ACTIVADOS');
    new Notification('GymTrack 💪', {body:'¡Listo! Te recordaré entrenar.', icon:'icon-192.png'});
  }
}

// ── SETTINGS ──
function renderSettings() {
  const container = document.getElementById('settingsContent');
  if (!container) return;

  container.innerHTML = `
    <div class="settings-section-title">🔑 API KEY DE GEMINI (ESCÁNER IA)</div>
    <div class="api-notice">Necesitas una API Key de Google AI Studio para usar el escáner de comida. <a href="https://aistudio.google.com/app/apikey" target="_blank">Obtener API Key gratis →</a></div>
    <input type="text" class="api-input" id="apiKeyInput" value="${S.apiKey}" placeholder="AIzaSy...">
    <button class="api-save-btn" onclick="saveApiKey()">GUARDAR API KEY</button>

    <div class="settings-section-title">👤 DATOS PERSONALES</div>
    <div class="calc-input-row"><div class="calc-label">PESO (KG)</div><input type="number" class="calc-field" id="settWeight" value="${S.bw}" step="0.1"></div>
    <div class="calc-input-row"><div class="calc-label">ALTURA (CM)</div><input type="number" class="calc-field" id="settHeight" value="${S.height}"></div>
    <div class="calc-input-row"><div class="calc-label">OBJETIVO (KG)</div><input type="number" class="calc-field" id="settGoal" value="${S.goalWeight}" step="0.5"></div>
    <button class="sbtn" style="width:100%;margin-top:4px" onclick="saveSettings()">GUARDAR DATOS</button>

    <div class="settings-section-title">🔔 NOTIFICACIONES</div>
    <div class="notif-row"><span>Recordatorios diarios</span><label class="toggle-sw"><input type="checkbox" ${S.notifsEnabled?'checked':''} onchange="S.notifsEnabled=this.checked;save()"><span class="toggle-sl"></span></label></div>

    <div class="settings-section-title" style="margin-top:24px">⚠️ ZONA PELIGROSA</div>
    <button class="btn-danger" style="width:100%" onclick="if(confirm('¿Borrar TODOS los datos?')){localStorage.clear();location.reload()}">BORRAR TODOS LOS DATOS</button>`;
}

function saveApiKey() {
  S.apiKey = document.getElementById('apiKeyInput').value.trim();
  save(); showToast('🔑 API Key guardada'); haptic(20);
}

function saveSettings() {
  const w = parseFloat(document.getElementById('settWeight').value);
  const h = parseInt(document.getElementById('settHeight').value);
  const g = parseFloat(document.getElementById('settGoal').value);
  if (w > 30) S.bw = w;
  if (h > 100) S.height = h;
  if (g > 30) S.goalWeight = g;
  save(); showToast('✅ Datos guardados'); haptic(20);
}
