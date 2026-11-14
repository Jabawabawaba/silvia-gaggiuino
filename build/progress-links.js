  /* Steps the runbook ticks for you (progress-links.js, needs progress-store.js). Your Silvia, the parts tracker, and
     the wire labels, cut list and power-on checks pages keep their own records in this browser; a step whose record
     says it's done counts as done in the runbook, with a line under it saying where that came from, and unticks again
     if the record changes. A step without a rule here is ticked by hand only.
     get(id) returns null for a step with no rule, or {on, t, go}: on is done, t the line under the step, and go where
     to change it ('machine' for Your Silvia, or a page key and hash). */
  var PL=(function(){
    var TKEY='silvia-parts-tracker-v1',CKEY='silvia-power-on-checks-v2';
    function rd(k){try{var s=localStorage.getItem(k);return s?JSON.parse(s):null}catch(e){return null}}
    function SMx(){return window.SilviaMachine||null}
    function prof(){var m=SMx();return (m&&m.get())||null}
    function newer(v){return v==='V5'||v==='V6'}
    function mname(){var m=SMx(),p=prof();if(!p)return '';if(m&&m.label)return m.label(Object.assign({},p,{shelly:false}));return [(p.ver||'')+(newer(p.ver)&&p.model?' '+p.model:''),p.volts?p.volts+' V':''].filter(Boolean).join(', ')}
    function andList(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]}
    var STN={ordered:'Ordered',received:'Received',have:'Already have'};
    function tparts(){var s=rd(TKEY);return s&&s.parts&&typeof s.parts==='object'?s.parts:{}}
    function tst(id){var s=(tparts()[id]||{}).status;return STN[s]?s:null}
    function tgot(id,sub){var g=(tparts()[id]||{}).got;return !!(g&&g[sub]===true)}
    function fmtDate(ts){try{return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric'})}catch(e){return ''}}
    function prog(){return PS.read()}
    function vk(){return PS.vkFor(prof())}
    function harness(){return vk()==='sh'?'the harness with the Shelly':'the harness'}
    /* a line ordered or in hand, or every listed piece of it ticked off */
    function line(id,name,subs){
      var s=tst(id),pieces=(subs||[]).length&&subs.every(function(x){return tgot(id,x)}),on=!!s||pieces;
      return {on:on,t:on?('From the parts tracker: '+name+(s?' marked '+STN[s]:' ticked off')+'.'):('Ticks itself when the parts tracker shows '+name+' ordered.'),go:['tracker','#'+id]};
    }
    /* the cut list's tally for the harness on show: [rows, ticked] for every run, and for the runs the Shelly adds or changes */
    function cut(which){
      var c=(prog().cut||{})[vk()],t=c&&(which==='sh'?c.sh:c.all);
      if(which==='sh'&&c&&Array.isArray(c.keep)&&c.keep.length)return {on:false,t:'The cut list leaves out the stock '+andList(c.keep)+' you\'re keeping, and the Shelly changes their ends, so tick this step yourself once they\'re done.',go:['cut','']};
      if(!t||!t[0])return {on:false,t:'Ticks itself when every '+(which==='sh'?'run the Shelly adds or changes':'run of '+harness())+' is ticked on the cut list.',go:['cut','']};
      var on=t[1]>=t[0],w=which==='sh'?' runs the Shelly adds or changes':' runs';
      return {on:on,t:on?('From the cut list: all '+t[0]+w+' ticked.'):('Cut list so far: '+t[1]+' of '+t[0]+w+' ticked. This ticks itself when they all are.'),go:['cut','']};
    }
    /* the power-on checks' tally for your Silvia, by section: [checks, passed, failed]; Covers on is h. It counts the
       newest run only, and only for this exact profile and this site's current list of checks (PS.CV), so a run or a
       list it wasn't made for never counts. */
    function checks(withH){
      var c=prog().checks;
      if(c&&c.sig===PS.sig(prof())&&c.sec&&c.ver!==PS.CV)return {on:false,t:'The power-on checks have changed since the checks page last counted yours. Open it to count them again.',go:['checks','']};
      if(!c||c.sig!==PS.sig(prof())||!c.sec)return {on:false,t:'Ticks itself when '+(withH?'every power-on check, Covers on too,':'every power-on check up to Covers on')+' passes for your Silvia.',go:['checks','']};
      var n=0,p=0,f=0;Object.keys(c.sec).forEach(function(s){if(s==='h'&&!withH)return;var x=c.sec[s];n+=x[0];p+=x[1];f+=x[2]});
      var on=n>0&&p>=n&&!f;
      return {on:on,t:on?('From the power-on checks: all '+n+' passed'+(withH?', Covers on too':' up to Covers on')+(c.run?' ('+c.run+')':'')+'.'):('Power-on checks so far: '+p+' of '+n+' passed'+(f?', '+f+' failed':'')+(withH?'':' up to Covers on')+'. This ticks itself when they all pass.'),go:['checks','']};
    }
    /* the element's wattage, entered on the power-on checks page: the newest run that has one */
    function watts(){var s=rd(CKEY);if(!s||!Array.isArray(s.runs))return null;var r=s.runs.slice().reverse().filter(function(x){return x&&typeof x.watts==='number'&&x.watts>0})[0];return r?r.watts:null}
    var RULES={
      p0v:function(){var p=prof(),on=!!(p&&p.ver&&p.volts&&(!newer(p.ver)||p.model));return {on:on,t:on?('Set in Your Silvia: '+mname()+'.'):'Ticks itself once Your Silvia has your version'+(p&&newer(p.ver)?', E or M model,':'')+' and mains voltage.',go:'machine'}},
      p0b:function(){
        var p=prof(),v=p&&p.volts,w=watts(),on=!!(v&&w);
        return {on:on,t:on?('Your Silvia has '+v+' V, and the power-on checks page has the element at '+w+' W.'):(!v?'Ticks itself once Your Silvia has your voltage and the power-on checks page has the element\'s wattage.':'Ticks itself once you enter the element\'s wattage, from the rating plate, on the power-on checks page.'),go:v?['checks','']:'machine'};
      },
      p0s:function(){return line('shelly','the Shelly',['relay'])},
      p0k:function(){
        var s=prog().tracker;
        if(!s||s.sig!==PS.sig(prof()))return {on:false,t:'Ticks itself when the parts tracker shows every part for your Silvia in hand. Open the tracker once to count them.',go:['tracker','']};
        /* a part the build needs, marked Not getting, keeps it open */
        var sk=Array.isArray(s.skip)?s.skip:[];
        if(sk.length)return {on:false,t:'Parts tracker: '+s.hand+' of '+s.n+' parts in hand, but '+andList(sk)+(sk.length>1?', parts the build needs, are':', a part the build needs, is')+' marked Not getting. This ticks itself once every part is in hand.',go:['tracker','']};
        var on=s.n>0&&s.hand>=s.n;
        return {on:on,t:on?('From the parts tracker: all '+s.n+' parts for your Silvia are in hand.'):('Parts tracker so far: '+s.hand+' of '+s.n+' parts in hand. This ticks itself when they all are.'),go:['tracker','']};
      },
      p0g:function(){
        var ts=(prog().labels||{})[vk()];
        return {on:!!ts,t:ts?('From the wire labels page: PDF made '+fmtDate(ts)+'.'):'Ticks itself when you make the PDF on the wire labels page for '+harness()+'.',go:['labels','']};
      },
      p2e:function(){return cut('all')},
      p2s:function(){return cut('sh')},
      p4z:function(){return checks(false)},
      p5a0:function(){return checks(true)}
    };
    function get(id){var r=RULES[id];return r?r():null}
    var KEYS=[TKEY,CKEY,PS.KEY,'silvia-machine-v1'];
    return {get:get,has:function(id){return !!RULES[id]},KEYS:KEYS};
  })();
