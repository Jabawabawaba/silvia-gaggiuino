  /* Part guides data for the Silvia: the guides (G). Shared by part-guides.js and the wiring page's back-links
     (wiring-refs.js), so a step's map target is written once. Every step comes from this site's own Silvia install
     text (runbook-phases.js, docs-silvia-specifics.md, the wiring rules and runs.py, checks.tpl.html), which cite
     realNiche's harness, the Discord Silvia thread and the official docs. A step's map is a wiring-drawing target
     (maplink.js), chk lists power-on checks, links other pages; when is a machine.js condition. */
  var G={};
  function only(prefix,n,count){var a=[];for(var i=1;i<=count;i++)if(i!==n)a.push([prefix+i,{o:0},0,250]);a.push([prefix+n,{o:1},150,300]);return a}
  function cat(){return Array.prototype.concat.apply([],arguments)}

  G.tc={svg:'pg-tc',
    base:{close:{o:1},route:{o:0},j4v:{o:0},ins:{y:0,o:1},l1:{x:0,y:0,o:1},l2:{x:0,y:0,o:1},lcap:{o:1},bt:{y:0,o:1},clp:{y:0,o:1},sc1:{y:0,o:1},sc2:{y:0,o:1},safe:{o:0},
      tc:{y:-70,o:0},paste:{sy:0},syr:{y:-12,o:0},nosp:{o:0},rlead:{d:1},tcw:{y:44},ma:{o:0},mb:{o:0}},
    steps:{all:[
      {t:'Fold back the insulation',when:'ver:V5,V6',d:'From V5 on the boiler is insulated. Fold it back to reach the thermostats before you take any off. It goes back on once the thermocouple is in.',
       a:[['ins',{y:-140,o:0},0,900]],links:[['Runbook, phase 2','runbook.html#p3a0']]},
      {t:'Unplug the brew thermostat',d:'Label its two leads, as with every stock wire, then pull them straight off its spades. The new harness doesn\'t use them.',
       a:[['lcap',{o:0},0,300],['l1',{x:40,y:-60,o:0},0,900],['l2',{x:60,y:-50,o:0},150,900]],links:[['Runbook, phase 2','runbook.html#p2b']]},
      {t:'Undo its clamp and lift it off',d:'Undo the clamp screws and lift the brew thermostat off the boiler top. The thermocouple goes into one of those threaded holes. The 165 °C safety thermostat on the front of the boiler stays; so can the steam thermostat, which the harness doesn\'t wire.',
       a:[['sc1',{y:-40,o:0},0,1000],['sc2',{y:-40,o:0},0,1000],['clp',{y:-50,o:0},900,500],['bt',{y:-60,o:0},1100,500],['safe',{o:1},1500,300]],loop:['spinU'],links:[['Runbook, phase 2','runbook.html#p2c']]},
      {t:'Paste on the thread',d:'Coat the thermocouple\'s M3 thread with thermal paste rated for 180 °C or more.',
       a:[['tc',{o:1},0,300],['syr',{o:1},250,250],['syr',{y:12},500,1200],['paste',{sy:1},500,1200],['syr',{o:0},1750,250]]},
      {t:'Screw it in, finger tight only',d:'Into one of the holes the clamp used; GaggiMate\'s Silvia guide suggests the middle or left-most hole for better readings. Finger tight only, with the wire free to rotate. No spanner.',
       a:[['safe',{o:0},0,300],['tc',{y:0},0,1500],['nosp',{o:1},1550,350]],loop:['spinF'],chk:[['g8','Thermocouple finger tight, lead free to rotate']]},
      {t:'Route the lead',d:'Around the front of the boiler to the PCB on the right. Low-voltage wires stay low and to the right; mains runs high.',
       a:[['close',{o:0},0,300],['route',{o:1},200,300],['rlead',{d:0},500,1900]],map:'run:LV10'},
      {t:'Refit the insulation',when:'ver:V5,V6',d:'Fold it back over the boiler with the thermocouple lead routed out cleanly, clear of the element terminals.',
       a:[['route',{o:0},0,300],['nosp',{o:0},0,10],['close',{o:1},200,300],['ins',{y:0,o:1},500,900]],links:[['Runbook, phase 3','runbook.html#p3a2']]},
      {t:'Clamp it in J4 and check it',d:['Fold each bare wire over before it goes in the clamp, keep the insulation out of it, and put + and − where they were on your bench test: there the reading had to rise when you warmed the probe.','With a meter: either wire to the boiler reads open (OL), because the probe is ungrounded; the two wires together read a few ohms.'],
       a:[['route',{o:0},0,300],['close',{o:0},0,300],['j4v',{o:1},200,300],['tcw',{y:0},500,900],['t1',{r:360},500,1000],['t2',{r:360},650,1000],['ma',{o:1},1500,300],['mb',{o:1},1900,300]],
       chk:[['b6','Thermocouple lead to boiler body'],['c7','Thermocouple loop']],map:'run:LV10'}
    ]}};

  G.ps={svg:'pg-ps',
    base:{tee:{y:30,o:0},cord2:{o:0},asm:{x:-150,y:40},cord1:{o:0},or1:{y:60,o:0},sen:{y:50},qt:{o:0},foam:{o:0},wat:{o:0},wat2:{o:0},lcaps:{o:1},chs:{o:0},j6:{o:0},cab:{d:1},gauge:{o:0}},
    steps:{all:[
      {t:'O-ring into the elbow',d:'Press the flat white O-ring, about 11 mm across, into the elbow\'s 1/4" socket until it sits flush at the bottom. The sensor seals on it, not on its thread; the sensor\'s own base O-ring often can\'t reach the seat.',
       a:[['or1',{o:1},0,300],['or1',{y:0},0,1000]],loop:['pulseR']},
      {t:'Sensor in: hand tight, then at most a quarter turn',d:'Screw the sensor into the elbow by hand until it stops. A quarter turn more with a spanner is the most it ever gets: more crushes the O-ring or stops the reading.',
       a:[['sen',{y:0},0,1500],['qt',{o:1},1500,300]],loop:['spinS']},
      {t:'Thread cord on the tapered threads',d:'Loctite 55 on the elbow\'s and the tee\'s 1/8" tapered threads, not PTFE tape, so they can be turned back to line up.',
       a:[['qt',{o:0},0,300],['cord1',{o:1},200,600],['tee',{o:1},500,400],['cord2',{o:1},900,600]]},
      {t:'Tee in at the OPV, elbow into the tee',d:'Juun\'s parts list for this spot: a 1/8" FFM tee and a 1/4"F to 1/8"M elbow. Fit the tee at the OPV and the elbow into the tee, turned so the sensor hangs below it, clear of the steam pipes.',
       a:[['lcaps',{o:0},0,300],['tee',{y:0},0,900],['asm',{x:0,y:0},800,1400]],chk:[['g11','Plumbing snug and dry']]},
      {t:'Let it hang clear',d:'Keep the sensor off the chassis and anything hot. A wrap of foam helps if its readings are noisy. It\'s rated to 105 °C, and this spot never sees steam temperatures.',
       a:[['chs',{o:1},0,400],['foam',{o:1},400,500]]},
      {t:'Plug it into J6',d:'Its lead plugs into J6: 5V, GND and P, the signal. Extend it with 22 AWG if it\'s short.',
       a:[['j6',{o:1},0,300],['cab',{d:0},300,1500]],map:'run:LV9'},
      {t:'Fill it and test it',d:'At first power-on, [UT] Tube Fill pushes the air out of its line, then [UT] Test OPV with a blank basket should peak at 10.5 to 13 bar, with no leaks. Then switch off and unplug, and check each joint with a dry paper towel.',
       a:[['wat',{o:1},0,600],['wat2',{o:1},0,600],['gauge',{o:1},500,300]],count:['pval',0,11.5,' bar',800,1600],
       links:[['Runbook, phase 5','runbook.html#p5e']]}
    ]}};

  G.wire={svg:'pg-wire',
    base:{wv1:{o:1},wv2:{o:0},wv3:{o:0},wv4:{o:0},wv5:{o:0},wv6:{o:0},wv7:{o:0},waste:{y:0,o:1},cutT:{y:-34,o:0},cutB:{y:34,o:0},flag:{o:0,y:-12},mkr:{o:0},wd1:{o:0},
      slug:{x:0,o:1},sjT:{y:-14,x:0,o:1},sjB:{y:14,x:0,o:1},wd2:{o:0},isp:{x:70},dimp:{o:0},cjT:{y:-18,o:0},cjB:{y:18,o:0},bsp:{x:60},wo:{o:1},wc:{o:0},wcap:{o:1},
      ojT:{y:-18,o:0},ojB:{y:18,o:0},tape:{sx:0,o:0},tcap:{o:0},tsp:{x:60},fk2:{x:60,o:0},bl:{x:-30},br:{x:30},bd1:{o:0},bd2:{o:0},bjT:{y:-18,x:0,o:0},bjB:{y:18,x:0,o:0},okm:{o:0}},
    steps:{all:[
      {t:'Cut and label',d:'Cut each run a little long from the cut list, and put both labels on before you crimp. Ends at the boiler get their ID in oil-based marker on the jacket instead of a paper flag.',
       a:cat(only('wv',1,7),[['wd1',{o:1},0,300],['cutT',{o:1},150,200],['cutB',{o:1},150,200],['cutT',{y:0},400,450],['cutB',{y:0},400,450],['waste',{y:40,o:0},950,600],['cutT',{y:-34,o:0},950,350],['cutB',{y:34,o:0},950,350],['flag',{o:1,y:0},1400,500],['mkr',{o:1},1900,400]]),
       links:[['Cut list','%%LINK_CUTLIST%%'],['Wire labels','%%LINK_LABELS%%']]},
      {t:'Strip about 6 mm',d:'About 6 mm fills the barrel of a standard spade with no bare copper showing behind it. If any strands come away with the insulation, cut the end off and strip again. A light twist keeps the strands together.',
       a:cat(only('wv',2,7),[['sjT',{y:0},400,450],['sjB',{y:0},400,450],['sjT',{x:60},900,900],['sjB',{x:60},900,900],['slug',{x:60},900,900],['slug',{o:0},1700,300],['sjT',{o:0},1700,300],['sjB',{o:0},1700,300],['wd2',{o:1},1900,300]])},
      {t:'Insulated spades and forks',d:'For ends away from the boiler: a red spade for one 18 AWG wire, crimped in the red die, and the 22 AWG low-voltage wires land on red spades too. Forks go on all four SSR screws. Nylon insulation is rated to only 105 °C, so none goes near the boiler.',
       a:cat(only('wv',3,7),[['isp',{x:0},400,900],['cjT',{o:1},1100,250],['cjB',{o:1},1100,250],['cjT',{y:0},1400,450],['cjB',{y:0},1400,450],['dimp',{o:1},1800,200],['cjT',{y:-18,o:0},2000,400],['cjB',{y:18,o:0},2000,400]]),
       chk:[['g4','SSR: fork spades on all four terminals']]},
      {t:'Bare spades at the boiler',d:'Every end on the boiler, the safety thermostat and the solenoid gets an uninsulated spade, crimped with the open-barrel crimper: copper under the front tabs, insulation under the rear ones. Leave them bare for the meter checks, then wrap each in self-fusing silicone tape.',
       a:cat(only('wv',4,7),[['bsp',{x:0},400,900],['ojT',{o:1},1100,250],['ojB',{o:1},1100,250],['ojT',{y:0},1400,450],['ojB',{y:0},1400,450],['wo',{o:0},1700,150],['wc',{o:1},1700,150],['wcap',{o:0},1700,250],['ojT',{y:-18,o:0},1900,400],['ojB',{y:18,o:0},1900,400],['tape',{o:1},2300,200],['tape',{sx:1},2300,900],['tcap',{o:1},3100,300]]),
       chk:[['g1','Boiler and valve spades bare and taped']],map:'part:boiler'},
      {t:'Two wires on one terminal',d:'Where two 18 AWG runs share a terminal, they go into one spade or fork sized for two: blue, never red, or a bare spade sized for 16 to 14 AWG at the boiler. That\'s SSR terminal 1, the safety thermostat, the power switch\'s neutral spade, the lamp, the pump, the solenoid and the boiler ground.',
       a:cat(only('wv',5,7),[['tsp',{x:0},400,900],['fk2',{o:1},1400,200],['fk2',{x:0},1400,900]]),
       chk:[['g2','Doubled terminals sized for two']],map:[['On the wiring map','runs:AC3,AC4,AC6,AC7,AC8,AC9,AC10,AC11,AC12,G1,G2',null,'Runs that share a terminal']]},
      {t:'Butt splices in the ground chain',d:'The switches\' low-voltage ground chain can join with red butt splices instead of shared spades. Push each wire in to the middle stop and crimp each half in the red die.',
       a:cat(only('wv',6,7),[['bl',{x:0},400,900],['br',{x:0},400,900],['bjT',{o:1},1100,250],['bjB',{o:1},1100,250],['bjT',{y:0},1400,400],['bjB',{y:0},1400,400],['bd1',{o:1},1750,150],['bjT',{y:-18},1900,300],['bjB',{y:18},1900,300],['bjT',{x:52},2200,400],['bjB',{x:52},2200,400],['bjT',{y:0},2650,400],['bjB',{y:0},2650,400],['bd2',{o:1},3000,150],['bjT',{y:-18,o:0},3150,400],['bjB',{y:18,o:0},3150,400]]),
       map:[['On the wiring map','runs:LV4,LV5,LV6',null,'The switch ground chain']]},
      {t:'Pull-test every crimp',d:'A firm tug on each one. Redo any that move, and leave no stray strands or bare metal, apart from the boiler spades waiting for their tape.',
       a:cat(only('wv',7,7),[['okm',{o:1},1400,400]]),loop:['tug','jig'],chk:[['g3','Every crimp survives a firm tug']]}
    ]}};

  G.ssr={svg:'pg-ssr',
    base:{sv1:{o:1},sv2:{o:0},sv3:{o:0},ssr1:{x:120,o:0},clr:{o:0},scw:{x:-80},wsh:{x:50,o:0},nut:{x:60,o:0},cov:{o:1,y:0},lw1:{y:70,o:0},lw2:{y:70,o:0},cwp:{y:-60,o:0},cwm:{y:-60,o:0}},
    steps:{all:[
      {t:'Find its spot',d:'On the left wall inside the machine, clear of the pump. It switches the element; the PCB drives it from J9.',
       a:[['ssr1',{o:1},0,200],['ssr1',{x:0},100,900],['clr',{o:1},1100,300]],map:'part:ssr'},
      {t:'Screw it to the wall',d:'One screw, washers and a nut through a drilled hole, or a small bracket, with its base flat on the metal: while it conducts it turns several watts into heat.',
       a:[['sv1',{o:0},0,250],['sv2',{o:1},150,300],['scw',{x:0},500,900],['wsh',{o:1},1400,200],['wsh',{x:0},1400,600],['nut',{o:1},1700,200],['nut',{x:0},1700,600]],loop:['nutspin']},
      {t:'Load terminal 1: two wires, one fork',d:'Switched line from the power switch (AC3) and the PCB\'s feed (AC4) share load terminal 1, in one fork sized for two.',
       a:[['sv2',{o:0},0,250],['sv3',{o:1},150,300],['cov',{o:0,y:-24},600,600],['lw1',{o:1},1200,200],['lw1',{y:0},1200,900],['sl1',{r:360},2200,800]],map:[['On the wiring map','runs:AC3,AC4',null,'AC3 and AC4']]},
      {t:'Load terminal 2: to the safety thermostat',d:'AC5 runs from load terminal 2 to the 165 °C safety thermostat, then on to the element. Never bypass the thermostat.',
       a:[['lw2',{o:1},0,200],['lw2',{y:0},0,900],['sl2',{r:360},1000,800]],chk:[['e4','SSR terminal 2 to element terminal 1']],map:'run:AC5'},
      {t:'Control wires: + and −',d:'J9 R1 goes on + and J9 GND on −: the control side has a polarity.',
       a:[['cwp',{o:1},0,200],['cwm',{o:1},100,200],['cwp',{y:0},0,900],['cwm',{y:0},100,900],['sc1',{r:360},1000,800],['sc2',{r:360},1100,800]],chk:[['f7','J9 R1 pin to SSR +'],['f8','J9 GND pin to SSR −']],map:[['On the wiring map','runs:LV7,LV8',null,'SSR control wires']]},
      {t:'Check it',d:'Forks on all four terminals, screws tight, no stray strands, and strain relief on its wires. On the bench test its light came on below the setpoint and flashed near it.',
       a:[['cov',{o:1,y:0},0,600]],loop:['blink'],chk:[['g4','SSR: forks on all four terminals, screws tight']],links:[['Runbook, phase 4','runbook.html#p4d']]}
    ]}};

  G.sw={svg:'pg-sw',
    base:{swv:{o:1},swm:{o:0},pbE:{y:0,o:1},ac1:{o:0},ac2:{o:0},ac3:{o:0},ac89:{o:0},ac1t:{o:1},ac2t:{o:1},ac3t:{o:1},lv1:{o:0},lv2:{o:0},lv3:{o:0},lv4:{o:0},lv5:{o:0},lv6:{o:0},lvcap:{o:0}},
    steps:{all:[
      {t:'E model: fit a latching rocker',when:'model:E',d:'The E\'s power switch is a push button that works with its energy-saver module, which the harness leaves out. Fit a double-pole rocker that latches, like the M\'s, before wiring AC1, AC2, AC3, AC8 and AC9. Confirm the part on Discord before buying.',
       a:[['pbE',{y:-40,o:0},0,1000]],chk:[['g15','The power switch latches on and off by itself']],links:[['Runbook, phase 2','runbook.html#p2b1']]},
      {t:'Power switch: supply on the outer spades',d:'It stays on mains and breaks both wires, one pole each: inlet line (AC1) on one pole\'s outer spade, inlet neutral (AC2) on the other\'s.',
       a:[['ac1',{o:1},0,600],['ac2',{o:1},300,600]],map:[['On the wiring map','runs:AC1,AC2',null,'Power switch supply']]},
      {t:'Loads on the center spades',d:'Switched line (AC3) to SSR terminal 1 leaves the line pole\'s center spade. On the neutral pole, the neutral chain (AC8) and the element\'s neutral (AC9) share one blue spade.',
       a:[['ac3',{o:1},0,600],['ac89',{o:1},300,600]],chk:[['e9','Inlet L to J11, switch off'],['e10','Inlet N to J10, switch off']],map:[['On the wiring map','runs:AC3,AC8,AC9',null,'Power switch loads']]},
      {t:'Signal wires on the center spades',d:'Brew, steam and hot water each use one pole, the ground pole: J7 S to steam (LV1), J7 B to brew (LV2) and J5 B15 to hot water (LV3), not A12. The other pole stays free; the LED switch mod puts 5 V on it.',
       a:[['lv1',{o:1},0,600],['lv2',{o:1},250,600],['lv3',{o:1},500,600]],map:[['On the wiring map','runs:LV1,LV2,LV3',null,'Switch signal wires']],links:[['LED switch mod','%%LINK_LED%%']]},
      {t:'Ground chain on the outer spades',d:'J7 GND goes to the outer spade of the same pole on the first switch (LV4), then on to the next two (LV5, LV6), with shared spades or red butt splices. Talon brings it into the lowest switch first and chains up; start at whichever switch is nearest.',
       a:[['lv4',{o:1},0,600],['lvcap',{o:1},300,300],['lv5',{o:1},400,600],['lv6',{o:1},800,600]],map:[['On the wiring map','runs:LV4,LV5,LV6',null,'The switch ground chain']]},
      {t:'Check them',d:'Unplugged, with the J7 and J5 plugs off: each switch on reads close to 0 Ω from its signal pin to J7 GND, and OL when it\'s off. Then each signal pin to the chassis, and J7 GND to inlet L and N, must read OL.',
       a:[['swv',{o:0},0,250],['swm',{o:1},150,300]],chk:[['f1','Brew ON'],['f2','Brew OFF'],['f3','Steam ON'],['f4','Steam OFF'],['f5','Hot water ON'],['f6','Hot water OFF'],['f9','Signal pins to chassis'],['f10','J7 GND to mains']]}
    ]}};
