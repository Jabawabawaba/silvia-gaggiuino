(function(){
  function $(id){return document.getElementById(id)}
  function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* run fn(ms) once per screen frame while el is on screen; never with reduced motion. rest() runs when it goes off screen. */
  function onScreen(el,fn,rest){
    if(RM||!el)return;var seen=false,raf=0;
    function go(ms){raf=0;if(!seen)return;fn(ms);raf=requestAnimationFrame(go)}
    function vis(v){seen=v;if(!v&&rest)rest();if(v&&!raf)raf=requestAnimationFrame(go)}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis(es[0].isIntersecting)}).observe(el);else vis(true);
  }

  /* ---------- machine map: modes ----------
     Water, coffee and steam are dots that move along hidden routes. Each mode is a little timeline: it sets how fast
     each route flows (eased, so things speed up and slow down instead of snapping), where the 3-way valve's plunger is,
     which pipes are under pump pressure, and what the boiler level does. Time only runs while the drawing is on screen. */
  var cut=$('cut'),NS='http://www.w3.org/2000/svg',dotsG=$('dots');
  var R={};
  qa('.routes path',cut).forEach(function(p){
    var L=p.getTotalLength(),n=Math.max(2,Math.ceil(L/2)),pts=[];
    for(var i=0;i<=n;i++){var q=p.getPointAtLength(L*i/n);pts.push([q.x,q.y])}
    R[p.getAttribute('data-r')]={pts:pts,len:L,n:n};
  });
  function at(r,s){var f=s/r.len*r.n,i=Math.floor(f);if(i>=r.n)return r.pts[r.n];if(i<0)return r.pts[0];var a=r.pts[i],b=r.pts[i+1],u=f-i;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]}
  /* kind: w water, c coffee, s steam. sp is speed in drawing units a second at rate 1; gap is the spacing of the dots */
  var KIND={w:{gap:13,r:2.5,sp:70},c:{gap:11,r:2.3,sp:46},s:{gap:15,r:3.3,sp:150}};
  var FLOWS=[['intake','w',{stop:.1}],['pump','w',{stop:.1}],['tee','w',{stop:.1}],['opvret','w',{r:2,gap:15,stop:.12}],['boilerin','w',{stop:.1}],['bmix','w',{r:2.2,gap:16,op:.55,stop:.15}],['bup','w',{op:.6,stop:.15}],
    ['valvein','w',{stop:.08}],['through','w',{stop:.08}],['screen','w',{r:2.1,gap:11}],['rain1','w',{r:1.8,gap:7,sp:40}],['rain2','w',{r:1.8,gap:7,sp:40}],['rain3','w',{r:1.8,gap:7,sp:40}],['rain4','w',{r:1.8,gap:7,sp:40}],
    ['shot1','c',{sp:90}],['shot2','c',{sp:90}],['vent','w',{gap:12}],['steam','s'],['hot','w',{sp:110}]];
  var F={};
  FLOWS.forEach(function(d){
    var k=KIND[d[1]],o=d[2]||{},r=R[d[0]],g=document.createElementNS(NS,'g');
    var f={r:r,gap:o.gap||k.gap,sp:o.sp||k.sp,op:o.op||1,stop:o.stop||.3,rate:0,ph:0,g:g,c:[]};
    var n=Math.ceil(r.len/f.gap)+1;
    for(var i=0;i<n;i++){var c=document.createElementNS(NS,'circle');c.setAttribute('r',String(o.r||k.r));c.setAttribute('class',d[1]);g.appendChild(c);f.c.push(c)}
    g.setAttribute('opacity','0');dotsG.appendChild(g);F[d[0]]=f;
  });
  /* bubbles off the element while it heats */
  var bubG=document.createElementNS(NS,'g'),bubs=[];dotsG.insertBefore(bubG,dotsG.firstChild);
  for(var bi=0;bi<26;bi++){var bc=document.createElementNS(NS,'circle');bc.setAttribute('class','b');bc.setAttribute('r','0');bubG.appendChild(bc);bubs.push({c:bc,on:false})}

  var MODES={
    off:{sw:[],pwr:0,heat:0},
    heat:{sw:['pwr'],pwr:1,heat:'cycle'},
    brew:{sw:['pwr','brew'],pwr:1,heat:'cycle'},
    stop:{sw:['pwr'],pwr:1,heat:'cycle'},
    water:{sw:['pwr','water'],pwr:1,heat:'cycle'},
    steam:{sw:['pwr','steam'],pwr:1,heat:1}
  };
  /* where boiler water can go, per mode: [to the group, to the wand, pump side] */
  var EXITS={
    off:[['shut','Shut: the 3-way valve is off'],['shut','Shut: the steam knob is closed'],['oneway','One-way: nothing can flow back through the pump'],'Sealed. The water stays where it is.'],
    heat:[['shut','Shut: the 3-way valve is off'],['shut','Shut: the steam knob is closed'],['oneway','One-way: nothing can flow back through the pump'],'Sealed. The water heats but has nowhere to go.'],
    brew:[['open','Open: the 3-way valve is on'],['shut','Shut: the steam knob is closed'],['in','Water coming in from the pump'],'In from the pump, out through the group.'],
    stop:[['shut','Shut: the valve has sprung back; the group side drains'],['shut','Shut: the steam knob is closed'],['oneway','One-way: the pump has stopped'],'Sealed again. Only the group side empties.'],
    water:[['shut','Shut: the 3-way valve stays off'],['open','Open: the steam knob is open'],['in','Water coming in from the pump'],'In from the pump, out of the wand.'],
    steam:[['shut','Shut: the 3-way valve is off'],['open','Open: the steam knob is open'],['oneway','One-way: the pump is off'],'Steam out of the wand, so the level drops.']
  };
  var mode='heat',heatOn=false,cycT=null,T=0,t0=0,L=1,cup=0,jug=0,pB=0,pG=0,bubAcc=0;
  function clamp(x,a,b){return x<a?a:x>b?b:x}
  /* the timeline for each mode at t seconds in: target flow rates and the valve, pump and pressure states */
  function plan(m,t){
    var f={},s={plg:0,pump:0,pB:0,pG:0,knob:0,puffs:0,steamLine:L<.99?'s':'w'};
    if(m==='brew'){
      var fill=t<1.6?1:.42,cof=clamp((t-3.2)/1.6,0,1);
      s.plg=1;s.pump=1;s.pB=s.pG=clamp((t-.5)/2.2,0,1);
      f.intake=f.pump=f.tee=1;f.opvret=t<1.8?0:.6;
      f.boilerin=f.bmix=f.valvein=f.through=f.screen=fill;
      f.rain1=f.rain2=f.rain3=f.rain4=t<.5?0:fill;
      f.shot1=f.shot2=cof;
    }else if(m==='stop'){
      s.pB=Math.exp(-t/.8);
      f.vent=3.4*Math.exp(-t/.28)+.3*Math.exp(-t/1.3);
      f.shot1=f.shot2=.75*Math.exp(-t/1.1);
    }else if(m==='water'){
      s.pump=1;s.knob=1;f.intake=f.pump=f.tee=f.boilerin=1;
      if(L<.995){f.steam=.6;s.puffs=1;s.steamLine='s'}else{f.bup=1;f.hot=1;s.steamLine='w'}
    }else if(m==='steam'){
      s.knob=1;
      if(t<1.3&&L>=.99){f.hot=1;s.steamLine='w'}else{f.steam=1;s.puffs=1;s.steamLine='s'}
    }
    s.f=f;return s;
  }
  function setB(sel,cls){qa(sel,cut).forEach(function(e){['w','p','s'].forEach(function(c){e.classList.toggle(c,c===cls)})})}
  function frame(dt){
    T+=dt;var t=T-t0,S=plan(mode,t);
    /* states that build up: boiler level, cup and jug */
    if(mode==='brew'){L=Math.min(1,L+dt*.02);if(S.f.shot1>0)cup=Math.min(.78,cup+dt*.028*S.f.shot1)}
    if(mode==='water'){L=Math.min(1,L+dt*.07);if(S.f.hot)jug=Math.min(.8,jug+dt*.045)}
    if(mode==='steam'&&S.f.steam)L=Math.max(.55,L-dt*.04);
    /* flows: ease each rate toward its target, move its dots, fade dots in at the start and out at the end of a route */
    for(var k in F){
      var fl=F[k],tgt=S.f[k]||0;
      fl.rate+=(tgt-fl.rate)*Math.min(1,dt/(tgt>fl.rate?.18:fl.stop));
      if(fl.rate<.003)fl.rate=0;
      fl.ph=(fl.ph+dt*fl.sp*fl.rate)%fl.gap;
      var o=Math.min(1,fl.rate*3)*fl.op;fl.g.setAttribute('opacity',o.toFixed(3));
      if(o<=0)continue;
      for(var i=0;i<fl.c.length;i++){
        var s=fl.ph+i*fl.gap,c=fl.c[i];
        if(s>fl.r.len){c.setAttribute('cx','-99');continue}
        var p=at(fl.r,s),e=Math.min(1,s/5,(fl.r.len-s)/5);
        c.setAttribute('cx',p[0].toFixed(1));c.setAttribute('cy',p[1].toFixed(1));c.setAttribute('opacity',e.toFixed(2));
      }
    }
    pB+=(S.pB-pB)*Math.min(1,dt/.35);pG+=(S.pG-pG)*Math.min(1,dt/(S.pG<pG?.06:.35));
    paint(S);
    bubbles(dt);
  }
  function paint(S){
    $('plunger').classList.toggle('on',!!S.plg);
    cut.querySelector('.solcoil').classList.toggle('on',!!S.plg);
    cut.querySelector('.pumpbody').classList.toggle('on',!!S.pump&&!RM);
    $('chk').setAttribute('cx',S.pump?(577+Math.random()*1.4).toFixed(1):'583');
    $('opvplug').classList.toggle('open',F.opvret.rate>.15);
    $('knob').classList.toggle('open',!!S.knob);$('sgate').classList.toggle('open',!!S.knob);
    $('puffs').classList.toggle('on',!!S.puffs);
    $('jug').style.opacity=$('jugfill').style.opacity=(mode==='water'||mode==='steam')?1:0;
    /* bores: under pump pressure, plain water, steam, or empty */
    var hiB=pB>.45,hiG=pG>.45;
    setB('[data-b="pumpout"],[data-b="boilerin"],[data-b="valvein"]',hiB?'p':'w');
    cut.querySelector('.pbore').classList.toggle('p',hiB);
    setB('[data-b="valveout"],[data-b="chamber"],[data-b="group"]',hiG?'p':'w');
    setB('[data-b="intake"]','w');
    setB('[data-b="opvret"]',F.opvret.rate>.05?'w':'');
    setB('[data-b="drain"],[data-b="core"]',F.vent.rate>.04?'w':'');
    setB('[data-b="steam"]',S.steamLine);
    $('bpres').style.opacity=(pB*.4).toFixed(3);
    var y=160+(1-L)*162;$('bwater').setAttribute('y',y.toFixed(1));$('bwater').setAttribute('height',(L*162).toFixed(1));
    $('bsurf').setAttribute('d','M238,'+y.toFixed(1)+' H412');$('bsurf').style.opacity=L<.995?1:0;
    $('cupfill').setAttribute('y',(512-cup*60).toFixed(1));$('cupfill').setAttribute('height',(cup*60).toFixed(1));
    $('jugfill').setAttribute('y',(452-jug*56).toFixed(1));$('jugfill').setAttribute('height',(jug*56).toFixed(1));
  }
  function bubbles(dt){
    var surf=160+(1-L)*162+3,rate=heatOn?(mode==='steam'?14:6):0;
    bubAcc+=dt*rate;
    while(bubAcc>=1){bubAcc-=1;for(var i=0;i<bubs.length;i++)if(!bubs[i].on){var b=bubs[i];b.on=true;b.x=252+Math.random()*150;b.y=214+Math.random()*10;b.v=34+Math.random()*26;b.r=1.4+Math.random()*1.8;b.w=Math.random()*6.28;break}}
    bubs.forEach(function(b){
      if(!b.on)return;b.y-=b.v*dt;b.w+=dt*5;
      if(b.y<=surf){b.on=false;b.c.setAttribute('r','0');return}
      b.c.setAttribute('cx',(b.x+Math.sin(b.w)*2).toFixed(1));b.c.setAttribute('cy',b.y.toFixed(1));b.c.setAttribute('r',b.r.toFixed(1));
    });
  }
  function exits(m){
    var E=EXITS[m],box=$('xits');if(!box)return;
    ['grp','wand','pump'].forEach(function(id,i){var row=$('x-'+id);row.className='xrow '+E[i][0];row.querySelector('.xs').textContent=E[i][1]});
    $('x-sum').textContent=E[3];
  }
  function setMode(m){
    mode=m;var M=MODES[m];t0=T;
    if(m==='stop'&&cup<.3)cup=.45;
    if(m!=='brew'&&m!=='stop')cup=0;
    if(m!=='water')jug=0;
    if(m==='water'&&RM)L=1;
    qa('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-mode')===m))});
    var rp=$('replay');if(rp)rp.style.visibility=m==='stop'?'':'hidden';
    ['pwr','brew','water','steam'].forEach(function(k){var on=M.sw.indexOf(k)>=0;$('sw-'+k).classList.toggle('on',on);var r=$('rk-'+k);if(r)r.classList.toggle('on',on)});
    $('lp-pwr').classList.toggle('on',!!M.pwr);
    $('modecap').textContent=$('cap-'+m).textContent;
    exits(m);
    aim();
    if(cycT){clearInterval(cycT);cycT=null}
    if(M.heat==='cycle'){heatOn=true;applyHeat();cycT=setInterval(function(){heatOn=!heatOn;applyHeat()},2600)}
    else{heatOn=!!M.heat;applyHeat()}
    if(RM)still();
  }
  /* reduced motion: one still frame of each mode in its steady state, with the dots standing on the routes */
  function still(){
    var keep=T;t0=0;T=mode==='stop'?.35:mode==='steam'?4:6;
    var S=plan(mode,T);
    for(var k in F){F[k].rate=S.f[k]?Math.min(1,S.f[k]):0;F[k].ph=0}
    pB=S.pB;pG=S.pG;
    frame(0);T=keep;
  }
  function applyHeat(){
    $('element').classList.toggle('hot',heatOn);
    $('heatglow').setAttribute('opacity',heatOn?'.55':'0');
    $('lp-ht').classList.toggle('on',heatOn);
  }
  qa('[data-mode]').forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-mode'))})});
  if($('replay'))$('replay').addEventListener('click',function(){setMode('stop')});
  /* close-up: the camera glides in on where the action is (the valve and group, or the steam valve and wand), where the
     whole drawing is too small on a phone. Phones start in close-up; picking a part outside the frame pulls back out. */
  var zoomed=false,camRaf=0,CUR=[24,44,926,510];
  var VIEW={all:[24,44,926,510],valve:[190,92,356,440],front:[40,88,364,450]};
  var INVIEW={valve:'boiler element tstat sol group pf tray opv',front:'boiler element tstat wand panel group pf tray'};
  function frameFor(m){return zoomed?((m==='water'||m==='steam')?'front':'valve'):'all'}
  function putVB(v){cut.setAttribute('viewBox',v.map(function(x){return x.toFixed(1)}).join(' '))}
  function aim(){
    var to=VIEW[frameFor(mode)],from=CUR.slice(),st=0;
    cut.classList.toggle('zoomed',zoomed);
    var zb=$('zoomb');if(zb){zb.setAttribute('aria-pressed',String(zoomed));zb.textContent=zoomed?'Show the whole machine':'Close-up'}
    if(camRaf)cancelAnimationFrame(camRaf);
    if(RM||from.join()===to.join()){CUR=to.slice();putVB(CUR);return}
    function go(ms){if(!st)st=ms;var u=Math.min(1,(ms-st)/700),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
      for(var i=0;i<4;i++)CUR[i]=from[i]+(to[i]-from[i])*e;putVB(CUR);camRaf=u<1?requestAnimationFrame(go):0}
    camRaf=requestAnimationFrame(go);
  }
  if($('zoomb'))$('zoomb').addEventListener('click',function(){zoomed=!zoomed;aim()});
  /* keep the caption's height steady across modes, so the drawing under it doesn't jump when the mode changes */
  (function(){
    var cap=$('modecap');if(!cap)return;
    function fit(){var keep=cap.textContent,h=0;cap.style.minHeight='';
      Object.keys(MODES).forEach(function(m){cap.textContent=$('cap-'+m).textContent;h=Math.max(h,cap.offsetHeight)});
      cap.textContent=keep;cap.style.minHeight=h+'px'}
    fit();var rt=0;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(fit,150)});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  })();
  var lastMs=0;
  onScreen(cut,function(ms){var dt=lastMs?Math.min(.05,(ms-lastMs)/1000):0;lastMs=ms;frame(dt)},function(){lastMs=0});

  /* ---------- machine map: parts ---------- */
  var sel=null;
  function pick(id,scrollIt){
    sel=id;
    if(id&&zoomed&&(INVIEW[frameFor(mode)]||'').split(' ').indexOf(id)<0){zoomed=false;aim()}
    qa('.hot',cut).forEach(function(h){h.classList.toggle('sel',h.getAttribute('data-part')===id)});
    cut.classList.toggle('focus',!!id);
    qa('.part',cut).forEach(function(g){g.classList.toggle('lit',!!id&&g.id==='p-'+id)});
    var card=id&&$('part-'+id),box=$('pinfo');
    qa('.plist .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-part')===id))});
    if(!card){box.innerHTML='<p class="hint">Tap a number to see what that part does.</p>';return}
    var no=card.getAttribute('data-no'),name=card.querySelector('h3').textContent,sum=card.querySelector('.sum').textContent,gg=card.querySelector('.gg');
    box.innerHTML='<h3><span class="no">'+no+'</span>'+esc(name)+'</h3><p>'+esc(sum)+'</p>'+(gg?'<p class="gg">'+esc(gg.textContent)+'</p>':'')+'<a href="#part-'+id+'">How it works</a>';
    if(scrollIt&&window.innerWidth<900)box.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  qa('.hot',cut).forEach(function(h){
    h.addEventListener('click',function(){var id=h.getAttribute('data-part');pick(sel===id?null:id,true)});
    h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();h.dispatchEvent(new MouseEvent('click'))}});
  });
  (function(){
    var SHORT={tank:'Tank',pump:'Pump',opv:'OPV',boiler:'Boiler',element:'Element',tstat:'Thermostats',sol:'3-way valve',group:'Group',pf:'Portafilter',wand:'Steam wand',tray:'Drip tray',panel:'Switches',inlet:'Inlet'};
    var stage=cut.parentNode,pl=document.createElement('div');pl.className='plist';pl.setAttribute('role','group');pl.setAttribute('aria-label','Parts');
    qa('.hot',cut).forEach(function(h){
      var id=h.getAttribute('data-part'),b=document.createElement('button');b.type='button';b.className='chip';b.setAttribute('data-part',id);b.setAttribute('aria-pressed','false');
      b.setAttribute('aria-label',h.getAttribute('aria-label'));b.innerHTML='<b>'+h.querySelector('text').textContent+'</b>'+esc(SHORT[id]||h.getAttribute('aria-label'));
      b.addEventListener('click',function(){pick(sel===id?null:id,true)});pl.appendChild(b);
    });
    stage.parentNode.insertBefore(pl,stage.nextSibling);
  })();
  zoomed=cut.getBoundingClientRect().width<600;CUR=VIEW[frameFor('heat')].slice();putVB(CUR);
  setMode('heat');pick(null);if(!RM)frame(0);

  /* ---------- thermostat figure: a simple boiler that heats while the contacts are closed ---------- */
  (function(){
    var fig=$('mini-tstat');if(!fig)return;
    var trace=fig.querySelector('.trace'),dot=fig.querySelector('.now'),arm=fig.querySelector('.arm'),pin=fig.querySelector('.pin'),disc=fig.querySelector('.disc');
    var T=86,closed=true,hist=[],OPEN=106,CLOSE=94,STEP=90,W=159;   /* graph units, not degrees; one sample every 90 ms */
    function y(t){return 162-(t-70)*(140/50)}
    function step(){
      T+=closed?0.9:-0.45;
      if(closed&&T>=OPEN)closed=false;else if(!closed&&T<=CLOSE)closed=true;
      hist.push(T);if(hist.length>161)hist.shift();
      arm.style.transform=closed?'':'translateY(-10px)';pin.style.transform=closed?'':'translateY(-8px)';
      disc.setAttribute('d',closed?'M58,140 Q105,124 152,140':'M58,128 Q105,144 152,128');
      fig.classList.toggle('closed',closed);
    }
    /* f is how far we are into the next sample: the trace slides left by that much and the dot rides the live value */
    function draw(f){
      var n=hist.length,pts=[],Th=T+(closed?0.9:-0.45)*f;
      for(var i=0;i<n;i++){var x=W-f-(n-1-i);if(x>=0)pts.push(x.toFixed(2)+','+y(hist[i]).toFixed(1))}
      pts.push(W+','+y(Th).toFixed(1));
      trace.setAttribute('d','M'+pts.join(' L'));dot.setAttribute('cx',String(W));dot.setAttribute('cy',y(Th).toFixed(1));
    }
    for(var i=0;i<161;i++)step();
    draw(0);
    var acc=0,last=0;
    onScreen(fig,function(ms){acc+=last?Math.min(250,ms-last):0;last=ms;while(acc>=STEP){acc-=STEP;step()}draw(acc/STEP)},function(){last=0});
  })();

  /* ---------- solenoid figure ---------- */
  (function(){
    var fig=$('mini-sol'),b=fig&&fig.querySelector('[data-sol]');if(!b)return;
    var feed=fig.querySelector('.sflow.feed'),vent=fig.querySelector('.sflow.vent'),note=fig.querySelector('[data-sol-note]'),vt=null;
    function set(on,fromOn){
      fig.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));b.textContent=on?'Brew switch on':'Brew switch off';
      feed.classList.toggle('on',on);
      if(vt){clearTimeout(vt);vt=null}
      vent.classList.toggle('on',!on&&fromOn);
      if(!on&&fromOn)vt=setTimeout(function(){vent.classList.remove('on')},2200);
      note.textContent=on?'On: boiler water flows to the group.':(fromOn?'Off: the pressure left in the group vents to the drip tray.':'Off: the boiler port is shut; the group is open to the drip tray.');
    }
    b.addEventListener('click',function(){set(b.getAttribute('aria-pressed')!=='true',b.getAttribute('aria-pressed')==='true')});
    set(false,false);
  })();

  /* ---------- OPV figure ---------- */
  (function(){
    var r=$('opv-r');if(!r)return;
    var fig=$('mini-opv'),SET=11,main=fig.querySelector('.sflow.main'),ret=fig.querySelector('.sflow.ret'),plug=fig.querySelector('.opvplug'),needle=fig.querySelector('.needle');
    function upd(){
      var want=Number(r.value),p=Math.min(want,SET),open=want>SET;
      $('opv-o').textContent=want+' bar';$('opv-g').textContent=p.toFixed(p%1?1:0)+' bar';
      needle.setAttribute('transform','rotate('+(-120+240*p/15).toFixed(1)+')');
      plug.setAttribute('transform',open?'translate(0 -'+Math.min(14,4+(want-SET)*3)+')':'');
      main.classList.toggle('on',want>0);ret.classList.toggle('on',open);
    }
    r.addEventListener('input',upd);upd();
  })();

  /* ---------- the circuit ---------- */
  %%INCLUDE:learn-ladder.js%%
})();
