// =====================================
// GYMTRACK PREMIUM — ESCÁNER DE COMIDA IA
// Gemini 1.5 Flash Vision API
// =====================================

// ── ABRIR CÁMARA / GALERÍA ──
function openScanner(fromGallery) {
  const input = document.getElementById('foodCameraInput');
  if (fromGallery) {
    input.removeAttribute('capture');
  } else {
    input.setAttribute('capture', 'environment');
  }
  input.click();
}

// ── PROCESAR IMAGEN CAPTURADA ──
function handleFoodImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Comprimir imagen antes de enviar
  compressImage(file, 800, 0.8).then(base64 => {
    showFoodPreview(base64);
    analyzeFoodWithAI(base64);
  });

  // Reset input para permitir re-selección
  event.target.value = '';
}

// ── COMPRIMIR IMAGEN ──
function compressImage(file, maxWidth, quality) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── MOSTRAR PREVIEW ──
function showFoodPreview(base64) {
  const container = document.getElementById('scanResultArea');
  container.innerHTML = `
    <div class="preview-container">
      <img src="${base64}" alt="Comida escaneada">
      <div class="preview-overlay">
        <div class="analyzing-badge">🔍 ANALIZANDO CON IA...</div>
      </div>
    </div>`;
}

// ── ENVIAR A GEMINI VISION ──
async function analyzeFoodWithAI(base64) {
  const apiKey = S.apiKey;
  if (!apiKey) {
    showScanError('⚠️ Necesitas configurar tu API Key de Gemini. Ve a Ajustes.');
    return;
  }

  const imageData = base64.split(',')[1]; // Quitar prefijo data:image/...

  const body = {
    contents: [{
      parts: [
        {
          text: `Eres un nutricionista. Analiza la imagen y devuelve EXACTAMENTE este formato JSON. NO cambies las claves de inglés a español. Cumple el formato estrictamente:
{
  "name": "Nombre de la comida",
  "calories": 150,
  "protein": 10,
  "carbs": 20,
  "fat": 5,
  "portion": 100,
  "confidence": "high"
}
Usa números enteros, sin letras ni unidades. Solo el JSON.`
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
    const models = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro-latest', 'gemini-2.5-flash'];
    let res = null;
    let lastErrorMsg = '';

    for (const m of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
      if (res.ok) break;
      else {
        const errData = await res.json().catch(()=>({}));
        lastErrorMsg = errData.error?.message || 'Error de API';
      }
    }

    if (!res || !res.ok) {
      throw new Error(lastErrorMsg || 'Error de API: Ningún modelo funcionó');
    }

    const data = await res.json();
    
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates || data.candidates.length === 0) {
      const reason = data.promptFeedback?.blockReason || 'desconocida';
      throw new Error(`La IA rechazó la imagen (Razón: ${reason}) o cuota agotada.`);
    }

    const text = data.candidates[0].content?.parts?.[0]?.text || '';
    if (!text) throw new Error('Respuesta de texto vacía o bloqueada por seguridad.');

    let cleaned = text.trim();

    // Súper Extracción con Regex para ignorar fallos de formato JSON y tildes
    const extractName = () => {
      const m = cleaned.match(/"?(?:name|nombre)"?\s*:\s*"([^"]+)"/i);
      return m ? m[1].trim() : 'Comida (Sin nombre)';
    };

    const extractNum = (key, esKey) => {
      // El punto (.) actúa como comodín para atrapar tildes: "calor.as" -> "calorías" o "calorias"
      const r = new RegExp(`"?(?:${key}|${esKey})"?\\s*:\\s*"?([\\d.]+)`, 'i');
      const m = cleaned.match(r);
      return m ? parseFloat(m[1]) : 0;
    };

    const result = {
      name: extractName(),
      calories: extractNum('calories', 'calor.as?'),
      protein: extractNum('protein', 'prote.nas?'),
      carbs: extractNum('carbs', 'carbohidrat.*|hidratos?'),
      fat: extractNum('fat', 'grasas?|l.pidos?'),
      portion: extractNum('portion', 'porci.n') || 100,
      confidence: "high"
    };

    // Si todo da 0, significa que la IA no incluyó los números, probablemente porque no hay comida en la foto
    if (result.calories === 0 && result.protein === 0 && result.carbs === 0) {
      const dump = cleaned.replace(/\s+/g, ' ').substring(0, 150);
      throw new Error("MENSAJE DIRECTO DE LA IA: " + dump);
    }

    showFoodResult(result, base64);
  } catch (err) {
    console.error('Error escáner:', err);
    showScanError(`❌ Error: ${err.message}`);
  }
}

// ── MOSTRAR ERROR ──
function showScanError(msg) {
  const container = document.getElementById('scanResultArea');
  container.innerHTML = `
    <div class="food-result-card" style="border-color:var(--acc)">
      <div style="text-align:center;padding:10px;color:var(--acc);font-size:14px">${msg}</div>
      <button class="btn-secondary" style="width:100%;margin-top:8px" onclick="document.getElementById('scanResultArea').innerHTML=''">CERRAR</button>
    </div>`;
}

// ── MOSTRAR RESULTADO ──
function showFoodResult(result, thumb) {
  const container = document.getElementById('scanResultArea');
  const conf = result.confidence === 'high' ? '🟢 Alta' : result.confidence === 'medium' ? '🟡 Media' : '🔴 Baja';

  container.innerHTML = `
    <div class="food-result-card" id="foodResultCard">
      <div class="food-result-name">${result.name} <span>· ${result.portion || '?'}g</span></div>
      <div style="font-size:10px;color:var(--mut);font-family:var(--fm);margin-bottom:12px">Confianza: ${conf}</div>
      <div class="macro-grid">
        <div class="macro-box kcal">
          <input type="number" class="macro-input" id="scanKcal" value="${Math.round(result.calories)}">
          <div class="m-lbl">KCAL</div>
        </div>
        <div class="macro-box prot">
          <input type="number" class="macro-input" id="scanProt" value="${Math.round(result.protein)}">
          <div class="m-lbl">PROTEÍNA</div>
        </div>
        <div class="macro-box carb">
          <input type="number" class="macro-input" id="scanCarb" value="${Math.round(result.carbs)}">
          <div class="m-lbl">CARBOS</div>
        </div>
        <div class="macro-box fat">
          <input type="number" class="macro-input" id="scanFat" value="${Math.round(result.fat)}">
          <div class="m-lbl">GRASAS</div>
        </div>
      </div>
      <button class="confirm-btn" onclick="confirmFood('${result.name.replace(/'/g,"\\'")}','${thumb?thumb.substring(0,100):''}')">
        ✓ AÑADIR A MIS MACROS DEL DÍA
      </button>
      <button class="btn-secondary" style="width:100%;margin-top:8px" onclick="document.getElementById('scanResultArea').innerHTML=''">CANCELAR</button>
    </div>`;

  haptic([30, 50, 30]);
}

// ── CONFIRMAR Y AÑADIR COMIDA ──
function confirmFood(name, thumb) {
  const kcal = parseInt(document.getElementById('scanKcal').value) || 0;
  const prot = parseInt(document.getElementById('scanProt').value) || 0;
  const carb = parseInt(document.getElementById('scanCarb').value) || 0;
  const fat = parseInt(document.getElementById('scanFat').value) || 0;

  // Sumar a macros diarios
  checkDailyReset();
  S.dailyMacros.kcal += kcal;
  S.dailyMacros.prot += prot;
  S.dailyMacros.carb += carb;
  S.dailyMacros.fat += fat;

  // Guardar en historial
  S.scannedFoods.push({
    date: todayStr(), name, kcal, prot, carb, fat,
    time: new Date().toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})
  });

  save();
  renderDailyMacros();
  renderScannedHistory();
  document.getElementById('scanResultArea').innerHTML = '';
  showToast(`✅ +${prot}g proteína añadidos`);
  haptic([50, 80, 50]);
}

// ── RENDER MACROS DIARIOS ──
function renderDailyMacros() {
  checkDailyReset();
  const m = S.dailyMacros;
  const targets = {prot:140, carb:325, fat:80, kcal:2600};

  const container = document.getElementById('dailyMacrosArea');
  if (!container) return;

  container.innerHTML = `
    <div class="dm-header">
      <div class="dm-title">📊 MACROS DE HOY</div>
      <button class="dm-reset" onclick="resetDailyMacros()">RESETEAR</button>
    </div>
    <div class="dm-bars">
      <div class="dm-row prot">
        <div class="dm-lbl">PROT</div>
        <div class="dm-bar-wrap"><div class="dm-bar" style="width:${Math.min(100,m.prot/targets.prot*100)}%"></div></div>
        <div class="dm-val">${m.prot}/${targets.prot}g</div>
      </div>
      <div class="dm-row carb">
        <div class="dm-lbl">CARBS</div>
        <div class="dm-bar-wrap"><div class="dm-bar" style="width:${Math.min(100,m.carb/targets.carb*100)}%"></div></div>
        <div class="dm-val">${m.carb}/${targets.carb}g</div>
      </div>
      <div class="dm-row fat">
        <div class="dm-lbl">GRASAS</div>
        <div class="dm-bar-wrap"><div class="dm-bar" style="width:${Math.min(100,m.fat/targets.fat*100)}%"></div></div>
        <div class="dm-val">${m.fat}/${targets.fat}g</div>
      </div>
      <div class="dm-row kcal">
        <div class="dm-lbl">KCAL</div>
        <div class="dm-bar-wrap"><div class="dm-bar" style="width:${Math.min(100,m.kcal/targets.kcal*100)}%"></div></div>
        <div class="dm-val">${m.kcal}/${targets.kcal}</div>
      </div>
    </div>`;
}

function resetDailyMacros() {
  S.dailyMacros = {date:todayStr(), prot:0, carb:0, fat:0, kcal:0};
  S.scannedFoods = [];
  save();
  renderDailyMacros();
  renderScannedHistory();
  showToast('🔄 Macros del día reseteados');
}

// ── RENDER HISTORIAL ESCANEADO ──
function renderScannedHistory() {
  const container = document.getElementById('scannedHistoryArea');
  if (!container) return;

  const todayFoods = S.scannedFoods.filter(f => f.date === todayStr());

  if (todayFoods.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:16px;color:var(--mut);font-size:11px;font-family:var(--fm)">Escanea comida para ver el historial aquí</div>';
    return;
  }

  container.innerHTML = todayFoods.map(f => `
    <div class="scanned-item">
      <div class="si-thumb">🍽️</div>
      <div class="si-info">
        <div class="si-name">${f.name}</div>
        <div class="si-macros">${f.prot}g prot · ${f.carb}g carb · ${f.fat}g grasa · ${f.time}</div>
      </div>
      <div class="si-kcal">${f.kcal}</div>
    </div>`).join('');
}
