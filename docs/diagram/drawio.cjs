const fs = require('node:fs');
const path = require('node:path');
const xml = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll('\n', '&#xa;');
const palette = { blue: ['#eaf2fc', '#5479aa'], green: ['#eaf7ef', '#568a69'], amber: ['#fff5db', '#ac893f'], purple: ['#f2edfc', '#8970b0'], gray: ['#f4f6f8', '#66788a'] };

class Diagram {
  constructor(title, width, height) { Object.assign(this, { title, width, height, nodes: [], edges: [] }); }
  node(id, text, x, y, w, h, kind = 'activity', opts = {}) {
    const n = { id, text, x, y, w, h, kind, color: 'blue', ...opts }; this.nodes.push(n); return n;
  }
  get(id) { const n = this.nodes.find(n => n.id === id); if (!n) throw Error('Unknown node: ' + id); return n; }
  port(id, side, f = .5) {
    const n = this.get(id); let x = n.x + n.w * f, y = n.y + n.h * f;
    if (side === 'left' || side === 'right') {
      x = side === 'left' ? n.x : n.x + n.w;
      if (['process', 'usecase', 'terminal'].includes(n.kind)) x = n.x + n.w/2 + (side === 'left' ? -1 : 1) * n.w/2 * Math.sqrt(1 - (2*f-1)**2);
    } else {
      y = side === 'top' ? n.y : n.y + n.h;
      if (['process', 'usecase', 'terminal'].includes(n.kind)) y = n.y + n.h/2 + (side === 'top' ? -1 : 1) * n.h/2 * Math.sqrt(1 - (2*f-1)**2);
    }
    return [x,y];
  }
  edge(source, target, text = '', opts = {}) {
    const { from = 'bottom', to = 'top', sf = .5, tf = .5, via = [], kind = 'flow', label } = opts;
    const points = [this.port(source,from,sf), ...via, this.port(target,to,tf)];
    // Reject diagonal segments in routed diagrams; UML actor associations may be straight.
    if (kind !== 'association' && points.length > 2) for(let i=1;i<points.length;i++) {
      if (Math.abs(points[i][0]-points[i-1][0]) > .01 && Math.abs(points[i][1]-points[i-1][1]) > .01) throw Error('Diagonal route: '+source+' -> '+target);
    }
    this.edges.push({ source, target, text, kind, points, label, backing: opts.backing !== false });
  }
  lane(id, title, x, y, w, h, color) { return this.node(id,title,x,y,w,h,'lane',{color}); }
  mid(points) {
    const lens=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
    let remaining=lens.reduce((a,b)=>a+b,0)/2;
    for(let i=0;i<lens.length;i++){if(remaining<=lens[i]){const t=lens[i] ? remaining/lens[i] : 0;return [points[i][0]+t*(points[i+1][0]-points[i][0]),points[i][1]+t*(points[i+1][1]-points[i][1])];}remaining-=lens[i];}
    return points[0];
  }
  styles(n) {
    const [fill,stroke]=palette[n.color];
    let s=`html=0;whiteSpace=wrap;fontFamily=Arial;fontSize=${n.font||17};fontColor=#172b43;strokeColor=${stroke};fillColor=${fill};spacing=10;`;
    const shape={ activity:'rounded=1;arcSize=14;', external:'rounded=0;', process:'ellipse;', usecase:'ellipse;', decision:'rhombus;', terminal:'ellipse;', actor:'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;fillColor=none;', entity:'rounded=0;align=left;verticalAlign=top;spacing=16;', note:'text;fillColor=none;strokeColor=none;align=left;verticalAlign=top;', boundary:'rounded=0;fillColor=none;strokeColor=#7890a9;verticalAlign=top;fontSize=22;spacingTop=14;', lane:'shape=swimlane;horizontal=1;startSize=55;swimlaneFillColor=#ffffff;collapsible=0;fontStyle=1;fontSize=20;', initial:'ellipse;fillColor=#253a50;strokeColor=#253a50;', final:'shape=doubleEllipse;fillColor=#253a50;strokeColor=#253a50;', fork:'rounded=0;fillColor=#253a50;strokeColor=#253a50;' };
    return s+shape[n.kind]+(n.bold?'fontStyle=1;':'');
  }
  write(file) {
    const cells=['<mxCell id="0"/><mxCell id="1" parent="0"/>'];
    for(const n of this.nodes) {
      const p=n.parent ? this.get(n.parent) : {x:0,y:0};
      cells.push(`<mxCell id="${n.id}" value="${xml(n.text)}" style="${this.styles(n)}" vertex="1" parent="${n.parent||'1'}"><mxGeometry x="${n.x-p.x}" y="${n.y-p.y}" width="${n.w}" height="${n.h}" as="geometry"/></mxCell>`);
    }
    this.edges.forEach((e,i)=>{
      const a=this.get(e.source),b=this.get(e.target),first=e.points[0],last=e.points.at(-1);
      let marker='endArrow=block;endFill=1;';
      if(e.kind==='association') marker='endArrow=none;startArrow=none;';
      if(['include','extend'].includes(e.kind)) marker='dashed=1;dashPattern=6 4;endArrow=open;endFill=0;';
      if(e.kind==='one-many') marker='startArrow=ERmandOne;startFill=0;endArrow=ERzeroToMany;endFill=0;';
      if(e.kind==='one-optional') marker='startArrow=ERmandOne;startFill=0;endArrow=ERzeroToOne;endFill=0;';
      if(e.kind==='optional-many') marker='startArrow=ERzeroToOne;startFill=0;endArrow=ERzeroToMany;endFill=0;';
      if(e.kind==='data') marker='dashed=1;endArrow=open;endFill=0;';
      const style=`edgeStyle=none;orthogonal=1;rounded=0;html=0;strokeColor=#506b86;strokeWidth=1.6;jumpStyle=arc;jumpSize=9;${marker}exitX=${(first[0]-a.x)/a.w};exitY=${(first[1]-a.y)/a.h};exitPerimeter=0;entryX=${(last[0]-b.x)/b.w};entryY=${(last[1]-b.y)/b.h};entryPerimeter=0;fontFamily=Arial;fontSize=15;fontColor=#284461;labelBackgroundColor=${e.backing?'#ffffff':'none'};`;
      const mid=this.mid(e.points), label=e.label||[mid[0],mid[1]-15];
      const waypoints=e.points.slice(1,-1).map(p=>`<mxPoint x="${p[0]}" y="${p[1]}"/>`).join('');
      cells.push(`<mxCell id="edge_${i}" value="${xml(e.text)}" style="${style}" edge="1" parent="1" source="${e.source}" target="${e.target}"><mxGeometry x="0" y="0" relative="1" as="geometry"><Array as="points">${waypoints}</Array><mxPoint x="${label[0]-mid[0]}" y="${label[1]-mid[1]}" as="offset"/></mxGeometry></mxCell>`);
    });
    fs.writeFileSync(path.join(__dirname,file+'.drawio'),`<mxfile host="app.diagrams.net"><diagram id="${file}" name="${xml(this.title)}"><mxGraphModel grid="1" gridSize="10" page="1" pageScale="1" pageWidth="${this.width}" pageHeight="${this.height}" dx="${this.width}" dy="${this.height}"><root>${cells.join('')}</root></mxGraphModel></diagram></mxfile>`);
    fs.writeFileSync(path.join(__dirname,file+'.svg'),this.svg());
  }
  text(s,x,y,opts={}) {
    const lines=s.split('\n'),size=opts.size||17,anchor=opts.anchor||'middle';
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" fill="${opts.color||'#172b43'}"${opts.bold?' font-weight="700"':''}>${lines.map((l,i)=>`<tspan x="${x}" dy="${i ? size*1.35 : 0}">${xml(l)}</tspan>`).join('')}</text>`;
  }
  marker(point,neighbor,type) {
    const dx=point[0]-neighbor[0],dy=point[1]-neighbor[1],angle=Math.atan2(dy,dx)*180/Math.PI;
    let p='';
    if(type==='arrow') p='<path d="M-13,-6 L0,0 L-13,6 Z" fill="#506b86"/>';
    if(type==='open') p='<path d="M-13,-6 L0,0 L-13,6" fill="none"/>';
    if(type==='one') p='<path d="M-10,-9 V9 M-17,-9 V9"/>';
    if(type==='optional') p='<path d="M-9,-9 V9"/><circle cx="-23" cy="0" r="6" fill="white"/>';
    if(type==='many') p='<path d="M0,-10 L-17,0 L0,10 M-17,0 H0"/><circle cx="-27" cy="0" r="6" fill="white"/>';
    return `<g transform="translate(${point[0]},${point[1]}) rotate(${angle})" stroke="#506b86" stroke-width="1.6" fill="none">${p}</g>`;
  }
  svg() {
    let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}"><rect width="100%" height="100%" fill="white"/>`;
    // Containers first, connectors next, foreground nodes last.
    for(const n of this.nodes.filter(n=>['boundary','lane'].includes(n.kind))) {
      const [fill,stroke]=palette[n.color];
      s+=`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="white" stroke="${stroke}"/>`;
      if(n.kind==='lane') s+=`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="55" fill="${fill}" stroke="${stroke}"/>`;
      s+=this.text(n.text,n.x+n.w/2,n.y+35,{size:n.kind==='lane'?20:22,bold:true});
    }
    for(const e of this.edges) {
      s+=`<path d="${e.points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' ')}" fill="none" stroke="#506b86" stroke-width="1.6"${['include','extend','data'].includes(e.kind)?' stroke-dasharray="7 5"':''}/>`;
      if(e.kind!=='association') {
        let end=['include','extend','data'].includes(e.kind)?'open':'arrow';
        if(['one-many','optional-many'].includes(e.kind))end='many';
        if(e.kind==='one-optional')end='optional';
        s+=this.marker(e.points.at(-1),e.points.at(-2),end);
        if(['one-many','one-optional','optional-many'].includes(e.kind))s+=this.marker(e.points[0],e.points[1],e.kind==='optional-many'?'optional':'one');
      }
    }
    for(const n of this.nodes.filter(n=>!['boundary','lane'].includes(n.kind))) {
      const [fill,stroke]=palette[n.color],cx=n.x+n.w/2,cy=n.y+n.h/2;
      if(n.kind==='actor') s+=`<circle cx="${cx}" cy="${n.y+18}" r="14" fill="white" stroke="${stroke}"/><path d="M${cx},${n.y+32}v48 M${n.x},${n.y+n.h/2}h${n.w} M${cx},${n.y+80}l-27,32 M${cx},${n.y+80}l27,32" fill="none" stroke="${stroke}" stroke-width="2"/>`;
      else if(['initial','final'].includes(n.kind)) {s+=`<circle cx="${cx}" cy="${cy}" r="${n.w/2}" fill="${n.kind==='final'?'white':'#253a50'}" stroke="#253a50" stroke-width="2"/>`;if(n.kind==='final')s+=`<circle cx="${cx}" cy="${cy}" r="${n.w/2-5}" fill="#253a50"/>`;}
      else if(n.kind==='decision')s+=`<polygon points="${cx},${n.y} ${n.x+n.w},${cy} ${cx},${n.y+n.h} ${n.x},${cy}" fill="${fill}" stroke="${stroke}"/>`;
      else if(['process','usecase','terminal'].includes(n.kind))s+=`<ellipse cx="${cx}" cy="${cy}" rx="${n.w/2}" ry="${n.h/2}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
      else if(n.kind!=='note')s+=`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.kind==='activity'?10:0}" fill="${n.kind==='fork'?'#253a50':fill}" stroke="${stroke}"/>`;
      if(n.text){const left=['entity','note'].includes(n.kind),size=n.font||17;const y=n.kind==='actor'?n.y+138:left?n.y+size+15:cy-(n.text.split('\n').length-1)*size*.675+size*.35;s+=this.text(n.text,left?n.x+16:cx,y,{anchor:left?'start':'middle',size,bold:n.bold});}
    }
    // White backing keeps relationship/guard labels legible at line crossings.
    for(const e of this.edges.filter(e=>e.text)) {
      const [x,y]=e.label||this.mid(e.points).map((v,i)=>i?v-15:v),lines=e.text.split('\n'),w=Math.max(...lines.map(l=>l.length))*8+20,h=lines.length*20+8;
      if(e.backing)s+=`<rect x="${x-w/2}" y="${y-15}" width="${w}" height="${h}" rx="3" fill="white"/>`;
      s+=this.text(e.text,x,y,{size:15,color:'#284461'});
    }
    return s+'</svg>';
  }
}
module.exports={Diagram};
