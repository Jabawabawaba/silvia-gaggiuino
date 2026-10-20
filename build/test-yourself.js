  /* ---------- Test yourself: the engine ----------
     Practice by topic, a list of what to review, and the final exam with its certificate. The page sets TY first:
       TY.key      where progress is kept in this browser
       TY.Q        the questions: {id, k (topic), q, a (options, the first one right), why, r (review refs), w (machine condition),
                   g (a group of questions asking the same thing, so an exam takes one at most)}
       TY.topics   [{k, name, d (one line), crit (every exam question in this topic must be right)}]
       TY.M        the machine: ok(w) (does a question fit the reader's machine), ready() (is it set well enough for the exam),
                   need() (what's still to set), label() (the machine in words), profile(), set() (opens the picker), on(fn) (changes)
       TY.ref(r)   a review ref turned into {h: href, l: label}, or null when it doesn't apply
       TY.fill(s)  fills wording that follows the machine ({gfci}, {outlet}, {volts}) in questions and answers
       TY.exam     {n (questions), crit (questions from the crit topic), per (from each other topic), pass (fraction right)}
       TY.site     the site's name, for the certificate; TY.mine and TY.setWord name the machine picker ("Your Gaggia")
     Practice: questions you haven't answered come first, then the ones you got wrong, and a miss comes back three
     questions later. A topic is cleared when every one of its questions that fits your machine was right the last time
     you answered it. The exam opens once every topic is cleared; it draws new questions each time, shows nothing until
     the end, and its answers count as practice too, so a miss sends you back to review it before you retake. */
  (function(){
    var Q=TY.Q,TOP=TY.topics,TK={};TOP.forEach(function(t){TK[t.k]=t});
    var root=document.getElementById('ty');if(!root)return;
    function $(id){return document.getElementById(id)}
    function F(s){return TY.fill?TY.fill(s):s}
    function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
    var QI={};Q.forEach(function(q){QI[q.id]=q});

    /* ---- saved progress ---- */
    function load(){try{var s=JSON.parse(localStorage.getItem(TY.key)||'null');if(s&&s.v===1&&s.q)return s}catch(e){}return {v:1,q:{},exam:{},name:''}}
    var S=load();if(!S.exam)S.exam={};
    function save(){try{localStorage.setItem(TY.key,JSON.stringify(S))}catch(e){}}
    function rec(id){return S.q[id]||null}
    function mark(id,ok){var r=S.q[id]||{n:0,r:0};r.n++;if(ok)r.r++;r.ok=ok;S.q[id]=r}

    /* ---- which questions apply ---- */
    function fits(q){try{return TY.M.ok(q.w)}catch(e){return !q.w}}
    function all(){return Q.filter(fits)}
    function inTopic(k){return all().filter(function(q){return q.k===k})}
    function good(q){var r=rec(q.id);return !!(r&&r.ok)}
    function missed(q){var r=rec(q.id);return !!(r&&!r.ok)}
    function cleared(k){var a=inTopic(k);return a.length>0&&a.every(good)}
    function nCleared(){return TOP.filter(function(t){return cleared(t.k)}).length}
    function allCleared(){return nCleared()===TOP.length}
    function refs(q){return (q.r||[]).map(function(r){try{return TY.ref(r)}catch(e){return null}}).filter(Boolean)}
    function refHTML(q,cls){var x=refs(q);if(!x.length)return '';
      return '<div class="'+(cls||'ty-rev')+'"><span class="k">Review</span><ul>'+x.map(function(l){return '<li><a href="'+esc(l.h)+'">'+esc(l.l)+'</a></li>'}).join('')+'</ul></div>'}

    /* ---- what's on screen ---- */
    var mode='home',P=null,X=null,flash='';
    var home=$('ty-home'),quiz=$('ty-quiz');

    function machineLine(){
      var el=$('ty-mach');if(!el)return;
      if(TY.M.ready())el.innerHTML='<span>Questions match <b>'+esc(TY.M.label())+'</b>.</span> <button type="button" class="linkbtn" data-act="mach">Change</button>';
      else el.innerHTML='<span><b>'+esc(TY.setWord)+' first.</b> '+esc(TY.M.need())+'</span> <button type="button" class="btn small" data-act="mach">'+esc(TY.setWord)+'</button>';
      el.classList.toggle('unset',!TY.M.ready());
    }
    function pathHTML(){
      var n=nCleared(),pass=S.exam.passed,ok=allCleared(),m=all().filter(missed).length;
      var s1=n===TOP.length||pass?'done':'now',s2=pass?'done':ok&&TY.M.ready()?'now':'locked',s3=pass?'done':'locked';
      function li(cls,i,t,d,href){return '<li class="'+cls+'"><span class="n" aria-hidden="true">'+(cls==='done'?'<svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8.5l3.2 3L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>':i)+'</span><span class="t">'+(href?'<a href="'+href+'">'+t+'</a>':t)+'</span><span class="d">'+d+'</span></li>'}
      return '<ol class="ty-path">'+
        li(s1,1,'Clear every topic',pass&&n<TOP.length?'Done; '+m+' to review below':n+' of '+TOP.length+' cleared','#ty-topics')+
        li(s2,2,'Pass the final exam',pass?'Passed, '+pass.score+' of '+pass.of:s2==='now'?'Open: '+TY.exam.n+' questions':'Opens when every topic is cleared','#ty-exam')+
        li(s3,3,'Graduate',pass?'Your certificate is below':'Ready to start the modifications',pass?'#ty-cert':null)+
      '</ol>';
    }
    function topicsHTML(){
      return TOP.map(function(t){
        var a=inTopic(t.k),g=a.filter(good).length,m=a.filter(missed).length,c=cleared(t.k);
        var st=!a.length?'<span class="tc-s">'+(TY.M.ready()?'No questions':esc(TY.setWord))+'</span>':c?'<span class="tc-s ok">Cleared</span>':m?'<span class="tc-s bad">'+m+' to review</span>':g?'<span class="tc-s">'+(a.length-g)+' to go</span>':'<span class="tc-s">'+a.length+(a.length===1?' question':' questions')+'</span>';
        return '<button type="button" class="tcard'+(c?' ok':'')+'" data-act="topic" data-k="'+t.k+'"'+(a.length?'':' disabled')+'>'+
          '<span class="tc-h"><b>'+esc(t.name)+'</b>'+st+'</span>'+
          '<span class="tc-d">'+esc(t.d)+(t.crit?' <em>Every exam question here must be right.</em>':'')+'</span>'+
          '<span class="tc-bar" aria-hidden="true"><i style="width:'+(a.length?Math.round(100*g/a.length):0)+'%"></i></span>'+
          '<span class="tc-n">'+g+' of '+a.length+' right</span></button>';
      }).join('');
    }
    function reviewHTML(){
      var m=all().filter(missed);
      if(!m.length)return '<p class="fine">Nothing to review yet. Questions you get wrong land here, with where on the site to read up on them.</p>';
      return '<div class="ty-actions"><button type="button" class="btn" data-act="miss">Practice these '+m.length+'</button></div>'+
        TOP.filter(function(t){return m.some(function(q){return q.k===t.k})}).map(function(t){
          return '<h3 class="rv-h">'+esc(t.name)+'</h3><ul class="rv">'+m.filter(function(q){return q.k===t.k}).map(function(q){
            return '<li><p class="rv-q">'+esc(F(q.q))+'</p><p class="rv-a"><span class="k">Answer</span> '+esc(F(q.a[0]))+'</p>'+refHTML(q,'ty-rev small')+'</li>';
          }).join('')+'</ul>';
        }).join('');
    }
    function examHTML(){
      var pass=S.exam.passed,last=S.exam.last,h='';
      if(!TY.M.ready())return '<p>The exam asks about your own machine, so it needs '+esc(TY.mine)+' set first. '+esc(TY.M.need())+'</p><div class="ty-actions"><button type="button" class="btn" data-act="mach">'+esc(TY.setWord)+'</button></div>';
      var rule='<p>'+TY.exam.n+' questions drawn from every topic, '+TY.exam.crit+' of them on '+esc(TK[critK()].name.toLowerCase())+'. No answers until the end. To pass you need '+Math.round(TY.exam.pass*100)+'% or more and every '+esc(TK[critK()].name.toLowerCase())+' question right. Each try draws new questions.</p>';
      if(!allCleared()){
        var left=TOP.filter(function(t){return !cleared(t.k)});
        h+=rule+'<p class="ty-lock"><b>Locked.</b> Clear every topic first: '+left.map(function(t){return '<button type="button" class="linkbtn" data-act="topic" data-k="'+t.k+'">'+esc(t.name)+'</button>'}).join(', ')+'.</p>';
      }else{
        h+=rule+'<div class="ty-actions"><button type="button" class="btn primary" data-act="exam">'+(pass?'Take it again':last?'Retake the exam':'Start the exam')+'</button></div>';
      }
      if(last&&!last.pass)h+='<p class="fine">Last try: '+last.score+' of '+last.of+(last.critOK?'':', with a '+esc(TK[critK()].name.toLowerCase())+' question wrong')+'.</p>';
      return h;
    }
    function critK(){var t=TOP.filter(function(t){return t.crit})[0];return t?t.k:TOP[0].k}
    function fmtDate(t){try{return new Date(t).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}catch(e){return new Date(t).toDateString()}}
    function certHTML(){
      var p=S.exam.passed;if(!p)return '';
      var now=TY.M.ready()?TY.M.label():'',diff=now&&p.label&&now!==p.label;
      return '<div class="cert" id="cert-card">'+
        '<div class="cert-in">'+
        '<svg class="cert-seal" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><path d="M38 61l15 14 30-31" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
        '<p class="cert-k">'+esc(TY.site)+'</p>'+
        '<p class="cert-t">Certificate of readiness</p>'+
        '<p class="cert-l">This certifies that</p>'+
        '<label class="cert-name"><span class="vh">Your name</span><input id="cert-name" type="text" maxlength="60" autocomplete="name" placeholder="Type your name" value="'+esc(S.name||'')+'"></label>'+
        '<p class="cert-l">has cleared every topic and passed the final exam, with every '+esc(TK[critK()].name.toLowerCase())+' question right, and is</p>'+
        '<p class="cert-big">Ready to start the modifications</p>'+
        '<dl class="cert-dl"><div><dt>Machine</dt><dd>'+esc(p.label||'')+'</dd></div><div><dt>Score</dt><dd>'+p.score+' of '+p.of+' ('+Math.round(100*p.score/p.of)+'%)</dd></div><div><dt>Date</dt><dd>'+esc(fmtDate(p.at))+'</dd></div></dl>'+
        '<p class="cert-fine">'+esc(TY.certFine)+'</p>'+
        '</div></div>'+
        (diff?'<p class="fine ty-note">You passed for a '+esc(p.label)+'. '+esc(TY.mine)+' is now set to '+esc(now)+': take the exam again so the certificate matches it.</p>':'')+
        '<div class="ty-actions no-print"><button type="button" class="btn primary" data-act="print">Print the certificate</button><a class="btn" href="'+esc(TY.startHref)+'">'+esc(TY.startWord)+'</a></div>';
    }
    function renderHome(){
      machineLine();
      $('ty-pathwrap').innerHTML=pathHTML();
      $('ty-topics').innerHTML=topicsHTML();
      var a=all(),g=a.filter(good).length;
      $('ty-tsum').textContent=g+' of '+a.length+' right';
      var m=a.filter(missed).length;
      $('ty-rsum').textContent=m?m+' to review':'';
      $('ty-review').innerHTML=reviewHTML();
      $('ty-examb').innerHTML=examHTML();
      var c=$('ty-cert');c.hidden=!S.exam.passed;$('ty-certb').innerHTML=certHTML();
      var mx=$('ty-mix');if(mx)mx.disabled=!a.length;
      var fl=$('ty-flash');fl.hidden=!flash;fl.textContent=flash;
    }
    function show(m){
      mode=m;home.hidden=m!=='home';quiz.hidden=m==='home';
      if(m==='home'){renderHome()}
    }
    function toQuiz(){quiz.scrollIntoView({block:'start'});var h=$('qc-q');if(h)try{h.focus({preventScroll:true})}catch(e){h.focus()}}

    /* ---- practice ---- */
    function startPractice(k){
      var pool=k==='mix'?all():k==='miss'?all().filter(missed):inTopic(k);
      if(!pool.length)return;
      var miss=shuffle(pool.filter(missed)),fresh=shuffle(pool.filter(function(q){return !rec(q.id)}));
      var queue=miss.concat(fresh),again=false;
      if(!queue.length){queue=shuffle(pool);again=true}
      P={k:k,queue:queue.map(function(q){return q.id}),cur:null,order:null,pick:null,n:0,right:0,again:again};
      flash='';show('quiz');nextQ();toQuiz();
    }
    function title(){return P.k==='mix'?'Mixed practice':P.k==='miss'?'What you missed':TK[P.k].name}
    function leftCount(){
      if(P.k==='miss')return all().filter(missed).length;
      var pool=P.k==='mix'?all():inTopic(P.k);return pool.filter(function(q){return !good(q)}).length;
    }
    function nextQ(){
      while(P.queue.length&&(!QI[P.queue[0]]||!fits(QI[P.queue[0]])))P.queue.shift();
      if(!P.queue.length){P.cur=null;renderDone();return}
      P.cur=P.queue.shift();P.order=shuffle(QI[P.cur].a.map(function(_,i){return i}));P.pick=null;renderQ();
    }
    function qHead(top,count,pct){
      return '<div class="qc-top"><span class="k">'+esc(top)+'</span><span class="qc-n">'+esc(count)+'</span><button type="button" class="linkbtn" data-act="home">'+(mode==='exam'?'Stop the exam':'Back to topics')+'</button></div>'+
        '<div class="qc-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></div>';
    }
    function optsHTML(q,order,pick,reveal){
      return '<div class="qc-opts" role="group" aria-labelledby="qc-q">'+order.map(function(oi,i){
        var cls='opt';if(reveal){if(oi===0)cls+=' right';else if(i===pick)cls+=' wrong';else cls+=' dim'}else if(i===pick)cls+=' picked';
        return '<button type="button" class="'+cls+'" data-act="pick" data-i="'+i+'"'+(reveal?' aria-disabled="true"':'')+' aria-pressed="'+(i===pick)+'"><span class="ol" aria-hidden="true">'+'ABCD'.charAt(i)+'</span><span class="ot">'+esc(F(q.a[oi]))+'</span>'+
          (reveal&&oi===0?'<span class="vh"> (right answer)</span>':reveal&&i===pick?'<span class="vh"> (your answer)</span>':'')+'</button>';
      }).join('')+'</div>';
    }
    function renderQ(){
      var q=QI[P.cur],left=leftCount(),pool=P.k==='mix'?all():P.k==='miss'?null:inTopic(P.k);
      var pct=pool?Math.round(100*(pool.length-left)/pool.length):Math.round(100*P.right/Math.max(1,P.n+left));
      var cnt=P.again?'Practice again':left?left+' still to get right':'All right so far';
      var reveal=P.pick!==null,ok=reveal&&P.order[P.pick]===0;
      quiz.innerHTML='<div class="qc">'+qHead(title()+(P.k==='mix'||P.k==='miss'?' · '+TK[q.k].name:''),cnt,pct)+
        '<h2 class="qc-q" id="qc-q" tabindex="-1">'+esc(F(q.q))+'</h2>'+
        optsHTML(q,P.order,P.pick,reveal)+
        '<div class="qc-fb" id="qc-fb" aria-live="polite">'+(reveal?
          '<div class="fb '+(ok?'good':'bad')+'"><p class="verdict">'+(ok?'Right.':'Not quite. The answer is: '+esc(F(q.a[0])))+'</p><p class="why">'+esc(F(q.why))+'</p>'+refHTML(q,ok?'ty-rev small':'ty-rev')+'</div>':'')+
        '</div>'+
        '<div class="qc-act">'+(reveal?'<button type="button" class="btn primary" id="qc-next" data-act="next">'+(P.queue.length?'Next question':'Finish')+'</button>':'<span class="fine">Pick an answer. Keys 1 to '+q.a.length+' work too.</span>')+'</div>'+
      '</div>';
    }
    function pickPractice(i){
      if(P.pick!==null||!P.cur)return;
      P.pick=i;var ok=P.order[i]===0;P.n++;if(ok)P.right++;
      mark(P.cur,ok);save();
      if(!ok){var at=Math.min(3,P.queue.length);P.queue.splice(at,0,P.cur)}
      renderQ();var b=$('qc-next');if(b)try{b.focus({preventScroll:true})}catch(e){b.focus()}
      var fb=$('qc-fb');if(fb&&fb.getBoundingClientRect){var r=fb.getBoundingClientRect();if(r.bottom>innerHeight)fb.scrollIntoView({block:'nearest'})}
      var nb=$('qc-next');if(nb){var r2=nb.getBoundingClientRect();if(r2.bottom>innerHeight)nb.scrollIntoView({block:'nearest'})}
    }
    function renderDone(){
      var k=P.k,c=k==='mix'?allCleared():k==='miss'?!all().some(missed):cleared(k),left=leftCount();
      var nextT=TOP.filter(function(t){return !cleared(t.k)&&inTopic(t.k).length})[0];
      var msg=c?(k==='mix'||k==='miss'?'All right.':'Topic cleared.'):left+' still to get right. They come back until you get them.';
      quiz.innerHTML='<div class="qc done">'+qHead(title(),P.right+' of '+P.n+' right this round',100)+
        '<h2 class="qc-q" id="qc-q" tabindex="-1">'+esc(msg)+'</h2>'+
        (c&&allCleared()&&!S.exam.passed?'<p>Every topic is cleared. The final exam is open.</p>':'')+
        '<div class="ty-actions">'+
          (!c?'<button type="button" class="btn primary" data-act="topic" data-k="'+k+'">Keep going</button>':'')+
          (c&&allCleared()&&!S.exam.passed&&TY.M.ready()?'<button type="button" class="btn primary" data-act="exam">Start the final exam</button>':'')+
          (c&&nextT&&nextT.k!==k?'<button type="button" class="btn'+(allCleared()?'':' primary')+'" data-act="topic" data-k="'+nextT.k+'">Next topic: '+esc(nextT.name)+'</button>':'')+
          '<button type="button" class="btn" data-act="home">Back to topics</button>'+
        '</div></div>';
      toQuiz();
    }

    /* ---- the exam ---- */
    function startExam(){
      if(!allCleared()||!TY.M.ready())return;
      var a=all(),ck=critK(),used={},grp={},list=[];
      /* questions that ask the same thing another way share a group (g): an exam takes one of them at most */
      function take(arr,n){arr.forEach(function(q){if(n>0&&!used[q.id]&&!(q.g&&grp[q.g])){used[q.id]=1;if(q.g)grp[q.g]=1;list.push(q);n--}})}
      var cr=a.filter(function(q){return q.k===ck});
      take(shuffle(cr.filter(function(q){return q.crit})).concat(shuffle(cr.filter(function(q){return !q.crit}))),TY.exam.crit);
      shuffle(TOP.filter(function(t){return t.k!==ck})).forEach(function(t){take(shuffle(a.filter(function(q){return q.k===t.k})),TY.exam.per)});
      take(shuffle(a.filter(function(q){return q.k!==ck})),TY.exam.n-list.length);
      list=shuffle(list);
      X={list:list.map(function(q){return q.id}),orders:list.map(function(q){return shuffle(q.a.map(function(_,i){return i}))}),picks:[],i:0};
      flash='';show('exam');renderExam();toQuiz();
    }
    function renderExam(){
      var i=X.i,n=X.list.length,q=QI[X.list[i]],pick=X.picks[i]==null?null:X.picks[i];
      quiz.innerHTML='<div class="qc exam">'+qHead('Final exam','Question '+(i+1)+' of '+n,Math.round(100*i/n))+
        '<h2 class="qc-q" id="qc-q" tabindex="-1">'+esc(F(q.q))+'</h2>'+
        optsHTML(q,X.orders[i],pick,false)+
        '<div class="qc-act">'+(i>0?'<button type="button" class="btn" data-act="eprev">Back</button>':'')+
        '<button type="button" class="btn primary" id="qc-next" data-act="enext"'+(pick===null?' disabled':'')+'>'+(i+1<n?'Next':'Finish the exam')+'</button></div>'+
      '</div>';
    }
    function pickExam(i){X.picks[X.i]=i;renderExam();var b=$('qc-next');if(b)try{b.focus({preventScroll:true})}catch(e){b.focus()}}
    function finishExam(){
      var n=X.list.length,score=0,ck=critK(),critOK=true,byT={},miss=[];
      X.list.forEach(function(id,i){
        var q=QI[id],ok=X.orders[i][X.picks[i]]===0;
        if(ok)score++;else{miss.push(i);if(q.k===ck)critOK=false}
        var t=byT[q.k]||(byT[q.k]={n:0,r:0});t.n++;if(ok)t.r++;
        mark(id,ok);
      });
      var need=Math.ceil(n*TY.exam.pass-1e-9),pass=score>=need&&critOK;
      S.exam.last={score:score,of:n,pass:pass,critOK:critOK,at:Date.now()};
      S.exam.tries=(S.exam.tries||0)+1;
      if(pass)S.exam.passed={at:Date.now(),score:score,of:n,label:TY.M.label(),prof:TY.M.profile()};
      save();
      mode='result';
      var rows=TOP.filter(function(t){return byT[t.k]}).map(function(t){var b=byT[t.k];return '<tr><td>'+esc(t.name)+'</td><td class="num'+(b.r<b.n?' miss':'')+'">'+b.r+' of '+b.n+'</td></tr>'}).join('');
      var why=pass?'':score<need&&!critOK?'You need '+need+' right and every '+esc(TK[ck].name.toLowerCase())+' question.':score<need?'You need '+need+' right.':'Every '+esc(TK[ck].name.toLowerCase())+' question has to be right, even with a high score.';
      quiz.innerHTML='<div class="qc result '+(pass?'pass':'fail')+'">'+
        '<div class="qc-top"><span class="k">Final exam</span><span class="qc-n">'+(pass?'Passed':'Not yet')+'</span><button type="button" class="linkbtn" data-act="home">Back to topics</button></div>'+
        '<h2 class="qc-q" id="qc-q" tabindex="-1">'+score+' of '+n+' ('+Math.round(100*score/n)+'%). '+(pass?'You passed.':'Not yet.')+'</h2>'+
        (pass?'<p>Every '+esc(TK[ck].name.toLowerCase())+' question right. Your certificate is ready.</p>':'<p>'+why+' The questions you missed are back in practice. Get them right there, then retake the exam: it draws new questions.</p>')+
        '<div class="ty-actions">'+(pass?'<button type="button" class="btn primary" data-act="cert">See your certificate</button>':'<button type="button" class="btn primary" data-act="miss"'+(miss.length?'':' disabled')+'>Practice what you missed</button>')+'<button type="button" class="btn" data-act="home">Back to topics</button></div>'+
        '<div class="tablewrap"><table class="res-t"><thead><tr><th>Topic</th><th class="num">Right</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
        (miss.length?'<h3 class="rv-h">What you missed</h3><ul class="rv">'+miss.map(function(i){var q=QI[X.list[i]],yours=q.a[X.orders[i][X.picks[i]]];
          return '<li><p class="rv-q">'+esc(F(q.q))+'</p><p class="rv-y"><span class="k">You said</span> '+esc(F(yours))+'</p><p class="rv-a"><span class="k">Answer</span> '+esc(F(q.a[0]))+'</p><p class="why">'+esc(F(q.why))+'</p>'+refHTML(q,'ty-rev small')+'</li>'}).join('')+'</ul>':'')+
      '</div>';
      X=null;toQuiz();
    }

    /* ---- input ---- */
    root.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('[data-act]');if(!b||!root.contains(b))return;
      var act=b.getAttribute('data-act');
      if(act==='topic'){startPractice(b.getAttribute('data-k'))}
      else if(act==='mix'){startPractice('mix')}
      else if(act==='miss'){startPractice('miss')}
      else if(act==='pick'){var i=+b.getAttribute('data-i');if(mode==='exam')pickExam(i);else if(mode==='quiz')pickPractice(i)}
      else if(act==='next'){nextQ();toQuiz()}
      else if(act==='enext'){if(X.picks[X.i]==null)return;if(X.i+1<X.list.length){X.i++;renderExam();toQuiz()}else finishExam()}
      else if(act==='eprev'){if(X.i>0){X.i--;renderExam();toQuiz()}}
      else if(act==='exam'){startExam()}
      else if(act==='home'){if(mode==='exam'&&X&&X.picks.length&&!confirmStop())return;X=null;P=null;show('home');home.scrollIntoView({block:'start'})}
      else if(act==='cert'){X=null;P=null;show('home');var c=$('ty-cert');if(c)c.scrollIntoView({block:'start'})}
      else if(act==='mach'){TY.M.set()}
      else if(act==='print'){document.body.classList.add('print-cert');setTimeout(function(){window.print()},30)}
      else if(act==='reset'){resetAsk(b)}
    });
    /* stopping an exam part way is a second tap on the same link, not a browser dialog */
    var stopArmed=0;
    function confirmStop(){if(Date.now()-stopArmed<4000)return true;stopArmed=Date.now();var l=quiz.querySelector('.qc-top .linkbtn');if(l)l.textContent='Tap again to stop';return false}
    var resetArmed=0;
    function resetAsk(b){
      if(Date.now()-resetArmed<5000){S={v:1,q:{},exam:{},name:S.name||''};save();resetArmed=0;flash='Progress cleared.';renderHome();return}
      resetArmed=Date.now();b.textContent='Tap again to clear all progress';setTimeout(function(){if(b.isConnected)b.textContent='Start over'},5000);
    }
    addEventListener('afterprint',function(){document.body.classList.remove('print-cert')});
    root.addEventListener('input',function(e){if(e.target&&e.target.id==='cert-name'){S.name=e.target.value.slice(0,60);save()}});
    document.addEventListener('keydown',function(e){
      if(mode==='home'||e.altKey||e.ctrlKey||e.metaKey)return;
      var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
      if(t&&t.closest&&t.closest('.site-nav'))return;
      var k=e.key,i='1234'.indexOf(k);if(i<0)i='abcd'.indexOf(String(k).toLowerCase());
      var opts=quiz.querySelectorAll('.opt');
      if(i>=0&&i<opts.length){e.preventDefault();opts[i].click();return}
      if(k==='Enter'&&t&&t.tagName!=='BUTTON'&&t.tagName!=='A'){var n=$('qc-next');if(n&&!n.disabled){e.preventDefault();n.click()}}
    });
    TY.M.on(function(){
      if(mode==='exam'){X=null;flash=TY.mine+' changed, so the exam stopped. Start it again when you\'re ready.';show('home');return}
      if(mode==='home'||mode==='result')show('home');
      else if(mode==='quiz'&&P){if(P.cur&&!fits(QI[P.cur])){nextQ()}else renderQ()}
    });
    show('home');
    /* links into the page: #ty-exam, #ty-cert and #ty-topics are sections; #ty-k-<topic> starts that topic */
    function fromHash(){var h=(location.hash||'').slice(1);var m=/^ty-k-([a-z]+)$/.exec(h);if(m&&TK[m[1]])startPractice(m[1])}
    fromHash();addEventListener('hashchange',fromHash);
  })();
