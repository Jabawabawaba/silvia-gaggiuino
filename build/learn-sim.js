  /* ---------- run the machine ----------
     A stock Silvia, switched by hand, with its insides drawn live. Everything shown comes out of a small physical
     model stepped every 50 ms of machine time:
       - the element, sitting in the water; the water; the brass boiler, where the thermostats are clamped;
       - the group bolted under the boiler and the portafilter, warmed by the boiler and by water running through them;
       - the pump against whatever it's pushing into (group, puck, wand), capped by the over-pressure valve;
       - the steam valve, the tank, the drip tray, a cup and a milk jug.
     The switching is the stock circuit, the same as the ladder further down: the element runs while the steam
     thermostat and either the brew thermostat or the steam switch are closed, and the safety thermostat hasn't
     tripped; the heating light shows that call for heat, around the safety; brew runs the pump and the 3-way valve,
     hot water runs the pump only. On the E, a push button and a 30-minute auto-off.
     Figures: thermostats open at %%BREW_OPEN%% and %%STEAM_OPEN%% °C, safety 165 °C; element 950 W at 120 V, 1100 W at 230 V; boiler
     about 0.3 l; OPV about 11 bar (more on older machines); tank about 2 l. Heat-transfer figures are tuned, not
     measured: a few minutes to the light going out, the group a good 15 minutes behind. */
  (function(){
    var root=$('sim');if(!root)return;
    var NS='http://www.w3.org/2000/svg';
    function SMp(){var m=window.SilviaMachine;return (m&&m.get())||{}}
    function mk(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
    function cl(v,a,b){return v<a?a:v>b?b:v}
    function lerp(a,b,t){return a+(b-a)*t}
    function mix(a,b,t){t=cl(t,0,1);return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]}
    function rgb(c){return 'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')'}
    function sa(e,k,v){v=String(v);var key='_'+k;if(e[key]!==v){e[key]=v;e.setAttribute(k,v)}}
    function ss(e,k,v){v=String(v);var key='__'+k;if(e[key]!==v){e[key]=v;e.style[k]=v}}
    function tog(e,c,on){if(e&&e.classList.contains(c)!==!!on)e.classList.toggle(c,!!on)}
    function psat(T){return 0.0061121*Math.exp((18.678-T/234.5)*(T/(257.14+T)))}   /* bar absolute (Buck) */
    var TA=21,TT=21,DT=0.05,TANK=2000,TRAY=450,BREW_OPEN=%%BREW_OPEN%%,BREW_CLOSE=%%BREW_CLOSE%%,STEAM_OPEN=%%STEAM_OPEN%%,STEAM_CLOSE=%%STEAM_CLOSE%%;

    /* ---- the Silvia you picked; with none picked, a V6 M ---- */
    var K={},S=null;
    function setup(){
      var p=SMp(),v=p.ver||'V6',newer=v==='V5'||v==='V6';
      K.e=newer&&p.model==='E';K.leds=newer;K.insul=newer;K.thin=v==='V1'||v==='V2';K.v1=v==='V1';
      K.P=p.volts===230?1100:950;K.opv=newer?11:12;K.full=300;K.Cb=600;
      tog(root,'emodel',K.e);tog(root,'leds',K.leds);tog(root,'insul',K.insul);tog(root,'thin',K.thin);tog(root,'v1',K.v1);
      tog($('f-sw-pwr'),'lit-rk',!K.leds);
    }
    function fresh(){
      /* the boiler starts short of full, as it often is after a day off: priming it is the first job */
      return {t:0,pwr:0,brew:0,water:0,steam:0,knob:0,Tb:TA,Tw:TA,Tg:TA,Tpf:TA,Tel:TA,vol:K.full*0.8,brewC:1,steamC:1,glow:0,heat:false,call:false,pumpOn:false,
        P:0,tank:TANK,drip:0,puddle:0,air:0,airT:0,prime:0,vent:0,sol:false,fill:0,trip:0,idle:0,
        pf:{in:1,b:'empty',wet:0,Sr:0,S0:3.1,E:0},
        cup:{pos:'warm',v:0,s:0,T:TA,Tc:TA,Ew:0,EwT:0,cr:0},
        jug:{pos:'away',m:150,w:0,T:5,foam:0,used:0},
        lamp:{pwr:false,heat:false,brew:false,water:false,steam:false},q:{}};
    }
    function rGroup(){
      var p=S.pf;
      if(!p.in)return 0.12;
      if(p.b==='empty')return 0.25;
      if(p.wet<22)return 0.35;
      if(p.b==='spent')return 1.0;
      return 5+2.5*(p.Sr/p.S0);
    }
    function toCup(v,dE,T,P){
      var c=S.cup,a=Math.min(v,Math.max(0,80-c.v));S.drip+=v-a;if(a<=0)return;
      var f=a/v;c.T=(c.T*c.v+T*a)/(c.v+a);c.v+=a;c.s+=dE*f;
      if(dE>0){c.Ew+=dE*f;c.EwT+=dE*f*T;if(P>6)c.cr+=dE*f}
    }

    /* ---- one step of machine time ---- */
    function step(dt){
      var s=S,full=K.full,q={intake:0,pumpout:0,opvret:0,boilout:0,exhaust:0,spout:0,group:0,mS:0,qW:0,c:0,flash:0,pour:0,Tout:s.Tw,fill:0};
      s.t+=dt;
      /* the E's energy saver switches it off after 30 minutes with no switch touched */
      if(K.e&&s.pwr){s.idle+=dt;if(s.idle>=1800){s.pwr=0;s.idle=0}}
      var fed=!!s.pwr;
      if(s.Tb>=BREW_OPEN)s.brewC=0;else if(s.Tb<=BREW_CLOSE)s.brewC=1;
      if(s.Tb>=STEAM_OPEN)s.steamC=0;else if(s.Tb<=STEAM_CLOSE)s.steamC=1;
      var call=fed&&!!s.steamC&&(!!s.brewC||!!s.steam),heat=call&&!s.trip,pump=fed&&(!!s.brew||!!s.water),sol=fed&&!!s.brew;
      s.heat=heat;s.call=call;s.pumpOn=pump;
      s.lamp={pwr:fed,heat:call,brew:fed&&!!s.brew,water:fed&&!!s.water,steam:fed&&!!s.steam};
      if(s.sol&&!sol){
        if(s.P>0.4)s.vent+=s.pf.in?(s.pf.b==='empty'?3:7):2;
        if(s.pf.in&&s.pf.b==='dosed'&&s.pf.wet>8)s.pf.b='spent';
      }
      s.sol=sol;
      var head=s.vol<full-0.5,Ps=Math.max(0,psat(s.Tw)-1.013),qp=0,qOpv=0,qG=0,qW=0,mS=0,fillIn=0;
      if(pump){
        var wet=s.tank>0.5;
        if(!wet){s.airT+=dt;if(s.airT>2)s.air=1}else s.airT=0;
        var qmax=wet?7.5:0;
        if(s.air&&wet){if(s.knob){s.prime+=dt;qmax=3;if(s.prime>4){s.air=0;s.prime=0}}else qmax=0}
        if(head&&qmax>0){
          fillIn=Math.min(qmax*dt,full-s.vol);qp=fillIn/dt;
          s.P=lerp(s.P,Ps,Math.min(1,dt/0.3));
        }else if(qmax>0){
          var gG=sol?1/rGroup():0,gW=s.knob?1/0.6:0,lo=0,hi=15;
          for(var i=0;i<22;i++){var mid=(lo+hi)/2;if(qmax*(1-mid/15)-(gG+gW)*mid-Math.max(0,mid-K.opv)/0.04>0)lo=mid;else hi=mid}
          var tau=gG+gW===0?0.35:(sol&&s.pf.in&&s.pf.b!=='empty'&&s.pf.wet>=22?0.9:0.25);
          s.P+=((lo+hi)/2-s.P)*Math.min(1,dt/tau);
          qp=qmax*(1-s.P/15);qOpv=Math.min(qp,Math.max(0,s.P-K.opv)/0.04);qG=gG*s.P;qW=gW*s.P;
          var room=qp-qOpv;if(qG+qW>room&&qG+qW>0){var f=room/(qG+qW);qG*=f;qW*=f}
        }else s.P=lerp(s.P,0,Math.min(1,dt/0.3));
        s.tank=Math.max(0,s.tank-(qp-qOpv)*dt);
      }else{s.P=lerp(s.P,0,Math.min(1,dt/0.25));s.airT=0}
      q.intake=qp;q.pumpout=qp-qOpv;q.opvret=qOpv;q.fill=fillIn/dt;
      /* the steam valve open with nothing pumped through it: hot water while the boiler is full to the top, then steam */
      if(s.knob&&qW===0&&s.vol>0.5&&s.Tw>100.3){
        if(s.vol>=full*0.97&&!fillIn){qW=Math.min(5,0.2+4*Ps);s.vol-=qW*dt}
        else{mS=0.4*Ps;var carry=s.vol>full*0.85?0.8*mS:0;qW=carry;s.vol-=(mS+carry)*dt}
        if(s.vol<0)s.vol=0;
      }
      var Tout=s.Tw;
      if(qG>0){
        var cq=qG*4.19,d=(Tout-s.Tg)*(1-Math.exp(-2/cq));Tout-=d;s.Tg+=cq*d*dt/1600;
        if(s.pf.in){var d2=(Tout-s.Tpf)*(1-Math.exp(-1.2/cq));Tout-=d2;s.Tpf+=cq*d2*dt/260}
        q.flash=Tout>100.5?cl((Tout-100)/12,0.2,1):0;q.Tout=Tout;
        if(s.pf.in&&s.pf.b!=='empty'&&s.pf.wet<22){s.pf.wet+=qG*dt}
        else{
          var v=qG*dt,dE=0;
          if(s.pf.in&&s.pf.b==='dosed'){
            var kT=cl((Tout-68)/24,0.15,1.6);dE=Math.min(s.pf.Sr,0.11*kT*s.pf.Sr*dt);s.pf.Sr-=dE;s.pf.E+=dE;
          }
          q.c=dE/v;
          if(s.pf.in)q.spout=qG;else q.group=qG;
          if(s.cup.pos==='tray')toCup(v,dE,Tout,s.P);else s.drip+=v;
        }
      }
      q.boilout=qG;q.qW=qW;q.mS=mS;
      if(qW>0||mS>0){
        var j=s.jug;
        if(j.pos==='wand'){
          if(qW>0){var tot=j.m+j.w;j.T=(j.T*tot+Math.min(s.Tw,99)*qW*dt)/(tot+qW*dt);j.w+=qW*dt;j.used=1}
          if(mS>0){j.T=Math.min(99,j.T+mS*(2257+4.19*Math.max(0,100-j.T))*dt/((j.m+j.w)*3.9));j.w+=mS*dt;if(j.T<38)j.foam=Math.min(j.m*0.55,j.foam+mS*dt*14);j.used=1}
          var over=j.m+j.w+j.foam*0.35-330;if(over>0){var lose=Math.min(over,j.w);j.w-=lose;s.drip+=over}
        }else s.drip+=qW*dt;
      }
      if(s.vent>0){var vr=Math.min(s.vent,6*dt);s.vent-=vr;s.drip+=vr;q.exhaust=vr/dt}
      /* heat: the element into the water while it's covered, into the brass when it isn't; the brass, where the
         thermostats sit, follows the water; the group under it soaks heat slowly; cold water in; steam out */
      var cov=cl((s.vol/full-0.08)/0.12,0,1),Qew=110*cov*(s.Tel-s.Tw),Qeb=6*(s.Tel-s.Tb);
      s.Tel+=((heat?K.P:0)-Qew-Qeb)*dt/60;
      if(s.Tel>=220)s.trip=1;    /* the safety on the boiler's front feels an element running dry */
      var Cw=Math.max(4,s.vol)*4.19,Qbw=70*cl(s.vol/full,0.25,1)*(s.Tb-s.Tw),Qbg=4.5*(s.Tb-s.Tg),Qba=(K.insul?0.5:1.2)*(s.Tb-TA);
      s.Tb+=(Qeb-Qbw-Qbg-Qba)*dt/K.Cb;
      s.Tw+=(Qew+Qbw)*dt/Cw;
      var vin=(pump?(qG+qW)*dt:0)+fillIn;
      if(vin>0){var cin=vin/dt*4.19,Tin=TT+(s.Tb-TT)*(1-Math.exp(-10/cin));s.Tb-=vin*4.19*(Tin-TT)/K.Cb;s.Tw+=(Tin-s.Tw)*Math.min(1,vin/Math.max(4,s.vol+fillIn))}
      if(fillIn)s.vol=Math.min(full,s.vol+fillIn);
      if(mS>0)s.Tw-=mS*2257*dt/Cw;
      if(s.vol<2)s.Tw=lerp(s.Tw,Math.min(s.Tb,100),Math.min(1,dt));
      s.Tg+=(Qbg-0.5*(s.Tg-TA)-(s.pf.in?2.5*(s.Tg-s.Tpf):0))*dt/1600;
      s.Tpf+=((s.pf.in?2.5*(s.Tg-s.Tpf):0)-(s.pf.in?0.4:0.9)*(s.Tpf-TA))*dt/260;
      var c=s.cup,warmT=TA+(s.Tb-TA)*0.3;
      c.Tc+=((c.pos==='warm'?(warmT-c.Tc)*0.9:(TA-c.Tc)*0.25)+(c.v>0?1.5*(c.T-c.Tc):0))*dt/300;
      if(c.v>0)c.T+=(-1.5*(c.T-c.Tc)-0.25*(c.T-TA))*dt/(c.v*4.19);
      var jj=s.jug;jj.T+=(TA-jj.T)*0.3*dt/((jj.m+jj.w)*3.9);
      if(s.drip>TRAY){s.puddle+=s.drip-TRAY;s.drip=TRAY}
      if(s.fill>0){var a=Math.min(s.fill,600*dt);s.tank=Math.min(TANK,s.tank+a);s.fill-=a;q.pour=1;if(s.tank>=TANK)s.fill=0}
      s.glow+=((heat?1:0)-s.glow)*Math.min(1,dt/1.5);
      s.q=q;
    }

    /* ---- drawing ---- */
    var E={};
    ['f-sw-pwr','f-pb-pwr','f-sw-brew','f-sw-water','f-sw-steam','f-lp-bar','f-lp-pwr','f-lp-heat','f-knob','f-knobp','f-pf','f-pfout','f-pfgr','f-pfbasket','f-tray',
     'f-cup','f-cupvap','f-jug','f-thn','f-gs1','f-gs2','f-gs3','f-ss1','f-ss2','f-ws','f-trayw','f-puddle','f-hhr','f-hmin','f-hsec','f-puffs',
     'x-tank','x-tankw','x-tanks','x-lid','x-pour','x-pumpv','x-piston','x-pcoil','x-opvplug','x-bwater','x-bsurf','x-bhead','x-bub','x-elem','x-glow',
     'x-tbb','x-tsb','x-safety','x-gheat','x-vcoil','x-vpl','x-vsin','x-vsex','x-vcav','x-rain','x-pf','x-pfw','x-puck','x-cup','x-cupl','x-crema','x-cupvap',
     'x-tray','x-trayw','x-knobp','x-jug','x-milk','x-foam','x-mbub','x-thn','x-pipes','x-flows','x-parts'].forEach(function(id){E[id]=$(id)});
    var xwd=root.querySelector('.simx .xwd');
    var PIPES={
      intake:'M600,330 V369 H580',
      pumpout:'M466,369 H423 V326',
      boilin:'M410,313 H388 V150 H301',
      opvret:'M423,284 V48 H540 V74',
      boilout:'M296,226 V306 H334 V298',
      togroup:'M306,266 H230 V289',
      exhaust:'M334,198 V186 H372 V401',
      steam:'M184,71 V56 H107',
      wand:'M89,74 V250 L60,300 V334'
    };
    var P={};
    Object.keys(PIPES).forEach(function(k){
      P[k]={w:mk('path',{d:PIPES[k],'class':'xp-w'},E['x-pipes']),b:mk('path',{d:PIPES[k],'class':'xp-b'},E['x-pipes']),f:mk('path',{d:PIPES[k],'class':'xf'},E['x-flows'])};
    });
    var XS={spout:mk('path',{d:'M230,334 V352','class':'xf'},E['x-flows']),wtip:mk('path',{d:'M60,334 V398','class':'xf'},E['x-flows'])};
    var rain=Array.prototype.slice.call(E['x-rain'].querySelectorAll('line'));
    function Pool(parent,n,cls){this.a=[];for(var i=0;i<n;i++)this.a.push({e:mk('circle',{r:0,cx:-40,cy:-40,'class':cls},parent),on:false});this.acc=0}
    Pool.prototype.spawn=function(x,y,vx,vy,r0,r1,L,o){for(var i=0;i<this.a.length;i++){var p=this.a[i];if(!p.on){p.on=true;p.l=0;p.L=L;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.r0=r0;p.r1=r1;p.o=o==null?1:o;return}}};
    Pool.prototype.emit=function(rate,dt,fn){this.acc+=rate*dt;var n=0;while(this.acc>=1&&n<8){this.acc-=1;fn(this);n++}if(this.acc>3)this.acc=0};
    Pool.prototype.tick=function(dt,ymin){for(var i=0;i<this.a.length;i++){var p=this.a[i];if(!p.on)continue;p.l+=dt;
      if(p.l>=p.L||(ymin!=null&&p.y<ymin)){p.on=false;sa(p.e,'r',0);continue}
      p.x+=p.vx*dt;p.y+=p.vy*dt;var t=p.l/p.L;sa(p.e,'cx',p.x.toFixed(1));sa(p.e,'cy',p.y.toFixed(1));sa(p.e,'r',lerp(p.r0,p.r1,t).toFixed(1));sa(p.e,'opacity',(p.o*(1-t*t)).toFixed(2))}};
    Pool.prototype.clear=function(){this.a.forEach(function(p){p.on=false;sa(p.e,'r',0)})};
    var fPuff=new Pool(E['f-puffs'],26,'puff'),xPuff=new Pool(E['x-parts'],26,'puff'),bub=new Pool(E['x-bub'],26,'bub'),mbub=new Pool(E['x-mbub'],10,'bub');

    var WATER=[150,200,236],GOOD=[80,45,22],SOUR=[156,110,54],BITTER=[40,29,24];
    function waterCol(T){return T<60?mix([108,174,230],[142,190,228],(T-20)/40):T<90?mix([142,190,228],[206,196,184],(T-60)/30):T<102?mix([206,196,184],[234,172,132],(T-90)/12):mix([234,172,132],[240,128,78],(T-102)/30)}
    function coffeeCol(T,c){var base=T<90?mix(GOOD,SOUR,(90-T)/7):mix(GOOD,BITTER,(T-96)/5);return mix(WATER,base,0.25+0.75*cl(c/0.07,0,1))}
    function boreCol(kind,T,Pb){
      if(kind==='air')return 'rgba(196,203,209,.5)';
      if(kind==='steam')return 'rgb(238,242,246)';
      var c=waterCol(T);if(Pb>0.3)c=mix(c,[36,92,170],cl(Pb/12,0,1)*0.75);return rgb(c);
    }
    function flow(el,rate,dtv,col){
      var on=rate>0.03;ss(el,'opacity',on?1:0);if(!on)return;
      if(col)ss(el,'stroke',col);
      if(!RM){el.o=(el.o||0)-dtv*(14+11*Math.min(rate,8));sa(el,'stroke-dashoffset',el.o.toFixed(1))}
    }
    function pipe(k,kind,T,Pb,rate,dtv){
      var p=P[k];ss(p.b,'stroke',boreCol(kind,T,Pb));
      flow(p.f,rate,dtv,kind==='steam'?'#8E9AA5':'rgba(255,255,255,.92)');
    }
    function lampSet(e,lit,name){if(!e)return;if(e.classList.contains('on')!==!!lit){tog(e,'on',lit);sa(e,'aria-label',name+(lit?', on':', off'))}}

    function render(dtr){
      var s=S,q=s.q||{},j=s.jug,c=s.cup,pf=s.pf,dtv=RM?0:Math.min(dtr,0.1)*(0.7+0.3*Math.sqrt(speed));
      /* front: switches and their lights, power, heating light, knob */
      ['brew','water','steam'].forEach(function(k){var e=E['f-sw-'+k];tog(e,'on',s[k]);sa(e,'aria-pressed',s[k]?'true':'false');tog(e,'lit',s.lamp[k])});
      tog(E['f-sw-pwr'],'on',s.pwr);sa(E['f-sw-pwr'],'aria-pressed',s.pwr?'true':'false');tog(E['f-sw-pwr'],'lit',!K.leds&&s.lamp.pwr);
      sa(E['f-pb-pwr'],'aria-pressed',s.pwr?'true':'false');
      lampSet(E['f-lp-bar'],s.lamp.heat,'Heating light');lampSet(E['f-lp-heat'],s.lamp.heat,'Heating light');lampSet(E['f-lp-pwr'],s.lamp.pwr,'Power light');
      ss(E['f-knobp'],'transform',s.knob?'rotate(-110deg)':'rotate(0deg)');ss(E['x-knobp'],'transform',s.knob?'rotate(-110deg)':'rotate(0deg)');
      sa(E['f-knob'],'aria-pressed',s.knob?'true':'false');
      ss(E['f-pf'],'display',pf.in?'':'none');ss(E['f-pfout'],'display',pf.in?'none':'');
      ss(E['f-pfgr'],'display',pf.b==='empty'?'none':'');tog(E['f-pfbasket'],'spent',pf.b==='spent');
      sa(E['f-cup'],'transform',c.pos==='tray'?'translate(280 391)':'translate(168 27) scale(.8)');
      sa(E['f-jug'],'transform',j.pos==='wand'?'translate(384 391)':'translate(494 448)');
      var thA=-130+cl(j.T,0,100)*2.6;
      sa(E['f-thn'],'transform','rotate('+thA.toFixed(1)+' 10 -96)');sa(E['x-thn'],'transform','rotate('+thA.toFixed(1)+' 36 312)');
      var cupHot=c.v>3?cl((c.T-48)/30,0,1):0;ss(E['f-cupvap'],'opacity',cupHot.toFixed(2));ss(E['x-cupvap'],'opacity',cupHot.toFixed(2));
      var endY=c.pos==='tray'?351:388,gw=q.group||0,sw=q.spout||0;
      ['f-gs1','f-gs2','f-gs3'].forEach(function(id,i){var e=E[id];sa(e,'d','M'+(264+16*i)+',251 V'+endY);sa(e,'stroke-width',(1.4+gw*0.34).toFixed(2));flow(e,gw,dtv)});
      var scol=pf.b==='empty'||!q.c?'#7FBDEB':rgb(coffeeCol(q.Tout||93,q.c));
      ['f-ss1','f-ss2'].forEach(function(id,i){var e=E[id];sa(e,'d','M'+(272+16*i)+',286 V'+endY);sa(e,'stroke-width',(1.6+sw*0.7).toFixed(2));flow(e,sw,dtv,scol)});
      var wOut=j.pos==='wand'?0:(q.qW||0);sa(E['f-ws'],'stroke-width',(1.6+wOut*0.5).toFixed(2));flow(E['f-ws'],wOut,dtv);
      /* nudges, no words: an empty tank, a full drip tray, a spent puck, a tripped safety */
      tog(E['x-tank'],'need',s.tank<150&&s.fill<=0);tog(E['f-tray'],'need',s.drip>TRAY-45||s.puddle>0);tog(E['x-tray'],'need',s.drip>TRAY-45||s.puddle>0);
      tog(E['f-pfbasket'],'need',!pf.in&&pf.b==='spent');tog(E['x-safety'],'need',!!s.trip);tog(E['x-safety'],'tripped',!!s.trip);
      ss(E['f-trayw'],'opacity',cl((s.drip-TRAY*0.65)/(TRAY*0.35),0,0.75).toFixed(2));
      sa(E['f-puddle'],'rx',Math.min(120,s.puddle*0.6).toFixed(1));sa(E['f-puddle'],'ry',Math.min(6,s.puddle*0.04).toFixed(1));
      var tt=27720+s.t;
      sa(E['f-hsec'],'transform','rotate('+((tt%60)*6).toFixed(1)+')');sa(E['f-hmin'],'transform','rotate('+((tt/60%60)*6).toFixed(1)+')');sa(E['f-hhr'],'transform','rotate('+((tt/3600%12)*30).toFixed(1)+')');

      /* inside: tank */
      var th=s.tank/TANK*234,ty=330-th;sa(E['x-tankw'],'y',ty.toFixed(1));sa(E['x-tankw'],'height',th.toFixed(1));sa(E['x-tanks'],'d','M500,'+ty.toFixed(1)+' H628');
      ss(E['x-lid'],'transform',s.fill>0?'rotate(-18deg)':'rotate(0deg)');ss(E['x-pour'],'opacity',q.pour?1:0);
      if(q.pour&&!RM){E['x-pour'].o=(E['x-pour'].o||0)-dtv*60;sa(E['x-pour'],'stroke-dashoffset',E['x-pour'].o.toFixed(1))}
      var dry=s.pumpOn&&(s.tank<=0.5||s.air);
      if(s.pumpOn&&!RM){var amp=dry?1.8:0.9;sa(E['x-pumpv'],'transform','translate('+((Math.random()-0.5)*amp).toFixed(2)+' '+((Math.random()-0.5)*amp*2).toFixed(2)+')');sa(E['x-piston'],'transform','translate('+(Math.random()<0.5?-5:3)+' 0)')}
      else{sa(E['x-pumpv'],'transform','');sa(E['x-piston'],'transform','')}
      tog(E['x-pcoil'],'on',s.pumpOn);
      var lift=cl((s.P-K.opv+0.4)*8,0,5);sa(E['x-opvplug'],'transform','translate(0 '+(-lift).toFixed(1)+')');
      /* boiler: level, temperature, the steam pocket, bubbles off the element; the element glowing */
      var f=cl(s.vol/K.full,0,1),wh=f*134,wy=216-wh;
      sa(E['x-bwater'],'y',wy.toFixed(1));sa(E['x-bwater'],'height',wh.toFixed(1));ss(E['x-bwater'],'fill',rgb(waterCol(s.Tw)));
      sa(E['x-bsurf'],'d','M172,'+wy.toFixed(1)+' H288');ss(E['x-bsurf'],'opacity',f<0.995?1:0);
      ss(E['x-bhead'],'opacity',s.Tw>100?1:0.55);
      var hot=cl((s.Tel-s.Tw-2)/10,0,1)*s.glow,red=cl((s.Tel-160)/60,0,1);
      ss(E['x-elem'],'stroke',rgb(mix(mix([110,90,62],[255,138,42],Math.max(hot,red)),[255,60,30],red)));
      ss(E['x-elem'],'filter',hot>0.25||red>0?'drop-shadow(0 0 '+(3+Math.max(hot,red)*4).toFixed(1)+'px #FF8A2A)':'none');
      sa(E['x-glow'],'opacity',(Math.max(hot*0.4,red*0.75)).toFixed(2));
      sa(E['x-tbb'],'transform',s.brewC?'':'rotate(-30 -7 -9)');sa(E['x-tsb'],'transform',s.steamC?'':'rotate(-30 -7 -9)');
      if(!RM){
        var boil=(s.heat&&s.Tw>92?4+cl((s.Tw-92)/8,0,1)*8:0)+(q.mS>0?30*q.mS:0)+(q.fill>0&&s.Tw>100?8:0);
        if(f>0.05)bub.emit(boil,dtr,function(p){p.spawn(190+Math.random()*100,206,0,-(26+Math.random()*24),1.2,2.6,4)});
        bub.tick(dtr,wy+2);
      }
      sa(E['x-gheat'],'opacity',cl((s.Tg-25)/150,0,0.42).toFixed(2));
      tog(E['x-vcoil'],'on',s.sol);tog(xwd,'on',s.sol);ss(E['x-vpl'],'transform',s.sol?'translateY(-20px)':'translateY(0px)');
      ss(E['x-vsin'],'opacity',s.sol?0:1);ss(E['x-vsex'],'opacity',s.sol?1:0);
      ss(E['x-vcav'],'fill',boreCol('water',s.Tw,s.sol?s.P:0));
      var rainOn=(q.group||0)+(q.spout||0)+(s.sol&&pf.in&&pf.b!=='empty'&&pf.wet<22?1:0);
      var rEnd=pf.in?298:(c.pos==='tray'?352:400);
      rain.forEach(function(l){sa(l,'y2',rEnd);ss(l,'opacity',rainOn>0.05?0.9:0);if(rainOn>0.05&&!RM){l.o=(l.o||0)-dtv*40;sa(l,'stroke-dashoffset',l.o.toFixed(1))}});
      ss(E['x-pf'],'display',pf.in?'':'none');
      var ph=pf.b==='empty'?0:(pf.b==='spent'?8:10);sa(E['x-puck'],'y',(316-ph).toFixed(1));sa(E['x-puck'],'height',ph);
      ss(E['x-puck'],'fill',pf.b==='spent'?'#2E1D12':rgb(mix([96,62,36],[52,32,18],cl(pf.wet/22,0,1))));
      var pw=pf.in&&pf.b!=='empty'&&(s.sol||s.vent>0)?(pf.wet<22?cl(pf.wet/22,0,1)*10:10):(pf.in&&pf.b==='empty'&&(q.spout||0)>0?20:0);
      sa(E['x-pfw'],'y',(316-ph-Math.min(pw,20-ph)).toFixed(1));sa(E['x-pfw'],'height',Math.min(pw,20-ph).toFixed(1));ss(E['x-pfw'],'opacity',pw>0?0.6:0);
      ss(E['x-cup'],'display',c.pos==='tray'?'':'none');
      var ch=c.v/80*40,cy=394-ch,Tq=c.Ew>0?c.EwT/c.Ew:93,conc=c.v>0?c.s/c.v:0;
      sa(E['x-cupl'],'y',cy.toFixed(1));sa(E['x-cupl'],'height',(ch+4).toFixed(1));ss(E['x-cupl'],'fill',conc>0.002?rgb(coffeeCol(Tq,conc)):rgb(WATER));
      var crq=Tq>=86&&Tq<=99?1:0.4,crh=c.v>2?cl(c.cr/1.3,0,1)*5*crq:0;
      sa(E['x-crema'],'y',cy.toFixed(1));sa(E['x-crema'],'height',crh.toFixed(1));
      ss(E['x-crema'],'fill',rgb(Tq<89?[214,182,124]:Tq>97?[118,74,42]:[196,138,80]));
      var sEnd=c.pos==='tray'?Math.max(354,cy):400;
      sa(XS.spout,'d','M230,334 V'+sEnd.toFixed(1));sa(XS.spout,'stroke-width',(1.5+sw*0.6).toFixed(2));flow(XS.spout,sw,dtv,scol);
      var dh=s.drip/TRAY*16;sa(E['x-trayw'],'y',(422-dh).toFixed(1));sa(E['x-trayw'],'height',dh.toFixed(1));
      ss(E['x-jug'],'display',j.pos==='wand'?'':'none');
      var mh=(j.m+j.w)/330*69,fh=j.foam/330*69,my=399-mh;
      sa(E['x-milk'],'y',my.toFixed(1));sa(E['x-milk'],'height',(mh+2).toFixed(1));sa(E['x-foam'],'y',(my-fh).toFixed(1));sa(E['x-foam'],'height',fh.toFixed(1));
      ss(E['x-milk'],'fill',rgb(mix(mix([244,240,230],[176,196,210],cl((j.w/(j.m+j.w)-0.08)*3,0,0.7)),[226,204,160],cl((j.T-72)/14,0,1))));
      var wEnd=j.pos==='wand'?my-fh:400;
      sa(XS.wtip,'d','M60,334 V'+Math.max(336,wEnd).toFixed(1));sa(XS.wtip,'stroke-width',(2+(q.qW||0)*0.4).toFixed(2));flow(XS.wtip,j.pos==='wand'?0:(q.qW||0),dtv,'#5FA8E0');
      /* pipes */
      pipe('intake',s.tank>0.5?'water':'air',TT,0,q.intake||0,dtv);
      pipe('pumpout',dry&&!s.air?'air':'water',TT,s.pumpOn?s.P:0,q.pumpout||0,dtv);
      pipe('boilin','water',TT,s.pumpOn?s.P:0,q.pumpout||0,dtv);
      pipe('opvret','water',TT,0,q.opvret||0,dtv);
      pipe('boilout','water',s.Tw,s.sol?s.P:0,q.boilout||0,dtv);
      pipe('togroup',s.sol||(q.group||q.spout)?'water':'air',q.Tout||s.Tw,s.sol?s.P:0,q.boilout||0,dtv);
      pipe('exhaust',q.exhaust>0?'water':'air',s.Tw,0,q.exhaust||0,dtv);
      var stK=q.mS>0?'steam':(q.qW>0||s.vol>=K.full*0.97?'water':(s.Tw>100?'steam':'air'));
      pipe('steam',stK,s.Tw,0,(q.qW||0)+(q.mS||0)*3,dtv);
      pipe('wand',q.mS>0?'steam':(q.qW>0?'water':'air'),s.Tw,0,(q.qW||0)+(q.mS||0)*3,dtv);
      if(!RM){
        if(q.mS>0){
          var rate=8+q.mS*40;
          if(j.pos==='wand'){fPuff.emit(rate*0.4,dtr,function(p){p.spawn(372+Math.random()*24,318,(Math.random()-0.5)*14,-(14+Math.random()*12),2,7,1.4,0.8)});
            xPuff.emit(rate*0.4,dtr,function(p){p.spawn(46+Math.random()*28,my-fh-2,(Math.random()-0.5)*12,-(12+Math.random()*10),2,7,1.4,0.8)});
            mbub.emit(rate,dtr,function(p){p.spawn(52+Math.random()*18,Math.min(392,my+14+Math.random()*20),(Math.random()-0.5)*10,-(26+Math.random()*16),1,2.4,0.8)})}
          else{fPuff.emit(rate,dtr,function(p){p.spawn(386,336,(Math.random()-0.5)*46,34+Math.random()*30,3,14,1.5,0.95)});
            xPuff.emit(rate,dtr,function(p){p.spawn(60,338,(Math.random()-0.5)*40,26+Math.random()*30,2,10,1.3,0.9)})}
        }
        if(q.flash>0){fPuff.emit(q.flash*30,dtr,function(p){p.spawn(256+Math.random()*48,pf.in?286:252,(Math.random()-0.5)*30,10+Math.random()*16,2,8,1,0.85)});
          xPuff.emit(q.flash*30,dtr,function(p){p.spawn(180+Math.random()*100,pf.in?334:296,(Math.random()-0.5)*30,10+Math.random()*14,2,8,1,0.85)})}
        if(j.pos==='wand'&&j.T>78&&q.mS>0)mbub.emit(20,dtr,function(p){p.spawn(34+Math.random()*56,my+4,(Math.random()-0.5)*6,-12,2,4,0.6)});
        fPuff.tick(dtr);xPuff.tick(dtr);mbub.tick(dtr,my-fh);
      }
    }

    /* ---- time ---- */
    var speed=1,acc=0,last=0,raf=0,vis=false;
    function frame(ms){
      raf=0;if(!vis)return;
      var dtr=last?Math.min(0.1,(ms-last)/1000):0;last=ms;acc+=dtr*speed;
      var n=0;while(acc>=DT&&n<800){step(DT);acc-=DT;n++}if(n>=800)acc=0;
      render(dtr);raf=requestAnimationFrame(frame);
    }
    function wake(){if(vis&&!raf){last=0;raf=requestAnimationFrame(frame)}}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)wake();else last=0}).observe(root);else{vis=true;wake()}

    /* ---- hands on ---- */
    function act(id,fn){var e=$(id);if(!e)return;
      e.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();fn(e);root.classList.remove('fresh');render(0)});
      e.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn(e);root.classList.remove('fresh');render(0)}});
    }
    function wiggle(e){e.classList.remove('wiggle');void e.getBoundingClientRect();e.classList.add('wiggle')}
    ['brew','water','steam'].forEach(function(k){act('f-sw-'+k,function(){S[k]=S[k]?0:1;S.idle=0})});
    act('f-sw-pwr',function(){S.pwr=S.pwr?0:1;S.idle=0});
    act('f-pb-pwr',function(e){S.pwr=S.pwr?0:1;S.idle=0;e.classList.add('on');setTimeout(function(){e.classList.remove('on')},180)});
    act('f-knob',function(){S.knob=S.knob?0:1;S.idle=0});
    act('f-pf',function(e){if(S.sol||S.P>0.5||S.vent>0){wiggle(e);return}S.pf.in=0;if(S.pf.b==='dosed'&&S.pf.wet>8)S.pf.b='spent'});
    act('f-pfhandle',function(){S.pf.in=1});
    act('f-pfbasket',function(){var p=S.pf;if(p.b==='spent'||p.b==='dosed'){p.b='empty';p.Sr=0}else{p.b='dosed';p.Sr=p.S0;p.E=0}p.wet=0});
    act('f-cup',function(){var c=S.cup;if(c.pos==='tray')c.pos='warm';else{c.pos='tray';if(c.v>0){c.v=0;c.s=0;c.Ew=0;c.EwT=0;c.cr=0;c.T=c.Tc}}});
    act('f-jug',function(){var j=S.jug;if(j.pos==='wand')j.pos='away';else{if(j.used){j.m=150;j.w=0;j.T=5;j.foam=0;j.used=0}j.pos='wand'}});
    ['f-tray','x-tray'].forEach(function(id){act(id,function(){S.drip=0;S.puddle=0})});
    act('x-tank',function(){if(S.tank<TANK-10)S.fill=TANK-S.tank});
    /* the safety resets by hand, and only once it has cooled */
    act('x-safety',function(e){if(!S.trip)return;if(S.Tel>150){wiggle(e);return}S.trip=0});
    act('sim-reset',function(){S=fresh();acc=0;[fPuff,xPuff,bub,mbub].forEach(function(p){p.clear()});root.classList.add('fresh')});
    qa('[data-speed]',root).forEach(function(b){b.addEventListener('click',function(){speed=Number(b.getAttribute('data-speed'));qa('[data-speed]',root).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})})});
    window.addEventListener('silvia-machine',function(){setup();render(0)});
    setup();S=fresh();root.classList.add('fresh');render(0);
    root._sim={get:function(){return S},step:function(n){for(var i=0;i<n;i++)step(DT);render(0)},K:K};
  })();
