  /* ---------- part figures: portafilter, steam wand, drip tray, switches and lamps, inlet ----------
     Shared by the Gaggia and Silvia sites. Each site defines PFM before including this file:
       PFM.ev    the event its machine picker fires
       PFM.get() {site:'g'|'s', ...}: on the Gaggia site model, fam ('GC' or 'GCP'), volts, ground (a US
                 original Classic, two-pin as sold); on the Silvia site ver, e (a V5 or V6 E), volts.
     A field nobody has picked is null, and every figure then shows its default drawing. */

  /* portafilter: the handle angle drives the top view; the same turn slides the ear along the lug's ramp,
     which lifts the basket rim into the gasket (all in drawing units) */
  (function(){
    var fig=$('mini-pf'),r=$('pf-r');if(!fig||!r)return;
    var rots=qa('.pf-rot',fig),move=$('pf-move'),ticks=$('pf-ticks'),gk=$('pf-gasket'),out=$('pf-o'),ear=$('pf-earu');
    /* the lug's top: flat at 269 before it starts, rising 9 units over 130, then flat */
    function rampY(x){return x<=60?269:x>=190?260:269-9*(x-60)/130}
    function upd(){
      var t=Number(r.value)/100,slide=150*t,yr=rampY(44+slide)-19;
      rots.forEach(function(g){g.setAttribute('transform','rotate('+(45*(1-t)).toFixed(2)+' 100 94)')});
      move.setAttribute('transform','translate(0 '+(yr-250).toFixed(2)+')');
      ear.setAttribute('transform','translate('+slide.toFixed(2)+' 0)');
      ticks.setAttribute('transform','translate('+(slide%18).toFixed(2)+' 0)');
      gk.setAttribute('height',(Math.min(246,yr)-232).toFixed(2));
      var sealed=t>=0.83;fig.classList.toggle('sealed',sealed);
      out.textContent=t<0.03?'Just put in':sealed?'Locked':yr<=246?'Rim on the gasket':'Turning';
    }
    r.addEventListener('input',upd);upd();
  })();

  /* steam valve and wand: the knob screws the stem back up to 14 units; steam or pumped hot water flows once it's open */
  (function(){
    var fig=$('mini-wand'),r=$('wand-r');if(!fig||!r)return;
    var stem=$('w-stem'),ptr=$('w-ptr'),out=$('wand-o'),water=$('w-water'),btns=qa('[data-wmode]',fig),mode='steam';
    function upd(){
      var t=Number(r.value)/100,open=t>0.04;
      stem.setAttribute('transform','translate('+(16*t).toFixed(2)+' 0)');
      ptr.setAttribute('transform','rotate('+(-540*t).toFixed(1)+')');
      fig.classList.toggle('open',open);fig.classList.toggle('flow',open);
      fig.classList.toggle('steam',mode==='steam');fig.classList.toggle('water',mode==='water');
      fig.style.setProperty('--wsp',(1.5-1.1*t).toFixed(2)+'s');
      out.textContent=!open?'Closed':t<0.35?'Cracked open':t<0.75?'Open':'Wide open';
      /* steaming leaves the boiler part full; with the pump running it's full to the top */
      water.setAttribute('y',mode==='water'?'122':'150');water.setAttribute('height',mode==='water'?'82':'54');
    }
    btns.forEach(function(b){b.addEventListener('click',function(){
      mode=b.getAttribute('data-wmode');btns.forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});upd();
    })});
    function adapt(){
      var m=PFM.get();
      if(m.site==='g'){fig.classList.toggle('gc',m.fam==='GC');fig.classList.toggle('brass',m.model==='E24')}
      else{fig.classList.add('brass','sil');fig.classList.toggle('thin',m.ver==='V1'||m.ver==='V2')}
    }
    window.addEventListener(PFM.ev,adapt);adapt();
    r.addEventListener('input',upd);upd();
  })();

  /* drip tray: each event adds a little water; past the full line it asks to be emptied */
  (function(){
    var fig=$('mini-tray');if(!fig)return;
    var w=$('t-water'),lvl=0,busy=null;
    function draw(){var h=Math.min(54,lvl*50);w.setAttribute('y',(194-h).toFixed(1));w.setAttribute('height',h.toFixed(1));fig.classList.toggle('over',lvl>=0.8)}
    /* a click while the last one is still running lands its water at once, so quick clicks all count */
    function stop(){if(!busy)return;clearTimeout(busy.t);fig.classList.remove(busy.cls);if(busy.add){lvl=Math.min(1.08,lvl+busy.add);draw()}busy=null}
    function run(cls,add,ms){
      stop();fig.classList.add(cls);
      busy={cls:cls,add:add,t:setTimeout(function(){lvl=Math.min(1.08,lvl+add);draw();busy.add=0;busy.t=setTimeout(function(){fig.classList.remove(cls);busy=null},ms)},RM?0:300)};
    }
    qa('[data-tray]',fig).forEach(function(b){b.addEventListener('click',function(){
      var k=b.getAttribute('data-tray');
      if(k==='shot')run('vent',0.06,500);else if(k==='flush')run('rain',0.2,900);
      else{stop();lvl=0;draw()}
    })});
    draw();
  })();

  /* switches and lamps: a power switch and one thermostat. A lamp across a closed contact is shorted out;
     once the contact opens, the lamp and the element share the voltage, and the lamp, drawing almost nothing,
     takes nearly all of it. The Silvia's heating light is the other way round: it's across the element. */
  (function(){
    var fig=$('mini-panel');if(!fig)return;
    var bp=fig.querySelector('[data-sw="pwr"]'),bt=fig.querySelector('[data-sw="ts"]'),bs=fig.querySelector('[data-sw="safe"]'),note=fig.querySelector('[data-sw-note]');
    var on=false,ready=false,tripped=false,kind='pro',ctl=false;   /* ctl: the power button works through an Eco board or the E's controller */
    function F(id){return $(id)}
    function flows(list){qa('.sw-f',fig).forEach(function(p){p.classList.toggle('on',list.indexOf(p.id)>=0)})}
    function glow(sel,v){qa('[data-lp="'+sel+'"]',fig).forEach(function(e){e.classList.toggle('glow',!!v)})}
    function upd(){
      fig.classList.toggle('on',on);fig.classList.toggle('ready',ready);fig.classList.toggle('tripped',tripped);
      bp.setAttribute('aria-pressed',String(on));bp.textContent=on?'Power switch on':'Power switch off';
      bt.setAttribute('aria-pressed',String(ready));bt.textContent=ready?'Boiler hot enough':'Boiler heating';
      if(bs){bs.setAttribute('aria-pressed',String(tripped));bs.textContent=tripped?'Safety tripped':'Safety OK'}
      var heat=on&&!ready&&!tripped;fig.classList.toggle('heating',heat);
      glow('pwr',on);
      if(kind==='silvia'){
        /* the heating light sits across the safety and element, so it lights whenever the thermostats are closed */
        var lit=on&&!ready;glow('heat',lit);glow('rk',on&&!fig.classList.contains('led'));
        flows(!on?[]:heat?['sw-fh','sw-fp','sw-fl']:lit?['sw-fl','sw-fp']:['sw-fp']);
        note.textContent=!on?(ctl?OFF_CTL_E:OFF_2P):
          ready?'Hot enough: the thermostats open, so no current flows through the heating light and it goes dark.':
          tripped?'Safety tripped: the element gets nothing, but in the usual stock wiring the heating light stays on, because the thermostats are still closed.':
          'Heating: the thermostats are closed, so the element and the heating light both get the full voltage.';
        return;
      }
      glow('rdy',on&&ready);
      var g=kind==='gc'?'g':'';
      flows(!on?[]:ready?['sw-fr'+g,'sw-fp'+g]:['sw-fh'+g,'sw-fp'+g]);
      var gc=kind==='gc',lamp=gc?'ready lamp':'brew lamp';
      note.textContent=!on?(gc?OFF_1P:ctl?OFF_CTL_G:OFF_2P):
        ready?(gc?'Hot enough: a thermostat opens.':'Hot enough: the thermostat opens.')+' A tiny current through the '+lamp+' and the element lights the lamp, far too little to heat'+(gc?'. The element is still wired in, so treat it as live.':', though both ends of the element still sit at line.'):
        (gc?'Heating: the closed thermostats short out the ':'Heating: the closed thermostat shorts out the ')+lamp+', so it stays dark and the element gets the full voltage.';
    }
    /* off isn't dead: a single-pole switch may break neutral, and the inlet side of any switch stays live */
    var OFF_2P='Off: both poles are open, so nothing past the switch has power. The inlet and the switch\'s input spades stay live while it\'s plugged in.',
        OFF_1P='Off: the switch breaks one wire only. If line and neutral are swapped at the inlet, everything past it stays live. Unplug before opening it.',
        OFF_CTL_G='Off, as drawn. On an Eco-board machine the button works through the board, whose circuit isn\'t published: treat its wires as mains even when it\'s off.',
        OFF_CTL_E='Off, as drawn. On the E the button works through its controller, whose switching isn\'t documented: treat its wires as mains even when it\'s off.';
    function toggle(){on=!on;upd()}
    bp.addEventListener('click',toggle);
    bt.addEventListener('click',function(){ready=!ready;upd()});
    if(bs)bs.addEventListener('click',function(){tripped=!tripped;upd()});
    qa('[data-fr="pwr"],#sw-rock',fig).forEach(function(e){e.addEventListener('click',toggle)});
    function adapt(){
      var m=PFM.get();
      if(m.site==='g'){kind=m.fam==='GC'?'gc':'pro';ctl=!!m.eco;fig.classList.toggle('gc',kind==='gc')}
      else{kind='silvia';ctl=!!m.e;var v=m.ver||'V6',led=v==='V5'||v==='V6';fig.classList.toggle('led',led);fig.classList.toggle('e',!!m.e)}
      upd();
    }
    window.addEventListener(PFM.ev,adapt);adapt();
  })();

  /* inlet and earth: a loose line wire touches the case. With earth, the fault current runs home on the earth wire
     and trips the breaker; without it, nothing flows yet and the case sits at line voltage. */
  (function(){
    var fig=$('mini-inlet');if(!fig)return;
    var bf=fig.querySelector('[data-in="fault"]'),be=fig.querySelector('[data-in="earth"]'),fault=false,earth=true,tt=null,was=null;
    function on(id,v){$(id).classList.toggle('on',!!v)}
    function upd(){
      if(tt){clearTimeout(tt);tt=null}
      fig.classList.toggle('noearth',!earth);fig.classList.toggle('fault',fault);fig.classList.remove('tripped');
      bf.setAttribute('aria-pressed',String(fault));be.setAttribute('aria-pressed',String(earth));
      be.textContent=earth?'Earth wire connected':'Earth wire missing';
      var flowing=fault&&earth;on('in-fl',flowing);on('in-fe',flowing);on('in-trip',false);
      fig.classList.toggle('live',fault&&!earth);on('in-live',fault&&!earth);
      if(flowing)tt=setTimeout(function(){on('in-fl',false);on('in-fe',false);fig.classList.add('tripped');on('in-trip',true)},RM?0:1100);
    }
    bf.addEventListener('click',function(){fault=!fault;upd()});
    be.addEventListener('click',function(){earth=!earth;upd()});
    /* a US original Classic left the factory two-pin, so start it that way; only when the picked machine changes */
    function adapt(){
      var m=PFM.get(),g=!!m.ground,gf=$('in-gfci');
      if(gf)gf.textContent=m.volts===120?'or GFCI':m.volts===230?'or RCD':'or GFCI/RCD';
      if(g!==was){was=g;earth=!g;upd()}
    }
    window.addEventListener(PFM.ev,adapt);adapt();
  })();
