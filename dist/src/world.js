import * as T from '../vendor/three.module.js';
import {createCharacter} from './characters.js';
import {addArtGeometry,buildSky,buildTerrain,buildWater,buildVegetation,buildLandmarks,decorateCamp,decorateIntake,decorateRuins,updateEnvironment} from './environment-art.js';
import {heightAt,riverZ,WATER,SOCKETS,LOCATIONS,PICKUPS,COMPONENTS,clamp,smooth} from './data.js';

const UP=new T.Vector3(0,1,0), dummy=new T.Object3D();
export function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export class World{
 constructor(scene){
  this.scene=scene;this.batch=new Map();this.anim=[];this.solids=[];this.riseSurfaces=[];this.colliders=[];this.objectMeshes=new Map();this.pickupMeshes=new Map();this.socketMeshes=[];this.ripples=[];this.interactables=[];this.time=0;
  this.geos={box:new T.BoxGeometry(1,1,1),sphere:new T.IcosahedronGeometry(1,1),lowSphere:new T.IcosahedronGeometry(1,0),cone:new T.ConeGeometry(1,1,7),cylinder:new T.CylinderGeometry(1,1,1,10),ring:new T.TorusGeometry(1,.11,7,40)};
  this.mats={};addArtGeometry(this);
  this.basicMaterial=new T.MeshStandardMaterial({roughness:.94,metalness:.02,flatShading:false});
  this.root=new T.Group();scene.add(this.root);
  this.makeSky();this.makeTerrain();this.makeWater();this.makeVegetation();this.makeLandmarks();this.makeCamp();decorateCamp(this);this.makeCrossing();this.makeRuins();decorateRuins(this);this.makeIntake();decorateIntake(this);this.makeRiseCanopy();this.makeHollow();this.makeRouteChanges();this.makeDiscoveries();this.flush();
 }
 material(color,emissive=0){const key=color+'-'+emissive;if(!this.mats[key])this.mats[key]=new T.MeshStandardMaterial({color,roughness:.8,metalness:.12,flatShading:true,emissive:color,emissiveIntensity:emissive});return this.mats[key];}
 add(kind,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
  dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();
  if(!this.batch.has(kind))this.batch.set(kind,[]);this.batch.get(kind).push({matrix:dummy.matrix.clone(),color:new T.Color(color)});
 }
 flush(){for(const[k,items]of this.batch){const mesh=new T.InstancedMesh(this.geos[k],this.basicMaterial,items.length);items.forEach((o,i)=>{mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,o.color);});mesh.castShadow=k!=='cone';mesh.receiveShadow=true;mesh.computeBoundingSphere();this.root.add(mesh);}this.batch.clear();}
 mesh(kind,color,parent,x,y,z,sx=1,sy=1,sz=1,emissive=0){const m=new T.Mesh(this.geos[kind],this.material(color,emissive));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 makeSky(){buildSky(this);}
 makeTerrain(){buildTerrain(this);}
 makeWater(){buildWater(this);}
 makeVegetation(){buildVegetation(this);}
 pillar(x,z,h=7,base=heightAt(x,z),size=1){
  this.add('cylinder',0x626f63,x,base+.35,z,1.5*size,.7,1.5*size);
  this.add('cylinder',0xd8d4af,x,base+h/2,z,.7*size,h,.7*size);
  for(const y of [.8,h-1])this.add('cylinder',0x9b7e55,x,base+y,z,.81*size,.32,.81*size);
  this.add('cylinder',0xc4c8a5,x,base+h,z,1.1*size,.5,1.1*size);
  this.colliders.push({x,z,r:.8*size,top:base+h});
 }
 makeLandmarks(){buildLandmarks(this);}
 makeCamp(){
  const x=0,z=98,h=10;
  // Cloth roof, open sides and oxidized fittings.
  for(const dx of [-6,6])for(const dz of [-5,5])this.add('cylinder',0x806748,-12+dx,h+2.15,94+dz,.1,4.3,.1);
  const roof=new T.PlaneGeometry(13,11.4,24,20);roof.rotateX(-Math.PI/2);const rp=roof.attributes.position;
  for(let i=0;i<rp.count;i++){const px=rp.getX(i),pz=rp.getZ(i),edge=Math.abs(px)/6.5;rp.setY(i,6-2*edge-.42*Math.sin(edge*Math.PI)-.19*Math.sin((pz+5.7)/11.4*Math.PI)*(1-edge*.4));}
  roof.computeVertexNormals();const rm=new T.Mesh(roof,new T.MeshStandardMaterial({color:0xc7b38b,side:T.DoubleSide,roughness:1}));rm.position.set(-12,h,94);rm.castShadow=true;rm.receiveShadow=true;this.root.add(rm);
  for(const side of [-1,1]){const trim=new T.Mesh(new T.BoxGeometry(13,.13,.11),this.material(0x6c8c79));trim.position.set(-12,h+4,94+side*5.7);trim.rotation.z=side*.018;this.root.add(trim);}
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
 makeRiseCanopy(){
  const roof={id:'bellwether-canopy',x:0,z:-105,w:18,d:18,bottom:30.9,top:31.5};this.riseSurfaces.push(roof);this.solids.push(roof);
  for(let ix=0;ix<6;ix++)for(let iz=0;iz<6;iz++)this.add('box',(ix+iz)%2?0xcbd0b5:0xb8c6ad,-7.5+ix*3,31.2,-112.5+iz*3,2.94,.6,2.94);
  for(const r of [1.5,2.8,4.2])this.add('ring',0x85c9b3,0,30.86,-105,r,r,r,Math.PI/2);
  this.add('ring',0x8dbaa7,0,31.54,-105,6,6,6,Math.PI/2);
  const light=new T.PointLight(0x9ce3cb,22,20,2);light.position.set(0,27,-105);this.root.add(light);
  this.add('box',0x617f6f,0,32,-105,1.7,1,1.1);this.add('box',0xd4c79b,0,32.56,-105,1.8,.15,1.2);
  this.interactables.push({id:'canopy-cache',x:0,y:32,z:-105,r:3,label:'Open the canopy survey cache',type:'canopyCache'});
  this.interactables.push({id:'rise-inscription',x:5,y:20,z:-99,r:3,label:'Read the canopy inscription',type:'riseGuide'});
 }
 makeHollow(){
  const x=76,z=-44,h=heightAt(x,z);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const root=this.mesh('cylinder',0x5e7e68,this.root,x+Math.cos(a)*8,h+4,z+Math.sin(a)*8,1.7,13,1.7);root.rotation.z=Math.cos(a)*.7;root.rotation.x=Math.sin(a)*.7;}
  this.hollowLight=new T.Group();this.hollowLight.position.set(x,h,z);this.root.add(this.hollowLight);
  const rng=random(78);for(let i=0;i<34;i++){const a=rng()*Math.PI*2,r=rng()*7;this.mesh('sphere',i%2?0x79ccbe:0xb7d295,this.hollowLight,Math.cos(a)*r,.6+rng()*2.4,Math.sin(a)*r,.22,.5,.22,.65);}
  this.interactables.push({id:'hollow-note',x:72,y:h+1,z:-47,r:2.4,label:'Read Eda’s note in the luminous roots',type:'hollow'});
 }
 makeRouteChanges(){
  this.channelBridge=new T.Group();this.root.add(this.channelBridge);
  for(let i=0;i<12;i++)this.mesh('box',i%2?0xc9c6a6:0xb7c1a3,this.channelBridge,0,5.05,28+i*2.5,6,.5,2.4);
  for(const x of [-2.9,2.9])this.mesh('box',0x648879,this.channelBridge,x,5.9,42,.16,1.2,30);
  this.rootWind=new T.Group();this.rootWind.position.set(76,heightAt(76,-44),-44);this.root.add(this.rootWind);
  this.mesh('sphere',0x7fc9a3,this.rootWind,0,.25,0,2.7,.22,2.7,.25);
  const points=[];for(let i=0;i<64;i++)points.push(0,0,0);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));this.windMotes=new T.Points(geo,new T.PointsMaterial({color:0xd7f5bd,size:.12,transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending}));this.rootWind.add(this.windMotes);
  this.interactables.push({id:'root-updraft',x:76,y:heightAt(76,-44)+1,z:-44,r:3.2,label:'Ride the awakened updraft',type:'rootLift'});
 }
 windAt(x,y,z,state){
  if(state?.facts.route==='roots'&&Math.hypot(x-76,z+44)<7&&y<heightAt(76,-44)+20&&y>heightAt(76,-44)-.5)return {x:0,y:7,z:0};
  return {x:0,y:0,z:0};
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
  return createCharacter(cloth,accent);
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
   this.mesh('ring',o.id==='echo-courier'?0xffcb83:0x8fe3c4,g,0,1.7,0,.6,.6,.6,.4);
   if(o.id==='echo-courier'){this.mesh('cylinder',0x9b784a,g,0,2.3,0,.08,1.1,.08);for(const x of [-1.42,1.42])this.mesh('box',0xa37a4d,g,x,0,0,.15,2.5,2.95);this.mesh('sphere',0xffce8b,g,0,0,1.44,.4,.6,.12,.6);}
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
  if(this.courierLid){const weight=state.objects.find(o=>o.id==='echo-courier'),open=state.collected.includes('courier-testimony')||weight&&Math.abs(weight.x-25.5)<=1.5&&Math.abs(weight.z-91)<=1.5&&Math.abs(weight.y-11.45)<=.6;this.courierLid.position.y=open?12.2:11.3;this.courierLid.rotation.z=open?-.8:0;this.courierIndicator.scale.y=open?.4:.12;}

  const ids=new Set(state.objects.map(o=>o.id));for(const[id,g]of this.objectMeshes)if(!ids.has(id)){this.root.remove(g);this.objectMeshes.delete(id);}
  for(const o of state.objects){let g=this.objectMeshes.get(o.id)||this.createObjectMesh(o);if(o.id!==heldId){g.position.set(o.x,o.y,o.z);g.rotation.y=o.rot;g.visible=true;}}
  for(const[id,g]of this.pickupMeshes)g.visible=!state.collected.includes(id);
  for(const s of this.socketMeshes){const filled=state.objects.some(o=>o.socket===s.data.id);s.group.visible=!filled;s.ring.rotation.z=this.time*.4;}
  const target=state.facts.intakeOpen?7.2:0;this.gate.position.y=19+target;
  this.hollowLight.visible=state.facts.route!=='channels';this.waterfall.visible=!!state.facts.route;
  this.channelBridge.visible=state.facts.route==='channels';this.rootWind.visible=state.facts.route==='roots';
  if(this.rootWind.visible){const p=this.windMotes.geometry.attributes.position;for(let i=0;i<p.count;i++){const y=(this.time*1.6+i*.31)%19,a=this.time*.8+i*2.39,r=.4+y*.13;p.setXYZ(i,Math.cos(a)*r,y,Math.sin(a)*r);}p.needsUpdate=true;}
 }
 surfaceAt(x,z,feet=999,state=null,exclude=null){
  let top=heightAt(x,z),platform=null;
  for(const b of this.solids)if(Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2&&b.top<=feet+.7&&b.top>top){top=b.top;platform=b.id;}
  if(state?.facts.route==='channels'&&Math.abs(x)<3&&z>26.8&&z<56.8&&5.3<=feet+.7&&5.3>top){top=5.3;platform='restored-road';}
  if(state)for(const o of state.objects){if(o.id===exclude)continue;const sz=COMPONENTS[o.kind].size;const dx=x-o.x,dz=z-o.z,c=Math.cos(o.rot),s=Math.sin(o.rot),lx=dx*c-dz*s,lz=dx*s+dz*c;const t=o.y+sz[1]/2;if(Math.abs(lx)<sz[0]/2+.15&&Math.abs(lz)<sz[2]/2+.15&&t<=feet+.75&&t>top){top=t;platform=o.id;}}
  return {height:top,platform};
 }
 obstacleAt(x,z,y){
  const collider=this.colliders.find(c=>Math.hypot(x-c.x,z-c.z)<c.r+.38&&(!c.top||y<c.top-.3));if(collider)return collider;
  const base=this.gate?.position.y??19;
  if(y+1.9>base&&y<base+7&&Math.abs(x)<4.2+.38&&Math.abs(z+99)<.3+.38)return {x:clamp(x,-4.2,4.2),z:-99,r:.4,top:base+7};
  return null;
 }
 cameraObstacleAt(x,y,z){
  if(this.colliders.some(c=>y>heightAt(c.x,c.z)-.1&&y<(c.top||heightAt(c.x,c.z)+6)&&Math.hypot(x-c.x,z-c.z)<c.r+.15))return true;
  const base=this.gate?.position.y??19;if(y>base&&y<base+7&&Math.abs(x)<4.25&&Math.abs(z+99)<.5)return true;
  return this.riseSurfaces.some(s=>Math.abs(x-s.x)<s.w/2&&Math.abs(z-s.z)<s.d/2&&y>s.bottom-.1&&y<s.top+.15);
 }
 buildCourier(){
  for(const x of [18,33]){this.mesh('cylinder',0xd8d3b6,this.root,x,12.6,88.6,.28,5.2,.28);this.mesh('box',0xb88b52,this.root,x,15.2,90,.45,.4,3.2);this.mesh('ring',0x80b7a0,this.root,x,14.8,91,.7,.7,.7,.25);this.mesh('box',0xe2d8bc,this.root,x,10.05,91,4,.1,4);for(const z of [89,93])this.mesh('box',0x966a43,this.root,x,11,z,.2,2,.2);}
  this.mesh('box',0x8a6740,this.root,25.5,14.8,91,16,.18,.18);
  for(const z of [90.8,91.2])this.mesh('box',0x8c9c85,this.root,25.5,10.01,z,15,.06,.09);
  this.mesh('box',0x967851,this.root,25.5,10.03,91,3.2,.12,3.2);
  for(const z of [89.3,92.7])this.mesh('box',0xc8ac70,this.root,25.5,10.12,z,3.6,.12,.14);
  this.mesh('box',0x655743,this.root,25.5,10.1,87,2,.25,1.6);this.mesh('box',0xeadfc3,this.root,25.5,10.7,87,1.5,1,1.2);this.courierIndicator=this.mesh('box',0xffc887,this.root,25.5,11.25,87,.8,.12,.7,.8);this.courierLid=this.mesh('box',0x987844,this.root,25.5,11.3,87,1.8,.15,1.5);
  this.mesh('cylinder',0xa8d8c4,this.root,15,10.8,91,.5,1.6,.5);this.mesh('ring',0xe0b66f,this.root,15,11.6,91,.7,.7,.2);
  this.interactables.push({id:'courier-winch',type:'courierReset',x:15,y:10,z:91,r:3,label:'Reset the memory courier'}, {id:'courier-archive',type:'courierCache',x:25.5,y:10,z:87,r:3,label:'Read the sealed courier archive'});
 }
 update(dt,state){this.time+=dt;updateEnvironment(this,dt);this.waterMat.uniforms.time.value=this.time;this.clouds.position.x=Math.sin(this.time*.008)*12;for(const g of this.windmills)g.rotation.z+=dt*.18;this.rotor.rotation.z+=dt*(state.facts.route ? .13 : .018);this.fire.scale.y=1+Math.sin(this.time*9)*.12;if(this.sella.userData.arms?.[1])this.sella.userData.arms[1].rotation.x=Math.sin(this.time*.9)*.05;for(const a of this.anim){if(a.type==='bird'){a.group.position.x+=Math.cos(this.time*.1+a.seed)*dt*1.1;a.group.position.z+=Math.sin(this.time*.1+a.seed)*dt*1.1;a.group.rotation.y=-this.time*.1-a.seed;const w=Math.sin(this.time*3+a.seed)*.2;a.group.children[0].rotation.z=w;a.group.children[1].rotation.z=-w;}}}
}
