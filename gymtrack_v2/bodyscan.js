// =====================================
// GYMTRACK — ESCANEO CORPORAL CON IA
// Análisis de composición corporal
// =====================================

// ── ABRIR CÁMARA PARA BODY SCAN ──
function openBodyScanner(fromGallery) {
  const input = document.getElementById('bodyCameraInput');
  if (!input) return;
  if (fromGallery) {
    input.removeAttribute('capture');
  } else {
    input.setAttribute('capture', 'environment');
  }
  input.click();
}

// ── PROCESAR IMAGEN CORPORAL ──
function handleBodyImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  compressImage(file, 800, 0.8).then(base64 => {
    showBodyPreview(base64);
    analyzeBodyWithAI(base64);
  });
  event.target.value = '';
}

// ── PREVIEW ──
function showBodyPreview(base64) {
  const container = document.getElementById('bodyScanResult');
  container.innerHTML = `
    <div class="preview-container" style="margin-bottom:12px">
      <img src="${base64}" alt="Escaneo corporal" style="max-height:300px">
      <div class="preview-overlay">
        <div class="analyzing-badge" style="background:var(--blu)">🤖 ANALIZANDO COMPOSICIÓN CORPORAL...</div>
      </div>
    </div>`;
}

// ── ANALIZAR CON GEMINI VISION ──
async function analyzeBodyWithAI(base64) {
  const apiKey = S.apiKey;
  if (!apiKey) {
    showBodyScanError('⚠️ Necesitas configurar tu API Key de Gemini. Ve a Ajustes.');
    return;
  }

  const imageData = base64.split(',')[1];

  const body = {
    contents: [{
      parts: [
        {
          text: `Eres un experto en fitness y composición corporal. Analiza la foto y devuelve EXACTAMENTE este formato JSON sin ningún texto adicional:
{
  "bodyFat": 15,
  "muscleMass": "media",
  "physique": "ectomorfo",
  "shoulders": "estrecha",
  "chest": "plano",
  "arms": "delgados",
  "core": "sin definir",
  "legs": "proporcionados",
  "symmetry": 70,
  "overall": "principiante con buen potencial",
  "recommendations": ["Aumentar volumen de pecho", "Más trabajo de hombros", "Subir calorías"]
}
bodyFat: porcentaje estimado (número entero).
muscleMass: "baja"|"media"|"alta".
physique: "ectomorfo"|"mesomorfo"|"endomorfo"|"mixto".
shoulders/chest/arms/core/legs: descripción breve.
symmetry: 0-100 puntuación.
overall: resumen de 1 línea.
recommendations: array de 3-5 consejos.
Solo devuelve el JSON, nada más.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024
    }
  };

  try {
    const models = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-2.5-flash'];
    let res = null;
    let lastError = '';

    for (const m of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
      if (res.ok) break;
      else {
        const errData = await res.json().catch(() => ({}));
        lastError = errData.error?.message || 'Error de API';
      }
    }

    if (!res || !res.ok) throw new Error(lastError || 'Ningún modelo disponible');

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates?.length) throw new Error('La IA no pudo analizar la imagen');

    const text = data.candidates[0].content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Respuesta vacía');

    // Extraer JSON
    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch(e) {
      // Extracción manual de campos
      const extractNum = (key) => { const m = text.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`)); return m ? parseInt(m[1]) : 0; };
      const extractStr = (key) => { const m = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`)); return m ? m[1] : '—'; };
      result = {
        bodyFat: extractNum('bodyFat') || extractNum('body_fat') || 15,
        muscleMass: extractStr('muscleMass') || extractStr('muscle_mass') || 'media',
        physique: extractStr('physique') || extractStr('somatotype') || 'mixto',
        shoulders: extractStr('shoulders') || '—',
        chest: extractStr('chest') || '—',
        arms: extractStr('arms') || '—',
        core: extractStr('core') || '—',
        legs: extractStr('legs') || '—',
        symmetry: extractNum('symmetry') || 50,
        overall: extractStr('overall') || 'Análisis completado',
        recommendations: []
      };
      // Extraer recomendaciones
      const recMatch = text.match(/\[([^\]]+)\]/);
      if (recMatch) {
        result.recommendations = recMatch[1].split(',').map(s => s.replace(/"/g, '').trim()).filter(Boolean);
      }
    }

    showBodyScanResult(result, base64);

    // Guardar escaneo
    S.bodyScans.push({
      date: todayStr(),
      analysis: result,
      thumbnail: base64.substring(0, 200) // Solo preview pequeño
    });
    if (S.bodyScans.length > 20) S.bodyScans = S.bodyScans.slice(-20);
    save();
    checkAchievement('body_scan', true);

  } catch(err) {
    console.error('Body scan error:', err);
    showBodyScanError(`❌ Error: ${err.message}`);
  }
}

// ── MOSTRAR ERROR ──
function showBodyScanError(msg) {
  const container = document.getElementById('bodyScanResult');
  container.innerHTML = `
    <div class="food-result-card" style="border-color:var(--acc)">
      <div style="text-align:center;padding:10px;color:var(--acc);font-size:14px">${msg}</div>
      <button class="btn-secondary" style="width:100%;margin-top:8px" onclick="document.getElementById('bodyScanResult').innerHTML=''">CERRAR</button>
    </div>`;
}

// ── MOSTRAR RESULTADO ──
function showBodyScanResult(result, thumb) {
  const container = document.getElementById('bodyScanResult');
  const symColor = result.symmetry >= 80 ? 'var(--grn)' : result.symmetry >= 60 ? 'var(--gld)' : 'var(--acc)';

  container.innerHTML = `
    <div class="food-result-card bodyscan-result">
      <div class="food-result-name">ANÁLISIS <span>CORPORAL</span></div>
      <div class="macro-grid">
        <div class="macro-box kcal"><div class="m-val">${result.bodyFat}%</div><div class="m-lbl">GRASA CORP.</div></div>
        <div class="macro-box prot"><div class="m-val" style="font-size:16px">${result.muscleMass}</div><div class="m-lbl">MASA MUSCULAR</div></div>
        <div class="macro-box carb"><div class="m-val" style="font-size:16px">${result.physique}</div><div class="m-lbl">SOMATOTIPO</div></div>
        <div class="macro-box fat"><div class="m-val" style="color:${symColor}">${result.symmetry}</div><div class="m-lbl">SIMETRÍA</div></div>
      </div>
      
      <div class="body-detail-grid">
        <div class="body-detail"><span class="bd-label">Hombros</span><span class="bd-value">${result.shoulders}</span></div>
        <div class="body-detail"><span class="bd-label">Pecho</span><span class="bd-value">${result.chest}</span></div>
        <div class="body-detail"><span class="bd-label">Brazos</span><span class="bd-value">${result.arms}</span></div>
        <div class="body-detail"><span class="bd-label">Core</span><span class="bd-value">${result.core}</span></div>
        <div class="body-detail"><span class="bd-label">Piernas</span><span class="bd-value">${result.legs}</span></div>
      </div>

      <div class="gb" style="margin-top:12px"><strong>📋 VALORACIÓN:</strong> ${result.overall}</div>

      ${result.recommendations && result.recommendations.length > 0 ? `
        <div class="wb" style="margin-top:8px"><strong>💡 RECOMENDACIONES:</strong><br>${result.recommendations.map(r => '• ' + r).join('<br>')}</div>
      ` : ''}

      <button class="confirm-btn" style="margin-top:14px" onclick="saveBodyScanPhoto('${thumb ? thumb.substring(0, 100) : ''}')">📸 GUARDAR COMO FOTO DE PROGRESO</button>
      <button class="btn-secondary" style="width:100%;margin-top:8px" onclick="document.getElementById('bodyScanResult').innerHTML=''">CERRAR</button>
    </div>`;
  
  haptic([50, 80, 50]);
}

function saveBodyScanPhoto(thumbPreview) {
  showToast('📸 Análisis guardado en tu historial');
  document.getElementById('bodyScanResult').innerHTML = '';
}

// ── RENDER PÁGINA BODY SCAN ──
function renderBodyScan() {
  const container = document.getElementById('bodyscanContent');
  if (!container) return;

  let html = `
    <div class="scanner-area">
      <div class="scan-icon">🤖📸</div>
      <div style="font-family:var(--fd);font-size:22px;letter-spacing:2px;margin-bottom:6px">ESCANEO CORPORAL IA</div>
      <div style="font-size:12px;color:var(--mut);margin-bottom:16px;line-height:1.5">Hazte una foto de cuerpo completo y la IA analizará tu composición corporal, simetría y te dará recomendaciones personalizadas.</div>
      <button class="scan-btn" style="background:linear-gradient(135deg,var(--blu),var(--pur))" onclick="openBodyScanner(false)">📷 FOTO CORPORAL</button>
      <button class="gallery-btn" onclick="openBodyScanner(true)">🖼️ SUBIR DE GALERÍA</button>
      <input type="file" id="bodyCameraInput" accept="image/*" style="display:none" onchange="handleBodyImage(event)">
    </div>
    <div id="bodyScanResult"></div>`;

  // Historial de escaneos
  if (S.bodyScans.length > 0) {
    html += '<div class="pg-sub" style="margin-top:20px">📋 HISTORIAL DE ESCANEOS</div>';
    [...S.bodyScans].reverse().forEach(scan => {
      const a = scan.analysis;
      html += `
        <div class="card" style="padding:12px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700;font-size:13px">${scan.date}</div>
              <div style="font-size:10px;color:var(--mut);font-family:var(--fm)">${a.bodyFat}% grasa · ${a.muscleMass} masa · ${a.physique}</div>
            </div>
            <div style="font-family:var(--fd);font-size:24px;color:${a.symmetry >= 70 ? 'var(--grn)' : 'var(--gld)'}">${a.symmetry}</div>
          </div>
        </div>`;
    });
  }

  container.innerHTML = html;
}
