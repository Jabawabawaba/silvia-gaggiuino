var LabelCore=(function(){
  var PAPER={letter:{w:215.9,h:279.4,name:'US Letter'},a4:{w:210,h:297,name:'A4'}};
  var L={w:92,h:13,half:40,wrap:12,gapX:4,gapY:3,top:20,left:null,bottom:10};
  var COLOR={L:[176,58,46],H:[199,120,0],N:[47,95,179],E:[45,122,76],LV:[112,70,184],LVG:[89,97,106],S:[31,127,134],OPT:[138,109,59]};
  function ends(r){
    var parts=String(r.short).split('→');
    return [parts[0].trim(),(parts[1]||'').trim()];
  }
  function hotAt(r,i){return r.hot==='both'||(r.hot==='a'&&i===0)||(r.hot==='b'&&i===1)}
  function sheets(runs,paperKey){
    var P=PAPER[paperKey]||PAPER.letter;
    var left=(P.w-(2*L.w+L.gapX))/2;
    var rows=Math.floor((P.h-L.top-L.bottom+L.gapY)/(L.h+L.gapY));
    var pages=[],page=null;
    runs.forEach(function(r,idx){
      if(!page||page.rows.length>=rows){page={rows:[]};pages.push(page)}
      var y=L.top+page.rows.length*(L.h+L.gapY);
      var e=ends(r);
      page.rows.push({y:y,run:r,cells:[0,1].map(function(i){
        return {x:left+i*(L.w+L.gapX),y:y,end:i,here:e[i],there:e[1-i],hot:hotAt(r,i)};
      })});
    });
    return {paper:P,left:left,rows:rows,pages:pages,L:L};
  }
  function pdfText(s){return String(s).replace(/→/g,'>').replace(/−/g,'-').replace(/[^\x20-\x7E°–]/g,'')}
  function drawPdf(jsPDF,runs,paperKey){
    var S=sheets(runs,paperKey),P=S.paper;
    var doc=new jsPDF({unit:'mm',format:paperKey==='a4'?'a4':'letter',orientation:'portrait'});
    S.pages.forEach(function(pg,pi){
      if(pi>0)doc.addPage();
      doc.setTextColor(22,25,28);
      doc.setFont('helvetica','bold');doc.setFontSize(9);
      doc.text('Silvia wire labels',S.left,10);
      doc.setFont('helvetica','normal');doc.setFontSize(7.5);
      doc.text('Sheet '+(pi+1)+' of '+S.pages.length+'  |  Print at 100% (actual size). Cut on solid lines, fold on dashed lines around the wire, text outward.',S.left,14);
      // 50 mm scale check
      var bx=P.w-S.left-50;
      doc.setDrawColor(22,25,28);doc.setLineWidth(0.4);doc.line(bx,8,bx+50,8);doc.line(bx,6.8,bx,9.2);doc.line(bx+50,6.8,bx+50,9.2);
      doc.setFontSize(6.5);doc.text('This bar should measure 50 mm',bx,11.5);
      pg.rows.forEach(function(row){
        row.cells.forEach(function(c){
          var r=row.run,col=COLOR[r.sys]||COLOR.LVG;
          if(c.hot){
            doc.setDrawColor(160,166,172);doc.setLineWidth(0.2);doc.setLineDashPattern([0.6,0.9],0);
            doc.rect(c.x,c.y,L.w,L.h);doc.setLineDashPattern([],0);
            doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(90,96,104);
            doc.text(r.id+'  at '+pdfText(c.here),c.x+3,c.y+5.4);
            doc.setFont('helvetica','normal');doc.setFontSize(6.5);
            doc.text('Boiler end: no paper label. Write '+r.id+' on the jacket with an oil-based marker.',c.x+3,c.y+9.6);
            doc.setTextColor(22,25,28);
            return;
          }
          doc.setDrawColor(22,25,28);doc.setLineWidth(0.25);doc.rect(c.x,c.y,L.w,L.h);
          doc.setDrawColor(150,150,150);doc.setLineWidth(0.2);doc.setLineDashPattern([1,1],0);
          doc.line(c.x+L.half,c.y,c.x+L.half,c.y+L.h);doc.line(c.x+L.half+L.wrap,c.y,c.x+L.half+L.wrap,c.y+L.h);
          doc.setLineDashPattern([],0);
          [c.x,c.x+L.half+L.wrap].forEach(function(hx){
            doc.setFillColor(col[0],col[1],col[2]);doc.rect(hx,c.y,1.8,L.h,'F');
            doc.setTextColor(22,25,28);
            doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(r.id,hx+3.4,c.y+5.2);
            doc.setFont('helvetica','normal');doc.setFontSize(5.6);doc.setTextColor(90,96,104);
            doc.text(pdfText(r.gauge),hx+L.half-1.2,c.y+3.6,{align:'right'});
            doc.setTextColor(22,25,28);doc.setFontSize(6.4);
            doc.text('this end: '+pdfText(c.here),hx+3.4,c.y+8.5,{maxWidth:L.half-4.6});
            doc.setTextColor(90,96,104);doc.setFontSize(6);
            doc.text('to: '+pdfText(c.there),hx+3.4,c.y+11.4,{maxWidth:L.half-4.6});
          });
        });
      });
    });
    return doc;
  }
  return {PAPER:PAPER,L:L,COLOR:COLOR,sheets:sheets,drawPdf:drawPdf,ends:ends};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=LabelCore;
