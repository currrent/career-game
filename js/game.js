(() => {
 const $=id=>document.getElementById(id), E=window.GameEconomy;
 const state={
   balance:0,totalEarned:0,totalClicks:0,income:0,owned:{},clickPower:1,
   lastSeen:Date.now(),lastBonus:0,achievements:[],activeTab:"home"
 };
 let lastFrame=Date.now(), saveTimer=0;
 const saved=GameStorage.load();
 if(saved){Object.assign(state,saved);state.owned=state.owned||{};state.achievements=state.achievements||[];}
 const totalOwned=()=>Object.values(state.owned).reduce((a,b)=>a+b,0);
 const rankIndex=()=>{let idx=0;for(let i=0;i<RANKS.length;i++)if(state.totalEarned>=RANKS[i].need)idx=i;return idx;};
 const nextRank=()=>RANKS[Math.min(rankIndex()+1,RANKS.length-1)];
 function addMoney(amount){state.balance+=amount;state.totalEarned+=amount;checkAchievements();updateUI();}
 function buy(item){
   const count=state.owned[item.id]||0, price=E.cost(item.base,count);
   if(state.balance<price){GameFX.toast("Пока не хватает рублей");return;}
   state.balance-=price;state.owned[item.id]=count+1;state.income+=item.income;
   if(item.rank>rankIndex()+1)GameFX.toast("Новый карьерный уровень открыт!");
   else GameFX.toast(item.name+" куплен! Доход растёт 🚀");
   renderUpgrades();updateUI();save();
 }
 function renderUpgrades(){
   const list=$("upgradeList");list.innerHTML="";
   UPGRADES.forEach(item=>{
     const count=state.owned[item.id]||0,price=E.cost(item.base,count),can=state.balance>=price;
     const card=document.createElement("article");card.className="upgrade-card"+(can?" can-buy":"");
     card.innerHTML=`<div class="upgrade-art">${item.icon}</div><div class="upgrade-copy"><strong>${item.name} <span style="color:#aaa8dc;font-size:10px">×${count}</span></strong><em>+${E.format(item.income)} ₽/сек</em><small>${item.role}</small></div><button class="buy-btn ${can?"ready":""}" type="button">Купить<strong>🪙 ${E.format(price)} ₽</strong></button>`;
     card.querySelector("button").addEventListener("click",()=>buy(item));list.appendChild(card);
   });
   $("ownedCount").textContent=totalOwned()+" куплено";
 }
 function updateUI(){
   $("balance").textContent=E.money(state.balance);
   $("income").textContent="+"+E.format(state.income)+" ₽/сек";
   $("clickValue").textContent="+"+E.format(state.clickPower)+" ₽ за клик";
   const idx=rankIndex(),rank=RANKS[idx],next=RANKS[Math.min(idx+1,9)];
   $("rankName").textContent=rank.name;$("rankNumber").textContent="УРОВЕНЬ "+(idx+1)+"/10";
   $("rankBadge").textContent=idx+1;
   const progress=idx===9?100:Math.max(0,Math.min(100,(state.totalEarned-rank.need)/(next.need-rank.need)*100));
   $("rankProgress").style.width=progress+"%";
   $("rankHint").textContent=idx===9?"Максимальный уровень достигнут!":"До "+next.name+": "+E.money(Math.max(0,next.need-state.totalEarned));
   $("bonusDot").style.display=(Date.now()-state.lastBonus>=86400000)?"block":"none";
   document.querySelectorAll(".upgrade-card").forEach((card,i)=>{
     const item=UPGRADES[i];if(!item)return;const price=E.cost(item.base,state.owned[item.id]||0);
     const can=state.balance>=price;card.classList.toggle("can-buy",can);
     const btn=card.querySelector("button");if(btn)btn.classList.toggle("ready",can);
   });
   if(state.activeTab==="stats")renderTab("stats");
 }
 function clickWork(target){
   addMoney(state.clickPower);state.totalClicks++;
   const rect=(target||$("laptop")).getBoundingClientRect();
   GameFX.burst(rect.left+rect.width/2,rect.top+rect.height/2,state.clickPower);
   $("laptop").classList.remove("clicked");void $("laptop").offsetWidth;$("laptop").classList.add("clicked");
   saveSoon();
 }
 function renderTab(tab){
   state.activeTab=tab;
   $("upgradeSection").classList.toggle("hidden",tab!=="home");
   $("work-scene")?.classList.toggle("hidden",tab!=="home");
   $("earnBtn").classList.toggle("hidden",tab!=="home");
   const panel=$("tabPanel");panel.classList.toggle("hidden",tab==="home");
   document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
   if(tab==="home")return;
   if(tab==="stats"){
     panel.innerHTML=`<h2>📊 Твоя статистика</h2><div class="stat-grid">
      <div class="stat-box"><small>Заработано всего</small><strong>${E.money(state.totalEarned)}</strong></div>
      <div class="stat-box"><small>Доход в секунду</small><strong>${E.format(state.income)} ₽</strong></div>
      <div class="stat-box"><small>Всего кликов</small><strong>${E.format(state.totalClicks)}</strong></div>
      <div class="stat-box"><small>Куплено улучшений</small><strong>${totalOwned()}</strong></div>
      </div><p class="shop-note">Твой следующий карьерный рубеж — ${nextRank().name}. Не забывай забирать бонусы и вкладывать доход в улучшения.</p>`;
   }else if(tab==="achievements"){
     panel.innerHTML="<h2>🏆 Достижения</h2>"+ACHIEVEMENTS.map(a=>{const done=state.achievements.includes(a.id);return `<div class="achievement ${done?"done":""}"><span class="medal">${a.icon}</span><div><b>${a.name} ${done?"✓":""}</b><small>${a.desc}</small></div></div>`}).join("");
   }else if(tab==="bonus"){
     const ready=Date.now()-state.lastBonus>=86400000;
     panel.innerHTML=`<div class="bonus-card"><div class="gift">🎁</div><h2>Ежедневный бонус</h2><p class="shop-note">Забирай подарок раз в 24 часа. Размер бонуса зависит от твоего пассивного дохода.</p><button id="claimBonus" ${ready?"":"disabled"}>${ready?"Забрать "+E.money(Math.max(25,state.income*60)):"Бонус уже получен"}</button></div>`;
     $("claimBonus")?.addEventListener("click",()=>{if(Date.now()-state.lastBonus<86400000)return;const gift=Math.max(25,state.income*60);state.lastBonus=Date.now();addMoney(gift);GameFX.toast("Бонус получен: "+E.money(gift));renderTab("bonus");save();});
   }else if(tab==="shop"){
     panel.innerHTML=`<h2>🛒 Магазин</h2><p class="shop-note">Здесь появятся косметические предметы, новые рабочие места и усилители. Пока прокачивай карьеру в разделе «Главная».</p><div class="bonus-card"><div class="gift">🪴 💻 🏡</div><b>Новые рабочие места</b><p class="shop-note">Визуальные темы будут открываться по мере карьерного роста.</p></div>`;
   }
 }
 function checkAchievements(){
   ACHIEVEMENTS.forEach(a=>{if(state.totalEarned>=a.goal&&!state.achievements.includes(a.id)){state.achievements.push(a.id);GameFX.toast("Достижение: "+a.name+" 🏆");}});
 }
 function save(){state.lastSeen=Date.now();GameStorage.save(state);}
 function saveSoon(){if(saveTimer)return;saveTimer=setTimeout(()=>{saveTimer=0;save();},700);}
 function tick(){
   const now=Date.now(),dt=Math.min((now-lastFrame)/1000,5);lastFrame=now;
   if(state.income>0&&dt>0){state.balance+=state.income*dt;state.totalEarned+=state.income*dt;checkAchievements();updateUI();}
   saveSoon();
   requestAnimationFrame(tick);
 }
 function init(){
   // Offline earnings, capped at eight hours.
   if(saved){const away=Math.min(Math.max(0,(Date.now()-(saved.lastSeen||Date.now()))/1000),E.maxOfflineSeconds);const gain=away*(state.income||0);if(gain>=1){state.balance+=gain;state.totalEarned+=gain;setTimeout(()=>GameFX.toast("Пока тебя не было: +"+E.money(gain)),500);}}
   renderUpgrades();updateUI();
   $("earnBtn").addEventListener("click",()=>clickWork($("laptop")));
   $("laptop").addEventListener("click",()=>clickWork($("laptop")));
   $("laptop").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();clickWork($("laptop"));}});
   document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>renderTab(b.dataset.tab)));
   $("settingsBtn").addEventListener("click",()=>{if(confirm("Сбросить весь игровой прогресс? Это действие нельзя отменить.")){GameStorage.reset();location.reload();}});
   document.addEventListener("visibilitychange",()=>{if(document.hidden)save();else{lastFrame=Date.now();}});
   window.addEventListener("beforeunload",save);
   requestAnimationFrame(tick);
 }
 init();
})();