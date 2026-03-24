// =====================================
// GYMTRACK — RUTINAS PERSONALIZADAS
// Modos: Gym · Casa · Calistenia
// + Generador IA de rutinas
// =====================================

// ── EJERCICIOS POR MODO ──
const HOME_EXERCISES = [
  {name:"Flexiones",sets:4,reps:"12-15",rest:60,rir:"RIR 2",sw:0,muscles:["Pecho","Tríceps","Deltoides"],grip:"Manos a anchura hombros, bajada hasta pecho al suelo.",why:"Ejercicio base para pecho y tríceps sin equipo."},
  {name:"Flexiones Diamante",sets:3,reps:"8-12",rest:60,rir:"RIR 2",sw:0,muscles:["Tríceps","Pecho"],grip:"Manos juntas formando un diamante bajo el pecho.",why:"Máxima activación de tríceps con peso corporal."},
  {name:"Flexiones Declinadas",sets:3,reps:"10-12",rest:60,rir:"RIR 2",sw:0,muscles:["Pecho Superior","Deltoides"],grip:"Pies elevados en silla o banco, manos en el suelo.",why:"Enfatiza pectoral superior y deltoides anterior."},
  {name:"Sentadilla Búlgara",sets:3,reps:"10 c/pierna",rest:90,rir:"RIR 2",sw:0,muscles:["Cuádriceps","Glúteos"],grip:"Pie trasero en silla/banco. Mancuernas o peso corporal.",why:"Unilateral: corrige desequilibrios y activa glúteos."},
  {name:"Sentadilla con Salto",sets:3,reps:"12-15",rest:60,rir:"RIR 1",sw:0,muscles:["Cuádriceps","Glúteos","Gemelos"],grip:"Bajada controlada, explosión al subir. Aterriza suave.",why:"Potencia explosiva + cardio en un solo ejercicio."},
  {name:"Zancadas Caminando",sets:3,reps:"12 c/pierna",rest:90,rir:"RIR 2",sw:0,muscles:["Cuádriceps","Glúteos","Isquios"],grip:"Pasos largos alternos hacia adelante.",why:"Trabaja piernas completas con equilibrio y coordinación."},
  {name:"Puente de Glúteos",sets:4,reps:"15-20",rest:60,rir:"RIR 1",sw:0,muscles:["Glúteos","Isquios"],grip:"Tumbado boca arriba, empuja caderas arriba. Pausa 2s.",why:"Aislamiento de glúteos sin equipo. A una pierna si es fácil."},
  {name:"Remo Invertido (mesa)",sets:3,reps:"8-12",rest:60,rir:"RIR 2",sw:0,muscles:["Espalda","Bíceps"],grip:"Tumbado bajo una mesa resistente, tira del pecho a la mesa.",why:"Trabaja espalda cuando no tienes barra ni poleas."},
  {name:"Pike Push-ups",sets:3,reps:"8-10",rest:60,rir:"RIR 2",sw:0,muscles:["Deltoides","Tríceps"],grip:"Posición V invertida, baja la cabeza al suelo.",why:"Simula press militar sin equipo. Progresión a handstand push-ups."},
  {name:"Plancha Lateral",sets:3,reps:"30s c/lado",rest:45,rir:"—",sw:0,muscles:["Oblicuos","Core"],grip:"Apoyado en un antebrazo, cuerpo recto lateral.",why:"Fortalece oblicuos y estabilizadores del core."},
  {name:"Mountain Climbers",sets:3,reps:"20 c/pierna",rest:45,rir:"RIR 1",sw:0,muscles:["Core","Cardio"],grip:"Posición de plancha, alternas rodillas al pecho rápido.",why:"Cardio + core en un ejercicio de alta intensidad."},
  {name:"Elevación de Talones (escalón)",sets:4,reps:"20-25",rest:45,rir:"RIR 1",sw:0,muscles:["Gemelos"],grip:"De pie en un escalón, talones colgando. Sube y baja.",why:"Rango completo para gemelos sin máquina."}
];

const CALISTHENICS_EXERCISES = [
  {name:"Dominadas (Pull-ups)",sets:4,reps:"5-8",rest:120,rir:"RIR 2",sw:0,muscles:["Espalda","Bíceps","Dorsal"],grip:"Agarre prono, anchura hombros o más. Rango completo.",why:"El rey de los ejercicios de tracción. Construye espalda y bíceps."},
  {name:"Dominadas Supinas (Chin-ups)",sets:3,reps:"6-10",rest:120,rir:"RIR 2",sw:0,muscles:["Bíceps","Espalda"],grip:"Agarre supino (palmas hacia ti), anchura hombros.",why:"Mayor activación de bíceps que las dominadas pronas."},
  {name:"Muscle-ups",sets:3,reps:"3-5",rest:150,rir:"RIR 2",sw:0,muscles:["Espalda","Pecho","Tríceps"],grip:"Dominada explosiva + transición a fondos sobre la barra.",why:"Ejercicio avanzado que combina tracción y empuje."},
  {name:"Fondos en Paralelas",sets:4,reps:"8-12",rest:90,rir:"RIR 2",sw:0,muscles:["Tríceps","Pecho","Deltoides"],grip:"Brazos a anchura hombros. Inclinación para pecho.",why:"Empuje vertical del peso corporal. Trabaja tríceps y pecho."},
  {name:"Handstand Push-ups (pared)",sets:3,reps:"5-8",rest:120,rir:"RIR 3",sw:0,muscles:["Deltoides","Tríceps"],grip:"Pino contra la pared, baja la cabeza al suelo.",why:"Press de hombros con peso corporal total. Avanzado."},
  {name:"Pistol Squat",sets:3,reps:"5 c/pierna",rest:120,rir:"RIR 2",sw:0,muscles:["Cuádriceps","Glúteos"],grip:"Sentadilla a una pierna, otra extendida al frente.",why:"Máxima fuerza unilateral de piernas sin equipo."},
  {name:"L-Sit",sets:3,reps:"15-30s",rest:60,rir:"—",sw:0,muscles:["Core","Flexores de Cadera"],grip:"En paralelas o suelo, piernas extendidas al frente.",why:"Core isométrico avanzado. Desarrolla fuerza de compresión."},
  {name:"Front Lever (progresión)",sets:3,reps:"10-20s",rest:90,rir:"—",sw:0,muscles:["Espalda","Core","Dorsal"],grip:"Colgado de barra, cuerpo horizontal mirando arriba.",why:"Fuerza extrema de espalda y core. Usa progresiones."},
  {name:"Planche Lean",sets:3,reps:"15-20s",rest:90,rir:"—",sw:0,muscles:["Pecho","Deltoides","Core"],grip:"Posición plancha con manos atrás, inclinación adelante.",why:"Progresión hacia planche. Desarrolla fuerza de empuje."},
  {name:"Dragon Flag",sets:3,reps:"5-8",rest:90,rir:"RIR 2",sw:0,muscles:["Core","Recto Abdominal"],grip:"Tumbado en banco, elevar cuerpo recto desde los hombros.",why:"El ejercicio de core más avanzado. Bruce Lee lo popularizó."},
  {name:"Australian Pull-ups",sets:3,reps:"12-15",rest:60,rir:"RIR 2",sw:0,muscles:["Espalda","Bíceps"],grip:"Barra a altura cadera, tumbado debajo, remo invertido.",why:"Progresión hacia dominadas completas. Buen volumen."},
  {name:"Flexiones Archer",sets:3,reps:"6-8 c/lado",rest:90,rir:"RIR 2",sw:0,muscles:["Pecho","Tríceps"],grip:"Flexión con un brazo recto al lado, el otro hace el trabajo.",why:"Progresión hacia flexiones a un brazo."}
];

// ── RUTINAS PREDEFINIDAS POR MODO ──
const ROUTINE_TEMPLATES = {
  gym: {
    name: 'Upper/Lower (Gym)',
    description: 'Rutina clásica Upper/Lower con máquinas y barras. 4 días.',
    days: null // Usa DEF por defecto
  },
  home: {
    name: 'Full Body (Casa)',
    description: 'Rutina full body sin equipo. 3 días.',
    days: [
      {name:"PUSH DAY",label:"Pecho · Hombros · Tríceps · Core",exercises: HOME_EXERCISES.filter(e => e.muscles.some(m => ["Pecho","Tríceps","Deltoides","Pecho Superior"].includes(m))).slice(0,6)},
      {name:"PULL DAY",label:"Espalda · Bíceps · Core",exercises: [...HOME_EXERCISES.filter(e => e.muscles.some(m => ["Espalda","Bíceps"].includes(m))), ...HOME_EXERCISES.filter(e => e.muscles.includes("Core"))].slice(0,5)},
      null,
      {name:"LEGS DAY",label:"Cuádriceps · Glúteos · Isquios · Gemelos",exercises: HOME_EXERCISES.filter(e => e.muscles.some(m => ["Cuádriceps","Glúteos","Isquios","Gemelos"].includes(m))).slice(0,6)},
      null, null, null
    ]
  },
  calistenia: {
    name: 'Push/Pull/Legs (Calistenia)',
    description: 'Rutina de calistenia avanzada. 4 días.',
    days: [
      {name:"PUSH",label:"Pecho · Hombros · Tríceps",exercises: CALISTHENICS_EXERCISES.filter(e => e.muscles.some(m => ["Pecho","Tríceps","Deltoides"].includes(m))).slice(0,5)},
      {name:"PULL",label:"Espalda · Bíceps",exercises: CALISTHENICS_EXERCISES.filter(e => e.muscles.some(m => ["Espalda","Bíceps","Dorsal"].includes(m))).slice(0,5)},
      null,
      {name:"LEGS + CORE",label:"Piernas · Core · Skills",exercises: [...CALISTHENICS_EXERCISES.filter(e => e.muscles.some(m => ["Cuádriceps","Glúteos","Core","Recto Abdominal","Flexores de Cadera"].includes(m)))].slice(0,5)},
      null, null, null
    ]
  }
};

// ── CAMBIAR MODO DE ENTRENAMIENTO ──
function setTrainingMode(mode) {
  S.trainingMode = mode;
  const template = ROUTINE_TEMPLATES[mode];
  if (template && template.days) {
    DAYS = JSON.parse(JSON.stringify(template.days));
  } else {
    DAYS = JSON.parse(JSON.stringify(DEF));
  }
  S.days = DAYS;
  save();
  renderEx();
  selDay(0);
  showToast(`🔄 Modo: ${mode === 'gym' ? '🏋️ GYM' : mode === 'home' ? '🏠 CASA' : '🤸 CALISTENIA'}`);
  haptic([50, 80, 50]);
  checkAchievement('mode_switch', true);
}

// ── RENDER SELECTOR DE MODO ──
function renderModeSelector() {
  const modes = [
    {id: 'gym', icon: '🏋️', label: 'GYM', desc: 'Barras, máquinas y mancuernas'},
    {id: 'home', icon: '🏠', label: 'CASA', desc: 'Sin equipo, peso corporal'},
    {id: 'calistenia', icon: '🤸', label: 'CALISTENIA', desc: 'Barra, paralelas, skills'}
  ];
  
  return `
    <div class="mode-selector">
      ${modes.map(m => `
        <div class="mode-card ${S.trainingMode === m.id ? 'active' : ''}" onclick="setTrainingMode('${m.id}')">
          <div class="mode-icon">${m.icon}</div>
          <div class="mode-label">${m.label}</div>
          <div class="mode-desc">${m.desc}</div>
        </div>
      `).join('')}
    </div>`;
}

// ── GENERADOR IA DE RUTINAS ──
async function generateAIRoutine() {
  const apiKey = S.apiKey;
  if (!apiKey) {
    showToast('⚠️ Necesitas configurar API Key en Ajustes', true);
    return;
  }

  const btn = document.getElementById('generateRoutineBtn');
  if (btn) { btn.textContent = '⏳ GENERANDO...'; btn.disabled = true; }

  const mode = S.trainingMode;
  const level = S.experienceLevel;
  const weight = S.bw;
  const goal = S.goalWeight > S.bw ? 'ganar músculo (volumen)' : 'definición (pérdida de grasa)';

  const prompt = `Eres un entrenador personal experto. Genera una rutina de 4 días para:
- Modo: ${mode === 'gym' ? 'Gimnasio con barras y máquinas' : mode === 'home' ? 'Casa sin equipo' : 'Calistenia con barra y paralelas'}
- Nivel: ${level}
- Peso: ${weight}kg
- Objetivo: ${goal}
Devuelve EXACTAMENTE este formato JSON:
{
  "routine": [
    {"name": "DÍA 1 NOMBRE", "label": "grupos musculares", "exercises": [
      {"name": "nombre ejercicio", "sets": 4, "reps": "8-12", "rest": 90, "rir": "RIR 2", "grip": "descripción agarre", "why": "por qué este ejercicio"}
    ]},
    null,
    {"name": "DÍA 2 NOMBRE", "label": "grupos", "exercises": [...]},
    null, null, null, null
  ]
}
Incluye 5-6 ejercicios por día. Solo devuelve el JSON.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{parts: [{text: prompt}]}],
        generationConfig: {temperature: 0.3, maxOutputTokens: 4096}
      })
    });

    if (!res.ok) throw new Error('Error de API');
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Formato inválido');

    const result = JSON.parse(jsonMatch[0]);
    if (result.routine && Array.isArray(result.routine)) {
      // Añadir campos faltantes
      result.routine.forEach(day => {
        if (day && day.exercises) {
          day.exercises.forEach(ex => {
            if (!ex.sw) ex.sw = 0;
            if (!ex.muscles) ex.muscles = [];
          });
        }
      });
      DAYS = result.routine;
      S.days = DAYS;
      save();
      renderEx();
      selDay(0);
      showToast('✅ ¡Rutina IA generada!');
      haptic([50, 100, 50, 100, 200]);
      launchConfetti();
    }
  } catch(err) {
    console.error('AI routine error:', err);
    showToast('❌ Error generando rutina: ' + err.message, true);
  } finally {
    if (btn) { btn.textContent = '🤖 GENERAR CON IA'; btn.disabled = false; }
  }
}
