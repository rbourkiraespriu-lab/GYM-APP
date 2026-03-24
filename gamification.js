// =====================================
// GYMTRACK — SISTEMA DE GAMIFICACIÓN
// XP, Niveles, Rangos por Ejercicio
// =====================================

const RANKS = [
  {name:'Novato',      icon:'🥉', minXP:0,    color:'#687083'},
  {name:'Aprendiz',    icon:'🥈', minXP:100,  color:'#00e5ff'},
  {name:'Intermedio',  icon:'🥇', minXP:500,  color:'#00ffa3'},
  {name:'Avanzado',    icon:'💪', minXP:1500, color:'#ff6a00'},
  {name:'Élite',       icon:'⚡', minXP:4000, color:'#ff2a5f'},
  {name:'Leyenda',     icon:'👑', minXP:10000,color:'#ffd700'}
];

const LEVELS = [
  0, 50, 150, 300, 500, 750, 1100, 1500, 2000, 2600,
  3300, 4100, 5000, 6000, 7200, 8500, 10000, 12000, 14500, 17500,
  21000, 25000, 30000, 36000, 43000, 51000, 60000, 70000, 82000, 100000
];

const ACHIEVEMENTS_DEF = [
  {id:'first_workout', name:'Primera Sesión', icon:'🏋️', desc:'Completa tu primer entrenamiento'},
  {id:'streak_3', name:'Racha de 3', icon:'🔥', desc:'Entrena 3 días seguidos'},
  {id:'streak_7', name:'Semana Completa', icon:'💎', desc:'Entrena 7 días seguidos'},
  {id:'first_pr', name:'Primer PR', icon:'🏆', desc:'Consigue tu primer récord personal'},
  {id:'level_5', name:'Nivel 5', icon:'⭐', desc:'Alcanza el nivel 5'},
  {id:'level_10', name:'Nivel 10', icon:'🌟', desc:'Alcanza el nivel 10'},
  {id:'scan_food', name:'Nutricionista', icon:'📷', desc:'Escanea tu primera comida'},
  {id:'body_scan', name:'Análisis Corporal', icon:'🤖', desc:'Realiza tu primer escaneo corporal'},
  {id:'volume_10k', name:'10K Club', icon:'💪', desc:'Mueve 10.000 kg en una sesión'},
  {id:'elite_rank', name:'Rango Élite', icon:'⚡', desc:'Alcanza Élite en algún ejercicio'},
  {id:'legend_rank', name:'Leyenda', icon:'👑', desc:'Alcanza Leyenda en algún ejercicio'},
  {id:'photos_5', name:'Documentador', icon:'📸', desc:'Guarda 5 fotos de progreso'},
  {id:'sessions_10', name:'Constante', icon:'📊', desc:'Completa 10 sesiones'},
  {id:'sessions_50', name:'Máquina', icon:'🦾', desc:'Completa 50 sesiones'},
  {id:'mode_switch', name:'Versátil', icon:'🔄', desc:'Prueba todos los modos de entrenamiento'}
];

// ── GANAR XP ──
function earnXP(amount, reason) {
  S.xp += amount;
  // Check level up
  const oldLevel = S.level;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (S.xp >= LEVELS[i]) { S.level = i + 1; break; }
  }
  save();
  updateXPBar();
  if (S.level > oldLevel) {
    showToast(`🎉 ¡NIVEL ${S.level}! +${amount} XP`);
    haptic([100, 80, 100, 80, 200]);
    launchConfetti();
    checkAchievement('level_5', S.level >= 5);
    checkAchievement('level_10', S.level >= 10);
  } else if (amount >= 20) {
    showToast(`⚡ +${amount} XP · ${reason}`);
  }
}

// ── XP POR EJERCICIO ──
function earnExerciseXP(exerciseName, xpAmount) {
  if (!S.exerciseXP[exerciseName]) {
    S.exerciseXP[exerciseName] = {xp: 0, rank: 0, totalSets: 0, totalReps: 0, totalKg: 0};
  }
  const ex = S.exerciseXP[exerciseName];
  ex.xp += xpAmount;
  // Actualizar rango
  const oldRank = ex.rank;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (ex.xp >= RANKS[i].minXP) { ex.rank = i; break; }
  }
  save();
  if (ex.rank > oldRank) {
    const r = RANKS[ex.rank];
    showToast(`${r.icon} ¡RANGO ${r.name.toUpperCase()} en ${exerciseName.split(' ').slice(0,3).join(' ')}!`);
    haptic([50, 100, 50, 100, 200]);
    launchConfetti();
    checkAchievement('elite_rank', ex.rank >= 4);
    checkAchievement('legend_rank', ex.rank >= 5);
  }
}

// ── REGISTRAR STATS POR EJERCICIO ──
function trackExerciseStats(exerciseName, sets, reps, kg) {
  if (!S.exerciseXP[exerciseName]) {
    S.exerciseXP[exerciseName] = {xp: 0, rank: 0, totalSets: 0, totalReps: 0, totalKg: 0};
  }
  const ex = S.exerciseXP[exerciseName];
  ex.totalSets += sets;
  ex.totalReps += reps;
  ex.totalKg += kg;
  save();
}

// ── OBTENER RANGO ──
function getExRank(exerciseName) {
  const ex = S.exerciseXP[exerciseName];
  if (!ex) return RANKS[0];
  return RANKS[ex.rank] || RANKS[0];
}

function getExRankProgress(exerciseName) {
  const ex = S.exerciseXP[exerciseName];
  if (!ex) return 0;
  const currentRank = RANKS[ex.rank];
  const nextRank = RANKS[ex.rank + 1];
  if (!nextRank) return 100;
  return Math.min(100, ((ex.xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100);
}

// ── ACHIEVEMENTS ──
function checkAchievement(id, condition) {
  if (!condition) return;
  if (S.achievements.find(a => a.id === id)) return; // ya obtenido
  const def = ACHIEVEMENTS_DEF.find(a => a.id === id);
  if (!def) return;
  S.achievements.push({id, name: def.name, icon: def.icon, date: todayStr()});
  save();
  showToast(`🏅 LOGRO: ${def.icon} ${def.name}`);
  haptic([80, 60, 80, 60, 150]);
  earnXP(50, 'Logro desbloqueado');
}

// ── XP BAR EN HEADER ──
function updateXPBar() {
  const bar = document.getElementById('xpBarFill');
  const label = document.getElementById('xpLabel');
  if (!bar || !label) return;
  const currentLevelXP = LEVELS[S.level - 1] || 0;
  const nextLevelXP = LEVELS[S.level] || LEVELS[LEVELS.length - 1];
  const progress = Math.min(100, ((S.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
  bar.style.width = progress + '%';
  label.textContent = `Nv.${S.level} · ${S.xp} XP`;
}

// ── RENDER PÁGINA DE RANGOS ──
function renderRanks() {
  const container = document.getElementById('ranksContent');
  if (!container) return;

  // Header con nivel global
  const currentLevelXP = LEVELS[S.level - 1] || 0;
  const nextLevelXP = LEVELS[S.level] || LEVELS[LEVELS.length - 1];
  const globalProgress = Math.min(100, ((S.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

  let html = `
    <div class="rank-hero">
      <div class="rank-hero-level">${S.level}</div>
      <div class="rank-hero-title">NIVEL ${S.level}</div>
      <div class="rank-hero-xp">${S.xp.toLocaleString()} XP TOTAL</div>
      <div class="pbw" style="margin:12px 0 4px"><div class="pb" style="width:${globalProgress}%"></div></div>
      <div style="font-size:10px;color:var(--mut);font-family:var(--fm)">${Math.round(nextLevelXP - S.xp)} XP para nivel ${S.level + 1}</div>
    </div>

    <div class="pg-sub" style="margin-top:20px">🎖️ RANGOS POR EJERCICIO</div>`;

  // Ejercicios con XP ordenados
  const exEntries = Object.entries(S.exerciseXP).sort((a, b) => b[1].xp - a[1].xp);
  if (exEntries.length === 0) {
    html += '<div style="text-align:center;padding:30px;color:var(--mut);font-size:12px">Completa series para ganar XP en tus ejercicios</div>';
  } else {
    exEntries.forEach(([name, data]) => {
      const rank = RANKS[data.rank] || RANKS[0];
      const nextRank = RANKS[data.rank + 1];
      const progress = getExRankProgress(name);
      html += `
        <div class="rank-card">
          <div class="rank-card-icon" style="color:${rank.color}">${rank.icon}</div>
          <div class="rank-card-info">
            <div class="rank-card-name">${name.split(' ').slice(0,4).join(' ')}</div>
            <div class="rank-card-rank" style="color:${rank.color}">${rank.name}</div>
            <div class="pbw" style="height:5px;margin-top:4px"><div class="pb" style="width:${progress}%;background:${rank.color}"></div></div>
          </div>
          <div class="rank-card-xp">${data.xp} XP</div>
        </div>`;
    });
  }

  // Logros
  html += `<div class="pg-sub" style="margin-top:20px">🏅 LOGROS (${S.achievements.length}/${ACHIEVEMENTS_DEF.length})</div>`;
  ACHIEVEMENTS_DEF.forEach(ach => {
    const unlocked = S.achievements.find(a => a.id === ach.id);
    html += `
      <div class="achievement-card ${unlocked ? 'unlocked' : ''}">
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
        </div>
        ${unlocked ? '<div class="ach-date">'+unlocked.date+'</div>' : '<div class="ach-lock">🔒</div>'}
      </div>`;
  });

  container.innerHTML = html;
}
