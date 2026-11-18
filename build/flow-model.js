/* What's inside the Silvia's parts, for the electricity flow view on the harness drawing.
   FLOWM.modes -> [[id, label]]; FLOWM.model(runs, mode) -> a FLOW.solve model plus {parts:{loadOrContactId: partId}}. */
var FLOWM=(function(){
  function nt(t){return String(t||'').toLowerCase()}
  var MODES=[['off','Plugged in, switch off'],['on','On, at temperature'],['heat','Heating'],['brew','Brewing'],['steam','Steaming'],['water','Hot water']];
  var STATE={off:{},on:{pw:1},heat:{pw:1,heat:1},brew:{pw:1,heat:1,brew:1,pump:1,valve:1},steam:{pw:1,heat:1,steam:1},water:{pw:1,heat:1,water:1,pump:1}};
  var SIG=['LV9','LV10','LV11'];
  function model(RUNS,mode){
    var st=STATE[mode]||{},T={},runs=[];
    RUNS.forEach(function(r){if(r.sys==='OPT'||SIG.indexOf(r.id)>=0)return;var a=nt(r.frm),b=nt(r.to);T[a]=1;T[b]=1;runs.push({id:r.id,a:a,b:b})});
    if(!T['power inlet, l pin']||!T['power inlet, n pin'])return null;
    var joins=[],closed=[],loads=[],parts={};
    function has(a,b){return T[a]&&T[b]}
    function sw(id,a,b,on,part){if(has(a,b)){parts[id]=part;if(on)closed.push({id:id,a:a,b:b})}}
    function load(id,a,b,r,part){if(has(a,b)){parts[id]=part;loads.push({id:id,a:a,b:b,r:r})}}
    var sh=!!T['shelly, l terminal'];
    /* the power switch: two poles, outer spade in, center spade out */
    sw('powerL','power switch, l pole outer spade','power switch, l pole center spade',st.pw,'pwr');
    sw('powerN','power switch, n pole outer spade','power switch, n pole center spade',st.pw,'pwr');
    if(sh){
      /* the Shelly: always powered from the inlet; its relay follows the power switch on its SW input */
      sw('relay','shelly, l terminal','shelly, o terminal',st.pw,'shelly');
      load('shelly','shelly, l terminal','shelly, n terminal',2000,'shelly');
      load('shellysw','shelly, sw terminal','shelly, n terminal',5000,'shelly');
    }
    /* the SSR's load side closes while the PCB drives its control side; the safety thermostat stays closed unless tripped */
    sw('ssr','ssr load terminal 1','ssr load terminal 2',st.heat,'ssr');
    sw('safety','safety thermostat (165 c), terminal 1','safety thermostat, terminal 2',true,'boiler');
    load('pcb','pcb j11 (ac line)','pcb j10 (ac neutral)',300,'pcb');
    sw('pumpdrv','pcb j11 (ac line)','pcb j12 (pump)',st.pump,'pcb');
    sw('valvedrv','pcb j11 (ac line)','pcb j13 (solenoid)',st.valve,'pcb');
    load('elem','boiler element, terminal 1','boiler element, terminal 2',1,'boiler');
    load('lamp','heating lamp, l spade','heating lamp, n spade',800,'lamp');
    load('pump','pump, coil terminal','pump, thermal-fuse terminal',6,'pump');
    load('valve','solenoid, coil spade','solenoid, n spade',25,'sol');
    var lv=[];
    if(st.pw){
      T['pcb 3v3']=1;T['pcb gnd']=1;
      joins.push(['pcb gnd','pcb j7 gnd']);joins.push(['pcb gnd','pcb j9 gnd']);
      load('pullS','pcb 3v3','pcb j7 s',10,'pcb');load('pullB','pcb 3v3','pcb j7 b',10,'pcb');load('pullW','pcb 3v3','pcb j5 b15',10,'pcb');
      load('ssrled','ssr control +','ssr control −',5,'ssr');
      sw('r1','pcb 3v3','pcb j9 r1',st.heat,'pcb');
      sw('steam','steam switch, ground pole center spade','steam switch, ground pole outer spade',st.steam,'steam');
      sw('brew','brew switch, ground pole center spade','brew switch, ground pole outer spade',st.brew,'brew');
      sw('water','hot water switch, ground pole center spade','hot water switch, ground pole outer spade',st.water,'hw');
      lv.push({from:'pcb 3v3',to:'pcb gnd'});
    }
    return {runs:runs,joins:joins,closed:closed,loads:loads,src:[{from:'power inlet, l pin',to:'power inlet, n pin',mains:true}].concat(lv),parts:parts,passive:{safety:1},state:st,shelly:sh,sig:SIG};
  }
  /* ---- the stock machine, for Out of the box (FAC.runs[id].n = a wire's two terminals) ---- */
  var FMODES=[['off','Plugged in, switch off'],['heatup','On, heating up'],['ready','On, at brew temperature'],['brew','Brewing'],['steamheat','Steam on, heating'],['steamready','At steam temperature'],['water','Hot water']];
  var FSTATE={off:{},heatup:{pw:1,btc:1,stc:1},ready:{pw:1,stc:1},brew:{pw:1,btc:1,stc:1,brew:1},steamheat:{pw:1,steam:1,stc:1},steamready:{pw:1,steam:1},water:{pw:1,btc:1,stc:1,water:1}};
  function factoryModel(FAC,mode){
    if(!FAC||!FAC.runs)return null;
    var st=FSTATE[mode]||{},T={},runs=[];
    Object.keys(FAC.runs).forEach(function(id){var r=FAC.runs[id];if(!r.n||r.sys==='E')return;T[r.n[0]]=1;T[r.n[1]]=1;runs.push({id:id,a:r.n[0],b:r.n[1]})});
    if(!T['inlet:L']||!T['inlet:N'])return null;
    var closed=[],loads=[],parts={};
    function sw(id,a,b,on,part){if(T[a]&&T[b]){parts[id]=part;if(on)closed.push({id:id,a:a,b:b})}}
    function load(id,a,b,r,part){if(T[a]&&T[b]){parts[id]=part;loads.push({id:id,a:a,b:b,r:r})}}
    sw('powerL','pwr:Lin','pwr:Lout',st.pw,'pwr');sw('powerN','pwr:Nin','pwr:Nout',st.pw,'pwr');
    sw('safety','sf:1','sf:2',true,'boiler');
    sw('st','st:a','st:b',st.stc,'st');sw('bt','bt:a','bt:b',st.btc,'bt');
    /* the steam switch bridges the brew thermostat; the brew switch has a line pole (pump and valve) and a neutral pole (the valve's return); hot water feeds the pump only */
    sw('steam','steam:Nin','steam:Nout',st.steam,'steam');
    sw('brewL','brew:Lin','brew:Lout',st.brew,'brew');sw('brewN','brew:Nin','brew:Nout',st.brew,'brew');
    sw('water','hw:Lin','hw:Lout',st.water,'hw');
    load('elem','el:1','el:2',1,'boiler');load('lamp','lamp:L','lamp:N',800,'lamp');
    load('pump','pump:L','pump:N',6,'pump');load('valve','sol:coil','sol:N',25,'sol');
    return {runs:runs,joins:[],closed:closed,loads:loads,src:[{from:'inlet:L',to:'inlet:N',mains:true}],parts:parts,passive:{safety:1,st:1,bt:1},state:st,kind:'factory',sig:[]};
  }
  function pick(RUNS,FAC,box){
    if(box)return factoryModel(FAC,'off')?{kind:'factory',modes:FMODES,model:function(m){return factoryModel(FAC,m)}}:null;
    return model(RUNS,'on')?{kind:'harness',modes:MODES,model:function(m){return model(RUNS,m)}}:null;
  }
  function textFactory(mode){
    var T={
      off:['The cord is in and the power switch is off. This is the stock machine, before the install.',
        'Line and neutral reach the power inlet and the power switch, and stop at its two open poles.',
        'The inlet and the switch\'s input spades stay live until the cord is out, so unplug before you touch anything.'],
      heatup:['The machine is on and cold, so both thermostats are closed and the boiler heats.',
        'Line passes the power switch and the 165 °C safety thermostat into the element, and returns through the steam thermostat and then the brew thermostat to neutral. The thermostats sit in the element\'s return, so the element\'s line side is live whenever the machine is on.',
        'The heating lamp is lit: one side is on line, the other on the element\'s return, which the closed thermostats hold at neutral.'],
      ready:['The boiler is at brew temperature: the brew thermostat has opened (at about 100 °C on most versions).',
        'The heater is off. With the return open, both sides of the heating lamp sit at line voltage, so it goes dark. So does the element\'s far side: treat the whole heater circuit as live.',
        'When the boiler has cooled some way (typically 10 °C or more, not an official figure) the thermostat closes and the heater and the lamp come back on. That swing is why people temperature-surf a stock Silvia.'],
      brew:['The brew switch is on. On a stock machine it switches mains itself.',
        'One pole of the brew switch sends line to the pump and the 3-way valve. Its other pole joins the valve to neutral. The pump returns to neutral on its own wire.',
        'Shown with the heater on, as it soon is once cold water enters the boiler.'],
      steamheat:['The steam switch is on and the boiler is heating toward steam temperature.',
        'The steam switch bridges the brew thermostat, so the heater stays on past brew temperature and the steam thermostat (about 140 °C) alone decides when it stops.',
        'The heating lamp stays lit until the steam thermostat opens.'],
      steamready:['The boiler is at steam temperature: the steam thermostat has opened.',
        'The heater is off and the heating lamp is dark. The heater wires sit at line voltage.',
        'Opening the steam knob cools the boiler; the thermostat closes and the heater returns.'],
      water:['The hot water switch is on.',
        'It sends line to the pump only. The brew switch is off, so the 3-way valve stays shut and the pumped water leaves through the steam wand when the knob is open.',
        'Shown with the heater on.']
    };
    return T[mode]||['','',''];
  }
  function text(m,mode){
    if(m.kind==='factory')return textFactory(mode);
    var sh=m.shelly;
    var T={
      off:['The cord is in and the power switch is off.',
        sh?'Line still reaches the power inlet, the Shelly and the power switch\'s input. The Shelly is powered all the time (that\'s how it hears the app and the switch), with its relay open.':'Line still reaches the power inlet and the power switch\'s input (AC1), and stops at the open switch. The switch opens the neutral too.',
        'Nothing past the '+(sh?'Shelly\'s relay is powered, until the app or a schedule closes the relay, which can happen at any moment whatever the power switch says. The relay breaks line only: with a reversible plug or a miswired outlet the whole machine stays at line voltage while it\'s off.':'switch is powered.')+' The inlet'+(sh?', the Shelly':'')+' and that switch spade stay live until the cord is out, so unplug before you touch anything.'],
      on:['The machine is on and the boiler is at temperature, so the PCB isn\'t asking for heat.',
        (sh?'The power switch tells the Shelly to close its relay, and line runs on':'Line passes the power switch')+' to the SSR\'s input (load terminal 1) and on to the PCB at J11. The PCB runs on J11 and J10 and reads the thermocouple, the pressure sensor and the switches all the time.',
        'The SSR is open, so nothing reaches the element and the heating lamp is dark. Terminal 1 of the SSR is live the whole time the machine is on, and the dimmed heater, pump and valve wires are held off only by electronics (the SSR and the PCB\'s outputs): treat them as live.'],
      heat:['The boiler is below its target, so the PCB drives the SSR.',
        'J9 R1 sends a low-voltage signal through the SSR\'s control side and back on J9 GND. The SSR closes, and line runs through the 165 °C safety thermostat into the element and back on neutral. This is by far the biggest current in the machine.',
        'The heating lamp sits across the element, so it lights whenever the SSR is closed: it shows the PCB\'s heat pulses.'],
      brew:['The brew switch is on.',
        'The switch only joins J7 B to J7 GND: a low-voltage signal the PCB reads. The PCB then powers the 3-way valve from J13 and the pump from J12, changing the pump\'s power to follow the pressure or flow profile. Both return on neutral, the pump through its thermal-fuse terminal.',
        'The PCB keeps pulsing the SSR to hold the temperature while water runs through. No mains passes through the brew switch any more.'],
      steam:['The steam switch is on.',
        'The switch joins J7 S to J7 GND. The PCB reads that and heats to the Steam Temperature setting instead of the brew temperature.',
        'The pump and the valve stay off.'],
      water:['The hot water switch is on.',
        'The switch joins J5 B15 to ground through the switch ground chain. The PCB reads that and runs the pump from J12 with the 3-way valve left closed, so the water leaves through the steam wand when you open the knob. (B15 for hot water comes from the Gaggiuino Discord, not the official docs.)',
        'The heater keeps pulsing to hold the temperature.']
    };
    return T[mode]||['','',''];
  }
  return {modes:MODES,model:model,text:text,pick:pick};
})();
