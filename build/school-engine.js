  /* ---------- Barista school: the Silvia's physics ----------
     Forked from the Gaggia site's school-engine.js, with the Silvia's insides from learn-sim.js (Run the machine on
     How the Silvia works). Pure: no page, no drawing. The page (school-sim.js) and the shared school layer (school.js)
     call it, and the forecast runs it on a copy of the state to see what a shot started now would get.
     The heat model is learn-sim.js's: the element sits in the water and heats it directly, with a little going into the
     brass; the brass boiler, where the thermostats are clamped, follows the water; the heavy group under it soaks heat
     slowly. The switching is the stock circuit: the element runs while the steam thermostat and either the brew
     thermostat or the steam switch are closed, and the 165 °C safety hasn't tripped; the orange light shows that call
     for heat; brew runs the pump and the 3-way valve, hot water the pump only; on the E, a 30-minute auto-off that only
     coffee or hot water resets (Rancilio's 2024 manual). Added here, as on the Gaggia site:
       - the puck: dose, grind, roast and prep set its resistance and how fast it gives up its solubles to the water;
       - the milk: where the wand tip sits (high, at the surface, under it) decides air, bubble size and the spin;
       - the wand, the group and the boiler as things to clean: milk on and in the wand, coffee oil in the group,
         detergent left after a backflush, descaler in the tank and the boiler;
       - the scale under the cup, in grams.
     All figures are tuned to the sources listed on the page, not measured here. */
  function SilviaEngine(){
    var TA=21,TT=21,DT=0.05,BREW_OPEN=%%BREW_OPEN%%,BREW_CLOSE=%%BREW_CLOSE%%,STEAM_OPEN=%%STEAM_OPEN%%,STEAM_CLOSE=%%STEAM_CLOSE%%;
    var TANK=2000,TRAY=450;
    function cl(v,a,b){return v<a?a:v>b?b:v}
    function lerp(a,b,t){return a+(b-a)*t}
    function psat(T){return 0.0061121*Math.exp((18.678-T/234.5)*(T/(257.14+T)))}   /* bar absolute (Buck) */
    /* how fast the coffee gives up its solubles: roast, grind (1 fine to 20 coarse) and the water's temperature */
    /* light roasts are denser and less soluble: at the same grind they run faster and give up less, which is why
       recipes grind them finer, run them longer and hotter; dark roasts are the reverse */
    var ROAST={light:{f:0.72,R:0.62},medium:{f:1,R:1},dark:{f:1.2,R:1.4}};
    /* heat figures, tuned (not measured): Cel the element and Cb the brass boiler in J/K; ew element to water, eb element
       to brass, bw brass to water, bg brass to group, ba brass to room (bai with the V5/V6 insulation), ix how well
       cold water coming in picks up heat from the brass, all in W/K; Cg the group's heat capacity, gl its loss to the
       room, pk its contact with the portafilter, pl the portafilter's loss; xg and xp how much heat water running
       through the group and the portafilter trades with them; ms the steam the wand draws per bar.
       Fitted by search against the published measurements, shot temperatures being the water running through the
       soaked puck: Whole Latte Love's V6 (about 99 °C for a shot started as the light goes out; about 93 °C after a 12 s
       flush and a 20 s wait; 142 g of milk to 60 °C in 19 to 25 s), Dan Kehn's Scace (about 94 °C after flushing until
       the flash boiling stops, falling about 2 °C through the shot), erics' thermocouple logs (the element on for about
       45 s, the group idling around 80 °C) and Auber's 25 to 45 minutes for the group to settle. */
    var TUNE={
      silvia:{Cel:70,ew:185,eb:4.06,Cb:936,bw:36.5,bg:3.33,ba:1.2,bai:0.353,ix:17.6,Cg:2340,gl:0.428,pk:3.14,pl:0.326,xg:0.4,xp:0.362,ms:0.217}
    };
    var K={};
    /* p: {ver:'V1'..'V6', model:'M'|'E', volts:120|230}; with none picked, a V6 M */
    function setup(p){
      p=p||{};var v=p.ver||'V6',newer=v==='V5'||v==='V6';
      K.ver=v;K.e=newer&&p.model==='E';K.leds=newer;K.insul=newer;K.thin=v==='V1'||v==='V2';
      /* Rancilio's plates: 950 to 1000 W at 120 V, 1150 W at 230 V; boiler 0.3 l */
      K.P=p.volts===230?1150:950;K.opv=newer?11:12;K.full=300;K.kx=0.66;
      var T=TUNE.silvia;for(var k in T)K[k]=T[k];
      K.brewOpen=BREW_OPEN;K.brewClose=BREW_CLOSE;K.steamOpen=STEAM_OPEN;K.steamClose=STEAM_CLOSE;
      return K;
    }
    function fresh(){
      return {t:0,pwr:0,brew:0,water:0,steam:0,knob:0,Tel:TA,Tb:TA,Tw:TA,Tg:TA,Tpf:TA,vol:K.full,brewC:1,steamC:1,glow:0,heat:false,call:false,pumpOn:false,trip:0,idle:0,
        P:0,tank:TANK,drip:0,puddle:0,air:0,airT:0,prime:0,vent:0,sol:false,fill:0,
        pf:{in:1,b:'empty',wet:0,D:18,g:10,roast:'medium',prep:1,Sr:0,S0:0,E:0,W:0,soak:26,det:0},
        cup:{pos:'warm',v:0,s:0,T:TA,Tc:TA,Ew:0,EwT:0,cr:0,tare:0,soap:0},
        jug:{pos:'away',cap:350,m:150,w:0,T:5,foam:0,used:0,tip:'surf',airC:0,airH:0,spin:0,big:0,spit:0,suck:0},
        wand:{out:0,inn:0,bake:0,warm:0},
        grime:0,det:0,desc:0,descB:0,fillDesc:0,bfc:0,scale:0.25,
        lamp:{pwr:false,heat:false,brew:false,water:false,steam:false},q:{}};
    }
    function clone(s){return JSON.parse(JSON.stringify(s))}
    /* what the group pushes against, in bar per ml/s */
    function rGroup(s){
      var p=s.pf;
      if(!p.in)return 0.12;
      if(p.b==='blind')return 1e6;
      if(p.b==='empty')return 0.25;
      if(p.wet<p.soak)return 0.35;              /* filling the space over the puck and soaking it */
      if(p.b==='spent')return 1.0;
      var R=ROAST[p.roast]||ROAST.medium;
      /* a fresh puck: finer, bigger and better prepped pucks hold back more; it opens up as it extracts */
      return 5*Math.exp(-0.17*(p.g-10))*Math.pow(p.D/18,1.5)*(0.62+0.38*p.prep)*R.R*(1+0.5*(p.S0>0?p.Sr/p.S0:0));
    }
    /* dose a basket: D g at grind g, roast, prep 0..1 (1 = distributed and tamped) */
    function dose(s,D,g,roast,prep){
      var p=s.pf;p.b='dosed';p.D=D;p.g=g;p.roast=roast;p.prep=prep;p.S0=0.30*D;p.Sr=p.S0;p.E=0;p.W=0;p.wet=0;p.soak=8+D;
    }
    function toCup(s,v,dE,T,P,soap){
      var c=s.cup,a=Math.min(v,Math.max(0,90-c.v));s.drip+=v-a;if(a<=0)return;
      var f=a/v;c.T=(c.T*c.v+T*a)/(c.v+a);c.v+=a;c.s+=dE*f;c.soap+=soap*a;
      if(dE>0){c.Ew+=dE*f;c.EwT+=dE*f*T;if(P>6)c.cr+=dE*f}
    }
    /* the orange heating light shows the call for heat (on while the element is asked to run); ready is that light out */
    function ready(s){return !!s.pwr&&!s.lamp.heat&&!s.trip}

    /* ---- one step of machine time ---- */
    function step(s,dt){
      var full=K.full,q={intake:0,pumpout:0,opvret:0,boilout:0,exhaust:0,spout:0,group:0,mS:0,qW:0,c:0,flash:0,pour:0,Tout:s.Tw,fill:0,blind:0};
      s.t+=dt;
      /* the E switches itself off after 30 minutes with no coffee or hot water; steaming doesn't restart the count */
      if(K.e&&s.pwr){if(s.brew||s.water)s.idle=0;else s.idle+=dt;if(s.idle>=1800){s.pwr=0;s.idle=0}}
      var fed=!!s.pwr;
      if(s.Tb>=BREW_OPEN)s.brewC=0;else if(s.Tb<=BREW_CLOSE)s.brewC=1;
      if(s.Tb>=STEAM_OPEN)s.steamC=0;else if(s.Tb<=STEAM_CLOSE)s.steamC=1;
      var call=fed&&!!s.steamC&&(!!s.brewC||!!s.steam),heat=call&&!s.trip,pump=fed&&(!!s.brew||!!s.water),sol=fed&&!!s.brew;
      s.heat=heat;s.call=call;s.pumpOn=pump;
      s.lamp={pwr:fed,heat:call,brew:fed&&!!s.brew,water:fed&&!!s.water,steam:fed&&!!s.steam};
      var pf=s.pf;
      /* the 3-way valve dropping shut vents what's over the puck (or a blind basket's pressure) down to the drip tray */
      if(s.sol&&!sol){
        if(s.P>0.4){var vv=pf.in?(pf.b==='empty'?3:pf.b==='blind'?12:7):2;s.vent+=vv;
          if(pf.in&&pf.b==='blind'){q.blind=1;s.bfc=(s.bfc||0)+1;
            /* each backflush cycle carries oil and detergent out through the valve: more with detergent */
            var clean=s.det>0.05?0.35:0.12;s.grime*=1-clean;s.det*=0.55;if(s.det<0.004)s.det=0}}
        if(pf.in&&pf.b==='dosed'&&pf.wet>8)pf.b='spent';
      }
      s.sol=sol;
      var head=s.vol<full-0.3,Ps=Math.max(0,psat(s.Tw)-1.013),qp=0,qOpv=0,qG=0,qW=0,mS=0,fillIn=0;
      if(pump){
        var wet=s.tank>0.5;
        if(!wet){s.airT+=dt;if(s.airT>2)s.air=1}else s.airT=0;
        var qmax=wet?7.5:0;
        /* air in the pump moves nothing against a puck or a shut valve; pumped out of the open wand it clears */
        if(s.air&&wet){if(s.knob){s.prime+=dt;qmax=3;if(s.prime>4){s.air=0;s.prime=0}}else qmax=0}
        if(head&&qmax>0){
          /* a boiler with a steam pocket fills first: cold water collapses the pocket */
          fillIn=Math.min(qmax*dt,full-s.vol);qp=fillIn/dt;
          s.P=lerp(s.P,Ps,Math.min(1,dt/0.3));
        }else if(qmax>0){
          var gG=sol?1/rGroup(s):0,gW=s.knob?1/0.6:0,lo=0,hi=15;
          for(var i=0;i<22;i++){var mid=(lo+hi)/2;if(qmax*(1-mid/15)-(gG+gW)*mid-Math.max(0,mid-K.opv)/0.04>0)lo=mid;else hi=mid}
          var tau=gG+gW===0?0.35:(sol&&pf.in&&pf.b!=='empty'&&pf.wet>=pf.soak?0.9:0.25);
          s.P+=((lo+hi)/2-s.P)*Math.min(1,dt/tau);
          qp=qmax*(1-s.P/15);qOpv=Math.min(qp,Math.max(0,s.P-K.opv)/0.04);qG=gG*s.P;qW=gW*s.P;
          var room=qp-qOpv;if(qG+qW>room&&qG+qW>0){var f=room/(qG+qW);qG*=f;qW*=f}
        }else s.P=lerp(s.P,0,Math.min(1,dt/0.3));
        var drawn=(qp-qOpv)*dt;
        if(drawn>0&&s.tank>0){
          /* what the pump takes from the tank carries the tank's descaler into the boiler */
          var into=Math.min(drawn,s.tank);s.tank-=into;
          var vb=Math.max(4,s.vol);s.descB+=(s.desc-s.descB)*Math.min(1,into/vb);
        }else s.tank=Math.max(0,s.tank-drawn);
      }else{s.P=lerp(s.P,0,Math.min(1,dt/0.25));s.airT=0}
      q.intake=qp;q.pumpout=qp-qOpv;q.opvret=qOpv;q.fill=fillIn/dt;
      /* the steam valve open with nothing pumped through it: hot water while the boiler is full to the top, then steam */
      if(s.knob&&qW===0&&s.vol>0.5&&s.Tw>100.3){
        if(s.vol>=full*0.97&&!fillIn){qW=Math.min(5,0.2+4*Ps);s.vol-=qW*dt}
        else{mS=K.ms*Ps;var carry=s.vol>full*0.85?0.8*mS:0;qW=carry;s.vol-=(mS+carry)*dt}
        if(s.vol<0)s.vol=0;
      }
      /* through the group and the portafilter: the brass takes heat from hotter water and gives it to cooler */
      var Tout=s.Tw;
      if(qG>0){
        var cq=qG*4.19,d=(Tout-s.Tg)*(1-Math.exp(-K.xg/cq));Tout-=d;s.Tg+=cq*d*dt/K.Cg;
        if(pf.in){var d2=(Tout-s.Tpf)*(1-Math.exp(-K.xp/cq));Tout-=d2;s.Tpf+=cq*d2*dt/260}
        /* water hotter than its boiling point at the group's pressure flashes to steam: the hiss of an unflushed group,
           or of a group right after steaming. Under a puck the pressure holds it liquid. */
        var Pg=pf.in&&pf.b==='dosed'?Math.max(0,s.P)*cl(pf.wet/pf.soak,0,1):0,Tsat=100+28*Math.log((Pg+1.013)/1.013);
        q.flash=Tout>Tsat+0.5?cl((Tout-Tsat)/12,0.2,1):0;q.Tout=Tout;
        /* water through the group rinses detergent and loose oil */
        var rinse=qG*dt;
        if(s.det>0){s.det=Math.max(0,s.det-rinse*0.004);}
        if(pf.in&&pf.b!=='empty'&&pf.wet<pf.soak){pf.wet+=qG*dt}
        else{
          var v=qG*dt,dE=0;
          if(pf.in&&pf.b==='dosed'){
            var R=ROAST[pf.roast]||ROAST.medium;
            /* a channelled puck: some water finds a crack and runs past most of the coffee */
            var eff=0.62+0.38*pf.prep,kW=K.kx*Math.exp(0.035*(Tout-93))*Math.exp(-0.05*(pf.g-10))*R.f/pf.D;
            dE=Math.min(pf.Sr,pf.Sr*(1-Math.exp(-kW*v*eff)));pf.Sr-=dE;pf.E+=dE;pf.W+=v;
          }
          q.c=dE/v;
          if(pf.in)q.spout=qG;else q.group=qG;
          /* each coffee leaves a little oil in the group; water through an empty basket rinses some of it */
          if(dE>0)s.grime=Math.min(1,s.grime+v*0.0005);else if(!pf.in||pf.b==='empty')s.grime=Math.max(0,s.grime-v*0.0015*s.grime);
          var soap=s.det>0.02?s.det:0;
          if(s.cup.pos==='tray')toCup(s,v,dE,Tout,s.P,soap);else s.drip+=v;
        }
      }
      q.boilout=qG;q.qW=qW;q.mS=mS;
      /* out of the wand: into the milk, or into the drip tray */
      var w=s.wand,j=s.jug;
      if(qW>0||mS>0){
        if(j.pos==='wand'){
          if(qW>0){var tot=j.m+j.w;j.T=(j.T*tot+Math.min(s.Tw,99)*qW*dt)/(tot+qW*dt);j.w+=qW*dt;j.used=1}
          if(mS>0){
            j.T+=mS*(2257+4.19*(100-j.T))*dt/((j.m+j.w)*3.9);j.w+=mS*dt;j.used=1;
            /* the tip at the surface draws air in; the milk takes it as fine foam while it's cool, coarser once it's hot;
               too high and it spits big bubbles; under the surface it spins and folds the bubbles in finer */
            var hiss=j.tip==='surf'?1:j.tip==='high'?1.6:0;
            if(hiss>0&&j.foam<j.m*0.9){var a=mS*dt*10*hiss;j.foam+=a;if(j.tip==='high'||j.T>45)j.big+=a*(j.tip==='high'?1:cl((j.T-45)/15,0,1));else j.airC+=a;j.airH=Math.max(j.airH,j.T)}
            if(j.tip==='high')j.spit+=dt;
            if(j.tip==='sub'){j.spin+=dt;j.big=Math.max(0,j.big-mS*dt*6)}
          }
          var over=j.m+j.w+j.foam-j.cap;if(over>0){var lose=Math.min(over,j.foam*0.5+j.w);s.drip+=over;j.foam=Math.max(0,j.foam-over*0.5)}
          if(mS>0||qW>0){w.out=1;w.warm=1}
        }else{
          s.drip+=qW*dt;
          /* steam or water out of the wand into the air clears what's inside it */
          if(mS>0||qW>0){w.inn=Math.max(0,w.inn-dt*0.8);if(w.bake<1)w.out=Math.max(0,w.out-dt*0.05)}
        }
      }else if(j.pos==='wand'&&w.warm&&s.knob===0&&j.used){
        /* the knob shut with the tip still in the milk: the cooling wand pulls a little milk back inside */
        w.inn=Math.min(1,w.inn+dt*0.5);
      }
      /* milk left on a hot wand bakes on */
      if(w.out>0.5&&j.pos!=='wand'){if(s.Tw>110||s.steam)w.bake=Math.min(1,w.bake+dt/90);}
      if(s.vent>0){var vr=Math.min(s.vent,6*dt);s.vent-=vr;s.drip+=vr;q.exhaust=vr/dt}
      /* heat: elements into the body, body into the water, the group and the room; cold water in; steam out */
      /* the elements are cast into the boiler wall: they heat the metal around them, which passes it to the rest of the
         body where the thermostats sit. That's why the body keeps rising for a few seconds after the thermostat opens. */
      /* still water takes heat from the wall slowly (natural convection), so after a draw the boiler water recovers over
         a minute or two; boiling (steam being drawn) and water flowing through move heat far faster */
      /* the element heats the water while it's covered and the brass when it isn't: run dry it overheats and trips
         the safety on the boiler's front */
      var cov=cl((s.vol/full-0.08)/0.12,0,1),Qew=K.ew*cov*(s.Tel-s.Tw),Qeb=K.eb*(s.Tel-s.Tb);
      s.Tel+=((heat?K.P:0)-Qew-Qeb)*dt/K.Cel;
      if(s.Tel>=220)s.trip=1;
      var Cw=Math.max(4,s.vol)*4.19,Qbw=K.bw*cl(s.vol/full,0.25,1)*(s.Tb-s.Tw),Qbg=K.bg*(s.Tb-s.Tg),Qba=(K.insul?K.bai:K.ba)*(s.Tb-TA);
      s.Tb+=(Qeb-Qbw-Qbg-Qba)*dt/K.Cb;
      s.Tw+=(Qew+Qbw)*dt/Cw;
      /* cold water in: it runs along the hot brass on its way in and takes heat from it, then mixes */
      var vin=(pump?(qG+qW)*dt:0)+fillIn;
      if(vin>0){var cin=vin/dt*4.19,Tin=TT+(s.Tb-TT)*(1-Math.exp(-K.ix/cin));s.Tb-=vin*4.19*(Tin-TT)/K.Cb;s.Tw+=(Tin-s.Tw)*Math.min(1,vin/Math.max(4,s.vol+fillIn))}
      if(fillIn)s.vol=Math.min(full,s.vol+fillIn);
      if(mS>0)s.Tw-=mS*2257*dt/Cw;
      if(s.vol<2)s.Tw=lerp(s.Tw,Math.min(s.Tb,100),Math.min(1,dt));
      /* descaler in a hot boiler eats the scale; the solution weakens as it works */
      if(s.descB>0.05&&s.Tw>60&&s.scale>0){var e=0.0011*s.descB*dt;s.scale=Math.max(0,s.scale-e)}
      s.Tg+=(Qbg-K.gl*(s.Tg-TA)-(pf.in?K.pk*(s.Tg-s.Tpf):0))*dt/K.Cg;
      s.Tpf+=((pf.in?K.pk*(s.Tg-s.Tpf):0)-(pf.in?K.pl:0.9)*(s.Tpf-TA))*dt/260;
      var c=s.cup,warmT=TA+(s.Tb-TA)*0.3;
      c.Tc+=((c.pos==='warm'?(warmT-c.Tc)*0.9:(TA-c.Tc)*0.25)+(c.v>0?1.5*(c.T-c.Tc):0))*dt/300;
      if(c.v>0)c.T+=(-1.5*(c.T-c.Tc)-0.25*(c.T-TA))*dt/(c.v*4.19);
      j.T+=(TA-j.T)*0.3*dt/((j.m+j.w)*3.9);
      if(j.pos!=='wand'||!(mS>0)){w.warm=Math.max(0,w.warm-dt/120)}
      if(s.drip>TRAY){s.puddle+=s.drip-TRAY;s.drip=TRAY}
      if(s.fill>0){var a2=Math.min(s.fill,600*dt),nt=s.tank+a2;s.desc=s.desc*s.tank/Math.max(1,nt)+(s.fillDesc||0)*a2/Math.max(1,nt);s.tank=Math.min(TANK,nt);s.fill-=a2;q.pour=1;if(s.tank>=TANK)s.fill=0}
      s.glow+=((heat?1:0)-s.glow)*Math.min(1,dt/1.5);
      s.q=q;
    }
    /* the scale under the cup: what's in the cup, in grams (the solubles weigh too) */
    function grams(s){var c=s.cup;return c.v+c.s}
    return {K:K,TUNE:TUNE,DT:DT,TA:TA,TANK:TANK,TRAY:TRAY,setup:setup,fresh:fresh,clone:clone,step:step,dose:dose,ready:ready,grams:grams,rGroup:rGroup,psat:psat,ROAST:ROAST};
  }
