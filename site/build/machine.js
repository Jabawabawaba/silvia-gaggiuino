/* Site-wide "your Silvia" profile: version, E/M model, mains voltage. Every field is optional.
   Elements with data-when="ver:V5,V6;model:E;volts:230;early" show only when every condition matches.
   A field the user hasn't set never hides anything: with no version, every version's notes show; with no
   voltage, both voltages' notes show and the wording stays generic. Nothing is ever filled in for them.
   Elements with data-mtext="gfci|outlet|volts" get voltage-specific wording. */
(function(){
  var KEY='silvia-machine-v1',VERS=['V1','V2','V3','V4','V5','V6'];
  var TEXT={
    gfci:{'120':'GFCI','230':'RCD','':'GFCI (RCD outside North America)'},
    outlet:{'120':'GFCI-protected outlet','230':'socket with RCD protection','':'GFCI- or RCD-protected outlet'},
    volts:{'120':'120 V','230':'230 V','':'your mains voltage'}
  };
  function newer(v){return v==='V5'||v==='V6'}
  function clean(s){
    if(!s||typeof s!=='object')return null;
    var ver=VERS.indexOf(s.ver)>=0?s.ver:null;
    var model=newer(ver)&&(s.model==='E'||s.model==='M')?s.model:null;
    var v=Number(s.volts),volts=v===230?230:v===120?120:null;
    if(!ver&&!volts)return null;
    return {ver:ver,model:model,volts:volts,early:ver==='V1'&&s.early===true};
  }
  function read(){try{return clean(JSON.parse(localStorage.getItem(KEY)||'null'))}catch(e){return null}}
  var prof=read();
  function conds(when){
    return String(when||'').split(';').map(function(c){
      c=c.trim();var i=c.indexOf(':');return {k:i<0?c:c.slice(0,i),vals:i<0?[]:c.slice(i+1).split(',')};
    }).filter(function(c){return c.k});
  }
  /* true unless the profile rules the element out; unknown fields never rule anything out */
  function matches(when){
    if(!when||!prof)return true;
    return conds(when).every(function(c){
      if(c.k==='ver')return !prof.ver||c.vals.indexOf(prof.ver)>=0;
      if(c.k==='model'){
        if(!prof.ver)return true;
        if(!newer(prof.ver))return c.vals.indexOf('M')>=0;   /* no E before V5 */
        return !prof.model||c.vals.indexOf(prof.model)>=0;
      }
      if(c.k==='volts')return !prof.volts||c.vals.indexOf(String(prof.volts))>=0;
      if(c.k==='early')return !prof.ver||prof.early;
      return true;
    });
  }
  /* true when the profile pins down every field the condition depends on (so a "which machines" tag adds nothing) */
  function decided(when){
    if(!prof)return false;
    return conds(when).every(function(c){
      if(c.k==='ver'||c.k==='early')return !!prof.ver;
      if(c.k==='model')return !!prof.ver&&(!newer(prof.ver)||!!prof.model);
      if(c.k==='volts')return !!prof.volts;
      return true;
    });
  }
  function text(key){var t=TEXT[key];if(!t)return '';return prof&&prof.volts?t[String(prof.volts)]:t['']}
  function label(p){
    p=p||prof;if(!p)return 'Set it';
    var a=[];if(p.ver)a.push(p.ver+(newer(p.ver)&&p.model?' '+p.model:''));if(p.volts)a.push(p.volts+' V');
    return a.join(', ');
  }
  function missing(p){
    p=p||prof;if(!p)return [];var m=[];
    if(!p.ver)m.push('version');else if(newer(p.ver)&&!p.model)m.push('model');
    if(!p.volts)m.push('mains voltage');
    return m;
  }
  function summary(p){
    p=p||prof;
    if(!p)return 'Pick your version and voltage. Until you do, every page shows all the version notes, each tagged with the machines it applies to.';
    var m=missing(p);
    return 'Pages now show the steps and notes for a '+label(p)+' Silvia.'+(m.length?' Add your '+m.join(' and ')+' to narrow them down; until then those notes all show.':'');
  }
  function apply(root){
    root=root||document;
    Array.prototype.forEach.call(root.querySelectorAll('[data-when]'),function(el){el.hidden=!matches(el.getAttribute('data-when'))});
    Array.prototype.forEach.call(root.querySelectorAll('[data-mtext]'),function(el){var t=text(el.getAttribute('data-mtext'));if(t)el.textContent=t});
    var l=document.getElementById('mchip-l');if(l)l.textContent=label();
    var ch=document.getElementById('mchip');if(ch){ch.classList.toggle('set',!!prof);ch.setAttribute('aria-label','Your Silvia: '+(prof?label():'not set'))}
    syncPanel();
  }
  function set(p){
    prof=p?clean(p):null;
    try{if(prof)localStorage.setItem(KEY,JSON.stringify(prof));else localStorage.removeItem(KEY)}catch(e){}
    apply();
    try{window.dispatchEvent(new CustomEvent('silvia-machine',{detail:prof}))}catch(e){}
  }
  /* start from what's saved, never from guesses */
  function current(){return Object.assign({ver:null,model:null,volts:null,early:false},prof||{})}
  /* ---- nav panel ---- */
  function syncPanel(){
    var pan=document.getElementById('mpanel');if(!pan)return;
    var p=prof||{},nw=newer(p.ver);
    Array.prototype.forEach.call(pan.querySelectorAll('[data-mv]'),function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-mv')===p.ver))});
    Array.prototype.forEach.call(pan.querySelectorAll('[data-mm]'),function(b){b.disabled=!nw;b.setAttribute('aria-pressed',String(nw&&b.getAttribute('data-mm')===p.model))});
    Array.prototype.forEach.call(pan.querySelectorAll('[data-mvolt]'),function(b){b.setAttribute('aria-pressed',String(Number(b.getAttribute('data-mvolt'))===p.volts))});
    var ew=document.getElementById('m-early-w');if(ew)ew.hidden=p.ver!=='V1';
    var ec=document.getElementById('m-early');if(ec)ec.checked=!!p.early;
    var mh=document.getElementById('m-model-hint');if(mh)mh.hidden=nw;
    var s=document.getElementById('m-summary');if(s)s.textContent=summary();
  }
  function wire(){
    var chip=document.getElementById('mchip'),pan=document.getElementById('mpanel');
    var nt=document.getElementById('nav-toggle'),nl=document.getElementById('nav-links');
    /* the page list and the Your Silvia panel open over the page, one at a time; a tap outside or Escape closes them */
    var scrim=document.getElementById('nav-scrim');
    function sync(){if(scrim)scrim.hidden=!((nl&&nl.classList.contains('open'))||(pan&&!pan.hidden))}
    function closeMenu(){if(nt&&nl&&nl.classList.contains('open')){nt.setAttribute('aria-expanded','false');nl.classList.remove('open');sync();return true}}
    function closePanel(){if(chip&&pan&&!pan.hidden){pan.hidden=true;chip.setAttribute('aria-expanded','false');sync();return true}}
    if(scrim)scrim.addEventListener('click',function(){closeMenu();closePanel()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&closeMenu())nt.focus()});
    if(chip&&pan){
      chip.addEventListener('click',function(){var open=pan.hidden;pan.hidden=!open;chip.setAttribute('aria-expanded',String(open));if(open)closeMenu();sync()});
      pan.addEventListener('click',function(e){
        var b=e.target.closest('button');if(!b||b.disabled)return;
        var p=current();
        if(b.hasAttribute('data-mv'))p.ver=b.getAttribute('data-mv');
        else if(b.hasAttribute('data-mm'))p.model=b.getAttribute('data-mm');
        else if(b.hasAttribute('data-mvolt'))p.volts=Number(b.getAttribute('data-mvolt'));
        else if(b.id==='m-clear'){set(null);return}
        else if(b.id==='m-done'){pan.hidden=true;chip.setAttribute('aria-expanded','false');sync();chip.focus();return}
        else return;
        set(p);
      });
      var ec=document.getElementById('m-early');
      if(ec)ec.addEventListener('change',function(){var p=current();p.early=ec.checked;set(p)});
      document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pan.hidden){pan.hidden=true;chip.setAttribute('aria-expanded','false');sync()}});
    }
    if(nt&&nl)nt.addEventListener('click',function(){var open=nt.getAttribute('aria-expanded')!=='true';nt.setAttribute('aria-expanded',String(open));nl.classList.toggle('open',open);if(open)closePanel();sync()});
    Array.prototype.forEach.call(document.querySelectorAll('[data-setmachine]'),function(b){
      b.addEventListener('click',function(){
        var p=current();p.ver=b.getAttribute('data-setmachine');set(p);
      });
    });
    var inViewer=typeof window.claude!=='undefined';
    var pb=document.querySelectorAll('[data-print]');
    if(!inViewer)Array.prototype.forEach.call(pb,function(b){b.hidden=false;b.addEventListener('click',function(){window.print()})});
    apply();
    hints();window.addEventListener('resize',hints);
  }
  /* "swipe sideways" under drawings and tables that are wider than the screen */
  function hints(){
    Array.prototype.forEach.call(document.querySelectorAll('.scroll,.tablewrap,.table-wrap'),function(el){
      var over=el.scrollWidth>el.clientWidth+8,h=el.nextElementSibling&&el.nextElementSibling.classList.contains('swipe-hint')?el.nextElementSibling:null;
      if(over&&!h){h=document.createElement('p');h.className='swipe-hint';h.textContent=el.querySelector('svg')?'Swipe sideways to see the whole drawing':'Swipe sideways to see every column';el.parentNode.insertBefore(h,el.nextSibling)}
      else if(!over&&h)h.remove();
    });
  }
  window.SilviaMachine={get:function(){return prof},set:set,current:current,matches:matches,decided:decided,text:text,label:label,missing:missing,summary:summary,apply:apply};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
