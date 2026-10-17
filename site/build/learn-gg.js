(function(){
  function $(id){return document.getElementById(id)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  var RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NS='http://www.w3.org/2000/svg';
  /* run fn(ms) once per screen frame while el is on screen; never with reduced motion. rest() runs when it goes off screen. */
  function onScreen(el,fn,rest){
    if(RM||!el)return;var seen=false,raf=0;
    function go(ms){raf=0;if(!seen)return;fn(ms);raf=requestAnimationFrame(go)}
    function vis(v){seen=v;if(!v&&rest)rest();if(v&&!raf)raf=requestAnimationFrame(go)}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis(es[0].isIntersecting)}).observe(el);else vis(true);
  }
  function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}

  /* ---------- before and after ---------- */
  (function(){
    var fig=$('g-blocks');if(!fig)return;
    var NOTE={stock:'Every switch and thermostat carries mains to its load.',gg:'Switches and sensors only report; the PCB decides and drives the loads.'};
    function set(a){fig.setAttribute('data-arch',a);qa('[data-arch]',fig).forEach(function(b){if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.getAttribute('data-arch')===a))});$('arch-note').textContent=NOTE[a]}
    qa('button[data-arch]',fig).forEach(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-arch'))})});
    set('gg');
  })();

  /* ---------- control loop: a small boiler model, two controllers ---------- */
  (function(){
    var fig=$('g-loop');if(!fig)return;
    /* one step is a second of model time; the element warms its sheath first, which is where overshoot comes from */
    var ctl='gg',target=93,T=60,E=0,Ts=60,on=false,duty=0,hist=[],heat=[],N=360,tick=0;
    var X0=34,X1=352,Y0=150,Y1=8,TMIN=80,TMAX=112;
    function y(t){return Y0-(Math.max(TMIN,Math.min(TMAX,t))-TMIN)*(Y0-Y1)/(TMAX-TMIN)}
    var yax=fig.querySelector('.gyax');
    [85,90,95,100,105,110].forEach(function(v){el('line',{x1:X0,x2:X1,y1:y(v),y2:y(v),'class':'gyg'},yax);var t=el('text',{x:X0-6,y:y(v)+4,'class':'gyl','text-anchor':'end'},yax);t.textContent=v});
    var trace=$('g-trace'),hg=$('g-heat');
    function setT(){$('g-tline').setAttribute('y1',y(target));$('g-tline').setAttribute('y2',y(target));$('g-tlab').setAttribute('y',y(target)-5);$('g-target-o').textContent=target+' °C'}
    function step(){
      if(ctl==='stock'){
        /* a bimetal thermostat on the boiler shell: it lags the water, and opens and closes a few degrees apart */
        Ts+=(T-Ts)*0.08;if(on&&Ts>=target+1)on=false;else if(!on&&Ts<=target-4)on=true;duty=on?1:0;
      }else if(tick%3===0){
        /* Gen 2 steps: full power far below, then a fixed share of the time (Main Divider 5, Brew Divider 3), off at the target */
        var Tl=Math.round(T*4)/4;duty=Tl<target-10?1:Tl<target-5?1/6:Tl<target?0.1:0;
      }
      tick++;
      E+=duty;var q=E*0.25;E-=q;T+=q-(T-22)*0.0012;
      hist.push(T);heat.push(duty);if(hist.length>N){hist.shift();heat.shift()}
    }
    function draw(){
      var dx=(X1-X0)/N,pts=[];
      for(var i=0;i<hist.length;i++)pts.push((X0+i*dx).toFixed(1)+','+y(hist[i]).toFixed(1));
      trace.setAttribute('d','M'+pts.join(' L'));
      while(hg.firstChild)hg.removeChild(hg.firstChild);
      /* the heater row shows power: full height when fully on, shorter for the stepped shares */
      for(var j=0;j<heat.length;){var d=heat[j],k=j;while(k<heat.length&&heat[k]===d)k++;
        if(d>0){var h=Math.max(2,14*d);el('rect',{x:(X0+j*dx).toFixed(1),y:(190-h).toFixed(1),width:Math.max(1,(k-j)*dx).toFixed(1),height:h.toFixed(1),'class':'hb'},hg)}
        j=k}
    }
    function warm(){hist=[];heat=[];T=target-2;Ts=T;E=0;on=false;tick=0;for(var i=0;i<N*3;i++)step();draw()}
    qa('button[data-ctl]',fig).forEach(function(b){b.addEventListener('click',function(){ctl=b.getAttribute('data-ctl');qa('button[data-ctl]',fig).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});warm()})});
    $('g-target').addEventListener('input',function(){target=Number(this.value);setT()});
    setT();warm();
    /* the model takes a step every 80 ms; between steps the trace and heater row slide left, so the graph scrolls evenly */
    var acc=0,last=0,dx=(X1-X0)/N;
    onScreen(fig,function(ms){
      acc+=last?Math.min(250,ms-last):0;last=ms;var moved=false;
      while(acc>=80){acc-=80;step();moved=true}
      if(moved)draw();
      var off='translate('+(-dx*acc/80).toFixed(2)+' 0)';trace.setAttribute('transform',off);hg.setAttribute('transform',off);
    },function(){last=0});
  })();

  /* ---------- pump power: cycles let through ---------- */
  (function(){
    var r=$('psm-r');if(!r)return;var g=$('psm-cycles'),n=12,w=54;
    var cyc=[];
    for(var i=0;i<n;i++){
      /* two rows of six */
      var x=18+(i%6)*w,ax=54+Math.floor(i/6)*104,gr=el('g',{'class':'cyc'},g),pp=[],pf=[];
      for(var k=0;k<=20;k++){var xx=x+k*(w/20),yy=ax-34*Math.sin(2*Math.PI*k/20);pp.push(xx.toFixed(1)+','+yy.toFixed(1))}
      for(var m=0;m<=10;m++){var x2=x+m*(w/20),y2=ax-34*Math.sin(2*Math.PI*m/20);pf.push(x2.toFixed(1)+','+y2.toFixed(1))}
      el('path',{d:'M'+pf.join(' L')+' Z','class':'f'},gr);el('path',{d:'M'+pp.join(' L'),'class':'s'},gr);
      var t=el('text',{x:x+w/2,y:ax+52},gr);cyc.push({g:gr,t:t});
    }
    function upd(){
      var p=Number(r.value)/100,acc=0,count=0;
      cyc.forEach(function(c){acc+=p;var go=acc>=0.999;if(go){acc-=1;count++}c.g.classList.toggle('on',go);c.t.textContent=go?'go':'skip'});
      $('psm-o').textContent=r.value+'%';$('psm-cap').textContent=count+' of '+n+' cycles reach the pump';
    }
    r.addEventListener('input',upd);upd();
  })();

  /* ---------- SSR: input, LED, zero-cross switching ---------- */
  (function(){
    var fig=$('g-ssr');if(!fig)return;
    var W=336,H=24,cycles=5,wave=[],onp=[],inp=[];
    for(var i=0;i<=280;i++){var x=i*W/280,ph=cycles*2*Math.PI*i/280;wave.push(x.toFixed(1)+','+(-H*Math.sin(ph)).toFixed(1))}
    $('ssr-wave').setAttribute('d','M'+wave.join(' L'));
    var t=0;
    function frame(){
      /* input high for a window; the triac starts and stops at the next zero crossing */
      var inOn=function(i){var f=(i/280+t)%1;return f>0.22&&f<0.62};
      var halfLen=280/(cycles*2),pts=[],cond=false,segs=[];
      for(var i=0;i<=280;i++){
        if(i%Math.round(halfLen)===0)cond=inOn(i);
        var x=i*W/280,ph=cycles*2*Math.PI*i/280,yv=-H*Math.sin(ph);
        if(cond){pts.push((pts.length?'L':'M')+x.toFixed(1)+','+yv.toFixed(1))}else if(pts.length){segs.push(pts.join(' '));pts=[]}
      }
      if(pts.length)segs.push(pts.join(' '));
      /* the input is a square wave whose edges sit exactly where the on-window starts and ends, so it glides */
      var a=((0.22-t)%1+1)%1*W,b=((0.62-t)%1+1)%1*W,hi=36,lo=46;
      $('ssr-in').setAttribute('d',a<b?'M0,'+lo+' H'+a.toFixed(2)+' V'+hi+' H'+b.toFixed(2)+' V'+lo+' H'+W:'M0,'+hi+' H'+b.toFixed(2)+' V'+lo+' H'+a.toFixed(2)+' V'+hi+' H'+W);
      $('ssr-on').setAttribute('d',segs.join(' '));
      var now=inOn(140);fig.classList.toggle('on',now);fig.classList.toggle('cond',now);
    }
    frame();
    onScreen(fig,function(ms){t=(ms*0.004/60)%1;frame()});
  })();

  /* ---------- thermocouple ---------- */
  (function(){
    var r=$('tc-r');if(!r)return;
    function upd(){var T=Number(r.value),mv=(T-25)*0.041;$('tc-o').textContent=T+' °C';$('tc-mv').textContent=(mv<0?'−':'')+Math.abs(mv).toFixed(2)+' mV';$('tc-read').textContent='the STM32 reads '+T+' °C';$('tc-glow').setAttribute('opacity',String(Math.min(.9,Math.max(0,(T-20)/150))))}
    r.addEventListener('input',upd);upd();
  })();

  /* ---------- pressure transducer ---------- */
  (function(){
    var r=$('px-r');if(!r)return;
    function upd(){var p=Number(r.value),v=0.5+4*p/12,x=290*p/12,yv=81-72*p/12;
      $('px-o').textContent=p+' bar';$('px-dot').setAttribute('cx',x.toFixed(1));$('px-dot').setAttribute('cy',yv.toFixed(1));
      $('px-dia').setAttribute('d','M30,104 Q70,'+(104-p*2.2).toFixed(1)+' 110,104');
      $('px-v').textContent=p+' bar gives '+v.toFixed(2)+' V on the signal pin';}
    r.addEventListener('input',upd);upd();
  })();

  /* ---------- switch input ---------- */
  (function(){
    var b=document.querySelector('[data-inp]');if(!b)return;var fig=$('g-input');
    function set(on){b.setAttribute('aria-pressed',String(on));fig.classList.toggle('on',on);
      $('inp-sw').querySelector('.blade2').setAttribute('transform',on?'':'rotate(-35)');
      $('inp-v').textContent=on?'0 V':'3.3 V';$('inp-r').textContent=on?'reads low: on':'reads high: off';
      $('inp-note').textContent=on?'Closed: the pin is tied to ground.':'Open: the pull-up holds the pin high.'}
    b.addEventListener('click',function(){set(b.getAttribute('aria-pressed')!=='true')});set(false);
  })();

  /* ---------- load cell ---------- */
  (function(){
    var r=$('ls-r');if(!r)return;
    function upd(){var g=Number(r.value),bend=g*0.12;
      $('ls-o').textContent=g+' g';$('ls-g').textContent=g.toFixed(1)+' g';
      $('ls-beam').setAttribute('transform','rotate('+(bend*0.35).toFixed(2)+' 40 82)');
      $('ls-cup').setAttribute('transform','translate(0 '+(bend*0.9).toFixed(1)+')');}
    r.addEventListener('input',upd);upd();
  })();

  /* ---------- time of flight ---------- */
  (function(){
    var r=$('tof-r');if(!r)return;var t=0,lvl=70;
    function upd(){lvl=Number(r.value);var top=212-170*lvl/100;
      $('tof-o').textContent=lvl+'%';$('tof-water').setAttribute('y',top.toFixed(1));$('tof-water').setAttribute('height',(212-top).toFixed(1));
      $('tof-beam').setAttribute('y2',top.toFixed(1));
      var mm=Math.round((top-28)*1.15);$('tof-d').textContent=mm+' mm';$('tof-ns').textContent=(2*mm/299.79).toFixed(2)+' ns';}
    function anim(){var top=Number($('tof-beam').getAttribute('y2')),f=(t%1),yy=f<.5?30+(top-30)*f*2:top-(top-30)*(f-.5)*2;$('tof-pulse').setAttribute('cy',yy.toFixed(1))}
    r.addEventListener('input',upd);upd();anim();
    onScreen($('tof-pulse').ownerSVGElement,function(ms){t=ms*0.02/40;anim()});
  })();
})();
