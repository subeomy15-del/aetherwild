import * as T from '../vendor/three.module.js';
import {heightAt,riverZ,WATER,SOCKETS,LOCATIONS,PICKUPS,COMPONENTS,clamp,smooth} from './data.js';

const UP=new T.Vector3(0,1,0), dummy=new T.Object3D();
export function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export class World{
 constructor(scene){
  this.scene=scene;this.batch=new Map();this.anim=[];this.solids=[];this.colliders=[];this.objectMeshes=new Map();this.pickupMeshes=new Map();this.socketMeshes=[];this.ripples=[];this.interactables=[];this.time=0;
  this.geos={box:new T.BoxGeometry(1,1,1),sphere:new T.IcosahedronGeometry(1,1),lowSphere:new T.IcosahedronGeometry(1,0),cone:new T.ConeGeometry(1,1,7),cylinder:new T.CylinderGeometry(1,1,1,10),ring:new T.TorusGeometry(1,.11,7,40)};
  this.mats={};
  this.basicMaterial=new T.MeshStandardMaterial({roughness:.91,metalness:.08,flatShading:true});
  this.root=new T.Group();scene.add(this.root);
  this.makeSky();this.makeTerrain();this.makeWater();this.makeVegetation();this.makeLandmarks();this.makeCamp();this.makeCrossing();this.makeRuins();this.makeIntake();this.makeHollow();this.makeDiscoveries();this.flush();
 }
 material(color,emissive=0){const key=color+'-'+emissive;if(!this.mats[key])this.mats[key]=new T.MeshStandardMaterial({color,roughness:.8,metalness:.12,flatShading:true,emissive:color,emissiveIntensity:emissive});return this.mats[key];}
 add(kind,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
  dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();
  if(!this.batch.has(kind))this.batch.set(kind,[]);this.batch.get(kind).push({matrix:dummy.matrix.clone(),color:new T.Color(color)});
 }
 flush(){for(const[k,items]of this.batch){const mesh=new T.InstancedMesh(this.geos[k],this.basicMaterial,items.length);items.forEach((o,i)=>{mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,o.color);});mesh.castShadow=k!=='cone';mesh.receiveShadow=true;mesh.computeBoundingSphere();this.root.add(mesh);}this.batch.clear();}
 mesh(kind,color,parent,x,y,z,sx=1,sy=1,sz=1,emissive=0){const m=new T.Mesh(this.geos[kind],this.material(color,emissive));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 makeSky(){
  const sky=new T.Mesh(new T.SphereGeometry(950,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#629caa')},bottom:{value:new T.Color('#f3e4c6')}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying vec3 v;void main(){float h=clamp(normalize(v).y*.9+.08,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.65)),1.);}'}));this.scene.add(sky);
  const sun=new T.Mesh(new T.CircleGeometry(23,48),new T.MeshBasicMaterial({color:0xffedb5,fog:false}));sun.position.set(-330,240,-550);sun.lookAt(0,0,0);this.scene.add(sun);
  const rng=random(18);
  for(let i=0;i<48;i++){const a=rng()*Math.PI*2,r=290+rng()*200;const x=Math.cos(a)*r,z=Math.sin(a)*r;this.add('cone',i%2?0x899f9c:0x9baba3,x,20,z,42+rng()*55,50+rng()*100,40+rng()*55,0,rng()*7);}
  for(let i=0;i<16;i++){
   const a=rng()*Math.PI*2,r=270+rng()*380,x=Math.cos(a)*r,z=Math.sin(a)*r,y=80+rng()*140;
   this.add('lowSphere',0x829b93,x,y,z,18+rng()*22,7+rng()*7,13+rng()*18);
   this.add('cone',0x728b88,x,y-12,z,12+rng()*15,27,12+rng()*12,Math.PI,0);
   this.add('cylinder',0xb6c0a7,x,y+10,z,4,12,4);
   this.add('ring',0xb6d4bb,x,y+19,z,8,8,8,0,0,Math.PI*.13);
  }
  this.clouds=new T.Group();this.scene.add(this.clouds);
  for(let i=0;i<24;i++){const g=new T.Group();g.position.set(rng()*850-425,95+rng()*85,rng()*850-425);const mat=new T.MeshBasicMaterial({color:0xf6ebd1,transparent:true,opacity:.45,depthWrite:false});for(let j=0;j<3;j++){const m=new T.Mesh(this.geos.sphere,mat);m.position.x=j*13;m.scale.set(19,3,8);g.add(m);}this.clouds.add(g);}
 }
 makeTerrain(){
  const geo=new T.PlaneGeometry(420,420,180,180);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;const colors=[];
  const a=new T.Color(0x718b51),b=new T.Color(0xa7b270),path=new T.Color(0xc7b98b),stone=new T.Color(0xb2ae92),mud=new T.Color(0x546f61);
  const paths=[[[0,112],[-5,88],[-28,66],[-28,54]],[[-28,29],[-16,4],[-15,-28],[0,-73],[0,-92]],[[-28,61],[-67,58],[-87,24],[-99,1]],[[-16,-20],[32,-25],[73,-44]],[[1,85],[39,72],[83,45]]];
  function segmentDist(x,z,u,v){const dx=v[0]-u[0],dz=v[1]-u[1],t=clamp(((x-u[0])*dx+(z-u[1])*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-u[0]-t*dx,z-u[1]-t*dz);}
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i),h=heightAt(x,z);p.setY(i,h);
   const noise=(Math.sin(x*1.7+z*2.3)+Math.sin(x*.21-z*.14))*.12+.5;
   const c=a.clone().lerp(b,clamp(noise,0,1));let d=999;
   for(const line of paths)for(let j=1;j<line.length;j++)d=Math.min(d,segmentDist(x,z,line[j-1],line[j]));
   c.lerp(path,(1-smooth(1.2,3.9,d))*.85);if(h<4)c.lerp(mud,.65);if(h>21)c.lerp(stone,smooth(21,35,h)*.6);
   colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  const m=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));m.receiveShadow=true;this.root.add(m);
 }
 makeWater(){
  this.waterMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0},color:{value:new T.Color(0x4ea9a2)}},vertexShader:'varying vec3 v;void main(){v=position;vec3 p=position;p.y+=sin(p.x*.3+p.z*.13)*.035;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'uniform float time;uniform vec3 color;varying vec3 v;void main(){float w=sin(v.x*.65+v.z*.31+time*.7)*sin(v.z*.8-time*.6);float f=pow(max(0.,w),16.);vec3 c=color+f*.25+sin(v.x*.08+v.z*.07+time*.3)*.025;gl_FragColor=vec4(c,.84);}'});
  const verts=[],indices=[];
  for(let i=0;i<=160;i++){const x=-205+i*410/160,z=riverZ(x);verts.push(x,WATER,z-8.8,x,WATER,z+8.8);if(i<160){let a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();this.root.add(new T.Mesh(g,this.waterMat));
  const lake=new T.CircleGeometry(1,64);lake.rotateX(-Math.PI/2);const lp=lake.attributes.position;for(let i=0;i<lp.count;i++){lp.setXYZ(i,68+lp.getX(i)*44,WATER,35+lp.getZ(i)*41);}this.root.add(new T.Mesh(lake,this.waterMat));
  const foamMat=new T.MeshBasicMaterial({color:0xc7e7cb,transparent:true,opacity:.35,depthWrite:false});const rng=random(918);
  for(let i=0;i<70;i++){const x=rng()*310-155;const m=new T.Mesh(new T.PlaneGeometry(1.4+rng()*3,.14),foamMat);m.rotation.x=-Math.PI/2;m.position.set(x,WATER+.04,riverZ(x)+(rng()>.5?8.3:-8.3));this.root.add(m);}
 }
 makeVegetation(){
  const rng=random(412),pal=[0x6b894c,0x829650,0xa7ad61,0xc1b575,0x588e75];
  for(let i=0;i<215;i++){
   const x=rng()*330-165,z=rng()*325-160,h=heightAt(x,z);
   if(h<4||Math.hypot(x,z-99)<22||Math.hypot(x,z+103)<31||Math.abs(x+28)<7&&z>25&&z<74||Math.hypot(x+16,z+16)<14)continue;
   const s=.7+rng()*.9,y=h+2.7*s;this.add('cylinder',0x686e4b,x,y,z,.42*s,5.4*s,.42*s,0,rng()*7,.06);
   this.colliders.push({x,z,r:.52*s,top:h+5.4*s});
   this.add('sphere',pal[i%pal.length],x,h+7*s,z,3.3*s,2.6*s,3*s,0,rng()*7);
   this.add('sphere',pal[(i+2)%pal.length],x-1.8*s,h+6*s,z+1*s,2.6*s,2.1*s,2.4*s);
  }
  for(let i=0;i<2000;i++){
   const x=rng()*330-165,z=rng()*325-160,h=heightAt(x,z);if(h<3.4||Math.hypot(x,z+104)<22||Math.hypot(x,z-100)<14)continue;
   const s=.25+rng()*.4;
   this.add('cone',i%7===0?0xd4b872:0x98a55c,x,h+s*.5,z,s*.24,s*1.7,s*.25,0,rng()*7,rng()*.25);
   if(i%6===0)this.add('sphere',i%12?0xe2cf8d:0xe2af8b,x,h+s*1.5,z,.18,.12,.18);
  }
  for(let i=0;i<240;i++){
   const x=rng()*310-155,z=riverZ(x)+(rng()>.5?1:-1)*(10+rng()*4),h=heightAt(x,z);if(h<2.2||h>5.8)continue;
   this.add('cylinder',0x9d9c59,x,h+.7,z,.035,1.4,.035,0,0,.2);
   this.add('sphere',0xc4a16c,x+.12,h+1.5,z,.12,.3,.12);
  }
  for(let i=0;i<160;i++){
   const x=rng()*335-167,z=rng()*330-165,h=heightAt(x,z);if(h<4)continue;
   this.add('lowSphere',0x929c80,x,h+.3,z,.6+rng()*1.4,.4+rng()*.8,.6+rng()*1.2,0,rng()*7);
  }
 }
 pillar(x,z,h=7,base=heightAt(x,z),size=1){
  this.add('cylinder',0x626f63,x,base+.35,z,1.5*size,.7,1.5*size);
  this.add('cylinder',0xd8d4af,x,base+h/2,z,.7*size,h,.7*size);
  for(const y of [.8,h-1])this.add('cylinder',0x9b7e55,x,base+y,z,.81*size,.32,.81*size);
  this.add('cylinder',0xc4c8a5,x,base+h,z,1.1*size,.5,1.1*size);
  this.colliders.push({x,z,r:.8*size,top:base+h});
 }
 makeLandmarks(){
  const rng=random(67);
  // The Crown is a distant representation, deliberately not a playable region.
  const x=-110,z=-200,y=94;
  this.add('lowSphere',0x809987,x,y,z,30,9,23);
  this.add('cone',0x647f7a,x,y-18,z,22,38,18,Math.PI);
  for(let i=0;i<5;i++)this.add('cylinder',0xc2c6a5,x+(i-2)*6,y+10+i%2*4,z,1.4,18,1.4);
  this.add('ring',0xb9c8ab,x,y+28,z,16,16,16,0,0,.3);
  // Water drifts from the broken reservoir in thin mineral-colored ribbons.
  const fallMat=new T.MeshBasicMaterial({color:0xa9d6c6,transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false});
  for(let i=0;i<3;i++){const m=new T.Mesh(new T.CylinderGeometry(.65,.4,75,6,1,true),fallMat);m.position.set(x+5*i-6,y-42,z+10);this.root.add(m);}
  this.windmills=[];
  for(const [wx,wz]of [[31,101],[-58,-59],[91,74]]){
   const h=heightAt(wx,wz);this.pillar(wx,wz,11,h,.7);const g=new T.Group();g.position.set(wx,h+10,wz);for(let i=0;i<4;i++){const blade=this.mesh('box',i%2?0xc8c6a3:0xa8beb0,g,0,4,0,.65,7,.15);blade.position.set(Math.sin(i*Math.PI/2)*3.5,Math.cos(i*Math.PI/2)*3.5,0);blade.rotation.z=-i*Math.PI/2;}this.mesh('sphere',0xa3784c,g,0,0,.3,.7,.7,.7);this.root.add(g);this.windmills.push(g);
  }
  for(let i=0;i<12;i++){
   const g=new T.Group();g.position.set(rng()*270-135,40+rng()*12,rng()*240-120);const l=this.mesh('box',0x4f6260,g,-.5,0,0,1,.08,.28);l.rotation.z=.15;const r=this.mesh('box',0x4f6260,g,.5,0,0,1,.08,.28);r.rotation.z=-.15;this.root.add(g);this.anim.push({type:'bird',group:g,seed:rng()*20});
  }
 }
 makeCamp(){
  const x=0,z=98,h=10;
  // Cloth roof, open sides and oxidized fittings.
  for(const dx of [-7,7])for(const dz of [-5,5])this.add('cylinder',0x806748,x+dx,h+2.7,z+dz,.12,5.4,.12);
  const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute([-8,3,-6,0,7,-6,8,3,-6,-8,3,6,0,7,6,8,3,6],3));roof.setIndex([0,3,1,3,4,1,1,4,2,4,5,2]);roof.computeVertexNormals();const rm=new T.Mesh(roof,new T.MeshStandardMaterial({color:0xdcc7a1,side:T.DoubleSide,roughness:1}));rm.position.set(-9,h,z-4);rm.castShadow=true;this.root.add(rm);
  for(let i=0;i<6;i++)this.add('box',i%2?0x9d805b:0x759486,-14+i*2,10.2,91,1.9,.18,5.4);
  this.add('box',0x94764f,5,h+.7,96,3,1.4,1.3);
  this.add('box',0xc5b382,6,h+1.45,96,1,.15,.8);
  this.add('cylinder',0x65887e,4.3,h+1.8,95.8,.23,.7,.23);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;this.add('lowSphere',0x9c9c82,4+Math.cos(a)*1.2,h+.3,104+Math.sin(a)*1.2,.5,.3,.5);}
  this.fire=new T.Group();this.fire.position.set(4,h+.5,104);this.mesh('cone',0xf4bc72,this.fire,0,.3,0,.5,1.2,.5,.6);this.mesh('cone',0xe67f4f,this.fire,.2,0,0,.3,.7,.3,.4);this.root.add(this.fire);
  this.beacon=this.makeBeacon(11,102,10);
  this.sella=this.makeHuman(0x7b9c95,0xd4aa73);this.sella.position.set(1,10,97);this.sella.rotation.y=.4;this.root.add(this.sella);
  this.interactables.push({id:'sella',x:1,y:11,z:97,r:3.2,label:'Speak with Sella',type:'npc'});
  this.interactables.push({id:'campfire',x:4,y:11,z:104,r:3.2,label:'Rest & prepare broth',type:'camp'});
  this.interactables.push({id:'beacon',x:11,y:11,z:102,r:3,label:'Save at the camp beacon',type:'beacon'});
  this.interactables.push({id:'guide',x:5,y:11,z:96,r:2.8,label:'Read the Loom field guide',type:'guide'});
  // Streamer on the approach acts as an original navigation silhouette.
  this.add('cylinder',0x7e7255,-6,h+5,110,.09,10,.09);
  this.add('box',0x61978d,-4.7,h+8.4,110,2.7,1.1,.05,0,0,-.15);
 }
 makeBeacon(x,z,y){const g=new T.Group();g.position.set(x,y,z);this.mesh('cylinder',0x68766a,g,0,.2,0,1,.4,1);this.mesh('cone',0xc9d8b4,g,0,1,0,.55,1.8,.55);this.mesh('sphere',0x86efd1,g,0,2.05,0,.28,.5,.28,1);const ring=this.mesh('ring',0x7cd8bd,g,0,1.7,0,.8,.8,.8,.4);ring.rotation.x=Math.PI/2;this.root.add(g);return g;}
 makeCrossing(){
  for(const z of [25.5,58.7]){
   this.add('box',0x8b937c,-28,3.5,z,8,4,3.4);
   this.add('box',0xd3cdb0,-28,5.2,z,8.8,.5,4.3);
   for(const x of [-32,-24])this.pillar(x,z,3.4,5.3,.45);
  }
  for(const z of [30.5,53.2])for(const x of [-31.2,-24.8])this.add('box',0x8eb9a7,x,5.2,z,.5,.35,2);
  for(let i=0;i<6;i++){const x=-64-i*3.1,z=32+i*3.8,y=4+Math.sin(i)*.25;this.add('lowSphere',0xaaa98b,x,y-.45,z,2.3,1.3,2.5);this.solids.push({id:'stone-'+i,x,z,w:4,d:4,top:y+.45,bottom:0});}
  const sign=new T.Group();sign.position.set(-22,5.5,66);this.mesh('cylinder',0x7b7151,sign,0,1,0,.1,2,.1);this.mesh('box',0xc6bd96,sign,0,1.5,0,2.1,.85,.12);this.root.add(sign);
  this.interactables.push({id:'crossing-reset',x:-35,y:6,z:67,r:3,label:'Reset crossing panels',type:'resetCrossing'});
  this.add('cylinder',0x9c8460,-35,6.1,67,.55,.8,.55);this.add('ring',0x72c9b1,-35,6.7,67,.55,.55,.55,Math.PI/2);
  for(const s of SOCKETS){const g=new T.Group();g.position.set(s.x,s.y,s.z);this.mesh('box',0x5cb89f,g,0,-.25,0,s.kind==='panel'?6.3:3.8,.12,s.kind==='panel'?11.7:3.8,.25);const ring=this.mesh('ring',0x8ae6c8,g,0,.09,0,1.1,1.1,1.1,.6);ring.rotation.x=-Math.PI/2;this.root.add(g);this.socketMeshes.push({data:s,group:g,ring});}
 }
 makeRuins(){
  for(const [x,z]of [[-25,-28],[-7,-29],[-29,-5],[-7,-4]])this.pillar(x,z,5+(x%3),heightAt(x,z),.7);
  this.add('box',0xd2c9a6,-16,14.3,-29,18.5,.8,1.8,0,0,.03);
  for(let i=0;i<9;i++){const x=-23+i*1.8,z=-21,h=heightAt(x,z);this.add('box',i%2?0xc2bf9e:0xa9b098,x,h+.03,z,1.65,.18,8,0,.03*i);}
  this.add('box',0x8caa9c,-16,9.1,-13,5,.12,3);
  this.interactables.push({id:'ruin-note',x:-8,y:10,z:-5,r:3,label:'Read a salvager’s warning',type:'ruinNote'});
 }
 makeIntake(){
  const h=19;
  this.add('cylinder',0x919c83,0,h-1.2,-105,19,2.4,19);
  this.add('cylinder',0xd3d0af,0,h-.05,-105,17.5,.35,17.5);
  this.solids.push({id:'intake-floor',x:0,z:-105,w:28,d:28,top:19.2,bottom:17});
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=Math.cos(a)*14,z=-105+Math.sin(a)*14;this.pillar(x,z,12,h,1);}
  this.add('ring',0xcbd1af,0,h+12.5,-105,15,15,15,Math.PI/2);
  this.add('ring',0x9e825a,0,h+12.7,-105,15.5,15.5,15.5,Math.PI/2);
  this.add('ring',0xc7d4b5,0,h+27,-109,11,11,11,0,0,.2);
  this.add('ring',0x86bcaa,0,h+27,-109,8.5,8.5,8.5,0,0,-.2);
  for(const x of [-9,9])this.add('box',0xabb69b,x,h+17,-109,1.1,19,1.1,0,0,x>0?-.17:.17);
  this.rotor=new T.Group();this.rotor.position.set(0,h+27,-109);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const b=this.mesh('box',0x86ab9e,this.rotor,Math.sin(a)*5,Math.cos(a)*5,0,1.4,7,.4);b.rotation.z=-a+.25;}
  this.mesh('sphere',0xdec89a,this.rotor,0,0,.5,2,2,.8);this.root.add(this.rotor);
  // The intake iris changes both shape and light after balancing the cradle.
  this.gate=new T.Group();this.gate.position.set(0,h,-99);
  for(let i=0;i<7;i++)this.mesh('box',0x6b9587,this.gate,-3+i,3.5,0,.65,7,.5);
  this.root.add(this.gate);
  this.add('box',0xb1b998,-4.6,h+4,-99,1.3,8,1.5);this.add('box',0xb1b998,4.6,h+4,-99,1.3,8,1.5);this.add('box',0xd1ccb0,0,h+8,-99,10.4,1.3,1.5);
  this.console=new T.Group();this.console.position.set(0,h+.2,-109);this.mesh('cylinder',0xa9ab8a,this.console,0,1,0,1.5,2,1.5);this.mesh('ring',0x88dfc1,this.console,0,2.1,0,1.4,1.4,1.4,.7).rotation.x=Math.PI/2;this.mesh('sphere',0xb0ead0,this.console,0,2.8,0,.5,.6,.5,.5);this.root.add(this.console);
  this.interactables.push({id:'regulator',x:0,y:21,z:-109,r:3.3,label:'Read the weather regulator',type:'regulator'});
  this.interactables.push({id:'intake-reset',x:14,y:20,z:-90,r:3,label:'Recall the ceramic weight',type:'resetWeight'});
  this.add('cylinder',0x9e8059,14,h+.6,-90,.6,1,.6);this.add('ring',0x8cdbbf,14,h+1.3,-90,.75,.75,.75,Math.PI/2);
  this.interactables.push({id:'intake-plate',x:-10,y:21,z:-91,r:3.2,label:'Inspect the counterweight cradle',type:'plate'});
  for(let i=0;i<5;i++)this.add('box',0x859d87,-10+i*1.8,19.35,-96,1.6,.15,.3);
  this.waterfall=new T.Group();this.waterfall.position.set(12,18,-109);const mat=new T.MeshBasicMaterial({color:0x9de4ca,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false});const strip=new T.Mesh(new T.CylinderGeometry(.65,.9,13,8,1,true),mat);strip.position.y=-5;this.waterfall.add(strip);this.root.add(this.waterfall);
  this.beaconNorth=this.makeBeacon(18,-88,heightAt(18,-88));
  this.interactables.push({id:'north-beacon',x:18,y:heightAt(18,-88)+1,z:-88,r:3,label:'Light the intake beacon',type:'northBeacon'});
 }
 makeHollow(){
  const x=76,z=-44,h=heightAt(x,z);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const root=this.mesh('cylinder',0x5e7e68,this.root,x+Math.cos(a)*8,h+4,z+Math.sin(a)*8,1.7,13,1.7);root.rotation.z=Math.cos(a)*.7;root.rotation.x=Math.sin(a)*.7;}
  this.hollowLight=new T.Group();this.hollowLight.position.set(x,h,z);this.root.add(this.hollowLight);
  const rng=random(78);for(let i=0;i<34;i++){const a=rng()*Math.PI*2,r=rng()*7;this.mesh('sphere',i%2?0x79ccbe:0xb7d295,this.hollowLight,Math.cos(a)*r,.6+rng()*2.4,Math.sin(a)*r,.22,.5,.22,.65);}
  this.interactables.push({id:'hollow-note',x:76,y:h+1,z:-44,r:4,label:'Listen to the luminous roots',type:'hollow'});
 }
 makeDiscoveries(){
  this.interactables.push({id:'bluff-note',x:-98,y:27,z:3,r:4,label:'Read the surveyor’s notebook',type:'bluff'});
  this.add('cylinder',0x726a4c,-98,29,3,.07,6,.07);this.add('box',0xc5af77,-97,31,3,2,1,.06);
  // Readable climbable mineral faces at the optional lookout.
  for(let i=0;i<3;i++){const x=-89-i*4,z=13,h=heightAt(x,z);this.add('box',0x8fb3a1,x,h+1.6,z,3.4,3.4,1.2);this.colliders.push({x,z,r:1.3,climb:true,top:h+3.3});}
  for(const p of PICKUPS){
   const g=new T.Group(),h=heightAt(p.x,p.z);g.position.set(p.x,h+.3,p.z);g.userData.pickup=p;
   if(p.chest){this.mesh('box',0x6f8c7b,g,0,.45,0,1.5,.85,1);this.mesh('box',0xcbb67e,g,0,.95,0,1.6,.24,1.08);for(const x of [-.5,.5])this.mesh('box',0xb1bd97,g,x,.6,0,.13,1.1,1.12);}
   else {this.mesh(p.kind==='glass'?'cone':'sphere',p.kind==='glass'?0x8ce2c8:p.kind==='copper'?0xca9c5c:0xc2c48a,g,0,.5,0,.5,.7,.5,.2);}
   const ring=new T.Mesh(new T.RingGeometry(.6,.7,24),new T.MeshBasicMaterial({color:0xf4dd9a,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.08;g.add(ring);
   this.root.add(g);this.pickupMeshes.set(p.id,g);this.interactables.push({id:p.id,x:p.x,y:h+1,z:p.z,r:2.7,label:p.chest?'Open salvage cache':'Gather '+(p.kind==='glass'?'mossglass':p.kind==='fiber'?'woven fiber':'copper salvage'),type:'pickup',data:p});
  }
 }
 makeHuman(cloth=0x5e8587,accent=0xb88154){
  const g=new T.Group();const body=this.mesh('cone',cloth,g,0,1.05,0,.43,1.1,.32);body.rotation.z=Math.PI;
  this.mesh('sphere',0xc7a786,g,0,1.92,0,.29,.33,.28);this.mesh('sphere',0x5c5a48,g,0,2.1,-.06,.31,.2,.29);
  const cape=this.mesh('cone',accent,g,0,1.25,-.16,.5,.8,.4);cape.rotation.z=Math.PI;
  const arms=[],legs=[];
  for(const s of [-1,1]){const a=new T.Group();a.position.set(s*.42,1.5,0);this.mesh('cylinder',cloth,a,0,-.32,0,.105,.65,.105);g.add(a);arms.push(a);const l=new T.Group();l.position.set(s*.17,.7,0);this.mesh('cylinder',0x4a5b57,l,0,-.28,0,.12,.6,.12);this.mesh('box',0x605c47,l,0,-.58,.07,.26,.18,.42);g.add(l);legs.push(l);}
  g.userData={arms,legs,body};return g;
 }
 createObjectMesh(o){
  const g=new T.Group(),def=COMPONENTS[o.kind];g.userData.id=o.id;
  if(o.kind==='panel'){
   for(let i=0;i<8;i++)this.mesh('box',i%2?0xc5ad7e:0xbba071,g,0,0,-5+i*1.42,5.8,.32,1.28);
   for(const x of [-2.35,2.35])this.mesh('box',0x5e8d7e,g,x,-.2,0,.3,.45,11.5);
   for(const z of [-4.5,4.5])this.mesh('box',0x78bfa6,g,0,.06,z,5.9,.16,.3,.15);
  }else if(o.kind==='counterweight'){
   this.mesh('box',0xd6d3b0,g,0,0,0,2.8,2.8,2.8);
   for(const y of [-1,1])this.mesh('box',0x6c9a86,g,0,y,0,2.9,.25,2.9);
   this.mesh('ring',0x8fe3c4,g,0,1.7,0,.6,.6,.6,.4);
  }else{
   for(let i=0;i<7;i++)this.mesh('cylinder',i%2?0xbaa273:0xa58b5d,g,-2.6+i*.87,0,0,.45,8,.45).rotation.x=Math.PI/2;
   for(const z of [-2.6,2.6])this.mesh('box',0x729b88,g,0,.32,z,6,.3,.35);
   this.mesh('box',0xcfbd94,g,0,.6,-.5,1.4,.4,2);
   this.mesh('cylinder',0x8a7852,g,0,2.7,-1.8,.09,5,.09);
   this.mesh('box',0xe0d3af,g,.95,3.2,-1.8,2,2.5,.05);
  }
  this.root.add(g);this.objectMeshes.set(o.id,g);return g;
 }
 sync(state,heldId){
  const ids=new Set(state.objects.map(o=>o.id));for(const[id,g]of this.objectMeshes)if(!ids.has(id)){this.root.remove(g);this.objectMeshes.delete(id);}
  for(const o of state.objects){let g=this.objectMeshes.get(o.id)||this.createObjectMesh(o);if(o.id!==heldId){g.position.set(o.x,o.y,o.z);g.rotation.y=o.rot;g.visible=true;}}
  for(const[id,g]of this.pickupMeshes)g.visible=!state.collected.includes(id);
  for(const s of this.socketMeshes){const filled=state.objects.some(o=>o.socket===s.data.id);s.group.visible=!filled;s.ring.rotation.z=this.time*.4;}
  const target=state.facts.intakeOpen?7.2:0;this.gate.position.y=19+target;
  this.hollowLight.visible=state.facts.route!=='channels';this.waterfall.visible=!!state.facts.route;
 }
 surfaceAt(x,z,feet=999,state=null,exclude=null){
  let top=heightAt(x,z),platform=null;
  for(const b of this.solids)if(Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2&&b.top<=feet+.7&&b.top>top){top=b.top;platform=b.id;}
  if(state)for(const o of state.objects){if(o.id===exclude)continue;const sz=COMPONENTS[o.kind].size;const dx=x-o.x,dz=z-o.z,c=Math.cos(o.rot),s=Math.sin(o.rot),lx=dx*c-dz*s,lz=dx*s+dz*c;const t=o.y+sz[1]/2;if(Math.abs(lx)<sz[0]/2+.15&&Math.abs(lz)<sz[2]/2+.15&&t<=feet+.75&&t>top){top=t;platform=o.id;}}
  return {height:top,platform};
 }
 obstacleAt(x,z,y){return this.colliders.find(c=>Math.hypot(x-c.x,z-c.z)<c.r+.38&&(!c.top||y<c.top-.3));}
 update(dt,state){this.time+=dt;this.waterMat.uniforms.time.value=this.time;this.clouds.position.x=Math.sin(this.time*.008)*12;for(const g of this.windmills)g.rotation.z+=dt*.18;this.rotor.rotation.z+=dt*(state.facts.route ? .13 : .018);this.fire.scale.y=1+Math.sin(this.time*9)*.12;this.sella.userData.arms[1].rotation.x=Math.sin(this.time*.9)*.05;for(const a of this.anim){if(a.type==='bird'){a.group.position.x+=Math.cos(this.time*.1+a.seed)*dt*1.1;a.group.position.z+=Math.sin(this.time*.1+a.seed)*dt*1.1;a.group.rotation.y=-this.time*.1-a.seed;const w=Math.sin(this.time*3+a.seed)*.2;a.group.children[0].rotation.z=w;a.group.children[1].rotation.z=-w;}}}
}
