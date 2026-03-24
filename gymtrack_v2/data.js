// =====================================
// GYMTRACK PREMIUM — DATOS
// Ejercicios, comidas, biblioteca
// =====================================

// ── IMÁGENES DE EJERCICIOS ──
const IMG = {
  "Press de Banca con Barra":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif",cap:"Agarre prono · 1.5× anchura hombros · codos 45–60°"},
  "Remo con Barra (Pendlay)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Pendlay-Row.gif",cap:"Espalda paralela al suelo · barra desde el suelo cada rep"},
  "Press Inclinado con Mancuernas":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif",cap:"Banco 30–45° · codos a 45° · bajada controlada"},
  "Jalón al Pecho en Polea Alta":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif",cap:"Agarre prono ancho · tira al pecho superior"},
  "Curl de Bíceps con Barra EZ":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/EZ-Bar-Curl.gif",cap:"Codos fijos · agarre supino en posición interior"},
  "Fondos en Paralelas":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dip.gif",cap:"Manos a anchura hombros · inclinación para pecho"},
  "Sentadilla con Barra (Back Squat)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif",cap:"Barra en trapecios · pies anchura hombros · rodillas siguen pies"},
  "Prensa de Piernas 45°":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif",cap:"Pies a anchura hombros · NO bloquear rodillas al extender"},
  "Extensión de Cuádriceps (Leg Extension)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif",cap:"Extensión completa · bajada controlada 3 seg"},
  "Curl Femoral Tumbado en Máquina":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Curl.gif",cap:"Caderas pegadas al banco · rodillo en tendón de Aquiles"},
  "Elevación de Gemelos de Pie (Máquina)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif",cap:"Rango COMPLETO · pausa 1 seg arriba"},
  "Plancha Frontal":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Front-Plank.gif",cap:"Codos bajo hombros · cuerpo recto · glúteos apretados"},
  "Press Militar con Barra (OHP)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Overhead-Press.gif",cap:"Barra desde clavículas · empuja arriba y ligeramente atrás"},
  "Dominadas Asistidas en Máquina":{url:"https://fitnessprogramer.com/wp-content/uploads/2022/05/Machine-Assisted-Pull-up.gif",cap:"Agarre supino · rango completo · mentón sobre barra"},
  "Elevaciones Laterales con Mancuernas":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif",cap:"Codos a 15° · sube hasta hombros · baja lento 3 seg"},
  "Remo en Polea Baja (Cable Row)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif",cap:"V-bar neutro · tira al abdomen · espalda recta"},
  "Extensión de Tríceps con Cuerda":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif",cap:"Separa manos al final · activa cabeza lateral"},
  "Face Pull en Polea Alta":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif",cap:"Cuerda a altura cara · codos altos · lento"},
  "Peso Muerto Rumano con Barra":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif",cap:"Bisagra de cadera · barra cerca de piernas"},
  "Hip Thrust con Barra en Banco":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/06/Barbell-Hip-Thrust.gif",cap:"Empuje hasta horizontal · pausa 1 seg · aprieta glúteos"},
  "Zancadas Inversas con Mancuernas":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Rear-Lunge.gif",cap:"Paso ATRÁS · rodilla trasera casi toca suelo"},
  "Curl Femoral Sentado en Máquina":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Leg-Curl.gif",cap:"Flexión completa · bajada controlada"},
  "Elevación de Gemelos Sentado (Máquina)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Calf-Raise.gif",cap:"Trabaja sóleo · rango completo con pausa"},
  "Crunch en Polea Alta (Cable Crunch)":{url:"https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif",cap:"De rodillas · flexión de columna · NO inclinación de cadera"}
};

// ── RUTINA POR DEFECTO ──
const DEF = [
  {name:"UPPER A",label:"Pecho · Espalda · Bíceps · Tríceps",exercises:[
    {name:"Press de Banca con Barra",sets:4,reps:"6–8",rest:150,rir:"RIR 2",sw:32.5,muscles:["Pecho","Tríceps","Deltoides Anterior"],grip:"Agarre PRONO, 1.5× anchura hombros. Pulgares rodeando la barra (NUNCA agarre falso). Escápulas juntas y abajo.",why:"El rey del pecho. Activa pectoral mayor + deltoides anterior + tríceps."},
    {name:"Remo con Barra (Pendlay)",sets:4,reps:"6–8",rest:150,rir:"RIR 2",sw:32.5,muscles:["Espalda","Bíceps","Trapecio"],grip:"Agarre PRONO, mismo ancho que press banca. Espalda paralela al suelo. Barra desde el suelo cada rep.",why:"Ejercicio de espalda más potente sin impulso. Trabaja dorsal, trapecio, romboides y bíceps."},
    {name:"Press Inclinado con Mancuernas",sets:3,reps:"8–12",rest:120,rir:"RIR 2",sw:10,muscles:["Pecho Superior","Deltoides","Tríceps"],grip:"Banco a 30–45°. Codos a 45–60° del tronco. Bajada controlada.",why:"Trabaja la porción clavicular del pectoral (parte alta). Las mancuernas permiten mayor rango."},
    {name:"Jalón al Pecho en Polea Alta",sets:3,reps:"10–12",rest:90,rir:"RIR 2",sw:27.5,muscles:["Espalda","Bíceps","Dorsal"],grip:"Agarre PRONO barra larga, más ancho que hombros. Tira al pecho superior, nunca a la nuca.",why:"Desarrolla el dorsal ancho (la V). Paso previo a dominadas."},
    {name:"Curl de Bíceps con Barra EZ",sets:3,reps:"10–12",rest:60,rir:"RIR 2",sw:17.5,muscles:["Bíceps","Antebrazo"],grip:"Agarre SUPINO en posición interior. Codos pegados, FIJOS. Sin balanceo.",why:"La barra Z reduce estrés en muñecas. Codos fijos = aislamiento completo del bíceps."},
    {name:"Fondos en Paralelas",sets:3,reps:"8–10",rest:90,rir:"RIR 2",sw:0,muscles:["Tríceps","Pecho Inferior","Deltoides"],grip:"Manos a anchura hombros. Ligera inclinación adelante para pecho. Si no puedes 5, usa asistida.",why:"85% activación tríceps en todas sus cabezas + pectoral inferior."}
  ]},
  {name:"LOWER A",label:"Cuádriceps · Glúteos · Isquios · Gemelos · Core",exercises:[
    {name:"Sentadilla con Barra (Back Squat)",sets:4,reps:"5–8",rest:180,rir:"RIR 2",sw:42.5,muscles:["Cuádriceps","Glúteos","Isquios","Core"],grip:"Barra sobre TRAPECIOS (high bar). Pies anchura hombros, puntas 15–30° afuera. Rodillas siguen pies.",why:"El ejercicio más anabólico. Activa cuádriceps, isquios, glúteos, core y erectores."},
    {name:"Prensa de Piernas 45°",sets:3,reps:"10–12",rest:120,rir:"RIR 2",sw:50,muscles:["Cuádriceps","Glúteos"],grip:"Pies anchura hombros en plataforma, altura media. NO bloquees rodillas. Nunca quites topes de seguridad.",why:"Complementa sentadilla sin estrés en columna. Permite más carga."},
    {name:"Extensión de Cuádriceps (Leg Extension)",sets:3,reps:"12–15",rest:75,rir:"RIR 2",sw:25,muscles:["Cuádriceps"],grip:"Tobillo detrás del rodillo. Espalda pegada al respaldo. Extensión completa, bajada CONTROLADA 3 seg.",why:"Único ejercicio que aísla cuádriceps al 100%. El excéntrico lento genera más crecimiento."},
    {name:"Curl Femoral Tumbado en Máquina",sets:3,reps:"10–12",rest:75,rir:"RIR 2",sw:20,muscles:["Isquios"],grip:"Tumbado boca abajo. Rodillo sobre tendón de Aquiles. Caderas PEGADAS al banco.",why:"Trabaja isquios en posición elongada, superior para hipertrofia."},
    {name:"Elevación de Gemelos de Pie (Máquina)",sets:4,reps:"15–20",rest:60,rir:"RIR 1",sw:35,muscles:["Gemelos"],grip:"Almohadillas sobre hombros. Rango COMPLETO: bajada total. Pausa 1 seg arriba.",why:"Gemelos: 50% fibras lentas = muchas reps. Rango completo con pausa = la diferencia."},
    {name:"Plancha Frontal",sets:3,reps:"30–45 seg",rest:60,rir:"—",sw:0,muscles:["Core","Recto Abdominal"],grip:"Codos bajo hombros. Cuerpo recto. Aprieta glúteos Y abdomen.",why:"El core es la base de TODOS los ejercicios. Sin core fuerte no progresas."}
  ]},
  null,
  {name:"UPPER B",label:"Hombros · Espalda · Tríceps · Manguito",exercises:[
    {name:"Press Militar con Barra (OHP)",sets:4,reps:"6–8",rest:150,rir:"RIR 2",sw:27.5,muscles:["Deltoides","Trapecio","Tríceps"],grip:"Agarre PRONO, algo más ancho que hombros. Barra desde clavículas, empuja arriba y ligeramente atrás.",why:"Ejercicio de hombros más completo. Activa deltoides + trapecio + tríceps + core de pie."},
    {name:"Dominadas Asistidas en Máquina",sets:4,reps:"8–10",rest:120,rir:"RIR 2",sw:35,muscles:["Espalda","Bíceps","Dorsal"],grip:"Agarre SUPINO, anchura hombros. Extensión total abajo, mentón sobre barra arriba. Peso = CONTRABALANCEO.",why:"Complementa jalón desde otro ángulo. Supino activa más bíceps. Progresa hasta dominadas libres."},
    {name:"Elevaciones Laterales con Mancuernas",sets:4,reps:"12–15",rest:60,rir:"RIR 2",sw:5,muscles:["Deltoides Lateral"],grip:"Codos ligeramente flexionados (15°). Sube hasta hombros, NO más. Bajada LENTA 3 seg.",why:"Único ejercicio que desarrolla deltoides LATERAL = anchura de hombros."},
    {name:"Remo en Polea Baja (Cable Row)",sets:3,reps:"10–12",rest:90,rir:"RIR 2",sw:30,muscles:["Espalda","Romboides","Trapecio"],grip:"Agarre NEUTRO con V-bar. Espalda recta. Tira al abdomen, codos pegados.",why:"Polea = tensión CONSTANTE. Trabaja romboides y trapecio medio = mejor postura."},
    {name:"Extensión de Tríceps con Cuerda",sets:3,reps:"12–15",rest:60,rir:"RIR 2",sw:12.5,muscles:["Tríceps"],grip:"Agarre neutro cuerda. Al bajar, SEPARA las manos al final para cabeza lateral.",why:"Cuerda activa 3 cabezas del tríceps. El tríceps es 60% del volumen del brazo."},
    {name:"Face Pull en Polea Alta",sets:3,reps:"15",rest:60,rir:"RIR 3",sw:12.5,muscles:["Manguito Rotador","Deltoides Posterior","Trapecio"],grip:"Cuerda a altura de cara. Tira separando brazos, codos ALTOS. Lento y controlado.",why:"Previene lesiones de hombro. Fortalece manguito rotador. NUNCA lo saltes."}
  ]},
  {name:"LOWER B",label:"Isquios · Glúteos · Cuádriceps · Core",exercises:[
    {name:"Peso Muerto Rumano con Barra",sets:4,reps:"6–8",rest:180,rir:"RIR 2",sw:45,muscles:["Isquios","Glúteos","Espalda Baja"],grip:"Agarre PRONO. Barra CERCA de piernas. Bisagra de cadera, NO curvar espalda.",why:"Mejor ejercicio para isquios y glúteos. Fortalece cadena posterior completa."},
    {name:"Hip Thrust con Barra en Banco",sets:4,reps:"10–12",rest:120,rir:"RIR 2",sw:35,muscles:["Glúteos","Isquios"],grip:"Espalda en borde del banco, barra sobre caderas con almohadilla. Empuje hasta horizontal. Pausa 1 seg.",why:"Activa glúteo al 200% vs sentadilla (EMG). Glúteo mayor = más testosterona."},
    {name:"Zancadas Inversas con Mancuernas",sets:3,reps:"10 c/pierna",rest:120,rir:"RIR 2",sw:9,muscles:["Cuádriceps","Glúteos","Isquios"],grip:"Agarre neutro, mancuernas a los lados. Paso ATRÁS: más seguro para rodillas.",why:"Cada pierna independiente = corrige desequilibrios."},
    {name:"Curl Femoral Sentado en Máquina",sets:3,reps:"12–15",rest:90,rir:"RIR 2",sw:17.5,muscles:["Isquios"],grip:"Rodillo sobre tendón de Aquiles. Espalda recta. Flexión completa, bajada controlada.",why:"Isquios en posición ACORTADA (diferente al curl tumbado del Lower A)."},
    {name:"Elevación de Gemelos Sentado (Máquina)",sets:4,reps:"15–20",rest:60,rir:"RIR 1",sw:30,muscles:["Sóleo","Gemelos"],grip:"Almohadillas sobre rodillas. Rango completo con pausa arriba y abajo.",why:"Trabaja el SÓLEO (profundo). Con gemelo de pie = desarrollo completo."},
    {name:"Crunch en Polea Alta (Cable Crunch)",sets:3,reps:"15",rest:60,rir:"RIR 2",sw:12.5,muscles:["Abdominales"],grip:"De rodillas, cuerda junto a la cabeza. Flexión de COLUMNA, NO inclinación de cadera.",why:"Más efectivo con carga progresiva para recto abdominal."}
  ]}
];

// ── COMIDAS ──
const MEALS = [
  {emoji:"🌅",name:"DESAYUNO",time:"7:00–8:00",kcal:"~600 kcal",foods:[{n:"3 huevos revueltos",p:"18g"},{n:"2 tostadas pan integral + aceite oliva",p:"6g"},{n:"250ml leche entera",p:"8g"},{n:"1 plátano",p:"1g"}],tot:"33g prot · 65g carbos"},
  {emoji:"🍎",name:"SNACK MAÑANA",time:"10:30–11:00",kcal:"~300 kcal",foods:[{n:"200g yogur griego natural",p:"20g"},{n:"30g frutos secos",p:"5g"},{n:"1 pieza de fruta",p:"1g"}],tot:"26g prot · 25g carbos"},
  {emoji:"🍛",name:"COMIDA",time:"13:30–14:30",kcal:"~700 kcal",foods:[{n:"200g arroz blanco cocido",p:"5g"},{n:"200g pechuga de pollo",p:"44g"},{n:"Verdura al gusto",p:"2g"},{n:"2 cucharadas aceite oliva",p:"0g"}],tot:"51g prot · 80g carbos"},
  {emoji:"💪",name:"MERIENDA / POST-GYM",time:"17:00–18:00",kcal:"~450 kcal",foods:[{n:"Bocadillo pan integral grande",p:"8g"},{n:"150g atún al natural",p:"35g"},{n:"1 vaso leche entera",p:"8g"}],tot:"51g prot · 50g carbos"},
  {emoji:"🌙",name:"CENA",time:"20:30–21:30",kcal:"~520 kcal",foods:[{n:"200g pescado (merluza/salmón/atún)",p:"38g"},{n:"150g patata o legumbres",p:"5g"},{n:"Ensalada + aceite oliva",p:"2g"}],tot:"45g prot · 40g carbos"}
];

// ── LEVANTAMIENTOS PRINCIPALES ──
const LIFTS = [
  {n:"Press Banca con Barra",k:"banca"},
  {n:"Sentadilla con Barra",k:"squat"},
  {n:"Peso Muerto Rumano",k:"rdl"},
  {n:"Press Militar (OHP)",k:"ohp"},
  {n:"Remo con Barra",k:"row"}
];

// ── MENSAJES MOTIVACIONALES ──
const MOTIV = [
  "💪 ¡Cada repetición te acerca a tu objetivo!",
  "🔥 El dolor es temporal, el orgullo es para siempre.",
  "🏆 No compitas con nadie, solo con quien eras ayer.",
  "⚡ Tu cuerpo puede aguantar casi todo. Convence a tu mente.",
  "🎯 Un año de constancia > toda una vida de motivación.",
  "💯 Los campeones entrenan cuando no tienen ganas.",
  "🌟 Hoy entrenas para el tú de mañana.",
  "🦾 50 kg hoy, 65 kg mañana. Paso a paso.",
  "🚀 Cada gramo de proteína construye tu futuro.",
  "🧠 La disciplina gana al talento. Siempre."
];

// ── BIBLIOTECA DE EJERCICIOS ──
const EXERCISE_LIB = [
  {name:"Press de Banca con Barra",muscle:"Pecho",secondary:["Tríceps","Deltoides Ant."],desc:"Ejercicio compuesto principal para pecho. Tumbado en banco plano, bajar barra al pecho y empujar.",errors:["Rebotar la barra en el pecho","Codos a 90° (riesgo hombro)","Agarre falso sin pulgares"],tip:"Retrae las escápulas y arquea ligeramente la espalda para proteger los hombros."},
  {name:"Sentadilla con Barra",muscle:"Cuádriceps",secondary:["Glúteos","Isquios","Core"],desc:"Rey de los ejercicios para piernas. Barra en espalda, bajar hasta paralelo o más.",errors:["Rodillas hacia dentro","Talones se levantan","Espalda demasiado inclinada"],tip:"Imagina que separas el suelo con los pies para activar glúteos."},
  {name:"Peso Muerto Rumano",muscle:"Isquios",secondary:["Glúteos","Espalda Baja"],desc:"Bisagra de cadera con barra. Baja barra cerca de piernas manteniendo espalda neutra.",errors:["Curvar la espalda baja","Flexionar demasiado las rodillas","Barra lejos del cuerpo"],tip:"Empuja las caderas hacia atrás como si cerraras una puerta con el trasero."},
  {name:"Press Militar (OHP)",muscle:"Deltoides",secondary:["Tríceps","Trapecio","Core"],desc:"Press de hombros de pie con barra. El más completo para deltoides.",errors:["Inclinar el tronco demasiado","No bloquear arriba","Arquear la lumbar"],tip:"Aprieta glúteos y abdomen para crear una base estable."},
  {name:"Dominadas",muscle:"Espalda",secondary:["Bíceps","Antebrazo"],desc:"Tracciones del propio cuerpo hacia una barra. El mejor ejercicio para espalda.",errors:["No llegar al rango completo","Balanceo excesivo","Solo usar los brazos"],tip:"Inicia el movimiento tirando los codos hacia abajo y atrás."},
  {name:"Remo con Barra",muscle:"Espalda",secondary:["Bíceps","Trapecio","Romboides"],desc:"Inclinado con torso paralelo al suelo, tira la barra al abdomen.",errors:["Usar impulso de cadera","Espalda curvada","Rango incompleto"],tip:"Piensa en llevar los codos al techo, no en tirar con las manos."},
  {name:"Curl con Barra EZ",muscle:"Bíceps",secondary:["Antebrazo"],desc:"Flexión de codos con barra angulada que reduce estrés en muñecas.",errors:["Balancear el cuerpo","Mover los codos","Velocidad excesiva"],tip:"Controla la fase excéntrica (bajada) en 3 segundos."},
  {name:"Fondos en Paralelas",muscle:"Tríceps",secondary:["Pecho Inferior","Deltoides"],desc:"Movimiento de empuje vertical del propio peso. Excelente para tríceps y pecho.",errors:["Bajar demasiado (lesión hombro)","No bloquear arriba","Hombros encogidos"],tip:"Inclínate ligeramente hacia delante para enfatizar pecho."},
  {name:"Elevaciones Laterales",muscle:"Deltoides",secondary:["Trapecio"],desc:"Mancuernas a los lados, sube brazos hasta altura de hombros.",errors:["Peso excesivo","Subir por encima del hombro","Sin control excéntrico"],tip:"Piensa que estás vertiendo agua de dos jarras a los lados."},
  {name:"Face Pull",muscle:"Deltoides Posterior",secondary:["Manguito Rotador","Trapecio"],desc:"En polea alta con cuerda, tira hacia la cara con codos altos.",errors:["Peso demasiado alto","Codos bajos","Tirar con trampas"],tip:"Es un ejercicio de salud articular, no de ego. Usa peso ligero."},
  {name:"Hip Thrust",muscle:"Glúteos",secondary:["Isquios"],desc:"Empuje de cadera con espalda apoyada en banco y barra sobre caderas.",errors:["Hiperextender la lumbar","No apretar arriba","Pies demasiado lejos"],tip:"Aprieta los glúteos 1 segundo en la posición más alta."},
  {name:"Extensiones de Cuádriceps",muscle:"Cuádriceps",secondary:[],desc:"Aislamiento de cuádriceps en máquina. Extiende las piernas contra resistencia.",errors:["Peso excesivo","Movimiento brusco","No llegar a extensión completa"],tip:"Controla la fase excéntrica en 3 seg para máxima hipertrofia."},
  {name:"Curl Femoral",muscle:"Isquios",secondary:[],desc:"Flexión de rodilla contra resistencia en máquina. Esencial para equilibrio.",errors:["Levantar las caderas","Rango incompleto","Velocidad excesiva"],tip:"Mantén las caderas pegadas al banco durante todo el movimiento."},
  {name:"Prensa de Piernas",muscle:"Cuádriceps",secondary:["Glúteos"],desc:"Empuje de piernas en máquina a 45°. Permite gran carga con seguridad.",errors:["Bloquear las rodillas","Pies demasiado bajos","Rango incompleto"],tip:"Coloca los pies más arriba para más glúteo, más abajo para más cuádriceps."},
  {name:"Elevación de Gemelos",muscle:"Gemelos",secondary:["Sóleo"],desc:"De pie o sentado, eleva los talones contra resistencia.",errors:["Rango incompleto","Sin pausa arriba","Rebotar abajo"],tip:"Estira completamente abajo y aprieta 1 seg arriba en cada rep."},
  {name:"Plancha",muscle:"Core",secondary:["Recto Abdominal","Oblicuos"],desc:"Posición de tabla sobre antebrazos manteniendo el cuerpo recto.",errors:["Caderas caídas","Caderas demasiado altas","Aguantar la respiración"],tip:"Aprieta glúteos y abdomen como si fueran a golpearte el estómago."},
  {name:"Cable Crunch",muscle:"Abdominales",secondary:["Oblicuos"],desc:"De rodillas frente a polea alta con cuerda. Flexión de columna con carga.",errors:["Mover las caderas","Tirar con los brazos","Peso excesivo"],tip:"Piensa en llevar las costillas hacia la pelvis, nada más."}
];

// ── MÚSCULOS PARA FILTRO DE BIBLIOTECA ──
const MUSCLE_GROUPS = ["Todos","Pecho","Espalda","Deltoides","Bíceps","Tríceps","Cuádriceps","Isquios","Glúteos","Gemelos","Core","Abdominales"];
