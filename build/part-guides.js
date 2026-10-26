/* Part guides: a stepped, animated drawing for each part, with the steps written out beside it.
   Each step lists moves for the drawing's data-k pieces as [key, {x,y,r,s,sx,sy,o,d}, delay ms, duration ms]; the state
   after a step is everything before it plus its own moves, so any step can be shown on its own and replayed.
   x,y move (user units), r turns (deg), s/sx/sy scale, o is opacity, d the hidden share of a drawn path (1 hidden, 0 drawn).
   loop names the data-loop pieces that run during the step, text sets a readout, count runs a number up.
   Steps and drawings follow Your Silvia (machine.js): a step or drawing piece with a when condition shows only for the
   Silvias it fits, and with nothing set every piece shows. Reduced motion shows each step's end state without movement. */
(function(){
  var GM=window.SilviaMachine,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE='cubic-bezier(.45,0,.2,1)';
  function $(id){return document.getElementById(id)}
  /* the Shelly add-on shows only once it's chosen, so with no Your Silvia at all its pieces stay hidden */
  function m(w){if(!w)return true;if(!GM)return !/(^|;)shelly/.test(w);return GM.matches(w)}
  function T(x){if(x==null)return '';if(typeof x==='string')return x;if(GM)return GM.txt(x);return x.filter(function(s){return typeof s==='string'||m(s[1])}).map(function(s){return typeof s==='string'?s:s[0]}).join(' ').replace(/ ([,.;:])/g,'$1')}
  function prof(){return (GM&&GM.get())||{}}
  function famOf(){return null}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
%%INCLUDE:maplink.js%%

%%INCLUDE:part-guides-data.js%%

  /* official photo links: one URL, or a list of URLs (or [url, when]) shown as numbered links */
  function phHtml(ph,lab){
    if(!ph)return '';
    if(!Array.isArray(ph))return '<a href="'+ph+'" target="_blank" rel="noopener">'+lab+'</a>';
    var L=ph.filter(function(x){return typeof x==='string'||m(x[1])}).map(function(x){return typeof x==='string'?x:x[0]});
    if(!L.length)return '';
    if(L.length===1)return '<a href="'+L[0]+'" target="_blank" rel="noopener">Official photo</a>';
    return 'Official photos: '+L.map(function(u,i){return '<a href="'+u+'" target="_blank" rel="noopener">'+(i+1)+'</a>'}).join(', ');
  }
  /* ---------------- engine ---------------- */
  function num(v,d){return v==null?d:v}
  function tf(s){return 'translate('+num(s.x,0)+'px,'+num(s.y,0)+'px) rotate('+num(s.r,0)+'deg) scale('+num(s.sx,num(s.s,1))+','+num(s.sy,num(s.s,1))+')'}
  function clone(o){var r={};for(var k in o){r[k]={};for(var p in o[k])r[k][p]=o[k][p]}return r}
  function merge(st,k,props){if(!st[k])st[k]={};for(var p in props)st[k][p]=props[p]}
  var CH={x:'t',y:'t',r:'t',s:'t',sx:'t',sy:'t',o:'o',d:'d'};
  function chanVal(s,c){s=s||{};return c==='t'?tf(s):c==='o'?String(num(s.o,1)):String(num(s.d,0))}
  function prop(c){return c==='t'?'transform':c==='o'?'opacity':'strokeDashoffset'}

  function Guide(id,def){
    this.id=id;this.def=def;this.root=$('pg-'+id+'-g');if(!this.root)return;
    this.list=this.root.querySelector('.pg-steps');this.now=this.root.querySelector('.pg-now');
    this.pos=this.root.querySelector('.pg-pos');this.anims=[];this.timers=[];this.i=0;this.played=false;this.pick=null;
    var self=this;
    this.root.querySelector('.pg-prev').addEventListener('click',function(){self.go(self.i-1,true)});
    this.root.querySelector('.pg-next').addEventListener('click',function(){self.go(self.i+1,true)});
    this.root.querySelector('.pg-again').addEventListener('click',function(){self.go(self.i,true)});
    this.list.addEventListener('click',function(e){var b=e.target.closest('button[data-i]');if(b)self.go(Number(b.getAttribute('data-i')),true,true)});
    this.root.addEventListener('keydown',function(e){if(e.target.closest('.pg-steps,.pg-ctl,.pg-fig')&&(e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.altKey&&!e.metaKey){e.preventDefault();self.go(self.i+(e.key==='ArrowRight'?1:-1),true)}});
    var vb=this.root.querySelector('.pg-vars');
    if(vb&&def.vars){vb.innerHTML=def.vars.map(function(v){return '<button type="button" class="chip" data-var="'+v.k+'" aria-pressed="false">'+esc(v.l)+'</button>'}).join('');
      vb.addEventListener('click',function(e){var b=e.target.closest('[data-var]');if(!b)return;self.pick=b.getAttribute('data-var');self.setup(true)})}
    this.setup(false);
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting&&!self.played){self.played=true;self.go(self.i,true);io.disconnect()}},{threshold:.45});io.observe(this.root.querySelector('.pg-fig'))}
  }
  Guide.prototype.variant=function(){var d=this.def;if(!d.vars)return 'all';return this.pick||d.def()};
  Guide.prototype.setup=function(play){
    var d=this.def,v=this.variant(),self=this;
    this.v=v;
    var svgId=d.svgs?d.svgs[v]:d.svg;
    Array.prototype.forEach.call(this.root.querySelectorAll('.pg-fig>svg'),function(s){s.style.display=s.id===svgId?'':'none'});
    this.svg=$(svgId);
    Array.prototype.forEach.call(this.root.querySelectorAll('[data-var]'),function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-var')===v))});
    Array.prototype.forEach.call((this.root.closest('section')||this.root).querySelectorAll('[data-pv]'),function(e){e.hidden=e.getAttribute('data-pv').split(',').indexOf(v)<0});
    /* drawing pieces for some Silvias only (the E's push button, the V5 and V6 insulation) */
    Array.prototype.forEach.call(this.svg.querySelectorAll('[data-when]'),function(e){e.style.display=m(e.getAttribute('data-when'))?'':'none'});
    /* drawing pieces for one variant of a guide */
    Array.prototype.forEach.call(this.svg.querySelectorAll('[data-v]'),function(e){e.style.display=(d.vars&&e.getAttribute('data-v')===v)?'':'none'});
    /* pieces */
    this.el={};
    function hiddenV(e){for(var p=e;p&&p!==self.svg;p=p.parentNode){if(p.getAttribute&&(p.hasAttribute('data-when')||p.hasAttribute('data-v'))&&p.style.display==='none')return true}return false}
    Array.prototype.forEach.call(this.svg.querySelectorAll('[data-k]'),function(e){
      var k=e.getAttribute('data-k');
      if(hiddenV(e)&&self.el[k])return;
      self.el[k]=e;
      var o=e.getAttribute('data-origin');
      e.style.transformBox=e.getAttribute('data-box')==='view'?'view-box':'fill-box';
      e.style.transformOrigin=o||'center';
    });
    this.base=d.base[v]||d.base;
    this.steps=(d.steps[v]||d.steps.all).filter(function(s){return m(s.when)});
    this.states=[];var st=clone(this.base);
    for(var i=0;i<this.steps.length;i++){(this.steps[i].a||[]).forEach(function(op){merge(st,op[0],op[1])});this.states.push(clone(st))}
    this.renderList();
    this.i=Math.min(this.i,this.steps.length-1);
    if(play&&this.played)this.go(0,true);else this.show(this.played?this.i:-1,this.played?this.i:0);
  };
  Guide.prototype.stateBefore=function(i){return i<=0?this.base:this.states[i-1]};
  Guide.prototype.apply=function(st){
    for(var k in this.el){var e=this.el[k],s=st[k]||{};
      e.style.transform=tf(s);e.style.opacity=String(num(s.o,1));
      if(e.classList.contains('draw')){e.style.strokeDashoffset=String(num(s.d,0));if(num(s.d,0)>=1)e.style.opacity='0'}
    }
  };
  Guide.prototype.stop=function(){
    this.anims.forEach(function(a){try{a.cancel()}catch(e){}});this.anims=[];
    this.timers.forEach(function(t){clearTimeout(t);cancelAnimationFrame(t)});this.timers=[];
    Array.prototype.forEach.call(this.svg.querySelectorAll('[data-loop]'),function(e){e.classList.remove('run')});
    Array.prototype.forEach.call(this.svg.querySelectorAll('[data-run]'),function(e){e.classList.remove('on')});
  };
  /* show the state at step "at" (−1 = before the first) with step "cur" highlighted, no movement */
  Guide.prototype.show=function(at,cur){
    this.stop();this.apply(at<0?this.base:this.states[at]);this.i=cur;this.mark();
    if(at>=0)this.extras(this.steps[at],false);
  };
  Guide.prototype.extras=function(step,anim){
    var self=this;
    (step.loop||[]).forEach(function(n){Array.prototype.forEach.call(self.svg.querySelectorAll('[data-loop="'+n+'"]'),function(e){e.classList.add('run')});
      Array.prototype.forEach.call(self.svg.querySelectorAll('[data-run="'+n+'"]'),function(e){e.classList.add('on')})});
    if(step.count){var c=step.count,el=this.svg.querySelector('[data-k="'+c[0]+'"]');
      if(el){
        if(!anim||RM){el.textContent=c[2]+c[3]}
        else{el.textContent=c[1]+c[3];var t0=null;
          var tick=function(ts){if(t0===null)t0=ts;var p=Math.min(1,Math.max(0,(ts-t0-c[4])/c[5]));el.textContent=(c[1]+(c[2]-c[1])*(1-Math.pow(1-p,2))).toFixed(1).replace(/\.0$/,'')+c[3];if(p<1)self.timers.push(requestAnimationFrame(tick))};
          self.timers.push(requestAnimationFrame(tick))}
      }}
  };
  Guide.prototype.go=function(i,anim,fromList){
    if(i<0||i>=this.steps.length)return;
    this.stop();var step=this.steps[i],before=this.stateBefore(i),after=this.states[i],self=this;
    this.i=i;this.played=true;this.mark(fromList);
    this.apply(after);
    if(anim&&!RM&&this.svg.animate){
      var cur=clone(before),lines={};
      (step.a||[]).forEach(function(op){
        var k=op[0],e=self.el[k];if(!e)return;
        var nxt=clone(cur);merge(nxt,k,op[1]);
        var chans={};for(var p in op[1])chans[CH[p]]=1;
        for(var c in chans){
          if(c==='d'&&!e.classList.contains('draw'))continue;
          var key=k+'|'+c;if(!lines[key])lines[key]={e:e,c:c,pts:[[0,chanVal(cur[k],c)]]};
          lines[key].pts.push([op[2],chanVal(cur[k],c)],[op[2]+op[3],chanVal(nxt[k],c)]);
        }
        cur=nxt;
      });
      for(var key in lines){var L=lines[key],end=L.pts[L.pts.length-1][0]||1,kf=[];
        L.pts.forEach(function(pt,j){var f={offset:Math.min(1,pt[0]/end)};f[prop(L.c)]=pt[1];f.easing=EASE;
          if(kf.length&&f.offset<kf[kf.length-1].offset)f.offset=kf[kf.length-1].offset;kf.push(f)});
        try{this.anims.push(L.e.animate(kf,{duration:end,fill:'both'}))}catch(err){}
        if(L.c==='d'&&L.pts[0][1]==='1'&&L.pts.length>1){var t0=L.pts[1][0];try{this.anims.push(L.e.animate([{opacity:0,offset:0},{opacity:0,offset:Math.min(1,t0/end)},{opacity:1,offset:Math.min(1,t0/end)},{opacity:1,offset:1}],{duration:end,fill:'both'}))}catch(err){}}
      }
    }
    this.extras(step,anim);
  };
  Guide.prototype.renderList=function(){
    var self=this,n=this.steps.length;
    this.list.innerHTML=this.steps.map(function(s,i){
      var pht=phHtml(s.ph,'Official photo');
      var chk=(s.chk||[]).map(function(c){return '<a href="power-on-checks.html#'+c[0]+'">'+c[0]+' '+esc(c[1])+'</a>'}).join(' · ');
      var lk=(s.links||[]).map(function(l){return '<a href="'+l[1]+'">'+esc(l[0])+'</a>'}).join(' · ');
      if(lk)chk=chk?chk+' · '+lk:lk;
      /* map: a wiring-drawing target, or [[label, target, when, set label], ...] */
      var ml=(s.map==null?[]:typeof s.map==='string'?[['On the wiring map',s.map]]:s.map).filter(function(x){return m(x[2])}).map(function(x){var o={};if(x[3])o.label=x[3];return '<a class="pg-map" href="'+mapHref(x[1],o)+'">'+esc(x[0])+'</a>'}).join(' · ');
      if(ml)chk=chk?chk+' · '+ml:ml;
      return '<li data-n="'+(i+1)+'"><button type="button" class="pg-sb" data-i="'+i+'"><span class="pg-n">'+(i+1)+'</span><span class="pg-t">'+esc(s.t)+'</span></button>'
        +'<p>'+esc(T(s.d))+'</p>'+((pht||chk)?'<p class="pg-links">'+pht+(pht&&chk?' · ':'')+(chk?((s.chk&&s.chk.length)?'Check: ':'')+chk:'')+'</p>':'')+'</li>';
    }).join('');
    this.n=n;
  };
  Guide.prototype.mark=function(fromList){
    var i=this.i,s=this.steps[i];
    Array.prototype.forEach.call(this.list.children,function(li,j){li.classList.toggle('cur',j===i);var b=li.querySelector('button');if(j===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
    this.pos.textContent='Step '+(i+1)+' of '+this.steps.length;
    this.root.querySelector('.pg-prev').disabled=i<=0;this.root.querySelector('.pg-next').disabled=i>=this.steps.length-1;
    if(this.now&&s)this.now.innerHTML='<b>'+(i+1)+'. '+esc(s.t)+'</b> '+esc(T(s.d));
    if(fromList&&window.innerWidth<=860){var f=this.root.querySelector('.pg-fig');if(f&&f.getBoundingClientRect().top<0&&f.scrollIntoView)f.scrollIntoView({block:'start',behavior:RM?'auto':'smooth'})}
  };

  /* where each part goes, following Your Silvia */
  function where(){
    var w={tc:['In one of the brew thermostat\'s clamp holes on top of the boiler.',['On boilers made before May 2000, confirm how it mounts on Discord first.','early'],['From V5 on, the boiler insulation folds back first.','ver:V5,V6']],
      ps:['On a 1/8" tee at the OPV, through an elbow that keeps it clear of the steam pipes. Some builds use the 3-way valve\'s bottom port instead (Talon\'s does); both work, and the OPV tee has an exact parts list.'],
      wire:['Every run of realNiche\'s harness, mains and low voltage. Ends at the boiler, the safety thermostat and the solenoid get bare spades under silicone tape.'],
      ssr:['On the left wall inside the machine, clear of the pump. It switches the element; the PCB drives it from J9.'],
      sw:['Brew, steam and hot water become low-voltage inputs to the PCB; the power switch stays on mains. The same on every Silvia.',['The E needs a latching rocker first.','model:E;!shelly'],['With the Shelly, the power switch only signals it.','shelly'],['The E keeps its push button for that.','model:E;shelly']],
      scr:['On top of or in front of the machine, on the mount you print or order; its cable runs inside to J1.'],
      tof:['Above the water tank, under the lid, on its cable from J2 on the back of the PCB.'],
      fw:['Over Wi-Fi from a phone or computer, with the machine closed up; by wire only as a fallback.'],
      scl:['Under the drip tray, on a load cell mount made for the Silvia, with the boards and the cable to J8 inside.'],
      shl:['Outside the case, in a closed enclosure on the back panel. Its four wires reach the inlet, the power switch and SSR terminal 1 through a grommet.',['On an E, the emptied GICAR box inside the case is an unofficial second choice.','model:E']]};
    for(var k in w){var e=$('pg-'+k+'-where');if(e)e.textContent=T(w[k])}
  }

  var guides={};
  function init(){
    where();
    ['tc','ps','wire','ssr','sw','scr','tof','fw','scl','shl'].forEach(function(k){guides[k]=new Guide(k,G[k])});
    window.addEventListener('silvia-machine',function(){where();for(var k in guides)if(guides[k].root)guides[k].setup(false)});
    window.addEventListener('hashchange',fromHash);fromHash();
  }
  /* links from other pages (the wiring drawing's back-links, Test yourself): #tc/5 opens step 5 */
  function fromHash(){
    var h=(location.hash||'').slice(1).split('/'),g=guides[h[0]];if(!g||!g.root||h.length<2)return;
    if(h.length>2&&g.def.vars&&g.def.vars.some(function(x){return x.k===h[1]})){g.pick=h[1];g.setup(false)}
    var n=parseInt(h[h.length-1],10)-1;if(!(n>=0))n=0;n=Math.min(n,g.steps.length-1);
    var sec=g.root.closest('section')||g.root;sec.scrollIntoView({block:'start'});
    g.played=true;g.go(n,true);
    var li=g.list.children[n];if(li&&window.matchMedia&&matchMedia('(max-width:860px)').matches)setTimeout(function(){g.root.querySelector('.pg-fig').scrollIntoView({block:'start'})},60);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
