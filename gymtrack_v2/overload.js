// =====================================
// GYMTRACK — SOBRECARGA PROGRESIVA AUTO
// + Métricas Avanzadas de Entrenamiento
// =====================================

// ── CALCULAR PESO SUGERIDO ──
function getSuggestedWeight(exerciseName, currentWeight, targetReps, actualReps) {
  // Regla: Si en TODAS las series alcanzó todas las reps objetivo → +2.5kg
  // Si falló reps → mantener peso
  // Si superó por mucho → +5kg
  if (!currentWeight || currentWeight <= 0) return currentWeight;
  
  const repStr = String(targetReps);
  const maxTarget = parseInt(repStr.split('–').pop()) || parseInt(repStr) || 8;
  
  if (actualReps >= maxTarget + 3) return currentWeight + 5;    // Superó con creces
  if (actualReps >= maxTarget) return currentWeight + 2.5;       // Alcanzó objetivo
  if (actualReps >= maxTarget - 2) return currentWeight;         // Cerca, mantener
  return Math.max(0, currentWeight - 2.5);                       // Muy lejos, bajar
}

// ── GUARDAR HISTORIAL DE SOBRECARGA ──
function recordOverload(exerciseName, kg, reps) {
  if (!S.overloadHistory[exerciseName]) S.overloadHistory[exerciseName] = [];
  S.overloadHistory[exerciseName].push({
    week: S.week,
    kg: kg,
    reps: reps,
    date: todayStr()
  });
  // Máximo 52 registros por ejercicio (1 año)
  if (S.overloadHistory[exerciseName].length > 52) {
    S.overloadHistory[exerciseName] = S.overloadHistory[exerciseName].slice(-52);
  }
  save();
}

// ── OBTENER SUGERENCIA DE PESO PARA MOSTRAR ──
function getOverloadSuggestion(exerciseName) {
  const history = S.overloadHistory[exerciseName];
  if (!history || history.length < 2) return null;
  
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  
  const diff = last.kg - prev.kg;
  if (diff > 0) return {type: 'up', msg: `↑ +${diff}kg vs anterior`, color: 'var(--grn)'};
  if (diff < 0) return {type: 'down', msg: `↓ ${diff}kg vs anterior`, color: 'var(--acc)'};
  return {type: 'same', msg: '= Mismo peso que anterior', color: 'var(--mut)'};
}

// ── MÉTRICAS AVANZADAS ──  
function calcAdvancedMetrics() {
  const sessions = S.sessions || [];
  if (sessions.length === 0) return null;
  
  // Últimas 4 semanas
  const recent = sessions.slice(-20);
  
  // Volumen total semanal
  const weeklyVolumes = {};
  recent.forEach(ses => {
    const weekKey = 'S' + ses.week;
    if (!weeklyVolumes[weekKey]) weeklyVolumes[weekKey] = 0;
    weeklyVolumes[weekKey] += ses.volume;
  });
  
  // Volumen por grupo muscular
  const muscleVolume = {};
  recent.forEach(ses => {
    ses.exercises.forEach(ex => {
      // Buscar músculos en la rutina
      const dayData = DEF.find(d => d && d.exercises.find(e => e.name === ex.name));
      if (dayData) {
        const exData = dayData.exercises.find(e => e.name === ex.name);
        if (exData && exData.muscles) {
          const vol = ex.sets.reduce((sum, s) => sum + (s.kg * s.reps), 0);
          exData.muscles.forEach(m => {
            if (!muscleVolume[m]) muscleVolume[m] = 0;
            muscleVolume[m] += vol;
          });
        }
      }
    });
  });
  
  // Frecuencia semanal (sesiones por semana)
  const weeksSet = new Set(recent.map(s => s.week));
  const avgFrequency = (recent.length / Math.max(1, weeksSet.size)).toFixed(1);
  
  // Intensidad media (% del PR)
  let intensitySum = 0, intensityCount = 0;
  recent.forEach(ses => {
    ses.exercises.forEach(ex => {
      const pr = S.prs[ex.name];
      if (pr) {
        const maxKg = Math.max(...ex.sets.map(s => s.kg || 0));
        if (maxKg > 0) {
          intensitySum += (maxKg / pr) * 100;
          intensityCount++;
        }
      }
    });
  });
  const avgIntensity = intensityCount > 0 ? Math.round(intensitySum / intensityCount) : 0;
  
  // Progresión de volumen
  const volValues = Object.values(weeklyVolumes);
  let volumeTrend = 'stable';
  if (volValues.length >= 2) {
    const lastTwo = volValues.slice(-2);
    if (lastTwo[1] > lastTwo[0] * 1.05) volumeTrend = 'up';
    else if (lastTwo[1] < lastTwo[0] * 0.95) volumeTrend = 'down';
  }
  
  // Fatiga estimada (basada en volumen relativo)
  const avgVolume = volValues.reduce((a, b) => a + b, 0) / Math.max(1, volValues.length);
  const lastVolume = volValues[volValues.length - 1] || 0;
  const fatigueIndex = avgVolume > 0 ? Math.min(100, Math.round((lastVolume / avgVolume) * 70)) : 50;
  
  return {
    weeklyVolumes,
    muscleVolume,
    avgFrequency,
    avgIntensity,
    volumeTrend,
    fatigueIndex,
    totalSessions: sessions.length,
    totalVolume: sessions.reduce((sum, s) => sum + s.volume, 0)
  };
}

// ── RENDER MÉTRICAS AVANZADAS ──
function renderAdvancedMetrics() {
  const m = calcAdvancedMetrics();
  if (!m) return '<div style="text-align:center;padding:30px;color:var(--mut);font-size:12px">Completa entrenamientos para ver métricas avanzadas</div>';
  
  const trendIcon = m.volumeTrend === 'up' ? '📈' : m.volumeTrend === 'down' ? '📉' : '➡️';
  const trendColor = m.volumeTrend === 'up' ? 'var(--grn)' : m.volumeTrend === 'down' ? 'var(--acc)' : 'var(--mut)';
  
  let html = `
    <div class="sg">
      <div class="sc2"><div class="slb">FRECUENCIA</div><div class="sv bl">${m.avgFrequency}</div><div class="sb">sesiones/semana</div></div>
      <div class="sc2"><div class="slb">INTENSIDAD</div><div class="sv ac">${m.avgIntensity}%</div><div class="sb">% del PR medio</div></div>
      <div class="sc2"><div class="slb">TENDENCIA ${trendIcon}</div><div class="sv" style="color:${trendColor};font-size:20px">${m.volumeTrend === 'up' ? 'SUBIENDO' : m.volumeTrend === 'down' ? 'BAJANDO' : 'ESTABLE'}</div><div class="sb">volumen semanal</div></div>
      <div class="sc2"><div class="slb">FATIGA</div>
        <div class="pbw" style="margin-top:8px"><div class="pb" style="width:${m.fatigueIndex}%;background:${m.fatigueIndex > 80 ? 'var(--acc)' : m.fatigueIndex > 60 ? 'var(--gld)' : 'var(--grn)'}"></div></div>
        <div class="sb">${m.fatigueIndex}% — ${m.fatigueIndex > 80 ? 'Considera deload' : m.fatigueIndex > 60 ? 'Normal' : 'Recuperado'}</div>
      </div>
    </div>`;
  
  // Volumen por músculo
  const muscles = Object.entries(m.muscleVolume).sort((a, b) => b[1] - a[1]);
  if (muscles.length > 0) {
    const maxVol = muscles[0][1];
    html += '<div class="pg-sub" style="margin-top:10px">💪 VOLUMEN POR MÚSCULO (últimas sesiones)</div>';
    muscles.forEach(([muscle, vol]) => {
      const pct = Math.min(100, (vol / maxVol) * 100);
      html += `
        <div class="muscle-vol-row">
          <div class="mvr-name">${muscle}</div>
          <div class="mvr-bar-wrap"><div class="mvr-bar" style="width:${pct}%"></div></div>
          <div class="mvr-val">${vol.toLocaleString()}kg</div>
        </div>`;
    });
  }
  
  // Charts de volumen semanal
  html += `<div class="cw" style="margin-top:14px"><div class="ct">📊 VOLUMEN POR SEMANA</div><canvas id="volumeWeeklyChart" height="180"></canvas></div>`;
  
  return html;
}

function renderVolumeChart() {
  const m = calcAdvancedMetrics();
  if (!m) return;
  const canvas = document.getElementById('volumeWeeklyChart');
  if (!canvas) return;
  
  const labels = Object.keys(m.weeklyVolumes);
  const data = Object.values(m.weeklyVolumes);
  
  if (window._volChart) window._volChart.destroy();
  window._volChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Volumen (kg)',
        data,
        backgroundColor: 'rgba(0, 255, 163, 0.3)',
        borderColor: '#00ffa3',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {legend: {display: false}},
      scales: {
        x: {ticks: {color: '#687083', font: {size: 10}}, grid: {display: false}},
        y: {ticks: {color: '#687083', font: {size: 10}}, grid: {color: 'rgba(255,255,255,0.05)'}}
      }
    }
  });
}
