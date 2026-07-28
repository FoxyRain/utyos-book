/* ===== ТОМ I — оживление глав 1, 2, 3 =====
   Движок книги (book.js) после перелистывания страницы вызывает window.CH[номер](pageEl).
   Всё, что ниже, — интерактив Тома I; данные сверены с Книгой Мастера. */
(function(){
  const CH = (window.CH = window.CH || {});
  const $  = (s, r=document) => r.querySelector(s);
  const ce = (t, c, h) => { const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; };

  /* ---------- ГЛАВА 1: совет + состав населения ---------- */
  const POP = [
    {r:"дварфы",      p:40, c:"#9aa6b2"},
    {r:"люди",        p:30, c:"#c79a3f"},
    {r:"полурослики", p:15, c:"#7fae6a"},
    {r:"эльфы",       p:10, c:"#9a82b4"},
    {r:"прочие",      p:5,  c:"#8a7a5a"},
  ];
  const COUNCIL = [
    {n:"Эльдар Седой", role:"бургомистр · человек, 60 лет", seal:"#9c2b22",
      t:"Глава совета и лицо города. Стар и осторожен, боится скандалов. Даёт завязку кампании и квесты «Кузница короля», «Бумажный король», «Цепная реакция»."},
    {n:"Кхадгар", role:"советник · дварф‑кузнец", seal:"#c79a3f",
      t:"Молот +5, КД15. Кузница у Северных ворот. Заказчик квестов про руду и драконью чешую; выковывает предмет +2 по чертежу гномьей кузни."},
    {n:"Мирабель", role:"советник · глава «Золотой Скобы»", seal:"#7c5e28",
      t:"ХАР18, полуэльфийка. Водит Эльдаза за руку через совет. Тайно отмывает деньги «Серой крысы» и связана с Мадам Ирис."},
    {n:"Кессель", role:"советник · верховный маршал", seal:"#5d6873",
      t:"Толст, ленив, берёт взятки до 200 зм/мес. На бумаге держит порядок — и именно поэтому Миранда и Брунхильда бессильны без досье."},
  ];
  CH[1] = function(page){
    const pop = $("#councilPop", page), council = $("#council", page);
    if(!pop || !council) return;
    pop.replaceChildren(); council.replaceChildren();
    // живая полоса состава
    const bar = ce("div","t1-popbar");
    POP.forEach(d=>{
      const seg = ce("div","t1-seg"); seg.style.width=d.p+"%"; seg.style.background=d.c;
      seg.title = d.r+" — "+d.p+"%"; seg.setAttribute("aria-label", d.r+" "+d.p+" процентов");
      seg.innerHTML = `<span>${d.p}</span>`; bar.appendChild(seg);
    });
    const leg = ce("div","t1-popleg");
    POP.forEach(d=> leg.appendChild(ce("span","t1-pl", `<i style="background:${d.c}"></i>${d.r}`)) );
    pop.append(bar, leg);
    // медальоны совета (раскрываются по клику)
    COUNCIL.forEach((m,i)=>{
      const card = ce("button","t1-medal"); card.type="button";
      card.setAttribute("aria-expanded","false");
      card.innerHTML =
        `<span class="t1-wax" style="--wc:${m.seal}"><span class="t1-ini">${m.n[0]}</span></span>`+
        `<span class="t1-mn">${m.n}</span><span class="t1-mr">${m.role}</span>`+
        `<span class="t1-mt">${m.t}</span>`;
      card.addEventListener("click",()=>{
        const open = card.classList.toggle("open");
        card.setAttribute("aria-expanded", open?"true":"false");
      });
      card.style.animationDelay = (i*70)+"ms";
      council.appendChild(card);
    });
  };

  /* ---------- ГЛАВА 2: кликабельный чертёж города ---------- */
  // type: gate/forge/law/guild/shadow/temple/plot/danger — цвет маркера
  const LOCS = {
    ngate:{x:380,y:18,w:240,h:34, name:"Северные ворота", kind:"ворота · пост стражи", col:"law",
      mech:"Досмотр: Сл15 Скрытность пронести запрещённое. Рядом — кузница Кхадгара.", who:"сержант Гор", thread:"глава 4 «Стража»"},
    forge:{x:60,y:96,w:420,h:118, name:"Кузница Кхадгара", kind:"ремесло", col:"forge",
      mech:"Заточка оружия (+1 урон на 1 бой) — 5 зм. Сюда несут руду и чешую.", who:"Кхадгар", thread:"глава 4 / квесты 1, 8"},
    armor:{x:520,y:96,w:420,h:118, name:"Лавка Серафины", kind:"бронник", col:"forge",
      mech:"Починка брони (+1 КД) — 10 зм. Заказчица квестов про шкуры и паучий шёлк.", who:"Серафина", thread:"квесты 3, 7, 8, 10, 17"},
    hall :{x:60,y:250,w:210,h:118, name:"Ратуша", kind:"власть", col:"law",
      mech:"Лицензия на оружие — 50/100 зм/мес. Суд бургомистра 25‑го числа.", who:"Эльдар Седой", thread:"глава 1 / квесты 4, 18, 25, 27, 28"},
    tavern:{x:290,y:250,w:200,h:118, name:"Таверна Грегори", kind:"хаб кампании", col:"gold",
      mech:"Ужин 2 см (восст. 1к4 ХП). Слухи 5–50 зм. Бесплатный эль 15‑го.", who:"Грегори", thread:"квесты 9, 16, 20, 22, 23"},
    market:{x:510,y:250,w:210,h:118, name:"Рынок · Фонтанная площадь", kind:"торговля", col:"gold",
      mech:"Фонтан «Слеза гнома» лечит 1 хит раз в день. Карманники: Сл13 Ловкость рук. События — d12.", who:"—", thread:"глава 3 (d12 площади)"},
    temple:{x:740,y:250,w:200,h:118, name:"Храм Светоча", kind:"храм", col:"temple",
      mech:"Лечение 1к8+3 — 25 зм. Снятие проклятия — 150 зм. Призраки по четвергам.", who:"жрец Теодор", thread:"квесты 14, 19"},
    guild:{x:60,y:404,w:220,h:118, name:"Гильдия «Золотая Скоба»", kind:"фракция", col:"guild",
      mech:"Контракты, доска d10, репутация Медный→Платиновый. Сейф за портретом: Сл18 Взлом.", who:"Мирабель", thread:"глава 5"},
    mine :{x:300,y:404,w:200,h:118, name:"Шахта «Глубокая жила»", kind:"завязка сюжета", col:"plot",
      mech:"Восточный ствол, три развилки. Раненый Торин, ключ‑кристалл из 3 осколков.", who:"гном Торин", thread:"глава 8 (Этапы 0–1)"},
    lily :{x:520,y:404,w:200,h:118, name:"Бордель «Лунная Лилия»", kind:"фракция · тень", col:"shadow",
      mech:"Услуги 1–25 зм, информация от Ирис 10–100 зм (80%). Тайный ход в катакомбы.", who:"Мадам Ирис", thread:"глава 7"},
    sgate:{x:740,y:404,w:200,h:118, name:"Южные ворота", kind:"ворота · патруль", col:"law",
      mech:"Патруль лейтенанта Гора. Красильня Джарека и портовые склады — рядом.", who:"лейтенант Гор", thread:"глава 4 / квест 12"},
    // внешние точки за стеной
    aqued:{x:60,y:560,w:150,h:46, name:"Старый акведук", kind:"вне стены · руины", col:"shadow",
      mech:"Тайный вход в катакомбы «Серой крысы»: Сл17 Внимание. Убежище Ренальда.", who:"—", thread:"глава 6 / квест 2"},
    grave:{x:430,y:560,w:150,h:46, name:"Кладбище", kind:"вне стены", col:"temple",
      mech:"Мандрагора на могиле невинного — только в Ночь мёртвых (10‑е).", who:"—", thread:"квест 14"},
    ruins:{x:790,y:560,w:150,h:46, name:"Руины крепости", kind:"вне стены", col:"danger",
      mech:"Следы первой печати гномов. Зацепка на легенду и Спящего Кошмара.", who:"—", thread:"глава 1 / глава 11"},
  };
  const COL = {law:"#9aa6b2",forge:"#d77a32",gold:"#c79a3f",temple:"#e8c468",
               guild:"#c79a3f",shadow:"#9a82b4",plot:"#cf3a2c",danger:"#b15a3a"};

  function citySVG(){
    let g="";
    for(const k in LOCS){ const L=LOCS[k];
      g += `<g class="t1-loc" data-loc="${k}" tabindex="0" role="button" `+
           `aria-label="${L.name}">`+
           `<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="3" `+
           `style="--lc:${COL[L.col]}"/>`+
           `<text x="${L.x+L.w/2}" y="${L.y+L.h/2}" >${L.name}</text></g>`;
    }
    return `<svg viewBox="0 0 1000 624" preserveAspectRatio="xMidYMid meet" role="img" `+
      `aria-label="Схема Стального Утёса">`+
      `<defs><pattern id="t1hatch" width="7" height="7" patternUnits="userSpaceOnUse" `+
      `patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" `+
      `stroke="rgba(42,32,20,.10)" stroke-width="1"/></pattern></defs>`+
      // внешняя стена
      `<rect x="34" y="64" width="932" height="478" fill="url(#t1hatch)" `+
      `stroke="#5a4a32" stroke-width="5"/>`+
      `<rect x="34" y="64" width="932" height="478" fill="none" `+
      `stroke="#2a2014" stroke-width="1.4" stroke-dasharray="2 6"/>`+
      // улицы
      `<line x1="500" y1="96" x2="500" y2="522" stroke="rgba(42,32,20,.22)" stroke-width="10"/>`+
      `<line x1="60" y1="232" x2="940" y2="232" stroke="rgba(42,32,20,.22)" stroke-width="10"/>`+
      `<line x1="60" y1="386" x2="940" y2="386" stroke="rgba(42,32,20,.22)" stroke-width="10"/>`+
      g +
      `<text x="500" y="612" text-anchor="middle" class="t1-cap">Стальной Утёс · чертёж для ведущего</text>`+
      `</svg>`;
  }
  CH[2] = function(page){
    const map=$("#cityMap",page), panel=$("#locPanel",page);
    if(!map||!panel) return;
    map.innerHTML = citySVG();
    const svg = $("svg", map);
    function select(k){
      const L=LOCS[k]; if(!L) return;
      svg.querySelectorAll(".t1-loc").forEach(g=>g.classList.toggle("sel", g.dataset.loc===k));
      panel.classList.add("live");
      panel.innerHTML =
        `<span class="t1-lp-dot" style="background:${COL[L.col]}"></span>`+
        `<div class="t1-lp-h">${L.name}<small>${L.kind}</small></div>`+
        `<div class="t1-lp-mech"><b>Механика.</b> ${L.mech}</div>`+
        `<div class="t1-lp-who"><b>Кого встретить:</b> ${L.who}</div>`+
        `<div class="t1-lp-thread">нитка → ${L.thread}</div>`;
    }
    svg.querySelectorAll(".t1-loc").forEach(g=>{
      g.addEventListener("click", ()=>select(g.dataset.loc));
      g.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault(); select(g.dataset.loc);} });
    });
    panel.innerHTML = `<div class="t1-lp-hint">Наведите или нажмите квартал на чертеже — `+
      `здесь всплывёт его механика, жители и нитка в нужный раздел книги.</div>`;
  };

  /* ---------- ГЛАВА 3: календарь‑циферблат + d12 площади ---------- */
  const CAL = {
    1 :{ev:"Базарный день",        note:"Скидки 10% на рынке. Толпа — карманникам раздолье.", mood:"market"},
    5 :{ev:"День кузнеца",         note:"Турнир кузнецов у Кхадгара, приз 200 зм. Искры над горном.", mood:"forge"},
    10:{ev:"Ночь мёртвых",         note:"Призраки активны, нежить бродит. Мандрагора плачет на кладбище.", mood:"dead"},
    15:{ev:"День единства",        note:"Бесплатный эль в таверне Грегори. Город гуляет — стража пьянеет.", mood:"unity"},
    20:{ev:"Прибытие каравана",    note:"Редкие товары у Норвина. Контрабандисты в порту шевелятся.", mood:"caravan"},
    25:{ev:"Судилище",             note:"Суд бургомистра. Рольф «списывает» неугодных из «Ямы».", mood:"court"},
    30:{ev:"Полнолуние",           note:"Культисты «Чёрного Сердца» максимально активны. Идеально для кульминации.", mood:"moon"},
  };
  const SQUARE = [
    "Карманник тянет кошелёк — Сл13 Ловкость рук, 10 зм.",
    "Фокусник дарит карту сокровищ (настоящая ли?).",
    "Фальшивое зелье с лотка — отравление, Сл12 Телос.",
    "Мошенник сбывает фальшивую монету — Сл14 Проницательность.",
    "Грибной дождь над рядами — галлюцинации, Сл12 Мудрость.",
    "Бродячий бард играет — +1 к Убеждению на 1 час.",
    "Пророк шепчет о «грядущей тени» (зацепка на культ).",
    "Детская банда тянет к тайному ходу — Сл13 пойти за ними.",
    "Бешеный бык несётся по рядам — 10 урона, Сл12 Ловкость.",
    "Проклятый амулет на прилавке — 1к6 некротики при касании.",
    "Аукцион редких трав — ставка от 120 зм.",
    "Пожар на лотке — помощь даёт +репутацию в городе.",
  ];
  function moodClass(d){ return CAL[d] ? CAL[d].mood : "quiet"; }
  CH[3] = function(page){
    const wrap=$("#calendar",page); if(!wrap) return;
    wrap.replaceChildren();
    wrap.className = "t1-cal";
    // циферблат‑полоса с восковыми насечками
    const dial = ce("div","t1-dial");
    const track = ce("div","t1-track");
    for(let d=1; d<=30; d++){
      const k = CAL[d];
      const tk = ce("button","t1-tk"+(k?" major":""), `<i></i><span class="t1-dn">${d}</span>`);
      tk.type="button"; tk.dataset.d=d; tk.title = k? (d+" — "+k.ev) : ("день "+d);
      if(k) tk.innerHTML += `<span class="t1-te">${k.ev}</span>`;
      tk.addEventListener("click",()=>{ slider.value=d; render(d); });
      track.appendChild(tk);
    }
    const slider = ce("input","t1-slider"); slider.type="range";
    slider.min=1; slider.max=30; slider.value=1; slider.setAttribute("aria-label","День месяца");
    dial.append(track, slider);
    // карточка «сегодня»
    const now = ce("div","t1-now");
    // кнопка d12
    const roll = ce("div","t1-roll");
    roll.innerHTML = `<button class="t1-rollbtn" type="button">бросить d12 · событие площади</button>`+
                     `<div class="t1-rollout" aria-live="polite"></div>`;
    wrap.append(dial, now, roll);

    function render(d){
      d=+d;
      wrap.dataset.mood = moodClass(d);
      // подсветка насечки
      track.querySelectorAll(".t1-tk").forEach(t=>t.classList.toggle("on", +t.dataset.d===d));
      const k = CAL[d];
      now.innerHTML =
        `<div class="t1-now-day"><span class="t1-nd-n">${d}</span><span class="t1-nd-m">день месяца</span></div>`+
        `<div class="t1-now-body">`+
          `<div class="t1-now-ev">${k? k.ev : "Тихий день"}</div>`+
          `<div class="t1-now-note">${k? k.note : "Ничего из календаря не горит — бросьте d12 площади или назначьте свою встречу."}</div>`+
        `</div>`+
        `<div class="t1-now-moon" aria-hidden="true"></div>`;
    }
    slider.addEventListener("input", ()=>render(slider.value));

    // d12 площади
    const out = $(".t1-rollout", roll);
    $(".t1-rollbtn", roll).addEventListener("click", ()=>{
      const btn=$(".t1-rollbtn",roll); btn.classList.add("spin");
      let t=0; const spin=setInterval(()=>{ out.textContent="⚀ "+(Math.floor(Math.random()*12)+1); t++;
        if(t>7){ clearInterval(spin); btn.classList.remove("spin");
          const r=Math.floor(Math.random()*12); // 0..11
          out.innerHTML=`<b>${r+1}</b> — ${SQUARE[r]}`; out.classList.remove("flash"); void out.offsetWidth; out.classList.add("flash");
        }
      },55);
    });

    render(1);
  };
})();
