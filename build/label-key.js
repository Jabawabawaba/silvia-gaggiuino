/* Wire labels page: "How to read a label", a key above the sheet preview. One flag from the current selection, drawn
   larger with numbered parts, a list saying what each part is, and the circuit colors that are in the selection.
   Shared by both sites (keep the two copies identical); each page passes its own words in o. */
var LabelKey=(function(){
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function badge(n,x,y,tx,ty){
    return '<path d="M'+x+','+y+' L'+tx+','+ty+'" stroke="var(--paper-muted)" stroke-width=".25"/>'+
      '<circle cx="'+x+'" cy="'+y+'" r="2.3" fill="var(--paper-ink)"/>'+
      '<text x="'+x+'" y="'+(y+1)+'" font-size="2.8" font-weight="700" text-anchor="middle" fill="var(--paper)">'+n+'</text>';
  }
  /* c: {id, tag, l1, l2}; col: the bar's color. The second half repeats the first, so the picture stops partway into it. */
  function flag(c,col,L){
    var o=['<svg viewBox="-9 -9 75 31" role="img" aria-label="A label for '+esc(c.id)+', with its parts numbered">'];
    o.push('<rect x="0" y="0" width="'+L.w+'" height="'+L.h+'" fill="none" stroke="var(--paper-ink)" stroke-width=".25"/>');
    o.push('<rect x="'+L.half+'" y="0" width="'+L.wrap+'" height="'+L.h+'" fill="var(--paper-line)" opacity=".18"/>');
    o.push('<path d="M'+L.half+',0 v'+L.h+' M'+(L.half+L.wrap)+',0 v'+L.h+'" stroke="var(--paper-line)" stroke-width=".2" stroke-dasharray="1 1"/>');
    [0,L.half+L.wrap].forEach(function(hx){
      o.push('<rect x="'+hx+'" y="0" width="1.8" height="'+L.h+'" fill="'+col+'"/>');
      o.push('<text x="'+(hx+3.4)+'" y="5.2" font-size="4.2" font-weight="700" fill="var(--paper-ink)">'+esc(c.id)+'</text>');
      o.push('<text x="'+(hx+L.half-1.2)+'" y="3.6" font-size="2" text-anchor="end" fill="var(--paper-muted)">'+esc(c.tag)+'</text>');
      o.push('<text x="'+(hx+3.4)+'" y="8.5" font-size="2.25" fill="var(--paper-ink)">'+esc(c.l1)+'</text>');
      o.push('<text x="'+(hx+3.4)+'" y="11.4" font-size="2.1" fill="var(--paper-muted)">'+esc(c.l2)+'</text>');
    });
    o.push(badge(1,7,-5.5,7,1));
    o.push(badge(2,0.9,18,0.9,13));
    o.push(badge(3,34,-5.5,34,1.6));
    o.push(badge(4,-5.5,7.7,3,7.7));
    o.push(badge(5,-5.5,13.5,3,10.8));
    o.push(badge(6,L.half+L.wrap/2,18,L.half+L.wrap/2,13));
    o.push('</svg>');
    return o.join('');
  }
  /* o: {cell, color(sys), L, sys:[present circuits in order], names:{sys:[name, meaning]}, parts:[six lines], mains:[sys], intro, extra} */
  function html(o){
    var h='<div class="sec-h"><h2>How to read a label</h2></div><p class="lkey-in">'+o.intro+'</p><div class="lkey-g">';
    h+='<div><div class="lkey-ex">'+(o.cell?flag(o.cell,o.color(o.cell.sys),o.L):'<p class="note">Pick at least one group to see an example.</p>')+'</div>';
    h+='<ol class="lkey-parts">'+o.parts.map(function(p,i){return '<li><span class="n">'+(i+1)+'</span><span>'+p+'</span></li>'}).join('')+'</ol>';
    if(o.extra)h+='<p class="note">'+o.extra+'</p>';
    h+='</div><div><h3 class="lkey-h">What the color bar means</h3><ul class="lkey-cols">';
    h+=o.sys.map(function(s){var n=o.names[s]||[s,''];return '<li><i style="background:'+o.color(s)+'"></i><span><b>'+esc(n[0])+'</b> '+n[1]+'</span></li>'}).join('');
    h+='</ul>';
    var m=o.sys.filter(function(s){return o.mains.indexOf(s)>=0});
    if(m.length)h+='<p class="note lkey-mains">'+o.mainsNote+'</p>';
    h+='<p class="note">'+o.colorNote+'</p></div></div>';
    return h;
  }
  return {html:html,flag:flag};
})();
