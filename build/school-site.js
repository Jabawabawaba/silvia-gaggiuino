  /* ---------- Barista school: the Silvia's words, recipes, routines, lessons and care ----------
     Everything school.js needs that's particular to the Silvia: what the heating light means, the surfing routines that
     go with it, the lessons, Rancilio's own steaming, refilling and cleaning steps, and the sources for each.
     Sources: Rancilio's Silvia manuals (2010, 2012, 2018, 2024) and wiring diagrams; Whole Latte Love's Silvia review;
     Dan Kehn's Scace measurements and erics' thermocouple logs on home-barista; Auber's PID manual; Clive, Seattle
     Coffee Gear and KaffeeWiki; Barista Hustle, La Marzocco Home and others for the recipes, milk and water. The page's
     Sources section lists them with links. */
  var SCHOOL=(function(){
    var K=SIM.K,E=SIM.E;
    function lampName(){return 'the heating light'}
    function Lamp(){return 'The heating light'}
    function newer(){return K.leds}
    function mname(){var p=prof();return 'Rancilio Silvia '+(p.ver||'V6')+(newer()?' '+(p.model||'M'):'')}
    /* after steaming: the boiler refilled with the hot water switch, then a cupful through the group */
    var CUP=120;
    /* the surfing figures the routines and lessons use, from this page's simulation (see the routine cards) */
    /* at 230 V the element heats faster, so the bottom-of-the-wave flush for dark beans runs a little longer */
    function SURF(){var hv=prof().volts===230;return {wllFlush:12,wllWait:20,darkFlush:hv?8:5}}
    var X={
      key:'silvia',
      /* the light the routines go by: the orange heating light, on while the element is asked to heat */
      indicator:function(s){return !!s.lamp.heat},
      lampKey:'HEATING LIGHT',
      lampShort:function(on){return 'heating light'+(on?' on':' off')},
      /* the sentences the coach builds around the heating light */
      phrase:function(k){return {lamp:'the heating light',steamWaited:'Waited for the heating light to go out with steam on.',steamEarly:'Started before the heating light went out with steam on.',
          steamWait:'After switching steam on, wait for the heating light to go out.',back:'The heating light is out again: ready for the next shot.'}[k]},
      readyNow:function(s){return E.ready(s)},
      heatingWords:'element on, heating light on',
      idleWords:'Element off, coasting',
      cue:{heatOn:'the heating light came on',heatOff:'the heating light went out'},
      /* heat-soaked: the heavy group settles around 80 °C idle (erics' logs); a portafilter out for a minute or two
         while you dose and surf loses a good few degrees */
      warm:{group:76,pf:50},
      /* the practice bench's warm machine: on for 40 minutes, so the heavy group has settled */
      warmMins:40,
      warmAdvice:'Give it 25 minutes or more from cold with the empty portafilter locked in (use 20× here), then run 120 to 180 ml through the empty portafilter before the first shot. The Silvia\'s heavy group is slow: Auber\'s Scace measurements put it at 25 to 45 minutes to settle.',
      stretchMax:38,
      pourWithin:360,
      twoWorkflow:'Pull both shots and switch steam on straight after the second: the Silvia takes a couple of minutes to reach steam temperature. Then steam once for both and pour straight away. The crema fades within a minute or so, but the shots taste fine for several minutes.',
      waterDefault:'filtered',
      waters:[{v:'filtered',label:'Soft or filtered, about 89 ppm'},{v:'tap',label:'Hard tap water'}],
      milk:{1:{m:150,cap:350},2:{m:280,cap:600}},
      drinks:{
        flat:{name:'Flat white',plural:'flat whites',foam:[8,25],note:'a thin layer of microfoam, about 5 mm in the cup'},
        latte:{name:'Latte',plural:'lattes',foam:[18,35],note:'about 1 cm of silky foam'},
        capp:{name:'Cappuccino',plural:'cappuccinos',foam:[40,70],note:'a glossy cap of at least 1 cm'}
      },
      recipes:{
        light:{name:'Light',T:[93,96],ratio:[2.2,3,2.5],time:[27,35],EY:[20,23.5],TDS:[7,10.5],grind:7,grindWord:'Finer',aim:'Sweet and bright, not sour'},
        medium:{name:'Medium',T:[91,94],ratio:[1.8,2.3,2],time:[25,31],EY:[18.5,22],TDS:[8,11.5],grind:10,grindWord:'Middle',aim:'Sweet and balanced'},
        dark:{name:'Dark',T:[88,91],ratio:[1.5,2,1.8],time:[22,28],EY:[17,20.5],TDS:[9,12.5],grind:12,grindWord:'Coarser',aim:'Rich and sweet, not ashy'}
      },
      descaler:{fillLabel:'Empty the tank, add a mild citric acid mix (8 to 12 g per litre), top up',ml:2000},
      controls:function(){
        return {
          pwr:['Power',newer()?'The left switch'+(K.e?' (a push button on the E)':'')+'. Switches the machine on; the green light shows power.':'The left switch. It lights while the machine is on.'],
          brew:['Coffee','Runs the pump and opens the 3-way valve, so water goes through the group. Switched off, the valve drops shut and vents the pressure over the puck into the drip tray.'],
          water:['Hot water','Runs the pump only. With the steam knob open it sends water out of the wand; Rancilio uses it to refill the boiler after steaming.'],
          steam:['Steam','Lets the boiler heat up to steam temperature, the 140 °C thermostat. The coffee switch still works with steam on, and a shot then runs far too hot.'],
          lamps:['The heating light','The orange light is on while the element is asked to heat and goes out when it stops: at brew temperature, or at steam temperature with steam on. Rancilio says to brew, steam or draw water only once it has gone out.'],
          knob:['Steam knob','On the side. Opens the steam valve to the wand. With steam ready it gives steam; from a full boiler the first second or two is water.'],
          pf:['Portafilter','Tap it to take it out and tap its handle to lock it in. Never force it out while there\'s pressure in the group. Tap the basket to knock out a spent puck.'],
          cup:['Cup and scale','Tap the cup to move it between the warmer on top and the scale on the drip tray.'],
          jug:['Milk jug','Tap it to put it under the wand or take it away; the Milk tab sets how deep the tip sits.'],
          tank:['Tank and drip tray','Tap the tank in the inside view to refill it; tap the drip tray to empty it.']
        };
      },
      refill:{
        short:'Switch steam off, then refill the boiler as Rancilio says: hot water switch on, open the knob slowly, close it as soon as water comes out of the wand, switch off. Then run a cupful through the group with the portafilter out to bring the group back down.',
        now:'Then switch steam off and refill the boiler with the hot water switch (knob open until water comes out of the wand), and run a cupful through the group: steaming used some of the boiler\'s water, and the group is still too hot.'
      },
      knobColdBetter:'Switch steam on and wait for the heating light to go out. For hot water, Rancilio says: purge 2 s, hot water switch on, open the knob slowly, close it, switch off.',
      primeBetter:'Refill the tank, then prime: open the knob and switch hot water on until water flows from the wand, then switch off and close the knob.'
    };
    /* where on the wave the shot started, in the light's terms */
    X.surfNote=function(c,res,R0){
      var w;
      if(c.afterSteam!=null&&c.afterSteam<300&&c.tw0>108)w='Started soon after steaming, with the boiler still above brew temperature.';
      else if(c.flushBefore&&c.flushBefore.t1>c.t0-60)w='Started '+Math.round(c.t0-c.flushBefore.t1)+' s after a '+Math.round(c.flushBefore.secs)+' s flush'+(c.heat?', with the element heating':'')+'.';
      else if(c.heat)w='Started while the element was heating (heating light on'+(c.sinceHeat!=null?', '+Math.round(c.sinceHeat)+' s in':'')+').';
      else if(c.sinceOn!=null)w='Started '+Math.round(c.sinceOn)+' s after the heating light went out'+(c.sinceOn<20?': near the top of the wave, with the water still very hot.':c.sinceOn<120?': coasting down from the peak.':': low on the wave.');
      else w='Started '+(c.ready?'with the heating light out':'before the heating light first went out')+'.';
      if(c.idleFor!=null&&c.idleFor>150&&!(c.flushBefore&&c.flushBefore.t1>c.t0-60))w+=' Nothing had been drawn for '+Math.round(c.idleFor/60)+' min, so the first water out was the hottest.';
      if(c.fc&&c.fc.Tq)w+=' The forecast said '+(Math.round(c.fc.Tq*10)/10).toFixed(1)+' °C.';
      return w;
    };
    X.tempAdvice=function(dir,roast){
      if(dir==='cool')return roast==='light'?'For a hotter shot: when the heating light goes out, flush only until the hissing stops and brew straight away (about 94 °C on a Scace).':'For a hotter shot: start sooner after the flush, or flush only until the hissing stops and brew straight away.';
      return roast==='dark'?'For a cooler shot: brew at the bottom of the wave: wait for the heating light to come on, flush about '+SURF().darkFlush+' s and brew at once.':'For a cooler shot: when the heating light goes out, flush about 12 s and wait about 20 s before brewing (Whole Latte Love\'s routine, about 93 °C).';
    };
    X.onShotStart=function(s,c,slip){
      if(s.steam&&c.dosed)slip('brew-steam','Brew with steam on','With steam on, the boiler heads for 140 °C, and the coffee switch still runs a shot: it comes out scalding.',['brew','steam','lamps'],'Switch steam off before brewing, refill the boiler with the hot water switch and run a cupful through the group first.');
    };
    X.onBlocked=function(what,slip){
      if(what==='safety')slip('safety-hot','Let it cool first','The safety thermostat only resets once the boiler has cooled. On a real Silvia it sits under the cover: unplug it, let it cool completely, and have it reset as Rancilio says (the 2024 manual says to call support).',[],'Never bypass the safety thermostat: it trips because the element ran dry or overheated.');
    };
    X.adapt=function(){
      var pl=$('bs-plate');if(pl)pl.textContent=mname();
      var nm=$('bs-name');if(nm){var p=prof();nm.textContent=p.ver?'Running as your '+mname()+(p.volts?', '+p.volts+' V':'')+'.':'Drawn as a 120 V Silvia V6 M; pick your version in Your Silvia and the machine, its lights and its timings follow.'}
      var mn=$('bs-mname');if(mn){var p2=prof();mn.textContent=mname().replace(/^Rancilio /,'')+(p2.volts?', '+p2.volts+' V':', 120 V')}
    };

    /* ---------- the surfing routines ---------- */
    X.intro={
      surf:function(){return '<p><b>The light first.</b> The orange heating light is on while the element heats and goes out when it stops. Rancilio\'s manuals say to wait for it to go out before brewing, steaming or drawing hot water. The brew thermostat on the boiler opens at 100 °C, but the element sits in the water and keeps heating it for a moment after: the water overshoots well past 100 °C. A thermocouple log on home-barista showed the boiler water swinging from about 91 °C to over 120 °C on an older Silvia.</p>'+
        '<p><b>So the first water is far too hot.</b> Whole Latte Love measured about 99 °C at the puck for a shot started as the light went out, with no flush. Their routine, a 12 s flush then a 20 s wait, gave ten shots between 91.4 and 95.6 °C, about 93 °C on average. A Scace on an older Silvia peaked at about 94.4 °C two seconds after flushing until the flash boiling stopped, then fell about 2 °C through the shot. That is the lever: flush to throw away the overheated water, and where in the cycle you brew sets the temperature. The bottom of the wave, just as the light comes back on, is the coolest point.</p>'+
        '<p><b>The Silvia swings wide.</b> Its brass group is heavy and slow, and the cycle is long: minutes, not seconds. A routine that starts from the same point in the cycle each time, the light going out, gives the same shot each time.</p>'+
        '<p class="fine">The simulation is tuned to those published measurements, not measured on your machine. Use it to learn the pattern, then let your own cups decide.</p>'}
    };
    X.routines=function(){
      var S0=SURF();
      return [
      {id:'wll',roast:'medium',name:'Light out, flush, wait',tag:'Medium, everyday',lesson:'medium',
        why:'The measured Silvia routine: it throws away the overheated water and lets the group settle before the shot.',
        steps:['Warm up 25 minutes or more with the empty portafilter locked in.','Dose and tamp while you wait for the heating light to go out.','When it goes out, take the portafilter out and flush '+S0.wllFlush+' s.','Wait about '+S0.wllWait+' s, lock in and start the shot.','For the next shot, wait for the light to go out again and repeat.'],
        wave:'The flush drags the boiler down off its overshoot and brings the element on; the wait lets the hot group even out the water.',
        src:'Whole Latte Love\'s Silvia V6 review: ten shots at 91.4 to 95.6 °C, about 93 °C on average.'},
      {id:'bottom',roast:'dark',name:'Bottom of the wave',tag:'Dark',lesson:'dark',
        why:'Dark roasts give up their flavour easily and turn ashy in hot water. The coolest water the Silvia gives is at the bottom of its cycle, just as the heating light comes back on.',
        steps:['Dose and tamp first.','Wait for the heating light to come on: the boiler has coasted down to the brew thermostat\'s cut-in.','Flush about '+S0.darkFlush+' s straight away, to clear the water that sat in the group.','Lock in and brew at once; stop around 1:1.8. If it is still harsh, grind a step coarser.'],
        wave:'With the light just on, the boiler is at the bottom of the wave and the element is only starting to heat.',
        src:'The direction is from Seattle Coffee Gear (darker roasts want less time after the light comes on); the timing is this page\'s estimate from the simulation, about 90 °C, so taste and adjust.'},
      {id:'hiss',roast:'light',name:'Flush to the hiss, go',tag:'Light',lesson:'light',
        why:'Light roasts want the most heat the Silvia gives without flashing: the water just after the overheated part has gone.',
        steps:['Dose and tamp first.','When the heating light goes out, take the portafilter out and flush until the hissing and spitting stop: only a few seconds.','Lock in and start the shot at once.','Stop around 1:2.5, and grind finer than for darker beans.'],
        wave:'You brew on the hottest water that no longer flashes: the shot starts near the top and falls a little.',
        watch:'Don\'t skip the flush: a shot started as the light goes out runs about 99 °C and tastes burnt.',
        src:'Dan Kehn\'s Scace measurements on home-barista (about 94.4 °C, falling about 2 °C through the shot); Whole Latte Love for the 99 °C unflushed shot.'},
      {id:'aftersteam',roast:'any',name:'After steaming',tag:'Any coffee',lesson:'refill',
        why:'Steaming takes the boiler to about 140 °C and uses up some of its water. The pump doesn\'t run in steam mode, so nothing refills it until you do.',
        steps:['Switch steam off.','Refill the boiler: hot water switch on, open the knob slowly, close it as soon as water comes out of the wand, switch off.','Take the portafilter out and run a cupful (120 to 150 ml) through the group: the group stays too hot after steaming.','Then surf as usual: wait for the heating light to go out, flush, wait, brew.'],
        wave:'The refill drops the boiler from steam temperature; the cupful through the group brings the group back down.',
        src:'Rancilio\'s 2012, 2018 and 2024 manuals for the refill; erics on home-barista for the group flush.'}
      ];
    };

    /* ---------- the dial-in cards ---------- */
    X.dial=[
      {h:'Sour, thin, short finish',ul:['Under-extracted: the water didn\'t take enough out.','Grind finer first, one step at a time, keeping the yield the same.','Then try a longer ratio (stop a few grams later).','Then surf hotter: a shorter wait after the flush.']},
      {h:'Bitter, dry, ashy or hollow',ul:['Over-extracted, or too hot for the roast.','Grind a step coarser, or stop a few grams sooner.','Then surf cooler: never brew as the light goes out without a flush, and for dark beans brew at the bottom of the wave.']},
      {h:'Sour and bitter at once, inconsistent',ul:['Channeling: water found a path through the puck.','Fix the puck, not the recipe: break up clumps (a needle tool), level it, tamp level and firm.','Don\'t knock the portafilter after tamping.']},
      {h:'One change at a time',ul:['Weigh the dose to 0.1 g and keep it fixed.','Grind is the main control; ratio next; temperature last.','On a stock machine, temperature means the surf: where in the cycle you brew, and how you flush.','Expect three or four shots to dial in a new bag.']},
      {h:'Baskets',p:'The recipes here are for 18 g. Rancilio\'s double basket takes about 14 to 16 g: use what fits and keep the same ratio. The Silvia\'s 58 mm group takes most commercial baskets.'}
    ];

    /* ---------- milk ---------- */
    X.milkRef=function(){return '<div class="mr-steps"><h3>Step by step</h3><ol>'+
      '<li>Switch steam on and wait for the heating light to go out (Rancilio\'s 2024 manual): about 45 to 60 s on a warm machine.</li>'+
      '<li>Purge for 2 s into the drip tray, then close the knob.</li>'+
      '<li>Cold milk, about 5 °C, in a jug no more than half full: about 150 ml in a 350 ml jug for one drink, 250 to 300 ml in a 600 ml jug for two.</li>'+
      '<li>Tip just under the surface, angled toward the jug\'s wall so the single-hole tip sets up a whirlpool. Open the knob fully. A gentle tearing hiss means it\'s drawing air in: stop adding air early, by about 37 °C.</li>'+
      '<li>Then raise the jug a little so the tip sits under the surface and the milk spins. That folds the bubbles in fine.</li>'+
      '<li>Close the knob at about 60 °C (55 to 65): the thermometer lags 2 to 3 °C and the milk keeps rising. Never past 70.</li>'+
      '<li>Jug away, switch steam off, purge the wand for 2 s and wipe it straight away (Rancilio).</li>'+
      '<li>Tap, swirl until it looks like wet paint, and pour at once.</li>'+
      '<li>Refill the boiler with the hot water switch before the next shot.</li></ol>'+
      '<p class="fine">The Silvia\'s 0.3 l boiler gives strong steam: Whole Latte Love heated 142 g of milk to 60 °C in 19 to 25 s on a V6. Rancilio\'s 2010 manual says never to steam for more than 4 to 5 minutes without refilling the boiler.</p></div>'+
      '<div class="mr-side"><div class="mr-box"><h3>How much foam</h3><p><b>Flat white:</b> a thin layer of microfoam, about 5 mm.</p><p><b>Latte:</b> about 1 cm.</p><p><b>Cappuccino:</b> at least 1 cm, glossy.</p></div>'+
      '<div class="mr-box"><h3>Two drinks</h3><p>Pull both shots first, then steam once for both: the shots keep their flavour for several minutes even as the crema fades.</p><p>For flat whites, a shorter ratio (1:1.5 to 1:2) holds up better in milk.</p></div></div>'};

    /* ---------- the lessons ---------- */
    function lastFlush(c,since){var f=c.flushes[c.flushes.length-1];return f&&f.t1>=(since==null?c.since:since)?f:null}
    function inBand(r){var R0=X.recipes[r.roast];return r.Tq>=R0.T[0]&&r.Tq<=R0.T[1]}
    function stars(sc){return sc>=85?3:sc>=65?2:1}
    var DOSED=function(c){return c.s.pf.b==='dosed'&&c.s.pf.prep>=0.99};
    /* the heating light went out at or after the lesson step began */
    function lightOut(c){return c.heatOffAt!=null&&!c.s.heat&&(c.heatOffAt>=c.since-1||c.t-c.heatOffAt<=20)}
    /* lessons that surf from the light going out start as the element comes on, so it goes out within a minute */
    function atHeat(s){return !!s.heat}
    X.lessons=[
      {id:'warm',track:'Get to know it',title:'Warm up properly',time:'4 min',sub:'Why the light going out doesn\'t mean ready.',
        why:'The heating light goes out after a few minutes, but that only means the boiler is hot. The Silvia\'s heavy brass group takes far longer: 25 to 45 minutes to settle in Auber\'s Scace measurements. Until then it cools every shot.',
        start:{state:'cold',speed:20},
        steps:[
          {t:'The empty portafilter is locked in and a cup is on the warmer, so both heat with the machine.',done:function(c){return c.s.pf.in&&c.s.cup.pos==='warm'},hint:'Tap the portafilter\'s handle to lock it in; tap the cup to move it to the top.'},
          {t:'Switch the power on. Time is running at 20×.',done:function(c){return !!c.s.pwr},hint:'Tap the power switch on the left of the front.'},
          {t:'Wait for the heating light to go out for the first time. Watch the map: the boiler line climbs, the group far behind it.',done:function(c){return c.has('heat-off')},hint:'A few minutes of machine time.'},
          {t:'Keep waiting until the group is heat-soaked, 25 minutes or more. The light keeps cycling meanwhile.',done:function(c){return c.s.Tg>=X.warm.group},hint:'Turn on More lines on the map to watch the group and portafilter catch up. 60× speeds it up.'},
          {t:'Run 120 to 180 ml through the empty portafilter into the drip tray (coffee switch on for about 30 s, then off).',done:function(c){return c.count('flush',function(d){return d.pfIn&&d.vol>=110})>0},hint:'Leave the empty portafilter in and switch coffee on, then off again after about 30 s.'}
        ],
        score:function(c){var early=c.count('shot',null,0)>0;return {stars:early?2:3,text:early?'Warm. A shot pulled before the group soaked would have run cool; now the group is at '+Math.round(c.s.Tg)+' °C.':'Warm and ready: the group is at '+Math.round(c.s.Tg)+' °C and the portafilter at '+Math.round(c.s.Tpf)+' °C.'}}},
      {id:'wave',track:'Get to know it',title:'Read the temperature wave',time:'4 min',sub:'What the heating light is really telling you.',
        why:'Every surfing routine is built on one fact: the orange light is on while the element heats. Watch a cycle on the map, see how far the water overshoots after the light goes out, then see what a flush does.',
        start:{state:'warm',speed:5},
        steps:[
          {t:'Wait for the heating light to come on: the element is heating (the amber band on the map).',done:function(c){return c.has('heat-on')},hint:'The cycle is slow on a Silvia: several minutes. Time is running at 5×.'},
          {t:'Watch it go out: the element has stopped.',done:function(c){return c.has('heat-off')}},
          {t:'Watch the boiler line keep rising after the light goes out: the element sits in the water and keeps heating it for a moment.',done:function(c){return c.phase==='coast'||c.phase==='peak'}},
          {t:'Check yourself.',quiz:{id:'lamp',q:'The heating light just went out. What is the element doing?',opts:['Heating','Off: the brew thermostat opened at 100 °C','Making steam'],a:1,yes:'Right: light out means the element just stopped.',no:'Not quite: the light is on while the element heats and goes out when it stops.'},done:function(c){return c.has('quiz-ok',function(d){return d==='lamp'})}},
          {t:'Take the portafilter out and run a 3 s flush. Watch the boiler line drop and the light come back on.',done:function(c){var f=c.ev('flush',function(d){return d.secs>=2});return !!f},hint:'Tap the portafilter to take it out, then coffee on and off.'},
          {t:'Check yourself.',quiz:{id:'first',q:'The light has just gone out and you start a shot with no flush. How hot is the water at the puck?',opts:['About 93 °C, just right','About 99 °C: the water has overshot, so the shot runs far too hot'],a:1,yes:'Right: Whole Latte Love measured about 99 °C that way.',no:'Not quite: the water overshoots after the light goes out, so the first water is far too hot.'},done:function(c){return c.has('quiz-ok',function(d){return d==='first'})}}
        ],
        score:function(){return {stars:3,text:'You can read the wave. Everything after this builds on it.'}}},
      {id:'medium',track:'Espresso by roast',title:'Medium roast: light out, flush, wait',time:'4 min',sub:'Whole Latte Love\'s measured routine.',
        why:'A shot started as the heating light goes out runs about 99 °C. Whole Latte Love\'s fix: flush 12 s, wait 20 s, brew. Ten shots that way came in at about 93 °C: right for medium beans.',
        start:{state:'warm',speed:1,until:atHeat,bench:{roast:'medium',D:18},tab:'coffee'},
        steps:[
          {t:'Take the portafilter out, then grind, dose, distribute and tamp (the Puck buttons in the Coffee tab).',done:DOSED,hint:'Three buttons in order: Grind and dose, Distribute, Tamp.'},
          {t:'Wait for the heating light to go out.',done:lightOut,hint:'Watch the light strip at the bottom of the map: the element is heating now.'},
          {t:function(){return 'Straight away, flush about '+SURF().wllFlush+' s with the portafilter out.'},done:function(c){return c.has('flush',function(d){return !d.pfIn&&d.secs>=SURF().wllFlush-3&&d.secs<=SURF().wllFlush+2})},hint:'Coffee switch on, count twelve, off.'},
          {t:function(){return 'Wait about '+SURF().wllWait+' s, lock in, cup on the scale, and start the shot.'},done:function(c){var f=lastFlush(c,0);return !!c.shotNow&&c.shotNow.dosed&&f&&c.shotNow.t0-f.t1>=SURF().wllWait-8&&c.shotNow.t0-f.t1<=SURF().wllWait+12},hint:'Tap the handle to lock in, tap the cup down onto the scale, then coffee on.'},
          {t:'Stop at about 36 g on the scale (1:2).',done:function(c){return !!c.lastShot()}}
        ],
        score:function(c){var r=c.lastShot();if(!r)return {stars:1,text:'No shot.'};var ok=inBand(r);return {stars:Math.min(stars(r.taste.score),ok?3:2),text:(ok?'In the band: ':'Outside the band: ')+r.Tq.toFixed(1)+' °C at the puck, '+r.taste.word.toLowerCase()+'.'}}},
      {id:'dark',track:'Espresso by roast',title:'Dark roast: the bottom of the wave',time:'4 min',sub:'The coolest point in the cycle.',
        why:'Dark roasts dissolve easily, and hot water pulls out ashy, bitter flavours. Aim for 88 to 91 °C at the puck with a coarser grind and a shorter ratio: brew as the heating light comes back on, when the boiler has coasted to the bottom of its wave.',
        start:{state:'warm',speed:1,until:function(s){return !s.heat&&s.Tb<=89.2},bench:{roast:'dark',D:18},tab:'coffee'},
        steps:[
          {t:'Take the portafilter out, then grind, dose, distribute and tamp (the grinder is set coarser for dark beans).',done:DOSED},
          {t:'Wait for the heating light to come on.',done:function(c){return c.s.heat&&c.heatOnAt!=null&&c.t-c.heatOnAt<=25},hint:'The boiler is coasting down now; the light comes on within a minute or so.'},
          {t:function(){return 'Flush about '+SURF().darkFlush+' s straight away.'},done:function(c){var n=SURF().darkFlush;return c.has('flush',function(d){return !d.pfIn&&d.secs>=n-2&&d.secs<=n+2})},hint:function(){return 'Coffee switch on with the portafilter out, count '+SURF().darkFlush+', off.'}},
          {t:'Lock in and brew within 10 s; stop at about 32 g (1:1.8).',done:function(c){var r=c.lastShot(),f=lastFlush(c,0);return !!r&&!!f&&r.t0-f.t1<=10}}
        ],
        score:function(c){var r=c.lastShot();if(!r)return {stars:1,text:'No shot.'};var ok=inBand(r);return {stars:Math.min(stars(r.taste.score),ok?3:2),text:r.Tq.toFixed(1)+' °C at the puck: '+(ok?'cool enough for dark beans. ':'not in the dark-roast band. ')+r.taste.word+'.'}}},
      {id:'light',track:'Espresso by roast',title:'Light roast: flush to the hiss',time:'4 min',sub:'The most heat without flashing.',
        why:'Light roasts are dense and slow to give up their sweetness; cool water leaves them sour. Flush only until the hissing stops and brew at once: a Scace on a Silvia read about 94.4 °C that way, falling a couple of degrees through the shot. Grind finer, too.',
        start:{state:'warm',speed:1,until:atHeat,bench:{roast:'light',D:18},tab:'coffee'},
        steps:[
          {t:'Take the portafilter out, then grind, dose, distribute and tamp (finer for light beans).',done:DOSED},
          {t:'Wait for the heating light to go out.',done:lightOut},
          {t:'Flush until the hissing and spitting stop, and no longer.',done:function(c){return c.has('flush',function(d){return !d.pfIn&&d.quiet&&d.quietFor<=3})},hint:'Coffee on with the portafilter out; off as soon as the steam puffs stop.'},
          {t:'Lock in and start the shot within 10 s; stop at about 45 g (1:2.5).',done:function(c){var r=c.lastShot();var f=lastFlush(c,0);return !!r&&!!f&&r.t0-f.t1<=10}}
        ],
        score:function(c){var r=c.lastShot();if(!r)return {stars:1,text:'No shot.'};var ok=inBand(r);return {stars:Math.min(stars(r.taste.score),ok?3:2),text:r.Tq.toFixed(1)+' °C at the puck: '+(ok?'hot enough for light beans. ':'outside the light-roast band. ')+r.taste.word+'.'}}},
      {id:'dial',track:'Espresso by roast',title:'Dial in by taste',time:'6 min',sub:'Fix a bad shot in as few tries as you can.',
        why:'A new bag rarely pulls right first time. Taste, change one thing, pull again. Grind first; ratio next; temperature last.',
        start:{state:'warm',speed:1,until:atHeat,bench:{roast:'medium',D:18,g:16},tab:'coffee'},
        steps:[
          {t:'Pull a medium shot with the grinder where it is (light out, flush, wait). Read the coach\'s verdict.',done:function(c){return c.count('shot')>=1}},
          {t:'Change one thing the coach suggests: most likely the grind.',done:function(c){return c.has('grind')||c.has('yield')}},
          {t:'Pull again, and keep going until a shot scores 80 or more.',done:function(c){var r=c.lastShot();return !!r&&r.taste.score>=80&&c.count('shot',null,0)>=2}}
        ],
        score:function(c){var n=c.count('shot',null,0);return {stars:n<=3?3:n<=5?2:1,text:'Dialed in after '+n+' shots.'}}},
      {id:'milk',track:'Milk',title:'Steam silky milk',time:'3 min',sub:'Stretch, then spin, then stop at 60 °C.',
        why:'Silky milk is two steps: a few seconds of air while the milk is cold, then a spin with the tip under the surface to fold the bubbles in. Stop at about 60 °C, where it tastes sweetest. The Silvia\'s steam is strong, so it all happens fast.',
        start:{state:'warm',speed:1,bench:{drink:'flat',milk:1},milk:1,tab:'milk'},
        steps:[
          {t:'Switch steam on and wait for the heating light to go out: a couple of minutes, so 5× helps (back to 1× to steam).',done:function(c){var on=c.ev('steam-on');return c.s.steam&&c.ready&&!!on&&c.has('heat-off',function(d,e){return e.t>on.t+0.5})},hint:'The steam switch; the orange light comes on while it heats and goes out at steam temperature.'},
          {t:'Purge for about 2 s: open the knob with no jug, then close it.',done:function(c){return c.has('purge')},hint:'Tap the knob on the side, then tap it again.'},
          {t:'Put the jug under the wand, tip at the surface, and open the knob.',done:function(c){return c.s.jug.pos==='wand'&&c.s.knob&&c.s.jug.tip==='surf'}},
          {t:'Stretch for a second or two, then sink the tip (Under, spinning) before the milk passes about 35 °C.',done:function(c){return c.s.jug.tip==='sub'&&c.s.jug.airC>2},hint:'Milk tab: Under, spinning. The thermometer is on the jug.'},
          {t:'Close the knob at about 60 °C, then take the jug away.',done:function(c){return c.has('milk')}},
          {t:'Purge the wand for a second and wipe it.',done:function(c){return c.has('wand-clean')},hint:'Jug away, knob open briefly, then Wipe the wand.'}
        ],
        score:function(c){var m=c.ev('milk',null,0);var sc=m&&m.d?m.d.score:50;return {stars:stars(sc),text:m?'Milk at '+Math.round(m.d.T)+' °C, stretched '+Math.round(m.d.foam)+'%.':'Done.'}}},
      {id:'refill',track:'Milk',title:'Refill after steaming',time:'4 min',sub:'The step Rancilio\'s manual insists on.',
        why:'The pump doesn\'t run in steam mode, so steaming drains the boiler, and it stays near 140 °C. Rancilio\'s fix is the hot water switch: it refills the boiler. A cupful through the group then brings the group back down.',
        start:{state:'warm',speed:1,mod:function(s){s.steam=1;s.Tb=139;s.Tel=142;s.Tw=138;s.vol=s.vol*0.75;s.brewC=0;s.steamC=0},tab:'coffee'},
        steps:[
          {t:'You\'ve just finished steaming. Switch steam off.',done:function(c){return !c.s.steam}},
          {t:'Check yourself.',quiz:{id:'refill',q:'Steam is off and the heating light is out. Can you pull a shot now?',opts:['Yes','No: the boiler is near steam temperature and short of water'],a:1,yes:'Right. Refill and cool it first.',no:'Not yet: the boiler is still near 140 °C and part empty.'},done:function(c){return c.has('quiz-ok',function(d){return d==='refill'})}},
          {t:'Refill: hot water switch on, open the knob, and close it once water (not steam) comes out of the wand. Then hot water off.',done:function(c){return c.has('water-off')&&c.s.vol>=c.K.full*0.97},hint:'Hot water switch, then the knob on the side. Spitting steam first, then water.'},
          {t:'Take the portafilter out and run a cupful (about 120 ml) through the group.',done:function(c){return c.has('flush',function(d){return !d.pfIn&&d.vol>=CUP-10})},hint:'Coffee on for about 25 s with the portafilter out, then off.'},
          {t:'Dose, then surf as usual: light out, flush, wait, brew a medium shot.',done:function(c){return !!c.lastShot()}}
        ],
        score:function(c){var r=c.lastShot();if(!r)return {stars:1,text:'No shot.'};var ok=inBand(r);return {stars:ok?3:r.flash>0.2?1:2,text:r.Tq.toFixed(1)+' °C at the puck'+(r.flash>0.2?': it still flashed.':ok?': back in the band.':'.')}}},
      {id:'two',track:'Milk',title:'Two flat whites',time:'8 min',sub:'The whole routine, start to finish.',
        why:'Two drinks on one boiler: pull both shots, steam once for both, pour, then refill the boiler for next time.',
        start:{state:'warm',speed:1,until:atHeat,bench:{roast:'medium',D:18,drink:'flat',milk:2},milk:2,tab:'coffee'},
        steps:[
          {t:'Pull the first shot (light out, flush, wait, brew).',done:function(c){return c.count('shot')>=1}},
          {t:'Set that cup aside (Coffee tab) so a fresh cup sits on the scale.',done:function(c){return c.has('aside')}},
          {t:'Knock out, dose again, and pull the second shot the same way.',done:function(c){return c.count('shot')>=1}},
          {t:'Steam about 280 ml of milk for two: stretch briefly, then spin.',done:function(c){return c.has('milk')&&c.s.jug.m>=250}},
          {t:'Pour into both cups (Milk tab).',done:function(c){return c.has('pour',function(d){return d.n>=2})}},
          {t:'Purge and wipe the wand, switch steam off and refill the boiler with the hot water switch.',done:function(c){return c.has('wand-clean')&&!c.s.steam&&c.has('water-off')&&c.s.vol>=c.K.full*0.97}}
        ],
        score:function(c){var p=c.ev('pour',null,0);var sc=p&&p.d?p.d.score:60;return {stars:stars(sc),text:'Two flat whites, '+(p?p.d.score:'')+' for the pour.'}}},
      {id:'clean',track:'Care',title:'Clean up after coffee',time:'2 min',sub:'Two minutes that save a monthly scrub.',
        why:'Coffee oil and milk turn rancid and bake on. A quick clean-up after each session keeps the group clear and the wand sweet.',
        start:{state:'warm',speed:1,mod:function(s){s.pf.b='spent';s.pf.D=18;s.pf.soak=26;s.pf.wet=30;s.wand.out=1;s.wand.inn=0.4;s.drip=300;s.grime=0.2;s.cup.pos='warm'},tab:'clean'},
        steps:[
          {t:'Take the portafilter out and knock out the puck (tap the basket).',done:function(c){return c.has('knock')}},
          {t:'Flush the group with the portafilter out for a few seconds to rinse it.',done:function(c){return c.has('flush',function(d){return !d.pfIn&&d.secs>=2.5})}},
          {t:'Purge the steam wand into the drip tray: steam on, open the knob 2 s, close it.',done:function(c){return c.has('purge')},hint:'The wand has milk inside it from the last jug.'},
          {t:'Wipe the wand with a damp cloth (Milk or Cleaning tab).',done:function(c){return c.has('wipe')}},
          {t:'Empty the drip tray, lock the empty portafilter back in, and switch off (steam off first).',done:function(c){return c.has('act',function(d){return d==='tray'})&&!c.s.pwr&&c.s.pf.in&&!c.s.steam}}
        ],
        score:function(){return {stars:3,text:'Clean and off. Brush the gasket under the group (Rancilio: not the shower screen) and wash the basket.'}}},
      {id:'backflush',track:'Care',title:'Backflush with detergent',time:'5 min',sub:'Rancilio\'s blind-filter clean.',
        why:'Coffee oil builds up in the group and the 3-way valve. Rancilio\'s manuals clean it with the blind filter and espresso-machine detergent: coffee on 5 s, off 10 s, until the water runs clear, then rinse. The 2018 and 2024 manuals list it under daily cleaning.',
        start:{state:'warm',speed:2,mod:function(s){s.grime=0.6},tab:'clean'},
        steps:[
          {t:'Take the portafilter out and swap to the blind basket (Cleaning tab).',done:function(c){return c.s.pf.b==='blind'}},
          {t:'Add espresso-machine detergent to the blind basket.',done:function(c){return c.has('detergent')}},
          {t:'Lock it in and cycle: coffee on about 5 s, off about 10 s, until the water runs clear (8 or so cycles here).',done:function(c){return c.count('bf-cycle')>=8},hint:'Each off vents the cleaner back through the valve into the drip tray.'},
          {t:'Take it out, rinse the blind basket (swap to Double and back to Blind), lock in again.',done:function(c){return c.has('basket',function(d){return d==='empty'})&&c.s.pf.b==='blind'&&c.s.pf.in}},
          {t:'Rinse: the same cycles with plain water until no detergent is left.',done:function(c){return c.count('bf-cycle')>=8&&c.s.det<0.03}},
          {t:'Swap back to the double basket, then run about 150 ml through the group.',done:function(c){return c.has('flush',function(d){return d.vol>=120})&&c.s.pf.b==='empty'}}
        ],
        score:function(c){var g=c.s.grime;return {stars:g<0.08&&c.s.det<0.02?3:2,text:'Group oil down to '+Math.round(g*100)+'% and the detergent rinsed out.'}}},
      {id:'descale',track:'Care',title:'Descale (if your water needs it)',time:'8 min',sub:'A mild citric clean, community method.',
        why:'Rancilio\'s current manuals don\'t descale: they ask for soft water, about 89 ppm, and a filter if yours is harder. If hard water has scaled the boiler, a mild citric acid mix is the common method. Clive warns that descaling itself wears the machine, so good water beats frequent descaling.',
        start:{state:'warm',speed:20,mod:function(s){s.scale=0.65;s.pf.in=0;s.pf.b='empty'},tab:'clean'},
        steps:[
          {t:'Take the portafilter out. Empty the tank and fill it with the citric mix (Cleaning tab).',done:function(c){return c.has('descaler-in')}},
          {t:'Run about 300 ml out of the wand: knob open, hot water switch on. Rest the pump after a minute or so.',done:function(c){return c.cnt.wandDesc>=280},hint:'Hot water switch with the knob open.'},
          {t:'Run about 300 ml through the group: coffee switch on, portafilter out.',done:function(c){return c.cnt.groupDesc>=280}},
          {t:'Switch off and leave it about 20 minutes (use 60× time).',done:function(c){return !c.s.pwr&&c.cnt.offFor>=1140},hint:'The acid works while it sits.'},
          {t:'Switch on; keep running it out of the wand and the group, a minute at a time with rests, until the tank is empty.',done:function(c){return c.s.tank<60&&c.s.pwr}},
          {t:'Rinse: refill with fresh water (Cleaning tab) and run it through the wand and the group. Two or more tanks, until no taste of acid is left.',done:function(c){return c.cnt.rinse>=2*1800&&c.s.descB<0.01},hint:'Refill each time the tank empties; half through the wand, half through the group.'}
        ],
        score:function(c){return {stars:c.s.scale<0.15?3:2,text:'Scale down to '+Math.round(c.s.scale*100)+'% and the boiler rinsed clean. Better water means you rarely need this.'}}}
    ];

    /* ---------- the care log ---------- */
    X.care=[
      {id:'pf',group:'After every coffee',title:'Knock out, rinse, flush',src:'Rancilio manual + common practice',when:'After each shot.',every:null,
        steps:['Take the portafilter out slowly: the water on the grounds is hot.','Knock out the puck and rinse the basket.','Run a second or two of water through the group to rinse it.','Lock the empty portafilter back in so it stays warm.'],lesson:'clean'},
      {id:'wand',group:'After every coffee',title:'Purge and wipe the wand',src:'Rancilio manual (2024)',when:'Straight after steaming, before the milk dries on.',every:null,
        steps:['Steam off, point the wand at the drip tray and open the knob for 2 s.','Wipe it with a damp cloth. It\'s hot: move it by the knob end.'],lesson:'milk'},
      {id:'refill',group:'After every coffee',title:'Refill after steaming',src:'Rancilio manuals (2012, 2018, 2024)',when:'Every time you steam.',every:null,
        steps:['Hot water switch on, open the knob slowly, close it as soon as water comes out of the wand, switch off.','Then run a cupful through the group before the next shot.'],lesson:'refill'},
      {id:'bf',group:'Daily',title:'Blind-filter clean with detergent',src:'Rancilio manuals (2018, 2024: daily; 2012: weekly)',when:'Rancilio\'s newer manuals say daily; many home users do it weekly.',every:function(){return 7},
        steps:['Blind filter in the portafilter with espresso-machine detergent; lock it in.','Coffee on for 5 s, off for 10 s; repeat until the water runs clear.','Rinse the same way several times with plain water.'],lesson:'backflush'},
      {id:'seal',group:'Daily',title:'Brush the gasket under the group',src:'Rancilio manual (2018, 2024)',when:'Every day you use it.',every:1,
        steps:['With the portafilter out, brush the seal under the group.','Rancilio\'s newer manuals say not to brush the shower screen itself; the 2012 manual brushed both.']},
      {id:'tray',group:'Daily',title:'Empty and rinse the drip tray',src:'Rancilio manual',when:'Every day you use it.',every:1,
        steps:['Empty it and rinse it with water.']},
      {id:'tank',group:'Daily',title:'Fresh water in the tank',src:'Rancilio manual',when:'Every day you use it.',every:1,
        steps:['Fresh, cold water each time; Rancilio asks for soft water, about 5 °dKH (89 ppm), with a filter if yours is harder.','Never switch on with an empty tank, and never let it run dry while the pump runs.']},
      {id:'milk',group:'Weekly',title:'Clean the steam wand inside',src:'Rancilio manual (2018)',when:'Weekly for daily milk drinks.',every:7,
        steps:['Soak the wand tip in milk-system cleaner, as the package says (Rancilio\'s 2018 manual: at least 10 minutes, no aluminium container).','Purge it with steam afterwards and wipe it.']},
      {id:'soak',group:'Monthly',title:'Soak the baskets and portafilter',src:'Rancilio manual (2012)',when:'Monthly, or whenever brewing misbehaves.',every:30,
        steps:['With the machine cold, soak the portafilter and baskets in detergent solution for 20 minutes or more (keep the handle out).','Rinse well.']},
      {id:'descale',group:'If your water is hard',title:'Descale',src:'Community method; not in Rancilio\'s current manuals',when:function(w){return w==='tap'?'Every 2 months or so on hard water (Whole Latte Love says at least every two months; Seattle Coffee Gear 1 to 3). Better: filter the water.':'Rarely or never on soft, filtered water: Rancilio\'s current manuals rely on water at about 89 ppm instead.'},every:function(w){return w==='tap'?60:null},
        steps:['Citric acid at 8 to 12 g per litre (home-barista\'s mild mix). Portafilter out.','Run it through the wand (hot water switch, knob open) and the group, a minute at a time with a minute\'s rest for the pump.','Let it sit 20 minutes, then run the rest through.','Rinse with two or more tanks of fresh water, through the wand and the group.','Don\'t drink anything that comes out until the rinse is done.'],lesson:'descale'},
      {id:'gasket',group:'Yearly',title:'New group gasket and screen',src:'Whole Latte Love; Seattle Coffee Gear',when:'About once a year, or sooner if it leaks or the handle locks further round than it used to.',every:365,
        steps:['Signs: water around the rim during a shot, the handle swinging further, a hard or cracked gasket.','Unplug it and let it cool. Undo the screen\'s center screw, pry out the old gasket, seat the new one with an empty portafilter.','Check the thickness for your Silvia: listings run 8 to 8.5 mm, and some sellers advise rubber over silicone.']},
      {id:'idle',group:'After a break',title:'After a break, or a new machine',src:'Rancilio manual',when:'Before the first coffee.',every:null,
        steps:['Fill the tank. Run the pump with the steam knob open (hot water switch) until water comes out of the wand: that fills the boiler.','Then flush 0.5 to 1 l through the group (Rancilio: 1 l in 2024, 0.5 l in 2018) and pour it away.']}
    ];
    X.intro.care=function(){return 'Rancilio\'s own schedule plus the common practice around it; each card says which is which. Tick a task when you do it and the date saves in this browser. Rancilio\'s current manuals ask for soft water, about 5 °dKH (89 ppm), and a filter if yours is harder; they don\'t describe descaling at all. Clive suggests water at 35 to 85 ppm. Pure reverse osmosis or distilled water is not recommended either (it tastes flat and can be corrosive), so if you filter, add minerals back.'};

    X.sources=function(){return '<h3>Rancilio</h3><ul>'+
      '<li><a href="https://www.ranciliogroupna.com/wp-content/uploads/2025/05/460100001_MA_Silvia_AC_2024-03.pdf">Silvia and Silvia E manual (2024)</a>: the heating light, steaming, refilling after steaming, daily cleaning, water hardness, the E\'s auto-off.</li>'+
      '<li><a href="https://cdn.shopify.com/s/files/1/0654/9015/7800/files/Silvia.pdf">Silvia manual (2018)</a>, <a href="https://www.seattlecoffeegear.com/cdn/shop/files/rancilio-silvia3-user-manual.pdf">2012 manual</a> (hosted by Seattle Coffee Gear) and <a href="https://clivecoffee.imagerelay.com/ql/be23d08460f74671b672129507106e69/Silvia_Manual__1_.pdf">2010 manual</a> (linked from Clive).</li>'+
      '<li><a href="https://www.ranciliogroupna.com/wp-content/uploads/2024/09/SPEC-HL_SLV.pdf">Silvia spec sheet (2024)</a>: power, boiler and tank.</li></ul>'+
      '<h3>Measurements</h3><ul>'+
      '<li><a href="https://www.wholelattelove.com/blogs/reviews/rancilio-silvia-review">Whole Latte Love, Silvia review</a>: 99 °C with no flush, the 12 s flush and 20 s wait routine, steaming speed.</li>'+
      '<li><a href="https://www.home-barista.com/rancilio-silvia-review.html">home-barista, Silvia review</a> (Dan Kehn\'s Scace measurements) and <a href="https://www.home-barista.com/espresso-machines/rancilio-silvia-performance-with-without-pid-t4691.html">erics\' thermocouple logs</a> of the boiler cycle.</li>'+
      '<li><a href="https://www.jetblackespresso.com.au/assets/files/Operation%20manual%20for%20Rancilio%20Kit%20v4.pdf">Auber, Silvia PID kit manual</a>: warm-up time measured with a Scace.</li></ul>'+
      '<h3>Surfing</h3><ul>'+
      '<li><a href="https://www.seattlecoffeegear.com/blogs/learning-center/temperature-surfing-single-boiler">Seattle Coffee Gear, temperature surfing a single boiler</a>.</li>'+
      '<li><a href="https://www.kaffeewiki.de/wiki/Rancilio_Miss_Silvia">KaffeeWiki, Rancilio Miss Silvia</a> and the home-barista thread on <a href="https://www.home-barista.com/espresso-machines/temperature-surfing-rancilio-silvia-t2585.html">surfing the Silvia</a>.</li>'+
      '<li><a href="https://clivecoffee.com/blogs/learn/how-water-temperature-affects-espresso-extraction-clive-coffee">Clive, water temperature and extraction</a>.</li></ul>'+
      '<h3>Recipes, milk, cleaning, water</h3><ul>'+
      '<li><a href="https://completehomebarista.com/faqs/brewing-methods/espresso-technique/adjust-for-different-roast-levels/">Complete Home Barista, adjusting for roast level</a>; <a href="https://clivecoffee.com/blogs/learn/espresso-extraction-time-ratio-a-complete-guide-clive-coffee">Clive, extraction time and ratio</a>; <a href="https://www.baristahustle.com/what-difference-will-it-make-to-an-espresso-if-i-raise-the-temperature-of-my-machine-by-one-degree/">Barista Hustle on brew temperature</a>.</li>'+
      '<li><a href="https://clivecoffee.com/blogs/learn/why-is-my-espresso-sour-or-bitter-how-to-fix-it-clive-coffee">Clive, sour or bitter</a>; <a href="https://www.baristahustle.com/coffee-extraction-and-how-to-taste-it/">Barista Hustle, tasting extraction</a>; <a href="https://completehomebarista.com/faqs/brewing-methods/espresso-technique/what-is-channeling/">Complete Home Barista, channeling</a>.</li>'+
      '<li><a href="https://au.lamarzoccohome.com/blog/how-to-steam-milk-like-a-pro-barista/">La Marzocco Home, steaming milk</a>; <a href="https://www.baristahustle.com/lesson/la-1-01-making-microfoam/">Barista Hustle, microfoam</a>; <a href="https://perfectdailygrind.com/2022/06/what-is-a-flat-white/">Perfect Daily Grind, the flat white</a>.</li>'+
      '<li><a href="https://www.wholelattelove.com/blogs/articles/how-to-replace-rancilio-silvia-group-gasket">Whole Latte Love, replacing the Silvia\'s gasket</a>; <a href="https://wholelattelove.com/blogs/how-to/what-type-of-water-is-best-for-my-espresso-machine">Whole Latte Love, water for espresso machines</a>; <a href="https://www.baristahustle.com/water-hardness/">Barista Hustle, water hardness</a>.</li></ul>'+
      '<p class="fine">The page is unofficial. Rancilio\'s manual wins wherever this page and it differ.</p>'};
    return X;
  })();
