  /* ---------- part figures: portafilter, steam wand, drip tray, switches and lamps, inlet ----------
     Shared by the Gaggia and Silvia sites. Each site defines PFM before including this file:
       PFM.ev    the event its machine picker fires
       PFM.get() {site:'g'|'s', ...}: on the Gaggia site model, fam ('GC' or 'GCP'), volts, ground (a US
                 original Classic, two-pin as sold); on the Silvia site ver, e (a V5 or V6 E), volts.
     A field nobody has picked is null, and every figure then shows its default drawing. */

  /* thermostats and fuse (the Silvia: thermostats and safety): a boiler that heats and cools, the thermostats switching
     it, and each part drawn in section. Each disc snaps open at its set point and closes again a few degrees cooler; a
     stuck thermostat's contacts stay shut whatever its disc does. Machine time runs 8x real time while the figure is on
     screen; with reduced motion each change jumps the boiler two minutes ahead instead. The figures are illustrative. */
  (function(){
    var fig=$('mini-tstat');if(!fig)return;
    function K(k){return fig.querySelector('[data-k="'+k+'"]')}
    var note=fig.querySelector('[data-ts-note]'),bSteam=fig.querySelector('[data-ts="steam"]'),bRe=fig.querySelector('[data-ts="restart"]'),bFix=fig.querySelector('[data-ts="fix"]'),fb=qa('[data-fault]',fig);
    var SPEED=8,TAU=4,W=300,X1=350,SX=320/300,site='g',TH,P=1.35,KL=0.0022,gc=false;
    var T,q,bD,sD,cut,steam=false,fault='none',hist,heatH,hold=0,held='',cycled=false;   /* cycled: the brew disc has snapped at least once since the start */
    function Y(t){return 150-(t-20)*142/190}
    function zig(x0,x1,y,n,amp){var w=(x1-x0)/n,p=[x0+','+y];for(var i=1;i<n;i++)p.push((x0+w*i).toFixed(1)+','+(i%2?y-amp:y+amp));p.push(x1+','+y);return p.join(' ')}
    function conf(){
      var m=PFM.get();site=m.site;TH=m.th;
      if(site==='g'){P=m.model==='E24'?1.0:1.35;KL=0.0022;gc=m.fam==='GC';fig.classList.toggle('brass',m.model==='E24');fig.classList.toggle('gc',gc)}
      else{P=m.volts===230?0.58:0.5;KL=0.0016;gc=false;fig.classList.add('brass','sil')}
      var bs=K('b-sub');if(bs)bs.textContent='opens at '+TH.bo+' °C';
      [['bo',TH.bo],['bc',TH.bc],['so',TH.so],['sc',TH.sc],['cut',TH.cut]].forEach(function(r){
        var l=K('tg-'+r[0]),y=Y(r[1]).toFixed(1);l.setAttribute('y1',y);l.setAttribute('y2',y);
        var t=K('tg-'+r[0]+'-t');if(t){t.setAttribute('y',(Y(r[1])-3).toFixed(1));t.textContent=t.textContent.replace(/ [\d.]+ °C$/,'')+' '+r[1]+' °C'}
      });
    }
    function reset(){T=20;q=0;bD=false;sD=false;cut=false;hist=[];heatH=[];cycled=false}
    /* contacts: a disc that hasn't snapped, or welded contacts, conduct. The steam switch is around the brew thermostat. */
    function bCond(){return !bD||fault==='b'}
    function sCond(){return !sD||fault==='s'}
    function heating(){return !cut&&sCond()&&(bCond()||steam)}
    function step(dt){
      var on=heating();
      q+=((on?P:0)-q)*Math.min(1,dt/TAU);      /* the elements stay hot for a moment after they switch off, so the boiler overshoots */
      T+=(q-KL*(T-20))*dt;
      if(!bD&&T>=TH.bo){bD=true;cycled=true}else if(bD&&T<=TH.bc)bD=false;
      if(!sD&&T>=TH.so)sD=true;else if(sD&&T<=TH.sc)sD=false;
      if(!cut&&T>=TH.cut)cut=true;
    }
    function sec(){step(0.5);step(0.5);hist.push(T);heatH.push(heating());if(hist.length>W+1){hist.shift();heatH.shift()}}
    function advance(n){for(var i=0;i<n;i++)sec()}
    function draw(f){
      var n=hist.length,pts=[],hp='';f=f||0;
      for(var i=0;i<n;i++){
        var x=X1-(n-1-i+f)*SX;if(x<30)continue;
        pts.push(x.toFixed(1)+','+Y(hist[i]).toFixed(1));
        if(heatH[i]&&i<n-1)hp+='M'+x.toFixed(1)+',153h'+SX.toFixed(2)+'v4h-'+SX.toFixed(2)+'Z';
      }
      K('tg-trace').setAttribute('d',pts.length?'M'+pts.join(' L'):'');K('tg-heat').setAttribute('d',hp);
      var dot=K('tg-now');if(n){dot.setAttribute('cx',(X1-f*SX).toFixed(1));dot.setAttribute('cy',Y(hist[n-1]).toFixed(1))}else{dot.setAttribute('cx','-10')}
    }
    function badge(k,txt,st){var b=K(k+'-badge');b.setAttribute('class','badge tb-badge '+st);K(k+'-btext').textContent=txt}
    /* a thermostat: snapped discs push the pin up and the blade with it; a welded blade bows instead and the contacts stay shut */
    function tstat(k,snap,stuck){
      var bowed=snap&&stuck;
      K(k+'-arm').setAttribute('transform',snap&&!stuck?'rotate(22 82 34)':'');
      K(k+'-blade').setAttribute('d',bowed?'M82,34 Q66,26 54,44':'M82,34 L54,44');
      K(k+'-pin').setAttribute('transform',snap?'translate(0 -7)':'');
      K(k+'-disc').setAttribute('d',snap?'M20,66 Q55,56 90,66':'M20,64 Q55,72 90,64');
      K(k+'-weld').classList.toggle('on',stuck);
      badge(k,stuck?'STUCK SHUT':snap?'OPEN':'CLOSED',stuck?'bad':snap?'open':'closed');
    }
    function parts(){
      tstat('b',bD,fault==='b');tstat('s',sD,fault==='s');
      if(site==='g'){
        /* melted: the pellet slumps to a puddle, the main spring relaxes into its space with nothing to push on, and the
           small trip spring pushes the sliding contact back off the lead */
        var pel=K('fz-pellet');pel.setAttribute('y',cut?'51':'34');pel.setAttribute('height',cut?'3':'20');pel.setAttribute('width',cut?'12':'11');
        K('fz-star').setAttribute('transform',cut?'translate(-9 0)':'');
        K('fz-spring').setAttribute('points',cut?zig(21,49,44,8,5):zig(32,58,44,8,7));
        K('fz-trip').setAttribute('points',cut?zig(55,79,51,6,2.5):zig(64,79,51,6,2.5));
        badge('cut',cut?'MELTED':'INTACT',cut?'bad':'closed');
      }else{
        tstat('cut',cut,false);K('cut-btn').setAttribute('transform',cut?'translate(0 -4)':'');
        badge('cut',cut?'TRIPPED':'CLOSED',cut?'bad':'closed');
      }
      bFix.disabled=!cut;
      fig.classList.toggle('cut',cut);
    }
    function noteFor(){
      var g=site==='g',EL=g?'elements':'element',last=g?'fuse':'safety thermostat',on=heating(),sw=TH.so-TH.sc,bw=TH.bo-TH.bc;
      if(cut)return g?'The fuse has melted at '+TH.cut+' °C and stays open for good. '+(gc?'It\'s in the neutral feed, so nothing works, power lamp included, but everything past the power switch is still at line voltage while it\'s plugged in.':'Nothing but the power lamp works.')+' Unplug it, replace what failed, then fit a new '+TH.cut+' °C fuse.'
        :'The safety thermostat has tripped at '+TH.cut+' °C and stays open, so the element is off. Unplug it, let it cool and find the cause before pressing reset.';
      if(fault==='s'&&steam)return 'The steam thermostat\'s contacts are welded shut, and the steam switch bypasses the brew thermostat, so nothing stops the '+EL+'. The '+last+' is the last line, at '+TH.cut+' °C.';
      if(fault==='s'&&!on&&bD)return 'At brew temperature: the brew thermostat has snapped open. The stuck steam thermostat makes no difference until steam goes on.';
      if(fault==='s')return 'Heating. The steam thermostat is stuck shut, but with steam off the brew thermostat still switches the '+EL+'. Switch steam on to see why the '+last+' is there.';
      if(fault==='b'&&!steam&&sD&&!on)return 'Stuck at steam temperature: the steam thermostat is doing the brew thermostat\'s job. Shots come out far too hot, but nothing overheats.';
      if(fault==='b'&&!steam&&T>TH.bo)return 'The brew thermostat\'s disc has snapped, but its contacts are welded shut, so heating runs on until the steam thermostat, in series with it, opens at '+TH.so+' °C.';
      if(steam&&!on)return 'At steam temperature: the steam thermostat has snapped open. It closes again about '+sw+' °C cooler, so the boiler swings around it.';
      if(steam&&T>=TH.bc)return 'Heating to steam temperature: the steam switch bypasses the brew thermostat, so it\'s the steam thermostat that switches the '+EL+' now.';
      if(!on&&T>TH.bo+4)return 'Cooling back to brew temperature: the brew thermostat stays open until the boiler drops to '+TH.bc+' °C.';
      if(!on)return 'At brew temperature: the brew thermostat has snapped open. It closes again about '+bw+' °C cooler, so the boiler swings up and down.';
      if(cycled)return 'Heating again: the brew thermostat closed at '+TH.bc+' °C, so the '+EL+' '+(g?'are':'is')+' back on until it opens at '+TH.bo+' °C.';
      return 'Heating: both thermostats are closed, so the '+EL+' '+(g?'are':'is')+' on.';
    }
    function say(force){if(hold>0&&!force){hold--;return}var t=held||noteFor();held='';if(t!==note.textContent)note.textContent=t}
    function tell(t){held=t;hold=RM?0:40;say(true);held=''}
    function refresh(){parts();say()}
    function changed(){if(RM){advance(site==='g'?120:240);draw(0)}refresh()}
    bSteam.addEventListener('click',function(){steam=!steam;bSteam.setAttribute('aria-pressed',String(steam));bSteam.textContent=steam?'Steam switch on':'Steam switch off';changed()});
    bRe.addEventListener('click',function(){reset();if(RM)advance(300);draw(0);hold=0;refresh()});
    fb.forEach(function(b){b.addEventListener('click',function(){fault=b.getAttribute('data-fault');fb.forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});changed()})});
    bFix.addEventListener('click',function(){
      if(!cut)return;
      /* it has to cool first: the Silvia's disc won't snap back while hot, and nobody should work on a hot Gaggia. With reduced
         motion the wait is skipped ahead to; otherwise it's a few seconds of watching it cool. */
      var pre='';
      if(T>TH.cut-25){
        if(!RM){tell(site==='g'?'Leave it unplugged to cool before working on it.':'It won\'t reset yet: the disc only snaps back once it has cooled. Leave it unplugged a while.');return}
        var w=0;while(T>TH.cut-25&&w<900){sec();w++}pre='After it cooled: ';
      }
      cut=false;parts();
      var name=fault==='b'?'brew':'steam',again=fault==='s'&&steam;
      tell(pre+(site==='g'?'New fuse fitted.':'Reset.')+(again?' The steam thermostat is still stuck and steam is on, so it will '+(site==='g'?'melt':'trip')+' again: replace the stuck thermostat first.'
        :fault!=='none'?' The '+name+' thermostat is still stuck shut and needs replacing: '+(fault==='b'?'shots will come out far too hot.':'with steam on, the boiler would run away again.'):''));
      if(RM){advance(site==='g'?120:240);draw(0);parts()}
    });
    window.addEventListener(PFM.ev,function(){conf();draw(0);refresh()});
    conf();reset();if(RM)advance(300);draw(0);refresh();
    var acc=0,last=0;
    onScreen(fig,function(ms){acc+=last?Math.min(250,ms-last)*SPEED/1000:0;last=ms;var n=0;while(acc>=1&&n<20){acc-=1;sec();n++}if(n){parts();say()}draw(acc)},function(){last=0});
  })();

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

  /* switches and lamps: the power switch, the steam switch and both thermostats, with the boiler's temperature picked
     by hand. A lamp across a closed contact is shorted out; once the contact opens, the lamp and the element share the
     voltage, and the lamp, drawing almost nothing, takes nearly all of it. The steam switch is wired around the brew
     thermostat, so with it on heating carries on to the steam thermostat. The Silvia's heating light is the other way
     round: it's across the safety and the element, so it's lit while the thermostats are calling for heat. */
  (function(){
    var fig=$('mini-panel');if(!fig)return;
    var bp=fig.querySelector('[data-sw="pwr"]'),bst=fig.querySelector('[data-sw="steam"]'),bs=fig.querySelector('[data-sw="safe"]'),note=fig.querySelector('[data-sw-note]'),tb=qa('[data-temp]',fig);
    var on=false,steam=false,temp='cold',tripped=false,kind='pro',ctl=false;   /* ctl: the power button works through an Eco board or the E's controller */
    /* off isn't dead: a single-pole switch may break neutral, and the inlet side of any switch stays live */
    var OFF_2P='Off: both poles are open, so nothing past the switch has power. The inlet and the switch\'s input spades stay live while it\'s plugged in.',
        OFF_1P='Off: the switch breaks one wire only. If line and neutral are swapped at the inlet, everything past it stays live. Unplug before opening it.',
        OFF_CTL_G='Off, as drawn. On an Eco-board machine the button works through the board, whose circuit isn\'t published: treat its wires as mains even when it\'s off.',
        OFF_CTL_E='Off, as drawn. On the E the button works through its controller, whose switching isn\'t documented: treat its wires as mains even when it\'s off.',
        ON_TO_STEAM='Heating on to steam temperature: the steam switch bypasses the open brew thermostat, so the element keeps heating until the steam thermostat opens.',
        STEAM_EARLY=' With steam on, heating won\'t stop at brew temperature.';
    function flows(list){qa('.sw-f',fig).forEach(function(p){p.classList.toggle('on',list.indexOf(p.id)>=0)})}
    function glow(sel,v){qa('[data-lp="'+sel+'"]',fig).forEach(function(e){e.classList.toggle('glow',!!v)})}
    function upd(){
      /* bC, sC: the brew and steam thermostats closed. The brew position conducts through its thermostat or the steam switch. */
      var bC=temp==='cold',sC=temp!=='steam',pass=bC||steam;
      function ways(id){return (bC?[id]:[]).concat(steam?[id+'s']:[])}   /* through the brew thermostat, the steam switch, or both */
      fig.classList.toggle('on',on);fig.classList.toggle('steam',steam);fig.classList.toggle('bopen',!bC);fig.classList.toggle('sopen',!sC);fig.classList.toggle('tripped',tripped);
      bp.setAttribute('aria-pressed',String(on));bp.textContent=on?'Power switch on':'Power switch off';
      bst.setAttribute('aria-pressed',String(steam));bst.textContent=steam?'Steam switch on':'Steam switch off';
      tb.forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-temp')===temp))});
      if(bs){bs.setAttribute('aria-pressed',String(tripped));bs.textContent=tripped?'Safety tripped':'Safety OK'}
      glow('pwr',on);
      var heat;
      if(kind==='silvia'){
        var call=on&&sC&&pass;heat=call&&!tripped;
        fig.classList.toggle('heating',heat);glow('heat',call);glow('rk',on&&!fig.classList.contains('led'));glow('stm',on&&steam);
        flows(!on?[]:['sw-fp'].concat(heat?ways('sw-fh'):[],call?ways('sw-fl'):[]));
        note.textContent=!on?(ctl?OFF_CTL_E:OFF_2P):
          (call&&tripped)?'Safety tripped: the element gets nothing, but in the usual stock wiring the heating light stays on, because the thermostats are still calling for heat. Unplug it, let it cool and find the cause before resetting it.':
          tripped?'Safety tripped: nothing heats, and the heating light is dark because a thermostat has opened. Unplug it, let it cool and find the cause before resetting it.':
          heat?(steam&&!bC?'Heating on to steam temperature: the steam switch bypasses the open brew thermostat, so the element and the heating light stay on until the steam thermostat opens.':'Heating: the thermostats are closed, so the element and the heating light both get the full voltage.'+(steam?STEAM_EARLY:'')):
          !sC?'At steam temperature: the steam thermostat opens, so no current flows through the heating light and it goes dark'+(steam?': steam is ready.':'.')+' The element still sits at line.':
          'At brew temperature: the brew thermostat opens, so no current flows through the heating light and it goes dark. The element still sits at line.'+(steam?'':' Switch steam on to keep heating.');
        return;
      }
      if(kind==='gc'){
        var tp=sC&&pass,rd=on&&!tp;heat=on&&tp;
        fig.classList.toggle('heating',heat);glow('rdy',rd);
        flows(!on?[]:['sw-fpg'].concat(heat?ways('sw-fhg'):[],rd?['sw-frg']:[]));
        note.textContent=!on?OFF_1P:
          heat?(steam&&!bC?ON_TO_STEAM:'Heating: the closed thermostats short out the ready lamp, so it stays dark and the element gets the full voltage.'+(steam?STEAM_EARLY:'')):
          !sC?'At steam temperature: the steam thermostat opens, so the ready lamp lights'+(steam?': steam is ready.':'.')+' The element is still wired in, so treat it as live.':
          'At brew temperature: the brew thermostat opens. A tiny current through the ready lamp and the element lights the lamp, far too little to heat. The element is still wired in, so treat it as live.'+(steam?'':' Switch steam on to keep heating.');
        return;
      }
      var sL=on&&!sC&&pass,bL=on&&sC&&!bC&&!steam;heat=on&&sC&&pass;
      fig.classList.toggle('heating',heat);glow('brw',bL);glow('stm',sL);
      flows(!on?[]:['sw-fp'].concat(heat?ways('sw-fh'):[],sL?['sw-fsl']:[],bL?['sw-fbl']:[]));
      note.textContent=!on?(ctl?OFF_CTL_G:OFF_2P):
        heat?(steam&&!bC?ON_TO_STEAM:'Heating: both thermostats are closed, so they short out both lamps and the element gets the full voltage.'+(steam?STEAM_EARLY:'')):
        bL?'At brew temperature: the brew thermostat opens. A tiny current through the brew lamp and the element lights the lamp, far too little to heat, though both ends of the element still sit at line. Switch steam on to keep heating.':
        sL?'At steam temperature: the steam thermostat opens, so the steam lamp lights the same way: steam is ready. The element still sits at line.':
        'Steam temperature with steam off: both thermostats are open, so the two lamps share the voltage in series; whether they glow isn\'t documented. The element still sits at line, and the boiler cools back to brew temperature.';
    }
    function tPower(){on=!on;upd()}
    function tSteam(){steam=!steam;upd()}
    bp.addEventListener('click',tPower);bst.addEventListener('click',tSteam);
    tb.forEach(function(b){b.addEventListener('click',function(){temp=b.getAttribute('data-temp');upd()})});
    if(bs)bs.addEventListener('click',function(){tripped=!tripped;upd()});
    qa('[data-fr="pwr"],#sw-rock',fig).forEach(function(e){e.addEventListener('click',tPower)});
    qa('[data-fr="steam"]',fig).forEach(function(e){e.addEventListener('click',tSteam)});
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
