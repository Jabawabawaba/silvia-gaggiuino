  /* ---------- back-links from the wiring drawing ----------
     For whatever is picked (a run, a part or a set of runs), every place on the site whose instructions link to it.
     Found from those pages' own link data, so the two directions can't drift apart: the part guides' step map fields
     (part-guides-data.js), the runbook steps' (runbook-phases.js), the troubleshooting symptoms' (trouble-data.js)
     and the power-on checks' MAPS (checks-map.js, titles pulled from checks.tpl.html at build), plus the LED switch
     mod's wiring step.
     Whole-harness and layer links are left out: they point at everything. */
  var REFS=(function(){
    var PGD=(function(){
%%INCLUDE:part-guides-data.js%%
      return G;
    })();
    var RB=(function(){
%%INCLUDE:runbook-phases.js%%
      return PHASES;
    })();
    var TR=(function(){
%%INCLUDE:trouble-data.js%%
      return T;
    })();
    var CK=(function(){
%%INCLUDE:checks-map.js%%
      return MAPS;
    })();
    var CKT=%%CHECK_INDEX%%;
    var LINK={runbook:'%%LINK_RUNBOOK%%',checks:'%%LINK_CHECKS%%',trouble:'%%LINK_TROUBLE%%',led:'%%LINK_LED%%',guides:'%%LINK_GUIDES%%'};
    var GNAME={tc:'Thermocouple',ps:'Pressure sensor',wire:'Making the wires',ssr:'SSR',sw:'Switches',scr:'Screen housing',tof:'ToFnLED',fw:'Firmware updates',scl:'Hardware scales'};
    /* cables that come with their parts: nothing to make */
    var MADE=['LV9','LV10','LV11','OP1','OP2'];
    /* the LED switch mod's own wiring step: the switch signal and ground runs, and the LED runs */
    var LED=[['LED switch mod, step 8: Wire it in','#s8','runs:LV1,LV2,LV3,LV4,LV5,LV6,OP3,OP4,OP5']];
    function M(){return window.SilviaMachine||null}
    function ok(w){var m=M();return !w||!m||m.matches(w)}
    function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function base(u){return String(u).split('#')[0]}
    function targets(map){if(map==null)return [];return typeof map==='string'?[[null,map]]:map}
    function resolve(t,c){
      var out={runs:[],part:null};
      String(t||'').split(';').forEach(function(x){
        var i=x.indexOf(':');if(i<0)return;var k=x.slice(0,i),val=x.slice(i+1);
        if(k==='run')val.split('|').some(function(id){if(c.hasRun(id)){out.runs.push(id);return true}return false});
        else if(k==='part')val.split('|').some(function(id){if(c.hasPart(id)){out.part=id;return true}return false});
        else if(k==='runs')val.split(',').forEach(function(id){if(c.hasRun(id))out.runs.push(id)});
        else if(k==='short')val.split(',').forEach(function(p){c.runs.forEach(function(r){if(r.short&&r.short.indexOf(p)===0)out.runs.push(r.id)})});
      });
      return out;
    }
    /* a part covers the runs that land on it, except the PCB, where everything lands */
    function covers(res,sel,c){
      var runs=res.runs.slice();
      if(res.part&&res.part!=='pcb')runs=runs.concat(c.landing(res.part));
      if(sel.t==='run')return runs.indexOf(sel.id)>=0;
      if(sel.t==='part'){if(res.part===sel.id)return true;if(sel.id==='pcb')return false;var l=c.landing(sel.id);return res.runs.some(function(r){return l.indexOf(r)>=0})}
      if(sel.t==='set')return runs.some(function(r){return sel.ids.indexOf(r)>=0});
      return false;
    }
    function hit(map,sel,c){return targets(map).some(function(x){return ok(x[2])&&covers(resolve(x[1],c),sel,c)})}
    function overlap(map,part,c){var l=c.landing(part),seen={};targets(map).forEach(function(x){if(!ok(x[2]))return;resolve(x[1],c).runs.forEach(function(r){if(l.indexOf(r)>=0)seen[r]=1})});return Object.keys(seen).length}
    function hitDirect(map,sel,c){return targets(map).some(function(x){if(!ok(x[2]))return false;var r=resolve(x[1],c);return sel.t==='part'?r.part===sel.id:covers({runs:r.runs,part:null},sel,c)})}
    function tslug(i){var s='t-'+TR[i].s.toLowerCase().replace(/\{[a-z]+\}/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60),n=0;for(var j=0;j<i;j++)if(TR[j].s===TR[i].s)n++;return n?s+'-'+(n+1):s}
    function fillT(s){var m=M();return String(s).replace(/\{gfci\}/g,m?m.text('gfci'):'GFCI or RCD').replace(/\{outlet\}/g,m?m.text('outlet'):'GFCI- or RCD-protected outlet').replace(/\{volts\}/g,m?m.text('volts'):'your mains voltage')}
    function html(sel,c){
      if(!sel)return '';
      var groups=[];
      /* part guides: one link per guide, to the first step (of the ones shown for this Silvia) that covers it */
      var pg=[],wired=false;
      Object.keys(GNAME).forEach(function(k){
        var d=PGD[k];if(!d)return;
        var shown=(d.steps.all||(d.vars?d.steps[d.def()]:[])||[]).filter(function(s){return ok(s.when)}),at=-1;
        /* a step that names the pick itself beats one that only covers it through a part */
        for(var i=0;i<shown.length&&at<0;i++)if(hitDirect(shown[i].map,sel,c))at=i;
        /* otherwise the first step that covers it; for a part, the one that covers most of the runs landing on it */
        if(at<0){var best=0,pick=-1;
          for(i=0;i<shown.length;i++)if(hit(shown[i].map,sel,c)){if(sel.t!=='part'){pick=i;break}var n=overlap(shown[i].map,sel.id,c);if(n>best||pick<0){if(n>best)best=n;pick=i}}
          at=pick}
        if(at>=0){pg.push('<a href="'+base(LINK.guides)+'#'+k+'/'+(at+1)+'">'+e(GNAME[k]+', step '+(at+1)+': '+shown[at].t)+'</a>');if(k==='wire')wired=true}
      });
      /* every wire you make: how to make it, and the bare-spade step when it has a boiler end */
      if(sel.t==='run'&&!wired&&MADE.indexOf(sel.id)<0){
        var r=c.runs.filter(function(x){return x.id===sel.id})[0];
        if(r){
          var bare=/Uninsulated/.test((r.ends||[]).join(' ')),ws=(PGD.wire.steps.all||[]).filter(function(s){return ok(s.when)}),bi=-1;
          ws.forEach(function(s,i){if(bi<0&&/^Bare spades/.test(s.t))bi=i});
          pg.push(bare&&bi>=0?'<a href="'+base(LINK.guides)+'#wire/'+(bi+1)+'">'+e('Making the wires, step '+(bi+1)+': '+ws[bi].t)+'</a>':'<a href="'+base(LINK.guides)+'#wire">Making the wires</a>');
        }
      }
      if(pg.length)groups.push(['Part guides',pg]);
      var rb=[];
      RB.forEach(function(p,pi){p.steps.forEach(function(s){
        if(s.map==null||!ok(s.w))return;
        if(hit(s.map,sel,c))rb.push('<a href="'+base(LINK.runbook)+'#'+s.id+'">'+e('Phase '+pi+': '+fillT(s.t))+'</a>');
      })});
      if(rb.length)groups.push(['Runbook',rb]);
      var ck=[];
      CKT.forEach(function(x){
        var t=CK[x[0]];if(!t)return;
        if(covers(resolve(t,c),sel,c))ck.push('<a href="'+base(LINK.checks)+'#'+x[0]+'" title="'+e(x[1])+'">'+x[0]+'</a>');
      });
      if(ck.length)groups.push(['Power-on checks',ck]);
      var tr=[];
      TR.forEach(function(t,i){
        if(t.map==null||!ok(t.w))return;
        if(hit(t.map,sel,c))tr.push('<a href="'+base(LINK.trouble)+'#'+tslug(i)+'">'+e(fillT(t.s))+'</a>');
      });
      if(tr.length)groups.push(['Troubleshooting',tr]);
      var led=LED.filter(function(x){return covers(resolve(x[2],c),sel,c)}).map(function(x){return '<a href="'+base(LINK.led)+x[1]+'">'+e(x[0])+'</a>'});
      if(led.length)groups.push(['Mods',led]);
      if(!groups.length)return '';
      return '<div class="d-refs"><span class="k">Elsewhere on the site</span><ul>'+groups.map(function(g){
        return '<li><span class="rg">'+g[0]+'</span>'+g[1].join(g[0]==='Power-on checks'?' ':'<span class="sep"> · </span>')+'</li>';
      }).join('')+'</ul></div>';
    }
    return {html:html};
  })();
