/* The runbook's step-by-step text, keyed by step id (runbook-phases.js has the steps themselves). Only the runbook loads it.
     Fields: need (what to have at hand), warn (a careful note, shown before the steps), how (the numbered steps),
     ok (how to know it worked), pics ([label, url, when] official photos), links ([label, key or url, when] pages on this site).
     A how item is a string, [text, when] (shown only when it applies), or {t: text or segments, w: when}. Text and segments
     follow machine.js (txt), plus the runbook's own scr:p4|s3|hl. In the text, **x** is bold and [label](key#hash) links to a
     page on this site (a key in the runbook's L) or a full address.
     There's no official Silvia guide: the official Gaggiuino pages (read November 2026) are written for Gaggias. The bench test,
     firmware, Wi-Fi, utility profiles and settings steps follow them; the machine steps follow realNiche's harness, the Discord
     Silvia threads and this site's part guides, and the text says where an instruction is this site's own advice. */
  var PIC={
    labels:"https://gaggiuino.github.io/schematics/stm32_pcbv3_1_board_labels.png",
    lvGCP:"https://gaggiuino.github.io/schematics/stm32-lv/GCP_g3_5_PCBv4_LV.png",
    bench:"https://github.com/user-attachments/assets/5ea67541-0cf4-4064-9f87-19ad900bef8b",
    tcFold:"https://github.com/user-attachments/assets/3cac0e03-e850-4f7b-844e-4c19971a8382",
    xf:"https://github.com/GAGGIUINO/gaggiuino.github.io/assets/117388662/78d801f3-9c4f-4c17-8105-74e32711af09",
    foam:"https://user-images.githubusercontent.com/117388662/239457402-b58dfe55-6572-45b7-8960-2a4d1f9d5753.png",
    ap:"https://github.com/user-attachments/assets/af24bb4e-1608-4b45-b78d-ccb7d15bec18",
    about:"https://gaggiuino.github.io/manual/gen3/mbed/003_006_settings_about.png",
    ota1:"https://github.com/user-attachments/assets/0c7114ec-6e85-4894-bfc8-d779a8de38b5",
    ota2:"https://github.com/user-attachments/assets/f70a4726-daa2-459b-aacc-4167444edf87",
    ota3:"https://github.com/user-attachments/assets/faba0d3e-15fd-4324-a28f-f170c0950757",
    cmp:"https://gaggiuino.github.io/media/screen_compare_g_3.webp",
    m35:"https://gaggiuino.github.io/media/screen_mounts_g_3_5.webp",
    m3:"https://gaggiuino.github.io/media/screen_mounts_g_3.webp",
    h35:"https://gaggiuino.github.io/media/screen_g_3_5_housing_assembly.webp",
    plug3:"https://github.com/user-attachments/assets/028e9195-825e-48e4-b37b-14276b37e91b",
    posts3:"https://github.com/user-attachments/assets/2d059c58-a688-409c-9bd9-183443854bc7",
    cover3:"https://github.com/user-attachments/assets/fc37622f-ee69-4ec3-af85-874e8c00d273",
    hlSeat:"https://github.com/user-attachments/assets/5170f195-5679-455e-b4b4-b5720fe875c0",
    hlOn:"https://github.com/user-attachments/assets/54b5debf-994f-40e8-8ae9-ceb904187f19"
  };
  var HOW={
    /* ---------------- Phase 0 ---------------- */
    p0v:{
      need:"The machine, and a phone to photograph its rating plate.",
      how:[
        "Empty the water tank and the drip tray, then find the machine's rating plate (look on the back and underneath) and photograph it.",
        "Note the mains voltage and the power printed on it.",
        "Work out the version, V1 to V6, and from V5 whether it's the E or the M, with the [Which Silvia](which) page.",
        "Tap **Your Silvia** in the top bar and set the version, model and voltage. From then on this page, the wiring reference and the checks show only what applies to your machine.",
        "This site covers the single-boiler Silvia only, not the dual-boiler Silvia Pro or Pro X."
      ],
      ok:"The top bar names your Silvia."
    },
    p0a:{
      warn:"Unplug the machine and let it cool before any cover comes off.",
      how:[
        "Photograph the outside from every side now.",
        "The inside shots need the top cover off: take them the first time you open it (Phase 2), before a single wire comes off.",
        "Inside, photograph the backs of all the switches, the boiler top, the safety thermostat on the front of the boiler, the pump, the 3-way valve and every wire end.",
        "Get close enough that each wire's color and the terminal it's on can be read.",
        "Keep them in one album: they're how you put anything back."
      ]
    },
    p0b:{
      how:[
        "Read the voltage and the power from the rating plate, not from a shop listing.",
        "Write both in this phase's notes.",
        "The power-on checks work out the element's expected resistance from them (check c1, which also says what to use if the element has its own rating stamped on it)."
      ]
    },
    p0c:{
      how:[
        "**Where the pressure sensor goes:** on a tee at the OPV, which this site has a parts list and steps for, or the 3-way valve's bottom port, as Talon's build does.",
        "**How long the screen cable must be:** DIY-EFI's screen comes with a 600 mm cable and Peak Coffee lists 450 mm. An older, untested Silvia diagram lists about 650 mm for a front mount, and the funnel mount needs more.",
        "**Which screen housing and mount:** the official Gen 3 housing has been used on a Silvia with the funnel mount; its three mounts are all designed for Gaggias.",
        "Read the open questions on the [Silvia specifics](silvia-specifics.html) page, and ask in your help thread (later in this phase) if one is unclear for your version."
      ]
    },
    p0d:{
      how:[
        "The cord must have three pins, the third being earth, with no cuts or scorch marks on the cord or the plug.",
        "Plan where first power-on happens: a {outlet}.",
        "No protected outlet near the bench? A plug-in {gfci} adapter does the same job (this site's suggestion)."
      ]
    },
    p0e:{
      how:[
        "Gaggiuino needs the OPV to open at least 1 bar above the highest shot pressure you'll use (the official OPV note, written for Gaggias).",
        "You'll test it in Phase 5 with a blank basket: [UT] Test OPV must peak between 10.5 and 13 bar.",
        "Whether a stock Silvia OPV passes is still an open question on the Discord: if yours reads low or high, post the reading in your help thread before you adjust anything."
      ]
    },
    p0e1:{
      how:[
        "The V1's OPV has a single nut, and washers under it can only lower its pressure.",
        "If Test OPV reads low in Phase 5, take out any washers a previous owner added, then test again.",
        "Still low: the spring, or the whole OPV, needs replacing. Ask in your help thread which part fits."
      ]
    },
    p3a1:{
      how:[
        "Photograph your boiler top.",
        "Before you order a thermocouple, ask in your help thread how one mounts on a pre-May 2000 boiler, with those photos."
      ]
    },
    p0f:{
      how:[
        "**A multimeter** that reads resistance (Ω) and beeps for continuity: the power-on checks need one, because they prove the wiring is safe before the first plug-in.",
        "**Crimpers:** an open-barrel crimper for the bare spades at the boiler, and a ratcheting crimper for insulated terminals (its dies are color-coded red and blue, like the spades), forks and butt splices.",
        "**Wire strippers** and side cutters.",
        "**Screwdrivers:** Phillips and a small flat one, plus a tiny flat one for the PCB's thermocouple clamp.",
        "**Spanners** for the pressure sensor's tee and elbow.",
        "**Heat:** a heat gun, for heat shrink.",
        "**Consumables:** self-fusing silicone tape, an oil-based marker, Kapton tape, zip ties, thermal paste rated for 180 °C or more, Loctite 55 thread cord, a towel and a few cups for screws.",
        ["**With the Shelly:** a ferrule crimper and ferrules with 6 mm sleeves.","shelly"],
        "**For first power-on:** a {outlet}."
      ],
      ok:"Everything is on the bench, and the meter beeps when you touch its probes together.",
      links:[["Part guide: making the wires","gwire"]]
    },
    p0k:{
      how:[
        "**Electronics:** PCB v4 and the 4.3\" screen (or the headless board) from an approved supplier, with the screen cable, the SSR-40DA, the pressure sensor (0 to 1.2 MPa, G1/4) and an **M3** ungrounded K-type thermocouple. The official parts list's M4 thermocouple is for Gaggias.",
        "**Wire and terminals:** 18 AWG silicone wire rated to 200 °C for mains (a Silvia harness takes about a meter more than a Gaggia one), 22 AWG for low voltage, bare 6.3 mm spades for the boiler, insulated 6.3 mm spades (red for one 18 AWG wire, blue for two), fork spades for the SSR, red butt splices, and self-fusing silicone tape.",
        "**Pressure sensor plumbing (OPV tee):** a 1/8\" FFM tee, a 1/4\"F to 1/8\"M elbow, the flat white O-ring (about 11 mm across) and Loctite 55.",
        "**SSR mounting:** a screw, washers and a nut, or a small bracket.",
        "**Screen cable** long enough for your mount (the open questions step above).",
        "**Prints:** a PCB housing (Printables 894339, or any box), and the screen housing and mount.",
        ["**Silvia E:** a latching double-pole rocker for the power switch. Confirm the part on Discord before buying.","model:E;!shelly"],
        ["**With the Shelly:** the Shelly 1PM Gen4, its enclosure, ferrules and a BN2 butt splice.","shelly"],
        "**Optional:** a microSD card (1 to 8 GB, FAT32) for shot history, a ToF board, the parts for hardware scales.",
        "Skip a Gaggia kit's pressure tap block, M4 thermocouple and pre-cut mains cables: they don't fit a Silvia."
      ],
      ok:"Everything is in hand, or ordered with a date. The parts tracker keeps the list."
    },
    p0h:{
      how:[
        "Join the Gaggiuino Discord: [discord.gg/gaggiuino](https://discord.gg/gaggiuino).",
        "Open **one** thread in #help-silvia, titled [username][machine][control system] and a short title, the way gblur's is: [gblur][Silvia V6 E][PCB v4].",
        "Ask every question in that one thread, with photos, and rename the short title as your question changes.",
        "There's no official Silvia guide and no official build video. This site, realNiche's wiring diagram and the Silvia threads are the references."
      ]
    },
    p0g:{
      how:[
        "Open [Wire labels](labels) with Your Silvia set and download its PDF.",
        "Print it at 100% (actual size), not fit to page: the bar at the top right of each sheet should measure 50 mm.",
        "Cut the labels out. Each one wraps around its wire about 3 cm from the end, the two halves folded together, text outward. Seal plain paper with clear tape.",
        "Ends that sit at the boiler get their name written on the silicone jacket with an oil-based marker instead: paper and tape don't last there."
      ]
    },
    p0s:{links:[["Part guide: Shelly","gshl"]]},
    /* ---------------- Phase 1 ---------------- */
    p1a:{
      how:[
        "Clear a table and lay down something that doesn't conduct: a wooden board, cardboard or a silicone mat. No screws, wire offcuts or tools underneath.",
        "Put the PCB in its housing if you have it.",
        ["Rest the screen face up on a soft cloth.","scr:p4,s3"],
        "This phase runs on USB power only. Nothing here touches mains."
      ],
      warn:"Keep the boards off anything metal while they're powered: a stray screw under the PCB can short it."
    },
    p1b:{
      need:["The PCB, the thermocouple, the pressure sensor, the SSR and its control wires,",["the screen and its cable,","scr:p4,s3"],["the headless board and its cable,","scr:hl"],"the ToF board if you have one, and a tiny flat screwdriver."],
      how:[
        "Find the sockets on the PCB; each is labeled on the board: J1 (screen, 4 pins), J4 (thermocouple, two small screw clamps marked − and +), J6 (pressure sensor, 3 pins), J9 (SSR, 3 pins), J7 (switches), J5 (extra inputs, for the hot water switch later) and J2 (ToF, a tiny socket on the back). The four large tabs, J10 to J13, are for mains: leave them empty.",
        "**Thermocouple into J4:** the next step shows how to clamp its two bare wires.",
        "**Pressure sensor into J6:** push its 3-pin plug in. These plugs only fit one way round: if one won't go, turn it over rather than force it.",
        ["**Screen into J1:** the cable's larger plug goes in J1. Its small plug goes into the 4-pin socket on the back of the screen marked 5V, IO28, IO27, GND.","scr:p4"],
        ["**Screen into J1:** the cable's larger plug goes in J1. Its two small plugs go into the screen's two sockets on its back; the next-but-one step checks which wire lands where.","scr:s3"],
        ["**Headless board into J1:** its cable plugs into J1 at one end and the board's 4-pin socket (5V, TX, RX, GND) at the other.","scr:hl"],
        "**SSR control into J9:** J9's R1 wire goes under the SSR's + screw and J9's GND wire under its − screw. Those two are the DC control side, usually marked 3 (+) and 4 (−). The other two screws, the AC load side (usually 1 and 2), are for mains later: leave them empty.",
        "**ToF into J2,** if you have one: its Qwiic cable plugs into J2 on the back of the PCB.",
        "Leave J7 and J5 empty: the switch wires come in Phase 4."
      ],
      ok:"Every plug pushed fully home, J10 to J13 empty, and nothing touching metal.",
      pics:[["Bench test set-up","BENCH"],["PCB socket labels","LABELS"],["Low-voltage drawing (a Gaggia's, but the PCB and screen pins are the same)","LVGCP"]]
    },
    p1c:{
      how:[
        "Loosen both of J4's screws a couple of turns with the tiny flat screwdriver.",
        "Fold each bare thermocouple wire back on itself, so the bare end is doubled.",
        "Push one wire into + and the other into −. Only bare metal goes into the clamp: keep the insulation out. Lead colors vary between makers: the warm-hand test in a few steps tells you if they're swapped.",
        "Tighten each screw gently, then tug each wire: it mustn't move."
      ],
      ok:"Both wires held firmly, no insulation under the clamps, and the two wires not touching each other.",
      pics:[["Folded thermocouple wires","TCFOLD"]]
    },
    p1d:{
      how:[
        "A pre-made screen cable stays as it is. Don't take it apart or move its pins to make the colors match.",
        "On the PCB, J1's pins are marked GND, TX, RX and 5V.",
        ["On the Gen 3.5 screen, the socket is marked 5V, IO28, IO27, GND. Follow the 5V wire and the GND wire from J1: each must land on the pin with the same name. The other two wires are the data pair.","scr:p4"],
        ["On the Gen 3 screen, J1's 5V and GND go to the socket marked GND, RXD, TXD, 5V, and the data pair (TX and RX) to IO18 and IO17 on the socket marked UART1. Follow the 5V and GND wires: each must land on the pin with the same name.","scr:s3"],
        ["On the headless board, the socket is marked 5V, TX, RX, GND. Follow the 5V and GND wires from J1: each must land on the pin with the same name.","scr:hl"],
        "If the colors don't match the official drawing, that's normal: blue and yellow have been swapped between cable batches. Where each wire lands is what counts."
      ],
      ok:"5V reaches 5V and GND reaches GND, end to end."
    },
    p1e:{
      how:[
        "Plug a USB-C cable into the PCB's own USB-C port, not one on the screen.",
        "Power it from a USB charger or a computer.",
        "That's the only power in this phase: the mains tabs stay empty."
      ]
    },
    p1f:{
      how:[
        ["The screen lights and shows \"Initialization in progress\" for a few seconds, then it clears.","scr:p4,s3"],
        ["Headless: you'll see these messages in the web UI once you've joined its Wi-Fi (two steps down). Come back and tick this one then.","scr:hl"],
        "A few seconds after boot, \"Filling boiler\" shows, and a red LED on the underside of the PCB lights at the same moment. On the bench that's expected: there's no boiler to fill.",
        "Stuck on \"Initialization in progress\"? Recheck J1 pin by pin (previous step). If the ToF is turned on in the software but not plugged in, it won't start either. Then see the firmware step at the end of this phase: the core and screen firmware may be from different releases."
      ],
      ok:"Initialization clears, Filling boiler shows, and the red LED under the PCB is on.",
      links:[["Troubleshooting","trouble"]]
    },
    p1g:{
      how:[
        "Find the temperature on the home screen: it's the boiler temperature, in °C.",
        "Hold the thermocouple's metal tip between your fingers for 20 seconds or so.",
        "The reading should climb a few degrees. If it falls instead, the two wires are swapped: loosen J4's screws, swap them, retighten and try again.",
        "Write down which lead color ended up on + in the notes at the bottom of this phase. It goes back the same way in the machine."
      ],
      ok:"Warm the tip and the number goes up."
    },
    p1h:{
      how:[
        "Look at the small LED on the SSR. With the probe at room temperature, far below the brew target, it's on: Gaggiuino is calling for heat. Near the target it flashes.",
        "Pressure reads 0.0 bar and doesn't wander.",
        "The target temperature shown is the brew temperature, not the steam temperature.",
        "If you built hardware scales, you can test them now too, and even calibrate them (Phase 6 shows how)."
      ],
      ok:"SSR LED on, pressure a steady 0.0 bar, brew temperature as the target.",
      links:[["Troubleshooting","trouble"]]
    },
    p1j:{
      need:"A phone or laptop with Wi-Fi, and your home Wi-Fi password.",
      how:[
        "On the phone or laptop, open the Wi-Fi list and join **Gaggiuino AP**. At first it may show up as ESP_ followed by letters and numbers instead.",
        "Its password is **Gaggiuin0AP**: the network's name with a zero in place of the o, and no space.",
        "Open a browser and go to http://gaggiuino.local. That's the web UI, with the same controls as the screen.",
        "To put Gaggiuino on your home network: Settings in the web UI (the gear icon on the screen), then System, then Connect. Pick your network's 2.4 GHz band and enter its password.",
        "If your password has a character the screen's keyboard lacks, do the step above from the web UI instead.",
        "Once it's on your network, open http://gaggiuino.local from any device on that network. If a phone won't open it, try a laptop: some phones can't open .local addresses (this site's tip, not the official guide's)."
      ],
      ok:"The web UI opens at gaggiuino.local. On your home network, it also gets the right time for shot history.",
      pics:[["The Gaggiuino AP in a Wi-Fi list","AP"]]
    },
    p1i:{
      how:[
        "Settings, About (the gear icon on the screen, or Settings in the web UI). Note the build numbers for Core, Mbed (the screen or headless board) and Web.",
        "Compare them with each other and with the latest release on the [Gaggiuino releases page](https://github.com/Zer0-bit/gaggiuino/releases/latest). If all three match the release, you're done.",
        "If your About page has an **Update All** button, you can use it instead, with Gaggiuino on your home Wi-Fi: the official firmware reset page uses it to bring every part up to date. Older firmware may not have it.",
        "Otherwise update by hand: from the latest release, download the core file for PCB v4 (performance, pcb, then pca or ncp to match a ToF board's LED chip; without one either works) and the two screen files (ui-embedded and ui-web; headless uses ui-headless and ui-web).",
        "In the web UI, Settings, OTA Update: choose **Core Upgrade Package**, SELECT FILE, pick the core file, then UPLOAD. The screen goes black while it flashes and reboots.",
        "Then START OVER, choose **LCD Upgrade Package** and upload ui-embedded (or ui-headless); START OVER again for ui-web. The order is core, then ui-embedded, then ui-web, unless the release notes say otherwise. Refresh the browser after ui-web.",
        "Back in About, all three build numbers should now match.",
        "Bench test done: unplug the USB cable, then unplug each part from the PCB and loosen J4's screws to free the thermocouple. Each part goes into the machine on its own, and everything plugs back into the PCB in Phase 4."
      ],
      warn:"Don't power off during an update. A failed or cancelled one falls back to the old firmware by itself. If updates keep failing on your home network, join Gaggiuino AP directly and try again.",
      pics:[["About page","ABOUT"],["OTA Update section","OTA1"],["Choosing the package","OTA2"],["START OVER","OTA3"]]
    },
    /* ---------------- Phase 2 ---------------- */
    p2a:{
      need:"Screwdrivers, a towel and a few cups for the screws.",
      warn:"Unplug first, every time the machine is open. Let it cool if it's been on: the boiler stays hot for a long time.",
      how:[
        "Switch off, pull the plug from the wall, then pull the cord out of the machine's inlet too.",
        "Empty and take out the water tank and the drip tray.",
        "Lift off the cup tray on top.",
        "Undo the screws that hold the top cover and lift it off. Take off only the panels you need to reach the switches, the boiler top and the pump.",
        "Keep each cover's or panel's screws in their own cup, and photograph where each came from.",
        "Now take the inside photos from Phase 0, before a single wire comes off."
      ]
    },
    p2b:{
      need:"The printed labels or an oil-based marker, and your photos.",
      how:[
        "Work one wire at a time: label it with the part and terminal it's on (for example: brew switch, center spade), then pull it off by its connector, never by the wire.",
        "At the inlet, note which pin is line, which is neutral and which is earth: on some machines line and neutral are swapped.",
        "As each wire comes off, tick it against your photos.",
        "The stock harness comes out completely: the new harness replaces every wire. Keep the old one in a bag, labels on, in case you ever go back to stock.",
        "Leave the parts in place: the switches, the lamp, the pump and its thermal fuse, the 3-way valve, the 165 °C safety thermostat and the element all stay. The brew thermostat comes out a few steps on."
      ],
      ok:"Every stock wire labeled and out, and the parts still in place."
    },
    p2b1:{
      how:[
        "Label every wire on the GICAR energy-saver module, then unplug them and take the module out: the custom harness leaves it out.",
        "The E's push-button power switch only works with that module, so it comes out too.",
        "Fit a double-pole rocker that latches on and off by itself, like the M's, in its place. Confirm the part on Discord before buying.",
        "Check g15 later confirms it latches on its own."
      ]
    },
    p2b2:{
      how:[
        "Find the round heating LED beside the power switch, and follow its wires back.",
        "Note in this phase's notes where each one lands now. Stock, it usually runs from the switched line to the element terminal it shares with the steam thermostat.",
        "In the new harness it goes across the element instead: AC7 to the heater line after the safety thermostat, AC8 to neutral, so it lights while the SSR heats.",
        "More than two wires, or driven by the E's energy-saver module: ask in your help thread before rewiring it."
      ]
    },
    p3a0:{
      how:[
        "Machine unplugged and cold.",
        "Fold the insulation back from the boiler top, far enough to reach both thermostats and their clamps.",
        "Fold, don't tear: it goes back on in Phase 3, once the thermocouple is in."
      ]
    },
    p2c:{
      need:"A screwdriver to fit the thermostat's clamp screws.",
      how:[
        "Find the brew thermostat on the boiler top. Bimetal thermostats usually have their rating stamped on the body: the brew one opens at 100 °C (110 °C on machines made before mid-2007) and the steam one at 140 °C. If yours aren't marked, check your photos against the wiring, or ask in your help thread with a photo.",
        "Its two leads are labeled and off already (previous steps). If not, label them and pull them straight off its spades.",
        "Undo its clamp screws and lift the brew thermostat off the boiler top. Keep the screws.",
        "The clamp's threaded holes in the boiler top are where the thermocouple goes, in Phase 3.",
        "Leave the 165 °C safety thermostat on the front of the boiler alone: it stays in the heater line, with its reset button."
      ],
      ok:"The brew thermostat is out, the safety thermostat untouched."
    },
    p2d:{
      how:[
        "realNiche's harness doesn't wire the steam thermostat, so it no longer limits anything, in the boiler or out of it.",
        "Leave it in place, with no wires on it, or take it off.",
        "Taking it off frees its clamp holes too: GaggiMate's Silvia guide suggests the middle or left-most boiler-top hole for the thermocouple, which may mean taking the steam thermostat's clamp off.",
        "Either way, Steam Temperature gets set to 150 °C in Phase 6."
      ]
    },
    p2e:{
      need:"18 AWG and 22 AWG silicone wire, cutters, the printed labels or an oil-based marker.",
      how:[
        "Open the [cut list](cut) with Your Silvia set. Each run has an ID (AC1, LV2, G1...), a length, its two ends and what goes on each.",
        "Cut each run a little longer than listed: you can trim it once it's routed, never add to it.",
        "Put both labels on before you crimp anything: the ID at each end. Ends that will sit at the boiler get the ID in oil-based marker on the jacket instead.",
        "Mains runs are 18 AWG, low-voltage runs 22 AWG.",
        "Tick each run off on the cut list as it's cut."
      ],
      ok:"Every run on the cut list cut and labeled at both ends."
    },
    p2f:{
      need:"Bare 6.3 mm spades, the open-barrel crimper and the wire strippers.",
      how:[
        "Every end on the boiler, the safety thermostat and the solenoid gets an uninsulated spade: nylon insulation is rated to only 105 °C.",
        "Strip only as much as the spade's front tabs cover, so the copper sits under them and the insulation under the rear tabs.",
        "Set it in the open-barrel crimper's matching die and squeeze until the ratchet lets go. Then tug it.",
        "Leave these spades bare for now: the power-on checks probe them. Each gets wrapped in self-fusing silicone tape after the checks (check g1 is the reminder)."
      ],
      ok:"Each bare spade survives a firm tug, with no strands outside the tabs."
    },
    p2g:{
      how:[
        "Where two 18 AWG runs share a terminal, they go into one spade or fork sized for two: blue, never red, or a bare spade sized for 16 to 14 AWG at the boiler.",
        "Strip both wires, lay them side by side in the barrel, and crimp them together in the matching die.",
        {t:["The shared terminals: SSR terminal 1, the safety thermostat,",["the power switch's neutral spade,","!shelly"],["the inlet's L and N tabs,","shelly"],"the lamp, the pump, the solenoid and the boiler ground. The cut list marks each one."]},
        "Never two 18 AWG wires in a red spade (check g2)."
      ]
    },
    p2s:{links:[["Part guide: Shelly","gshl"]]},
    p2h:{
      how:[
        "All four SSR screws take forks: the two load terminals and the two control terminals.",
        "Load terminal 1 takes two 18 AWG wires in one fork sized for two; load terminal 2 takes one.",
        "The control wires, J9 R1 and J9 GND, are 22 AWG: strip a longer end and fold it back on itself so it fills the barrel.",
        "Crimp each fork in the die that matches its color, then tug it."
      ],
      links:[["Part guide: SSR","gssr"]]
    },
    p2i:{
      how:[
        "Hold each connector and pull its wire firmly.",
        "If it moves, cut the connector off and crimp a new one.",
        "Check no bare strands show behind an insulated spade, and no bare metal shows anywhere it shouldn't. The bare boiler spades are the one exception, until their tape goes on."
      ],
      ok:"Every crimp survives a firm tug."
    },
    /* ---------------- Phase 3 ---------------- */
    p3a:{
      need:"The M3 ungrounded K-type thermocouple, thermal paste rated for 180 °C or more, and a screwdriver for the clamp screws.",
      warn:"Machine unplugged and the boiler cold.",
      how:[
        "The brew thermostat is out (Phase 2), leaving its clamp's threaded holes in the boiler top.",
        "Coat the thermocouple's M3 thread with the thermal paste.",
        "Let its lead hang free, so it can turn with the probe as you screw it in.",
        "Screw it by hand into one of the boiler-top holes the brew or steam thermostat's clamp used. GaggiMate's Silvia guide suggests the middle or left-most hole for better readings.",
        "Stop as soon as it seats: **finger tight only**. No spanner, ever.",
        "Route the lead around the front of the boiler to where the PCB will sit, low and to the right, away from the mains wires.",
        "Its wires go into J4 in Phase 4."
      ],
      ok:"Seated finger tight, the lead free to turn, the safety thermostat untouched (check g8)."
    },
    p3a2:{
      how:[
        "Fold the insulation back over the boiler.",
        "Bring the thermocouple lead out cleanly, clear of the element terminals.",
        "Nothing may press on the thermocouple or pull on its lead."
      ]
    },
    p3b:{
      need:"The pressure sensor, the flat white O-ring (about 11 mm across), a 1/8\" FFM tee, a 1/4\"F to 1/8\"M elbow, Loctite 55, two spanners and a towel.",
      warn:"Machine unplugged and cold, with the water tank out: water runs out when the fitting comes off the OPV.",
      how:[
        "Going on the 3-way valve's bottom port instead? Follow the parts list from your help thread: these steps are for the OPV tee.",
        "Press the O-ring into the elbow's 1/4\" socket until it sits flush at the bottom.",
        "Screw the sensor into the elbow by hand until it stops. At most a quarter turn more with a spanner, never more: more crushes the O-ring or stops the reading.",
        "Wind Loctite 55 onto the elbow's and the tee's 1/8\" tapered threads, not PTFE tape, so they can be turned back to line up.",
        "Towel under the OPV. Fit the tee at the OPV: unscrew the fitting from the OPV's port, screw the tee in its place, and screw the fitting that came out into the tee's other female port, with Loctite 55 on its thread too. Not sure which port? Post a photo of your OPV in your help thread first.",
        "Screw the elbow into the tee's free port, turned so the sensor hangs below it, clear of the steam pipes.",
        "Keep the sensor off the chassis and anything hot. A wrap of foam helps if its readings turn out noisy.",
        "Run its lead to the PCB with the other low-voltage wires; extend it with 22 AWG if it's short. It plugs into J6 in Phase 4."
      ],
      ok:"The joints are snug (check g11). The leak test comes at first power-on.",
      pics:[["The white O-ring in a sensor fitting (a Gaggia's)","XF"],["Foam-wrapped sensor (a Gaggia's)","FOAM"]]
    },
    p3c:{
      need:"The SSR, a screw, washers and a nut (or a small bracket), a drill if there's no hole, and a screwdriver.",
      how:[
        "Find a spot on the left wall inside the machine, clear of the pump, where the SSR's metal base sits flat on the metal.",
        "Fix it with one screw, washers and a nut through a drilled hole, or with a small bracket. Base flat on the wall: while it conducts it turns about 10 W into heat.",
        "Drilling? Cover everything below the hole so no metal chips fall into the machine, and smooth the hole's edges (this site's advice).",
        "Its wires go on in Phase 4: switched line and the PCB's feed share load terminal 1 in one fork, terminal 2 goes to the safety thermostat, J9 R1 to + and J9 GND to −."
      ],
      ok:"It doesn't move, and nothing touches its terminals."
    },
    p3d:{
      how:[
        "Put the PCB in its housing (Printables 894339, or any box).",
        "Place it to the right of the 3-way valve or beside the pump, clear of the boiler and of anything that can drip on it.",
        "Hold it with thin velcro strips, so it can't slide but can come out again.",
        "Leave room around it for the plugs and the four mains tabs, J10 to J13."
      ]
    },
    p3s:{links:[["Part guide: Shelly","gshl"]]},
    p3e:{
      need:["The screen cable,",["the screen and its housing and mount, Kapton tape,","scr:p4,s3"],["the headless board and its housing,","scr:hl"],"and a short piece of heat shrink."],
      how:[
        "Check the cable is long enough for where the screen will sit: DIY-EFI's is 600 mm and Peak Coffee's 450 mm, and a Silvia's funnel mount needs more than an older diagram's 650 mm front-mount figure.",
        "Plug the cable into the PCB's J1 first, as on the bench: the small screen-end plugs slip through the housing gaps, the PCB end often can't.",
        ["Assemble the screen housing: the screen goes into the printed housing with four small screws, as the official photo shows. Dry-fit it first and peel the adhesive's release liner only when everything lines up: once it's stuck, it's hard to take apart.","scr:p4"],
        ["Feed the cable through the mount, if it has a hole for it, then plug it into the screen's socket marked 5V, IO28, IO27, GND, pin by pin.","scr:p4"],
        ["Feed the cable through the mount, if it has a hole for it, and the housing back, then plug its two small plugs into the screen, pin by pin, as on the bench. Keep the wires off the big components; Kapton tape can hold them.","scr:s3"],
        ["Set the screen onto the housing's upper posts first (they hold it), then lower it in. The wires must sit below the surface of the housing and the screen board, not pinched under the connectors.","scr:s3"],
        ["Front cover on: top edge first, the side with the thinner bezel. Check no wire is in the way, then snap the bottom edge on. To take it off later, use the fingernail slots.","scr:s3"],
        ["Plug the cable into the headless board, then slide the board into its housing until it's fully seated: the cover can't close if it isn't. Close the cover.","scr:hl"],
        ["The mount: the official housing's three mounts (front, funnel and rear) are designed for Gaggias. Talon used the funnel mount on his Silvia. The front mount holds by magnets: check one sticks where it will go, or use double-sided tape rated for 80 °C.","scr:p4,s3"],
        ["Fix the headless housing with its vent clips or magnets, wherever its cable reaches.","scr:hl"],
        "Where the cable passes the vent into the machine, slide the heat shrink over it and leave it unshrunk: a sleeve, so the sharp edge can't cut it (check g9).",
        "Tape the cable down where it runs outside, with Kapton or another high-temperature tape."
      ],
      ok:"The screen sits secure, its cable sleeved at the vent and not pinched anywhere.",
      pics:[["Gen 3.5 and Gen 3 screens side by side","CMP"],["Gen 3.5 housing assembly","H35","scr:p4"],["Mounts for the Gen 3.5 screen","M35","scr:p4"],["Mounts for the Gen 3 screen","M3","scr:s3"],["Gen 3 cable plugged in","PLUG3","scr:s3"],["Gen 3 screen onto its posts","POSTS3","scr:s3"],["Gen 3 front cover","COVER3","scr:s3"],["Headless board seated","HLSEAT","scr:hl"],["Headless housing on a machine","HLON","scr:hl"]]
    },
    /* ---------------- Phase 4 ---------------- */
    p4a:{
      warn:"Unplugged. Each end goes only where the wiring reference says: one wrong end can short the PCB's outputs or put mains on the case.",
      how:[
        "Work from the [wiring reference](wiring) with Your Silvia set: its list gives each run's two ends, and its map shows where they land.",
        "Fit one run at a time, read both labels against the list as it goes on, and tick it off on the [cut list](cut).",
        ["**Power switch:** inlet line (AC1) and inlet neutral (AC2) on the outer spades, one per pole; the loads leave from the center spades: AC3 from the line pole, AC8 and AC9 together from the neutral pole.","!shelly"],
        ["**Power switch, with the Shelly:** AC1 on the L pole's outer spade and SH2 off its center spade. The N pole stays empty: the next step has the Shelly's own wires.","shelly"],
        {t:["**SSR:** switched line",["(AC3)","!shelly"],["(SH3, from the Shelly's O)","shelly"],"and the PCB's feed (AC4) share load terminal 1 in one fork. AC5 runs from terminal 2 to the 165 °C safety thermostat, and AC6 on from it to the element. Never bypass the safety thermostat."]},
        {t:["**Neutral:** a chain from",["the power switch's N pole","!shelly"],["the splice beside the power switch","shelly"],"to the heating lamp, the pump's thermal-fuse terminal, the solenoid and PCB J10 (AC8, AC10, AC11, AC12), plus AC9 to the element."]},
        "**PCB outputs:** J12 to the pump (AC14), J13 to the solenoid's coil spade (AC13). AC4 brings line to J11.",
        "**Earth:** inlet earth to the boiler ground spade (G1), and the solenoid's ground to the same spade (G2). Earth never connects to the PCB's 5 V ground.",
        "**The lamp:** AC7 from the safety thermostat to the lamp's L spade, with AC8 on its N spade.",
        "Leave the bare boiler, thermostat and solenoid spades untaped for now: the checks probe them.",
        "Push every spade fully home."
      ],
      ok:"Every run ticked on the cut list, both ends matching the wiring reference."
    },
    p4s:{links:[["Part guide: Shelly","gshl"]]},
    p4b:{
      warn:"Low-voltage wires go only on the spades named here. The switches' other pole stays free (the LED switch mod uses it later), and the power switch carries mains.",
      how:[
        "Brew, steam and hot water each use one pole of their switch: signal on the center spade, ground on the outer spade of the same pole.",
        "J7 S to the steam switch (LV1), J7 B to the brew switch (LV2), J5 B15 to the hot water switch (LV3). B15, not A12.",
        "Ground chain: J7 GND to the first switch's outer spade (LV4), then on to the next two (LV5, LV6), with shared spades or red butt splices. Start at whichever switch is nearest.",
        "At the PCB end, each wire takes a JST-PH 2 mm crimp pin in the plug for J7 or J5. Before you push a pin into a plug, check its place against the pin names printed by that socket on the PCB.",
        "Run these wires low and to the right, away from the mains wires.",
        "Unplugged, with the J7 and J5 plugs out: each switch on reads close to 0 Ω from its signal pin to J7 GND, and open when it's off."
      ],
      ok:"Checks [f1](checks#f1) to [f6](checks#f6) pass."
    },
    p4e:{
      how:[
        "Thermocouple into J4: folded ends, and + and − the way they passed the warm-hand test on the bench.",
        "Pressure sensor into J6, the SSR control into J9 (R1 to the SSR's +, GND to its −), and the screen cable into J1 if it isn't in already.",
        "J7 and J5 from the last step, and the ToF into J2 if you have one.",
        "Leave a little slack on each lead, so the PCB can come out without pulling anything."
      ],
      ok:"Everything plugged in, as check a3 expects."
    },
    p4c:{
      how:[
        "Mains wires high; low-voltage wires and sensors low and to the right.",
        "Look at every wire near the boiler and the steam wand: only silicone wire rated to 200 °C may touch them (check g7).",
        "Talon ran the mains wires, the pump hose and the pump wires through the center slot at the back, to keep them apart from the rest.",
        "Zip-tie the bundles so nothing can drift onto the boiler, the wand or a terminal, and trim the tails."
      ]
    },
    p4d:{
      how:[
        "At the SSR: tie its wires down near it, so a pull on a wire never reaches a screw terminal.",
        "Where the screen cable leaves the machine: a tie or Kapton tape inside the vent, so a tug on the screen can't pull on J1."
      ]
    },
    p4z:{
      how:[
        "Open [Power-on checks](checks) with Your Silvia set, on a phone or tablet beside the machine: it shows only your checks.",
        "Cord out of the wall and out of the machine for every check in this phase.",
        "Set the meter to its lowest Ω range, or continuity. Touch the probes together and enter that reading where the page asks.",
        "Work through each section in order up to Covers on. Type each reading in and the page marks it pass or fail.",
        "Some checks ask you to unclamp the thermocouple from J4, take a lead off a part, or unplug J7, J5 and J9 for a reading. Put each back as it was straight after.",
        "A fail: use the hint under that check to fix it, then measure again. Don't skip past a fail.",
        "Have someone else trace the harness against the wiring reference too: a second pair of eyes catches what you've stopped seeing (check g12).",
        "Covers on, the last section, waits for Phase 5."
      ],
      warn:"Don't plug in until every check passes, Covers on included."
    },
    /* ---------------- Phase 5 ---------------- */
    p5a0:{
      how:[
        "Top cover and every panel back on, screws tight, with the screen cable clear of the vent edge.",
        ["With the Shelly in the E's GICAR box: leave off the cover or panel you remove to reach the box, take h6's O reading and h7 through that opening, then put it on.","model:E;shelly"],
        {t:["Cord still out: run Covers on, the last section of the [power-on checks](checks),",["h1 to h6.","!shelly"],["h1 to h7.","shelly"]]},
        "It proves every panel is earthed and nothing got pinched as the covers went on."
      ],
      ok:"Every Covers on check passes."
    },
    p5a:{
      how:[
        "Fill the water tank and put it back.",
        "Drip tray in, portafilter out.",
        "A cup or jug under the steam wand for the first fill, and the steam knob closed for now."
      ]
    },
    p5b:{
      how:[
        "Plug the cord into the machine first, then into a {outlet}.",
        "Stay within reach of the plug for this whole first session.",
        "Switch on. The screen comes on and shows \"Filling boiler\".",
        "At any smell, smoke, crackle, a tripped breaker or {gfci}, or an odd noise: unplug at the wall first, find out why after."
      ],
      warn:"Never run it with a cover off or a check unpassed."
    },
    p5d:{
      how:[
        "Straight after switch-on, before anything else.",
        "Open the steam knob, with the cup or jug under the wand.",
        "On the home screen, tap **Flush**: the circle inside the button lights green. Then turn the brew switch on.",
        "Keep it running until water comes steadily out of the steam wand, not just the group: the boiler is full and the air is out.",
        "Close the steam knob, and let it run on until water has come from the group for 5 seconds or more.",
        "Brew off, then tap Flush again to leave flush mode."
      ],
      ok:"Steady water from the wand, then 5 seconds or more from the group: the boiler is full."
    },
    p5d2:{
      how:[
        "Watch the temperature on the home screen. With the boiler full, it must climb while the heating light is on.",
        "If it falls instead, switch off and unplug at once: the thermocouple wires are reversed at J4. Swap them, unplugged, and rerun Covers on before you plug back in.",
        "It reaches the brew target and holds there."
      ],
      ok:"The temperature climbs and settles on the target."
    },
    p5c:{
      how:[
        "Settings (the gear icon), then Boiler: enter the values in the table above. HPWR, Main Divider and Brew Divider are under Advanced.",
        "They're starting values from the Discord thread, not official defaults: the manual's defaults are for Gaggias.",
        "Tap the save icon once when they're all in: \"Settings persisted\" confirms it."
      ]
    },
    p5e:{
      how:[
        "In the web UI, open the community profiles and download **[UT] Tube Fill**. They're also on the [Gaggiuino GitHub](https://github.com/Zer0-bit/gaggiuino/tree/community/profiles).",
        "Select it as the active profile, put a cup under the group with the portafilter out, and run it with the brew switch, following any instructions it shows.",
        "Brew off when it's done."
      ],
      ok:"The sensor's line is full of water, with no air: the pressure reading moves smoothly."
    },
    p5f:{
      need:"A portafilter with a blank (blind) basket.",
      how:[
        "Lock the portafilter with the blank basket into the group.",
        "Download **[UT] Test OPV** from the community profiles, select it, and run it with the brew switch.",
        "Watch the pressure: its peak must land between 10.5 and 13 bar.",
        "While it runs, water should move through the OPV's tubing, and nothing may leak.",
        "Brew off, then take the portafilter out carefully: it's hot.",
        "Outside 10.5 to 13 bar: post the reading in your help thread before you adjust the OPV."
      ],
      ok:"Peak 10.5 to 13 bar, water moving through the OPV tubing, no leaks."
    },
    p5g:{
      how:[
        "Switch off and unplug from the wall first.",
        "Lift the top cover and touch a dry paper towel to the tee, the elbow, the sensor and the thermocouple: a damp spot is a leak.",
        "Snug that joint, unplugged. Never more than a quarter turn past hand tight on the sensor.",
        {t:["Close it up and rerun h1 to h4 of the power-on checks before you plug back in, and h5 and h6 too if the screen cable moved.",["With the Shelly, h7 too.","shelly"],["With the Shelly in the E's GICAR box, take h7 (and h6's O reading) first.","model:E;shelly"]]}
      ]
    },
    p5h:{
      how:[
        "Brew on, with a cup under the group: the pump runs and water comes through. Brew off.",
        "Steam on: the target switches to the steam temperature. Steam off.",
        "Hot water on, with the steam knob open over a jug: hot water mode. Off, then close the knob.",
        "If only hot water does nothing, recheck f5 and f6: its switch has to land on J5 B15, not A12."
      ],
      warn:"Steam, the wand and the group head can burn."
    },
    p5i:{
      how:[
        "Leave it on and watch the temperature reach the target and hold there.",
        ["With the Shelly, watch its own temperature in the app too, through a long heat-up and a steaming session. If it keeps climbing, or the Shelly switches itself off, move it somewhere cooler.","shelly"],
        ["On an E with the Shelly in the GICAR box, give it an hour or more switched on, then a steaming session.","model:E;shelly"],
        "Anything odd, from a dark screen to a temperature that won't settle: [Troubleshooting](trouble) goes symptom by symptom."
      ]
    },
    /* ---------------- Phase 6 ---------------- */
    p6a:{
      how:[
        "In the web UI, download **[UT] PZ Cal** from the community profiles and select it.",
        "Follow the instructions in the profile.",
        "The result is Pump Zero: how much water your pump moves per pulse at 0 bar. It's under Settings, System.",
        "Later, with hardware or Bluetooth scales, you can refine it: compare pump flow with weight flow during a steady shot above 4 bar and 1 ml/s (the manual's tip)."
      ]
    },
    p6b:{
      how:[
        "Web UI, Settings, Scales: enable hardware scales, turn the other scale types off, and open Calibrate.",
        "Find which load cell is which, then calibrate each against a known 200 to 400 g object, as the [scales guide](gscl#scl/10) shows.",
        "Save, and wait for \"Persisted settings\"."
      ]
    },
    p6c:{
      how:[
        "The Silvia's tank is about 200 mm deep, so the Gaggia ranges read wrong.",
        "On Gen 3, the Discord thread says to set the ranges in the ToFnLED settings page; the official manual doesn't describe it.",
        "Then check the reading at a few known fill levels.",
        "Reading oddly? Check the sensor's protective film is off and the hoses are out of its view: the [ToF guide](gtof) has the details."
      ]
    },
    p6d:{
      how:[
        "Temperature Offset corrects the brew temperature against the real temperature at the puck.",
        "The table's starting value comes from the Discord thread. Change it only against a measurement at the group head, for example with a Scace-type device."
      ]
    },
    p6e:{
      how:[
        "Settings, Boiler: Steam Temperature to 150 °C.",
        "Tap the save icon: \"Settings persisted\".",
        "With the steam thermostat off the heater line, this setting and the 165 °C safety thermostat are the only limits on steam."
      ]
    },
    p6f:{
      how:[
        "Settings, System: set the time zone offset, in minutes.",
        "Keep Gaggiuino on your home Wi-Fi, so it can fetch the time.",
        "For shot history: with the machine off, put a microSD card (1 to 8 GB, formatted FAT32) in the interface's SD card slot.",
        ["The official low-voltage drawing shows the slot on the back of the Gen 3.5 screen.","scr:p4"],
        ["The official low-voltage drawing shows the slot on the back of the headless board.","scr:hl"],
        ["The official drawing doesn't show where the Gen 3 screen's slot is: ask in your help thread if you can't find it.","scr:s3"],
        "After changing settings, tap the save icon once: \"Settings persisted\" confirms it."
      ]
    },
    /* ---------------- Phase 7 ---------------- */
    p7a:{
      how:[
        "Switch off and unplug from the wall first.",
        "Zip ties where they're needed, and Kapton tape to hold the screen cable where it runs.",
        {t:["Close it up again and rerun the whole Covers on section,",["h1 to h6,","!shelly"],["h1 to h7,","shelly"],"before you plug back in."]},
        ["With the Shelly in the E's GICAR box, h6's O reading and h7 come first.","model:E;shelly"]
      ]
    },
    p7f:{
      how:[
        "Pick a profile on the home screen: swipe across the profile names.",
        "Dial in by the profile's targets, not a stock shot time.",
        "Profiles with pre-infusion and soak need a finer grind than stock to reach the same pressure.",
        "With stop-on-weight, the shot stops a little early on purpose: the last of it is still on its way to the cup."
      ]
    },
    p7h:{
      how:[
        "Film your first start: switch-on to heated up.",
        "Film your first shot.",
        "Post them in #first-start and #first-shot on the Gaggiuino Discord."
      ]
    },
    p7g:{
      how:[
        "**Backflush:** blind basket in the portafilter, and optionally the shower screen off and some Cafiza in the basket. Lock it in, tap Flush, brew on, and let it cycle until the water runs clear. Brew off, then tap Flush to leave flush mode.",
        "**Descale, part 1:** empty the drip tray. Fill the tank to the max line with descaling solution (water and citric acid). Lock in the blind basket, put a 2 L container under the steam wand, and open the steam knob a quarter turn.",
        "**Descale, part 2:** tap Descale (its circle turns green) and turn brew on. It runs until the tank is empty, about 30 minutes. With a ToF board it stops by itself.",
        "**Descale, part 3:** brew off. Clean the tank, fill it with fresh water to the max line, and run the cycle again with the brew switch until the tank is empty.",
        "These are the Gaggiuino manual's routines, written for any machine it runs."
      ]
    },
    p7b:{
      how:[
        "Pump Zero, the Boiler settings you ended with, your favorite profiles and grind settings.",
        "Anything you'd do differently next time, and any harness length that differed from the cut list."
      ]
    },
    p7c:{
      how:[
        "It brings back the brew, steam and hot water switch lights, which go dark once the switches carry low voltage.",
        "Each lamp and its two 47k resistors come out; an orange 5 mm LED with its own 1k to 3k resistor goes in, fed 5 V from the screen line through a butt splice.",
        "The [LED switch mod](led) page has the full steps."
      ]
    },
    p7d:{
      how:[
        "Hardware scales: the [scales guide](gscl) on this site, on a Silvia mount.",
        "ToF: the [ToF guide](gtof) on this site."
      ]
    }
  };
  /* photo keys in pics resolve to the addresses above */
  var PICL={};Object.keys(PIC).forEach(function(k){PICL[k.toLowerCase()]=PIC[k]});
  Object.keys(HOW).forEach(function(k){var h=HOW[k];if(h.pics)h.pics=h.pics.map(function(p){var u=PICL[String(p[1]).toLowerCase()];return u?[p[0],u,p[2]]:p})});
