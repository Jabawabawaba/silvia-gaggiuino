(function(){
  var svg=document.getElementById('lad-svg');if(!svg)return;
  function $(id){return document.getElementById(id)}
  var S={pwr:false,brew:false,water:false,steam:false},T=25,tripped=false,brewClosed=true,steamClosed=true,run=false,timer=null,lastStatus='';
  /* opening points are Rancilio's; the closing points are illustrative */
  var BREW_OPEN=%%BREW_OPEN%%,BREW_CLOSE=%%BREW_CLOSE%%,STEAM_OPEN=%%STEAM_OPEN%%,STEAM_CLOSE=%%STEAM_CLOSE%%,SAFETY=165;
  $('lab-brew').textContent='opens at '+BREW_OPEN+' °C';$('lab-steam').textContent='opens at '+STEAM_OPEN+' °C';
  function blade(id,closed){var b=$(id).querySelector('.blade');b.setAttribute('transform',closed?'':'rotate(-28)')}
  function liveSet(ids,on){ids.forEach(function(i){var e=$('s-'+i);if(e&&on)e.classList.add('live')})}
  function update(){
    /* thermostats follow the temperature, with a gap between opening and closing */
    if(T>=BREW_OPEN)brewClosed=false;else if(T<=BREW_CLOSE)brewClosed=true;
    if(T>=STEAM_OPEN)steamClosed=false;else if(T<=STEAM_CLOSE)steamClosed=true;
    if(T>=SAFETY)tripped=true;
    var mains=S.pwr;
    /* the return side: steam thermostat, then the brew thermostat or the steam switch around it */
    var callHeat=mains&&steamClosed&&(brewClosed||S.steam);
    var heat=callHeat&&!tripped;      /* the element also needs the safety closed */
    var lamp=callHeat;                /* the heating light doesn't: it's wired around the safety */
    var pumpBrew=mains&&S.brew,pumpWater=mains&&S.water,pump=pumpBrew||pumpWater,sol=mains&&S.brew;
    Array.prototype.forEach.call(svg.querySelectorAll('.w'),function(w){w.classList.remove('live')});
    liveSet(['inL','inN','railL','railN','r1a','r1b'],mains);
    liveSet(['r2a','r2b','r2c'],heat);
    liveSet(['hl1','hl2'],lamp);
    liveSet(['r2d','r2e','r2h'],callHeat);
    liveSet(['r2f','r2g'],callHeat&&brewClosed);
    liveSet(['by1','by2'],callHeat&&S.steam);
    liveSet(['r3a','r3b'],pumpWater);
    liveSet(['r4a','r4b'],pumpBrew);
    liveSet(['r4c','r4d','r4e','r4f'],pump);
    liveSet(['r5a','r5b','r5c'],sol);
    blade('c-pwrL',S.pwr);blade('c-pwrN',S.pwr);blade('c-safety',!tripped);blade('c-brewt',brewClosed);blade('c-steamsw',S.steam);blade('c-steamt',steamClosed);
    blade('c-water',S.water);blade('c-brew1',S.brew);blade('c-brew2',S.brew);
    $('c-lamp1').classList.toggle('on',mains);$('c-el').classList.toggle('on',heat);$('c-hlamp').classList.toggle('on',lamp);
    $('c-pump').classList.toggle('on',pump);$('c-sol').classList.toggle('on',sol);
    $('lab-safety').textContent=tripped?'tripped: press reset':'opens at 165 °C';
    $('lad-reset').hidden=!tripped;
    var parts=[];
    if(!mains)parts.push('Power is off, so nothing has a path from line to neutral.');
    else{
      if(heat)parts.push('<b>Element heating:</b> the steam thermostat is closed, and so is '+(S.steam?'the steam switch, which bypasses the brew thermostat':'the brew thermostat')+'. The heating light is on.');
      else if(tripped)parts.push('<b>Element off:</b> the safety thermostat has tripped.'+(lamp?' The heating light still comes on, because it’s wired around the safety.':''));
      else if(!steamClosed)parts.push('<b>Element off:</b> the steam thermostat has opened.');
      else parts.push('<b>Element off:</b> the brew thermostat has opened'+(S.steam?'.':'; switch on steam to keep heating.'));
      if(pump)parts.push('<b>Pump running</b> through '+(pumpBrew&&pumpWater?'both switches':pumpBrew?'the brew switch':'the hot water switch')+'.');
      if(sol)parts.push('<b>3-way valve open</b> to the group, completed by the brew switch’s second pole.');
      else if(pumpWater)parts.push('The 3-way valve stays shut: only the brew switch completes its circuit.');
    }
    var html=parts.join(' ');if(html!==lastStatus){lastStatus=html;$('lad-status').innerHTML=html}
    $('lad-tv').textContent=Math.round(T)+' °C';if(!dragT)$('lad-temp').value=String(T.toFixed(1));
    Array.prototype.forEach.call(document.querySelectorAll('[data-lsw]'),function(b){b.setAttribute('aria-pressed',String(S[b.getAttribute('data-lsw')]))});
    kick();
    return {heat:heat,pump:pump,sol:sol};
  }
  /* ---------- current flowing ----------
     Every live wire's dashes move at one speed, timed from one clock, and each wire starts its pattern where the
     wire feeding it left off, so the flow runs on through junctions and never restarts. Rows run left to right;
     the two neutral wires drawn downward carry it back up to the plug. */
  var FV=30,FP=16,RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches),seen=true,raf=0;
  var wires=Array.prototype.map.call(svg.querySelectorAll('.w'),function(w){
    var a=w.getPointAtLength(0);
    return {el:w,d0:(w.id==='s-inL'||w.id==='s-railL')?a.y:a.x,up:w.classList.contains('up')};
  });
  function flow(ms){
    raf=0;var t=ms/1000,any=false;
    for(var i=0;i<wires.length;i++){var w=wires[i];if(!w.el.classList.contains('live'))continue;any=true;
      w.el.style.strokeDashoffset=(w.up?(FV*t)%FP:((w.d0-FV*t)%FP+FP)%FP).toFixed(2)}
    if(any&&seen)raf=requestAnimationFrame(flow);
  }
  function kick(){if(!RM&&seen&&!raf)raf=requestAnimationFrame(flow)}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){seen=es[0].isIntersecting;kick()}).observe(svg);
  Array.prototype.forEach.call(document.querySelectorAll('[data-lsw]'),function(b){
    b.addEventListener('click',function(){var k=b.getAttribute('data-lsw');S[k]=!S[k];update()});
  });
  var dragT=false;
  $('lad-temp').addEventListener('input',function(){T=Number(this.value);dragT=true;update();dragT=false});
  $('lad-reset').addEventListener('click',function(){if(T>=SAFETY-5)T=SAFETY-25;tripped=false;update()});
  /* let it run: the element heats the boiler, the boiler loses heat, brewing pulls cold water in */
  var st={heat:false,sol:false},last=0;
  function tick(ms){
    timer=null;if(!run)return;
    var k=last?Math.min(4,(ms-last)/120):0;last=ms;
    var dT=-(T-22)*0.004;
    if(st.heat)dT+=1.1;
    if(st.sol)dT-=0.6;
    T=Math.max(20,Math.min(175,T+dT*k));
    st=update();
    timer=requestAnimationFrame(tick);
  }
  $('lad-run').addEventListener('click',function(){
    run=!run;this.setAttribute('aria-pressed',String(run));this.textContent=run?'Stop':'Let it run';
    if(timer){cancelAnimationFrame(timer);timer=null}
    if(run){st=update();last=0;timer=requestAnimationFrame(tick)}
  });
  update();
})();
