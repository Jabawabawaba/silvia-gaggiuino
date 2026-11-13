/* Runbook figures, shared by the Gaggia and Silvia runbooks (the same file on both sites).
   - Part guide players: a part guide's drawing (part-*.svg.html, moves from part-guides-data.js) shown inside a runbook step,
     stepping through just the guide steps that match it. Spec ['g', guide, variant, [guide step titles], when].
     variant: null for guides without variants, a variant key ('ptb'), or '@name' to ask the page (cfg.variant).
   - Diagrams drawn here: ['d', name, options, when]. Each is one or more small SVG panels with a caption.
   - Official photos: thumbnails that open in a viewer, loaded from the official docs' own addresses, with credit.
   - Power badges: what's powered while you do a step (unplugged, USB only, mains on, hot).
   The page calls RBF.init(cfg) once with its conditions and data, RBF.figs(step) and RBF.pics(step) while it builds a
   step's Step by step panel, and RBF.mount(root) after it puts the phase on the page. */
var RBF=(function(){
  var C={},RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,REG=[],UID=0,IO=null,EASE='cubic-bezier(.45,0,.2,1)';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function ok(w){return !w||!C.ok||C.ok(w)}
  function init(cfg){C=cfg||{}}

  /* ---------- power badges ---------- */
  var PW={off:['Unplugged','Mains cord out of the wall. Nothing in the machine is powered.'],
    usb:['USB power only','The PCB runs from a USB-C cable. Mains cord out.'],
    on:['Mains on','Plugged in and switched on. Covers stay on; hands stay out of the machine.'],
    hot:['Mains on, hot','Plugged in and hot: the boiler, group, steam and wand can burn.']};
  var PWI={off:'<path d="M5 3l14 18M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-2 4M12 16v5"/>',
    usb:'<path d="M12 3v14M8 7l4-4 4 4M12 13l-4-2V9M12 11l4-2V7M12 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>',
    on:'<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
    hot:'<path d="M12 21c-4 0-6-3-6-6 0-4 4-6 4-10 3 2 4 4 4 6 1-1 2-2 2-3 2 2 2 4 2 7 0 3-2 6-6 6z"/>'};
  function icon(k){return '<svg class="pwi" viewBox="0 0 24 24" aria-hidden="true">'+PWI[k]+'</svg>'}
  function badge(k){if(!PW[k])return '';return '<span class="pw pw-'+k+'" title="'+esc(PW[k][1])+'">'+icon(k)+esc(PW[k][0])+'</span>'}
  var PWS={off:'cord out of the wall',usb:'bench, PCB on USB-C',on:'covers on, hands out',hot:'can burn'};
  function legend(){return '<div class="pwlegend" aria-label="What the power badges mean"><span class="k">Power badges</span>'+['off','usb','on','hot'].map(function(k){return '<span class="pwl">'+badge(k)+'<span>'+esc(PWS[k])+'</span></span>'}).join('')+'</div>'}

  /* ---------- official photos ---------- */
  function pics(list){
    list=(list||[]).filter(function(p){return ok(p[2])});if(!list.length)return '';
    var id=REG.length;REG.push({pics:list});
    return '<div class="rph"><span class="rlbl">Official photos</span><div class="rph-strip" data-rph="'+id+'">'+list.map(function(p,i){
      return '<button type="button" class="rph-t" data-i="'+i+'" aria-label="'+esc('Open the official photo: '+p[0])+'"><img src="'+esc(p[1])+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add(\'bad\')"><span>'+esc(p[0])+'</span></button>'}).join('')+'</div>'
      +'<p class="rph-c">From the official Gaggiuino docs, loaded from their site. Tap one to see it larger.</p></div>';
  }
  var DLG=null,DL=null,DI=0;
  function viewer(list,i){
    if(!DLG){
      DLG=document.createElement('dialog');DLG.className='rbx';DLG.setAttribute('aria-label','Official photo');
      DLG.innerHTML='<div class="rbx-in"><div class="rbx-img"><img alt=""><p class="rbx-bad" hidden>This photo didn\'t load here. Open it on the official site with the link below.</p></div>'
        +'<div class="rbx-bar"><button type="button" class="rbx-b" data-x="p" aria-label="Previous photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>'
        +'<p class="rbx-cap" aria-live="polite"></p><button type="button" class="rbx-b" data-x="n" aria-label="Next photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>'
        +'<button type="button" class="rbx-b rbx-x" data-x="x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>';
      document.body.appendChild(DLG);
      var img=DLG.querySelector('img');
      img.addEventListener('error',function(){img.hidden=true;DLG.querySelector('.rbx-bad').hidden=false});
      DLG.addEventListener('click',function(e){var b=e.target.closest('[data-x]');
        if(b){var x=b.getAttribute('data-x');if(x==='x')DLG.close();else show(DI+(x==='n'?1:-1));return}
        if(e.target===DLG)DLG.close()});
      DLG.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();show(DI+1)}else if(e.key==='ArrowLeft'){e.preventDefault();show(DI-1)}});
    }
    DL=list;show(i);
    if(!DLG.open){try{DLG.showModal()}catch(e){DLG.setAttribute('open','')}}
  }
  function show(i){
    var n=DL.length;DI=(i+n)%n;var p=DL[DI],img=DLG.querySelector('img');
    img.hidden=false;DLG.querySelector('.rbx-bad').hidden=true;img.referrerPolicy='no-referrer';img.src=p[1];img.alt=p[0];
    DLG.querySelector('.rbx-cap').innerHTML='<b>'+esc(p[0])+'</b> '+(n>1?'<span class="n">'+(DI+1)+' of '+n+'</span> ':'')+'<span class="cr">Official Gaggiuino photo · <a href="'+esc(p[1])+'" target="_blank" rel="noopener">open the original</a></span>';
    Array.prototype.forEach.call(DLG.querySelectorAll('[data-x="p"],[data-x="n"]'),function(b){b.hidden=n<2});
  }

  /* ---------- figures in a step ---------- */
  function figs(list){
    list=(list||[]).filter(function(f){return ok(f[4]||(f[0]==='d'?f[3]:null))});
    var h='';
    list.forEach(function(f){
      if(f[0]==='g'){
        var p=gPlan(f);if(!p)return;
        var id=REG.length;REG.push(p);
        h+='<figure class="pg-fig rfig" data-rf="'+id+'" style="--ar:'+p.ar+'"><div class="rfig-art" role="img" aria-label="'+esc(p.label)+'"></div>'
          +'<div class="pg-ctl"><button type="button" class="pg-prev" aria-label="Previous drawing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><span class="pg-pos" aria-live="polite"></span><button type="button" class="pg-next" aria-label="Next drawing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button><button type="button" class="pg-again" aria-label="Play this drawing again"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg></button></div>'
          +'<figcaption class="rfig-cap"></figcaption></figure>';
      }else if(f[0]==='d'&&D[f[1]]){
        var o=D[f[1]](f[2]||{});if(!o)return;
        h+='<figure class="rdia'+(o.wide?' wide':'')+'"'+(o.min?' style="--pmin:'+o.min+'px"':'')+'><div class="rdia-p">'+o.panels.map(function(p){return '<div class="rdp">'+p+'</div>'}).join('')+'</div>'+(o.cap?'<figcaption>'+o.cap+'</figcaption>':'')+'</figure>';
      }
    });
    return h?'<div class="rfigs">'+h+'</div>':'';
  }

  /* a guide player's plan: which drawing, which of its steps */
  function gPlan(f){
    var G=C.G||{},d=G[f[1]];if(!d)return null;
    var v=f[2]||null;
    if(v&&v.charAt(0)==='@')v=C.variant?C.variant(v.slice(1),d):null;
    if(d.vars){if(!v||!d.vars.some(function(x){return x.k===v}))v=d.def?d.def():d.vars[0].k}else v='all';
    var all=(d.steps[v]||d.steps.all||[]).filter(function(s){return C.m?C.m(s.when):true});
    /* titles: 'all', a list (an entry can be [title, when]), or a list per variant */
    var want=f[3]==='all'?all.map(function(s){return s.t}):Array.isArray(f[3])?f[3]:(f[3]&&f[3][v])||[];
    var sel=[];want.forEach(function(t){if(Array.isArray(t)){if(!ok(t[1]))return;t=t[0]}for(var i=0;i<all.length;i++)if(all[i].t===t){if(sel.indexOf(i)<0)sel.push(i);break}});
    if(!sel.length)return null;sel.sort(function(a,b){return a-b});
    var svgId=d.svgs?d.svgs[v]:d.svg,tpl=document.getElementById('rbt-'+svgId);if(!tpl)return null;
    var vb=/viewBox="([\d.\s-]+)"/.exec(tpl.innerHTML),ar='480/300';if(vb){var a=vb[1].trim().split(/\s+/);ar=a[2]+'/'+a[3]}
    return {g:f[1],d:d,v:v,all:all,sel:sel,svgId:svgId,ar:ar,head:f[5]||'',label:(f[5]?f[5]+'. ':'')+'Drawing from the part guides: '+sel.map(function(i){return all[i].t}).join(', ')};
  }

  /* ---------- the player (the part guides' own engine, cut down) ---------- */
  function num(v,dv){return v==null?dv:v}
  function tf(s){return 'translate('+num(s.x,0)+'px,'+num(s.y,0)+'px) rotate('+num(s.r,0)+'deg) scale('+num(s.sx,num(s.s,1))+','+num(s.sy,num(s.s,1))+')'}
  function clone(o){var r={};for(var k in o){r[k]={};for(var p in o[k])r[k][p]=o[k][p]}return r}
  function merge(st,k,props){if(!st[k])st[k]={};for(var p in props)st[k][p]=props[p]}
  var CH={x:'t',y:'t',r:'t',s:'t',sx:'t',sy:'t',o:'o',d:'d'};
  function chanVal(s,c){s=s||{};return c==='t'?tf(s):c==='o'?String(num(s.o,1)):String(num(s.d,0))}
  function prop(c){return c==='t'?'transform':c==='o'?'opacity':'strokeDashoffset'}

  function Player(fig,p){
    this.fig=fig;this.p=p;this.k=0;this.anims=[];this.timers=[];this.played=false;
    var tpl=document.getElementById('rbt-'+p.svgId),self=this,u='-r'+(++UID);
    var box=fig.querySelector('.rfig-art');box.innerHTML=tpl.innerHTML;
    var svg=this.svg=box.querySelector('svg');
    /* ids made unique per copy, so a step can show the same drawing twice */
    var map={};Array.prototype.forEach.call(svg.querySelectorAll('[id]'),function(e){var o=e.id;map[o]=o+u;e.id=o+u});
    svg.removeAttribute('id');svg.setAttribute('aria-hidden','true');svg.removeAttribute('role');svg.removeAttribute('aria-labelledby');
    Array.prototype.forEach.call(svg.querySelectorAll('*'),function(e){['clip-path','mask','fill','stroke','filter'].forEach(function(a){var v=e.getAttribute(a);if(v&&v.indexOf('url(#')>=0)e.setAttribute(a,v.replace(/url\(#([^)]+)\)/g,function(_,i){return 'url(#'+(map[i]||i)+')'}))})});
    /* which pieces show: variants, conditions, family and mains voltage, as on the part guides page */
    var d=p.d,v=p.v;
    Array.prototype.forEach.call(svg.querySelectorAll('[data-when]'),function(e){e.style.display=(!C.m||C.m(e.getAttribute('data-when')))?'':'none'});
    Array.prototype.forEach.call(svg.querySelectorAll('[data-v]'),function(e){var dv=e.getAttribute('data-v');e.style.display=(d.vars?dv===v:(C.dv?C.dv(dv):false))?'':'none'});
    var fam=(C.famOf&&C.famOf())||'GCP';
    Array.prototype.forEach.call(svg.querySelectorAll('[data-fam]'),function(e){e.style.display=e.getAttribute('data-fam')===fam?'':'none'});
    var volts=(C.prof&&C.prof().volts)||120;
    Array.prototype.forEach.call(svg.querySelectorAll('[data-volts]'),function(e){e.style.display=Number(e.getAttribute('data-volts'))===volts?'':'none'});
    function hidden(e){for(var q=e;q&&q!==svg;q=q.parentNode){if(q.style&&q.style.display==='none')return true}return false}
    this.el={};
    Array.prototype.forEach.call(svg.querySelectorAll('[data-k]'),function(e){var k=e.getAttribute('data-k');if(hidden(e)&&self.el[k])return;self.el[k]=e;
      e.style.transformBox=e.getAttribute('data-box')==='view'?'view-box':'fill-box';e.style.transformOrigin=e.getAttribute('data-origin')||'center'});
    this.base=d.base[v]||d.base;this.states=[];var st=clone(this.base);
    p.all.forEach(function(s){(s.a||[]).forEach(function(op){merge(st,op[0],op[1])});self.states.push(clone(st))});
    var q=function(s){return fig.querySelector(s)};
    q('.pg-prev').addEventListener('click',function(){self.go(self.k-1,true)});
    q('.pg-next').addEventListener('click',function(){self.go(self.k+1,true)});
    q('.pg-again').addEventListener('click',function(){self.go(self.k,true)});
    fig.addEventListener('keydown',function(e){if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&e.target.closest('.pg-ctl')){e.preventDefault();self.go(self.k+(e.key==='ArrowRight'?1:-1),true)}});
    this.go(0,false);
  }
  Player.prototype.stop=function(){
    this.anims.forEach(function(a){try{a.cancel()}catch(e){}});this.anims=[];
    this.timers.forEach(function(t){clearTimeout(t);cancelAnimationFrame(t)});this.timers=[];
    Array.prototype.forEach.call(this.svg.querySelectorAll('[data-loop]'),function(e){e.classList.remove('run')});
    Array.prototype.forEach.call(this.svg.querySelectorAll('[data-run]'),function(e){e.classList.remove('on')});
  };
  Player.prototype.apply=function(st){
    for(var k in this.el){var e=this.el[k],s=st[k]||{};
      e.style.transform=tf(s);e.style.opacity=String(num(s.o,1));
      if(e.classList.contains('draw')){e.style.strokeDashoffset=String(num(s.d,0));if(num(s.d,0)>=1)e.style.opacity='0'}}
  };
  Player.prototype.go=function(k,anim){
    var p=this.p;if(k<0||k>=p.sel.length)return;
    this.stop();this.k=k;var i=p.sel[k],step=p.all[i],before=i>0?this.states[i-1]:this.base,after=this.states[i],self=this;
    this.apply(after);
    if(anim){this.played=true;if(!RM&&this.svg.animate){
      var cur=clone(before),lines={};
      (step.a||[]).forEach(function(op){
        var key=op[0],e=self.el[key];if(!e)return;
        var nxt=clone(cur);merge(nxt,key,op[1]);var chans={};for(var pp in op[1])chans[CH[pp]]=1;
        for(var c in chans){if(c==='d'&&!e.classList.contains('draw'))continue;
          var lk=key+'|'+c;if(!lines[lk])lines[lk]={e:e,c:c,pts:[[0,chanVal(cur[key],c)]]};
          lines[lk].pts.push([op[2],chanVal(cur[key],c)],[op[2]+op[3],chanVal(nxt[key],c)])}
        cur=nxt});
      for(var lk in lines){var L=lines[lk],end=L.pts[L.pts.length-1][0]||1,kf=[];
        L.pts.forEach(function(pt){var fr={offset:Math.min(1,pt[0]/end)};fr[prop(L.c)]=pt[1];fr.easing=EASE;if(kf.length&&fr.offset<kf[kf.length-1].offset)fr.offset=kf[kf.length-1].offset;kf.push(fr)});
        try{this.anims.push(L.e.animate(kf,{duration:end,fill:'both'}))}catch(err){}
        if(L.c==='d'&&L.pts[0][1]==='1'&&L.pts.length>1){var t0=L.pts[1][0];try{this.anims.push(L.e.animate([{opacity:0,offset:0},{opacity:0,offset:Math.min(1,t0/end)},{opacity:1,offset:Math.min(1,t0/end)},{opacity:1,offset:1}],{duration:end,fill:'both'}))}catch(err){}}
      }}}
    /* loops and readouts */
    (step.loop||[]).forEach(function(n){Array.prototype.forEach.call(self.svg.querySelectorAll('[data-loop="'+n+'"]'),function(e){e.classList.add('run')});Array.prototype.forEach.call(self.svg.querySelectorAll('[data-run="'+n+'"]'),function(e){e.classList.add('on')})});
    if(step.count){var c=step.count,el=this.svg.querySelector('[data-k="'+c[0]+'"]');if(el){
      if(!anim||RM)el.textContent=c[2]+c[3];
      else{el.textContent=c[1]+c[3];var s0=null,tick=function(ts){if(s0===null)s0=ts;var pr=Math.min(1,Math.max(0,(ts-s0-c[4])/c[5]));el.textContent=(c[1]+(c[2]-c[1])*(1-Math.pow(1-pr,2))).toFixed(1).replace(/\.0$/,'')+c[3];if(pr<1)self.timers.push(requestAnimationFrame(tick))};self.timers.push(requestAnimationFrame(tick))}}}
    /* controls and caption */
    var n=p.sel.length,f=this.fig;
    f.querySelector('.pg-pos').textContent=n>1?'Drawing '+(k+1)+' of '+n:'Drawing';
    f.querySelector('.pg-prev').disabled=k<=0;f.querySelector('.pg-next').disabled=k>=n-1;
    f.querySelector('.pg-prev').hidden=f.querySelector('.pg-next').hidden=n<2;
    var dtx=C.T?C.T(step.d):(typeof step.d==='string'?step.d:'');
    var href=(C.guides||'part-guides.html')+'#'+p.g+(p.d.vars?'/'+p.v:'')+'/'+(i+1);
    f.querySelector('.rfig-cap').innerHTML=(p.head?'<span class="rfig-h">'+esc(p.head)+'</span>':'')+'<b>'+esc(step.t)+'</b> '+esc(dtx)+' <a href="'+esc(href)+'" target="_blank" rel="noopener">Part guide, step '+(i+1)+'</a>';
  };

  /* lazy: a drawing goes in when its figure nears the screen, and plays once when it's mostly in view */
  function mount(root){
    Array.prototype.forEach.call(root.querySelectorAll('.rph-strip'),function(s){
      s.addEventListener('click',function(e){var b=e.target.closest('.rph-t');if(!b)return;var r=REG[+s.getAttribute('data-rph')];if(r)viewer(r.pics,+b.getAttribute('data-i'))})});
    var figsEl=root.querySelectorAll('.rfig[data-rf]');if(!figsEl.length)return;
    function make(f){if(f._pl)return f._pl;var p=REG[+f.getAttribute('data-rf')];if(!p)return null;try{f._pl=new Player(f,p)}catch(e){f.hidden=true}return f._pl}
    if(!('IntersectionObserver' in window)){Array.prototype.forEach.call(figsEl,make);return}
    var near=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){make(e.target);near.unobserve(e.target)}})},{rootMargin:'300px 0px'});
    var seen=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var pl=make(e.target);if(pl&&!pl.played)pl.go(pl.k,true);seen.unobserve(e.target)}})},{threshold:.5});
    Array.prototype.forEach.call(figsEl,function(f){near.observe(f);seen.observe(f)});
  }
  function reset(){REG=[]}

  /* ---------- diagrams drawn for the runbook ---------- */
  function T(x,y,s,c,a){return '<text x="'+x+'" y="'+y+'"'+(c?' class="'+c+'"':'')+(a?' text-anchor="'+a+'"':'')+'>'+esc(s)+'</text>'}
  function TL(x,y,s,c,a,lh){return String(s).split('\n').map(function(t,i){return T(x,y+i*(lh||14),t,c,a)}).join('')}
  function R(x,y,w,h,c,rx){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"'+(rx?' rx="'+rx+'"':'')+(c?' class="'+c+'"':'')+'/>'}
  function P(d,c){return '<path d="'+d+'"'+(c?' class="'+c+'"':'')+'/>'}
  function Ci(x,y,r,c){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"'+(c?' class="'+c+'"':'')+'/>'}
  /* a panel: drawn in its own units, never shown more than a third larger than that */
  function S(w,h,body,label){return '<svg class="rd" viewBox="0 0 '+w+' '+h+'" style="max-width:'+Math.round(w*1.35)+'px" role="img" aria-label="'+esc(label)+'">'+body+'</svg>'}
  var D={};

  /* the PCB, top view, laid out like the official board label drawing (PCB v3.1 and v4) */
  var HD={J6:[78,30,['5V','GND','P'],'l'],J7:[78,88,['GND','S','B'],'r'],J8:[38,104,['D2','5V','GND','CLK','D1'],'l'],J5:[78,146,['GND','B15','A12'],'r'],J1:[38,193,['GND','TX','RX','5V'],'l'],J9:[78,204,['GND','R1','R2'],'r']};
  function box(on,x,y,w,h){return on?R(x,y,w,h,on==='x'?'pcb-x':'pcb-hl',4):''}
  function hdr(k,on){var a=HD[k],X=a[0],Y=a[1],n=a[2].length,h=n*11+6,s=box(on,X-3,Y-17,20,h+20);
    s+=R(X,Y,14,h,'pcb-hd',2);
    a[2].forEach(function(t,i){var y=Y+8.5+i*11;s+=Ci(X+7,y,2.6,'pcb-pin')+T(a[3]==='l'?X-6:X+20,y+3,t,'pcb-pl',a[3]==='l'?'end':'start')});
    return s+T(X+7,Y-5,k,'pcb-jn'+(on==='on'?' on':''),'middle');}
  var PCBROW={J1:['J1','Screen cable'],J2:['J2','ToFnLED, on the back'],J4:['J4','Thermocouple: − and +'],J6:['J6','Pressure sensor'],J7:['J7','Brew and steam switches'],J8:['J8','Hardware scales'],J9:['J9','SSR control: + and −'],J5:['J5','Extra IO, unused'],J27:['J27','Programming, unused'],USB:['USB-C','USB power, bench only'],MAINS:['J10 to J13','Mains: N, L, pump, valve']};
  D.pcb=function(o){
    var on=o.on||[],x=o.x||[],note=o.note||{},b='';
    function st(k){return on.indexOf(k)>=0?'on':x.indexOf(k)>=0?'x':''}
    b+=R(6,6,176,358,'pcb-b',8);
    ['J6','J7','J8','J5','J1','J9'].forEach(function(k){b+=hdr(k,st(k))});
    b+=T(66,258,'JST-PH 2 mm','pcb-pl','middle');
    var s27=st('J27');b+=box(s27,104,10,40,48)+R(108,24,32,9,'pcb-hd',1.5)+P('M113,33v14M119,33v14M125,33v14M131,33v14','pcb-lead')+T(124,19,'J27','pcb-jn','middle');
    var s4=st('J4');b+=box(s4,144,6,36,60)+R(148,24,28,20,'pcb-tb',2)+Ci(155,34,4.2,'pcb-sc')+Ci(169,34,4.2,'pcb-sc')+P('M152,34h6M166,34h6M169,31v6','pcb-scl')+T(155,56,'−','pcb-pm','middle')+T(169,56,'+','pcb-pm','middle')+T(162,19,'J4','pcb-jn'+(s4==='on'?' on':''),'middle');
    /* USB-C, and J2 on the underside (dashed) */
    var su=st('USB');b+=box(su,110,238,44,32)+R(116,255,32,9,'pcb-usb',4.5)+T(132,250,'USB-C','pcb-jn'+(su==='on'?' on':''),'middle');
    var s2=st('J2');b+=box(s2,146,192,34,42)+R(152,212,24,8,'pcb-j2',1.5)+T(164,206,'J2','pcb-jn'+(s2==='on'?' on':''),'middle')+T(164,230,'back','pcb-pl','middle');
    var sm=st('MAINS');b+=box(sm,18,280,86,78);
    [['3','J13'],['P','J12'],['L','J11'],['N','J10']].forEach(function(t,i){var y=290+i*17;b+=R(26,y,22,6,'pcb-sp',1.5)+T(56,y+6.5,t[0],'pcb-jn','start')+T(70,y+6.5,t[1],'pcb-pl','start')});
    var rows=(o.rows||on.concat(x)).filter(function(k){return PCBROW[k]});
    var list='<ul class="pcbl">'+rows.map(function(k){var s=st(k),c=s==='on'?'on':s==='x'?'x':'mut';return '<li class="'+c+'"><span class="pill">'+esc(PCBROW[k][0])+'</span><span>'+esc(String(note[k]||PCBROW[k][1]).replace(/\n/g,' '))+'</span></li>'}).join('')+'</ul>';
    return [S(188,370,b,'The Gaggiuino PCB seen from above. '+rows.map(function(k){return PCBROW[k][0]+': '+String(note[k]||PCBROW[k][1]).replace(/\n/g,' ')}).join('; ')),list];
  };
  D.pcbw=function(o){return {panels:D.pcb(o),min:200,cap:o.cap||'The PCB seen from above, laid out as the official board drawing shows it (PCB v3.1 and v4). Each socket\'s name is printed on the board beside it. J2 is on the underside.'}};

  /* the thermocouple's two bare wires in J4's clamps */
  D.j4=function(){
    var b=R(100,18,120,66,'pcb-tb',6)+Ci(135,40,9,'pcb-sc')+Ci(185,40,9,'pcb-sc')+P('M129,40h12M179,40h12M185,34v12','pcb-scl')+T(135,72,'−','pcb-pm','middle')+T(185,72,'+','pcb-pm','middle')+T(160,12,'J4','rd-tb','middle');
    [135,185].forEach(function(x){b+=P('M'+x+',196V118','j4-ins')+P('M'+(x-2)+',118V88 Q'+x+',82 '+(x+2)+',88V112','j4-cu')});
    b+=P('M196,100H232','rd-ln')+T(238,96,'bare end,','rd-s')+T(238,110,'folded back','rd-s');
    b+=P('M196,124H232','rd-ln')+T(238,128,'insulation','rd-s')+T(238,142,'stays out','rd-s');
    b+=T(12,110,'Which wire','rd-s')+T(12,124,'on + and −:','rd-s')+T(12,138,'the warm-hand','rd-s')+T(12,152,'test decides','rd-s');
    return {panels:[S(320,200,b,'The thermocouple in J4: each bare end folded back on itself and clamped, the insulation kept out of the clamp.')],cap:'Only folded bare wire goes under each clamp. Lead colors vary between makers, so the warm-hand test, two steps on, decides which goes on +.'};
  };

  /* the screen cable, end to end, by pin name (colors as the official drawing; batches vary) */
  var WC={GND:'w-k',TX:'w-b',RX:'w-y','5V':'w-r'};
  function scrPanel(kind){
    var b='',L=['GND','TX','RX','5V'],y0=46,X=262,lab=kind==='p4'?'Gen 3.5 screen':kind==='hl'?'Headless board':'Gen 3 screen';
    function pin(x,y){return Ci(x,y,3,'pcb-pin')}
    function wire(p,y1,y2){return P('M'+75+','+y1+' C160,'+y1+' 180,'+y2+' '+(X-8)+','+y2+' H'+(X+5),'w '+WC[p]+(p==='5V'||p==='GND'?' must':''))}
    b+=T(66,24,'J1 on the PCB','rd-tb','middle')+R(60,y0-8,18,86,'pcb-hd',2);
    L.forEach(function(p,i){var y=y0+4+i*20;b+=pin(69,y)+T(54,y+4,p,'rd-pn','end')});
    if(kind!=='s3'){
      var sock=kind==='p4'?[['5V','5V'],['IO28','RX'],['IO27','TX'],['GND','GND']]:[['5V','5V'],['TX','RX'],['RX','TX'],['GND','GND']];
      b+=T(X+9,24,lab,'rd-tb','middle')+T(X+9,36,'back, its socket','rd-s','middle')+R(X,y0-8,18,86,'pcb-hd',2);
      L.forEach(function(p,i){var j=0;sock.forEach(function(s,k){if(s[1]===p)j=k});b+=wire(p,y0+4+i*20,y0+4+j*20)});
      sock.forEach(function(s,i){var y=y0+4+i*20;b+=pin(X+9,y)+T(X+24,y+4,s[0],'rd-pn')});
      b+=TL(16,y0+108,'5V must land on 5V and GND on GND.\nThe other two wires are the data pair.','rd-s');
      return S(330,y0+130,b,'Screen cable from J1 to the '+lab+': 5V to 5V and GND to GND; the other two wires are the data pair, '+(kind==='p4'?'RX to IO28 and TX to IO27.':'RX to TX and TX to RX.'));
    }
    var A=['GND','RXD','TXD','5V'],U=['IO17','IO18','IO19','IO20'],Y2=y0+118;
    b+=T(X+9,24,lab,'rd-tb','middle')+T(X+9,36,'back, two sockets','rd-s','middle')+R(X,y0-8,18,86,'pcb-hd',2)+T(X+9,Y2-14,'UART1','rd-tm','middle')+R(X,Y2-8,18,86,'pcb-hd',2);
    [['GND',y0+4],['5V',y0+64],['RX',Y2+4],['TX',Y2+24]].forEach(function(r){b+=wire(r[0],y0+4+L.indexOf(r[0])*20,r[1])});
    A.forEach(function(t,i){var y=y0+4+i*20;b+=pin(X+9,y)+T(X+24,y+4,t,'rd-pn')});
    U.forEach(function(t,i){var y=Y2+4+i*20;b+=pin(X+9,y)+T(X+24,y+4,t,'rd-pn')});
    b+=TL(16,Y2+108,'5V and GND land on the socket marked\nGND, RXD, TXD, 5V. TX goes to IO18 and\nRX to IO17 on UART1.','rd-s');
    return S(330,Y2+148,b,'Screen cable from J1 to the Gen 3 screen: J1 5V and GND to the socket marked GND, RXD, TXD, 5V; J1 TX to IO18 and RX to IO17 on the socket marked UART1.');
  }
  D.scrpins=function(o){var k=o.scr||(C.screen&&C.screen())||null,list=k?[k]:['p4','s3','hl'];
    return {panels:list.map(scrPanel),wide:!k,min:250,cap:'Colors as the official drawing shows them. Yours may differ: blue and yellow have been swapped between cable batches, so go by the names beside the pins.'+(k?'':' Pick your screen at the top of the page to see only yours.')}};

  /* a multimeter: the zero reading, a connection, and no connection (OL) */
  function meterPanel(mode){
    var b='',lcd=mode==='open'?'OL':mode==='zero'?'0.2':'0.4',t=mode==='zero'?['1. Probes touching','A small number: your zero']:mode==='ok'?['2. Across a good wire','Close to your zero, and it beeps']:['3. Nothing connects them','OL: open, no connection'];
    b+=T(10,18,t[0],'rd-tb')+T(10,35,t[1],'rd-s');
    var g='';
    g+=R(12,14,92,150,'mt-b',10)+R(22,24,72,34,'mt-lcd',4)+T(88,50,lcd,'mt-num','end');
    if(mode!=='open')g+=T(26,37,'Ω','mt-u')+P('M28,44c2,1.5 2,4.5 0,6M32,42c3.5,3 3.5,8 0,11','mt-bw');
    g+=Ci(58,100,22,'mt-dial')+P('M58,100L42,86','mt-ptr')+T(34,80,'Ω','mt-dl','middle')+T(24,100,'·)))','mt-dl','middle')+T(82,80,'V','mt-dl','middle')+T(88,104,'A','mt-dl','middle');
    g+=Ci(36,146,5,'mt-jk')+Ci(80,146,5,'mt-jk mt-jr');
    var tip=mode==='zero'?[[178,96],[182,99]]:mode==='ok'?[[150,96],[212,96]]:[[150,96],[212,124]],k0=tip[0],k1=tip[1];
    if(mode==='ok')g+=P('M150,96 H212','mt-wire')+R(144,91,10,10,'mt-term',2)+R(208,91,10,10,'mt-term',2);
    if(mode==='open')g+=P('M150,96 H186','mt-wire')+R(144,91,12,10,'mt-term',2)+P('M212,124 H232','mt-wire')+R(206,119,12,10,'mt-term',2);
    g+=P('M36,151 C36,190 120,176 '+(k0[0]-14)+','+(k0[1]+22),'mt-lead k')+P('M80,151 C84,186 150,190 '+(k1[0]+10)+','+(k1[1]+22),'mt-lead r');
    g+=P('M'+(k0[0]-14)+','+(k0[1]+22)+'L'+k0[0]+','+k0[1],'mt-probe k')+P('M'+(k1[0]+10)+','+(k1[1]+22)+'L'+k1[0]+','+k1[1],'mt-probe r');
    return S(240,240,b+'<g transform="translate(0,40)">'+g+'</g>',t[0]+': '+t[1]);
  }
  D.meter=function(){return {panels:['zero','ok','open'].map(meterPanel),wide:true,min:190,cap:'Set the dial to the lowest Ω range, or continuity (the beep symbol). Touch the probes together first and note that small reading: it\'s the meter\'s own leads. OL on the display means open: no connection at all.'}};

  /* the SSR's control side on J9 */
  D.ssr=function(o){
    var b='',bench=o.bench!==false;
    b+=R(150,20,150,170,'ssr-b',8)+R(166,28,46,40,'ssr-tw',4)+R(238,28,46,40,'ssr-tw',4)+Ci(189,48,12,'ssr-sc')+Ci(261,48,12,'ssr-sc')+T(189,84,'3  +','rd-on','middle')+T(261,84,'4  −','rd-on','middle')+T(206,102,'DC control','rd-on','middle');
    b+=R(166,142,46,40,'ssr-tw',4)+R(238,142,46,40,'ssr-tw',4)+Ci(189,162,12,'ssr-sc')+Ci(261,162,12,'ssr-sc')+T(189,136,'1','rd-on','middle')+T(261,136,'2','rd-on','middle')+T(206,124,'AC load','rd-on','middle');
    b+='<g class="ssr-led'+(o.led?' '+o.led:'')+'">'+Ci(286,113,5,'ssr-ledc')+'</g>'+T(276,117,'LED','rd-on','end');
    b+=R(20,40,18,40,'pcb-hd',2)+Ci(29,48,3,'pcb-pin')+Ci(29,60,3,'pcb-pin')+Ci(29,72,3,'pcb-pin')+T(16,52,'GND','rd-pn','end')+T(16,64,'R1','rd-pn','end')+T(16,76,'R2','rd-pn','end')+T(29,30,'J9','rd-tb','middle');
    b+=P('M36,60 C90,60 110,48 177,48 H189','w w-o')+P('M36,48 C80,48 90,8 150,8 H246 C258,8 261,16 261,40','w w-k')+T(92,98,'R1 to +','rd-s','middle')+T(92,112,'GND to −','rd-s','middle')+T(92,126,'R2: nothing','rd-s','middle');
    if(bench)b+=T(225,208,'On the bench, 1 and 2 stay empty','rd-s','middle');
    return {panels:[S(320,216,b,'J9 to the SSR: R1 to terminal 3, plus, and GND to terminal 4, minus, on the DC control side.'+(bench?' The AC load side, 1 and 2, stays empty on the bench.':''))],cap:'Terminal numbers as most SSR-40DA relays print them: go by the + and − marks on yours. The official drawing shows the same, J9\'s R1 on the SSR\'s + and its GND on −.'};
  };
  D.ssrled=function(){
    function p(mode,t1,t2){var b=R(14,10,92,62,'ssr-b',6)+'<g class="ssr-led '+mode+'">'+Ci(60,41,9,'ssr-ledc')+'</g>'+T(60,92,t1,'rd-tb','middle')+T(60,108,t2,'rd-s','middle');return S(120,114,b,t1+': '+t2)}
    return {min:105,panels:[p('on','Steady on','calling for heat'),p('blink','Flashing','close to the target')],cap:'The SSR\'s small LED, as the official bench test describes it: on while the temperature is below the target, flashing near it. With the probe at room temperature it\'s on.'};
  };

  /* the Flush button's circle: grey, green, blue (official user manual) */
  D.flush=function(){
    function p(c,t1,t2){var b=R(10,10,100,64,'fl-b',6)+Ci(60,30,7,'fl-c '+c)+T(60,60,'Flush','fl-t','middle')+T(60,94,t1,'rd-tb','middle')+T(60,110,t2,'rd-s','middle');return S(120,116,b,'Flush button, '+t1+': '+t2)}
    return {min:105,panels:[p('g','Grey','flush mode off'),p('gr','Green','brew switch flushes'),p('bl','Blue','hold: one 5 s flush')],cap:'From the official user manual: tap Flush and its grey circle turns green, so the brew switch runs the pump to flush; tap again to leave flush mode. Tap and hold for a single 5 second flush (blue).'};
  };

  /* the pressure for [UT] Test OPV as a dial: the peak has to land in the band */
  D.opv=function(o){
    var lo=o.lo||10.5,hi=o.hi||13,max=16,cx=150,cy=140,r=104,b='';
    function a(v){return Math.PI*(1-v/max)}
    function pt(v,rr){return [cx+rr*Math.cos(a(v)),cy-rr*Math.sin(a(v))]}
    function f(n){return n.toFixed(1)}
    function arc(v1,v2,rr){var p1=pt(v1,rr),p2=pt(v2,rr);return 'M'+f(p1[0])+','+f(p1[1])+' A'+rr+','+rr+' 0 0 1 '+f(p2[0])+','+f(p2[1])}
    b+=P(arc(0,max,r),'g-arc')+P(arc(lo,hi,r),'g-band');
    for(var v=0;v<=max;v++){var p1=pt(v,r-(v%2?6:10)),p2=pt(v,r+2);b+=P('M'+f(p1[0])+','+f(p1[1])+'L'+f(p2[0])+','+f(p2[1]),'g-tick');if(v%2===0){var q=pt(v,r-22);b+=T(f(q[0]),f(q[1]+4),String(v),'rd-tm','middle')}}
    var n=pt(o.peak||11.6,r-18);b+=P('M'+cx+','+cy+'L'+f(n[0])+','+f(n[1]),'g-needle')+Ci(cx,cy,6,'g-hub');
    var lp=pt(lo,r+14),hp=pt(hi,r+14);b+=T(f(lp[0]-2),f(lp[1]),String(lo),'rd-tb','end')+T(f(hp[0]+4),f(hp[1]+4),String(hi),'rd-tb','start');
    b+=T(cx,cy-36,'bar','rd-s','middle')+T(cx,cy+26,'Peak between '+lo+' and '+hi+' bar','rd-tb','middle');
    return {panels:[S(300,176,b,'Pressure dial, 0 to 16 bar: the peak during [UT] Test OPV must land in the band from '+lo+' to '+hi+' bar.')],cap:o.cap||'The pressure during [UT] Test OPV with a blank basket, drawn as a dial. The highest reading is the one that counts.'};
  };

  /* joining Wi-Fi, in four moves */
  D.wifi=function(){
    function card(n,t1,body,t2){return S(170,150,R(4,4,162,142,'wf-b',10)+Ci(24,24,12,'wf-n')+T(24,29,n,'wf-nt','middle')+T(44,29,t1,'rd-tb')+body+(t2?T(85,138,t2,'rd-s','middle'):''),n+'. '+t1)}
    var c1=card('1','Join its Wi-Fi',R(16,44,138,26,'wf-row on',5)+P('M26,62a8,8 0 0 1 12,0M29,59a4,4 0 0 1 6,0','wf-ic')+T(46,61,'Gaggiuino AP','rd-tm')+R(16,76,138,24,'wf-row',5)+T(26,92,'or ESP_xxxxxx','rd-tm rd-m')+T(18,116,'Password','rd-s')+T(76,116,'Gaggiuin0AP','rd-pn'),'a zero for the o');
    var c2=card('2','Open the web UI',R(16,48,138,30,'wf-row',15)+T(85,67,'gaggiuino.local','rd-tm','middle')+T(85,100,'in a browser: the same','rd-s','middle')+T(85,114,'controls as the screen','rd-s','middle'),'');
    var c3=card('3','Join your network',T(18,58,'Settings, then System,','rd-s')+T(18,74,'then Connect','rd-s')+R(16,86,138,26,'wf-row on',5)+T(85,104,'Home, 2.4 GHz','rd-tm','middle'),'then its password');
    var c4=card('4','From any device',P('M30,96h44v-36h-44zM24,100h56','wf-ic')+R(104,58,26,44,'wf-ic',4)+T(85,124,'gaggiuino.local','rd-tm','middle'),'on your network');
    return {panels:[c1,c2,c3,c4],min:150,cap:'From the official user manual. Gaggiuino makes its own Wi-Fi until it joins yours, and shot history only gets the right time once it\'s on your network.'};
  };

  /* the boot on the bench */
  D.boot=function(o){
    var hl=o.scr==='hl'||(C.screen&&C.screen()==='hl');
    function scr(t1,t2){return R(14,14,132,80,'bt-s',6)+T(80,52,t1,'bt-t','middle')+(t2?T(80,70,t2,'bt-t2','middle'):'')}
    var p1=S(160,140,scr('Initialization','in progress')+T(80,118,'A few seconds,','rd-tb','middle')+T(80,133,'then it clears','rd-s','middle'),'Initialization in progress, for a few seconds');
    var p2=S(160,140,scr('Filling boiler','')+T(80,118,'Then Filling boiler','rd-tb','middle')+T(80,133,'expected on the bench','rd-s','middle'),'Filling boiler shows a few seconds after boot');
    var p3=S(160,140,R(18,40,124,46,'pcb-b',6)+T(80,30,'PCB, underside','rd-s','middle')+'<g class="bt-led">'+Ci(58,63,7,'bt-ledc')+'</g>'+T(72,67,'red LED','bt-l')+T(80,118,'The red LED lights','rd-tb','middle')+T(80,133,'at the same moment','rd-s','middle'),'A red LED on the underside of the PCB lights at the same moment');
    return {panels:[p1,p2,p3],min:140,cap:(hl?'Headless: these messages show in the web UI once you\'ve joined its Wi-Fi. ':'')+'The official bench test: the message clears, Filling boiler shows, and the red LED under the PCB comes on with it.'};
  };

  /* the thermocouple's direction: warm it and the number goes up */
  D.temp=function(o){
    var heat=o.mode==='heat',b='';
    b+=P('M40,20V150H300','tp-ax')+T(36,26,'°C','rd-s','end')+T(300,168,heat?'minutes':'seconds','rd-s','end');
    if(heat)b+=P('M40,60H300','tp-tgt')+T(296,52,'brew target','rd-s','end')+P('M40,140 C90,138 130,70 170,62 S240,60 300,60','tp-ok')+P('M40,140 C80,141 110,146 150,150','tp-bad')+T(158,146,'falling: unplug','tp-badt')+T(180,92,'climbs, then holds','tp-okt');
    else b+=P('M40,120 H90 C120,120 150,80 210,72 S280,70 300,70','tp-ok')+P('M90,120 C130,122 170,134 220,140','tp-bad')+T(226,142,'falls: swap','tp-badt')+T(46,140,'warm the tip','rd-s')+T(232,60,'goes up','tp-okt','middle');
    return {panels:[S(320,176,b,heat?'With the boiler full the temperature climbs and holds at the target; if it falls, switch off and unplug.':'Warm the thermocouple tip and the reading goes up; if it falls, the two wires are swapped in J4.')],
      cap:heat?'If the reading ever falls while the machine heats, the thermocouple is in J4 the wrong way round: switch off and unplug at once, then swap its wires.':'A K-type thermocouple only reads the right way with its wires on the right sides of J4. Warm the tip in your fingers: up means right, down means swap them.'};
  };

  /* a wire label wrapped into a flag */
  D.flag=function(){
    var b=P('M12,112H226','fg-w')+R(226,104,48,16,'fg-sp',2)+T(250,138,'end','rd-s','middle');
    b+=R(140,22,58,84,'fg-l',4)+P('M140,106 C140,118 198,118 198,106','fg-l2')+P('M169,26V102','fg-fold')+T(169,74,'L','fg-t','middle');
    b+=P('M169,124V140M226,124V140M169,132H226','rd-ln')+T(198,156,'about 30 mm','rd-s','middle');
    b+=TL(128,40,'Wrapped round\nthe wire, the\ntwo halves stuck\ntogether, text\noutward','rd-s','end',14);
    var b2=P('M12,40H212','fg-w s')+R(212,31,48,18,'fg-sp',2)+T(112,45,'L','fg-mk','middle')+TL(12,80,'At the boiler: the name in\noil-based marker on the\nsilicone jacket, no paper','rd-s','start',14);
    return {min:230,panels:[S(290,166,b,'A paper label wrapped around the wire about 30 mm from its end, the two halves stuck together with the text outward.'),S(270,124,b2,'Ends at the boiler get the name written on the silicone jacket in oil-based marker instead.')],cap:'Label each wire at both ends as you make it, and each stock connector before you move it.'};
  };

  /* the two front switches, and what each does on the first power-on */
  D.switches=function(o){
    var three=o.kind==='three',names=three?['brew','steam','water']:['brew','steam'];
    function sw(x,on,lab){return R(x,18,34,58,'sw-b',5)+R(x+5,on?24:44,24,26,'sw-r'+(on?' on':''),3)+T(x+17,92,lab,'rd-tm','middle')+T(x+17,106,on?'on':'off','rd-s','middle')}
    function p(on,t1,t2,t3){var x0=three?24:40,dx=three?62:56;return S(three?210:170,170,names.map(function(n,i){return sw(x0+i*dx,on.indexOf(n)>=0,n)}).join('')+T(three?105:85,128,t1,'rd-tb','middle')+T(three?105:85,144,t2,'rd-s','middle')+(t3?T(three?105:85,158,t3,'rd-s','middle'):''),t1+': '+t2+' '+(t3||''))}
    if(three)return {min:170,panels:[p(['brew'],'Brew','the pump runs: water','through the group'),p(['steam'],'Steam','the target switches','to the steam temperature'),p(['water'],'Hot water','steam knob open,','over a jug')],cap:'What each switch does at the first power-on. Steam, the wand and the group head can burn.'};
    return {min:130,panels:[p(['brew'],'Brew','the pump runs: water','through the group'),p(['steam'],'Steam','steam target; the ring','pulses above 120 °C'),p(['brew','steam'],'Both','hot water mode,','from the wand')],cap:'From the official user manual. Above 120 °C, steam, the wand and the group can burn. Hot water mode needs the steam knob open and a cup under the wand.'};
  };

  /* the temperatures that limit the boiler */
  D.limits=function(o){
    var b='',y=function(t){return 172-(t-80)*1.6};
    b+=R(52,16,16,166,'lm-tube',8)+Ci(60,186,12,'lm-bulb');
    (o.marks||[]).forEach(function(m){var yy=y(m[0]);b+=P('M70,'+yy+'H106','lm-m '+(m[2]||''))+T(112,yy+4,(m[3]?'':m[0]+' °C  ')+m[1],'rd-t'+(m[2]==='stop'?' lm-stop':''))});
    return {panels:[S(340,204,b,(o.marks||[]).map(function(m){return (m[3]?'':m[0]+' °C ')+m[1]}).join('; '))],cap:o.cap||''};
  };

  return {init:init,badge:badge,legend:legend,name:function(k){return PW[k]?PW[k][0]:''},icon:icon,figs:figs,pics:pics,mount:mount,reset:reset,D:D};
})();
