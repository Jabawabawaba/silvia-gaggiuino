  /* What a page tells the runbook (progress-store.js, on the parts tracker, wire labels, cut list, power-on checks and
     runbook pages): one record in this browser, silvia-progress-v1, where each page keeps a short summary under its own
     name. The runbook reads it, with Your Silvia and the tracker's own record, to tick the steps those pages cover.
     put(name, value) replaces that page's summary and writes only when it changed. vkFor(profile) names the harness a
     page shows for a profile: 'sh' with the Shelly add-on, 'base' without it, as the cut list and labels pick it.
     sig(profile) is a short fingerprint, so a summary made for another machine isn't taken for this one. */
  var PS=(function(){
    var KEY='silvia-progress-v1';
    function read(){try{var s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&typeof s==='object'?s:{}}catch(e){return {}}}
    function put(name,value){
      try{
        var s=read(),was=JSON.stringify(s[name]===undefined?null:s[name]),now=JSON.stringify(value===undefined?null:value);
        if(was===now)return;
        if(value==null)delete s[name];else s[name]=value;
        localStorage.setItem(KEY,JSON.stringify(s));
      }catch(e){}
    }
    function vkFor(p){return p&&p.shelly?'sh':'base'}
    function sig(p){p=p||{};return [p.ver||'',p.model||'',p.volts||'',p.early?'early':'',p.shelly?'sh':''].join('|')}
    return {KEY:KEY,read:read,put:put,vkFor:vkFor,sig:sig};
  })();
