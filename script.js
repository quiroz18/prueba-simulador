const TOTAL_TIME = 60 * 60;
let current = 0;
let answers = Array(QUESTIONS.length).fill(null);
let seconds = TOTAL_TIME;
let done = false;
let reviewMode = false;
const $ = id => document.getElementById(id);

function render() {
  const q = QUESTIONS[current];
  const answeredCount = answers.filter(Boolean).length;
  $('progressText').textContent = reviewMode
    ? `Revisión de respuestas · Pregunta ${current + 1} de ${QUESTIONS.length}`
    : `Pregunta ${current + 1} de ${QUESTIONS.length} · Respondidas: ${answeredCount}`;
  $('pill').textContent = reviewMode
    ? `Revisión · Pregunta ${current + 1} de ${QUESTIONS.length}`
    : `Pregunta ${current + 1} de ${QUESTIONS.length}`;
  $('qText').textContent = q.text;
  $('barFill').style.width = `${answeredCount / QUESTIONS.length * 100}%`;

  $('grid').innerHTML = QUESTIONS.map((x, i) => {
    const isCorrect = reviewMode && x.correct && answers[i] === x.correct;
    const isWrong = reviewMode && x.correct && answers[i] && answers[i] !== x.correct;
    const isBlank = !answers[i];
    return `<button class="${i === current ? 'current ' : ''}${isBlank ? 'unanswered ' : ''}${isCorrect ? 'grid-correct ' : ''}${isWrong ? 'grid-wrong ' : ''}" onclick="go(${i})">${i + 1}</button>`;
  }).join('');

  $('options').innerHTML = q.options.map(o => {
    const selected = answers[current] === o.key;
    const correct = reviewMode && q.correct === o.key;
    const wrong = reviewMode && selected && q.correct && q.correct !== o.key;
    const noKey = reviewMode && !q.correct;
    let badge = '';
    if (correct) badge = '<strong class="badge ok-badge">Correcta</strong>';
    if (wrong) badge = '<strong class="badge bad-badge">Tu respuesta</strong>';
    if (noKey && selected) badge = '<strong class="badge neutral-badge">Seleccionada</strong>';

    return `<label class="option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}">
      <input type="radio" name="opt" ${selected ? 'checked' : ''} ${reviewMode ? 'disabled' : ''} onchange="select('${o.key}')">
      <span><span class="key">${o.key}.</span>${o.text} ${badge}</span>
    </label>`;
  }).join('');

  const note = document.getElementById('reviewNote');
  if (note) note.remove();
  if (reviewMode) {
    const info = document.createElement('div');
    info.id = 'reviewNote';
    info.className = 'review-note';
    info.textContent = q.correct
      ? (answers[current] ? `Respuesta correcta: ${q.correct}` : `No contestaste esta pregunta. Respuesta correcta: ${q.correct}`)
      : 'Esta pregunta aún no tiene clave correcta registrada en questions.js.';
    $('options').after(info);
  }

  $('prevBtn').disabled = current === 0;
  $('nextBtn').textContent = current === QUESTIONS.length - 1 ? 'Última pregunta' : 'Siguiente →';
  $('finishBtn').textContent = reviewMode ? 'Volver a resultados' : 'Finalizar examen';
}

function select(k) {
  if (reviewMode) return;
  answers[current] = k;
  render();
}

function go(i) {
  current = i;
  render();
  scrollTo({ top: 0, behavior: 'smooth' });
}

$('prevBtn').onclick = () => { if (current > 0) { current--; render(); } };
$('nextBtn').onclick = () => { if (current < QUESTIONS.length - 1) { current++; render(); } };
$('finishBtn').onclick = () => reviewMode ? showResults() : finish();
$('themeBtn').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.theme = document.body.classList.contains('dark') ? 'dark' : 'light';
};

function tick() {
  if (done || reviewMode) return;
  seconds--;
  if (seconds <= 0) { seconds = 0; finish(); }
  let m = String(Math.floor(seconds / 60)).padStart(2, '0');
  let s = String(seconds % 60).padStart(2, '0');
  $('timer').textContent = `${m}:${s}`;
}

function calculateResults() {
  let blank = answers.filter(a => !a).length;
  let correct = 0;
  let graded = 0;
  QUESTIONS.forEach((q, i) => {
    if (q.correct) {
      graded++;
      if (answers[i] === q.correct) correct++;
    }
  });
  let incorrect = graded ? graded - correct : answers.filter(Boolean).length;
  return { blank, correct, graded, incorrect };
}

function showResults() {
  const { blank, correct, graded, incorrect } = calculateResults();
  reviewMode = false;
  done = true;
  $('exam').classList.add('hidden');
  $('results').classList.remove('hidden');
  $('score').textContent = graded ? `${correct}/${QUESTIONS.length}` : `${answers.filter(Boolean).length}/${QUESTIONS.length}`;
  $('percent').textContent = graded ? `${Math.round(correct / QUESTIONS.length * 100)}%` : 'Sin clave de respuestas';
  $('ok').textContent = correct;
  $('bad').textContent = incorrect;
  $('blank').textContent = blank;
  $('message').textContent = graded ? '¡Excelente desempeño! 🎉' : 'Interfaz lista: agrega la clave en questions.js para calificar automáticamente.';
}

function finish() {
  showResults();
}

function restartExam() {
  answers = Array(QUESTIONS.length).fill(null);
  current = 0;
  seconds = TOTAL_TIME;
  done = false;
  reviewMode = false;
  $('timer').textContent = '60:00';
  $('results').classList.add('hidden');
  $('exam').classList.remove('hidden');
  render();
}

function reviewAnswers() {
  reviewMode = true;
  done = true;
  current = 0;
  $('results').classList.add('hidden');
  $('exam').classList.remove('hidden');
  render();
}

if (localStorage.theme === 'dark') document.body.classList.add('dark');
render();
setInterval(tick, 1000);
