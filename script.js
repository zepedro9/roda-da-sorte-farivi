(() => {
  "use strict";
  const prizes = ["Raspadinha de 5€","Jantar restaurante à escolha","Carro","Noite no Sheraton Hotel","iPhone 18 Pro Max","Vale 200€ para viagem"];
  // A experiência está configurada para terminar sempre neste prémio.
  const selectedPrizeIndex = 5; // Vale 200€ para viagem (índices começam em zero)
  const colors = ["#ff6b9d","#ffbd59","#55d6be","#7c83fd","#b47aea","#ff8b5e"];
  const canvas = document.getElementById("wheel"), ctx = canvas.getContext("2d");
  const spinButton = document.getElementById("spin-button"), buttonLabel = document.getElementById("button-label");
  const size = canvas.width, center = size / 2, radius = size / 2 - 15, slice = Math.PI * 2 / prizes.length;
  let rotation = 0, spinning = false;
  function drawWheel(angle = rotation) {
    ctx.clearRect(0,0,size,size); ctx.save(); ctx.translate(center,center); ctx.rotate(angle);
    for (let i=0;i<prizes.length;i++) {
      const start=-Math.PI/2+i*slice, end=start+slice;
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,radius,start,end);ctx.closePath();ctx.fillStyle=colors[i];ctx.fill();
      ctx.lineWidth=7;ctx.strokeStyle="#fff";ctx.stroke();
      ctx.save();
      const mid=start+slice/2;
      ctx.rotate(mid);
      const absoluteMid=((angle+mid)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
      if(absoluteMid>Math.PI/2 && absoluteMid<Math.PI*3/2)ctx.rotate(Math.PI);
      ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#fff";ctx.shadowColor="#37164c40";ctx.shadowBlur=4;
      const label=prizes[i], labelRadius=radius*0.63, maxLabelWidth=235;
      let fontSize=31;
      ctx.font="700 "+fontSize+"px 'DM Sans',system-ui,sans-serif";
      const measured=ctx.measureText(label).width;
      if(measured>maxLabelWidth){fontSize=Math.max(17,fontSize*maxLabelWidth/measured);ctx.font="700 "+fontSize+"px 'DM Sans',system-ui,sans-serif";}
      ctx.fillText(label,labelRadius,0,maxLabelWidth);ctx.restore();
    }
    ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.lineWidth=10;ctx.strokeStyle="#fff";ctx.stroke();ctx.restore();
  }
  const easeOutQuint = t => 1-Math.pow(1-t,5);
  function spin() {
    if(spinning)return;spinning=true;spinButton.disabled=true;buttonLabel.textContent="A girar…";
    const startRotation=rotation, target=(Math.PI*2)-((selectedPrizeIndex+.5)*slice);
    const current=((startRotation%(Math.PI*2))+Math.PI*2)%(Math.PI*2), desired=((target%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    const delta=((desired-current)+Math.PI*2)%(Math.PI*2), extraTurns=6+Math.floor(Math.random()*3);
    const endRotation=startRotation+extraTurns*Math.PI*2+delta, duration=4700+Math.random()*700, startTime=performance.now();
    function frame(now){
      const progress=Math.min(1,(now-startTime)/duration);rotation=startRotation+(endRotation-startRotation)*easeOutQuint(progress);drawWheel(rotation);
      if(progress<1)requestAnimationFrame(frame);
      else {rotation=endRotation;drawWheel(rotation);spinning=false;spinButton.disabled=false;buttonLabel.textContent=prizes[selectedPrizeIndex];burstConfetti();}
    }
    requestAnimationFrame(frame);
  }
  function burstConfetti(){
    const symbols=["✦","✧","●","♥","★"];
    for(let i=0;i<24;i++){const el=document.createElement("span");el.textContent=symbols[i%symbols.length];Object.assign(el.style,{position:"fixed",left:Math.random()*100+"vw",top:"-24px",zIndex:"10",pointerEvents:"none",color:colors[i%colors.length],fontSize:14+Math.random()*18+"px",transition:"transform "+(1.8+Math.random())+"s ease-in, opacity 2.5s ease"});document.body.appendChild(el);
      requestAnimationFrame(()=>{el.style.transform="translate("+(Math.random()-.5)*180+"px, "+(window.innerHeight+60)+"px) rotate("+Math.random()*700+"deg)";el.style.opacity="0";});setTimeout(()=>el.remove(),3000);}
  }
  spinButton.addEventListener("click",()=>{if(!spinning)buttonLabel.textContent="Girar a roda";spin();});drawWheel();
})();
