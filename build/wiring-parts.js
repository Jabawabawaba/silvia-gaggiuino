  /* ---------- what each part on the wiring drawing is ----------
     For the detail card: a line on what the part is and does, and one on what the Gaggiuino PCB does with it,
     on realNiche's harness as the drawing shows it. */
  function partInfo(id){
    switch(id){
      case 'pcb':
        return {w:'The Gaggiuino board: the controller that takes over from the thermostats. Mains comes in on J10 (neutral) and J11 (line) and feeds its own 5 V supply and its pump and valve outputs.',
          p:'It reads the thermocouple on J4, the pressure sensor on J6, the brew and steam switches on J7 and the hot water switch on J5 B15. It heats through the SSR on J9, runs the pump on J12 and opens the 3-way valve on J13. The screen talks to it on J1.'};
      case 'ssr':
        return {w:'A solid-state relay (SSR-40DA): an electronic switch with no moving contacts. A small DC signal on its two control screws switches mains through its two load screws. Its light shows when it\'s on. Here switched line comes in on load terminal 1, which also feeds the PCB, and terminal 2 feeds the 165 °C safety thermostat and then the element.',
          p:'The PCB drives it from J9 (R1 to +, GND to −), switching the element on and off in pulses to hold the temperature it reads from the thermocouple.'};
      case 'boiler':
        return {w:'The brass boiler, with one heating element, the 165 °C safety thermostat on its front (reset by hand) and the ground spade. The brew thermostat comes out and the thermocouple goes into one of its holes; realNiche\'s harness doesn\'t wire the steam thermostat.',
          p:'The PCB heats the element through the SSR and reads the temperature through the thermocouple on J4, an ungrounded K-type, because the PCB\'s 5 V side floats.'};
      case 'pump':
        return {w:'The vibratory pump, with a thermal fuse on its neutral side where your machine has one. It pushes water from the tank into the boiler and on to the group or the wand.',
          p:'The PCB switches it from J12 and lets through only part of each second\'s mains half-cycles, which sets the pressure and flow during a shot.'};
      case 'sol':
        return {w:'The 3-way solenoid valve. Open, it connects the boiler to the group; closed, it vents the group into the drip tray, so the portafilter comes off without spraying. Its ground spade goes to the boiler\'s.',
          p:'The PCB opens it from J13 for a shot or a flush, and closes it at the end.'};
      case 'psens':
        return {w:'A pressure transducer, 0 to 12 bar (1.2 MPa), on a tee in the water line.',
          p:'The PCB powers it with 5 V and reads its signal on J6, then adjusts the pump to follow a pressure or flow profile.'};
      case 'screen':
        return {w:'The 4.3" touch screen, a small computer of its own: it draws the interface, keeps your profiles and settings, and runs the Wi-Fi network and the web page at gaggiuino.local.',
          p:'It talks to the PCB over a serial link on J1 (GND, TX, RX, 5V), which also powers it. Wire it by pin, not by colour.'};
      case 'brew':
        return {w:'The brew switch, now low voltage: the signal goes on its center spade and the ground chain on its outer spade.',
          p:'On, it joins J7 B to the 5 V ground and the PCB starts a shot: pump, valve and the profile you picked.'};
      case 'steam':
        return {w:'The steam switch, now low voltage: the signal goes on its center spade and the ground chain on its outer spade.',
          p:'On, it joins J7 S to the 5 V ground and the PCB heats to its steam setpoint through the SSR.'};
      case 'hw':
        return {w:'The hot water switch, now low voltage: the signal goes on its center spade and the ground chain on its outer spade. Keep it off mains: switching the pump around the PCB would short its pump output.',
          p:'On, it joins J5 B15 to the 5 V ground and the PCB starts hot water mode. Talon confirmed on Discord that Gen 3 reads it there.'};
      case 'pwr':
        return {w:'The power switch, still on mains: it breaks both line and neutral, one per pole. Supply goes on the outer spades, the loads come off the center ones.',
          p:'The PCB has no input from it: it simply powers up with the machine.'};
      case 'lamp':
        return {w:'The heating lamp, wired across the element: it lights whenever the SSR is feeding the element.',
          p:'So it shows the PCB\'s heat pulses: on while it heats, off when the boiler is at temperature.'};
      case 'inlet':
        return {w:'The power inlet: line, neutral and earth come in here. Earth goes to the boiler\'s ground spade.',
          p:'Mains reaches the PCB on J11 (line, from the power switch by way of the SSR\'s terminal 1 screw) and J10 (neutral). Earth never connects to the PCB\'s 5 V side.'};
    }
    return null;
  }
