import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { questions } from './questions.js';
import './styles.css';

const TOTAL_TIME = 60 * 60;
const letters = ['A','B','C','D'];

function formatTime(seconds){
  const m = Math.floor(seconds / 60).toString().padStart(2,'0');
  const s = Math.floor(seconds % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function App(){
  const [started,setStarted]=useState(false);
  const [finished,setFinished]=useState(false);
  const [current,setCurrent]=useState(0);
  const [answers,setAnswers]=useState(()=>JSON.parse(localStorage.getItem('answers-erp-2026')||'{}'));
  const [timeLeft,setTimeLeft]=useState(()=>Number(localStorage.getItem('time-erp-2026')||TOTAL_TIME));
  const [dark,setDark]=useState(()=>localStorage.getItem('theme-erp-2026')==='dark');
  const [review,setReview]=useState(false);

  useEffect(()=>{document.body.classList.toggle('dark',dark); localStorage.setItem('theme-erp-2026',dark?'dark':'light')},[dark]);
  useEffect(()=>{localStorage.setItem('answers-erp-2026',JSON.stringify(answers))},[answers]);
  useEffect(()=>{localStorage.setItem('time-erp-2026',String(timeLeft))},[timeLeft]);
  useEffect(()=>{
    if(!started || finished) return;
    const id=setInterval(()=>setTimeLeft(t=>{
      if(t<=1){ setFinished(true); setReview(false); return 0; }
      return t-1;
    }),1000);
    return ()=>clearInterval(id);
  },[started,finished]);

  const stats = useMemo(()=>{
    let correct=0, incorrect=0, unanswered=0;
    questions.forEach(q=>{
      const a=answers[q.id];
      if(!a) unanswered++;
      else if(a===q.correctAnswer) correct++;
      else incorrect++;
    });
    return {correct, incorrect, unanswered, percent: Math.round((correct/questions.length)*100)};
  },[answers]);

  const reset=()=>{localStorage.removeItem('answers-erp-2026'); localStorage.removeItem('time-erp-2026'); setAnswers({}); setTimeLeft(TOTAL_TIME); setStarted(false); setFinished(false); setReview(false); setCurrent(0)};
  const q=questions[current];
  const select=(letter)=>{ if(finished) return; setAnswers(prev=>({...prev,[q.id]:letter})); };

  if(!started){
    return <main className="shell start-shell">
      <button className="theme" onClick={()=>setDark(!dark)}>{dark?'☀️ Claro':'🌙 Oscuro'}</button>
      <section className="start-card">
        <h1><span className="book">▌</span> Examen de Evaluación de Desempeño 2026</h1>
        <p className="subtitle"><b>40 preguntas</b> · Rendimiento Profesional Docente MINERD</p>
        <div className="instructions">
          <b>Instrucciones:</b>
          <ul>
            <li>⏱️ Tiempo total: <b>60 minutos (1 hora)</b></li>
            <li>📝 Total: <b>40 preguntas</b></li>
            <li>⬅️➡️ Puedes avanzar y retroceder entre preguntas</li>
            <li>✅ Al seleccionar una respuesta, verás inmediatamente si es correcta</li>
            <li>💡 Si fallas, se mostrará la explicación de la respuesta correcta</li>
            <li>🔵 Verde = correcta · Rojo = incorrecta · Gris = sin responder</li>
            <li>📊 Al finalizar verás tu puntuación total</li>
          </ul>
        </div>
        <button className="primary start" onClick={()=>setStarted(true)}>Comenzar Examen</button>
      </section>
    </main>
  }

  if(finished && !review){
    return <main className="shell">
      <section className="result-card">
        <h2>Resultados del Examen</h2>
        <p className="performance">{stats.percent>=80?'¡Excelente desempeño! 🎉':'Resultado registrado'}</p>
        <div className="score">{stats.correct}/{questions.length}</div>
        <div className="percent">{stats.percent}%</div>
        <div className="result-grid">
          <div><b>{stats.correct}</b><span>Correctas</span></div>
          <div><b>{stats.incorrect}</b><span>Incorrectas</span></div>
          <div><b>{stats.unanswered}</b><span>Sin contestar</span></div>
        </div>
        <div className="actions center"><button className="primary" onClick={()=>setReview(true)}>Revisar Respuestas</button><button onClick={reset}>Reiniciar Examen</button></div>
      </section>
    </main>
  }

  return <main className="shell exam-layout">
    <aside className="side">
      <div className="timer">⏱️ {formatTime(timeLeft)}</div>
      <div className="nav-grid">{questions.map((item,idx)=>{
        const a=answers[item.id];
        let cls='navbtn';
        if(idx===current) cls+=' current';
        if(review || finished){ if(!a) cls+=' empty'; else cls+= a===item.correctAnswer?' ok':' bad'; }
        else if(a) cls+=' answered';
        return <button className={cls} key={item.id} onClick={()=>setCurrent(idx)}>{idx+1}</button>
      })}</div>
      <div className="legend"><span>🟢 Correcta</span><span>🔴 Incorrecta</span><span>⚪ Sin responder</span></div>
      <button className="primary full" onClick={()=>setFinished(true)}>Finalizar evaluación</button>
      <button className="ghost full" onClick={()=>setDark(!dark)}>{dark?'Modo claro':'Modo oscuro'}</button>
    </aside>
    <section className="question-card">
      <span className="pill">Pregunta {current+1} de {questions.length}</span>
      <h2>{q.question}</h2>
      <img className="pdf-img" src={q.sourceImage} alt={`Pregunta ${current+1} tomada del PDF`} />
      <div className="options">{letters.map(l=>{
        const selected=answers[q.id]===l;
        const hasAnswer=!!answers[q.id] || review || finished;
        let cls='option';
        if(hasAnswer && l===q.correctAnswer) cls+=' correct';
        if(hasAnswer && selected && l!==q.correctAnswer) cls+=' wrong';
        if(selected) cls+=' selected';
        return <button className={cls} key={l} onClick={()=>select(l)} disabled={review || finished}>
          <span className="radio">{selected?'●':'○'}</span><b>{l}.</b><span>{q.options[l]}</span>
        </button>
      })}</div>
      {(answers[q.id] || review || finished) && <div className="explanation"><b>ℹ️ Explicación</b><p>{answers[q.id] ? (answers[q.id]===q.correctAnswer?'Respuesta correcta. ':'Respuesta incorrecta. ') : 'No respondiste esta pregunta. '}{q.explanation}</p></div>}
      <div className="actions"><button onClick={()=>setCurrent(Math.max(0,current-1))}>Anterior</button><button className="primary" onClick={()=>setCurrent(Math.min(questions.length-1,current+1))}>Siguiente</button></div>
    </section>
  </main>
}

createRoot(document.getElementById('root')).render(<App/>);
