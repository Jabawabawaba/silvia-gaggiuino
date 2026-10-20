  /* The install, phase by phase. Shared by runbook.tpl.html and the wiring page's back-links (wiring-refs.js).
     Each step: id, t, d, src, link [label, key], map (a wiring-map target, or [[label, target, when, set label], ...];
     see maplink.js), w (which machines; see machine.js). */
  var PHASES=[
    {id:'p0',n:'Phase 0',name:'Before you start',goal:'Decide what is still open, record the stock machine, and get the bench ready.',steps:[
      {id:'p0v',t:'Identify your Silvia',d:'Version, E or M model, and mains voltage change a few of the steps below. The rating plate gives the voltage; the Which Silvia page helps with the version.',src:'Plan',link:['Which Silvia','which']},
      {id:'p0a',t:'Photograph the stock machine',d:'Every side, the backs of the switches, the boiler top and each wire end, before anything is unplugged. These photos are your fallback reference.',src:'Plan'},
      {id:'p0b',t:'Confirm the voltage and note the element power',d:'Read the rating plate, not the listing. The power-on checks use the element wattage to work out its expected resistance.',src:'Plan'},
      {id:'p0c',t:'Settle the open Discord questions',d:'Where the pressure sensor goes (the OPV tee or the 3-way valve\'s bottom port), how long the screen cable needs to be for your mount, and which screen housing fits. They are listed in section 9 of the plan.',src:'Plan'},
      {id:'p0d',t:'Check the cord and outlet',d:'A grounded three-prong cord, and a {outlet} for first power-on.',src:'Official'},
      {id:'p0e',t:'Know where the OPV is set',d:'Gaggiuino wants the OPV at least 1 bar above the highest shot pressure you plan to use. The Test OPV utility in Phase 5 should peak at 10.5 to 13 bar.',src:'Official'},
      {id:'p0e1',t:'The V1 OPV is set with washers',d:'The original Silvia\'s OPV has a single nut, and adding washers can only lower its pressure. If Test OPV reads low, take out any washers a previous owner added; if it still reads low, the spring or the whole OPV needs replacing. V2 and later have a two-nut adjuster.',src:'Wikipedia',w:'ver:V1'},
      {id:'p3a1',t:'Check how the thermocouple mounts on your boiler',d:'Silvia boilers changed design in May 2000. Before you buy a thermocouple, confirm on Discord how one mounts on an earlier boiler.',src:'Wikipedia',w:'early'},
      {id:'p0f',t:'Get the tools on the bench',d:'Multimeter, open-barrel crimper for the boiler spades, insulated crimper for butt splices and forks, strippers, heat gun, self-fusing silicone tape, oil-based marker, Kapton tape and zip ties.',src:'Plan'},
      {id:'p0g',t:'Print the wire labels',d:'About two sheets of Letter or A4. The boiler ends get marker instead of paper.',src:'Plan',link:['Wire labels','labels']}
    ]},
    {id:'p1',n:'Phase 1',name:'Bench test',goal:'Prove the PCB, screen and sensors work on the bench, before anything goes into the machine. Faults are far easier to find here.',steps:[
      {id:'p1a',t:'Lay the electronics out safely',d:'In their housings, or on a non-conductive surface, before any power is connected.',src:'Official'},
      {id:'p1b',t:'Connect the bench set',d:'Thermocouple to J4, pressure sensor to J6, screen to J1, SSR control to J9 (R1 to +, GND to −), and the ToF to J2 if you have one.',src:'Official',map:[['On the wiring map','runs:LV7,LV8,LV9,LV10,LV11',null,'The bench set: SSR control, sensors and screen']]},
      {id:'p1c',t:'Fold the thermocouple wires',d:'Fold each bare wire over before clamping it in J4, and keep the insulation out of the clamp.',src:'Official',map:'run:LV10'},
      {id:'p1d',t:'Check the screen cable by pin, not color',d:'Blue and yellow can be swapped between cable revisions. Don\'t take a pre-made cable apart.',src:'Official',map:'run:LV11'},
      {id:'p1e',t:'Power it from the PCB\'s USB-C',d:'No mains anywhere near it yet.',src:'Official'},
      {id:'p1f',t:'Watch it boot',d:'"Initialization in progress" clears in a few seconds, then "Filling boiler" shows and a red LED under the PCB lights.',src:'Official'},
      {id:'p1g',t:'Warm the thermocouple',d:'Hold it in your hand. The temperature should rise; if it falls, swap the two thermocouple wires.',src:'Official',map:'run:LV10'},
      {id:'p1h',t:'Check the SSR light and pressure',d:'The SSR light is on below the setpoint and flashes near it. Pressure reads 0.0 bar and holds steady. The target is brew temperature, not steam.',src:'Official'},
      {id:'p1j',t:'Join it to your Wi-Fi',d:'Connect to the Gaggiuino AP (its password is the network name with a zero for the "o" and no space), open gaggiuino.local, then Settings, System, Connect, and pick a 2.4 GHz network.',src:'Official'},
      {id:'p1i',t:'Match the firmware versions',d:'Settings, About: the core and screen build numbers match each other and the latest release. If not, update over the air from gaggiuino.local in this order: core, then ui-embedded, then ui-web. A PCB v4 core can also be flashed with the ST-Link, with the PCB\'s USB-C unplugged.',src:'Official'}
    ]},
    {id:'p2',n:'Phase 2',name:'Prep and harness',goal:'Strip the old wiring with a record of where it went, then build the new harness on the bench.',steps:[
      {id:'p2a',t:'Unplug and open the machine',d:'Cord out of the wall and the inlet. Remove the cup tray, top cover and whatever panels you need.',src:'Plan'},
      {id:'p2b',t:'Label each stock wire before you pull it',d:'And note which inlet pin is line and which is neutral; some machines have them swapped.',src:'Official',map:[['Every run on the wiring map','']]},
      {id:'p2b1',t:'E model: take out the energy-saver module',d:'The E\'s power switch is a push button that works with its GICAR energy-saver module, which gives the 30-minute auto-off. The custom harness leaves the module out and needs a power switch that latches on and off by itself, so fit a double-pole rocker like the M model\'s. Confirm the part on Discord before buying.',src:'Auber / Wikipedia',w:'model:E'},
      {id:'p2b2',t:'Find the heating LED\'s wires',d:'From V5 on, the heating light is a round LED beside the power switch instead of the older vertical bar lamp. Trace where its wires go now. In the stock harness it usually runs from the switched line to the element terminal it shares with the steam thermostat. In the new harness it goes across the element instead, AC7 to the heater line after the safety thermostat and AC8 to neutral, so it shows when the SSR is on. If your lamp has more than two wires, or the E\'s energy-saver module drives it, ask on Discord before rewiring it.',src:'Wikipedia / Plan',w:'ver:V5,V6',map:[['The heating light on the wiring map','part:lamp']]},
      {id:'p3a0',t:'Lift the boiler insulation',d:'From V5 on the boiler is insulated. Fold it back to reach the thermostats before you take any off. It goes back on in Phase 3, after the thermocouple.',src:'Wikipedia',w:'ver:V5,V6'},
      {id:'p2c',t:'Remove the brew thermostat',d:'Undo its clamp screws. The thermocouple goes into one of those boiler-top holes later. The 165 °C safety thermostat stays; it has a reset button on top.',src:'Discord / GaggiMate',map:[['The thermocouple on the wiring map','run:LV10']]},
      {id:'p2d',t:'Decide on the steam thermostat',d:'realNiche\'s harness doesn\'t wire it, so it no longer limits anything whether it stays in the boiler or comes out. Either way, set max steam to 150 °C in Phase 6.',src:'Discord'},
      {id:'p2e',t:'Cut and label each run',d:'Start from the cut list, cut a little long, and put both labels on before crimping.',src:'Discord',link:['Cut list','cut'],map:[['Every run on the wiring map','']]},
      {id:'p2f',t:'Crimp the boiler ends with the open-barrel crimper',d:'Uninsulated spades. Each gets self-fusing silicone tape once it\'s fitted and the power-on checks have probed it; check g1 is the reminder.',src:'Official',map:'part:boiler'},
      {id:'p2g',t:'Use two-wire spades where runs share a terminal',d:'Blue, never red, for two 18 AWG wires: SSR terminal 1, the safety thermostat, the power switch neutral spade, the lamp, the pump, the solenoid and the boiler ground.',src:'Discord',map:[['On the wiring map','runs:AC3,AC4,AC6,AC7,AC8,AC9,AC10,AC11,AC12,G1,G2',null,'Runs that share a terminal']]},
      {id:'p2h',t:'Fork spades on all four SSR terminals',d:'Two load, two control.',src:'Discord',map:'part:ssr'},
      {id:'p2i',t:'Pull-test every crimp',d:'A firm tug. Redo any that move.',src:'Official'}
    ]},
    {id:'p3',n:'Phase 3',name:'Mechanical',goal:'Fit the sensors, SSR, PCB and screen. Easier with the boiler lifted.',steps:[
      {id:'p3a',t:'Fit the thermocouple',d:'M3, screwed into one of the boiler-top holes the brew or steam thermostat\'s clamp used. The safety thermostat on the front of the boiler stays where it is. GaggiMate\'s Silvia guide suggests the middle or left-most hole for better readings. Thermal paste rated to 180 °C or more, finger tight only, with the wire free to rotate. Route the lead around the front of the boiler.',src:'Discord / GaggiMate',map:'run:LV10'},
      {id:'p3a2',t:'Refit the boiler insulation',d:'Fold it back over the boiler with the thermocouple lead routed out cleanly, clear of the element terminals.',src:'Plan',w:'ver:V5,V6'},
      {id:'p3b',t:'Fit the pressure sensor',d:'On the tee and elbow you chose in Phase 0. Loctite 55 on the tee and elbow threads rather than PTFE tape, so they can be turned back to line up. The transducer seals on an O-ring, not its thread: press the flat 11 × 6 mm O-ring flush into the elbow\'s 1/4" socket first, because the sensor\'s own base O-ring often can\'t reach the seat, then hand tight plus at most a quarter turn, never more. Keep the sensor off metal; a wrap of foam helps if readings are noisy.',src:'Discord',map:[['Its cable on the wiring map','run:LV9']]},
      {id:'p3c',t:'Mount the SSR on the left wall',d:'One screw, washers and a nut through a drilled hole, or a small bracket, clear of the pump.',src:'Discord',map:'part:ssr'},
      {id:'p3d',t:'Mount the PCB',d:'In its housing, to the right of the 3-way valve or beside the pump. Thin velcro strips hold it.',src:'Discord',map:'part:pcb'},
      {id:'p3e',t:'Fit the screen housing and mount',d:'Pass the cable through the vent inside an unshrunk heat-shrink sleeve so the sharp edge can\'t cut it.',src:'Official',map:'run:LV11'}
    ]},
    {id:'p4',n:'Phase 4',name:'Wire and check',goal:'Fit the harness run by run, then prove it with the meter before the cord goes anywhere near the wall.',steps:[
      {id:'p4a',t:'Fit the mains harness',d:'Run by run, against the wiring reference and realNiche\'s diagram. Inlet to the power switch\'s outer spades, loads from its center spades.',src:'Discord',link:['Wiring reference','wiring'],map:[['Every run on the wiring map','']]},
      {id:'p4b',t:'Fit the low-voltage runs',d:'Brew, steam and hot water each use one pole: signal on its center spade, ground on its outer spade. Hot water goes to J5 B15. The ground chain ends at J7 GND.',src:'Discord',map:[['On the wiring map','runs:LV1,LV2,LV3,LV4,LV5,LV6',null,'Switch signal and ground wires']]},
      {id:'p4c',t:'Route and tie',d:'Mains high, low voltage low and to the right. Nothing but 200 °C silicone wire touches the boiler or steam wand. Talon ran mains, the pump hose and the pump wires through the center slot at the back.',src:'Discord',map:[['Low-voltage wires on the wiring map','layer:lv']]},
      {id:'p4d',t:'Add strain relief',d:'At the SSR and where the screen cable leaves the machine.',src:'Plan',map:'part:ssr'},
      {id:'p4z',t:'Pass the power-on checks',d:'Every section up to Covers on, all unplugged. Have someone else trace the harness against the wiring reference too. The last section waits until the covers are back on in Phase 5.',src:'Plan',link:['Power-on checks','checks'],stop:true}
    ]},
    {id:'p5',n:'Phase 5',name:'First power-on',goal:'Close up and run the last checks, then mains for the first time: fill, prime and pressure-test.',stop:'Don\'t plug in until every check on the power-on checklist passes.',settings:true,steps:[
      {id:'p5a0',t:'Close it up, then the last checks',d:'Top cover and every panel back on, with the screen cable clear of the vent edge. Then run Covers on, the last section of the power-on checks, before anything gets plugged in.',src:'Plan',link:['Power-on checks','checks']},
      {id:'p5a',t:'Tank full, cup under the wand',d:'Portafilter out, drip tray in, and a cup or jug under the steam wand for the first fill. Steam knob closed for now.',src:'Plan'},
      {id:'p5b',t:'Plug in and switch on',d:'Use a {outlet}. Stay by the plug. At any smell, smoke, trip or odd noise, unplug first and investigate after.',src:'Plan'},
      {id:'p5d',t:'Fill the boiler first',d:'Straight after switch-on, before anything else: open the steam knob and turn on Flush. Run it until water comes steadily out of the steam wand, not just the group; that means the boiler is full and the air is out. Close the knob, then flush the group for 5 seconds or more. This is how Rancilio fills a new Silvia, and it keeps the element from heating a dry or half-empty boiler.',src:'Rancilio manual'},
      {id:'p5d2',t:'Watch the temperature rise',d:'Once the boiler is full, the temperature must climb while the SSR light is on. If it falls instead, switch off and unplug: the thermocouple wires are reversed at J4.',src:'Plan',map:'run:LV10'},
      {id:'p5c',t:'Enter the Silvia starting settings',d:'Settings, Boiler: the values in the table above. Tap save once when they are all in.',src:'Discord'},
      {id:'p5e',t:'Run [UT] Tube Fill',d:'From Community Profiles in the web UI. It fills the sensor line so there is no air in it.',src:'Official'},
      {id:'p5f',t:'Run [UT] Test OPV with a blank basket',d:'Peak pressure 10.5 to 13 bar, water moving through the OPV tubing, no leaks.',src:'Official'},
      {id:'p5g',t:'Check for leaks, unplugged',d:'Switch off and unplug first. Lift the top cover and touch a dry paper towel to the tee, elbow, sensor and thermocouple. Close it up and rerun h1 to h4 of the power-on checks before you plug back in, and h5 and h6 as well if the screen cable moved.',src:'Plan',link:['Power-on checks','checks']},
      {id:'p5h',t:'Try each switch',d:'Brew runs the pump, steam switches the target to steam temperature, and hot water starts hot water mode. If only hot water does nothing, recheck f5 and f6: its switch has to land on J5 B15, not A12.',src:'Plan',map:[['On the wiring map','runs:LV1,LV2,LV3,LV4,LV5,LV6',null,'Switch signal and ground wires']]},
      {id:'p5i',t:'Let it heat and settle',d:'Watch the temperature reach the target and hold there. Anything odd: the troubleshooting page goes symptom by symptom.',src:'Plan',link:['Troubleshooting','trouble']}
    ]},
    {id:'p6',n:'Phase 6',name:'Calibrate',goal:'Tune Gaggiuino to this pump and boiler.',steps:[
      {id:'p6a',t:'Run [UT] PZ Cal',d:'Calibrates Pump Zero, the water moved per pump pulse at 0 bar. Follow the profile\'s own instructions.',src:'Official'},
      {id:'p6b',t:'Calibrate hardware scales, if fitted',d:'In the web UI, with a 200 to 400 g object.',src:'Official'},
      {id:'p6c',t:'Set the ToF ranges, if fitted',d:'For the Silvia\'s deeper tank, about 200 mm, then check at known fill levels.',src:'Discord'},
      {id:'p6d',t:'Temperature offset, only against a real measurement',d:'Change it only if you can measure at the group head, for example with a Scace-type device.',src:'Official'},
      {id:'p6e',t:'Set max steam to 150 °C',d:'The steam thermostat is off the heater line now, even if it\'s still on the boiler, so this setting and the 165 °C safety thermostat are the only limits.',src:'Discord'}
    ]},
    {id:'p7',n:'Phase 7',name:'Finish',goal:'Tidy up, write down what you ended with, and add the extras when you want them.',steps:[
      {id:'p7a',t:'Final tidy, unplugged',d:'Zip ties where they\'re needed and Kapton tape on the screen cable. Close it up again and rerun the whole Covers on section, h1 to h6, before you plug back in.',src:'Official',link:['Power-on checks','checks']},
      {id:'p7b',t:'Write down your final settings',d:'In the notes below, along with anything you would do differently.',src:'Plan'},
      {id:'p7c',t:'LED switch mod (optional)',d:'Brings back the brew, steam and hot water switch lights.',src:'Discord',link:['LED switch mod','led']},
      {id:'p7d',t:'Hardware scales or ToF (optional)',d:'Each one is independent of the core install.',src:'Plan'}
    ]}
  ];
