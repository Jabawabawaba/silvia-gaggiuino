  /* ---------- the change player ----------
     Shared by both sites' wiring pages: keep the two copies identical. Plays the factory wiring turning into the new
     wiring on a stage, one wire at a time, and can go at a quarter speed, pause, step back and forward a wire at a
     time, or be dragged to any point. Every track is a pure function of its own progress (p from 0 to 1), and each
     element's look belongs to one track, so the stage can be set to any moment in either direction. Reduced motion
     gets the same steps as fades. Controls (all inside #mctl): #ma-back, #ma-pause, #ma-fwd, #ma-scrub, #ma-pos,
     [data-speed], #ma-replay, #ma-skip, #ma-done; the caption is #ma-cap. */
  var ChangePlayer=(function(){
    var NS='http://www.w3.org/2000/svg';
    function ease(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2}
    function clamp(p){return p<0?0:p>1?1:p}
    function mk(tag,attrs,parent){var n=document.createElementNS(NS,tag);for(var k in attrs)n.setAttribute(k,attrs[k]);if(parent)parent.appendChild(n);return n}
    function reduced(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
    function plen(pth){if(pth._L==null){try{pth._L=pth.getTotalLength()}catch(e){pth._L=400}}return pth._L}
    function strokes(g){return Array.prototype.slice.call(g.querySelectorAll('.case,.wire,.halo'))}
    function lenOf(g){var m=0;Array.prototype.forEach.call(g.querySelectorAll('.wire'),function(w){m=Math.max(m,plen(w))});return m||400}
    function dash(pth,frac,sign){var L=plen(pth);pth.style.strokeDasharray=L+' '+L;pth.style.strokeDashoffset=sign*L*frac}
    function undash(pth){pth.style.strokeDasharray='';pth.style.strokeDashoffset=''}
    function boxOf(g){var h=g.querySelector('.phit');try{if(h&&h.getAttribute('width')){var x=+h.getAttribute('x'),y=+h.getAttribute('y'),w=+h.getAttribute('width'),hh=+h.getAttribute('height');return {x:x,y:y,w:w,h:hh,cx:x+w/2,cy:y+hh/2}}var b=g.getBBox();return {x:b.x,y:b.y,w:b.width,h:b.height,cx:b.x+b.width/2,cy:b.y+b.height/2}}catch(e){return null}}
    function setScale(g,b,k){if(!b)return;if(k===1)g.removeAttribute('transform');else g.setAttribute('transform','translate('+b.cx+' '+b.cy+') scale('+k+') translate('+(-b.cx)+' '+(-b.cy)+')')}
    function op(el,v){el.style.opacity=v==null?'':String(v)}

    /* a timeline: tracks, captions and steps, built before it plays */
    function Builder(fx,colOf){this.tr=[];this.cap=[];this.steps=[];this.fx=fx;this.colOf=colOf;this.RM=reduced()}
    var B=Builder.prototype;
    B.track=function(s,d,fn){this.tr.push({s:s,d:Math.max(d,.001),fn:fn,p:NaN});return s+d};
    B.say=function(s,html){this.cap.push({s:s,h:html})};
    /* a step is what Back and Next move by: one wire coming out or going in, or a change of parts */
    B.step=function(s,e,label){this.steps.push({s:s,e:e,label:label||''})};
    B.comet=function(c){var k=mk('g',{'class':'ma-comet'},this.fx);mk('circle',{r:'7','class':'mc-glow',filter:'url(#ma-glow)',style:'fill:'+c},k);mk('circle',{r:'2.6','class':'mc-core'},k);k.style.opacity=0;return k};
    B.ring=function(x,y,c,s,big){
      var n=mk('circle',{cx:x,cy:y,r:'4','class':'ma-ring',style:'stroke:'+c},this.fx);n.style.opacity=0;
      if(this.RM)return;
      this.track(s,.55,function(p){n.setAttribute('r',4+(big?22:12)*ease(p));op(n,p>0&&p<1?(1-p)*.9:0)});
    };
    /* a wire leaves: it lights, then unzips with a bright head from the end that lets go */
    B.wireOut=function(g,s,o){
      o=o||{};var self=this,L=lenOf(g),ps=strokes(g),halo=g.querySelector('.halo'),wire=g.querySelector('.wire'),c=o.color||this.colOf(g),fromB=!!o.fromB;
      if(this.RM)return this.track(s,.5,function(p){op(g,p>=1?0:p>0?1-p:null)});
      var D=o.d||1.05,k=this.comet(c);
      this.track(s,D,function(p){
        var pa=clamp(p/.28),pb=clamp((p-.28)/.72),e=ease(pb);
        if(p>0&&p<1){halo.style.stroke=c;op(halo,.45*pa)}else{halo.style.stroke='';op(halo,null)}
        ps.forEach(function(pth){if(pb>0&&pb<1)dash(pth,e,fromB?1:-1);else undash(pth)});
        op(g,p>=1?0:null);
        if(pb>0&&pb<1){var pt=wire.getPointAtLength(fromB?L*(1-e):L*e);k.setAttribute('transform','translate('+pt.x+' '+pt.y+')');op(k,1)}else op(k,0);
      });
      try{var q=wire.getPointAtLength(fromB?0:L);self.ring(q.x,q.y,c,s+D*.92,false)}catch(e){}
      return s+D;
    };
    /* a run arrives: drawn from its first end with a bright head, then a pulse where it lands */
    B.wireIn=function(g,s,o){
      o=o||{};var wire=g.querySelector('.wire'),L=plen(wire),ps=strokes(g),c=o.color||this.colOf(g),tag=o.tag;
      if(this.RM){this.track(s,.5,function(p){op(g,p>=1?null:p);if(tag)op(tag,p>=1?null:p)});return s+.5}
      var D=o.d||Math.min(1.5,.8+lenOf(g)/1600),k=this.comet(c);
      this.track(s,D,function(p){
        var e=ease(p);
        ps.forEach(function(pth){if(p>=1)undash(pth);else{pth.style.strokeDasharray=plen(pth)+' '+plen(pth);pth.style.strokeDashoffset=plen(pth)*(1-e)}});
        if(p>0&&p<1){var pt=wire.getPointAtLength(L*e);k.setAttribute('transform','translate('+pt.x+' '+pt.y+')');op(k,1)}else op(k,0);
      });
      try{var q=wire.getPointAtLength(L);this.ring(q.x,q.y,c,s+D-.05,false)}catch(e){}
      if(tag)this.track(s+D*.6,.35,function(p){op(tag,p>=1?null:p)});
      return s+D;
    };
    B.partOut=function(g,s,d){var b=boxOf(g),RM=this.RM;return this.track(s,d,function(p){var e=ease(p);op(g,p<=0?null:1-e);if(!RM)setScale(g,b,p<=0?1:1-.12*e)})};
    B.partIn=function(g,s,d,ringIt){
      var b=boxOf(g),RM=this.RM,self=this;
      this.track(s,d,function(p){var e=ease(p);op(g,p>=1?null:e);if(!RM)setScale(g,b,p>=1?1:.9+.1*e)});
      if(ringIt&&b&&!RM){var n=mk('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:'10','class':'ma-pring'},self.fx);n.style.opacity=0;
        this.track(s+d*.4,.7,function(p){var gr=10*ease(p);n.setAttribute('x',b.x-gr);n.setAttribute('y',b.y-gr);n.setAttribute('width',b.w+2*gr);n.setAttribute('height',b.h+2*gr);op(n,p>0&&p<1?(1-p)*.85:0)})}
      return s+d;
    };
    /* opacity from a to b; null as an end means the stylesheet's own */
    B.fade=function(g,s,d,a,b2){return this.track(s,d,function(p){var e=ease(p);if(p<=0)op(g,a);else if(p>=1)op(g,b2);else op(g,(a==null?1:a)+((b2==null?1:b2)-(a==null?1:a))*e)})};
    B.cls=function(el,s,e,name){this.track(s,e-s,function(p){el.classList.toggle(name,p>0&&p<1)})};
    B.clsFrom=function(el,s,name){this.track(s,.001,function(p){el.classList.toggle(name,p>0)})};

    /* the player: one at a time */
    var A=null,ids=null;
    function $(id){return document.getElementById(id)}
    function fmtPos(){if(!A)return '';var i=curStep();return A.b.steps.length?('Step '+(i+1)+' of '+A.b.steps.length):''}
    function curStep(){var st=A.b.steps,i=0;for(var j=0;j<st.length;j++)if(st[j].s<=A.t+1e-4)i=j;return i}
    function render(force){
      if(!A)return;
      var t=A.t,tr=A.b.tr;
      for(var i=0;i<tr.length;i++){var it=tr[i],p=clamp((t-it.s)/it.d);if(force||p!==it.p){it.p=p;it.fn(p)}}
      var ci=-1,cap=A.b.cap;for(var j=0;j<cap.length;j++)if(cap[j].s<=t+1e-4)ci=j;
      if(ci!==A.ci){A.ci=ci;$('ma-cap').innerHTML=ci>=0?cap[ci].h:''}
      if(!A.drag)$('ma-scrub').value=String(Math.round(1000*t/A.end));
      $('ma-pos').textContent=fmtPos();
    }
    function ctlUI(){
      if(!A)return;
      var done=A.t>=A.end-1e-4;
      $('ma-pause').textContent=A.paused||done?(done?'Play again':'Play'):'Pause';$('ma-pause').setAttribute('aria-pressed',String(!!A.paused));
      $('ma-skip').hidden=done;$('ma-done').hidden=!done||!!A.o.noDone;
      $('ma-back').disabled=A.t<=1e-4;$('ma-fwd').disabled=done;
      Array.prototype.forEach.call($('mctl').querySelectorAll('[data-speed]'),function(b){b.setAttribute('aria-pressed',String(Number(b.getAttribute('data-speed'))===A.speed))});
      if(A.o.onState)A.o.onState(A);
    }
    function loop(now){
      if(!A)return;
      var dt=A.last==null?0:Math.min(.1,(now-A.last)/1000);A.last=now;
      if(!A.paused){
        A.t=Math.min(A.end,A.t+dt*A.speed);
        if(A.stopAt!=null&&A.t>=A.stopAt){A.t=A.stopAt;A.stopAt=null;A.paused=true}
      }
      render(false);
      if(A.t>=A.end){A.paused=true;ctlUI();A.raf=0;return}
      if(A.paused){ctlUI();A.raf=0;return}
      A.raf=requestAnimationFrame(loop);
    }
    function go(){if(A&&!A.raf){A.last=null;A.raf=requestAnimationFrame(loop)}}
    function seek(t,keepPlaying){if(!A)return;A.t=Math.max(0,Math.min(A.end,t));A.stopAt=null;if(!keepPlaying)A.paused=true;render(false);ctlUI();if(!A.paused)go()}
    function start(b,end,o){
      stop();
      b.tr.sort(function(x,y){return x.s-y.s});b.cap.sort(function(x,y){return x.s-y.s});b.steps.sort(function(x,y){return x.s-y.s});
      A={b:b,t:o.at||0,end:end,paused:!!o.paused,speed:o.speed||(A0.speed)||1,stopAt:null,raf:0,ci:-2,last:null,o:o,drag:false};
      $('mctl').hidden=false;$('ma-cap').hidden=false;
      render(true);ctlUI();if(!A.paused)go();
    }
    function stop(){if(!A)return;A0.speed=A.speed;if(A.raf)cancelAnimationFrame(A.raf);A=null;$('mctl').hidden=true;$('ma-cap').hidden=true}
    var A0={speed:1};
    function back(){
      if(!A)return;var st=A.b.steps;if(!st.length){seek(0);return}
      var i=curStep();var tgt=(A.t>st[i].s+.25)?st[i].s:(i>0?st[i-1].s:0);seek(tgt);
    }
    function fwd(){
      if(!A)return;var st=A.b.steps;if(!st.length){seek(A.end);return}
      var i=curStep(),s=st[i];
      if(A.t<s.e-1e-3&&A.t>=s.s-1e-4){A.stopAt=s.e}
      else if(i+1<st.length){A.t=st[i+1].s;A.stopAt=st[i+1].e;render(false)}
      else{seek(A.end);return}
      A.paused=false;ctlUI();go();
    }
    function wire(o){
      if(ids)return;ids=true;
      $('mctl').addEventListener('click',function(e){
        var b=e.target.closest('button');if(!b||!A)return;
        if(b.id==='ma-pause'){if(A.t>=A.end-1e-4){if(A.o.replay)A.o.replay();else seek(0,true);return}A.paused=!A.paused;A.stopAt=null;ctlUI();if(!A.paused)go()}
        else if(b.id==='ma-back')back();
        else if(b.id==='ma-fwd')fwd();
        else if(b.id==='ma-replay'){if(A.o.replay)A.o.replay();else{A.paused=false;seek(0,true)}}
        else if(b.id==='ma-skip')seek(A.end);
        else if(b.id==='ma-done'){if(A.o.done)A.o.done()}
        else if(b.hasAttribute('data-speed')){A.speed=Number(b.getAttribute('data-speed'))||1;A0.speed=A.speed;ctlUI()}
      });
      var sc=$('ma-scrub');
      sc.addEventListener('input',function(){if(!A)return;A.drag=true;A.paused=true;A.stopAt=null;A.t=A.end*Number(sc.value)/1000;render(false);ctlUI()});
      sc.addEventListener('change',function(){if(A)A.drag=false});
    }
    return {Builder:Builder,start:start,stop:stop,seek:seek,wire:wire,mk:mk,reduced:reduced,ease:ease,
      active:function(){return !!A},state:function(){return A},time:function(){return A?A.t:0},end:function(){return A?A.end:0},
      play:function(){if(A){A.paused=false;A.stopAt=null;ctlUI();go()}},pause:function(){if(A){A.paused=true;ctlUI()}}};
  })();
