window.GameFX = {
  burst(x,y,amount){
    const layer=document.getElementById("floatLayer");
    if(!layer)return;
    const text=document.createElement("div");
    text.className="float-text";text.textContent="+"+window.GameEconomy.format(amount)+" ₽";
    text.style.left=Math.max(5,Math.min(layer.clientWidth-90,x-layer.getBoundingClientRect().left-20))+"px";
    text.style.top=Math.max(5,y-layer.getBoundingClientRect().top-10)+"px";
    layer.appendChild(text);setTimeout(()=>text.remove(),950);
    for(let i=0;i<3;i++){
      const coin=document.createElement("div");coin.className="flying-coin";coin.textContent="🪙";
      coin.style.left=(x-layer.getBoundingClientRect().left-10)+"px";
      coin.style.top=(y-layer.getBoundingClientRect().top)+"px";
      coin.style.setProperty("--dx",(Math.random()*90-45)+"px");
      layer.appendChild(coin);setTimeout(()=>coin.remove(),900);
    }
  },
  toast(message){
    const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");
    clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>el.classList.remove("show"),1900);
  }
};
