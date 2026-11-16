  /* The low-voltage cables (J7, J9, and J5 on the Silvia), drawn in the style of the official HV wire guide from the
     page's own run data. LVG.html(runs, opts) groups the runs that land on a PCB socket by that socket, and hangs any
     jumper that shares an end with one of them (a ground chain, say) off that end. Identical on both sites. */
  var LVG=(function(){
    function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    var COL={purple:'#B62BD6',magenta:'#D42AD4',blue:'#2F5BEA',orange:'#EE7A12',red:'#E0362C',yellow:'#E3B800',green:'#2E9D4E',white:'#FFFFFF',grey:'#8A8F96',gray:'#8A8F96',brown:'#8A5A2B'};
    var JT={J5:'Hot water switch',J7:'Switches',J9:'SSR control'};
    function isLV(r){return /22 AWG/i.test((r.wire||'')+' '+(r.gauge||''))}
    function jOf(s){var m=/\bJ(\d+)\s+(\S+)/.exec(String(s||''));return m?{j:'J'+m[1],pin:m[2]}:null}
    function key(r,i){var t=r.term&&r.term[i];return String(t||(i?r.to:r.frm)||'').toLowerCase().trim()}
    function wrap(s,n){var w=String(s).split(/\s+/),out=[],cur='';w.forEach(function(x){if(cur&&(cur+' '+x).length>n){out.push(cur);cur=x}else cur=cur?cur+' '+x:x});if(cur)out.push(cur);return out.slice(0,3)}
    function conn(e){
      e=String(e||'');
      if(/JST/i.test(e))return 'JST-PH 2 mm';
      if(/fork/i.test(e))return 'Fork terminal';
      if(/shared spade|butt splice/i.test(e))return 'Shared spade or butt splice';
      if(/two wires/i.test(e))return 'Female 6.3 mm, two wires';
      if(/6\.3 mm/i.test(e))return 'Female 6.3 mm';
      return e;
    }
    function nice(s){return String(s||'').replace(/^PCB\s+/,'').replace(/\s*\((control)\)/,' $1')}
    function lenOf(r){return r.mm?r.mm+' mm':(r.lenNote?String(r.lenNote).replace(/^Short jumper; /,'').replace(/^Measure$/,'measure to fit'):'measure to fit')}
    function stroke(r){
      var c=String(r.color||'').toLowerCase();
      if(c==='black'||!COL[c])return {s:'var(--ink)',w:false};
      return {s:COL[c],w:c==='white'};
    }
    function groups(runs){
      var lv=runs.filter(isLV),G={},order=[],placed={};
      lv.forEach(function(r){
        var a=jOf(r.frm),b=a?null:jOf(r.to),j=a||b;if(!j)return;
        if(!G[j.j]){G[j.j]={j:j.j,rows:[]};order.push(j.j)}
        G[j.j].rows.push({r:r,pin:j.pin,pcbEnd:a?0:1,kind:'pcb'});placed[r.id]=G[j.j];
      });
      /* jumpers: a run with no socket that shares an end with a placed run; it hangs off that end, the chain goes on */
      var grow=true;
      while(grow){
        grow=false;
        lv.forEach(function(r){
          if(placed[r.id]||jOf(r.frm)||jOf(r.to))return;
          for(var gi=0;gi<order.length;gi++){
            var g=G[order[gi]];
            for(var k=0;k<g.rows.length;k++){
              var q=g.rows[k],qfree=q.kind==='pcb'?1-q.pcbEnd:q.free,qk=key(q.r,qfree);
              for(var i=0;i<2;i++)if(key(r,i)===qk){g.rows.push({r:r,kind:'jump',from:k,shared:i,free:1-i});placed[r.id]=g;grow=true;return}
            }
          }
        });
      }
      var PR=['J7','J5','J9'];order.sort(function(a,b){var x=PR.indexOf(a),y=PR.indexOf(b);return (x<0?9:x)-(y<0?9:y)});
      return order.map(function(j){return G[j]});
    }
    function glyph(x,y,end,side,col){
      var e=String(end||''),d=side==='R'?1:-1;
      if(/fork/i.test(e))return '<path d="M'+x+','+(y-7)+'h'+(d*16)+'M'+x+','+(y+7)+'h'+(d*16)+'M'+x+','+(y-7)+'v14" class="lvg-fk"/>';
      var two=/two wires|shared spade/i.test(e),h=two?20:14,w=two?26:22;
      return '<rect x="'+(side==='R'?x+6:x-6-w)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="2" class="lvg-sp"/><rect x="'+(side==='R'?x:x-6)+'" y="'+(y-3)+'" width="6" height="6" class="lvg-sp"/>';
    }
    function txt(x,y,s,cls,anchor){return '<text x="'+x+'" y="'+y+'" class="'+cls+'"'+(anchor?' text-anchor="'+anchor+'"':'')+'>'+esc(s)+'</text>'}
    function block(g){
      var W=760,PX=180,PW=24,LX=236,RX=530,TX=580,RH=74,top=48,rows=g.rows,pos=[],s='';
      /* rows: socket pins first, in order, then jumpers below */
      rows.forEach(function(row,i){pos[i]={y:top+i*RH+18}});
      var pins=rows.filter(function(r){return r.kind==='pcb'}),pinY=pins.map(function(r){return pos[rows.indexOf(r)].y});
      s+=txt(12,24,g.j+(JT[g.j]?' · '+JT[g.j]:''),'lvg-h');
      var sideOf=[],ends={};
      rows.forEach(function(row,i){
        var r=row.r,y=pos[i].y,c=stroke(r),line=function(d){return (c.w?'<path d="'+d+'" class="lvg-wo"/><path d="'+d+'" class="lvg-wi"/>':'<path d="'+d+'" class="lvg-w" style="stroke:'+c.s+'"/>')};
        if(row.kind==='pcb'){
          var far=1-row.pcbEnd;sideOf[i]='R';
          s+=line('M'+(PX+PW)+','+y+'H'+RX);
          s+=txt(PX+PW+8,y-8,row.pin,'lvg-pin');
          s+=txt((PX+PW+RX)/2+20,y-8,lenOf(r),'lvg-len','middle');
          ends[i]={side:'R',x:RX,y:y,end:(r.ends||[])[far],txt:nice(far?r.to:r.frm),ids:[r.id]};
        }else{
          var q=ends[row.from],y0=q.y,side=q.side==='R'?'L':'R',x0=q.x,xin=q.side==='R'?x0-44:x0+44,x1=side==='R'?RX:LX;
          s+=line('M'+x0+','+(y0+4)+'L'+xin+','+y+'H'+x1);
          s+=txt((LX+RX)/2,y-8,'jumper, '+lenOf(r),'lvg-len','middle');
          q.ids.push(r.id);if(/two wires|shared/i.test(String((r.ends||[])[row.shared]))||!/two wires|shared/i.test(String(q.end)))q.end=(r.ends||[])[row.shared]||q.end;
          ends[i]={side:side,x:x1,y:y,end:(r.ends||[])[row.free],txt:nice(row.free?r.to:r.frm),ids:[r.id]};
        }
      });
      /* the plug */
      if(pinY.length){
        var y0=Math.min.apply(null,pinY)-22,y1=Math.max.apply(null,pinY)+22;
        s+='<rect x="'+PX+'" y="'+y0+'" width="'+PW+'" height="'+(y1-y0)+'" rx="3" class="lvg-plug"/>';
        pinY.forEach(function(y){s+='<circle cx="'+(PX+PW/2)+'" cy="'+y+'" r="4.5" class="lvg-dot"/>'});
        var my=(y0+y1)/2;s+=txt(PX-12,my-8,'PCB '+g.j,'lvg-t','end')+txt(PX-12,my+10,'JST-PH 2 mm','lvg-s','end');
      }
      /* each free end: its connector, the IDs that share it and where it goes */
      Object.keys(ends).forEach(function(i){
        var e=ends[i],R=e.side==='R',ax=R?TX:LX-48,an=R?null:'end',lines=wrap(e.txt,R?24:18);
        s+=glyph(e.x,e.y,e.end,e.side);
        s+=txt(R?e.x+16:e.x-17,e.y-19,e.ids.join(' + '),'lvg-id','middle');
        lines.forEach(function(l,k){s+=txt(ax,e.y-4+k*16-(lines.length>2?6:0),l,'lvg-t',an)});
        s+=txt(ax,e.y-4+lines.length*16-(lines.length>2?6:0),conn(e.end),'lvg-s',an);
      });
      var H=top+rows.length*RH+8;
      return '<svg class="lvg-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(g.j+': '+rows.map(function(r){return r.r.id+', '+nice(r.r.frm)+' to '+nice(r.r.to)}).join('; '))+'">'+s+'</svg>';
    }
    function html(runs,o){
      o=o||{};var gs=groups(runs||[]);if(!gs.length)return '';
      return '<figure class="lvg"><div class="lvg-head"><b>Low-voltage cables</b><span>All wire: 22 AWG silicone</span></div>'+gs.map(function(g){return '<div class="lvg-scroll">'+block(g)+'</div>'}).join('')+
        '<figcaption class="fine">'+(o.cap||'')+'</figcaption></figure>';
    }
    return {html:html,groups:groups};
  })();
