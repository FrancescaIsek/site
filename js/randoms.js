(() => {
  const root = document.querySelector('.randoms');
  if (!root) return;
  const board = root.querySelector('.randoms-board'), viewport = root.querySelector('.randoms-viewport');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let ratio = 1, top = 20, active = null, frame = 0, previous = 0;
  const states = [...root.querySelectorAll('.random-item')].map((el, i) => ({el, i, x:0,y:0,angle:+el.dataset.angle,rot:+el.dataset.angle,rv:0,scale:1,sv:0,hover:false,tilt:0}));
  const resize = () => { ratio = viewport.clientWidth / 1600; board.style.transform = `scale(${ratio})`; viewport.style.height = `${870 * ratio}px`; };
  new ResizeObserver(resize).observe(viewport); resize();
  function wake(){ if(!frame){previous=performance.now();frame=requestAnimationFrame(tick);} }
  function tick(now){
    const dt=Math.min((now-previous)/1000,.025);previous=now;let moving=false;
    states.forEach(s=>{
      const held=active?.s===s&&active.drag;
      let target=reduce.matches?s.angle:s.angle+(held?s.tilt:s.hover?(s.i%2?4:-4):0);
      let scale=reduce.matches?1:held?1.04:s.hover?1.03:1;
      if(reduce.matches){s.rot=target;s.scale=1;s.rv=s.sv=0;}
      else {s.rv+=(300*(target-s.rot)-20*s.rv)*dt;s.rot+=s.rv*dt;s.sv+=(300*(scale-s.scale)-20*s.sv)*dt;s.scale+=s.sv*dt;s.tilt*=Math.exp(-12*dt);}
      s.el.style.transform=`translate3d(${s.x}px,${s.y}px,0) rotate(${s.rot}deg) scale(${s.scale})`;
      if(Math.abs(target-s.rot)>.01||Math.abs(s.rv)>.01||Math.abs(scale-s.scale)>.001||Math.abs(s.sv)>.001) moving=true;
    });frame=moving?requestAnimationFrame(tick):0;
  }
  let context, muted=false,lastSound=-Infinity;
  try{muted=localStorage.getItem('randoms-muted')==='true';}catch{}
  const toggle=root.querySelector('.randoms-sound');
  function updateMute(){toggle.setAttribute('aria-pressed',String(muted));toggle.setAttribute('aria-label',muted?'Unmute collage sounds':'Mute collage sounds');} updateMute();
  function unlock(){try{context ||= new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}}
  unlock(); ['pointerdown','keydown'].forEach(event=>document.addEventListener(event,unlock,{passive:true}));
  toggle.addEventListener('click',()=>{muted=!muted;updateMute();try{localStorage.setItem('randoms-muted',String(muted));}catch{} unlock();});
  function note(i,event){
    if(muted||event.pointerType==='touch'||active?.drag||!context||context.state!=='running'||performance.now()-lastSound<60)return;
    lastSound=performance.now();const now=context.currentTime;
    function voice(freq,peak,length){const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(peak,now+.005);gain.gain.exponentialRampToValueAtTime(.0001,now+length);osc.connect(gain);gain.connect(context.destination);osc.start(now);osc.stop(now+length+.005);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
    voice([880,1109,1319,1480,1661,1760][i%6],.055,.125);voice(240,.009,.04);
  }
  states.forEach(s=>{
    const el=s.el;let suppress=false;
    el.addEventListener('dragstart',e=>e.preventDefault());
    el.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;s.hover=true;if(!active){el.style.zIndex=++top;note(s.i,e);}wake();});
    el.addEventListener('pointerleave',()=>{s.hover=false;wake();});
    el.addEventListener('pointerdown',e=>{if(e.button!==0||active)return;active={s,id:e.pointerId,startX:e.clientX,startY:e.clientY,x:s.x,y:s.y,lastX:e.clientX,lastT:performance.now(),drag:false};suppress=false;el.style.zIndex=++top;el.setPointerCapture(e.pointerId);});
    el.addEventListener('pointermove',e=>{
      if(active?.s!==s||active.id!==e.pointerId)return;const a=active,dx=e.clientX-a.startX,dy=e.clientY-a.startY;
      if(!a.drag&&Math.hypot(dx,dy)<4)return;a.drag=true;suppress=true;el.classList.add('dragging');
      const margin=22,left=el.offsetLeft,t=el.offsetTop;
      s.x=Math.max(margin-left,Math.min(1600-left-el.offsetWidth-margin,a.x+dx/ratio));s.y=Math.max(margin-t,Math.min(870-t-el.offsetHeight-margin,a.y+dy/ratio));
      const now=performance.now();s.tilt=Math.max(-8,Math.min(8,(e.clientX-a.lastX)/Math.max(1,now-a.lastT)*3));a.lastX=e.clientX;a.lastT=now;
      el.style.transform=`translate3d(${s.x}px,${s.y}px,0) rotate(${s.rot}deg) scale(${s.scale})`;wake();
    });
    function drop(e){if(active?.s!==s||active.id!==e.pointerId)return;const dragged=active.drag;active=null;el.classList.remove('dragging');if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);s.hover=false;if(dragged&&!reduce.matches){s.angle=Math.random()*12-6;s.scale=.98;s.sv=0;}wake();}
    el.addEventListener('pointerup',drop);el.addEventListener('pointercancel',drop);
    el.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopPropagation();suppress=false;}},true);
    el.addEventListener('keydown',e=>{const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!delta)return;e.preventDefault();s.x=Math.max(-el.offsetLeft+22,Math.min(1578-el.offsetLeft-el.offsetWidth,s.x+delta[0]));s.y=Math.max(-el.offsetTop+22,Math.min(848-el.offsetTop-el.offsetHeight,s.y+delta[1]));el.style.zIndex=++top;wake();});
  });
  reduce.addEventListener('change',wake);wake();
})();
