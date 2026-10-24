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
      {t:'Screw it in, finger tight only',d:'Into one of the boiler-top holes the brew or steam thermostat\'s clamp used. GaggiMate\'s Silvia guide suggests the middle or left-most hole for better readings, which may mean taking the steam thermostat\'s clamp off too. Finger tight only, with the wire free to rotate. No spanner.',
       a:[['safe',{o:0},0,300],['tc',{y:0},0,1500],['nosp',{o:1},1550,350]],loop:['spinF'],chk:[['g8','Thermocouple finger tight, lead free to rotate']]},
      {t:'Route the lead',d:'Around the front of the boiler to the PCB on the right. Low-voltage wires stay low and to the right; mains runs high.',
       a:[['close',{o:0},0,300],['route',{o:1},200,300],['rlead',{d:0},500,1900]],map:'run:LV10'},
      {t:'Refit the insulation',when:'ver:V5,V6',d:'Fold it back over the boiler with the thermocouple lead routed out cleanly, clear of the element terminals.',
       a:[['route',{o:0},0,300],['nosp',{o:0},0,10],['close',{o:1},200,300],['ins',{y:0,o:1},500,900]],links:[['Runbook, phase 3','runbook.html#p3a2']]},
      {t:'Check it, then clamp it in J4',d:['Measure with the wires out of J4: either wire to the boiler reads open (OL), because the probe is ungrounded; the two wires together read a few ohms.','Then fold each bare wire over, keep the insulation out of the clamp, and put + and − where they were on your bench test: there the reading had to rise when you warmed the probe.'],
       a:[['route',{o:0},0,300],['close',{o:0},0,300],['j4v',{o:1},200,300],['ma',{o:1},500,300],['mb',{o:1},900,300],['ma',{o:0},2300,300],['mb',{o:0},2300,300],['tcw',{y:0},2600,900],['t1',{r:360},2600,1000],['t2',{r:360},2750,1000]],
       chk:[['b6','Thermocouple lead to boiler body'],['c7','Thermocouple loop'],['g13','Everything plugged back in']],map:'run:LV10'}
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
      {t:'Tee in at the OPV, elbow into the tee',d:'Juun\'s parts list for this spot: a 1/8" FFM tee and a 1/4"F to 1/8"M elbow. Fit the tee at the OPV and the elbow into the tee, turned so the sensor hangs below it, clear of the steam pipes. The fitting that came out of that port goes into the tee\'s other female port, with Loctite 55 on its thread too.',
       a:[['lcaps',{o:0},0,300],['tee',{y:0},0,900],['asm',{x:0,y:0},800,1400]],chk:[['g11','Plumbing snug and dry']]},
      {t:'Let it hang clear',d:'Keep the sensor off the chassis and anything hot. A wrap of foam helps if its readings are noisy. It\'s rated to 105 °C, and this spot never sees steam temperatures.',
       a:[['chs',{o:1},0,400],['foam',{o:1},400,500]]},
      {t:'Plug it into J6',d:'Its lead plugs into J6: 5V, GND and P, the signal. Extend it with 22 AWG if it\'s short.',
       a:[['j6',{o:1},0,300],['cab',{d:0},300,1500]],map:'run:LV9'},
      {t:'Fill it and test it',d:'At first power-on, once the boiler is filled (the runbook\'s first job after switch-on), [UT] Tube Fill pushes the air out of the sensor\'s line, then [UT] Test OPV with a blank basket should peak at 10.5 to 13 bar, with no leaks. Then switch off, unplug, check each joint with a dry paper towel, close it up and rerun h1 to h4 before you plug back in.',
       a:[['wat',{o:1},0,600],['wat2',{o:1},0,600],['gauge',{o:1},500,300]],count:['pval',0,11.5,' bar',800,1600],
       links:[['Runbook, phase 5','runbook.html#p5d'],['Leak check','runbook.html#p5g']]}
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
      {t:'Insulated spades and forks',d:'For ends away from the boiler: a red spade for one 18 AWG wire, crimped in the red die, and the 22 AWG low-voltage wires land on red spades too. A thin 22 AWG wire gets a longer strip, folded over, so it fills the barrel. Forks go on all four SSR screws. Nylon insulation is rated to only 105 °C, so none goes near the boiler.',
       a:cat(only('wv',3,7),[['isp',{x:0},400,900],['cjT',{o:1},1100,250],['cjB',{o:1},1100,250],['cjT',{y:0},1400,450],['cjB',{y:0},1400,450],['dimp',{o:1},1800,200],['cjT',{y:-18,o:0},2000,400],['cjB',{y:18,o:0},2000,400]]),
       chk:[['g4','SSR: fork spades on all four terminals, screws tight']]},
      {t:'Bare spades at the boiler',d:'Every end on the boiler, the safety thermostat and the solenoid gets an uninsulated spade, crimped with the open-barrel crimper: strip only as much as the front tabs cover, so the copper sits under them and the insulation under the rear ones. Leave them bare for the meter checks, then wrap each in self-fusing silicone tape.',
       a:cat(only('wv',4,7),[['bsp',{x:0},400,900],['ojT',{o:1},1100,250],['ojB',{o:1},1100,250],['ojT',{y:0},1400,450],['ojB',{y:0},1400,450],['wo',{o:0},1700,150],['wc',{o:1},1700,150],['wcap',{o:0},1700,250],['ojT',{y:-18,o:0},1900,400],['ojB',{y:18,o:0},1900,400],['tape',{o:1},2300,200],['tape',{sx:1},2300,900],['tcap',{o:1},3100,300]]),
       chk:[['g1','Boiler and valve spades bare and taped']],map:[['On the wiring map','runs:AC5,AC6,AC7,AC9,AC11,AC12,AC13,G1,G2',null,'Runs with a bare end']]},
      {t:'Two wires on one terminal',d:['Where two 18 AWG runs share a terminal, they go into one spade or fork sized for two: blue, never red, or a bare spade sized for 16 to 14 AWG at the boiler. That\'s SSR terminal 1, the safety thermostat,',['the power switch\'s neutral spade,','!shelly'],['the inlet\'s L and N tabs,','shelly'],'the lamp, the pump, the solenoid and the boiler ground.'],
       a:cat(only('wv',5,7),[['tsp',{x:0},400,900],['fk2',{o:1},1400,200],['fk2',{x:0},1400,900]]),
       chk:[['g2','Doubled terminals sized for two']],map:[['On the wiring map','runs:AC3,AC4,AC6,AC7,AC8,AC9,AC10,AC11,AC12,G1,G2','!shelly','Runs that share a terminal'],['On the wiring map','runs:AC1,SH1,AC2,SH4,SH3,AC4,AC6,AC7,AC8,AC10,AC11,AC12,G1,G2','shelly','Runs that share a terminal']]},
      {t:'Butt splices in the ground chain',d:'The switches\' low-voltage ground chain can join with red butt splices instead of shared spades. Push each wire in to the middle stop and crimp each half in the red die. To carry the chain on, the wire coming in and the wire going on share one side, and a short lead from the other side takes the switch\'s spade.',
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
      {t:'Screw it to the wall',d:'One screw, washers and a nut through a drilled hole, or a small bracket, with its base flat on the metal: while it conducts it turns about 10 W into heat at 120 V, a little less at 230 V.',
       a:[['sv1',{o:0},0,250],['sv2',{o:1},150,300],['scw',{x:0},500,900],['wsh',{o:1},1400,200],['wsh',{x:0},1400,600],['nut',{o:1},1700,200],['nut',{x:0},1700,600]],loop:['nutspin']},
      {t:'Load terminal 1: two wires, one fork',d:[['Switched line from the power switch (AC3)','!shelly'],['Switched line from the Shelly\'s O terminal (SH3)','shelly'],'and the PCB\'s feed (AC4) share load terminal 1, in one fork sized for two.'],
       a:[['sv2',{o:0},0,250],['sv3',{o:1},150,300],['cov',{o:0,y:-24},600,600],['lw1',{o:1},1200,200],['lw1',{y:0},1200,900],['sl1',{r:360},2200,800]],map:[['On the wiring map','runs:AC3,AC4','!shelly','AC3 and AC4'],['On the wiring map','runs:SH3,AC4','shelly','SH3 and AC4']]},
      {t:'Load terminal 2: to the safety thermostat',d:'AC5 runs from load terminal 2 to the 165 °C safety thermostat, then on to the element. Never bypass the thermostat.',
       a:[['lw2',{o:1},0,200],['lw2',{y:0},0,900],['sl2',{r:360},1000,800]],chk:[['e4','SSR terminal 2 to element terminal 1']],map:[['On the wiring map','runs:AC5,AC6',null,'AC5 and AC6']]},
      {t:'Control wires: + and −',d:'J9 R1 goes on + and J9 GND on −: the control side has a polarity.',
       a:[['cwp',{o:1},0,200],['cwm',{o:1},100,200],['cwp',{y:0},0,900],['cwm',{y:0},100,900],['sc1',{r:360},1000,800],['sc2',{r:360},1100,800]],chk:[['f7','J9 R1 pin to SSR +'],['f8','J9 GND pin to SSR −']],map:[['On the wiring map','runs:LV7,LV8',null,'SSR control wires']]},
      {t:'Check it',d:'Forks on all four terminals, screws tight, no stray strands, strain relief on its wires, and its terminal cover closed: treat the load screws as live whenever it\'s plugged in. On the bench test its light came on below the setpoint and flashed near it.',
       a:[['cov',{o:1,y:0},0,600]],loop:['blink'],chk:[['g4','SSR: fork spades on all four terminals, screws tight']],links:[['Runbook, phase 4','runbook.html#p4d']]}
    ]}};

  G.sw={svg:'pg-sw',
    base:{swv:{o:1},swm:{o:0},pbE:{y:0,o:1},pbEm:{o:1},nemp:{o:0},ac1:{o:0},ac2:{o:0},ac3:{o:0},ac89:{o:0},ac1t:{o:1},ac2t:{o:1},ac3t:{o:1},lv1:{o:0},lv2:{o:0},lv3:{o:0},lv4:{o:0},lv5:{o:0},lv6:{o:0},lvcap:{o:0},pbEk:{o:0}},
    steps:{all:[
      {t:'E model: fit a latching rocker',when:'model:E;!shelly',d:'The E\'s power switch is a push button that only works with its energy-saver module. Take the module out, as the harness leaves it out, and fit a double-pole rocker that latches, like the M\'s, before wiring AC1, AC2, AC3, AC8 and AC9. Confirm the part on Discord before buying.',
       a:[['pbE',{y:-40,o:0},0,1000]],chk:[['g15','The power switch latches on and off by itself']],links:[['Runbook, phase 2','runbook.html#p2b1']]},
      {t:'E model: keep the push button for the Shelly',when:'model:E;shelly',d:'With the Shelly, the push button can stay: it feeds the Shelly\'s SW, set to Button, and each press switches the machine. That\'s this site\'s suggestion; gblur\'s drawing doesn\'t show which switch he kept. The energy-saver module still comes out. The button carries mains now, so keep it only if the rating on its body says 250 V; if not, fit a latching double-pole rocker like the M\'s and set the Shelly to Switch. Wire the two spades it closes while pressed: under 1 Ω pressed, OL let go.',
       a:[['pbEm',{o:0},0,600],['pbE',{y:-40,o:0},700,1000],['pbEk',{o:1},1300,400]],chk:[['g16','Your power switch\'s Shelly input mode']],links:[['Runbook, phase 2','runbook.html#p2s1']]},
      {t:'Power switch: supply on the outer spades',when:'!shelly',d:'It stays on mains and breaks both wires, one pole each: inlet line (AC1) on one pole\'s outer spade, inlet neutral (AC2) on the other\'s.',
       a:[['ac1',{o:1},0,600],['ac2',{o:1},300,600]],map:[['On the wiring map','runs:AC1,AC2',null,'Power switch supply']]},
      {t:'Loads on the center spades',when:'!shelly',d:'Switched line (AC3) to SSR terminal 1 leaves the line pole\'s center spade. On the neutral pole, the neutral chain (AC8) and the element\'s neutral (AC9) share one blue spade.',
       a:[['ac3',{o:1},0,600],['ac89',{o:1},300,600]],chk:[['e9','Inlet L to J11, switch off'],['e10','Inlet N to J10, switch off']],map:[['On the wiring map','runs:AC3,AC8,AC9',null,'Power switch loads']]},
      {t:'Power switch, with the Shelly: line in on the outer spade',when:'shelly',d:'It still carries mains, but now it only tells the Shelly to switch: inlet line (AC1) goes on the L pole\'s outer spade. The N pole stays empty, because the Shelly\'s relay breaks line only: inlet neutral (AC2) runs to a splice beside the switch instead, with the neutral chain (AC8) and the element\'s neutral (AC9) on its other side.',
       a:[['ac1',{o:1},0,600],['nemp',{o:1},300,400]],map:[['On the wiring map','runs:AC1,AC2,AC8,AC9',null,'AC1, and the neutral splice']]},
      {t:'The center spade to the Shelly\'s SW',when:'shelly',d:'SH2 leaves the L pole\'s center spade, where AC3 used to, for the Shelly\'s SW input. With the switch on, it carries mains to SW and the Shelly switches the machine on.',
       a:[['ac3',{o:1},0,600]],chk:[['e14','Inlet L to Shelly SW, switch on'],['e15','Inlet L to Shelly SW, switch off']],map:[['On the wiring map','run:SH2',null,'SH2']]},
      {t:'Signal wires on the center spades',d:'Brew, steam and hot water each use one pole, the ground pole: J7 S to steam (LV1), J7 B to brew (LV2) and J5 B15 to hot water (LV3), not A12. The other pole stays free; the LED switch mod puts 5 V on it.',
       a:[['lv1',{o:1},0,600],['lv2',{o:1},250,600],['lv3',{o:1},500,600]],map:[['On the wiring map','runs:LV1,LV2,LV3',null,'Switch signal wires']],links:[['LED switch mod','%%LINK_LED%%']]},
      {t:'Ground chain on the outer spades',d:'J7 GND goes to the outer spade of the same pole on the first switch (LV4), then on to the next two (LV5, LV6), with shared spades or red butt splices. Talon brings it into the lowest switch first and chains up; start at whichever switch is nearest.',
       a:[['lv4',{o:1},0,600],['lvcap',{o:1},300,300],['lv5',{o:1},400,600],['lv6',{o:1},800,600]],map:[['On the wiring map','runs:LV4,LV5,LV6',null,'The switch ground chain']]},
      {t:'Check them',d:'Unplugged, with the J7 and J5 plugs off: each switch on reads close to 0 Ω from its signal pin to J7 GND, and OL when it\'s off. Then each signal pin to the chassis must read OL. Last, with the power switch and all three switches on, J7 GND to inlet L and to inlet N must read OL.',
       a:[['swv',{o:0},0,250],['swm',{o:1},150,300]],chk:[['f1','Brew ON'],['f2','Brew OFF'],['f3','Steam ON'],['f4','Steam OFF'],['f5','Hot water ON'],['f6','Hot water OFF'],['f9','Signal pins to chassis'],['f10','J7 GND to mains']]}
    ]}};
  /* ---------------- the screen, the ToFnLED, firmware and the hardware scales (official guides: Interface: Screen,
     Accessory: ToFnLED, MCU Flashing, Accessory: Hardware Scales; read October 2026) ---------------- */
  var SP={ov:'https://github.com/user-attachments/assets/888b31f2-d0e5-48d8-af31-7133bd122f70',fMag:'https://github.com/user-attachments/assets/ead5c319-6b55-48c7-8b6b-0f29e8354e0f',fGap:'https://github.com/user-attachments/assets/588d2c45-c75d-4f03-a2a2-f3a7fb753912',fPlug:'https://github.com/user-attachments/assets/028e9195-825e-48e4-b37b-14276b37e91b',
    uLid:'https://github.com/user-attachments/assets/99be6c31-095a-4fbf-ba57-a0f48e4b8bd4',uIns:'https://github.com/user-attachments/assets/6b5498d2-14ce-473d-86b5-116dd9999caa',uVent:'https://github.com/user-attachments/assets/8c1e694a-89a4-4cce-9641-f92db90aab87',uPlug:'https://github.com/user-attachments/assets/99454a58-6f10-4422-9010-ad2a61bfa8cc',
    rVent:'https://github.com/user-attachments/assets/1ecfdfb7-cd2e-49c0-895f-76fc201f7e7c',rPlug:'https://github.com/user-attachments/assets/8724315e-99c0-4e59-8242-e98b0531ee6c',posts:'https://github.com/user-attachments/assets/2d059c58-a688-409c-9bd9-183443854bc7',cover:'https://github.com/user-attachments/assets/fc37622f-ee69-4ec3-af85-874e8c00d273',
    fClip:'https://github.com/user-attachments/assets/343d150b-3509-481a-80a5-b4e811b0ea3c',fOn:'https://github.com/user-attachments/assets/2a1c65f7-1ec7-46a0-bfa5-59710317190d',fTop:'https://github.com/user-attachments/assets/44cd4587-2e95-4c72-bc0c-595ed9d91755',
    plate:'https://github.com/user-attachments/assets/d9653f52-dd7f-4593-b4bb-dfeb9fba9cd2',swiv:'https://github.com/user-attachments/assets/9bc40925-76a9-4868-bed5-2a554826f1b7',zip:'https://github.com/user-attachments/assets/bc3a08cb-6f48-489a-9d2c-367b53e5f1c9',uOn:'https://github.com/user-attachments/assets/8f151c1e-93fa-4e46-81d0-cb45a3dc9d63',
    rPl:'https://github.com/user-attachments/assets/69b796ea-27e1-4fb2-a55e-b474187ac989',rOn1:'https://github.com/user-attachments/assets/d8067907-8ccb-4b46-b1b2-455515eea056',rOn2:'https://github.com/user-attachments/assets/e498133e-9f96-4136-bac3-5a3531091e48',
    bench:'https://github.com/user-attachments/assets/5ea67541-0cf4-4064-9f87-19ad900bef8b',
    tMag:'https://user-images.githubusercontent.com/117388662/256454738-f7717135-2389-451c-b2c9-9439c2159eee.png',tOn:'https://user-images.githubusercontent.com/117388662/256464601-0d54fd7a-0f65-495e-8169-83fe9bd14a53.png',tFilm:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/007150d8-7a48-4bce-859a-5bb903692cf6',
    tTape:'https://user-images.githubusercontent.com/117388662/265826223-1f28003f-5d1a-4046-ab25-c19f5b2376f6.png',tCone:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/b59cf346-f689-4e5c-b32d-8c6abc9468b5',tCtl:'https://user-images.githubusercontent.com/117388662/274979976-ae9f02ab-8c61-438e-81ea-adfabdff183b.png',
    tT:'https://user-images.githubusercontent.com/117388662/256653622-6f84ea94-ee0c-4dbe-aae4-88dc015f8d03.png',tV:'https://user-images.githubusercontent.com/117388662/256655744-be96feb6-40d0-4f12-91cb-79502fb5027e.png',labels:'https://gaggiuino.github.io/schematics/stm32_pcbv3_1_board_labels.png',
    ledset:'https://gaggiuino.github.io/manual/gen3/mbed/003_005_settings_led.png',
    oAp:'https://github.com/user-attachments/assets/af24bb4e-1608-4b45-b78d-ccb7d15bec18',oSet:'https://github.com/user-attachments/assets/0c7114ec-6e85-4894-bfc8-d779a8de38b5',oUp:'https://github.com/user-attachments/assets/f70a4726-daa2-459b-aacc-4167444edf87',oWait:'https://github.com/user-attachments/assets/ae9f802d-d9a1-4b26-a504-dbecb29cdab7',oDone:'https://github.com/user-attachments/assets/faba0d3e-15fd-4324-a28f-f170c0950757',
    about:'https://gaggiuino.github.io/manual/gen3/mbed/003_006_settings_about.png',wFile:'https://github.com/user-attachments/assets/fee8093d-cabe-4158-bfdf-40ce2cc233a3',wPcb:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/58377fd5-49f2-47f2-98d6-7c800eb6e712',wBp:'https://user-images.githubusercontent.com/117388662/262874364-c44f2eea-6a64-4731-adb8-a0c1a16089d6.png',wGo:'https://github.com/user-attachments/assets/13df020c-9989-4ae9-ac7b-abaf5ce19d6c',
    sAdh:'https://user-images.githubusercontent.com/117388662/256964354-bca6c07c-4a85-4b3a-b499-7e2b3032d524.png',sFit:'https://user-images.githubusercontent.com/117388662/256964444-025e6320-b85b-433e-99ba-829ea5907b91.png',sChk2:'https://user-images.githubusercontent.com/117388662/256964641-3acbc0d1-9491-4017-852f-5f5b65086ada.png',sChkD:'https://user-images.githubusercontent.com/117388662/256964653-13ea4859-a5e9-4153-9c0a-796def530f7f.png',sChkF:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/3c661e2a-6888-4adb-9d01-0e69c97f2c83',
    sCut2:'https://user-images.githubusercontent.com/117388662/256964791-0b282d78-d4fb-4158-b2d2-5aa005f3e443.png',sCutD:'https://user-images.githubusercontent.com/117388662/256964801-62946762-2394-4d70-b601-50f07f1cff0c.png',sJp11:'https://user-images.githubusercontent.com/117388662/256964853-8b8c8c03-a83c-412a-989c-739abae6975f.png',
    sStr2:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/58e57bcd-a5f6-4057-839d-e0c8096b1ae9',sStrD:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/2e791cc1-157b-4c02-8e98-080b46ae99a9',sDone2:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/5d5141a2-c5ab-4270-a4cd-cc8d902273d4',sDoneD:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/92927dc9-2266-4f6e-9814-4574f6d78684',sDoneF:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/5c6976a2-43b7-4867-9a70-1909f626b2b3',
    sMag:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/170b36e7-43d6-47af-8bd2-ca8c6598fa56',sMag2:'https://user-images.githubusercontent.com/117388662/257019766-5bf71df5-d363-4e2c-8d49-f4f217209356.png',sTrayCut:'https://user-images.githubusercontent.com/117388662/257088268-c1ab40c7-4c69-4b48-a10c-3b890e8cc97b.png',sTrayAd:'https://user-images.githubusercontent.com/117388662/267475732-14dbea6c-ff72-45ff-959c-9a5ef89ce215.png',sSpacer:'https://user-images.githubusercontent.com/117388662/257087801-911f627f-ac5b-4011-802c-8ee73655e872.png',
    sXH:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/8e9a1b4d-c7b5-40e6-a3a2-208fceedeef2',sRoute:'https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/3a2590cf-f572-4f2c-93c0-45c246a23b9e',sPar:'https://user-images.githubusercontent.com/117388662/257089574-2004216e-7231-4c33-b8eb-ff90b93f4dfa.png',sSnap:'https://user-images.githubusercontent.com/117388662/257089656-57ecccf3-1225-4ff7-a387-01ace2999414.png',sClr:'https://user-images.githubusercontent.com/117388662/257089747-74fd447d-a299-4d65-a408-b325f09ec326.png',
    sPlates:'https://github.com/user-attachments/assets/018a0a44-ac59-4ced-9f2d-6c56f6de97ef',s2500:'https://github.com/user-attachments/assets/6487f076-fbb9-44a5-bfa1-153c4965f1c4',sSign:'https://github.com/user-attachments/assets/706d466d-bffa-43f5-b1f4-ac8d25a39c4b',sDoneT:'https://user-images.githubusercontent.com/117388662/257110758-a6eae8c8-c12e-41eb-bfa3-586ae03dd88a.png'};


  /* the screen housing on a Silvia: the official housing; mounts are drawn for Gaggias, so the Silvia notes come from
     the Discord thread and supplier listings (docs-silvia-specifics.md) */
  G.scr={svg:'pg-scr',
    base:{hb:{o:1},hbl:{o:1},gap:{o:0},scr:{y:-46,o:0},scab:{d:1},hf:{o:0,s:.94},topf:{o:0},tape1:{o:0},mtF:{o:0,y:20},mgs:{o:0,y:-16},glue:{o:0},onF:{o:0},rcF:{d:1},tapeF:{o:0}},
    steps:{all:[
      {t:'A longer cable',d:'DIY-EFI\'s screen comes with a 600 mm cable and Peak Coffee lists 450 mm. An older Silvia wiring diagram (marked untested) lists about 650 mm for a front mount, and Talon found the funnel mount needs a longer cable than that, so plan for more. It\'s a 4-pin JST-PH cable: wire it by pin, not by color.',
       a:[['scab',{d:0},0,1200]]},
      {t:'Wire it first',d:'Plug the cable into the PCB first, as on the bench test, before it goes through anything: the two small screen connectors slip through the housing gaps, the other end often can\'t.',
       a:[['gap',{o:1},0,300]],links:[['Bench test','https://gaggiuino.github.io/#/guides-stm32/pcb-guide?id=pre-install-test']]},
      {t:'Cable through the back, then plug in',d:'Feed the cable through the mount (if it has a hole for it) and the housing back, then plug it into the screen pin by pin. Keep the wires off the big components; Kapton tape can hold them.',
       a:[['gap',{o:1},0,300],['scr',{o:1},200,300]],ph:SP.fPlug},
      {t:'Screen onto the upper posts first',d:'They have a retention feature. Check the wires sit below the surface of the housing and the screen PCB, and aren\'t pinched under the connectors.',
       a:[['gap',{o:0},0,200],['scr',{y:0},0,1000]],ph:SP.posts},
      {t:'Front cover: top edge first',d:'Start with the top side, the one with the thinner bezel, check no wires are in the way, then snap the lower side on. To take it off again, use the fingernail slots.',
       a:[['hbl',{o:0},0,300],['hf',{o:1},0,300],['topf',{o:1},0,300],['hf',{s:1},300,700],['topf',{o:0},1200,300]],ph:SP.cover},
      {t:'The mount',d:'The official housing (Printables 356026) has three mounts, all designed for Gaggias: front, funnel and rear. Talon used it on the funnel mount; a 2025 V6 build used the same housing, but which mount isn\'t recorded. The front mount holds by magnets, so check one sticks where it will go, or use 80 °C double-sided tape. The older Silvia Nextion enclosures don\'t fit a Gen 3 screen.',
       a:[['mtF',{o:1,y:0},0,500],['mtF',{y:-120,o:0},900,1000]],ph:SP.ov},
      {t:'Cable into the machine, sleeved',d:'Pass the cable through the vent inside a piece of heat-shrink, left unshrunk, so the sharp edge can\'t cut it. Tape it down with Kapton or another high-temperature tape.',
       a:[['hb',{o:0},0,400],['hf',{o:0},0,400],['scr',{o:0},0,400],['scab',{o:0},0,400],['onF',{o:1},400,500],['rcF',{d:0},600,1200],['tapeF',{o:1},1700,300]],map:'run:LV11'},
      {t:'Covers on, then the checks',d:'With the top cover and panels back on and their screws tight, the covers-on checks include the screen cable: its GND pin must read open to the inlet earth.',
       a:[],chk:[['h1','Top cover and every panel back on, screws tight'],['h5','Inlet earth pin to the screen cable\'s GND pin']]}
    ]}};

  /* the ToFnLED on a Silvia: the official board and housing; the tank is deeper and covered (Discord) */
  G.tof={svg:'pg-tof',
    base:{tofh:{o:0,y:-30},tmag:{o:0,y:-10},tglue:{o:0},film:{o:0},filmL:{o:0},qc:{d:1},pcbT:{o:1},cone:{o:0},glow:{o:0},mtape:{o:0},tT:{o:0},tub:{o:1},fwc:{o:0},lvl:{o:0},cpk:{o:0},wat:{o:1},lidT:{o:1}},
    steps:{all:[
      {t:'Magnets into the housing',d:'Scratch up the magnet pockets with a craft blade, add a drop of cyanoacrylate and set each magnet flat. The magnets need steel to hold to: Talon stuck an adhesive-backed metal disk under the screen\'s funnel mount. Double-sided tape rated for 80 °C works too, but makes the board hard to unplug when you take the mount off to pull the tank.',
       a:[['tofh',{o:1,y:0},0,600],['tglue',{o:1},500,300],['tmag',{o:1},700,200],['tmag',{y:0},700,600],['tglue',{o:0},1400,300]],ph:SP.tMag},
      {t:'Cable into J2',d:'The Qwiic cable (JST-SH, 4-pin, 250 mm or more) plugs into J2, the Qwiic socket on the back of the PCB.',
       a:[['pcbT',{s:1.06},0,300],['pcbT',{s:1},300,300]],ph:SP.labels},
      {t:'Over the tank, clear of the hoses',d:'Run the cable to the tank with the other low-voltage wires, plug it into the board, put the board in its housing and mount it above the tank with the sensor clear of the silicone hoses. cjs\'s tank mount, which uses a T-fitting, is another way to hold it.',
       a:[['qc',{d:0},0,1600],['film',{o:1},1200,300]],ph:SP.tOn},
      {t:'Peel off the sensor\'s film',d:'The sensor may still have a clear protective film on it. It spoils the readings, so take it off.',
       a:[['filmL',{o:1},0,300],['film',{y:30,o:0},300,900],['filmL',{o:0},1400,300]],ph:SP.tFilm},
      {t:'Core firmware to match its LED',d:'Flash the core file whose name matches the board\'s LED controller: pca or ncp. Most are PCA; the official photo shows how to tell. With no LED board, either file works.',
       a:[['fwc',{o:1},0,400]],ph:SP.tCtl,links:[['Firmware updates','#fw']]},
      {t:'Set the ranges for the deeper tank',d:'The Silvia\'s tank is about 200 mm deep, so the Gaggia ranges read wrong. On Gen 3, the Discord thread says to set them in the ToFnLED settings page (the official manual doesn\'t describe it), then check the reading at a few known fill levels.',
       a:[['fwc',{o:0},0,300],['lvl',{o:1},0,400]]},
      {t:'The light, under the lid',d:'Its RGB light is hidden under the Silvia\'s tank lid, so on a Silvia it\'s really a level sensor. Some builders use a standalone ToF board instead, in Oskar_diy\'s enclosure (four 5 × 2 mm magnets); J2 supplies 3.3 V, so check the board suits it.',
       a:[['glow',{o:1},0,800]]},
      {t:'Check the level',d:'It shows on the home screen in percent. The sensor sees a cone, not a line: keep the hoses out of it. If reflections confuse it as the level drops, a matte piece of tape below the sensor helps.',
       a:[['cone',{o:1},0,500],['mtape',{o:1},600,400]],ph:[SP.tCone,SP.tTape]},
      {t:'Close it up',d:'Top cover and panels back on, and the covers-on checks passed, before it goes back on mains.',a:[],chk:[['h1','Top cover and every panel back on, screws tight'],['h2','Inlet earth pin to the top cover and each panel']]}
    ]}};
  /* firmware updates: over Wi-Fi (OTA) or by wire */
  G.fw={vars:[{k:'ota',l:'Over Wi-Fi'},{k:'wired',l:'By wire (ST-Link)'}],def:function(){return 'ota'},svgs:{ota:'pg-fwo',wired:'pg-fww'},
    base:{ota:{about:{o:1},blk:{o:0},okv:{o:0},ap:{o:0},url:{o:0},otap:{o:0},selC:{o:0},selL:{o:0},btns:{o:0},bar:{sx:0},done:{o:0},rel:{o:1},f1:{o:.35},f2:{o:.35},f3:{o:.35}},
          wired:{cube:{o:1},tick:{o:0},bconn:{o:1},bprog:{o:1},okp:{o:0},dbg:{o:0,x:-30},usb:{d:1},w3v:{d:1},wio:{d:1},wck:{d:1},wgd:{d:1},nousb:{o:0},plug:{o:1},plx:{o:0}}},
    steps:{
      ota:[
        {t:'Check what you\'re on',d:'Settings, About: the core, screen (Mbed) and web builds. All three should match each other and the latest release.',
         a:[['about',{s:1.04},0,300],['about',{s:1},300,300]],ph:SP.about},
        {t:'Get the three files',d:'From the official latest release: the core file for PCB v4 (performance, pcb, then pca or ncp for your LED controller; without a ToFnLED either works), ui-embedded.bin and ui-web.bin (a headless build uses ui-headless.bin instead). Core over Wi-Fi needs an STM32U585 (PCB v4, or a U585 core board): on a BlackPill, flash the core by wire and do just the two screen files here. If your build is older than 2025-02-16, flash breaking update 616ea70 first.',
         a:[['f1',{o:1},0,300],['f2',{o:1},200,300],['f3',{o:1},400,300]],links:[['Releases (latest)','https://github.com/Zer0-bit/gaggiuino/releases/latest'],['Breaking update 616ea70','https://github.com/Zer0-bit/gaggiuino/releases/tag/dev-616ea70']]},
        {t:'Connect and open gaggiuino.local',d:'From a device on the same network, or join the Gaggiuino AP: its password is the network name with a zero for the o and the space taken out.',
         a:[['ap',{o:1},0,400],['url',{o:1},300,400]],loop:['wifi'],ph:SP.oAp},
        {t:'Upload the core file',d:'Settings, OTA Update: choose Core Upgrade Package, SELECT FILE, pick the core file, then UPLOAD.',
         a:[['otap',{o:1},0,300],['selC',{o:1},300,200],['btns',{o:1},400,300],['f1',{x:-60,o:0},700,700],['bar',{sx:1},900,1600]],loop:['wifi'],ph:[SP.oSet,SP.oUp]},
        {t:'Wait it out',d:'The screen stays black while it uploads, flashes and reboots. Don\'t switch off: a failed or cancelled update falls back to the old firmware on its own.',
         a:[['blk',{o:1},0,400],['blk',{o:0},2400,400],['done',{o:1},2600,300]],ph:SP.oWait},
        {t:'Then the two screen files',d:'START OVER, choose LCD Upgrade Package, and upload ui-embedded.bin; then START OVER again for ui-web.bin. Refresh the browser after ui-web. Core first, then ui-embedded, then ui-web, unless the release notes say otherwise.',
         a:[['done',{o:0},0,200],['bar',{sx:0},0,10],['selC',{o:0},0,200],['selL',{o:1},200,200],['f2',{x:-60,o:0},400,600],['bar',{sx:1},700,900],['f3',{x:-60,o:0},1700,600],['done',{o:1},2400,300]],loop:['wifi'],ph:SP.oDone},
        {t:'Check they match',d:'Back in About, all three builds should now match. If updates fail while it\'s on your home network, disconnect Gaggiuino from the network and join its AP directly. If core updates were flashed out of order, the board may need flashing by wire.',
         a:[['ap',{o:0},0,300],['okv',{o:1},300,400]],ph:SP.about}
      ],
      wired:[
        {t:'When you need it',d:'PCB v4 updates over Wi-Fi; a wire is the fallback if a core update goes wrong. PCB v3.1 and BlackPill boards are always flashed this way. It flashes the core only; the screen files go over Wi-Fi.',a:[]},
        {t:'STM32CubeProgrammer and the core file',d:'Install STM32CubeProgrammer from ST (it asks for an email sign-up) and download the core file for your board from the latest release.',
         a:[['cube',{s:1.03},0,300],['cube',{s:1},300,300]],links:[['Releases (latest)','https://github.com/Zer0-bit/gaggiuino/releases/latest']]},
        {t:'Machine unplugged, USB-C out',d:'Unplug the machine, and leave the PCB\'s own USB-C port empty. On PCB v3.1 and BlackPill boards this matters: unless the PA15 fix is confirmed, the heaters can come on while the debugger is connected. PCB v4 doesn\'t have that problem.',
         a:[['plx',{o:1},0,400],['nousb',{o:1},400,400]],links:[['PA15 check and fix (official)','https://gaggiuino.github.io/#/guides-upgrade/pcb-upgrade?id=pa15-pulldown-rework']]},
        {t:'Debugger to J27',d:'A WeAct Mini Debugger or an ST-Link, on four wires to the top row of J27: 3.3 V, SWDIO, SWCLK and GND. The bottom row (NRST, RX, TX, BOOT0) isn\'t used.',
         a:[['dbg',{o:1,x:0},0,500],['w3v',{d:0},400,600],['wio',{d:0},550,600],['wck',{d:0},700,600],['wgd',{d:0},850,600]],ph:[SP.labels,SP.wPcb,SP.wBp]},
        {t:'Pick the file, verify on',d:'In Erasing & programming, browse to the core file. Verify programming on; Skip flash erase before programming off.',
         a:[['tick',{o:1},0,300]],ph:SP.wFile},
        {t:'Connect, then Start Programming',d:'Plug the debugger into the computer, click Connect, then Start Programming.',
         a:[['usb',{d:0},0,800],['bconn',{s:.94},800,200],['bconn',{s:1},1000,200],['bprog',{s:.94},1400,200],['bprog',{s:1},1600,200],['okp',{o:1},2200,400]],ph:SP.wGo},
        {t:'Disconnect, then the screen files',d:'Acknowledge the messages, click Disconnect and unplug the debugger. Reaching J27 on a Silvia means opening it: top cover and panels back on, and pass the covers-on checks, before it goes back on mains. Then, if they\'re behind, update ui-embedded.bin and ui-web.bin over Wi-Fi (skip the core upload there), and check About.',
         a:[['usb',{d:1},0,600],['okp',{o:0},600,300]],links:[['Over Wi-Fi: the screen files','#fw/ota/6']],chk:[['h1','Top cover and every panel back on, screws tight'],['h2','Inlet earth pin to the top cover and each panel'],['h5','Inlet earth pin to the screen cable\'s GND pin'],['h6','Inlet L, then inlet N to the same GND pin']]}
      ]
    }};


  /* the hardware scales on a Silvia: a Silvia load cell mount and board enclosure (Discord), then the official steps */
  G.scl={svg:'pg-scl',
    base:{hL:{o:0},hR:{o:0},lcL:{o:0,y:-20},lcR:{o:0,y:-20},adhL:{o:0},adhR:{o:0},scL:{o:0},scR:{o:0},lpL:{o:0},lpR:{o:0},mgL:{o:0},mgR:{o:0},ctr:{o:0},hx:{o:0},strip:{o:0},res:{o:0},wL:{d:1},wR:{d:1},cut:{o:0},cov:{o:0},j8:{d:1},j8l:{o:0},tray:{o:0},clr:{o:0},cal:{o:0},rd:{o:0}},
    steps:{all:[
      {t:'A Silvia load cell mount',d:'The official scales are designed for Gaggia drip trays, and the official guide calls them an advanced build that needs accurate prints. On the Discord, the latest recommended Silvia mount is Joscha\'s "beefy" remix (Printables 1277828): a stiffer bridge, magnet pockets and wider tray paddles, for 1 kg load cells 13 × 13 × 80 mm.',
       a:[['hL',{o:1},0,400],['hR',{o:1},0,400]]},
      {t:'Trim the load cells\' adhesive',d:'There\'s often glue where it shouldn\'t be. With a sharp razor blade, cut it away from the screw holes without nicking a wire or the sensing area.',
       a:[['lcL',{o:1,y:0},0,500],['lcR',{o:1,y:0},100,500],['adhL',{o:1},600,300],['adhR',{o:1},600,300],['adhL',{o:0},1300,500],['adhR',{o:0},1300,500]],ph:SP.sAdh},
      {t:'Load cells onto the mount',d:'Its parts list calls for M4 × 10 mm countersunk and M5 × 10 mm low-profile screws; follow the model\'s notes for which goes where. Make sure the load plates clear the mount all the way round.',
       a:[['scL',{o:1},0,300],['scR',{o:1},0,300],['lpL',{o:1},400,400],['lpR',{o:1},400,400]]},
      {t:'The boards and their enclosure',d:'Two HX711 boards and a 1 kΩ resistor, or Vas\'s dual-scales board, in Sacatab\'s or Waffe\'s enclosure or a plastic project box. Talon\'s sits inside at the bottom center, between the pressure sensor and the PCB box, on thin velcro.',
       a:[['lpL',{o:0},0,300],['lpR',{o:0},0,300],['ctr',{o:1},0,400],['hx',{o:1},300,400]]},
      {t:'Cut the wires, then the stripboard',d:'Cut the load cell wires with extra for strain relief and keep the offcuts. Solder them and five right-angle header pins to a small piece of stripboard, plus the 1 kΩ SCK pull-up if you use two HX711 boards. On the dual-scales board, also cut jumper JP11. The official wire order changed on 2024-05-05 to match the PCB connector.',
       a:[['cut',{o:1},0,400],['cut',{o:0},1200,300],['strip',{o:1},1200,400],['res',{o:1},1500,300]],ph:[SP.sCut2,SP.sJp11,SP.sStr2,SP.sStrD]},
      {t:'Solder outside the enclosure',d:'Take the boards out to solder them, then put everything back. The load cell wire colors are printed on the back of the board. On the older green HX711 boards, a 30 AWG jumper from E- to GND steadies the readings.',
       a:[['wL',{d:0},0,900],['wR',{d:0},200,900],['cov',{o:1},1200,400]],ph:[SP.sDone2,SP.sDoneD]},
      {t:'Magnets',d:'Four 5 × 2 mm magnets in the mount\'s pockets, glued with gap-filling cyanoacrylate, flush or just below the surface.',
       a:[['lpL',{o:1},0,300],['lpR',{o:1},0,300],['mgL',{o:1},300,400],['mgR',{o:1},300,400]],ph:SP.sMag},
      {t:'Cable to J8',d:'26 AWG silicone wire with a 5-pin JST-XH at the scales end and a JST-PH at J8. Leave slack so the scales can come out, sleeve it where it passes metal edges, and keep it away from mains wires. Check the pin order against J8 (D2, 5V, GND, CLK, D1) before powering up: a V6 build on Discord had its scales fail with 5V and CLK swapped.',
       a:[['j8',{d:0},0,1400],['j8l',{o:1},1200,400]],links:[['J8 on the board labels','https://gaggiuino.github.io/schematics/stm32_pcbv3_1_board_labels.png']]},
      {t:'Check the fit',d:'The official fit check, applied to a Silvia: only the load plates should carry the tray, so it mustn\'t rest on the machine or touch its sides.',
       a:[['tray',{o:1},0,500]]},
      {t:'Calibrate: find each cell',d:'In the web UI, Settings, Scales: enable hardware scales, turn the other scale types off, and open Calibrate. With the load plates off, set both factors to 2500, press each cell gently and note its sign; set factor 2 to -2500 and press again. The cell whose sign stayed the same is LC1. Adjust signs so both read positive.',
       a:[['tray',{o:0},0,300],['lpL',{o:0},0,300],['lpR',{o:0},0,300],['rd',{o:1},300,400]],ph:[SP.s2500,SP.sSign]},
      {t:'Calibrate: weigh something known',d:'Weigh a flat-bottomed 200 to 400 g object (a tamper works) on an accurate scale. For each cell: the calibration load plate on it, Tare, object on the plate, then new factor = reported weight × old factor ÷ actual weight. Enter it; it should then read within 0.2 g, or repeat. Do both cells, then Save.',
       a:[['cal',{o:1},0,500]],count:['rdt',0,312.4,' g',500,1400]},
      {t:'Plates and tray back on',d:'Each screw back where it came from, then the tray.',
       a:[['cal',{o:0},0,300],['rd',{o:0},0,300],['lpL',{o:1},300,400],['lpR',{o:1},300,400],['tray',{o:1},700,500]]},
      {t:'Close it up',d:'If you opened the machine for the boards and the cable, top cover and panels back on, and pass the covers-on checks, before it goes back on mains.',a:[],chk:[['h1','Top cover and every panel back on, screws tight'],['h2','Inlet earth pin to the top cover and each panel']]}
    ]}};

  /* ---------------- the Shelly smart relay (an unofficial add-on, shown once it's chosen in Your Silvia): from gblur's
     Silvia V6 E drawing, with the Shelly on its own leads from the inlet; Shelly's own docs for the part and its settings ---------------- */
  G.shl={svg:'pg-shl',
    base:{sc1:{o:1},sc2:{o:0},sc3:{o:0},sc4:{o:0},sc5:{o:0},k1o:{o:0},k1sw:{o:0},k1ln:{o:0},k1mini:{o:0},encl:{o:0},grom:{o:0},shl:{o:0},nsp:{o:0},hot:{o:0},
      wl:{d:1},wlt:{o:0},wn:{d:1},wnt:{o:0},wsw:{d:1},wswt:{o:0},wo:{d:1},wot:{o:0},ac1:{d:1},ac1t:{o:0},ac2:{d:1},ac2t:{o:0},ac89:{d:1},ac89t:{o:0},g1:{d:1},g1t:{o:0},
      strip:{o:0},fer:{o:0},jaw:{o:0,s:1.3},blk:{o:0},tq:{o:0},tug:{o:0},st1:{o:0},st2:{o:0},st3:{o:0},st4:{o:0}},
    steps:{all:[
      {t:'Pick the Shelly',d:['A Shelly 1PM Gen4: it switches 16 A and reports the power the machine draws. In North America, the UL-certified version, rated 15 A. Not a Mini: those switch 8 A.',['A 120 V Silvia\'s element alone draws about that.','volts:120'],
          'Its relay switches line out on O; SW is its switch input; L and N power it. gblur\'s drawing shows a Shelly 1, whose relay is a dry contact, so his drawing also runs the inlet\'s line to its I terminal. This site draws the 1PM, which joins L to its relay inside.'],
       a:[['k1o',{o:1},200,300],['k1sw',{o:1},500,300],['k1ln',{o:1},800,300],['k1mini',{o:1},1200,400]]},
      {t:'Plan where it goes',d:'Shelly rates it for 40 °C around it at most, and the inside of the case likely runs hotter than that once the boiler is hot. So it goes outside, in a closed plastic enclosure made for mains wiring (a metal one would need earthing), screwed to the back panel over a hole. Its four wires go straight from the case into it through a grommet, so they never run in the open, since they\'re single-insulated mains wires, and the metal edge can\'t cut them. Shelly also warns that a confined space can warm it past its limit, so you\'ll watch its temperature in the app at first power-on.',
       a:[['sc1',{o:0},0,400],['sc2',{o:1},300,500],['encl',{o:1},800,500],['grom',{o:1},1100,400],['shl',{o:1},1300,400]],chk:[['g17','The Shelly sits where it stays under 40 °C'],['g19','Wires into its enclosure protected and held']],map:[['The Shelly on the wiring map','part:shelly']]},
      {t:'Line: inlet L to the Shelly\'s L',d:'SH1 from the inlet\'s L tab to the Shelly\'s L, in a two-wire spade on the tab with AC1. AC1 still runs to the power switch\'s L pole, outer spade, but now it only carries the switch\'s signal to the Shelly.',
       a:[['wl',{d:0},0,1100],['wlt',{o:1},900,300],['ac1',{d:0},1100,600],['ac1t',{o:1},1600,300]],map:[['SH1 and AC1 on the wiring map','runs:SH1,AC1']]},
      {t:'Neutral: inlet N to the Shelly\'s N, and a splice',d:'SH4 from the inlet\'s N tab to the Shelly\'s N, in a two-wire spade with AC2, so the machine\'s neutral never runs through the Shelly: Shelly\'s docs warn that using its L and N terminals as a bridge doubles the current through them. AC2 now ends in a BN2 butt splice by the power switch, its stripped end folded back to fill the barrel, with AC8 and AC9 on the other side, and the switch\'s N pole stays empty. G1 stays on the earth tab.',
       a:[['wn',{d:0},0,1200],['wnt',{o:1},1000,300],['ac2',{d:0},1200,700],['ac2t',{o:1},1800,300],['nsp',{o:1},1800,300],['ac89',{d:0},2000,400],['ac89t',{o:1},2300,300],['g1',{d:0},2500,300],['g1t',{o:1},2700,300]],chk:[['g20','Neutral splice crimped and covered']],map:[['SH4 and the neutral splice on the wiring map','runs:SH4,AC2,AC8,AC9']]},
      {t:'Switch: the L pole\'s center spade to SW',d:['SH2 from the power switch\'s L pole, center spade, where AC3 used to be, to the Shelly\'s SW. With the switch on, it carries mains to SW.',['On the E\'s push button, use the two spades it closes while pressed.','model:E'],'Everything shaded is live whenever the cord is in, even with the machine off: the inlet, the Shelly, the power switch and the wires between them. The rest of the machine stays joined to neutral, and the app or a schedule can switch it on, so unplug before you open anything.'],
       a:[['wsw',{d:0},0,1500],['wswt',{o:1},1300,300],['hot',{o:1},1800,500]],map:[['SH2 on the wiring map','run:SH2']]},
      {t:'Output: O to SSR terminal 1',d:'SH3 from the Shelly\'s O to SSR terminal 1, in the two-wire fork with AC4, where AC3 used to bring line from the power switch. While the Shelly is off, the SSR, the PCB and the heating lamp get nothing.',
       a:[['hot',{o:0},0,300],['wo',{d:0},200,1300],['wot',{o:1},1300,300]],map:[['SH3 on the wiring map','runs:SH3,AC4']]},
      {t:'Ferrules in the screw terminals',d:'Strip 6 mm, which suits both of Shelly\'s figures (6 to 7 mm for the 1PM Gen4, 5 to 6 mm for the Plus 1PM UL), and crimp a ferrule with a 6 mm sleeve on each wire end that goes into the Shelly, so no fine strand escapes the clamp. Push it fully in, tighten the screw (Shelly gives 0.4 Nm at most) and tug. One wire each in L, N, SW and O: the 1PM Gen4\'s spare L and N terminals stay empty, and nothing else goes on its terminals.',
       a:[['sc2',{o:0},0,400],['sc3',{o:1},300,400],['strip',{o:1},700,400],['fer',{o:1},1300,500],['jaw',{o:1},1900,300],['jaw',{s:1},2200,400],['blk',{o:1},2800,500],['tq',{o:1},3300,300],['tug',{o:1},3700,300]],chk:[['g18','Only SH1 to SH4 on the Shelly, each in a ferrule']]},
      {t:'Check it with the meter',d:'Unplugged, the power-on checks add the Shelly\'s own: e11 to e18 for its wires and the splice, d8 to d10 for shorts on the switched side, then f11 and h7. Inlet L to J11 no longer reads low: the relay is open while the Shelly has no power, so the switched side is checked from its O terminal.',
       a:[['sc3',{o:0},0,300],['sc4',{o:1},200,400]],chk:[['e11','Inlet L ↔ Shelly L terminal'],['e12','Shelly O terminal ↔ PCB J11 spade'],['e13','Inlet L ↔ PCB J11 spade, through the open relay'],['d10','Shelly O terminal ↔ inlet N']]},
      {t:'Set it up at first power-on',d:'Plug in with the power switch off: the machine stays dark. In the Shelly app, join it to your Wi-Fi and update it. Input mode Switch, output type Toggle Switch, for a rocker that stays put, like the M\'s; Button for the E\'s push button. Not Edge Switch: with it, flipping the rocker to off can turn the machine on. Action on power on: Turn OFF, so a power cut never starts it by itself. Leave Auto on off, and Auto recovery off under the output protections, so nothing switches it back on by itself. Auto off, if you want it, turns it off a set time after it comes on, used or not. The app shows the Shelly\'s own internal temperature: if it keeps climbing through a long heat-up and a steaming session, or the Shelly switches itself off, move it somewhere cooler.',
       a:[['sc4',{o:0},0,300],['sc5',{o:1},200,400],['st1',{o:1},600,300],['st2',{o:1},900,300],['st3',{o:1},1200,300],['st4',{o:1},1500,300]],links:[['Runbook, phase 5','runbook.html#p5s2']]}
    ]}};
