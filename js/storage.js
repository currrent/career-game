window.GameStorage = {
  key:"careerGameSave_v1",
  load(){
    try { return JSON.parse(localStorage.getItem(this.key)) || null; }
    catch(e){ return null; }
  },
  save(state){
    try { localStorage.setItem(this.key, JSON.stringify(state)); }
    catch(e){ console.warn("Не удалось сохранить игру",e); }
  },
  reset(){ localStorage.removeItem(this.key); }
};
