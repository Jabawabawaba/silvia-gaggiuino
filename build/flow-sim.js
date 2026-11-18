/* Electricity flow: a small circuit solver for the wiring maps. Identical on both sites.
   A drawing's runs are wires between named terminals; a model adds what's inside the parts for one machine state:
   joins (always connected), closed contacts, and loads (elements, lamps, coils, the PCB's supply).
   FLOW.solve(model) -> {cur:{runId: +1 (frm to to) | -1}, amp:{runId: size of the current, mains only},
     live:{runId:1}, loads:{loadId: share of the supply voltage across it}, sw:{contactId: size of the current}}
   model = {runs:[{id,a,b}], joins:[[a,b]], closed:[{id,a,b}], loads:[{id,a,b,r}], src:[{from,to,mains}]}
   Each source is solved on its own, as a resistor network: every terminal is a node, wires and closed contacts are
   near-zero resistances and loads are real ones, and a unit voltage from `from` to `to` gives every wire's current
   and direction (a load shorted by a closed contact carries none; wires in a loop share current). "live" marks
   mains wires that sit above neutral potential but carry no current.
   Limits: "live" assumes the supply's `to` side really is neutral, and an open contact is treated as a perfect
   break, which a solid-state one (an SSR, a triac output) is not. Which throw of a switch is closed in each state
   comes from the model: the official drawings show the spades in use, not the throws. */
var FLOW=(function(){
  function solve(M){
    var out={cur:{},amp:{},live:{},loads:{},sw:{}};
    (M.src||[]).forEach(function(S){one(M,S,out)});
    return out;
  }
  function one(M,S,out){
    /* every terminal is a node; wires, joins and closed contacts are near-zero resistances, so parallel paths
       (a loop of wires) share current as they really would */
    var RW=1e-5,E=[],adj={};
    function edge(k,id,a,b,r){if(a===b)return;var i=E.length;E.push({k:k,id:id,a:a,b:b,r:r});(adj[a]=adj[a]||[]).push(i);(adj[b]=adj[b]||[]).push(i)}
    M.runs.forEach(function(r){edge('run',r.id,r.a,r.b,RW)});
    (M.joins||[]).forEach(function(j){edge('join',null,j[0],j[1],RW)});
    (M.closed||[]).forEach(function(c){edge('sw',c.id,c.a,c.b,RW)});
    (M.loads||[]).forEach(function(l){edge('load',l.id,l.a,l.b,l.r||1)});
    var s=S.from,t=S.to;if(s===t||!adj[s])return;
    /* the nodes reachable from the source */
    var seen={},q=[s];seen[s]=1;
    while(q.length){var n=q.pop();(adj[n]||[]).forEach(function(i){var e=E[i],o=e.a===n?e.b:e.a;if(!seen[o]){seen[o]=1;q.push(o)}})}
    var nodes=Object.keys(seen),V={};
    if(!seen[t]){nodes.forEach(function(n){V[n]=1})}
    else{
      var unk=nodes.filter(function(n){return n!==s&&n!==t}),ix={};unk.forEach(function(n,i){ix[n]=i});
      var N=unk.length,A=[],B=[],i,j,k;
      for(i=0;i<N;i++){A.push(new Float64Array(N));B.push(0)}
      E.forEach(function(e){
        if(!seen[e.a])return;var g=1/e.r;
        [[e.a,e.b],[e.b,e.a]].forEach(function(p){var u=p[0],w=p[1];if(!(u in ix))return;A[ix[u]][ix[u]]+=g;if(w in ix)A[ix[u]][ix[w]]-=g;else if(w===s)B[ix[u]]+=g});
      });
      for(i=0;i<N;i++){
        var piv=i;for(k=i+1;k<N;k++)if(Math.abs(A[k][i])>Math.abs(A[piv][i]))piv=k;
        if(Math.abs(A[piv][i])<1e-12)continue;
        var tA=A[i];A[i]=A[piv];A[piv]=tA;var tB=B[i];B[i]=B[piv];B[piv]=tB;
        for(k=0;k<N;k++){if(k===i)continue;var f=A[k][i]/A[i][i];if(!f)continue;for(j=i;j<N;j++)A[k][j]-=f*A[i][j];B[k]-=f*B[i]}
      }
      V[s]=1;V[t]=0;unk.forEach(function(n,i){V[n]=Math.abs(A[i][i])<1e-12?1:B[i]/A[i][i]});
    }
    var EPS=2e-5;
    E.forEach(function(e){
      if(!(e.a in V))return;
      var I=(V[e.a]-V[e.b])/e.r,m=Math.abs(I);
      if(e.k==='load'){if(m>EPS)out.loads[e.id]=Math.abs(V[e.a]-V[e.b]);return}
      if(m>EPS){
        if(e.k==='run'){out.cur[e.id]=I>0?1:-1;if(S.mains)out.amp[e.id]=m}
        else if(e.k==='sw')out.sw[e.id]=Math.max(out.sw[e.id]||0,m);
      }else if(e.k==='run'&&S.mains&&V[e.a]>0.02)out.live[e.id]=1;
    });
  }
  return {solve:solve};
})();
