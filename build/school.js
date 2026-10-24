  /* ---------- Barista school: the shared layer ----------
     The same file on the Gaggia and Silvia sites; everything machine-specific comes from SCHOOL (school-site.js) and
     SIM (school-sim.js). It keeps the temperature history, runs the shot forecast, draws the temperature map and the
     surf meter, works the bench (beans, grinder, dose, puck prep, milk, cleaning), grades every shot, jug and clean-up,
     runs the lessons and keeps the care log. */
  (function(){
    if(!SIM||typeof SCHOOL==='undefined')return;
    var X=SCHOOL,E=SIM.E,K=SIM.K,root=SIM.root;
    var NS='http://www.w3.org/2000/svg';
    function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function cl(v,a,b){return v<a?a:v>b?b:v}
    function r0(x){return Math.round(x)}
    function r1(x){return (Math.round(x*10)/10).toFixed(1)}
    function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
    function mk(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
    function store(key,val){try{if(val===undefined)return JSON.parse(localStorage.getItem(key)||'null');localStorage.setItem(key,JSON.stringify(val))}catch(e){return null}}
    function txt(x){return typeof x==='function'?x():x}

    /* ======================= the bench: what's in the hopper and how you prep it ======================= */
    var B=store('school-bench-v1')||{};
    B={roast:B.roast||'medium',D:B.D||18,g:B.g||null,yield:B.yield||null,drink:B.drink||'flat',milk:B.milk||1,hints:B.hints!==false,lines:!!B.lines,span:B.span||180};
    function recipe(r){return X.recipes[r||B.roast]}
    if(!B.g)B.g=recipe().grind;
    if(!B.yield)B.yield=Math.round(B.D*recipe().ratio[2]);
    function saveBench(){store('school-bench-v1',B)}
    /* the puck you're making: dosed, distributed, tamped */
    var prep={dosed:false,wdt:false,tamp:false};

    /* ======================= history: what the map draws ======================= */
    var H=[],HMAX=8000,EV=[],lastSample=-1,lastHeat=null,lastReady=null,lampOnAt=null,lampOffAt=null,heatOnAt=null,heatOffAt=null;
    function sample(s){
      var q=s.q||{},shotOn=s.sol&&s.pf.in&&s.pf.b==='dosed'&&s.pf.wet>=s.pf.soak&&(q.spout||0)>0;
      H.push({t:s.t,Tw:s.Tw,Tb:s.Tb,Tg:s.Tg,Tpf:s.Tpf,heat:!!s.heat,lamp:X.indicator(s),brew:!!s.brew,steam:!!s.steam,water:!!s.water,
        puck:shotOn?q.Tout:null,fc:FC.on&&FC.last&&FC.last.t>s.t-1.2?FC.last.Tq:null,flash:FC.last&&FC.last.flash});
      if(H.length>HMAX)H.splice(0,H.length-HMAX);
    }
    function mark(kind,label){var s=SIM.get();EV.push({t:s.t,kind:kind,label:label});if(EV.length>400)EV.shift()}
    /* where in the heating cycle: from the element and the indicator */
    function watchCycle(s){
      var heat=!!s.heat,rd=X.indicator(s);
      if(lastHeat!==null&&heat!==lastHeat){if(heat)heatOnAt=s.t;else heatOffAt=s.t;logEv(heat?'heat-on':'heat-off')}
      if(lastReady!==null&&rd!==lastReady){if(rd)lampOnAt=s.t;else lampOffAt=s.t;logEv(rd?'lamp-on':'lamp-off')}
      lastHeat=heat;lastReady=rd;
    }
    function resetHistory(){H=[];EV=[];lastSample=-1;lastHeat=null;lastReady=null;lampOnAt=lampOffAt=heatOnAt=heatOffAt=null;FC.last=null;FC.next=0}

    /* ======================= the forecast: a shot started now, run on a copy ======================= */
    var FC={on:true,last:null,next:0};
    function forecastAt(s0,opts){
      opts=opts||{};
      if(!s0.pwr)return null;
      var s=E.clone(s0),dt=0.1;
      s.steam=0;if(s.water)s.water=0;s.knob=0;s.brew=0;
      var p=s.pf;E.dose(s,opts.D||B.D,opts.g||B.g,opts.roast||B.roast,opts.prep==null?1:opts.prep);p.in=1;
      var c=s.cup;c.pos='tray';c.v=0;c.s=0;c.Ew=0;c.EwT=0;c.cr=0;c.soap=0;c.T=c.Tc;
      var target=opts.target||B.yield,t0=s.t,flash=0,fv=0,tv=0,tr=[];
      s.brew=1;
      for(var i=0;i<600;i++){
        E.step(s,dt);var q=s.q;if((q.boilout||0)>0){tv+=q.boilout*dt;if(q.flash>0)fv+=q.boilout*dt}
        /* the shot's temperature: the water running through the soaked puck, as the map draws it */
        if((q.spout||0)>0&&s.pf.wet>=s.pf.soak){s.fcw=(s.fcw||0)+q.spout*dt;s.fcwT=(s.fcwT||0)+q.spout*dt*q.Tout}
        if(opts.trace&&q.spout>0&&s.pf.wet>=s.pf.soak)tr.push([s.t-t0,q.Tout]);
        if(E.grams(s)>=target-1)break;
      }
      var secs=s.t-t0,bev=E.grams(s);
      flash=tv>0?fv/tv:0;
      return {t:s0.t,Tq:s.fcw>0?s.fcwT/s.fcw:(c.Ew>0?c.EwT/c.Ew:null),secs:secs,bev:bev,EY:p.E/p.D*100,TDS:bev>0?p.E/bev*100:0,flash:flash,trace:tr};
    }
    function forecastTick(s){
      if(!FC.on||!s.pwr){FC.last=null;return}
      if(s.t<FC.next)return;
      /* about two forecasts a second of machine time, fewer when time runs fast so the page keeps up */
      FC.next=s.t+Math.max(0.5,SIM.speed()/6);
      if(SHOT.cur||s.brew){FC.last=null;return}
      FC.last=forecastAt(s);
    }

    /* ======================= taste: what a shot of this roast tastes like ======================= */
    function taste(res,roast){
      var R=recipe(roast),EY=res.EY,TDS=res.TDS,T=res.Tq;
      var eMid=(R.EY[0]+R.EY[1])/2,ext=(EY-eMid)/((R.EY[1]-R.EY[0])/2);
      var tLo=R.T[0],tHi=R.T[1],tOff=T<tLo?T-tLo:T>tHi?T-tHi:0;
      var sour=Math.max(0,-ext)+Math.max(0,-tOff)/2.5,bitter=Math.max(0,ext)+Math.max(0,tOff)/2.5;
      var strong=TDS>R.TDS[1]?(TDS-R.TDS[1])/1.5:0,weak=TDS<R.TDS[0]?(R.TDS[0]-TDS)/1.5:0;
      var harsh=res.prep<0.6?1:0,soap=res.soap>0.5;
      var score=100-22*Math.max(0,sour-0.6)-22*Math.max(0,bitter-0.6)-12*sour-12*bitter-10*strong-12*weak-18*harsh-(soap?40:0);
      score=Math.round(cl(score,0,100));
      var word;
      if(soap)word='Soapy';
      else if(res.flash>0.15||T>R.T[1]+5)word='Scorched';
      else if(harsh&&(sour>0.6||bitter>0.6))word='Harsh and uneven';
      else if(sour>1.6)word=weak>0.5?'Sour and thin':'Sour';
      else if(bitter>1.6)word=T>tHi+2?'Burnt and bitter':'Bitter';
      else if(sour>0.8)word='A little sour';
      else if(bitter>0.8)word='A little bitter';
      else if(weak>0.8)word='Thin';
      else if(strong>0.8)word='Strong and syrupy';
      else if(harsh)word='Uneven';
      else word=score>=88?'Sweet and balanced':'Balanced';
      var cls=score>=80?'good':score>=60?'mid':'bad';
      return {word:word,cls:cls,score:score,sour:sour,bitter:bitter,strong:strong,weak:weak,harsh:harsh,ext:ext,tOff:tOff};
    }

    /* the scale, the timer, the ratio and the milk thermometer */
    var RO={};
    function readouts(s){
      if(!RO.g){['ro-g','ro-t','ro-r','ro-m','ro-b'].forEach(function(id){RO[id.slice(3)]=$(id)})}
      var g=s.cup.pos==='tray'?E.grams(s):0;
      if(RO.g)RO.g.textContent=r1(g);
      var t=SHOT.cur?s.t-SHOT.cur.t0:(SHOT.lastSecs||0);
      if(RO.t)RO.t.textContent=r1(t);
      if(RO.r)RO.r.textContent=g>0.5?'1:'+r1(g/(SHOT.cur?SHOT.cur.D:(SHOT.lastD||B.D))):'–';
      if(RO.m)RO.m.textContent=s.jug.pos==='wand'||s.jug.used?r0(s.jug.T):'–';
      if(RO.b)RO.b.textContent=s.pwr?r0(s.Tw):'–';
    }

    /* ======================= the temperature map ======================= */
    var MAP=(function(){
      var box=$('tmap');if(!box)return null;
      var W=760,Hh=300,L=46,R=W-14,T=14,Bt=236;
      var svg=mk('svg',{viewBox:'0 0 '+W+' '+Hh,'class':'tm-svg',role:'img','aria-label':'Temperature map: the boiler and what a shot started now would get, over the last few minutes'},null);
      /* drawn at the size it shows, so the labels stay readable on a phone */
      function layout(){
        var cw=box.clientWidth||760;W=Math.round(Math.max(300,Math.min(760,cw)));Hh=W<520?250:300;L=W<520?38:46;R=W-12;T=14;Bt=Hh-64;
        svg.setAttribute('viewBox','0 0 '+W+' '+Hh);
        if(typeof band!=='undefined'){band.setAttribute('x',L);band.setAttribute('width',R-L);
          /* on a phone the band's label sits at the left, clear of the boiler and shot labels at the right edge */
          bandT.setAttribute('x',W<520?L+6:R-6);bandT.setAttribute('text-anchor',W<520?'start':'end');nowL.setAttribute('x1',R);nowL.setAttribute('x2',R);nowL.setAttribute('y2',Bt);hovL.setAttribute('y2',Bt);
          lab1.setAttribute('y',Bt+17);lampK.setAttribute('y',Bt+35)}
      }
      box.appendChild(svg);
      var gHeat=mk('g',{'class':'tm-heat'},svg),gGrid=mk('g',{'class':'tm-grid'},svg),band=mk('rect',{'class':'tm-band',x:L,width:R-L},svg);
      var bandT=mk('text',{'class':'tm-bandt',x:R-6,'text-anchor':'end'},svg);
      var gSpan=mk('g',{'class':'tm-spans'},svg);
      var pTb=mk('path',{'class':'tm-tb'},svg),pTg=mk('path',{'class':'tm-tg'},svg),pTpf=mk('path',{'class':'tm-tpf'},svg);
      var pTw=mk('path',{'class':'tm-tw'},svg),pFc=mk('path',{'class':'tm-fc'},svg),pPk=mk('path',{'class':'tm-pk'},svg);
      var gEv=mk('g',{'class':'tm-ev'},svg),gStrip=mk('g',{'class':'tm-strip'},svg);
      var nowL=mk('line',{'class':'tm-now',x1:R,x2:R,y1:T,y2:Bt},svg);
      var dTw=mk('circle',{'class':'tm-dtw',r:4.2,cx:-10,cy:-10},svg),dFc=mk('circle',{'class':'tm-dfc',r:5.2,cx:-10,cy:-10},svg);
      var lTw=mk('text',{'class':'tm-lab tm-ltw','text-anchor':'end'},svg),lFc=mk('text',{'class':'tm-lab tm-lfc','text-anchor':'end'},svg);
      var lab1=mk('text',{'class':'tm-sk',x:4,y:Bt+17},svg);lab1.textContent='ELEMENT';
      var lampK=mk('text',{'class':'tm-sk',x:4,y:Bt+35},svg);
      var gT=mk('g',{'class':'tm-tax'},svg);
      var hov=mk('g',{'class':'tm-hov',display:'none'},svg),hovL=mk('line',{y1:T,y2:Bt},hov),hovB=mk('rect',{rx:6,width:156,height:62},hov),hovT=mk('text',{},hov);
      var lo=80,hi=110,lastDraw=0,hovX=null;
      layout();if(window.ResizeObserver)new ResizeObserver(function(){var w0=W;layout();if(W!==w0)draw(true)}).observe(box);
      function y(v){return Bt-(v-lo)/(hi-lo)*(Bt-T)}
      function path(pts){var d='',on=false;for(var i=0;i<pts.length;i++){var p=pts[i];if(p==null){on=false;continue}d+=(on?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1);on=true}return d}
      function grid(){
        gGrid.textContent='';var step=hi-lo>45?10:5;
        for(var v=Math.ceil(lo/step)*step;v<=hi;v+=step){mk('line',{x1:L,x2:R,y1:y(v),y2:y(v)},gGrid);var t=mk('text',{x:L-6,y:y(v)+4,'text-anchor':'end'},gGrid);t.textContent=v+'°'}
      }
      function draw(force){
        var s=SIM.get(),now=s.t;
        if(!force&&performance.now()-lastDraw<60)return;lastDraw=performance.now();
        var span=B.span,t0=now-span,pts=H.filter(function(h){return h.t>=t0-1});
        /* the range follows what's on the map, with the roast band always in view */
        var R0=recipe(),mn=R0.T[0]-4,mx=R0.T[1]+8;
        pts.forEach(function(h){mn=Math.min(mn,h.Tw,h.puck||999,h.fc||999);mx=Math.max(mx,h.Tw,h.puck||0,h.fc||0);if(B.lines){mn=Math.min(mn,h.Tg,h.Tpf);mx=Math.max(mx,h.Tb)}});
        var tlo=Math.max(15,Math.floor((mn-2)/5)*5),thi=Math.min(165,Math.ceil((mx+2)/5)*5);if(thi-tlo<25)thi=tlo+25;
        var e=force?1:0.18;lo+=(tlo-lo)*e;hi+=(thi-hi)*e;
        grid();
        function x(t){return L+(t-t0)/span*(R-L)}
        /* heating bands and the lamp strip */
        gHeat.textContent='';gStrip.textContent='';
        var a=null,b=null;
        for(var i=0;i<pts.length;i++){var h=pts[i],xx=Math.max(L,x(h.t));
          if(h.heat&&a===null)a=xx;if((!h.heat||i===pts.length-1)&&a!==null){mk('rect',{x:a,y:T,width:Math.max(1,xx-a),height:Bt-T},gHeat);mk('rect',{x:a,y:Bt+8,width:Math.max(1,xx-a),height:9,rx:2,'class':'tm-el'},gStrip);a=null}
          if(h.lamp&&b===null)b=xx;if((!h.lamp||i===pts.length-1)&&b!==null){mk('rect',{x:b,y:Bt+26,width:Math.max(1,xx-b),height:9,rx:2,'class':'tm-lp'},gStrip);b=null}
        }
        mk('rect',{x:L,y:Bt+8,width:R-L,height:9,rx:2,'class':'tm-strk'},gStrip);mk('rect',{x:L,y:Bt+26,width:R-L,height:9,rx:2,'class':'tm-strk'},gStrip);
        lampK.textContent=X.lampKey;
        /* the band for this roast */
        sa(band,'y',y(R0.T[1]));sa(band,'height',Math.max(0,y(R0.T[0])-y(R0.T[1])));
        sa(bandT,'y',y(R0.T[1])-5);bandT.textContent=R0.name+' roast: '+R0.T[0]+' to '+R0.T[1]+' °C'+(W<520?'':' at the puck');
        /* shots and other events */
        gSpan.textContent='';gEv.textContent='';
        SHOT.log.forEach(function(sh){if(sh.t1<t0)return;var xa=Math.max(L,x(sh.t0)),xb=Math.min(R,x(sh.t1||now));mk('rect',{x:xa,y:T,width:Math.max(1,xb-xa),height:Bt-T,'class':'tm-shot'},gSpan)});
        if(SHOT.cur){var xa=Math.max(L,x(SHOT.cur.t0));mk('rect',{x:xa,y:T,width:Math.max(1,R-xa),height:Bt-T,'class':'tm-shot live'},gSpan)}
        EV.forEach(function(ev){if(ev.t<t0)return;var xx=x(ev.t),nearR=xx>R-48;mk('line',{x1:xx,x2:xx,y1:T,y2:T+10,'class':'tm-evl '+ev.kind},gEv);var tt=mk('text',{x:nearR?xx-3:xx+3,y:T+9,'text-anchor':nearR?'end':'start','class':'tm-evt '+ev.kind},gEv);tt.textContent=ev.label});
        /* lines */
        sa(pTw,'d',path(pts.map(function(h){return [x(h.t),y(h.Tw)]})));
        sa(pTb,'d',B.lines?path(pts.map(function(h){return [x(h.t),y(h.Tb)]})):'');
        sa(pTg,'d',B.lines?path(pts.map(function(h){return [x(h.t),y(h.Tg)]})):'');
        sa(pTpf,'d',B.lines?path(pts.map(function(h){return [x(h.t),y(h.Tpf)]})):'');
        sa(pFc,'d',B.hints?path(pts.map(function(h){return h.fc==null?null:[x(h.t),y(cl(h.fc,lo,hi))]})):'');
        sa(pPk,'d',path(pts.map(function(h){return h.puck==null?null:[x(h.t),y(cl(h.puck,lo,hi))]})));
        /* now */
        var last=pts[pts.length-1];
        if(last){sa(dTw,'cx',R);sa(dTw,'cy',y(last.Tw));sa(lTw,'x',R-8);sa(lTw,'y',y(last.Tw)-8);lTw.textContent='Boiler '+r0(last.Tw)+'°'}
        var fc=FC.last;
        if(B.hints&&fc&&fc.Tq!=null&&!SHOT.cur){sa(dFc,'cx',R);sa(dFc,'cy',y(cl(fc.Tq,lo,hi)));dFc.setAttribute('class','tm-dfc '+bandCls(fc));sa(lFc,'x',R-10);sa(lFc,'y',y(cl(fc.Tq,lo,hi))+16);lFc.textContent='Shot now '+r1(fc.Tq)+'°'}
        else{sa(dFc,'cx',-20);lFc.textContent=''}
        if(SHOT.cur){var pk=pts.length&&pts[pts.length-1].puck;if(pk){sa(dFc,'cx',R);sa(dFc,'cy',y(cl(pk,lo,hi)));dFc.setAttribute('class','tm-dfc puck');sa(lFc,'x',R-10);sa(lFc,'y',y(cl(pk,lo,hi))+16);lFc.textContent='Puck '+r1(pk)+'°'}}
        /* time axis */
        gT.textContent='';var stepT=span<=200?(W<520?60:30):span<=700?(W<520?150:120):(W<520?450:300);
        for(var tt2=0;tt2<=span;tt2+=stepT){var xx2=R-tt2/span*(R-L),lab=mk('text',{x:xx2,y:Hh-6,'text-anchor':tt2===0?'end':'middle'},gT);lab.textContent=tt2===0?'now':'−'+(tt2>=60?Math.floor(tt2/60)+':'+String(tt2%60).padStart(2,'0'):tt2+' s')}
        if(hovX!=null)hover(hovX,pts,t0,span);
      }
      function sa(e,k,v){v=String(v);if(e['_'+k]!==v){e['_'+k]=v;e.setAttribute(k,v)}}
      function hover(px,pts,t0,span){
        var t=t0+(px-L)/(R-L)*span,best=null,bd=1e9;
        pts.forEach(function(h){var d=Math.abs(h.t-t);if(d<bd){bd=d;best=h}});
        if(!best||px<L||px>R){hov.setAttribute('display','none');return}
        hov.removeAttribute('display');var xx=L+(best.t-t0)/span*(R-L);
        sa(hovL,'x1',xx);sa(hovL,'x2',xx);
        var bx=xx>W-180?xx-164:xx+8;sa(hovB,'x',bx);sa(hovB,'y',T+16);
        hovT.textContent='';var lines=['−'+r0(SIM.get().t-best.t)+' s','Boiler '+r1(best.Tw)+' °C'];
        if(best.puck!=null)lines.push('Puck '+r1(best.puck)+' °C');else if(best.fc!=null&&B.hints)lines.push('Shot then '+r1(best.fc)+' °C');
        lines.push((best.heat?'Heating':'Not heating')+(X.lampShort?', '+X.lampShort(best.lamp):''));
        lines.forEach(function(l,i){var ts=mk('tspan',{x:bx+8,y:T+32+i*14},hovT);ts.textContent=l});
        sa(hovB,'height',lines.length*14+10);
      }
      function pos(ev){var r=svg.getBoundingClientRect();return (ev.clientX-r.left)/r.width*W}
      svg.addEventListener('pointermove',function(ev){hovX=pos(ev);draw(true)});
      svg.addEventListener('pointerleave',function(){hovX=null;hov.setAttribute('display','none')});
      return {draw:draw};
    })();
    function bandCls(fc){
      if(!fc||fc.Tq==null)return '';var R0=recipe();
      if(fc.flash>0.15||fc.Tq>101)return 'hot';
      return fc.Tq<R0.T[0]-0.3?'cool':fc.Tq>R0.T[1]+0.3?'hot':'in';
    }

    /* ======================= the surf meter: a shot started now, and where you are in the cycle ======================= */
    var SM={T:$('sm-T'),st:$('sm-st'),ph:$('sm-ph'),mk:$('sm-mk'),bd:$('sm-bd'),tr:$('sm-tr'),box:$('surf'),lo:$('sm-lo'),hi:$('sm-hi')};
    var fcTrail=[];
    function phase(s){
      if(!s.pwr)return {k:'off',t:'Machine off.'};
      if(s.steam)return {k:'steam',t:X.readyNow(s)?'Steam mode, at steam temperature.':'Steam mode: heating toward steam temperature.'};
      if(SHOT.cur)return {k:'shot',t:'Shot running.'};
      var now=s.t,h=H.length>8?H[H.length-1].Tw-H[H.length-9].Tw:0;
      if(s.heat)return {k:'heat',t:'Heating: '+X.heatingWords+(heatOnAt!=null?', for '+r0(now-heatOnAt)+' s':'')+'.'};
      if(heatOffAt==null)return {k:'idle',t:X.idleWords+'.'};
      var since=r0(now-heatOffAt);
      if(h>0.15)return {k:'rise',t:'Still rising: the element stopped '+since+' s ago and the boiler is soaking up the last of its heat.'};
      if(h>-0.12&&since<40)return {k:'peak',t:'At the peak: '+since+' s since '+X.cue.heatOff+'.'};
      return {k:'coast',t:'Coasting down: '+since+' s since '+X.cue.heatOff+'.'};
    }
    function surf(s){
      if(!SM.box)return;
      var R0=recipe(),fc=FC.last,ph=phase(s);
      SM.ph.textContent=ph.t;SM.box.setAttribute('data-phase',ph.k);
      SM.lo.textContent=R0.T[0]+'°';SM.hi.textContent=R0.T[1]+'°';
      var g0=R0.T[0]-8,g1=R0.T[1]+8;
      function gx(v){return cl((v-g0)/(g1-g0)*100,0,100)}
      SM.bd.style.left=gx(R0.T[0])+'%';SM.bd.style.width=(gx(R0.T[1])-gx(R0.T[0]))+'%';
      if(SHOT.cur){
        var pk=H.length&&H[H.length-1].puck;
        SM.T.textContent=pk?r1(pk):'–';SM.box.setAttribute('data-st',pk?bandCls({Tq:pk,flash:0}):'');
        SM.st.textContent=pk?'At the puck right now':'Soaking the puck';
        SM.mk.style.left=(pk?gx(pk):50)+'%';SM.mk.hidden=!pk;SM.tr.textContent='';return;
      }
      if(!B.hints){SM.T.textContent='?';SM.box.setAttribute('data-st','hid');SM.st.textContent='Forecast hidden: go by '+X.phrase('lamp')+'.';SM.mk.hidden=true;SM.tr.textContent='';return}
      if(!fc||fc.Tq==null){SM.T.textContent='–';SM.box.setAttribute('data-st','');SM.st.textContent=s.pwr?'Working it out…':'Switch the machine on.';SM.mk.hidden=true;SM.tr.textContent='';return}
      var c=bandCls(fc);SM.box.setAttribute('data-st',c);SM.T.textContent=r1(fc.Tq);SM.mk.hidden=false;SM.mk.style.left=gx(fc.Tq)+'%';
      SM.st.textContent=fc.Tq>101?'Far too hot: the boiler is near steam temperature.':fc.flash>0.15?'Too hot: much of it would flash to steam at the group.':c==='in'?'In the band for a '+R0.name.toLowerCase()+' roast.':c==='cool'?r1(R0.T[0]-fc.Tq)+' °C too cool for a '+R0.name.toLowerCase()+' roast.':r1(fc.Tq-R0.T[1])+' °C too hot for a '+R0.name.toLowerCase()+' roast.';
      fcTrail.push(fc.Tq);if(fcTrail.length>6)fcTrail.shift();
      var d=fcTrail.length>2?fcTrail[fcTrail.length-1]-fcTrail[0]:0;
      SM.tr.textContent=d>0.25?'rising':d<-0.25?'falling':'steady';SM.tr.setAttribute('data-d',d>0.25?'up':d<-0.25?'down':'flat');
    }

    /* ======================= the coach: every shot, jug, flush and clean-up ======================= */
    var feed=$('coach-feed'),EMPTY='Pull a shot or steam some milk. The coach grades each one against the recipe for your beans, says where on the temperature wave you started, and what to change next time.';
    var SHOT={cur:null,log:[],n:0,lastSecs:0,lastD:null},MILK={cur:null,n:0},seen={},LOG=[];
    /* running totals the lessons read: water through the group and out of the wand, with and without descaler */
    var CNT={group:0,wand:0,groupDesc:0,wandDesc:0,rinse:0,offFor:0};
    var st={prevBrew:0,prevSteam:0,prevKnob:0,prevJug:'away',prevPf:1,prevWater:0,steamOff:null,steamedAt:null,flushes:[],purgeT:0,pfInAt:0,pfOutAt:null,bfc:0,milkPending:null,refill:null,lastShotEnd:null,shotFlush:0};
    function logEv(name,data){var s=SIM.get();LOG.push({t:s.t,n:name,d:data||null});if(LOG.length>600)LOG.shift();if(LESSON)LESSON.check()}
    function card(cls,html){
      if(!feed)return null;
      var e0=feed.querySelector('.ck-empty');if(e0)e0.remove();
      Array.prototype.forEach.call(feed.querySelectorAll('details.ck-more[open]'),function(d){d.open=false});
      var a=document.createElement('article');a.className='ck '+cls;a.innerHTML=html;
      feed.insertBefore(a,feed.firstChild);
      while(feed.children.length>16)feed.removeChild(feed.lastChild);
      return a;
    }
    function checks(list){return '<ul class="ck-list">'+list.map(function(c){return '<li class="'+(c[0]===null?'na':c[0]?'ok':'no')+'"><span class="ck-i" aria-label="'+(c[0]===null?'Note':c[0]?'Good':'To improve')+'">'+(c[0]===null?'•':c[0]?'✓':'✗')+'</span><span>'+c[1]+'</span></li>'}).join('')+'</ul>'}
    function nextList(list){return list.length?'<div class="ck-next"><span class="k">Next time</span><ul>'+list.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div>':''}
    function ctl(keys){var C=X.controls();return '<ul class="ck-ctl">'+keys.filter(function(k){return C[k]}).map(function(k){return '<li><b>'+esc(C[k][0])+'</b>: '+esc(C[k][1])+'</li>'}).join('')+'</ul>'}
    function slip(kind,title,what,keys,better){
      if(seen[kind])return;seen[kind]=1;logEv('slip',kind);
      card('slip','<div class="ck-h"><span class="ck-tag">Slip</span><h4>'+esc(title)+'</h4></div><p>'+esc(what)+'</p>'+
        (keys&&keys.length?'<details class="ck-more" open><summary>What the controls do</summary>'+ctl(keys)+'</details>':'')+'<p class="ck-best"><b>Better:</b> '+esc(better)+'</p>');
    }

    /* ---- shots ---- */
    function startShot(s){
      var p=s.pf,dosed=p.in&&p.b==='dosed'&&p.wet<1,blind=p.in&&p.b==='blind';
      var lastFlush=st.flushes.length?st.flushes[st.flushes.length-1]:null;
      SHOT.cur={t0:s.t,dosed:dosed,blind:blind,flush:!dosed&&!blind,pfIn:!!p.in,D:p.D,g:p.g,roast:p.roast,prep:p.prep,
        tw0:s.Tw,tb0:s.Tb,tg0:s.Tg,tpf0:s.Tpf,tc0:s.cup.Tc,tray:s.cup.pos==='tray',ready:E.ready(s),heat:!!s.heat,steam:!!s.steam,
        sinceOn:heatOffAt!=null?s.t-heatOffAt:null,sinceHeat:heatOnAt!=null&&s.heat?s.t-heatOnAt:null,ph:phase(s).k,
        fc:FC.last&&FC.last.t>s.t-3?FC.last:null,pfInFor:s.t-st.pfInAt,pfOutFor:st.pfOutAt!=null?st.pfInAt-st.pfOutAt:0,
        flushBefore:lastFlush&&s.t-lastFlush.t1<90?lastFlush:null,afterSteam:st.steamOff!=null?s.t-st.steamOff:null,steamFor:st.steamOff!=null&&st.steamOn!=null?st.steamOff-st.steamOn:null,
        refilled:st.refill?!!st.refill.full:null,start:E.clone(s),idleFor:s.t-(st.lastDraw==null?-1500:st.lastDraw),maxP:0,flash:0,trace:[],first:null,soap:s.det,descB:s.descB,dry:false,cupV0:s.cup.v};
      if(SHOT.cur.dosed){SHOT.cur.target=B.yield;if(!SHOT.cur.tray)slip('no-cup','The coffee went into the drip tray','The cup was still on the warmer, so the shot ran straight into the tray.',['cup','brew'],'Tap the cup down onto the scale before you switch brew on. Keeping it on the warmer until then is right: it starts the shot warm.')}
      if(!s.pwr){slip('brew-off','Nothing happens with the power off','Brew needs the machine switched on: the pump and valve have no power.',['pwr','brew'],'Switch power on first and give it time to heat.');SHOT.cur=null;return}
      X.onShotStart&&X.onShotStart(s,SHOT.cur,slip);
      if(SHOT.cur.dosed&&s.Tw>110&&!s.steam)slip('hot-shot','Brewing straight after steaming','The boiler was still near steam temperature, so the water flashed to steam at the group: it can scald, and the coffee comes out burnt.',['steam','brew','lamps'],X.refill.short);
    }
    function trackShot(s,dt){
      var c=SHOT.cur,q=s.q||{};c.maxP=Math.max(c.maxP,s.P);c.flash=Math.max(c.flash,q.flash||0);
      if(s.air||s.tank<=0.5)c.dry=true;
      if(c.dosed&&q.spout>0&&s.pf.wet>=s.pf.soak){if(c.first==null)c.first=s.t-c.t0;c.trace.push([s.t-c.t0,q.Tout])}
      if(c.dosed&&(q.boilout||0)>0&&s.pf.in){c.fw=(c.fw||0)+q.boilout*dt;if(q.flash>0)c.fv=(c.fv||0)+q.boilout*dt}
      if(c.dosed&&(q.spout||0)>0&&s.pf.wet>=s.pf.soak){c.xw=(c.xw||0)+q.spout*dt;c.xwT=(c.xwT||0)+q.spout*dt*q.Tout}
      if(c.flush){c.vol=(c.vol||0)+((q.group||0)+(q.spout||0))*dt;c.hot=Math.max(c.hot||0,q.flash||0);if(q.flash>0)c.lastFlash=s.t}
      if(c.dosed&&s.t-c.t0>60)slip('long-shot','A very long shot','Run well past the recipe, the coffee turns thin and bitter as the puck runs out of flavour.',['brew'],'Switch brew off when the scale reaches your target.');
    }
    function endShot(s){
      var c=SHOT.cur;SHOT.cur=null;if(!c)return;c.t1=s.t;var secs=s.t-c.t0;st.lastDraw=s.t;
      if(c.blind){logEv('backflush',{secs:secs,det:s.det});return}
      if(c.flush){var quiet=c.lastFlash==null||s.t-c.lastFlash>=0.4;st.flushes.push({t0:c.t0,t1:s.t,secs:secs,vol:c.vol||0,quiet:quiet});if(st.flushes.length>20)st.flushes.shift();mark('flush','Flush');logEv('flush',{secs:secs,pfIn:c.pfIn,vol:c.vol||0,steam:c.steam,hiss:(c.hot||0)>0,quiet:quiet,quietFor:c.lastFlash==null?secs:s.t-c.lastFlash});return}
      if(!c.dosed||secs<3){return}
      SHOT.n++;SHOT.lastSecs=secs;SHOT.lastD=c.D;
      var cup=s.cup,bev=c.tray?E.grams(s):0,p=s.pf,Tq=c.xw>0?c.xwT/c.xw:(cup.Ew>0?cup.EwT/cup.Ew:0);
      var res={n:SHOT.n,t0:c.t0,t1:s.t,secs:secs,bev:bev,D:c.D,ratio:bev/c.D,EY:p.E/c.D*100,TDS:bev>0?p.E/bev*100:0,Tq:Tq,prep:c.prep,roast:c.roast,g:c.g,flash:c.fw>0?(c.fv||0)/c.fw:0,soap:c.tray&&cup.v>0?cup.soap/cup.v*10:0,maxP:c.maxP,trace:c.trace,first:c.first,tray:c.tray};
      res.taste=taste(res,c.roast);
      SHOT.log.push(res);if(SHOT.log.length>60)SHOT.log.shift();
      mark('shot','Shot '+SHOT.n);
      shotCard(c,res,s);
      logEv('shot',res);
      COMPASS.draw();
    }
    /* the grind that would have hit the recipe's time, tried on a copy of the machine as it was when the shot began */
    function grindFix(c,res){
      var R0=recipe(c.roast),want=(R0.time[0]+R0.time[1])/2,best=null;
      for(var dg=-6;dg<=6;dg++){
        var g=c.g+dg;if(g<1||g>20)continue;
        var f=forecastAt(c.start,{D:c.D,g:g,roast:c.roast,prep:1,target:B.yield});if(!f)continue;
        var sc=Math.abs(f.secs-want);if(!best||sc<best.sc)best={g:g,sc:sc,f:f};
      }
      return best;
    }
    function shotCard(c,res,s){
      var R0=recipe(c.roast),T=res.taste,L=[],N=[];
      var inT=res.Tq>=R0.T[0]&&res.Tq<=R0.T[1];
      L.push([inT,'About <b>'+r1(res.Tq)+' °C</b> at the puck: '+(inT?'in the band for a '+R0.name.toLowerCase()+' roast ('+R0.T[0]+' to '+R0.T[1]+' °C).':res.Tq<R0.T[0]?r1(R0.T[0]-res.Tq)+' °C under the '+R0.name.toLowerCase()+'-roast band ('+R0.T[0]+' to '+R0.T[1]+' °C).':r1(res.Tq-R0.T[1])+' °C over the '+R0.name.toLowerCase()+'-roast band ('+R0.T[0]+' to '+R0.T[1]+' °C).')]);
      L.push([null,X.surfNote(c,res,R0)]);
      if(!inT)N.push(X.tempAdvice(res.Tq<R0.T[0]?'cool':'hot',c.roast,c));
      var rOk=res.ratio>=R0.ratio[0]-0.05&&res.ratio<=R0.ratio[1]+0.05;
      L.push([rOk,r1(res.bev)+' g from '+r1(c.D)+' g: <b>1:'+r1(res.ratio)+'</b>'+(rOk?', the recipe\'s 1:'+R0.ratio[0]+' to 1:'+R0.ratio[1]+'.':res.ratio<R0.ratio[0]?', shorter than the recipe\'s 1:'+R0.ratio[0]+' to 1:'+R0.ratio[1]+'.':', longer than the recipe\'s 1:'+R0.ratio[0]+' to 1:'+R0.ratio[1]+'.')]);
      if(!rOk)N.push('Stop at about '+r0(c.D*R0.ratio[2])+' g on the scale (1:'+R0.ratio[2]+').');
      var tOk=res.secs>=R0.time[0]-1&&res.secs<=R0.time[1]+1;
      L.push([tOk,'<b>'+r0(res.secs)+' s</b> with the switch on'+(res.first!=null?', first drops at '+r0(res.first)+' s':'')+(tOk?'.':res.secs<R0.time[0]?': fast for this recipe ('+R0.time[0]+' to '+R0.time[1]+' s).':': slow for this recipe ('+R0.time[0]+' to '+R0.time[1]+' s).')]);
      if(!tOk){var fx=grindFix(c,res);if(fx&&fx.g!==c.g)N.push('Grind about '+Math.abs(fx.g-c.g)+' step'+(Math.abs(fx.g-c.g)>1?'s':'')+' '+(fx.g<c.g?'finer':'coarser')+' (to '+fx.g+' on this grinder) to land near '+r0(fx.f.secs)+' s.')}
      var eOk=res.EY>=R0.EY[0]&&res.EY<=R0.EY[1];
      L.push([eOk,'Extraction about <b>'+r1(res.EY)+'%</b>, strength '+r1(res.TDS)+'% (the model\'s figures): '+(eOk?'in the sweet spot for this roast.':res.EY<R0.EY[0]?'under-extracted, which tastes sour.':'over-extracted, which tastes bitter and dry.')]);
      if(!eOk&&tOk&&inT)N.push(res.EY<R0.EY[0]?'For more extraction at the same time, grind a step finer and let it run a little longer (a bigger ratio).':'For less extraction, grind a step coarser or stop a few grams sooner.');
      L.push([c.prep>=0.99,c.prep>=0.99?'Puck distributed and tamped.':c.prep>0.5?'The puck was tamped but not distributed: water finds the thin spots.':'The puck wasn\'t distributed or tamped: water channels through it.']);
      if(c.prep<0.99)N.push('Distribute the grounds and tamp level before you lock the portafilter in.');
      var gw=c.tg0>=X.warm.group,pw=c.tpf0>=X.warm.pf;
      L.push([gw,'Group at '+r0(c.tg0)+' °C'+(gw?': heat-soaked.':': still warming up.')]);
      if(!gw)N.push(X.warmAdvice);
      L.push([pw,'Portafilter at '+r0(c.tpf0)+' °C'+(pw?'.':': a cool portafilter takes heat out of the shot.')]);
      if(!pw)N.push('Keep the portafilter locked in while the machine heats, dose quickly, and lock it straight back in.');
      if(c.tray)L.push([c.tc0>=38,'Cup at '+r0(c.tc0)+' °C'+(c.tc0>=38?': warmed.':': a cold cup cools the shot.')]);
      if(c.afterSteam!=null&&c.afterSteam<600&&!(c.steamFor!=null&&c.steamFor<15)){L.push([c.tw0<=106,c.tw0<=106?'Back down from steam temperature before the shot.':'Still too hot from steaming.']);if(c.tw0>106)N.push(X.refill.short)}
      if(res.soap>0.5){L.push([false,'Detergent was still in the group: rinse after a detergent backflush.']);N.push('After a detergent backflush, take the blind basket out and run water through the group, then pull and pour away one shot.')}
      if(c.dry)N.push('Refill the tank before it runs dry.');
      var good=L.filter(function(x){return x[0]===true}).length,tot=L.filter(function(x){return x[0]!==null}).length;
      var a=card('shot '+T.cls,'<div class="ck-h"><span class="ck-tag">Shot '+res.n+' · '+esc(R0.name)+' roast</span><h4>'+esc(T.word)+'</h4><span class="ck-score">'+T.score+'</span></div>'+
        '<p class="ck-stats">'+[r1(res.bev)+' g in '+r0(res.secs)+' s','1:'+r1(res.ratio),r1(res.Tq)+' °C at the puck','EY '+r1(res.EY)+'%','TDS '+r1(res.TDS)+'%',r1(res.maxP)+' bar'].join(' · ')+'</p>'+
        '<div class="ck-fig">'+spark(res,R0)+'</div>'+checks(L)+nextList(N)+'<p class="ck-tally">'+good+' of '+tot+' checks</p>');
    }
    /* the shot's temperature at the puck, second by second, against the band */
    function spark(res,R0){
      var tr=res.trace;if(!tr.length)return '';
      var W=320,H2=86,t1=Math.max(10,tr[tr.length-1][0]),lo=Math.min(R0.T[0]-6,Math.min.apply(null,tr.map(function(p){return p[1]}))-1),hi=Math.max(R0.T[1]+4,Math.max.apply(null,tr.map(function(p){return p[1]}))+1);
      function x(t){return 34+t/t1*(W-42)}function y(v){return H2-14-(v-lo)/(hi-lo)*(H2-24)}
      var d=tr.map(function(p,i){return (i?'L':'M')+x(p[0]).toFixed(1)+','+y(p[1]).toFixed(1)}).join('');
      return '<svg viewBox="0 0 '+W+' '+H2+'" class="spark" role="img" aria-label="Temperature at the puck through the shot, against the '+esc(R0.name.toLowerCase())+'-roast band">'+
        '<rect class="sp-band" x="34" width="'+(W-42)+'" y="'+y(R0.T[1]).toFixed(1)+'" height="'+(y(R0.T[0])-y(R0.T[1])).toFixed(1)+'"/>'+
        '<text class="sp-ax" x="30" y="'+(y(R0.T[1])+4).toFixed(1)+'" text-anchor="end">'+R0.T[1]+'°</text><text class="sp-ax" x="30" y="'+(y(R0.T[0])+4).toFixed(1)+'" text-anchor="end">'+R0.T[0]+'°</text>'+
        '<path class="sp-line" d="'+d+'"/><text class="sp-ax" x="'+(W-8)+'" y="'+(H2-1)+'" text-anchor="end">'+r0(t1)+' s</text><text class="sp-ax" x="34" y="'+(H2-1)+'">0 s</text></svg>';
    }

    /* ---- milk ---- */
    function startMilk(s){MILK.cur={t0:s.t,ready:E.ready(s)&&!!s.steam,purged:st.purgeT>=1,spurt:0,maxT:s.jug.T,T0:s.jug.T,offOpen:false,m:s.jug.m,drink:B.drink};}
    function endMilk(s){
      var m=MILK.cur;MILK.cur=null;if(!m)return;var j=s.jug,T=m.maxT,secs=s.t-m.t0;
      if(T<20&&secs<3)return;
      MILK.n++;var D0=X.drinks[m.drink],foamPct=j.foam/j.m*100,water=j.w/j.m*100,bigR=j.foam>2?j.big/j.foam:0;
      var tex=bigR>0.35?'big bubbles':bigR>0.15?'some big bubbles':j.foam<2?'flat, almost no foam':j.spin>=4?'silky microfoam':'foam that needed more spin';
      var L=[],N=[];
      L.push([m.ready,m.ready?X.phrase('steamWaited'):X.phrase('steamEarly')]);
      if(!m.ready)N.push(X.phrase('steamWait'));
      L.push([m.purged&&m.spurt<2,m.purged?'Purged the wand into the drip tray first.':m.spurt>=2?'The wand\'s first water went into the milk ('+r0(m.spurt)+' ml).':'No purge first.']);
      if(!m.purged)N.push('Purge first: open the knob with no jug until the water turns to steam, then close it.');
      var fOk=foamPct>=D0.foam[0]&&foamPct<=D0.foam[1];
      L.push([fOk,'Stretched about <b>'+r0(foamPct)+'%</b>: '+(fOk?'right for a '+D0.name.toLowerCase()+' ('+D0.foam[0]+' to '+D0.foam[1]+'%).':foamPct<D0.foam[0]?'too little for a '+D0.name.toLowerCase()+' ('+D0.foam[0]+' to '+D0.foam[1]+'%).':'too much for a '+D0.name.toLowerCase()+' ('+D0.foam[0]+' to '+D0.foam[1]+'%).')]);
      if(foamPct<D0.foam[0])N.push('Keep the tip at the surface a little longer at the start, hissing gently, before you sink it.');
      if(foamPct>D0.foam[1])N.push('Sink the tip sooner: for a '+D0.name.toLowerCase()+', stretch only until the jug feels close to body temperature.');
      var aOk=j.airH<=X.stretchMax+1||j.foam<2;
      L.push([aOk&&bigR<=0.15,'Texture: '+tex+(j.airH>X.stretchMax+1&&j.foam>=2?', from air let in once the milk was past '+X.stretchMax+' °C.':'.')]);
      if(j.airH>X.stretchMax+1&&j.foam>=2)N.push('Do all the stretching early, while the milk is still cool (under about '+X.stretchMax+' °C), then keep the tip under the surface.');
      if(j.spit>1.5)N.push('Keep the tip just under the surface: held too high it spits big bubbles.');
      if(j.spin<4&&j.foam>=2)N.push('After stretching, tilt the jug so the milk spins with the tip under the surface: that folds the bubbles in finer.');
      var tOk=T>=55&&T<=66;
      L.push([tOk,'Stopped at <b>'+r0(T)+' °C</b>'+(T<50?': too cool to taste sweet.':T<55?': a touch cool.':T>70?': scalded, it loses its sweetness.':T>66?': a little past the sweet spot.':'.')]);
      if(T<55)N.push('Keep steaming to about 60 to 65 °C on the thermometer.');
      if(T>66)N.push('Close the knob at about 60 °C; the milk keeps rising a little after.');
      L.push([null,'Water from the steam: about '+r0(water)+'% of the milk (the model\'s figure). Some is unavoidable, since steam heats milk by condensing in it; the purge keeps the boiler\'s first water out.']);
      L.push([!m.offOpen,m.offOpen?'The jug came off with the knob still open: on a real machine that sprays milk.':'Closed the knob before taking the jug away.']);
      if(m.offOpen)N.push('Close the knob, then take the jug away.');
      var scored=L.filter(function(x){return x[0]!==null}),good=scored.filter(function(x){return x[0]===true}).length;
      var score=Math.round(100*good/scored.length),cls=score>=84?'good':score>=60?'mid':'bad';
      var word=T>70?'Scalded':T<50?'Lukewarm':m.spurt>=2?'Watery':bigR>0.35?'Bubbly':!fOk&&foamPct<D0.foam[0]?'Flat':!fOk?'Too foamy':score>=84?'Silky':'Nearly there';
      card('milk '+cls,'<div class="ck-h"><span class="ck-tag">Milk '+MILK.n+' · '+esc(D0.name)+'</span><h4>'+esc(word)+'</h4><span class="ck-score">'+score+'</span></div>'+
        '<p class="ck-stats">'+[r0(m.m)+' ml milk',r0(secs)+' s of steam',r0(T)+' °C',r0(foamPct)+'% stretch',tex].join(' · ')+'</p>'+checks(L)+nextList(N)+
        '<p class="ck-now"><b>Now:</b> purge the wand into the drip tray for a second and wipe it with a damp cloth before the milk dries on. '+esc(X.refill.now)+'</p>');
      st.milkPending={t:s.t,purge:false,wipe:false,done:false};
      logEv('milk',{T:T,foam:foamPct,big:bigR,water:water,score:score,drink:m.drink});
    }

    /* ---- watching every step: switches, the wand, the boiler after steaming, slips ---- */
    function watch(s,dt){
      var q=s.q||{},R0=recipe();
      watchCycle(s);
      if(LESSON)LESSON.tick(s.t);
      if(s.t-lastSample>=0.25){sample(s);lastSample=s.t}
      forecastTick(s);
      /* brew: a shot, a flush, or a backflush cycle */
      if(s.brew&&!st.prevBrew&&s.pwr)startShot(s);
      if(SHOT.cur)trackShot(s,dt);
      if(!s.brew&&st.prevBrew){endShot(s)}
      if(s.bfc!==st.bfc){st.bfc=s.bfc;logEv('bf-cycle',{det:s.det})}
      /* steam */
      if(s.steam&&!st.prevSteam){st.purgeT=0;st.steamOn=s.t;mark('steam','Steam');logEv('steam-on')}
      if(!s.steam&&st.prevSteam){st.steamOff=s.t;st.refill={t0:s.t,full:false,cool:false,cycle:false,vol0:s.vol,done:false};mark('steam','Steam off');logEv('steam-off');if(MILK.cur)endMilk(s)}
      if(s.water&&!st.prevWater)logEv('water-on');if(!s.water&&st.prevWater)logEv('water-off');
      if(s.knob!==st.prevKnob)logEv(s.knob?'knob-open':'knob-close');
      /* the wand: a purge, then milk */
      var out=(q.qW||0)+(q.mS||0);
      if(out>0&&s.jug.pos!=='wand'){st.purgeT+=dt;if(st.milkPending&&!st.milkPending.purge&&st.purgeT>0.8){st.milkPending.purge=true;logEv('purge-after')}
        if(st.purgeT>0.8&&!st.purgeLogged){st.purgeLogged=true;logEv('purge')}}
      else if(!(out>0))st.purgeLogged=false;
      if(out>0&&s.jug.pos==='wand'&&!MILK.cur)startMilk(s);
      if(MILK.cur){var m=MILK.cur;m.maxT=Math.max(m.maxT,s.jug.T);
        if(s.jug.pos==='wand'&&(q.qW||0)>0&&!(q.mS>0))m.spurt+=(q.qW||0)*dt;
        if(m.spurt>=2&&!m.purged)slip('no-purge','Water in the milk','The first thing out of the wand from a full boiler is hot water, and it went into the jug.',['knob','steam'],'Purge first: open the knob with no jug until the water turns to steam, close it, then steam the milk.');
        if(s.jug.T>72)slip('milk-hot','The milk is past 70 °C','Above about 70 °C milk loses its sweetness and the foam breaks down.',['knob','jug'],'Close the knob at about 60 °C; it keeps rising a few degrees.');
      }
      if(s.jug.pos!==st.prevJug){
        logEv(s.jug.pos==='wand'?'jug-on':'jug-off');
        if(s.jug.pos!=='wand'&&MILK.cur){if(s.knob){MILK.cur.offOpen=true;slip('jug-open','The jug came off with the knob open','On a real machine the steam blows milk everywhere as the tip leaves the surface.',['knob','jug'],'Close the knob first, then take the jug away.')}endMilk(s)}
      }
      if(MILK.cur&&!s.knob&&s.jug.pos==='wand'&&!s.steam&&!(out>0))endMilk(s);
      /* after the milk: purge and wipe the wand before the milk dries on */
      var mp=st.milkPending;
      if(mp&&!mp.done){
        if(mp.purge&&mp.wipe){mp.done=true;logEv('wand-clean');card('clean good','<div class="ck-h"><span class="ck-tag">Clean-up</span><h4>Wand clean</h4></div>'+checks([[true,'Purged the wand after steaming: no milk left inside it.'],[true,'Wiped the outside before the milk dried on.']]))}
        else if(s.t-mp.t>90){mp.done=true;slip('wand-dirty','Milk left on the wand','Milk dries onto a hot wand in a minute or two and bakes into a crust that holds bacteria; milk pulled back inside it sours.',['knob'],'Straight after steaming: point the wand at the drip tray, open the knob for a second to blow it out, and wipe it with a damp cloth.')}
      }
      /* after steaming: refill the boiler and bring it back to brew temperature */
      var rf=st.refill;
      if(rf&&!rf.done){
        if(!rf.full&&s.vol>=K.full*0.97&&s.Tw<120){rf.full=true;logEv('refilled')}
        if(!rf.cool&&s.Tw<=R0.T[1]+9&&!s.steam){rf.cool=true;logEv('cooled')}
        if(rf.cool&&!rf.cycle&&E.ready(s)&&!s.steam&&s.Tw<=R0.T[1]+11){rf.cycle=true}
        if(rf.full&&rf.cool&&rf.cycle){rf.done=true;logEv('brew-ready-again',{secs:s.t-rf.t0});
          card('clean good','<div class="ck-h"><span class="ck-tag">After steaming</span><h4>Back to brew temperature</h4></div>'+checks([[true,'Boiler refilled: the steam had left it about '+r0((1-rf.vol0/K.full)*100)+'% down.'],[true,'Cooled from steam temperature in '+r0(s.t-rf.t0)+' s.'],[true,X.phrase('back')]]))}
        if(s.steam)st.refill=null;
      }
      /* knob open for a while with nothing coming out */
      if(s.knob&&!s.pumpOn&&!s.steam&&s.Tw<100.3&&!(out>0)){st.kc=(st.kc||0)+dt;if(st.kc>6)slip('knob-cold','Nothing came out of the wand','The knob only lets out what the boiler has: below boiling there\'s no steam to give.',['steam','knob','lamps'],X.knobColdBetter)}else st.kc=0;
      if(s.steam&&!s.knob&&!MILK.cur){st.idle=(st.idle||0)+dt;if(st.idle>150)slip('steam-idle','Steam still on','The boiler sits at steam temperature, too hot for the next shot.',['steam','brew'],X.refill.short)}else st.idle=0;
      if(s.pumpOn&&(s.air||s.tank<=0.5))slip('dry','The tank ran dry','With no water the pump rattles and draws air, and it won\'t push against the coffee until that air is out.',['tank','knob','brew'],X.primeBetter);
      if(s.puddle>0)slip('tray','The drip tray overflowed','Every flush, purge and vent ends up in the tray.',['tank'],'Tap the drip tray to empty it now and then.');
      if(SHOT.cur&&SHOT.cur.dosed&&s.det>0.05)slip('soap','Detergent in the coffee','The group still had cleaner in it from the backflush.',[],'After a detergent backflush, take the blind basket out and flush the group with water, backflush a few times with plain water, then pull and pour away one shot.');
      if(SHOT.cur&&SHOT.cur.dosed&&s.descB>0.05)slip('desc-cup','Descaler in the coffee','The boiler still had descaling solution in it.',[],'Finish the rinse: fresh water in the tank and run it through the group and the wand until the tank is empty, then refill.');
      CNT.group+=((q.group||0)+(q.spout||0))*dt;var wo=s.jug.pos==='wand'?0:(q.qW||0)*dt;CNT.wand+=wo;
      if(s.descB>0.05){CNT.groupDesc+=((q.group||0)+(q.spout||0))*dt;CNT.wandDesc+=wo}
      if(st.descRun&&s.desc<0.01&&s.pumpOn)CNT.rinse+=(q.pumpout||0)*dt;
      if(!s.pwr)CNT.offFor+=dt;
      if(!!s.pwr!==!!st.prevPwr){logEv(s.pwr?'pwr-on':'pwr-off');if(!s.pwr)CNT.offFor=0}
      st.prevPwr=s.pwr;
      st.prevBrew=s.brew;st.prevSteam=s.steam;st.prevKnob=s.knob;st.prevJug=s.jug.pos;st.prevWater=s.water||0;
      if(s.pf.in!==st.prevPf){if(s.pf.in)st.pfInAt=s.t;else st.pfOutAt=s.t;logEv(s.pf.in?'pf-in':'pf-out');st.prevPf=s.pf.in}
    }

    /* ======================= the bench controls ======================= */
    function qb(sel){return Array.prototype.slice.call(document.querySelectorAll(sel))}
    function pressed(sel,attr,val){qb(sel).forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute(attr)===String(val)))})}
    function prepVal(){return Math.round((0.35+(prep.wdt?0.3:0)+(prep.tamp?0.35:0))*100)/100}
    function benchSync(){
      var s=SIM.get(),R0=recipe(),p=s.pf,out=!p.in;
      pressed('[data-roast]','data-roast',B.roast);
      var g=$('b-g');if(g){g.value=B.g;$('b-gv').textContent=B.g}
      if($('b-dose'))$('b-dose').textContent=r1(B.D)+' g';
      if($('b-yield'))$('b-yield').textContent=r0(B.yield)+' g';
      if($('b-ratio'))$('b-ratio').textContent='1:'+r1(B.yield/B.D);
      if($('b-rec'))$('b-rec').innerHTML='<b>'+esc(R0.name)+' roast recipe:</b> '+r0(B.D)+' g in, about '+r0(B.D*R0.ratio[2])+' g out (1:'+R0.ratio[0]+' to 1:'+R0.ratio[1]+'), '+R0.time[0]+' to '+R0.time[1]+' s, '+R0.T[0]+' to '+R0.T[1]+' °C at the puck.';
      var empty=out&&p.b==='empty',dosed=out&&p.b==='dosed'&&p.wet<1;
      var bd=$('b-grind'),bw=$('b-wdt'),bt=$('b-tamp');
      if(bd){bd.disabled=!empty;bd.setAttribute('aria-pressed',String(dosed||(p.in&&p.b==='dosed')))}
      if(bw){bw.disabled=!dosed||prep.wdt||prep.tamp;bw.setAttribute('aria-pressed',String(prep.wdt&&(p.b==='dosed')))}
      if(bt){bt.disabled=!dosed||prep.tamp;bt.setAttribute('aria-pressed',String(prep.tamp&&(p.b==='dosed')))}
      var hint=$('b-prephint');if(hint)hint.textContent=p.in?(p.b==='dosed'?'Dosed and locked in: ready to brew.':p.b==='spent'?'Take the portafilter out and knock out the spent puck.':p.b==='blind'?'Blind basket in: ready to backflush.':'Take the portafilter out (tap it) to dose.'):p.b==='spent'?'Tap the basket on the counter to knock out the puck.':p.b==='blind'?'Blind basket: swap back to the double basket to brew.':empty?'Grind and dose into the basket.':dosed?(prep.tamp?'Tamped: lock it in (tap the handle).':prep.wdt?'Distributed: now tamp.':'Distribute the grounds, then tamp.'):'';
      pressed('[data-basket]','data-basket',p.b==='blind'?'blind':'double');
      qb('[data-basket]').forEach(function(b){b.disabled=p.in||p.b==='dosed'||p.b==='spent'});
      var dt=$('b-det');if(dt){dt.disabled=!(p.b==='blind'&&!p.in)||s.det>0.5;dt.setAttribute('aria-pressed',String(s.det>0.5))}
      pressed('[data-milk]','data-milk',B.milk);pressed('[data-drink]','data-drink',B.drink);
      pressed('[data-tip]','data-tip',s.jug.tip);qb('[data-tip]').forEach(function(b){b.disabled=s.jug.pos!=='wand'});
      var w=$('b-wipe');if(w)w.disabled=s.wand.out<0.5;
      pressed('[data-speed]','data-speed',SIM.speed());pressed('[data-span]','data-span',B.span);
      var hb=$('t-hints');if(hb)hb.setAttribute('aria-pressed',String(B.hints));
      var lb=$('t-lines');if(lb)lb.setAttribute('aria-pressed',String(B.lines));
      var pa=$('t-pause');if(pa){pa.setAttribute('aria-pressed',String(SIM.pause()));pa.setAttribute('aria-label',SIM.pause()?'Resume':'Pause')}
      root.classList.toggle('hints-off',!B.hints);
      X.benchSync&&X.benchSync(s);
    }
    function setRoast(r){B.roast=r;var R0=recipe();B.g=R0.grind;B.yield=Math.round(B.D*R0.ratio[2]);saveBench();benchSync();FC.next=0;if(MAP)MAP.draw(true);logEv('roast',r)}
    function on(id,fn){var e=$(id);if(e)e.addEventListener('click',function(ev){ev.preventDefault();fn(e);benchSync()})}
    qb('[data-roast]').forEach(function(b){b.addEventListener('click',function(){setRoast(b.getAttribute('data-roast'))})});
    var gIn=$('b-g');if(gIn){gIn.addEventListener('input',function(){B.g=Number(gIn.value);saveBench();$('b-gv').textContent=B.g;FC.next=0});gIn.addEventListener('change',function(){logEv('grind',B.g)})}
    on('b-dose-m',function(){B.D=Math.max(14,B.D-0.5);B.yield=Math.round(B.D*recipe().ratio[2]);saveBench()});
    on('b-dose-p',function(){B.D=Math.min(21,B.D+0.5);B.yield=Math.round(B.D*recipe().ratio[2]);saveBench()});
    on('b-yield-m',function(){B.yield=Math.max(20,B.yield-1);saveBench();logEv('yield',B.yield)});
    on('b-yield-p',function(){B.yield=Math.min(70,B.yield+1);saveBench();logEv('yield',B.yield)});
    on('b-recipe',function(){setRoast(B.roast)});
    function doDose(){var s=SIM.get(),p=s.pf;if(p.in||p.b!=='empty')return;prep={dosed:true,wdt:false,tamp:false};E.dose(s,B.D,B.g,B.roast,prepVal());logEv('dosed',{D:B.D,g:B.g,roast:B.roast});SIM.render()}
    on('b-grind',doDose);
    on('b-wdt',function(){var s=SIM.get();if(s.pf.b!=='dosed'||s.pf.in)return;prep.wdt=true;s.pf.prep=prepVal();logEv('wdt')});
    on('b-tamp',function(){var s=SIM.get();if(s.pf.b!=='dosed'||s.pf.in)return;prep.tamp=true;s.pf.prep=prepVal();logEv('tamp')});
    qb('[data-basket]').forEach(function(b){b.addEventListener('click',function(){var s=SIM.get(),p=s.pf;if(p.in||p.b==='dosed'||p.b==='spent')return;p.b=b.getAttribute('data-basket')==='blind'?'blind':'empty';logEv('basket',p.b);SIM.render();benchSync()})});
    on('b-det',function(){var s=SIM.get();if(s.pf.b!=='blind'||s.pf.in)return;s.det=1;logEv('detergent')});
    function jugFor(n){var s=SIM.get(),j=s.jug;if(j.pos==='wand'&&MILK.cur)return;SIM.freshJug(j);j.m=X.milk[n].m;j.cap=X.milk[n].cap;SIM.render()}
    qb('[data-milk]').forEach(function(b){b.addEventListener('click',function(){B.milk=Number(b.getAttribute('data-milk'));saveBench();jugFor(B.milk);benchSync()})});
    qb('[data-drink]').forEach(function(b){b.addEventListener('click',function(){B.drink=b.getAttribute('data-drink');saveBench();benchSync()})});
    qb('[data-tip]').forEach(function(b){b.addEventListener('click',function(){var s=SIM.get();s.jug.tip=b.getAttribute('data-tip');logEv('tip',s.jug.tip);SIM.render();benchSync()})});
    on('b-wipe',function(){var s=SIM.get(),w=s.wand;w.out=w.bake>0.6?0.6:0;if(w.bake<=0.6)w.bake=0;if(st.milkPending)st.milkPending.wipe=true;logEv('wipe');SIM.render()});
    qb('[data-speed]').forEach(function(b){b.addEventListener('click',function(){SIM.speed(Number(b.getAttribute('data-speed')));benchSync()})});
    qb('[data-span]').forEach(function(b){b.addEventListener('click',function(){B.span=Number(b.getAttribute('data-span'));saveBench();benchSync();if(MAP)MAP.draw(true)})});
    on('t-hints',function(){B.hints=!B.hints;saveBench();if(MAP)MAP.draw(true)});
    on('t-lines',function(){B.lines=!B.lines;saveBench();if(MAP)MAP.draw(true)});
    on('t-pause',function(){SIM.pause(!SIM.pause())});
    on('t-reset',function(){restart('cold')});
    on('t-warm',function(){restart('warm')});
    /* a machine left on for 25 minutes, the empty portafilter in the group and the cup on the warmer, somewhere in its cycle */
    function warmState(mins,until){
      /* someone has been using it: a machine with an auto-off (the Silvia E) stays awake */
      function st1(){E.step(s,0.1);if(s.idle)s.idle=0}
      var s=E.fresh();s.pwr=1;var n=Math.round((mins||25)*60/0.1);
      for(var i=0;i<n;i++)st1();
      var extra=Math.round(Math.random()*60/0.1);for(var k=0;k<extra;k++)st1();
      /* a lesson can ask to start at a point in the cycle, e.g. just as the element comes on */
      if(until){for(var m=0;m<36000&&!until(s);m++)st1()}
      s.t=0;return s;
    }
    function restart(kind,opts){
      var s=kind==='warm'?warmState((opts&&opts.mins)||X.warmMins,opts&&opts.until):E.fresh();
      if(opts&&opts.mod)opts.mod(s);
      prep={dosed:false,wdt:false,tamp:false};
      SIM.set(s);resetHistory();SHOT.cur=null;MILK.cur=null;seen={};
      st={prevBrew:0,prevSteam:s.steam,prevKnob:s.knob,prevJug:s.jug.pos,prevPf:s.pf.in,prevWater:0,steamOff:null,flushes:[],purgeT:0,pfInAt:0,pfOutAt:null,bfc:s.bfc||0,milkPending:null,refill:null};
      if(kind==='cold')SIM.fresh();else root.classList.remove('fresh');
      if(!opts||!opts.keepFeed){SHOT.log=[];SHOT.n=0;MILK.n=0;if(feed)feed.innerHTML='<p class="ck-empty">'+esc(EMPTY)+'</p>';COMPASS.draw()}
      LOG=[];DRINKS=[];CNT={group:0,wand:0,groupDesc:0,wandDesc:0,rinse:0,offFor:0};st.descRun=false;st.prevPwr=s.pwr;benchSync();if(MAP)MAP.draw(true);
    }
    SIM.on(function(ev,a){
      if(ev==='step'){watch(a,arguments[2]||E.DT);return}
      if(ev==='render'){readouts(a);surf(a);cleanMeters(a);drinkSync(a);if(MAP)MAP.draw();return}
      if(ev==='act'){benchSync();logEv('act',a);return}
      if(ev==='knock'){prep={dosed:false,wdt:false,tamp:false};logEv('knock');benchSync();return}
      if(ev==='dose-ask'){doDose();benchSync();return}
      if(ev==='blocked'&&a!=='pf'){if(X.onBlocked)X.onBlocked(a,slip);return}
      if(ev==='blocked'){slip('pf-stuck','Don\'t force the portafilter','There was still pressure in the group. Forced out, a real one sprays scalding water and grounds.',['pf','brew'],'Switch brew off and give it a couple of seconds for the 3-way valve to vent the pressure into the drip tray, then take it out.');return}
      if(ev==='setup'){benchSync();X.adapt&&X.adapt(K);refs();FC.next=0;if(MAP)MAP.draw(true);if(LESSON){LESSON.render();LESSON.renderCourse()}return}
    });

    /* ======================= the espresso compass: extraction against strength ======================= */
    var COMPASS=(function(){
      var box=$('compass');if(!box)return {draw:function(){}};
      var W=360,Hc=300,L=44,R=W-12,T=14,Bc=Hc-38,x0=12,x1=26,y0=5,y1=14;
      function x(v){return L+(v-x0)/(x1-x0)*(R-L)}function y(v){return Bc-(v-y0)/(y1-y0)*(Bc-T)}
      var svg=mk('svg',{viewBox:'0 0 '+W+' '+Hc,'class':'cp-svg',role:'img','aria-label':'Espresso compass: every shot by extraction (left to right) and strength (bottom to top), with the target for the beans'},null);var hd=box.querySelector('.coach-h');box.insertBefore(svg,hd?hd.nextSibling:box.firstChild);
      function draw(){
        svg.textContent='';var R0=recipe();
        for(var v=x0;v<=x1;v+=2){mk('line',{x1:x(v),x2:x(v),y1:T,y2:Bc,'class':'cp-g'},svg);var t=mk('text',{x:x(v),y:Bc+15,'text-anchor':'middle','class':'cp-ax'},svg);t.textContent=v+'%'}
        for(var u=y0;u<=y1;u+=1){mk('line',{x1:L,x2:R,y1:y(u),y2:y(u),'class':'cp-g'},svg);var t2=mk('text',{x:L-6,y:y(u)+4,'text-anchor':'end','class':'cp-ax'},svg);t2.textContent=u+'%'}
        var xl=mk('text',{x:(L+R)/2,y:Hc-6,'text-anchor':'middle','class':'cp-k'},svg);xl.textContent='EXTRACTION (EY)';
        var xa=mk('text',{x:L,y:Hc-6,'text-anchor':'start','class':'cp-c'},svg);xa.textContent='← SOUR';
        var xb=mk('text',{x:R,y:Hc-6,'text-anchor':'end','class':'cp-c'},svg);xb.textContent='BITTER →';
        var yl=mk('text',{x:12,y:(T+Bc)/2,'text-anchor':'middle','class':'cp-k',transform:'rotate(-90 12 '+((T+Bc)/2)+')'},svg);yl.textContent='STRENGTH (TDS) →';
        /* lines of equal brew ratio: strength = extraction ÷ ratio */
        [1.5,2,2.5,3].forEach(function(r){var a=Math.max(x0,y0*r),b=Math.min(x1,y1*r);if(a>=b)return;mk('line',{x1:x(a),y1:y(a/r),x2:x(b),y2:y(b/r),'class':'cp-r'},svg);var tl=mk('text',{x:x(b)-2,y:y(b/r)-4,'text-anchor':'end','class':'cp-rt'},svg);tl.textContent='1:'+r});
        mk('rect',{x:x(R0.EY[0]),y:y(R0.TDS[1]),width:x(R0.EY[1])-x(R0.EY[0]),height:y(R0.TDS[0])-y(R0.TDS[1]),rx:4,'class':'cp-t'},svg);
        var tt=mk('text',{x:x(R0.EY[1])-4,y:y(R0.TDS[1])-5,'text-anchor':'end','class':'cp-tt'},svg);tt.textContent=R0.name+' target';
        var shots=SHOT.log.slice(-24);
        shots.forEach(function(r,i){var last=i===shots.length-1;var cx=x(cl(r.EY,x0,x1)),cy=y(cl(r.TDS,y0,y1));
          if(i>0){var p=shots[i-1];if(p.roast===r.roast)mk('line',{x1:x(cl(p.EY,x0,x1)),y1:y(cl(p.TDS,y0,y1)),x2:cx,y2:cy,'class':'cp-path'},svg)}
          var c=mk('circle',{cx:cx,cy:cy,r:last?7:4.5,'class':'cp-dot '+r.roast+(last?' last':'')+' '+r.taste.cls},svg);
          var ti=mk('title',{},c);ti.textContent='Shot '+r.n+', '+r.roast+': EY '+r1(r.EY)+'%, TDS '+r1(r.TDS)+'%, '+r.taste.word;
          if(last){var lt=mk('text',{x:cx+10,y:cy+4,'class':'cp-lt'},svg);lt.textContent='#'+r.n}});
        var list=$('cp-list');
        if(list)list.innerHTML=shots.length?shots.slice().reverse().slice(0,6).map(function(r){return '<li class="'+r.taste.cls+'"><b>#'+r.n+'</b> '+esc(recipe(r.roast).name)+' · '+r1(r.bev)+' g · '+r0(r.secs)+' s · '+r1(r.Tq)+' °C · <span>'+esc(r.taste.word)+'</span></li>'}).join(''):'<li class="na">Your shots land here.</li>';
      }
      return {draw:draw};
    })();

    /* ======================= lessons ======================= */
    var LESSON=(function(){
      var panel=$('lesson'),course=$('course-map'),cur=null,lastCheck=-1;
      var prog=store('school-progress-v1')||{};
      function byId(id){for(var i=0;i<X.lessons.length;i++)if(X.lessons[i].id===id)return X.lessons[i];return null}
      function C(){
        var s=SIM.get(),since=cur?cur.since:0;
        function f(name,fn,from){for(var i=0;i<LOG.length;i++){var e=LOG[i];if(e.n===name&&e.t>=(from==null?since:from)&&(!fn||fn(e.d,e)))return e}return null}
        return {s:s,t:s.t,since:since,K:K,B:B,R:recipe(),ready:E.ready(s),shots:SHOT.log.filter(function(r){return cur&&r.t0>=0}),
          has:function(n,fn){return !!f(n,fn)},ev:f,
          count:function(n,fn,from){var k=0;LOG.forEach(function(e){if(e.n===n&&e.t>=(from==null?since:from)&&(!fn||fn(e.d,e)))k++});return k},
          lastShot:function(fn){for(var i=SHOT.log.length-1;i>=0;i--){var r=SHOT.log[i];if(r.t1>=since&&(!fn||fn(r)))return r}return null},
          refill:st.refill,milk:st.milkPending,heatOffAt:heatOffAt,heatOnAt:heatOnAt,phase:phase(s).k,cnt:CNT,drinks:DRINKS.length,
          flushes:st.flushes,shotNow:SHOT.cur};
      }
      function stepText(st0){return txt(st0.t)}
      function render(){
        if(!panel)return;
        if(!cur){
          panel.innerHTML='<div class="ls-h"><span class="ls-k">Free practice</span><h3>Make whatever you like</h3></div>'+
            '<p class="ls-why">No lesson running: the coach still grades every shot and jug. Pick a lesson above for a guided routine, or start with a warm machine and try a surfing routine from the cards below.</p>'+
            '<div class="ls-act"><a class="btn" href="#course">Pick a lesson</a><button type="button" class="btn" data-lwarm>Warm machine</button></div>';
          var bw=panel.querySelector('[data-lwarm]');if(bw)bw.addEventListener('click',function(){restart('warm')});
          return;
        }
        var L=cur.L,done=cur.done.length,n=L.steps.length;
        var html='<div class="ls-h"><span class="ls-k">Lesson '+(X.lessons.indexOf(L)+1)+' · '+esc(L.track)+'</span><h3>'+esc(txt(L.title))+'</h3>'+
          '<div class="ls-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+n+'" aria-valuenow="'+done+'"><i style="width:'+(done/n*100)+'%"></i></div></div>'+
          '<details class="ls-whyd"'+(done===0?' open':'')+'><summary>Why it matters</summary><p class="ls-why">'+txt(L.why)+'</p></details>'+
          '<ol class="ls-steps">'+L.steps.map(function(st0,i){var stt=i<done?'done':i===done?'now':'todo';return '<li class="'+stt+'"><span class="ls-i" aria-hidden="true">'+(i<done?'✓':i+1)+'</span><span>'+stepText(st0)+(i===done&&cur.hint&&st0.hint?'<em class="ls-hint">'+txt(st0.hint)+'</em>':'')+(i===done&&st0.quiz?quizHtml(st0.quiz):'')+'</span></li>'}).join('')+'</ol>';
        if(cur.result){var r=cur.result;html+='<div class="ls-res '+(r.stars>=2?'good':'mid')+'"><div class="ls-stars" aria-label="'+r.stars+' of 3">'+'★★★'.slice(0,r.stars)+'<span>'+'★★★'.slice(r.stars)+'</span></div><p>'+r.text+'</p></div>'}
        if(!cur.result&&n>1)html+='<button type="button" class="linkbtn ls-allbtn" data-lall aria-expanded="'+(cur.all?'true':'false')+'">'+(cur.all?'Only the current step':'All '+n+' steps')+'</button>';
        html+='<div class="ls-act">'+(cur.result?(nextOf(L)?'<button type="button" class="btn primary" data-lnext>Next: '+esc(txt(nextOf(L).title))+'</button>':'')+'<button type="button" class="btn" data-lagain>Again</button>':'<button type="button" class="btn" data-lhint'+(cur.hint||!L.steps[done]||!L.steps[done].hint?' disabled':'')+'>Hint</button><button type="button" class="btn" data-lagain>Restart</button>')+'<button type="button" class="btn ghost" data-lend>End lesson</button></div>';
        panel.innerHTML=html;panel.classList.toggle('ls-all',!!cur.all);
        function b(sel,fn){var e=panel.querySelector(sel);if(e)e.addEventListener('click',fn)}
        b('[data-lnext]',function(){start(nextOf(L).id,true)});b('[data-lagain]',function(){start(L.id,true)});b('[data-lend]',function(){cur=null;render();renderCourse()});
        b('[data-lhint]',function(){cur.hint=true;render()});
        b('[data-lall]',function(){cur.all=!cur.all;render()});
        Array.prototype.forEach.call(panel.querySelectorAll('[data-qa]'),function(q){q.addEventListener('click',function(){
          var st0=L.steps[cur.done.length];if(!st0||!st0.quiz)return;var k=Number(q.getAttribute('data-qa')),ok=k===st0.quiz.a;
          var fb=panel.querySelector('.qz-fb');if(fb){fb.textContent=ok?txt(st0.quiz.yes||'Right.'):txt(st0.quiz.no||'Not quite. Try again.');fb.className='qz-fb '+(ok?'ok':'no')}
          q.classList.add(ok?'ok':'no');if(ok){cur.quizOk=st0.quiz.id;setTimeout(function(){logEv('quiz-ok',st0.quiz.id)},700)}
        })});
      }
      function quizHtml(qz){return '<span class="qz"><span class="qz-q">'+txt(qz.q)+'</span>'+qz.opts.map(function(o,k){return '<button type="button" class="qz-o" data-qa="'+k+'">'+txt(o)+'</button>'}).join('')+'<span class="qz-fb" aria-live="polite"></span></span>'}
      function nextOf(L){var i=X.lessons.indexOf(L);return X.lessons[i+1]||null}
      function start(id,scroll){
        var L=byId(id);if(!L)return;
        var o=L.start||{};
        if(o.bench){for(var k in o.bench)B[k]=o.bench[k];if(o.bench.roast){var R0=recipe();B.g=o.bench.g||R0.grind;B.yield=Math.round(B.D*R0.ratio[2])}}
        restart(o.state||'warm',{mod:o.mod,mins:o.mins,until:o.until});
        if(o.milk)jugFor(o.milk);
        SIM.speed(o.speed||1);SIM.pause(false);
        if(o.span)B.span=o.span;
        cur={L:L,done:[],since:0,hint:false,result:null,t0:0};
        if(o.tab)tab(o.tab);
        benchSync();render();renderCourse();if(MAP)MAP.draw(true);
        if(scroll){var p=$('practice');if(p)p.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}
      }
      function check(){
        if(!cur||cur.result)return;
        var L=cur.L,moved=false;
        for(var guard=0;guard<L.steps.length;guard++){
          var i=cur.done.length;if(i>=L.steps.length)break;
          var c=C(),ok=false;try{ok=!!L.steps[i].done(c)}catch(e){ok=false}
          if(!ok)break;
          cur.done.push(c.t);cur.since=c.t;cur.hint=false;moved=true;
        }
        if(cur.done.length>=L.steps.length){finish();return}
        if(moved)render();
      }
      function finish(){
        var L=cur.L,c=C(),r=L.score?L.score(c):{stars:3,text:'Done.'};
        r.stars=cl(r.stars||1,1,3);cur.result=r;
        var p=prog[L.id]||{};p.done=true;p.stars=Math.max(p.stars||0,r.stars);p.at=Date.now();prog[L.id]=p;store('school-progress-v1',prog);
        render();renderCourse();
      }
      function renderCourse(){
        if(!course)return;
        var tracks=[];X.lessons.forEach(function(L){if(tracks.indexOf(L.track)<0)tracks.push(L.track)});
        var nDone=X.lessons.filter(function(L){return prog[L.id]&&prog[L.id].done}).length;
        var cnt=$('course-count');if(cnt)cnt.textContent=nDone+' of '+X.lessons.length+' done';
        course.innerHTML=tracks.map(function(tr){
          var ls=X.lessons.filter(function(L){return L.track===tr});
          return '<div class="trk"><h3 class="trk-h">'+esc(tr)+'</h3><div class="trk-row">'+ls.map(function(L){
            var i=X.lessons.indexOf(L)+1,p=prog[L.id],now=cur&&cur.L===L;
            return '<button type="button" class="lcard'+(p&&p.done?' done':'')+(now?' now':'')+'" data-lesson="'+L.id+'">'+
              '<span class="lc-n">'+String(i).padStart(2,'0')+'</span><span class="lc-t">'+esc(txt(L.title))+'</span><span class="lc-s">'+esc(txt(L.sub))+'</span>'+
              '<span class="lc-f"><span class="lc-time">'+esc(L.time||'')+'</span>'+(p&&p.done?'<span class="lc-st" aria-label="'+p.stars+' of 3 stars">'+'★★★'.slice(0,p.stars)+'<i>'+'★★★'.slice(p.stars)+'</i></span>':now?'<span class="lc-on">On now</span>':'')+'</span></button>'}).join('')+'</div></div>'}).join('');
        Array.prototype.forEach.call(course.querySelectorAll('[data-lesson]'),function(b){b.addEventListener('click',function(){start(b.getAttribute('data-lesson'),true)})});
      }
      return {start:start,check:function(){check()},tick:function(t){if(t-lastCheck>=0.5){lastCheck=t;check()}},render:render,renderCourse:renderCourse,cur:function(){return cur},reset:function(){lastCheck=-1}};
    })();
    /* bench tabs: coffee, milk, clean */
    function tab(name){
      qb('[data-btab]').forEach(function(b){var on=b.getAttribute('data-btab')===name;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
      qb('[data-bpanel]').forEach(function(p){p.hidden=p.getAttribute('data-bpanel')!==name});
    }
    qb('[data-btab]').forEach(function(b,i,all){
      b.addEventListener('click',function(){tab(b.getAttribute('data-btab'))});
      b.addEventListener('keydown',function(e){var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!k)return;e.preventDefault();var n=all[(i+k+all.length)%all.length];n.focus();n.click()});
    });
    /* the map's two views: the temperature map and the inside of the machine */
    qb('[data-view]').forEach(function(b){b.addEventListener('click',function(){
      var v=b.getAttribute('data-view');qb('[data-view]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});
      qb('[data-viewp]').forEach(function(p){p.hidden=p.getAttribute('data-viewp')!==v});if(v==='map'&&MAP)MAP.draw(true);
    })});

    /* ======================= the care log: real dates, saved in this browser ======================= */
    (function(){
      var box=$('care-list');if(!box)return;
      var C=store('school-care-v1')||{};C.done=C.done||{};C.water=C.water||X.waterDefault;
      var DAY=864e5;
      function save(){store('school-care-v1',C)}
      function every(t){return typeof t.every==='function'?t.every(C.water):t.every}
      function ago(ms){var d=Math.floor(ms/DAY);return d<=0?'today':d===1?'yesterday':d+' days ago'}
      function render(){
        var now=Date.now(),groups=[];X.care.forEach(function(t){if(groups.indexOf(t.group)<0)groups.push(t.group)});
        var w=$('care-water');if(w)w.value=C.water;
        box.innerHTML=groups.map(function(g){
          return '<div class="cg"><h3 class="cg-h">'+esc(g)+'</h3>'+X.care.filter(function(t){return t.group===g}).map(function(t){
            var last=C.done[t.id],ev=every(t),due=last&&ev?last+ev*DAY:null,left=due?Math.ceil((due-now)/DAY):null;
            var status=!ev?'':!last?'<span class="cs none">Not logged yet</span>':left<0?'<span class="cs over">Overdue by '+(-left)+' day'+(-left===1?'':'s')+'</span>':left===0?'<span class="cs due">Due today</span>':'<span class="cs ok">Next in '+left+' day'+(left===1?'':'s')+'</span>';
            return '<div class="ct" id="care-'+t.id+'"><div class="ct-h"><span class="ct-t">'+esc(t.title)+'</span><span class="ct-src">'+esc(t.src)+'</span></div>'+
              '<p class="ct-every">'+esc(typeof t.when==='function'?t.when(C.water):t.when)+'</p>'+
              '<details class="ct-how"><summary>How</summary><ol>'+t.steps.map(function(x){return '<li>'+txt(x)+'</li>'}).join('')+'</ol>'+(t.lesson?'<p><button type="button" class="linkbtn" data-clesson="'+t.lesson+'">Practise it on the machine above</button></p>':'')+'</details>'+
              (ev?'<div class="ct-f">'+status+(last?'<span class="ct-last">Last done '+ago(now-last)+'</span>':'')+'<button type="button" class="btn sm" data-cdone="'+t.id+'">Done today</button>'+(last?'<button type="button" class="linkbtn" data-cundo="'+t.id+'">Clear</button>':'')+'</div>':'')+'</div>'}).join('')+'</div>'}).join('');
        Array.prototype.forEach.call(box.querySelectorAll('[data-cdone]'),function(b){b.addEventListener('click',function(){C.done[b.getAttribute('data-cdone')]=Date.now();save();render()})});
        Array.prototype.forEach.call(box.querySelectorAll('[data-cundo]'),function(b){b.addEventListener('click',function(){delete C.done[b.getAttribute('data-cundo')];save();render()})});
        Array.prototype.forEach.call(box.querySelectorAll('[data-clesson]'),function(b){b.addEventListener('click',function(){LESSON.start(b.getAttribute('data-clesson'),true)})});
      }
      var w=$('care-water');if(w)w.addEventListener('change',function(){C.water=w.value;save();render()});
      render();
    })();

    /* ======================= drinks: shots set aside, then milk poured into them ======================= */
    var DRINKS=[];
    on('b-aside',function(){
      var s=SIM.get(),c=s.cup;if(c.pos!=='tray'||c.v<5)return;
      var last=SHOT.log[SHOT.log.length-1];
      DRINKS.push({n:last?last.n:0,t:s.t,g:E.grams(s),T:c.T,word:last?last.taste.word:'',score:last?last.taste.score:0,cls:last?last.taste.cls:'mid'});
      c.v=0;c.s=0;c.Ew=0;c.EwT=0;c.cr=0;c.soap=0;c.T=c.Tc;logEv('aside',{n:DRINKS.length});SIM.render();
    });
    on('b-pour',function(){
      var s=SIM.get(),j=s.jug,c=s.cup;if(!j.used||j.T<35)return;
      var cups=DRINKS.slice();
      if(c.pos==='tray'&&c.v>5){var last=SHOT.log[SHOT.log.length-1];cups.push({n:last?last.n:0,t:s.t,g:E.grams(s),T:c.T,word:last?last.taste.word:'',score:last?last.taste.score:0,cls:last?last.taste.cls:'mid',now:true})}
      if(!cups.length)return;
      var D0=X.drinks[B.drink],per=(j.m+j.w)/cups.length,foamPct=j.foam/j.m*100,bigR=j.foam>2?j.big/j.foam:0;
      var L=[],N=[];
      cups.forEach(function(d,i){
        var age=s.t-d.t,coolT=d.T-age*0.08,mixT=(coolT*d.g+j.T*per)/(d.g+per);
        L.push([age<=X.pourWithin,'Cup '+(i+1)+': shot '+(d.n?'#'+d.n+' ('+esc(d.word.toLowerCase())+')':'')+', poured '+(age<2?'straight away':Math.round(age)+' s after it finished')+(age>X.pourWithin?': the crema had faded and it had cooled.':'.')+' About '+Math.round(mixT)+' °C in the cup.']);
      });
      var fOk=foamPct>=D0.foam[0]&&foamPct<=D0.foam[1];
      L.push([fOk,'Milk stretched about '+Math.round(foamPct)+'%: '+(fOk?'right':'not quite right')+' for a '+D0.name.toLowerCase()+'.']);
      L.push([bigR<=0.15,bigR<=0.15?'Silky enough to pour.':'Big bubbles: it pours in lumps.']);
      L.push([j.T>=55&&j.T<=66,'Milk at '+Math.round(j.T)+' °C.']);
      if(cups.some(function(d){return s.t-d.t>X.pourWithin}))N.push(X.twoWorkflow);
      if(!fOk)N.push(D0.name+': '+D0.note+'.');
      var good=L.filter(function(x){return x[0]}).length,score=Math.round(100*good/L.length);
      card('milk '+(score>=80?'good':score>=60?'mid':'bad'),'<div class="ck-h"><span class="ck-tag">Poured</span><h4>'+(cups.length>1?cups.length+' '+esc(D0.plural||D0.name+'s'):esc(D0.name))+'</h4><span class="ck-score">'+score+'</span></div>'+checks(L)+nextList(N));
      logEv('pour',{n:cups.length,score:score,ages:cups.map(function(d){return s.t-d.t})});
      DRINKS=[];if(c.pos==='tray'&&c.v>5){c.v=0;c.s=0;c.Ew=0;c.EwT=0;c.cr=0;c.T=c.Tc}
      SIM.freshJug(j);j.pos='away';SIM.render();
    });
    function drinkSync(s){
      var a=$('b-aside'),ah=$('b-asidehint'),p=$('b-pour'),ph=$('b-pourhint');
      if(a)a.disabled=!(s.cup.pos==='tray'&&s.cup.v>5);
      if(ah)ah.textContent=DRINKS.length?DRINKS.length+' cup'+(DRINKS.length>1?'s':'')+' set aside, waiting for milk.':'';
      var ready=s.jug.used&&s.jug.T>=35&&(DRINKS.length||(s.cup.pos==='tray'&&s.cup.v>5));
      if(p)p.disabled=!ready;
      if(ph)ph.textContent=ready?'Into '+(DRINKS.length+(s.cup.pos==='tray'&&s.cup.v>5?1:0))+' cup'+((DRINKS.length+(s.cup.pos==='tray'&&s.cup.v>5?1:0))>1?'s':'')+'.':'Steam the milk first; it pours into every cup set aside and the one on the scale.';
    }

    /* ======================= the cleaning panel: meters and the descaler ======================= */
    var CM=null;
    function cleanSetup(){
      var box=$('b-descbox');if(!box)return;
      box.innerHTML='<span class="bk">Water and descaler</span><div class="cmeters">'+
        '<div class="cm" id="cm-grime"><span>Coffee oil in the group</span><i><b></b></i></div>'+
        '<div class="cm" id="cm-det"><span>Detergent left in the group</span><i><b></b></i></div>'+
        '<div class="cm" id="cm-scale"><span>Scale in the boiler</span><i><b></b></i></div>'+
        '<div class="cm" id="cm-desc"><span>Descaler in the boiler</span><i><b></b></i></div></div>'+
        '<div class="cbtns"><button type="button" class="btn sm" id="b-descfill">'+esc(X.descaler.fillLabel)+'</button><button type="button" class="btn sm" id="b-rinsefill">Rinse the tank, fill with fresh water</button></div>';
      CM={grime:$('cm-grime'),det:$('cm-det'),scale:$('cm-scale'),desc:$('cm-desc')};
      on('b-descfill',function(){var s=SIM.get();s.drip+=Math.min(s.tank,0);s.tank=0;s.desc=0;s.fillDesc=1;s.fill=X.descaler.ml;st.descRun=true;CNT.rinse=0;logEv('descaler-in');SIM.render()});
      on('b-rinsefill',function(){var s=SIM.get();s.tank=0;s.desc=0;s.fillDesc=0;s.fill=E.TANK;logEv('tank-rinse');SIM.render()});
      on('b-wipe2',function(){var b=$('b-wipe');if(b&&!b.disabled)b.click()});
    }
    function cleanMeters(s){
      if(!CM)return;
      function set(e,v,lab){if(!e)return;var b=e.querySelector('b');b.style.width=Math.round(cl(v,0,1)*100)+'%';e.setAttribute('data-lv',v>0.6?'hi':v>0.25?'mid':'lo');e.title=lab}
      set(CM.grime,s.grime,'Oil');set(CM.det,s.det,'Detergent');set(CM.scale,s.scale,'Scale');set(CM.desc,s.descB,'Descaler');
      var h=$('b-cleanhint');if(h){var p=s.pf,t;
        if(s.descB>0.05||s.desc>0.05)t=s.desc>0.05?'Descaler in the tank. Follow the descaling steps; fresh water and a full rinse come after.':'Descaler still in the boiler: rinse it through the group and the wand with fresh water.';
        else if(p.b==='blind')t=p.in?(s.det>0.05?'Blind basket with detergent: brew on for about 10 s, off for 10 s, five times.':'Blind basket in: brew on for about 10 s, off for 10 s, five times. That is a plain-water backflush.'):(s.det>0.05?'Detergent in the blind basket: lock it in and backflush.':'Blind basket on the counter: lock it in to backflush, or add detergent first.');
        else if(s.det>0.05)t='Detergent still in the group: flush water through it and backflush with plain water before the next coffee.';
        else t='Swap to the blind basket (portafilter out) to backflush.';
        h.textContent=t}
    }

    /* ======================= the reference sections, from the same figures the coach uses ======================= */
    function refs(){
      var si=$('surf-intro');if(si)si.innerHTML=txt(X.intro.surf);
      var rt=$('routines');
      var RT=typeof X.routines==='function'?X.routines():X.routines;
      if(rt)rt.innerHTML=RT.map(function(r){
        return '<article class="rt '+r.roast+'" id="rt-'+r.id+'"><div class="rt-h"><h3>'+esc(r.name)+'</h3><span class="rt-tag">'+esc(r.tag)+'</span></div>'+
          '<p class="rt-why">'+txt(r.why)+'</p><ol>'+r.steps.map(function(x){return '<li>'+txt(x)+'</li>'}).join('')+'</ol>'+
          (r.wave?'<p><b>On the map:</b> '+txt(r.wave)+'</p>':'')+(r.watch?'<p><b>Watch out:</b> '+txt(r.watch)+'</p>':'')+
          '<p class="rt-src">'+txt(r.src)+'</p>'+(r.lesson?'<button type="button" class="btn" data-start-lesson="'+r.lesson+'">Try it on the machine</button>':'')+'</article>'}).join('');
      var tb=$('recipe-table');
      if(tb)tb.innerHTML='<thead><tr><th>Beans</th><th class="num">At the puck</th><th class="num">Dose</th><th class="num">Out</th><th class="num">Time</th><th>Grind</th><th>Aim for</th></tr></thead><tbody>'+
        ['light','medium','dark'].map(function(k){var R0=X.recipes[k];return '<tr><td><span class="rsw"><i class="rd '+k+'"></i>'+esc(R0.name)+'</span></td><td class="num">'+R0.T[0]+' to '+R0.T[1]+' °C</td><td class="num">18 g</td><td class="num">'+r0(18*R0.ratio[0])+' to '+r0(18*R0.ratio[1])+' g<br><small>1:'+R0.ratio[0]+' to 1:'+R0.ratio[1]+'</small></td><td class="num">'+R0.time[0]+' to '+R0.time[1]+' s</td><td>'+esc(R0.grindWord)+'</td><td>'+esc(R0.aim)+'</td></tr>'}).join('')+'</tbody>';
      var dl=$('dial');if(dl)dl.innerHTML=X.dial.map(function(d){return '<div class="dc"><h3>'+esc(d.h)+'</h3>'+(d.p?'<p>'+txt(d.p)+'</p>':'')+(d.ul?'<ul>'+d.ul.map(function(x){return '<li>'+txt(x)+'</li>'}).join('')+'</ul>':'')+'</div>'}).join('');
      var mr=$('milk-ref');if(mr)mr.innerHTML=txt(X.milkRef);
      var cl0=$('care-lede');if(cl0)cl0.innerHTML=txt(X.intro.care);
      var cw=$('care-water');if(cw&&!cw.options.length)cw.innerHTML=X.waters.map(function(w){return '<option value="'+w.v+'">'+esc(w.label)+'</option>'}).join('');
      var so=$('school-sources');if(so)so.innerHTML=txt(X.sources);
      qb('[data-start-lesson]').forEach(function(b){if(b._w)return;b._w=1;b.addEventListener('click',function(){LESSON.start(b.getAttribute('data-start-lesson'),true)})});
    }

    /* ======================= start ======================= */
    refs();cleanSetup();
    if(X.adapt)X.adapt(K);
    tab('coffee');
    restart('cold');
    LESSON.render();LESSON.renderCourse();
    /* for the page's own checks */
    root._school={SIM:SIM,E:E,B:B,H:function(){return H},LOG:function(){return LOG},SHOT:SHOT,MILK:MILK,FC:FC,forecastAt:forecastAt,restart:restart,LESSON:LESSON,taste:taste,
      dose:function(o){o=o||{};var s=SIM.get();s.pf.in=0;s.pf.b='empty';prep={dosed:false,wdt:false,tamp:false};if(o.roast)setRoast(o.roast);if(o.g)B.g=o.g;doDose();if(o.prep!==false){prep.wdt=true;prep.tamp=true;s.pf.prep=1}s.pf.in=1;benchSync()},
      setBench:function(o){for(var k in o)B[k]=o[k];benchSync()},phase:function(){return phase(SIM.get())}};
  })();
