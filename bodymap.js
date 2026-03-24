// =====================================
// GYMTRACK — MAPA CORPORAL + FOTOS
// SVG Body Map Heatmap + Photo Gallery
// =====================================

// ── SVG BODY MAP DATA ──
const BODY_MUSCLES = {
  'Pecho':          {x:145, y:120, w:70, h:35, side:'front'},
  'Pecho Superior': {x:145, y:108, w:70, h:18, side:'front'},
  'Deltoides':      {x:115, y:98,  w:30, h:30, side:'front'},
  'Deltoides Ant.': {x:115, y:98,  w:25, h:25, side:'front'},
  'Deltoides Lateral':{x:108,y:98, w:20, h:25, side:'front'},
  'Bíceps':         {x:108, y:140, w:22, h:40, side:'front'},
  'Tríceps':        {x:108, y:140, w:22, h:40, side:'back'},
  'Antebrazo':      {x:100, y:185, w:18, h:35, side:'front'},
  'Core':           {x:148, y:160, w:60, h:45, side:'front'},
  'Recto Abdominal':{x:148, y:160, w:55, h:40, side:'front'},
  'Abdominales':    {x:148, y:160, w:55, h:40, side:'front'},
  'Oblicuos':       {x:130, y:165, w:20, h:35, side:'front'},
  'Cuádriceps':     {x:130, y:218, w:35, h:65, side:'front'},
  'Isquios':        {x:130, y:218, w:35, h:55, side:'back'},
  'Glúteos':        {x:140, y:200, w:60, h:35, side:'back'},
  'Gemelos':        {x:132, y:290, w:28, h:45, side:'back'},
  'Sóleo':          {x:132, y:300, w:28, h:35, side:'back'},
  'Espalda':        {x:145, y:120, w:70, h:50, side:'back'},
  'Dorsal':         {x:140, y:135, w:75, h:40, side:'back'},
  'Trapecio':       {x:145, y:85,  w:65, h:30, side:'back'},
  'Romboides':      {x:148, y:115, w:55, h:30, side:'back'},
  'Espalda Baja':   {x:148, y:175, w:55, h:25, side:'back'},
  'Manguito Rotador':{x:120,y:100, w:25, h:25, side:'back'},
  'Deltoides Posterior':{x:108,y:98,w:20,h:25, side:'back'},
  'Flexores de Cadera':{x:140,y:205,w:40,h:20,side:'front'},
  'Cardio':         {x:148, y:125, w:30, h:25, side:'front'}
};

// ── CALCULAR VOLUMEN POR MÚSCULO ──
function calcMuscleVolumes() {
  const sessions = S.sessions || [];
  const recent = sessions.slice(-8); // Últimas ~2 semanas
  const volumes = {};

  recent.forEach(ses => {
    ses.exercises.forEach(ex => {
      // Buscar músculos del ejercicio
      let muscles = [];
      const allExercises = [...(DEF || []).filter(Boolean).flatMap(d => d.exercises), ...HOME_EXERCISES, ...CALISTHENICS_EXERCISES];
      const exData = allExercises.find(e => e.name === ex.name);
      if (exData && exData.muscles) muscles = exData.muscles;

      const vol = ex.sets.reduce((sum, s) => sum + ((s.kg || 1) * (s.reps || 0)), 0);
      muscles.forEach(m => {
        if (!volumes[m]) volumes[m] = 0;
        volumes[m] += vol;
      });
    });
  });

  S.muscleVolume = volumes;
  save();
  return volumes;
}

// ── OBTENER COLOR SEGÚN VOLUMEN ──
function getHeatColor(volume, maxVolume) {
  if (!volume || volume === 0) return 'rgba(255,255,255,0.05)';
  const intensity = Math.min(1, volume / Math.max(1, maxVolume));
  if (intensity > 0.7) return `rgba(0, 255, 163, ${0.3 + intensity * 0.5})`; // Verde
  if (intensity > 0.4) return `rgba(255, 215, 0, ${0.2 + intensity * 0.5})`; // Amarillo
  return `rgba(255, 42, 95, ${0.15 + intensity * 0.4})`; // Rojo (poco trabajado)
}

// ── RENDER SVG BODY MAP ──
function renderBodyMap() {
  const volumes = calcMuscleVolumes();
  const maxVol = Math.max(1, ...Object.values(volumes));

  const frontMuscles = Object.entries(BODY_MUSCLES).filter(([_, d]) => d.side === 'front');
  const backMuscles = Object.entries(BODY_MUSCLES).filter(([_, d]) => d.side === 'back');

  const renderSide = (muscles, label) => {
    let rects = '';
    muscles.forEach(([name, pos]) => {
      const vol = volumes[name] || 0;
      const color = getHeatColor(vol, maxVol);
      rects += `<rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" rx="6" 
        fill="${color}" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"
        class="body-muscle" data-muscle="${name}" data-vol="${vol}">
        <title>${name}: ${vol.toLocaleString()}kg vol.</title>
      </rect>`;
    });

    return `
      <div class="bodymap-side">
        <div class="bodymap-label">${label}</div>
        <svg viewBox="70 60 220 310" class="bodymap-svg">
          <!-- Silueta -->
          <ellipse cx="178" cy="75" rx="22" ry="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
          <rect x="130" y="98" width="96" height="110" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          <rect x="100" y="103" width="30" height="100" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <rect x="226" y="103" width="30" height="100" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1" transform="scale(-1,1) translate(-356,0)"/>
          <rect x="135" y="205" width="35" height="110" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <rect x="186" y="205" width="35" height="110" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          ${rects}
        </svg>
      </div>`;
  };

  return renderSide(frontMuscles, 'FRONTAL') + renderSide(backMuscles, 'POSTERIOR');
}

// ── RENDER PÁGINA BODY MAP ──
function renderBodyMapPage() {
  const container = document.getElementById('bodymapContent');
  if (!container) return;

  const volumes = calcMuscleVolumes();
  const sorted = Object.entries(volumes).sort((a, b) => b[1] - a[1]);

  let html = `
    <div class="bodymap-container">
      ${renderBodyMap()}
    </div>

    <div class="bodymap-legend">
      <div class="legend-item"><div class="legend-color" style="background:rgba(0,255,163,0.6)"></div><span>Alto volumen</span></div>
      <div class="legend-item"><div class="legend-color" style="background:rgba(255,215,0,0.5)"></div><span>Medio</span></div>
      <div class="legend-item"><div class="legend-color" style="background:rgba(255,42,95,0.4)"></div><span>Bajo</span></div>
      <div class="legend-item"><div class="legend-color" style="background:rgba(255,255,255,0.05)"></div><span>Sin datos</span></div>
    </div>`;

  // Top músculos
  if (sorted.length > 0) {
    html += '<div class="pg-sub" style="margin-top:20px">📊 RANKING DE MÚSCULOS</div>';
    sorted.slice(0, 10).forEach(([muscle, vol], i) => {
      const pct = Math.min(100, (vol / Math.max(1, sorted[0][1])) * 100);
      html += `
        <div class="muscle-vol-row">
          <div class="mvr-rank">#${i + 1}</div>
          <div class="mvr-name">${muscle}</div>
          <div class="mvr-bar-wrap"><div class="mvr-bar" style="width:${pct}%"></div></div>
          <div class="mvr-val">${vol.toLocaleString()}kg</div>
        </div>`;
    });
  }

  // Fotos de progreso
  html += `
    <div class="pg-sub" style="margin-top:24px">📸 FOTOS DE PROGRESO</div>
    <div class="photo-actions">
      <button class="scan-btn" style="font-size:14px;padding:12px;background:linear-gradient(135deg,var(--pur),var(--blu))" onclick="openProgressPhoto()">📷 NUEVA FOTO</button>
      <input type="file" id="progressPhotoInput" accept="image/*" style="display:none" onchange="handleProgressPhoto(event)">
    </div>`;

  if (S.progressPhotos.length > 0) {
    html += '<div class="photo-gallery">';
    [...S.progressPhotos].reverse().forEach((photo, i) => {
      html += `
        <div class="photo-card">
          <img src="${photo.dataUrl}" alt="Progreso ${photo.date}" loading="lazy">
          <div class="photo-date">${photo.date}</div>
          ${photo.notes ? `<div class="photo-notes">${photo.notes}</div>` : ''}
        </div>`;
    });
    html += '</div>';
  } else {
    html += '<div style="text-align:center;padding:30px;color:var(--mut);font-size:12px;font-family:var(--fm)">Toma fotos regularmente para ver tu progreso visual</div>';
  }

  // Medidas corporales
  html += `
    <div class="pg-sub" style="margin-top:24px">📏 MEDIDAS CORPORALES</div>
    <div class="measurements-grid">
      ${['Pecho (cm)', 'Cintura (cm)', 'Cadera (cm)', 'Brazo D (cm)', 'Brazo I (cm)', 'Muslo D (cm)', 'Muslo I (cm)', 'Gemelo (cm)'].map(m => {
        const key = m.split(' ')[0].toLowerCase();
        return `
          <div class="measure-input-row">
            <div class="measure-label">${m}</div>
            <input type="number" class="calc-field" style="width:80px" value="${S.bodyMeasurements[key] || ''}" step="0.5" placeholder="—"
              onchange="S.bodyMeasurements['${key}']=parseFloat(this.value)||0;save()">
          </div>`;
      }).join('')}
    </div>
    <button class="sbtn" style="width:100%;margin-top:10px" onclick="saveMeasurements()">GUARDAR MEDIDAS</button>`;

  container.innerHTML = html;
}

// ── FOTOS DE PROGRESO ──
function openProgressPhoto() {
  const input = document.getElementById('progressPhotoInput');
  if (input) input.click();
}

function handleProgressPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  compressImage(file, 600, 0.7).then(base64 => {
    S.progressPhotos.push({
      date: todayStr(),
      dataUrl: base64,
      notes: '',
      type: 'front'
    });
    // Máximo 30 fotos
    if (S.progressPhotos.length > 30) S.progressPhotos = S.progressPhotos.slice(-30);
    save();
    renderBodyMapPage();
    showToast('📸 Foto de progreso guardada');
    haptic([50, 80]);
    checkAchievement('photos_5', S.progressPhotos.length >= 5);
  });
  event.target.value = '';
}

function saveMeasurements() {
  save();
  showToast('📏 Medidas guardadas');
  haptic(20);
}
