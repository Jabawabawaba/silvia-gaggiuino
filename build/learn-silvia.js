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

  /* ---------- machine map: modes ---------- */
  var cut=$('cut');
  var MODES={
    off:{flows:[],pump:0,sol:0,heat:0,knob:0,jug:0,puffs:0,sw:[],pwr:0,ht:0},
    heat:{flows:[],pump:0,sol:0,heat:'cycle',knob:0,jug:0,puffs:0,sw:['pwr'],pwr:1,ht:'cycle'},
    brew:{flows:['intake','pump','pumpout','boilerin','boiler','togroup','shot1','shot2','opvret'],pump:1,sol:1,heat:'cycle',knob:0,jug:0,puffs:0,sw:['pwr','brew'],pwr:1,ht:'cycle'},
    stop:{flows:['drain'],pump:0,sol:0,heat:'cycle',knob:0,jug:0,puffs:0,sw:['pwr'],pwr:1,ht:'cycle'},
    water:{flows:['intake','pump','pumpout','boilerin','boilerup','steamwater'],pump:1,sol:0,heat:'cycle',knob:1,jug:1,puffs:0,sw:['pwr','water'],pwr:1,ht:'cycle'},
    steam:{flows:['steam'],pump:0,sol:0,heat:1,knob:1,jug:1,puffs:1,sw:['pwr','steam'],pwr:1,ht:1}
  };
  var mode='heat',heatOn=false,cycT=null;
  function setMode(m){
    mode=m;var M=MODES[m];
    qa('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-mode')===m))});
    qa('.flow',cut).forEach(function(p){p.classList.toggle('on',M.flows.indexOf(p.getAttribute('data-f'))>=0)});
    cut.querySelector('.pumpbody').classList.toggle('on',!!M.pump&&!RM);
    cut.querySelector('.solcoil').classList.toggle('on',!!M.sol);
    $('knob').classList.toggle('open',!!M.knob);
    $('jug').style.opacity=M.jug?1:0;
    $('puffs').classList.toggle('on',!!M.puffs);
    ['pwr','brew','water','steam'].forEach(function(k){var on=M.sw.indexOf(k)>=0;$('sw-'+k).classList.toggle('on',on);var r=$('rk-'+k);if(r)r.classList.toggle('on',on)});
    $('lp-pwr').classList.toggle('on',!!M.pwr);
    $('modecap').textContent=$('cap-'+m).textContent;
    if(cycT){clearInterval(cycT);cycT=null}
    if(M.heat==='cycle'){heatOn=true;applyHeat();cycT=setInterval(function(){heatOn=!heatOn;applyHeat()},heatOn?2600:2600)}
    else{heatOn=!!M.heat;applyHeat()}
  }
  function applyHeat(){
    $('element').classList.toggle('hot',heatOn);
    $('heatglow').setAttribute('opacity',heatOn?'.55':'0');
    $('lp-ht').classList.toggle('on',heatOn);
  }
  qa('[data-mode]').forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-mode'))})});

  /* ---------- machine map: parts ---------- */
  var sel=null;
  function pick(id,scrollIt){
    sel=id;
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
  setMode('heat');pick(null);

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
