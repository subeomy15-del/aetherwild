import * as T from '../vendor/three.module.js';
import {heightAt,riverZ,WATER,clamp,smooth} from './data.js';

const TAU=Math.PI*2, UP=new T.Vector3(0,1,0), work=new T.Object3D();
function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const routes=[[[0,112],[-5,88],[-28,66],[-28,54]],[[-28,29],[-16,4],[-15,-28],[0,-73],[0,-92]],[[-28,61],[-67,58],[-87,24],[-99,1]],[[-16,-20],[32,-25],[73,-44]],[[1,85],[39,72],[83,45]]];
export function pathDistance(x,z){let d=1000;for(const line of routes)for(let j=1;j<line.length;j++){const a=line[j-1],b=line[j],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;}
function hash(x,z){return Math.sin(x*127.1+z*311.7)*43758.5453%1;}
function organicGeo(radius=1,detail=2,seed=0,faceted=true){
 const g=new T.IcosahedronGeometry(radius,detail),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=1+.13*Math.sin(x*5.1+seed)*Math.cos(z*4.3-y*2.4)+.07*Math.sin(y*7.3+seed*2);p.setXYZ(i,x*f,y*f,z*f);}
 g.computeVertexNormals();return g;
}
export function addArtGeometry(w){
 w.geos.canopy=organicGeo(1,2,31);w.geos.rock=organicGeo(1,1,9);w.geos.branch=new T.CylinderGeometry(.65,1,1,7,3);w.geos.crystal=new T.CylinderGeometry(.04,1,1,5,1);
 const leaf=new T.BufferGeometry();leaf.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.28,.3,.12,0,.85,.2,.28,.3,.12,0,.37,.25],3));leaf.setIndex([0,1,4,1,2,4,2,3,4,3,0,4]);leaf.computeVertexNormals();w.geos.leaf=leaf;
}
function between(w,kind,color,a,b,r){const d=new T.Vector3().subVectors(b,a),p=new T.Vector3().addVectors(a,b).multiplyScalar(.5),q=new T.Quaternion().setFromUnitVectors(UP,d.clone().normalize()),e=new T.Euler().setFromQuaternion(q);w.add(kind,color,p.x,p.y,p.z,r,d.length(),r,e.x,e.y,e.z);}

export function buildSky(w){
 const sky=new T.Mesh(new T.SphereGeometry(950,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#4785ad')},bottom:{value:new T.Color('#d3dfd9')}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top,bottom;varying vec3 v;void main(){vec3 d=normalize(v);float h=smoothstep(-.09,.8,d.y);vec3 c=mix(bottom,top,pow(h,.72));float haze=pow(max(0.,1.-abs(d.y)*3.),7.);c+=vec3(.10,.055,.01)*haze;gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}'}));w.skyDome=sky;w.scene.add(sky);
 const sun=new T.Mesh(new T.CircleGeometry(13,48),new T.MeshBasicMaterial({color:0xffefd0,fog:false}));sun.position.set(-360,330,-550);sun.lookAt(0,0,0);w.sunDisc=sun;w.scene.add(sun);
 const rand=rng(18);
 // Three authored ridgelines: irregular extruded silhouettes, not repeated cones.
 for(let layer=0;layer<3;layer++){
  const count=64,rad=340+layer*120,verts=[],ids=[],color=[0x6f8f98,0x85a0a4,0xa5b9b5][layer];
  for(let i=0;i<=count;i++){const a=i/count*TAU,x=Math.cos(a)*rad,z=Math.sin(a)*rad;const peak=44+layer*12+Math.pow(rand(),2)*95+Math.sin(a*7)*18;verts.push(x,-15,z,x,peak,z);if(i<count){const k=i*2;ids.push(k,k+1,k+2,k+1,k+3,k+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(ids);geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:1,flatShading:true,side:T.DoubleSide}));w.root.add(m);
 }
 w.clouds=new T.Group();w.scene.add(w.clouds);
 const cloudMat=new T.MeshBasicMaterial({color:0xf7f4e6,transparent:true,opacity:.64,depthWrite:false});
 for(let i=0;i<18;i++){const g=new T.Group();g.position.set(rand()*1000-500,115+rand()*110,rand()*1000-500);const n=4+Math.floor(rand()*5);for(let j=0;j<n;j++){const m=new T.Mesh(w.geos.canopy,cloudMat);m.position.set(j*13,Math.sin(j)*3,rand()*8);m.scale.set(18+rand()*11,3+rand()*3,8+rand()*6);g.add(m);}w.clouds.add(g);}
 for(const [x,y,z,s]of [[-126,113,-245,1.25],[135,142,-280,.75],[-240,163,15,.65],[204,108,100,.5]])floatingMesa(w,x,y,z,s,rand);
}
function floatingMesa(w,x,y,z,s,rand){
 const count=14,levels=[[-26,.13],[-15,.5],[-7,.85],[0,1],[3,.89]],verts=[],indices=[],colors=[];
 for(let j=0;j<levels.length;j++)for(let i=0;i<count;i++){const a=i/count*TAU,r=(22+Math.sin(i*2.8)*3+rand()*3)*levels[j][1]*s;verts.push(x+Math.cos(a)*r,y+levels[j][0]*s+(j===3?rand():rand()*3),z+Math.sin(a)*r*.78);const c=new T.Color(j>=3?0x668e5c:j%2?0x839b92:0x617e7b);colors.push(c.r,c.g,c.b);}
 for(let j=0;j<levels.length-1;j++)for(let i=0;i<count;i++){const a=j*count+i,b=j*count+(i+1)%count,c=a+count,d=b+count;indices.push(a,b,c,b,d,c);}const center=verts.length/3;verts.push(x,y+3*s,z);colors.push(.17,.29,.14);for(let i=0;i<count;i++)indices.push(center,(levels.length-1)*count+i,(levels.length-1)*count+(i+1)%count);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();w.root.add(new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,side:T.DoubleSide})));
 for(const dx of [-10,-4,4,10]){w.add('cylinder',0xd9d7bf,x+dx*s,y+10*s,z,1.05*s,15*s,1.05*s);w.add('cylinder',0x829d8b,x+dx*s,y+15*s,z,1.4*s,.5*s,1.4*s);}w.add('ring',0xd3d8bd,x,y+22*s,z,11*s,11*s,11*s,0,0,.21);
 const mat=new T.MeshBasicMaterial({color:0xbedfd8,transparent:true,opacity:.33,side:T.DoubleSide,depthWrite:false});const fall=new T.Mesh(new T.CylinderGeometry(.38*s,.65*s,83*s,6,1,true),mat);fall.position.set(x+8*s,y-41*s,z+15*s);w.root.add(fall);
}
export function buildTerrain(w){
 const geo=new T.PlaneGeometry(420,420,250,250);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,colors=[];
 const low=new T.Color(0x54834c),high=new T.Color(0x89a65e),path=new T.Color(0xb3a27c),mud=new T.Color(0x617b63),stone=new T.Color(0x879487);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=heightAt(x,z);p.setY(i,h);const n=.5+.23*Math.sin(x*.053+z*.071)+.13*Math.sin(x*.31-z*.21);const c=low.clone().lerp(high,clamp(n,0,1));const d=pathDistance(x,z);c.lerp(path,(1-smooth(1,3.8,d))*.86);if(h<4.8)c.lerp(mud,1-smooth(3,5,h));const slope=Math.hypot(heightAt(x+1,z)-h,heightAt(x,z+1)-h);if(slope>.65)c.lerp(stone,smooth(.65,1.7,slope)*.8);if(h>28)c.lerp(stone,smooth(28,42,h)*.6);colors.push(c.r,c.g,c.b);}
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.98});
 mat.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 vTerrain;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTerrain=position;');shader.fragmentShader='varying vec3 vTerrain;\nfloat terrainNoise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat n=terrainNoise(floor(vTerrain.xz*3.));float f=sin(vTerrain.x*1.4+sin(vTerrain.z*.7))*sin(vTerrain.z*1.2);diffuseColor.rgb*=.93+n*.09+f*.025;');};
 const m=new T.Mesh(geo,mat);m.receiveShadow=true;w.root.add(m);
 // Distant and peripheral cliff walls have deliberate layered, broken profiles.
 const rand=rng(101);for(let i=0;i<38;i++){
  const a=i/38*TAU,r=186+rand()*17,x=Math.cos(a)*r,z=Math.sin(a)*r,h=heightAt(x,z),s=9+rand()*9;
  for(let j=0;j<3;j++)w.add('rock',j%2?0x8d9c8e:0x748b7d,x+(rand()-.5)*4,h+j*s*.45,z+(rand()-.5)*4,s*(1-j*.12),s*.6,s*.8,rand()*.2,rand()*TAU,rand()*.2);
  w.add('canopy',0x688253,x,h+s*1.2,z,s*.8,1.4,s*.62);
 }
}
export function buildWater(w){
 w.waterMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0},color:{value:new T.Color(0x287e83)}},vertexShader:'varying vec3 vWorld;varying vec3 vNormal;uniform float time;void main(){vec3 p=position;p.y+=sin(p.x*.31+p.z*.22+time*.6)*.045+sin(p.z*.7-time*.8)*.018;vWorld=(modelMatrix*vec4(p,1.)).xyz;vNormal=vec3(0.,1.,0.);gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}',fragmentShader:'uniform float time;uniform vec3 color;varying vec3 vWorld;varying vec3 vNormal;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=vWorld.xz;float a=sin(p.x*.44+p.y*.19+time*.72);float b=sin(p.y*.73-p.x*.12-time*.55);float wave=a*b;vec3 view=normalize(cameraPosition-vWorld);float fres=pow(1.-max(0.,dot(view,vNormal)),3.);vec3 c=mix(color,vec3(.43,.66,.68),fres*.75);float glint=pow(max(0.,wave),28.);c+=glint*vec3(.48,.58,.45);float line=smoothstep(.962,.998,sin(p.x*.41+p.y*.22+sin(p.y*.19+time)*.5-time*.55));c+=line*.045;gl_FragColor=vec4(c,.91);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}'});
 const verts=[],ids=[];for(let i=0;i<=180;i++){const x=-205+i*410/180,z=riverZ(x);verts.push(x,WATER,z-8.8,x,WATER,z+8.8);if(i<180){let a=i*2;ids.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(ids);g.computeVertexNormals();w.root.add(new T.Mesh(g,w.waterMat));
 const lake=new T.CircleGeometry(1,80);lake.rotateX(-Math.PI/2);const lp=lake.attributes.position;for(let i=0;i<lp.count;i++)lp.setXYZ(i,68+lp.getX(i)*44,WATER,35+lp.getZ(i)*41);w.root.add(new T.Mesh(lake,w.waterMat));
 const foamMat=new T.MeshBasicMaterial({color:0xc9ded2,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide});
 for(const side of [-1,1]){const p=[],idx=[];for(let i=0;i<=180;i++){const x=-205+i*410/180,z=riverZ(x)+side*8.65,wave=Math.sin(x*.6)*.12;p.push(x,WATER+.06,z+wave,x,WATER+.06,z+side*(.15+.1*Math.sin(x*.45))+wave);if(i<180){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(idx);w.root.add(new T.Mesh(geo,foamMat));}
 const foamRing=new T.Mesh(new T.RingGeometry(.98,1,80),foamMat);foamRing.rotation.x=-Math.PI/2;foamRing.position.set(68,WATER+.06,35);foamRing.scale.set(44,41,1);w.root.add(foamRing);
}
export function buildVegetation(w){
 const rand=rng(412),pal=[0x4b7447,0x62824c,0x8a9854,0x769457,0x39786b];
 for(let i=0;i<280;i++){
  const x=rand()*340-170,z=rand()*335-166,h=heightAt(x,z),pd=pathDistance(x,z);
  if(h<4||Math.hypot(x,z-99)<22||Math.hypot(x,z+103)<31||pd<5||Math.hypot(x+16,z+16)<15)continue;
  const s=.68+rand()*.72,lean=(rand()-.5)*1.3,base=new T.Vector3(x,h,z),fork=new T.Vector3(x+lean,h+5*s,z+.35);
  between(w,'branch',0x6b6950,base,fork,.43*s);w.colliders.push({x,z,r:.5*s,top:h+8*s});
  for(let j=0;j<4;j++){const a=j/4*TAU+rand(),reach=(2+rand())*s,b=new T.Vector3(x+Math.cos(a)*reach,h+(6.3+rand()*1.6)*s,z+Math.sin(a)*reach);between(w,'branch',0x6d6e51,fork,b,.19*s);const c=pal[(i+j)%pal.length];w.add('canopy',c,b.x,b.y+.5*s,b.z,2.7*s,1.4*s,2.6*s,rand()*.18,rand()*TAU,rand()*.1);w.add('canopy',pal[(i+j+1)%pal.length],b.x+.6*s,b.y+1.35*s,b.z-.4*s,2*s,1.2*s,1.9*s,rand()*.2,rand()*TAU);}
  for(let j=0;j<3;j++){const a=j/3*TAU;between(w,'branch',0x687052,new T.Vector3(x+Math.cos(a)*.8*s,h+.1,z+Math.sin(a)*.8*s),new T.Vector3(x,h+.8*s,z),.17*s);}
 }
 // A field of curved blades; the shader bends tips, leaving roots fixed to terrain.
 const blade=new T.BufferGeometry();blade.setAttribute('position',new T.Float32BufferAttribute([-.05,0,0,.05,0,0,-.033,.42,.04,.033,.42,.04,-.012,.78,.15,.012,.78,.15,0,1.03,.26],3));blade.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);blade.computeVertexNormals();
 const grassMat=new T.MeshStandardMaterial({color:0xffffff,side:T.DoubleSide,roughness:1});const time={value:0};w.grassTime=time;
 grassMat.onBeforeCompile=shader=>{shader.uniforms.uWindTime=time;shader.vertexShader='uniform float uWindTime;varying float vBladeHeight;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBladeHeight=position.y;vec3 root=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;float gust=sin(root.x*.13+root.z*.09+uWindTime*1.5)*.14+sin(root.z*.38-uWindTime*2.1)*.05;transformed.x+=gust*pow(position.y,2.);transformed.z+=gust*.4*pow(position.y,2.);');shader.fragmentShader='varying float vBladeHeight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(vec3(.67,.79,.62),vec3(1.12,1.08,.88),vBladeHeight);');};
 const instances=[];for(let i=0;i<75000;i++){const near=i>=51000,x=near?rand()*84-42:rand()*328-164,z=near?rand()*65+70:rand()*320-157,h=heightAt(x,z),pd=pathDistance(x,z);if(h<3.7||pd<1.8||Math.hypot(x,z+105)<20||Math.hypot(x+8,z-96)<10||Math.hypot(x+28,z-45)<8||rand()<.15+Math.sin(x*.17+z*.11)*.14)continue;const s=.28+rand()*.45;instances.push({x,y:h-.025,z,s,rot:rand()*TAU,c:new T.Color(pal[Math.floor(rand()*pal.length)]).lerp(new T.Color(0xb7b779),rand()*.3)});}
 const grass=new T.InstancedMesh(blade,grassMat,instances.length);instances.forEach((b,i)=>{work.position.set(b.x,b.y,b.z);work.rotation.set(0,b.rot,0);work.scale.set(b.s*(.8+rand()),b.s,b.s);work.updateMatrix();grass.setMatrixAt(i,work.matrix);grass.setColorAt(i,b.c);});grass.receiveShadow=true;grass.castShadow=false;grass.computeBoundingSphere();w.root.add(grass);w.grassMesh=grass;
 // Fern clumps, clusters of flowers, mineral shore plants and stones.
 for(let i=0;i<400;i++){const x=rand()*300-150,z=rand()*290-145,h=heightAt(x,z);if(h<4||pathDistance(x,z)<3||Math.hypot(x,z+105)<21||Math.hypot(x,z-99)<15)continue;const s=.35+rand()*.6;for(let j=0;j<5;j++){const a=j/5*TAU+rand()*.4;w.add('leaf',0x689355,x,h,z,s,.8*s,s,Math.sin(a)*.8,a,Math.cos(a)*.8);}if(i%4===0){w.add('branch',0x719158,x,h+.45*s,z,.035,.9*s,.035);for(let j=0;j<4;j++)w.add('leaf',i%8?0xe0c58c:0xd9b3a1,x,h+.8*s,z,.18*s,.24*s,.18*s,.8,j/4*TAU);}}
 for(let i=0;i<360;i++){const x=rand()*320-160,z=riverZ(x)+(rand()>.5?1:-1)*(10+rand()*4),h=heightAt(x,z);if(h<2.4||h>5.8||Math.abs(x+28)<8)continue;const a=rand()*TAU,s=.75+rand()*.65;w.add('branch',0x78915c,x,h+.65*s,z,.024,1.3*s,.024,.12*Math.sin(a),a,.12*Math.cos(a));w.add('canopy',0xa69c67,x+.1,h+1.35*s,z,.09,.22,.09);}
 for(let i=0;i<230;i++){const x=rand()*330-165,z=rand()*325-162,h=heightAt(x,z);if(h<4||pathDistance(x,z)<2.4||Math.hypot(x,z-99)<16||Math.hypot(x,z+104)<23)continue;const s=.3+rand()*1.3;w.add('rock',i%3?0x879381:0x9ba48f,x,h+s*.18,z,s,s*.45,s*.8,rand()*.4,rand()*TAU,rand()*.2);if(s>1)w.add('canopy',0x65824e,x,h+s*.47,z,s*.75,.12,s*.6);}
}
export function buildLandmarks(w){
 const rand=rng(67);w.windmills=[];
 for(const[wx,wz]of [[31,101],[-58,-59],[91,74]]){
  const h=heightAt(wx,wz);w.pillar(wx,wz,11,h,.7);const g=new T.Group();g.position.set(wx,h+10,wz);
  for(let i=0;i<4;i++){const a=i/4*TAU;const arm=w.mesh('box',0x776b4f,g,Math.sin(a)*3.1,Math.cos(a)*3.1,0,.18,6.2,.18);arm.rotation.z=-a;const sail=w.mesh('box',i%2?0xc6c5a7:0xa8c1ad,g,Math.sin(a)*4,Math.cos(a)*4,.1,1.45,3.4,.08);sail.rotation.z=-a+.14;}w.mesh('sphere',0xa3784c,g,0,0,.3,.55,.55,.45);w.root.add(g);w.windmills.push(g);
 }
 for(let i=0;i<10;i++){const g=new T.Group();g.position.set(rand()*270-135,58+rand()*16,-35-rand()*145);for(const s of [-1,1]){const m=w.mesh('leaf',0x4b6465,g,s*.5,0,0,.7,.7,.7);m.rotation.z=s*-Math.PI/2;m.rotation.x=Math.PI/2;}w.root.add(g);w.anim.push({type:'bird',group:g,seed:rand()*20});}
 // Ceramic route stones give the approach a rhythm and preserve an open sightline.
 for(const[x,z]of [[-3,82],[-18,70],[-24,17],[-12,-42],[8,-63]]){const h=heightAt(x,z);w.add('rock',0xb3b9a0,x,h+.9,z,.65,1.1,.45,0,.4);w.add('ring',0x739e8c,x,h+1.45,z,.22,.22,.22,0,0,.1);}
}
export function decorateCamp(w){
 const rand=rng(80),h=10;
 // A worked-in camp: stacked cargo, field instruments, cloth, lanterns, bedrolls and ropes.
 for(const[x,z]of [[-17,97],[-18,100],[-14,102]]){w.add('box',0x977e55,x,h+.5,z,1.5,1,1.1,0,rand()*.3);for(const dx of [-.55,.55])w.add('box',0x6d8772,x+dx,h+.55,z,.11,1.1,1.16);w.add('box',0x7a8d73,x,h+1.08,z,1.6,.14,1.2);}
 for(let i=0;i<3;i++){w.add('cylinder',0x6f8b7d,-12+i*2.2,h+.3,93,.4,2,.4,0,0,Math.PI/2);w.add('box',0xc5ba97,-12+i*2.2,h+.11,94.8,1.6,.15,2.2);}
 w.add('box',0x8d7957,-6,h+1,92,2.5,.15,1.6);for(const x of [-7,-5])for(const z of [91.5,92.5])w.add('branch',0x807052,x,h+.45,z,.08,1,.08);
 w.add('box',0xe0d6b4,-6,h+1.12,92,1.7,.03,1);for(let i=0;i<6;i++)w.add('box',0x6e9487,-6+(rand()-.5),h+1.15,92+(rand()-.5)*.6,.5,.02,.025,0,rand()*TAU);
 for(const[x,z]of [[-16,89],[7,94],[-4,107]]){const y=heightAt(x,z);w.add('branch',0x7f7258,x,y+1.6,z,.055,3.2,.055);w.add('box',0x8e9976,x,y+2.6,z,.5,.65,.5);w.add('box',0xf1cf8b,x,y+2.6,z+.26,.3,.4,.02);w.add('box',0x7c8e73,x,y+3,z,.6,.1,.6);}
 for(let i=0;i<5;i++){const x=17+i*.52,z=105+Math.sin(i)*.3;w.add('branch',0x7c7855,x,h+.35,z,.18,2.7,.18,Math.PI/2,.1);}
 // Canvas seams and tension ropes make the roof read as textile rather than a giant polygon.
 for(let i=0;i<7;i++){const z=88.3+i*1.9;between(w,'branch',0xaaa382,new T.Vector3(-18.5,14,z),new T.Vector3(-12,16,z),.018);between(w,'branch',0xaaa382,new T.Vector3(-12,16,z),new T.Vector3(-5.5,14,z),.018);}
 for(const[x,z]of [[-18,89],[-6,89],[-18,99],[-6,99]])between(w,'branch',0xa9a17f,new T.Vector3(x,14.3,z),new T.Vector3(x+(x<-12?-2:2),10,z+(z<94?-2:2)),.02);
 const smokeGeo=new T.BufferGeometry(),positions=[];for(let i=0;i<14;i++)positions.push(4+rand()*.35,11+rand()*4,104+rand()*.35);smokeGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));const smoke=new T.Points(smokeGeo,new T.PointsMaterial({color:0xc9c4ae,size:.45,transparent:true,opacity:.17,depthWrite:false}));w.root.add(smoke);w.smoke=smoke;
}
export function decorateIntake(w){
 // Broken rings, conduit channels and patterned floors create a distinct authored mechanism.
 for(let layer=0;layer<3;layer++)for(let i=0;i<14;i++){if(i===2||i===3||layer===2&&i%5===0)continue;const a=i/14*TAU,r=16.7+layer*.75;w.add('box',layer%2?0xa4b49a:0xc2cbb0,Math.cos(a)*r,19.5+layer*.44,-105+Math.sin(a)*r,3.5,.45,1.15,0,-a-Math.PI/2);}
 for(let i=0;i<32;i++){const a=i/32*TAU,r=12.5;w.add('box',0x7e9c8d,Math.cos(a)*r,19.42,-105+Math.sin(a)*r,1.45,.1,.24,0,-a);}
 for(const x of [-11.5,11.5])for(let j=0;j<7;j++){w.add('box',0x557d71,x,20+j*1.4,-108,.3,.9,.35);w.add('box',0xc4bd91,x,20.4+j*1.4,-108,.4,.12,.45);}
 for(const[x,z]of [[-17,-112],[18,-114],[-19,-101]]){const h=heightAt(x,z);w.add('rock',0xb7bea1,x,h+.5,z,2.5,.8,1.6,0,x*.2);w.add('canopy',0x658857,x,h+1.1,z,1.8,.3,1.1);}
 for(let i=0;i<10;i++){const z=-92-i*2;w.add('box',0x9eaf98,-7,19.38,z,.16,.08,1.5);w.add('box',0x9eaf98,7,19.38,z,.16,.08,1.5);}
}
export function decorateRuins(w){
 const rand=rng(903);for(let i=0;i<24;i++){const a=i/24*TAU,x=-16+Math.cos(a)*(11+rand()*4),z=-16+Math.sin(a)*(13+rand()*4);if(pathDistance(x,z)<2.8)continue;const h=heightAt(x,z),s=.5+rand();w.add('box',0xabb697,x,h+.3,z,s*2,.4+rand(),s,rand()*.25,rand()*TAU,rand()*.25);if(i%3===0)w.add('canopy',0x68844c,x,h+.7,z,s,.16,s*.7);}
 for(let i=0;i<4;i++){const x=-28+i*.5,z=-29,h=heightAt(x,z);w.add('leaf',0x658449,x,h+2.2,z,.5,2.8,.5,0,i*.9);}
}
export function updateEnvironment(w,dt){if(w.grassTime)w.grassTime.value=w.time;if(w.smoke){const p=w.smoke.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)+dt*.45;if(y>15)y=10.6;p.setXYZ(i,4+Math.sin(w.time*.7+i)*.3+(y-11)*.13,y,104+Math.cos(w.time*.4+i)*.25);}p.needsUpdate=true;}}
