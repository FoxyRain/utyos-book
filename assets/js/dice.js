/* Плавающая кость ведущего — зачаток «Стола ведущего» (глава 16).
   Сейчас: бросок d20 с анимацией, подсветкой крита/провала и логом последних бросков. */
(function(){
  const btn=$("#diceBtn"), face=$("#diceFace"), log=$("#diceLog");
  if(!btn) return;
  const history=[];
  function paintLog(){
    log.innerHTML = history.slice(-5).map(h=>
      `<span class="${h===20?'c':h===1?'f':''}">${h}</span>`).join("");
  }
  function roll(){
    btn.classList.remove("crit","fail"); btn.classList.add("rolling");
    let ticks=0;
    const spin=setInterval(()=>{ face.textContent=Math.floor(Math.random()*20)+1; ticks++;
      if(ticks>8){ clearInterval(spin);
        const r=Math.floor(Math.random()*20)+1;
        face.textContent=r; btn.classList.remove("rolling");
        if(r===20) btn.classList.add("crit");
        if(r===1)  btn.classList.add("fail");
        history.push(r); paintLog();
      }
    },55);
  }
  btn.addEventListener("click", roll);
})();
