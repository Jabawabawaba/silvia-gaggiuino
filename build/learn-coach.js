  /* ---------- the coach for "Run the machine" (Silvia) ----------
     Watches the simulator (learn-sim.js hooks: each step of machine time, each control used, start over) and writes
     a report card for every shot and every jug of milk: what went well, what to change next time. When something goes
     wrong it says what happened, what the controls involved do, and the better way, once per kind of slip until you
     start over. The bands come from the model itself: room temperature at the puck if you brew before it has heated,
     about 85 °C after 15 minutes and a wait for the heating light, about 90 °C with a 20-minute warm-up and a flush
     first, over 105 °C straight after steaming. A Silvia has no ready lamp: the heating light going out is the
     signal. Words stay off the machine. */
  (function(){
    var root=$('sim'),box=$('sim-coach');if(!root||!box||!root._sim)return;
    var sim=root._sim,K=sim.K,feed=$('coach-feed'),guide=$('coach-guide');
    function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function r0(x){return Math.round(x)}
    var OUT='the heating light to go out';

    /* ---- what each control does, for the Silvia on show ---- */
    function CTL(){
      return {
        pwr:['Power',K.e?'The push button. Switches the machine on and the boiler starts heating. The E switches itself off 30 minutes after the last coffee or hot water; steaming doesn\'t restart the timer.':'The power rocker. Switches the machine on and the boiler starts heating.'],
        brew:['Brew','Runs the pump and opens the 3-way valve, so water goes through the group and the coffee. Switched off, the valve drops shut and vents the pressure over the puck into the drip tray. It lights while it\'s on.'],
        water:['Hot water','Runs the pump with the 3-way valve shut, so water goes into the boiler and, with the knob open, out of the wand. It\'s how you prime and refill the boiler. It lights while it\'s on.'],
        steam:['Steam','Raises the boiler to steam temperature, about 140 °C. It lights while it\'s on.'],
        lamps:['The heating light',(K.leds?'The orange LED. ':'The orange bar. ')+'On while the boiler heats; when it goes out, the boiler has reached temperature: brew, or steam with steam on. That\'s the Silvia\'s only "ready" signal.'],
        knob:['Steam knob','Opens the steam valve to the wand: steam once the boiler is at steam temperature, hot water with the hot water switch on, and from a full boiler, water first.'],
        safety:['Safety thermostat','The red button on the boiler in the inside view. It cuts the element if it runs dry, and only resets by hand once it has cooled. The heating light stays on while it\'s tripped.'],
        pf:['Portafilter','Tap it to take it out and tap its handle to lock it in. Never force it out while there\'s pressure in the group: here it just won\'t budge, on a real machine it sprays scalding water and grounds. Tap the basket to dose it, or to knock out a spent puck.'],
        cup:['Cup','Tap it to move it between the cup warmer on top and the drip tray under the spouts.'],
        jug:['Milk jug','Tap it to put it under the wand or take it away. The clip-on thermometer shows the milk\'s temperature.'],
        tank:['Tank and drip tray','Tap the tank in the inside view to refill it; tap the drip tray to empty it.'],
        time:['Time','Start over gives a cold machine. The arrows run time at 1x, 5x and 20x, handy for the warm-up.']
      };
    }
    function ctlList(keys){var C=CTL();return '<ul class="ck-ctl">'+keys.map(function(k){return '<li><b>'+e(C[k][0])+'</b>: '+e(C[k][1])+'</li>'}).join('')+'</ul>'}

    /* ---- the best way, and the full control list ---- */
    function renderGuide(){
      var steps=[
        'Fill the tank and switch on. Prime the boiler straight away: open the knob and switch hot water on until water flows from the wand, then both off.',
        'Lock the empty portafilter in, loosely, so it heats with the group, put the cup on the warmer, and wait 15 to 20 minutes (5x or 20x saves the wait). The heating light goes out after a few minutes, but the heavy group takes far longer.',
        'Run about 10 seconds of water through the empty portafilter. The heating light comes on; wait for it to go out again. That\'s temperature surfing.',
        'Take the portafilter out, dose the basket and lock it back in. Cup on the drip tray. Switch brew on for 25 to 30 seconds, about 40 ml in the cup, and switch it off.',
        'Milk: switch steam on and wait for '+OUT+', about 2 minutes. Purge first: open the knob with no jug until the water turns to steam, and close it.',
        'Jug under the wand, open the knob. It foams while the milk is cold; stop at 60 to 65 °C on the thermometer. Close the knob, then take the jug away.',
        'Switch steam off and refill the boiler: open the knob and switch hot water on until water flows from the wand, then both off. Before the next shot, run water through the group until the heating light comes on.',
        'Take the portafilter out, knock the puck out, and empty the drip tray when it fills.'
      ];
      guide.querySelector('.cg-steps').innerHTML=steps.map(function(s){return '<li>'+e(s)+'</li>'}).join('');
      guide.querySelector('.cg-ctl').innerHTML=ctlList(['pwr','brew','water','steam','lamps','knob','safety','pf','cup','jug','tank','time']);
    }

    /* ---- the feed ---- */
    var n={shot:0,milk:0},seen={};
    function card(cls,html){
      var empty=feed.querySelector('.ck-empty');if(empty)empty.remove();
      /* only the newest slip keeps its control notes open; the older ones fold away */
      Array.prototype.forEach.call(feed.querySelectorAll('details.ck-more[open]'),function(d){d.open=false});
      var a=document.createElement('article');a.className='ck '+cls;a.innerHTML=html;
      feed.insertBefore(a,feed.firstChild);
      while(feed.children.length>14)feed.removeChild(feed.lastChild);
      return a;
    }
    function checks(list){return '<ul class="ck-list">'+list.map(function(c){return '<li class="'+(c[0]?'ok':'no')+'"><span class="ck-i" aria-label="'+(c[0]?'Good':'To improve')+'">'+(c[0]?'✓':'✗')+'</span>'+e(c[1])+'</li>'}).join('')+'</ul>'}
    function nextList(list){return list.length?'<div class="ck-next"><span class="k">Next time</span><ul>'+list.map(function(x){return '<li>'+e(x)+'</li>'}).join('')+'</ul></div>':''}
    function slip(kind,title,what,keys,better){
      if(seen[kind])return;seen[kind]=1;
      card('slip','<div class="ck-h"><span class="ck-tag">Slip</span><h4>'+e(title)+'</h4></div><p>'+e(what)+'</p>'+
        '<details class="ck-more" open><summary>What the controls do</summary>'+ctlList(keys)+'</details><p class="ck-best"><b>Better:</b> '+e(better)+'</p>');
    }

    /* ---- watching ---- */
    var B=null,M=null,st={purge:0,idle:0,pwrAt:null,lastPwr:0,acted:false,steamed:false};
    function startShot(s){
      B={t0:s.t,g0:s.Tg,pf0:s.Tpf,tw0:s.Tw,ready:sim.ready(),dosed:!!(s.pf.in&&s.pf.b==='dosed'&&s.pf.wet<1),pfIn:!!s.pf.in,
         tray:s.cup.pos==='tray',cupV0:s.cup.v,tc0:s.cup.Tc,maxP:0,flash:0,dry:false};
      if(!s.pwr){slip('brew-off','Nothing happens with the power off','Brew needs the machine switched on: the pump and valve have no power.',['pwr','brew'],'Switch power on first and give it time to heat.');B=null;return}
      if(B.dosed){
        if(!B.tray)slip('no-cup','The coffee went into the drip tray','The cup was still on the warmer, so the shot ran straight into the tray.',['cup','brew'],'Tap the cup down onto the drip tray before switching brew on. Keeping it on the warmer until then is right: it starts the shot warm.');
        if(B.tw0>112)slip('hot-shot','Brewing straight after steaming','The boiler was still near steam temperature, so the water flashed to steam at the group, which can scald, and the coffee came out burnt.',['steam','brew','lamps'],'After steaming, switch steam off, refill through the wand, then run water through the group until the heating light comes on. Brew once it goes out again.');
        else if(B.tw0<85)slip('early-shot','Brewing before the machine was ready','The boiler hadn\'t reached brew temperature, so the shot ran cool.',['lamps','brew'],'Give it 15 to 20 minutes from cold with the portafilter locked in, then wait for '+OUT+'.');
      }
    }
    function endShot(s){
      var b=B;B=null;if(!b||!b.dosed)return;
      var secs=s.t-b.t0,c=s.cup;if(secs<3)return;
      var v=b.tray?c.v-b.cupV0:0,Tq=c.Ew>0?c.EwT/c.Ew:0,cr=c.cr;n.shot++;
      var verdict,cls,hot=b.tw0>112||b.flash>0.5;
      if(!b.tray){verdict='Into the drip tray';cls='bad'}
      else if(Tq>96.5){verdict='Burnt and bitter';cls='bad'}
      else if(Tq<82){verdict='Sour';cls='bad'}
      else if(Tq<86){verdict='A little sour';cls='mid'}
      else if(v<25){verdict='Short';cls='mid'}
      else if(v>52){verdict='Long and thin';cls='mid'}
      else{verdict='A good shot';cls='good'}
      var L=[],N=[];
      L.push([!hot,hot?'The boiler was too hot: it flashed to steam at the group.':'Boiler at brew temperature, not steam.']);
      if(hot)N.push('After steaming, refill through the wand and run water through the group until the heating light comes on; brew once it goes out.');
      else{
        L.push([b.ready||b.tw0>=98,b.ready?'Started with the heating light out.':b.tw0>=98?'Boiler hot enough, though the heating light was on.':'Started while the heating light was still on from cold.']);
        if(!b.ready&&b.tw0<98)N.push('Wait for '+OUT+' before you brew.');
      }
      L.push([b.g0>=75,'Group at '+r0(b.g0)+' °C'+(b.g0>=75?': well warmed.':b.g0>=55?': still warming.':': cold.')]);
      if(b.g0<75)N.push('Give the Silvia 15 to 20 minutes from cold: its heavy group heats slowly (5x or 20x saves the wait).');
      L.push([b.pf0>=60,'Portafilter at '+r0(b.pf0)+' °C'+(b.pf0>=60?'.':': it takes heat out of the shot.')]);
      if(b.pf0<60)N.push('Keep the portafilter locked in while the machine heats, and run about 10 seconds of water through it before you dose.');
      L.push([b.tray,b.tray?'Cup on the drip tray.':'The cup wasn\'t under the spouts.']);
      if(b.tray)L.push([b.tc0>=38,'Cup at '+r0(b.tc0)+' °C'+(b.tc0>=38?': warmed on top.':': a cold cup cools the shot.')]);
      if(b.tray&&b.tc0<38)N.push('Leave the cup on the warmer while the machine heats.');
      if(Tq>0)L.push([Tq>=86&&Tq<=96.5,'About '+r0(Tq)+' °C at the puck'+(Tq<86?': too cool, so sour.':Tq>96.5?': too hot, so bitter.':': right in the band.')]);
      if(Tq>0&&Tq<86&&b.g0>=75)N.push('Surf the temperature: run about 10 seconds through the group, wait for the heating light to go out, then brew.');
      if(b.tray){
        L.push([v>=25&&v<=52,r0(secs)+' s for '+r0(v)+' ml'+(v<25?(secs<22?': stopped early.':Tq<86?': it ran slow, as a cold puck does.':': it ran slow.'):v>52?': ran long, so thin and bitter.':'.')]);
        if(v<25&&secs<22)N.push('Let it run 25 to 30 seconds, about 40 ml in the cup.');
        if(v>52)N.push('Stop at about 30 seconds.');
      }else N.push('Tap the cup onto the drip tray before brewing.');
      if(b.dry)N.push('Refill the tank before it runs dry.');
      var good=L.filter(function(x){return x[0]}).length;
      card('shot '+cls,'<div class="ck-h"><span class="ck-tag">Shot '+n.shot+'</span><h4>'+e(verdict)+'</h4><span class="ck-score">'+good+' of '+L.length+'</span></div>'+
        '<p class="ck-stats">'+[r0(secs)+' s',b.tray?r0(v)+' ml':null,Tq?r0(Tq)+' °C at the puck':null,r0(b.maxP)+' bar',b.tray&&cr>0.5&&Tq>=86&&Tq<=99?'good crema':null].filter(Boolean).join(' · ')+'</p>'+
        checks(L)+nextList(N));
    }
    function startMilk(s){
      M={t0:s.t,purged:st.purge>=1,spurt:0,maxT:s.jug.T,offOpen:false,early:!(s.steam&&sim.ready())};
      if(M.early)slip('steam-early','Steaming before it was ready','The boiler hadn\'t reached steam temperature, so the steam was weak and wet and the milk took longer to heat.',['steam','lamps','knob'],'After switching steam on, wait for '+OUT+', about 2 minutes, before opening the knob.');
    }
    function endMilk(s){
      var m=M;M=null;if(!m)return;
      var j=s.jug,T=m.maxT,secs=s.t-m.t0;
      if(T<30&&secs<3)return;
      n.milk++;
      var verdict,cls;
      if(T>72){verdict='Scalded';cls='bad'}
      else if(T<50){verdict='Lukewarm';cls='mid'}
      else if(m.spurt>=2){verdict='Watery';cls='mid'}
      else if(T>68){verdict='A bit hot';cls='mid'}
      else{verdict='Silky milk';cls='good'}
      var L=[],N=[];
      L.push([!m.early,m.early?'Started before the heating light went out.':'Waited for '+OUT+'.']);
      if(m.early)N.push('Wait for '+OUT+' after switching steam on.');
      L.push([m.purged&&m.spurt<2,m.purged?'Purged the wand into the drip tray first.':m.spurt>=2?'The wand\'s first water went into the milk ('+r0(m.spurt)+' ml).':'No purge first.']);
      if(!m.purged)N.push('Purge first: open the knob with no jug until the water turns to steam, then close it.');
      L.push([T>=55&&T<=68,'Stopped at '+r0(T)+' °C'+(T<50?': too cool to taste sweet.':T<55?': a touch cool.':T>72?': scalded, it loses its sweetness.':T>68?': a little past the sweet spot.':': the sweet spot.')]);
      if(T<55)N.push('Keep steaming to 60 to 65 °C on the thermometer.');
      if(T>68)N.push('Close the knob at 60 to 65 °C; the milk keeps rising a little after.');
      L.push([!m.offOpen,m.offOpen?'The jug came off with the knob still open: on a real machine that sprays milk.':'Closed the knob before taking the jug away.']);
      if(m.offOpen)N.push('Close the knob, then take the jug away.');
      var now=s.steam?'<p class="ck-now"><b>Now:</b> switch steam off and refill the boiler: knob open, hot water on until water flows from the wand, then both off.</p>':'';
      var good=L.filter(function(x){return x[0]}).length;
      card('milk '+cls,'<div class="ck-h"><span class="ck-tag">Milk '+n.milk+'</span><h4>'+e(verdict)+'</h4><span class="ck-score">'+good+' of '+L.length+'</span></div>'+
        '<p class="ck-stats">'+[r0(secs)+' s of steam',r0(T)+' °C',j.foam>j.m*0.3?'plenty of foam':j.foam>j.m*0.08?'some foam':'little foam'].join(' · ')+'</p>'+
        checks(L)+nextList(N)+now);
      st.purge=0;
    }
    var EMPTY='Make a coffee. The coach grades each shot and each jug of milk, says what to change next time, and explains the controls when something goes wrong.';
    sim.on(function(ev,a,dt){
      var s=sim.get();
      if(ev==='reset'||ev==='setup'){B=null;M=null;st={purge:0,idle:0,pwrAt:null,lastPwr:0,acted:false,steamed:false};if(ev==='reset'){seen={};n={shot:0,milk:0};feed.innerHTML='<p class="ck-empty">'+e(EMPTY)+'</p>'}renderGuide();return}
      if(ev==='blocked'){
        if(a==='f-pf')slip('pf-stuck','Don\'t force the portafilter','There was still pressure in the group. Forced out, a real one sprays scalding water and grounds.',['pf','brew'],'Switch brew off and give it a couple of seconds for the 3-way valve to vent the pressure into the drip tray, then take it out.');
        if(a==='x-safety')slip('reset-hot','The safety won\'t reset yet','The element is still too hot; the button only resets once it has cooled.',['safety','water','knob'],'On a real machine, unplug it before you reach in, wait a few minutes, then press it again. Then plug in, switch on and refill the boiler before it heats: knob open, hot water on until water flows from the wand.');
        return;
      }
      if(ev==='act'){
        st.acted=true;
        if(a==='f-sw-pwr'||a==='f-pb-pwr'){if(s.pwr)st.pwrAt=s.t}
        if(a==='f-sw-brew'&&s.brew)startShot(s);
        if(a==='f-sw-brew'&&!s.brew&&B)endShot(s);
        if(a==='f-jug'&&s.jug.pos!=='wand'&&M){if(s.knob)M.offOpen=true;endMilk(s);if(s.knob)slip('jug-open','The jug came off with the knob open','On a real machine the steam blows milk everywhere as the tip leaves the surface.',['knob','jug'],'Close the knob first, then take the jug away.')}
        if(a==='f-sw-steam'&&s.steam){st.purge=0;st.idle=0;st.steamed=true}
        if(a==='f-sw-steam'&&!s.steam&&M)endMilk(s);
        if(a==='f-sw-water'&&s.water&&!s.knob&&s.pwr&&s.vol>=K.full*0.98)slip('water-shut','Hot water with the knob shut','With the boiler full and the knob closed, the water has nowhere to go: the pump just runs against the over-pressure valve.',['water','knob'],'Open the knob first, then switch hot water on; it comes out of the wand.');
        return;
      }
      if(ev!=='step')return;
      var q=s.q||{};
      /* the knob open for a while with nothing coming out: not the first moments of a prime or refill */
      if(s.knob&&!s.pumpOn&&!s.steam&&s.Tw<100.3&&!(q.qW>0)&&!(q.mS>0)){st.kc=(st.kc||0)+dt;if(st.kc>6)slip('knob-cold','Nothing came out of the wand','The knob only lets out what the boiler has: below boiling there\'s no steam to give.',['steam','knob','lamps','water'],'Switch steam on and wait for '+OUT+'. For hot water, open the knob and switch hot water on.');}else st.kc=0;
      /* the E switching itself off */
      if(st.lastPwr&&!s.pwr&&!st.acted)slip('auto-off','The machine switched itself off','The E\'s energy saver turns it off 30 minutes after the last coffee or hot water. Steaming doesn\'t restart the timer.',['pwr'],'Press the power button again. Rancilio\'s manual says to run brew for a few seconds before you steam, so the timer starts over.');
      st.lastPwr=s.pwr;st.acted=false;
      /* not primed: heating with the boiler short of full */
      if(s.pwr&&!st.steamed&&st.pwrAt!=null&&s.t-st.pwrAt>45&&s.t-st.pwrAt<600&&s.vol<K.full*0.97&&!s.water)slip('prime','The boiler wasn\'t primed','A Silvia often sits short of full; heating it that way risks the element, and the first steam comes out wet.',['water','knob','lamps'],'Right after switching on, open the knob and switch hot water on until water flows from the wand, then both off.');
      if(B){B.maxP=Math.max(B.maxP,s.P);B.flash=Math.max(B.flash,q.flash||0);if(s.air||s.tank<=0.5)B.dry=true;
        if(B.dosed&&s.t-B.t0>55)slip('long-shot','A very long shot','Run well past 30 seconds, the coffee turns thin and bitter as the puck runs out of flavour.',['brew'],'Switch brew off at 25 to 30 seconds, about 40 ml in the cup.')}
      if(s.brew&&!B&&s.pwr)startShot(s);
      if(!s.brew&&B)endShot(s);
      var out=(q.qW||0)+(q.mS||0);
      if(out>0&&s.jug.pos!=='wand'&&s.steam&&!s.water)st.purge+=dt;
      if(out>0&&s.jug.pos==='wand'&&!M&&!s.water)startMilk(s);
      if(M){M.maxT=Math.max(M.maxT,s.jug.T);if(s.jug.pos==='wand'&&(q.qW||0)>0&&!(q.mS>0))M.spurt+=(q.qW||0)*dt;
        if(M.spurt>=2&&!M.purged)slip('no-purge','Water in the milk','The first thing out of the wand from a full boiler is hot water, and it went into the jug.',['knob','steam'],'Purge first: open the knob with no jug until the water turns to steam, close it, then steam the milk.');
        if(s.jug.T>72)slip('milk-hot','The milk is past 70 °C','Above about 70 °C milk loses its sweetness and the foam breaks down.',['knob','jug'],'Close the knob at 60 to 65 °C.');
        if(!s.knob&&s.jug.pos==='wand'&&!s.steam)endMilk(s);
      }
      if(s.steam&&!s.knob&&!M){st.idle+=dt;if(st.idle>240)slip('steam-idle','Steam still on','The boiler sits at steam temperature, too hot for the next shot.',['steam','water','knob'],'When the milk\'s done, switch steam off and refill the boiler: knob open, hot water on until water flows from the wand, then both off.')}else st.idle=0;
      if(s.trip)slip('trip','The safety thermostat tripped','Steaming ran the boiler low and the element overheated, so the safety cut it. The heating light stays on, but nothing heats.',['safety','water','knob'],'Unplug it and let it cool (the button is on the boiler under the top cover; here it\'s in the inside view), press the red button, then plug in, switch on and refill the boiler through the wand. After every steaming: knob open, hot water on until water flows from the wand.');
      if(s.pumpOn&&(s.air||s.tank<=0.5))slip('dry','The tank ran dry','With no water the pump rattles and takes in air, and it won\'t push against the coffee until that air is out.',['tank','knob','water'],'Refill the tank, then prime: open the knob and switch hot water on until water flows from the wand.');
      if(s.puddle>0)slip('tray','The drip tray overflowed','Every flush, vent and purge ends up in the tray.',['tank'],'Tap the drip tray to empty it now and then.');
    });
    feed.innerHTML='<p class="ck-empty">'+e(EMPTY)+'</p>';
    renderGuide();
  })();
