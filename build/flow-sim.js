/* Electricity flow: a small circuit solver for the wiring maps. Identical on both sites.
   A drawing's runs are wires between named terminals; a model adds what's inside the parts for one machine state:
   joins (always connected), closed contacts, and loads (elements, lamps, coils, the PCB's supply).
   FLOW.solve(model) -> {cur:{runId: +1 (frm to to) | -1}, amp:{runId: size of the current, mains only},
     live:{runId:1}, loads:{loadId: share of the supply voltage across it}, sw:{contactId: size of the current}}
   model = {runs:[{id,a,b}], joins:[[a,b]], closed:[{id,a,b}], loads:[{id,a,b,r}], src:[{from,to,mains}]}
   Each source is solved on its own: wires and closed contacts form nets at one potential, loads join nets, and a
   unit voltage from `from` to `to` gives each load's current (a load shorted by a closed contact carries none).
   Wire currents come from each net's spanning tree. "live" marks mains wires that sit above neutral potential
   but carry no current.
   Limits: current is shared out on a spanning tree, so a second wire that closes a loop inside one net would show
   none (no harness here has one); "live" assumes the supply's `to` side really is neutral; and an open contact is
   treated as a perfect break, which a solid-state one (an SSR, a triac output) is not. */
var FLOW=(function(){
  function solve(M){
    var out={cur:{},amp:{},live:{},loads:{},sw:{}};
    (M.src||[]).forEach(function(S){one(M,S,out)});
    return out;
  }
  function one(M,S,out){
    var par={};
    function find(x){if(!(x in par))par[x]=x;while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x}
    function uni(a,b){a=find(a);b=find(b);if(a!==b)par[a]=b}
    var Z=[];
    M.runs.forEach(function(r){Z.push({k:'run',id:r.id,a:r.a,b:r.b})});
    (M.joins||[]).forEach(function(j){Z.push({k:'join',a:j[0],b:j[1]})});
    (M.closed||[]).forEach(function(c){Z.push({k:'sw',id:c.id,a:c.a,b:c.b})});
    Z.forEach(function(e){uni(e.a,e.b)});
    var s=find(S.from),t=find(S.to);
    if(s===t)return;
    var L=(M.loads||[]).filter(function(l){return find(l.a)!==find(l.b)});
    /* the nets reachable from the source through loads */
    var seen={},q=[s];seen[s]=1;
    while(q.length){var n=q.pop();L.forEach(function(l){var a=find(l.a),b=find(l.b),o=a===n?b:b===n?a:null;if(o&&!seen[o]){seen[o]=1;q.push(o)}})}
    var nets=Object.keys(seen),V={};
    if(!seen[t]){nets.forEach(function(n){V[n]=1})}
    else{
      var unk=nets.filter(function(n){return n!==s&&n!==t}),ix={};unk.forEach(function(n,i){ix[n]=i});
      var N=unk.length,A=[],B=[],i,j,k;
      for(i=0;i<N;i++){A.push([]);for(j=0;j<N;j++)A[i].push(0);B.push(0)}
      L.forEach(function(l){
        var a=find(l.a),b=find(l.b);if(!seen[a]||!seen[b])return;var g=1/(l.r||1);
        [[a,b],[b,a]].forEach(function(p){var u=p[0],w=p[1];if(!(u in ix))return;A[ix[u]][ix[u]]+=g;if(w in ix)A[ix[u]][ix[w]]-=g;else if(w===s)B[ix[u]]+=g});
      });
      for(i=0;i<N;i++){
        var piv=i;for(k=i+1;k<N;k++)if(Math.abs(A[k][i])>Math.abs(A[piv][i]))piv=k;
        if(Math.abs(A[piv][i])<1e-12)continue;
        var tA=A[i];A[i]=A[piv];A[piv]=tA;var tB=B[i];B[i]=B[piv];B[piv]=tB;
        for(k=0;k<N;k++){if(k===i)continue;var f=A[k][i]/A[i][i];if(!f)continue;for(j=i;j<N;j++)A[k][j]-=f*A[i][j];B[k]-=f*B[i]}
      }
      V[s]=1;V[t]=0;unk.forEach(function(n,i){V[n]=Math.abs(A[i][i])<1e-12?1:B[i]/A[i][i]});
    }
    /* load currents, and what each terminal takes out of (+) or puts into (-) its net */
    var inj={},tot=0,EPS=1e-7;
    function add(x,c){inj[x]=(inj[x]||0)+c}
    L.forEach(function(l){
      var a=find(l.a),b=find(l.b);if(!(a in V)||!(b in V))return;
      var I=(V[a]-V[b])/(l.r||1);if(Math.abs(I)<EPS)return;
      out.loads[l.id]=Math.abs(V[a]-V[b]);add(l.a,I);add(l.b,-I);
      if(a===s)tot+=I;if(b===s)tot-=I;
    });
    add(S.from,-tot);add(S.to,tot);
    /* wire currents: in each net, a spanning tree of its wires; an edge carries what its far side takes */
    var adj={};Z.forEach(function(e,i){(adj[e.a]=adj[e.a]||[]).push([e.b,i]);(adj[e.b]=adj[e.b]||[]).push([e.a,i])});
    var done={};
    Object.keys(adj).forEach(function(root){
      if(done[root])return;var net=find(root);
      var ord=[root],pe={},pn={};done[root]=1;
      for(var h=0;h<ord.length;h++){(adj[ord[h]]||[]).forEach(function(x){if(!done[x[0]]){done[x[0]]=1;pe[x[0]]=x[1];pn[x[0]]=ord[h];ord.push(x[0])}})}
      if(!(net in V))return;
      var sub={};
      for(var m=ord.length-1;m>0;m--){
        var n=ord[m],c=(inj[n]||0)+(sub[n]||0),e=Z[pe[n]];
        sub[pn[n]]=(sub[pn[n]]||0)+c;
        if(Math.abs(c)<EPS)continue;
        /* c > 0: current runs from the parent side to n */
        var dir=(e.b===n)===(c>0)?1:-1;
        if(e.k==='run'){out.cur[e.id]=dir;if(S.mains)out.amp[e.id]=Math.abs(c)}else if(e.k==='sw')out.sw[e.id]=Math.abs(c);
      }
      if(S.mains&&V[net]>0.02)ord.forEach(function(n,m){if(m){var e=Z[pe[n]];if(e.k==='run'&&!out.cur[e.id])out.live[e.id]=1}});
    });
    if(S.mains)M.runs.forEach(function(r){var n=find(r.a);if(n in V&&V[n]>0.02&&!out.cur[r.id])out.live[r.id]=1});
  }
  return {solve:solve};
})();
