// =====================================
// GYMTRACK PREMIUM — ESTADO Y ALMACENAMIENTO
// IndexedDB + Estado global
// =====================================

// ── ESTADO GLOBAL ──
let stored = JSON.parse(localStorage.getItem('gt3'));
let S = stored || {};

if (S.week === undefined) S.week = 1;
if (S.selDay === undefined) S.selDay = 0;
if (!S.weights) S.weights = {};
if (!S.lifts) S.lifts = {};
if (S.bw === undefined) S.bw = 50.5;
if (!S.bwHist) S.bwHist = [];
if (!S.doneSets) S.doneSets = {};
if (!S.doneEx) S.doneEx = {};
if (!S.setReps) S.setReps = {};

// Nuevos campos premium
if (!S.theme) S.theme = 'dark';
if (S.apiKey === undefined) S.apiKey = '';
if (S.onboarded === undefined) S.onboarded = stored ? true : false;
if (S.height === undefined) S.height = 168;
if (S.goalWeight === undefined) S.goalWeight = 55;
if (S.age === undefined) S.age = 16;
if (!S.dailyMacros) S.dailyMacros = {date:'',prot:0,carb:0,fat:0,kcal:0};
if (!S.scannedFoods) S.scannedFoods = [];
if (!S.sessions) S.sessions = [];
if (!S.prs) S.prs = {};
if (S.streak === undefined) S.streak = 0;
if (S.lastTrainDate === undefined) S.lastTrainDate = '';
if (!S.notifTime) S.notifTime = '18:00';
if (S.notifsEnabled === undefined) S.notifsEnabled = false;
if (S.liveSession === undefined) S.liveSession = null;

// ── NUEVOS CAMPOS: Features Expansion ──
if (!S.trainingMode) S.trainingMode = 'gym'; // 'gym' | 'home' | 'calistenia'
if (S.xp === undefined) S.xp = 0;
if (S.level === undefined) S.level = 1;
if (!S.exerciseXP) S.exerciseXP = {}; // {exerciseName: {xp, rank, totalSets, totalReps, totalKg}}
if (!S.progressPhotos) S.progressPhotos = []; // [{date, dataUrl, notes, type:'front'|'side'|'back'}]
if (!S.bodyScans) S.bodyScans = []; // [{date, analysis, thumbnail}]
if (!S.overloadHistory) S.overloadHistory = {}; // {exerciseName: [{week, kg, reps, date}]}
if (!S.bodyMeasurements) S.bodyMeasurements = {}; // {chest, waist, arms, thighs, ...}
if (!S.muscleVolume) S.muscleVolume = {}; // {muscleName: weeklyVolume} computed
if (!S.achievements) S.achievements = []; // [{id, name, date, icon}]
if (S.experienceLevel === undefined) S.experienceLevel = 'principiante'; // principiante|intermedio|avanzado

let DAYS = S.days ? S.days : JSON.parse(JSON.stringify(DEF));

// ── GUARDAR ESTADO ──
function save() {
  S.days = DAYS;
  localStorage.setItem('gt3', JSON.stringify(S));
}

// ── UTILIDAD: Obtener fecha de hoy como string ──
function todayStr() {
  return new Date().toLocaleDateString('es-ES');
}

// ── RESET MACROS DIARIOS si cambió el día ──
function checkDailyReset() {
  const today = todayStr();
  if (S.dailyMacros.date !== today) {
    S.dailyMacros = {date:today, prot:0, carb:0, fat:0, kcal:0};
    S.scannedFoods = S.scannedFoods.filter(f => f.date === today);
    save();
  }
}

// ── RACHA DE ENTRENAMIENTOS ──
function updateStreak() {
  const today = todayStr();
  if (S.lastTrainDate === today) return; // ya contado hoy

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('es-ES');

  if (S.lastTrainDate === yesterdayStr || S.lastTrainDate === '') {
    S.streak++;
  } else {
    S.streak = 1;
  }
  S.lastTrainDate = today;
  save();
}

// ── RECORDS PERSONALES ──
function checkPR(exerciseName, kg) {
  if (!kg || kg <= 0) return false;
  const current = S.prs[exerciseName] || 0;
  if (kg > current) {
    S.prs[exerciseName] = kg;
    save();
    return true;
  }
  return false;
}

// ── GUARDAR SESIÓN EN DIARIO ──
function saveSession(dayIdx, duration) {
  const day = DAYS[dayIdx];
  if (!day) return;

  const exercises = day.exercises.map(ex => {
    const repsArr = S.setReps[ex.name + S.week] || [];
    const kg = S.weights[ex.name] || ex.sw;
    return {
      name: ex.name,
      sets: Array.from({length: ex.sets}, (_, i) => ({
        kg: kg,
        reps: repsArr[i] || 0
      }))
    };
  });

  // Calcular volumen total
  let volume = 0;
  exercises.forEach(ex => {
    ex.sets.forEach(s => { volume += s.kg * s.reps; });
  });

  S.sessions.push({
    date: todayStr(),
    week: S.week,
    dayName: day.name,
    dayLabel: day.label,
    exercises,
    volume: Math.round(volume),
    duration: duration || 0
  });

  // Máximo 60 sesiones guardadas
  if (S.sessions.length > 60) S.sessions = S.sessions.slice(-60);

  updateStreak();
  save();
}

// ── CALCULAR VOLUMEN DE UNA SESIÓN ACTUAL ──
function calcCurrentVolume() {
  const day = DAYS[S.selDay];
  if (!day) return 0;
  let vol = 0;
  day.exercises.forEach(ex => {
    const repsArr = S.setReps[ex.name + S.week] || [];
    const kg = S.weights[ex.name] || ex.sw;
    for (let i = 0; i < ex.sets; i++) {
      const r = repsArr[i] || 0;
      vol += kg * r;
    }
  });
  return Math.round(vol);
}

// ── CALORÍAS QUEMADAS ESTIMADAS ──
function estimateCalories(durationMin, volume) {
  // Estimación simple: ~5 kcal por minuto de entrenamiento + factor de volumen
  const timeCal = durationMin * 5;
  const volCal = volume * 0.003;
  return Math.round(timeCal + volCal);
}

// ── CALCULADORA DE MACROS ──
function calcMacros(weightKg) {
  // Superávit para ganar músculo (adolescente activo)
  const tdee = Math.round(weightKg * 38); // ~38 kcal/kg para actividad moderada-alta
  const surplus = 300; // Superávit moderado
  const totalKcal = tdee + surplus;
  const prot = Math.round(weightKg * 2.2); // 2.2g/kg
  const fat = Math.round(weightKg * 1.2); // 1.2g/kg
  const carbKcal = totalKcal - (prot * 4) - (fat * 9);
  const carb = Math.round(carbKcal / 4);
  return { kcal: totalKcal, prot, carb, fat };
}

// ── HAPTIC FEEDBACK ──
function haptic(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern || 15);
  }
}
