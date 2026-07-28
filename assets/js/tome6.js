/* ===== ТОМ VI, ГЛАВА 16 — калькулятор боёвки =====
   Движок книги вызывает window.CH[16](pageEl).
   Данные сверены с разделом 10 «Мастерская мастера» Книги Мастера. */
(function(){
  const CH = (window.CH = window.CH || {});
  const $  = (s, r=document) => r.querySelector(s);
  const ce = (t, c, h) => { const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; };

  const STORE = "utyos_dice_v1";
  function loadState(){
    try{ return JSON.parse(localStorage.getItem(STORE)) || {history:[]}; }
    catch(e){ return {history:[]}; }
  }
  function saveState(s){ localStorage.setItem(STORE, JSON.stringify(s)); }

  /* ---------- ТАБЛИЦЫ ИЗ КНИГИ МАСТЕРА ---------- */
  const CRITS = [
    "Сломанная кость — Сл12 Телос, иначе помеха на атаки до конца боя",
    "Рассечение сухожилия — скорость цели уменьшается вдвое",
    "Потеря зрения — цель ослеплена на 1 раунд",
    "Кровотечение — 1к4 урона в ход до успешной Медицины Сл12",
    "Обезоруживание — оружие отлетает на 1к4×5 фт.",
    "Дополнительная атака — герой получает бонусную атаку",
  ];
  const WILD = [
    "Огонь из рук — 1к6 урона огнём себе",
    "Огонь из рук — 1к6 урона огнём себе",
    "Кожа становится фиолетовой на 1к4 часа",
    "Кожа становится фиолетовой на 1к4 часа",
    "Появляются 1к4 фантомных сов, кружат 1 минуту",
    "Появляются 1к4 фантомных сов, кружат 1 минуту",
    "Телепортация на 10 фт. в случайном направлении",
    "Телепортация на 10 фт. в случайном направлении",
    "Все в радиусе 30 фт. начинают петь (Сл10 Харизмы, чтобы остановиться)",
    "Все в радиусе 30 фт. начинают петь (Сл10 Харизмы, чтобы остановиться)",
  ];
  const AVG = [
    ["1к4","2.5"],["1к6","3.5"],["1к8","4.5"],["1к10","5.5"],["1к12","6.5"],["2к6","7"],
    ["1к4+3","5.5"],["1к6+3","6.5"],["1к8+3","7.5"],["1к8+5","9.5"],["2к6+3","10"],["2к8+5","14"],
  ];

  /* ---------- КАЛЬКУЛЯТОР ---------- */
  CH[16] = function(page){
    const c = $("#t6-16", page); if(!c) return; c.replaceChildren();
    const state = loadState();

    // Состояние калькулятора (в памяти, не сохраняется между перезагрузками страницы — это нормально)
    let recipe = []; // [{sides:6, count:2}, ...]
    let mod = 0;

    const wrap = ce("div","t6-wrap");

    // === Блок костей ===
    const dicePanel = ce("div","t6-panel");
    dicePanel.innerHTML = `<div class="t6-panel-title">Кости</div>`;
    const grid = ce("div","t6-grid");
    [4,6,8,10,12,20,100].forEach(s=>{
      const btn = ce("button","t6-die-btn", `к${s}`);
      btn.type="button";
      btn.addEventListener("click",()=>{
        const existing = recipe.find(r=>r.sides===s);
        if(existing) existing.count++;
        else recipe.push({sides:s, count:1});
        renderRecipe();
      });
      grid.appendChild(btn);
    });
    dicePanel.appendChild(grid);

    // Модификатор
    const modRow = ce("div","t6-mod-row");
    modRow.innerHTML = `
      <button class="t6-mod-btn t6-mod-dec" type="button">−</button>
      <span class="t6-mod-label">модификатор</span>
      <span class="t6-mod-val" id="t6-mod-val">0</span>
      <button class="t6-mod-btn t6-mod-inc" type="button">+</button>
    `;
    dicePanel.appendChild(modRow);

    // Рецепт
    const recipeBox = ce("div","t6-recipe", "—");
    dicePanel.appendChild(recipeBox);

    // Кнопки действий
    const actions = ce("div","t6-actions");
    const rollBtn = ce("button","t6-roll-btn", " БРОСИТЬ");
    rollBtn.type="button";
    const clearBtn = ce("button","t6-clear-btn", "очистить");
    clearBtn.type="button";
    actions.append(rollBtn, clearBtn);
    dicePanel.appendChild(actions);

    // Результат
    const resultBox = ce("div","t6-result");
    resultBox.innerHTML = `<div class="t6-result-big">—</div><div class="t6-result-break"></div>`;
    dicePanel.appendChild(resultBox);

    wrap.appendChild(dicePanel);

    // === История ===
    const histPanel = ce("div","t6-panel");
    histPanel.innerHTML = `<div class="t6-panel-title">История бросков</div>`;
    const histList = ce("div","t6-history");
    if(state.history.length === 0){
      histList.innerHTML = `<div class="t6-history-empty">Пока нет бросков</div>`;
    } else {
      state.history.slice().reverse().forEach(h=>{
        const item = ce("div","t6-hist-item "+(h.crit?"crit":"")+(h.fail?"fail":""));
        item.innerHTML = `<span class="t6-hist-recipe">${h.recipe}</span><span class="t6-hist-total">${h.total}</span>`;
        histList.appendChild(item);
      });
    }
    histPanel.appendChild(histList);
    const clearHistBtn = ce("button","t6-clear-hist-btn", "очистить историю");
    clearHistBtn.type="button";
    histPanel.appendChild(clearHistBtn);
    wrap.appendChild(histPanel);

    c.appendChild(wrap);

    // === Функции рендера ===
    function renderRecipe(){
      if(recipe.length === 0 && mod === 0){
        recipeBox.textContent = "—";
        return;
      }
      const parts = recipe.map(r=>`${r.count}к${r.sides}`);
      if(mod > 0) parts.push("+"+mod);
      else if(mod < 0) parts.push("−"+Math.abs(mod));
      recipeBox.textContent = parts.join(" + ");
    }

    function doRoll(){
      if(recipe.length === 0){
        resultBox.querySelector(".t6-result-big").textContent = "добавьте кости";
        return;
      }
      let total = 0;
      let breakdown = [];
      let isCrit = false, isFail = false;
      recipe.forEach(r=>{
        let sum = 0;
        let rolls = [];
        for(let i=0;i<r.count;i++){
          const v = Math.floor(Math.random()*r.sides)+1;
          rolls.push(v);
          sum += v;
          if(r.sides===20 && v===20) isCrit = true;
          if(r.sides===20 && v===1) isFail = true;
        }
        total += sum;
        breakdown.push(`${r.count}к${r.sides}: [${rolls.join(", ")}] = ${sum}`);
      });
      total += mod;
      resultBox.querySelector(".t6-result-big").textContent = total;
      resultBox.querySelector(".t6-result-big").className = "t6-result-big"+(isCrit?" crit":"")+(isFail?" fail":"");
      resultBox.querySelector(".t6-result-break").innerHTML = breakdown.join(" &nbsp;|&nbsp; ") + (mod!==0 ? ` &nbsp;|&nbsp; мод ${mod>0?"+":""}${mod}` : "");

      // Сохранить в историю
      state.history.push({recipe: recipeBox.textContent, total, crit:isCrit, fail:isFail, ts: Date.now()});
      if(state.history.length > 20) state.history.shift();
      saveState(state);
      // Обновить историю на экране
      histList.replaceChildren();
      state.history.slice().reverse().forEach(h=>{
        const item = ce("div","t6-hist-item "+(h.crit?"crit":"")+(h.fail?"fail":""));
        item.innerHTML = `<span class="t6-hist-recipe">${h.recipe}</span><span class="t6-hist-total">${h.total}</span>`;
        histList.appendChild(item);
      });
    }

    // === Обработчики ===
    rollBtn.addEventListener("click", doRoll);
    clearBtn.addEventListener("click",()=>{ recipe=[]; mod=0; renderRecipe();
      $("#t6-mod-val").textContent = "0";
      resultBox.querySelector(".t6-result-big").textContent = "—";
      resultBox.querySelector(".t6-result-big").className = "t6-result-big";
      resultBox.querySelector(".t6-result-break").textContent = "";
    });
    $(".t6-mod-inc", modRow).addEventListener("click",()=>{ mod++; $("#t6-mod-val").textContent = mod>0?"+"+mod:mod; renderRecipe(); });
    $(".t6-mod-dec", modRow).addEventListener("click",()=>{ mod--; $("#t6-mod-val").textContent = mod>0?"+"+mod:mod; renderRecipe(); });
    clearHistBtn.addEventListener("click",()=>{ state.history=[]; saveState(state);
      histList.innerHTML = `<div class="t6-history-empty">Пока нет бросков</div>`;
    });
  };

  /* ---------- ГЛАВА 16: ДОПОЛНИТЕЛЬНЫЕ БЛОКИ (криты, дикая магия, шпаргалка) ---------- */
  // Эти блоки добавляются ПОСЛЕ калькулятора через тот же вызов CH[16],
  // но в отдельном контейнере #t6-16-extra, который мы добавим в body главы.
  CH["16-extra"] = function(page){
    const c = $("#t6-16-extra", page); if(!c) return; c.replaceChildren();

    // Криты
    const critBox = ce("div","t6-section");
    critBox.innerHTML = `<div class="t6-section-title">Критические удары (нат20, бросьте d6)</div>`;
    const critList = ce("div","t6-crit-grid");
    CRITS.forEach((t,i)=>{
      const card = ce("button","t6-crit-card", `<span class="t6-crit-n">${i+1}</span><span class="t6-crit-t">${t}</span>`);
      card.type="button";
      card.addEventListener("click",()=>{
        // Бросить d6 и показать
        const r = Math.floor(Math.random()*6);
        critList.querySelectorAll(".t6-crit-card").forEach((c,j)=>c.classList.toggle("rolled", j===r));
        critList.querySelectorAll(".t6-crit-card").forEach((c,j)=>c.classList.toggle("dim", j!==r));
      });
      critList.appendChild(card);
    });
    critBox.appendChild(critList);
    c.appendChild(critBox);

    // Дикая магия
    const wildBox = ce("div","t6-section");
    wildBox.innerHTML = `<div class="t6-section-title">Дикая магия / сбой (бросьте d10)</div>`;
    const wildList = ce("div","t6-wild-grid");
    WILD.forEach((t,i)=>{
      const card = ce("button","t6-wild-card", `<span class="t6-wild-n">${i+1}</span><span class="t6-wild-t">${t}</span>`);
      card.type="button";
      card.addEventListener("click",()=>{
        const r = Math.floor(Math.random()*10);
        wildList.querySelectorAll(".t6-wild-card").forEach((c,j)=>c.classList.toggle("rolled", j===r));
        wildList.querySelectorAll(".t6-wild-card").forEach((c,j)=>c.classList.toggle("dim", j!==r));
      });
      wildList.appendChild(card);
    });
    wildBox.appendChild(wildList);
    c.appendChild(wildBox);

    // Шпаргалка
    const avgBox = ce("div","t6-section");
    avgBox.innerHTML = `<div class="t6-section-title">Шпаргалка по урону</div>`;
    const avgTable = ce("div","t6-avg-table");
    AVG.forEach(([dice, avg])=>{
      const row = ce("div","t6-avg-row");
      row.innerHTML = `<span class="t6-avg-dice">${dice}</span><span class="t6-avg-val">${avg}</span>`;
      avgTable.appendChild(row);
    });
    avgBox.appendChild(avgTable);

    const rulesBox = ce("div","t6-rules");
    rulesBox.innerHTML = `
      <div class="t6-rules-title">Правила расчёта</div>
      <ul class="t6-rules-list">
        <li><b>Обычная атака</b> = кость урона + модификатор характеристики + бонус магии</li>
        <li><b>Крит (нат20)</b> = все кости урона бросаются дважды + модификаторы (не удваиваются)</li>
        <li><b>Средний урон</b> используйте для быстрой оценки без броска</li>
        <li><b>Сопротивление</b> = половина урона (округлять вниз)</li>
        <li><b>Иммунитет</b> = 0 урона этого типа</li>
      </ul>
    `;
    avgBox.appendChild(rulesBox);
    c.appendChild(avgBox);
  };
})();
