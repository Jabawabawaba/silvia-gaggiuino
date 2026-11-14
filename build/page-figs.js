  /* The runbook's figures (runbook-figs.js) on another page: PF() returns the settings for RBF.init, with drawings
     and their text following Your Silvia; nothing unknown ever hides anything. A page that plays part guide drawings
     defines PGD first (the part guides' data, as the runbook wraps it). */
  function PF(){
    function SM(){return window.SilviaMachine||null}
    function m(w){var s=SM();return !w||!s||s.matches(w)}
    function T(x){
      if(x==null)return '';if(!Array.isArray(x))return String(x);var s=SM();
      return s&&s.txt?s.txt(x):x.filter(function(t){return typeof t==='string'||m(t[1])}).map(function(t){return typeof t==='string'?t:t[0]}).join(' ').replace(/ ([,.;:])/g,'$1');
    }
    function fill(t){var s=SM();return String(t==null?'':t).replace(/\{(outlet|gfci|volts)\}/g,function(_,k){return s&&s.text?s.text(k):''})}
    return {G:(typeof PGD!=='undefined'&&PGD)?PGD.G:null,ok:m,m:m,T:T,fill:fill,famOf:function(){return null},
      prof:function(){var s=SM();return (s&&s.get())||{}},dv:function(){return false},guides:'part-guides.html'};
  }
