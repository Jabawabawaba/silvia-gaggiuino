  /* Links into the wiring page's drawing; wiring.html reads them (applyHash there). A target is 'run:AC5' (| between
     alternatives), 'part:ssr', 'runs:AC1,AC3', 'short:J7' (every run whose name starts that way), 'layer:E', or ''
     for the whole harness; join two with ';'. o.label names a set of runs. The Silvia has one drawing, so the
     Gaggia site's path and schematic options aren't used here. */
  function mapHref(t,o){
    o=o||{};var q=[];
    if(t)t.split(';').forEach(function(x){var i=x.indexOf(':');q.push(x.slice(0,i)+'='+encodeURIComponent(x.slice(i+1)))});
    if(o.label)q.push('label='+encodeURIComponent(o.label));
    return 'wiring.html#map'+(q.length?'?'+q.join('&'):'');
  }
