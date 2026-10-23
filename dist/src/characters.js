import * as T from '../vendor/three.module.js';

// Iri's expedition clothes, face and Loom are authored here. The model has a
// small hierarchy of articulated joints rather than rigid pieces orbiting a box.
const materials=new Map();
const sphereGeo=new T.SphereGeometry(1,20,14);
const cylinderGeo=new T.CylinderGeometry(1,1,1,16);
const boxGeo=new T.BoxGeometry(1,1,1,1,1,1);
const ringGeo=new T.TorusGeometry(1,.085,8,32);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
function mat(color,metal=0,glow=0){const k=`${color}-${metal}-${glow}`;if(!materials.has(k))materials.set(k,new T.MeshStandardMaterial({color,roughness:metal?.4:.87,metalness:metal,emissive:color,emissiveIntensity:glow}));return materials.get(k);}
function part(parent,geo,color,pos,size,metal=0,glow=0){const mesh=new T.Mesh(geo,mat(color,metal,glow));mesh.position.set(...pos);mesh.scale.set(...size);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function oval(parent,color,pos,size,metal=0,glow=0){return part(parent,sphereGeo,color,pos,size,metal,glow);}
function band(parent,color,pos,size,rotation=0){const m=part(parent,cylinderGeo,color,pos,size,.05);m.rotation.z=rotation;return m;}
function torus(parent,color,pos,size,rotation=[0,0,0],metal=.4,glow=0){const m=part(parent,ringGeo,color,pos,size,metal,glow);m.rotation.set(...rotation);return m;}
function shapedBody(parent,color,points,scale,pos){const geo=new T.LatheGeometry(points.map(p=>new T.Vector2(p[0],p[1])),20);const mesh=part(parent,geo,color,pos,scale);return mesh;}
function link(parent,color,a,b,r1=.05,r2=.05){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const g=new T.CylinderGeometry(r2,r1,delta.length(),10);const m=part(parent,g,color,start.clone().add(end).multiplyScalar(.5).toArray(),[1,1,1]);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
function clothStrip(color,width,length,segments=8){
 const geo=new T.BufferGeometry(),verts=[],uv=[],indices=[];
 for(let j=0;j<=segments;j++){const t=j/segments;for(let i=0;i<3;i++){const u=i/2;verts.push((u-.5)*width*(.9+t*.1),-t*length,-t*.12);uv.push(u,t);if(j<segments&&i<2){const n=j*3+i;indices.push(n,n+3,n+1,n+1,n+3,n+4);}}}
 geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 const material=new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:.95});const mesh=new T.Mesh(geo,material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.base=new Float32Array(verts);return mesh;
}

// Bake the unanimated decorative pieces of each joint into colored geometry.
// All articulation remains on groups. This turns a detailed face, boot or bag
// into a few draws without sacrificing the original material palette.
const combinedMaterials=new Map();
function combineDecorations(root){
 const joints=[];root.traverse(o=>{if(o.isGroup)joints.push(o);});
 for(const joint of joints){
  const buckets=new Map();
  for(const mesh of joint.children.filter(o=>o.isMesh&&!o.userData.base&&!o.userData.dynamicMaterial)){
   const m=mesh.material;if(!m.isMeshStandardMaterial||m.side===T.DoubleSide)continue;
   const key=`${m.roughness}-${m.metalness}-${m.emissiveIntensity}-${m.emissiveIntensity?m.emissive.getHex():0}`;
   if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(mesh);
  }
  for(const [key,meshes] of buckets){
   if(meshes.length<2)continue;
   const positions=[],normals=[],colors=[];let originalMaterial;
   for(const mesh of meshes){
    mesh.updateMatrix();const geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(mesh.matrix);
    const p=geo.attributes.position,n=geo.attributes.normal,c=mesh.material.color;originalMaterial=mesh.material;
    for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(c.r,c.g,c.b);}
    joint.remove(mesh);geo.dispose();
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
   if(!combinedMaterials.has(key))combinedMaterials.set(key,new T.MeshStandardMaterial({vertexColors:true,roughness:originalMaterial.roughness,metalness:originalMaterial.metalness,emissive:originalMaterial.emissive,emissiveIntensity:originalMaterial.emissiveIntensity}));
   const result=new T.Mesh(geo,combinedMaterials.get(key));result.castShadow=true;result.receiveShadow=true;joint.add(result);
  }
 }
}

export function createCharacter(cloth=0x2d676c,accent=0xc7894f){
 const group=new T.Group(),visual=new T.Group();group.add(visual);
 const skin=0xcba17d,skinShadow=0xb3896d,hair=0x363d38,leather=0x67543b,boot=0x3c4942,ceramic=0xe3dfc2,copper=0xa77e4e,teal=0x6bd6bf;
 const torso=new T.Group();torso.position.y=1.03;visual.add(torso);
 // Fitted coat narrows at the waist, with a layered shoulder yoke.
 shapedBody(torso,cloth,[[.22,0],[.255,.07],[.235,.2],[.275,.4],[.31,.53],[.25,.62],[.14,.67]], [1,.98,.69],[0,0,0]);
 oval(torso,cloth,[0,.12,0],[.25,.2,.18]);
 shapedBody(torso,accent,[[.22,0],[.31,.04],[.33,.1],[.29,.17],[.16,.23]],[1,.75,.74],[0,.47,-.015]);
 // The waist belt and diagonal harness give the back a readable silhouette.
 band(torso,leather,[0,.13,.005],[.257,.085,.185]);
 part(torso,boxGeo,copper,[0,.13,.196],[.13,.095,.035],.65);
 const buckle=part(torso,boxGeo,0x3e544b,[0,.13,.219],[.075,.048,.014]);
 for(const side of [-1,1]){
  const strap=part(torso,boxGeo,leather,[side*.175,.38,-.175],[.052,.61,.03]);strap.rotation.z=side*.1;
  oval(torso,copper,[side*.2,.59,-.18],[.042,.035,.015],.5);
  const frontStrap=part(torso,boxGeo,leather,[side*.195,.35,.159],[.045,.5,.025]);frontStrap.rotation.z=-side*.15;
 }
 // Small stitched coat panels flare independently of the legs.
 const coatPanels=[];
 for(const side of [-1,1]){
  const panel=clothStrip(cloth,.255,.46,5);panel.position.set(side*.155,.16,.125);panel.rotation.z=side*.06;torso.add(panel);coatPanels.push(panel);
  const seam=part(torso,boxGeo,accent,[side*.29,.31,.09],[.017,.25,.021]);seam.rotation.z=side*.09;
 }
 // The asymmetrical shoulder guard is ceramic with copper rim and bolts.
 oval(torso,ceramic,[-.325,.52,-.01],[.18,.145,.215],.08);
 oval(torso,copper,[-.334,.52,-.018],[.185,.09,.222],.55);
 oval(torso,ceramic,[-.333,.55,-.012],[.182,.12,.214],.05);
 for(const z of [-.14,.13])oval(torso,copper,[-.42,.57,z],[.025,.022,.025],.6);
 // Padded trousers, boot cuffs, shaped soles and folded leather toes.
 const pelvis=oval(visual,0x384e49,[0,.94,0],[.25,.19,.18]);
 const legs=[],knees=[],feet=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.15,.96,0);visual.add(leg);
  const upper=part(leg,new T.CylinderGeometry(.12,.095,.43,14),0x42594f,[0,-.205,0],[1,1,1]);
  oval(leg,0x42594f,[0,-.015,0],[.13,.14,.14]);
  const knee=new T.Group();knee.position.y=-.41;leg.add(knee);
  oval(knee,0x566d5b,[0,0,.015],[.115,.12,.115]);
  part(knee,new T.CylinderGeometry(.093,.07,.37,14),0x465c51,[0,-.19,0],[1,1,1]);
  band(knee,leather,[0,-.18,0],[.105,.09,.105]);
  const foot=new T.Group();foot.position.set(0,-.39,0);knee.add(foot);
  oval(foot,boot,[0,-.005,.07],[.124,.12,.21]);
  oval(foot,leather,[0,.075,-.012],[.117,.135,.13]);
  part(foot,boxGeo,0x2e3933,[0,-.082,.065],[.245,.07,.36]);
  part(foot,boxGeo,copper,[0,.055,.122],[.12,.043,.025],.35);
  for(let i=0;i<3;i++)link(foot,0xa18e68,[-.055,.12-i*.035,.14],[.055,.11-i*.035,.15],.008,.008);
  legs.push(leg);knees.push(knee);feet.push(foot);
 }
 // Articulated sleeves, elbow and forearm pivots, with gloves and separated thumb.
 const arms=[],elbows=[],hands=[];
 for(const side of [-1,1]){
  const arm=new T.Group();arm.position.set(side*.32,.54,0);torso.add(arm);
  oval(arm,cloth,[side*.028,-.04,0],[.135,.16,.14]);
  const upper=part(arm,new T.CylinderGeometry(.105,.082,.29,14),cloth,[side*.02,-.17,0],[1,1,1]);upper.rotation.z=side*.07;
  const elbow=new T.Group();elbow.position.set(side*.025,-.31,0);arm.add(elbow);
  oval(elbow,cloth,[0,0,0],[.083,.085,.09]);
  part(elbow,new T.CylinderGeometry(.082,.065,.27,14),cloth,[0,-.135,0],[1,1,1]);
  band(elbow,leather,[0,-.215,0],[.084,.1,.083]);
  const hand=new T.Group();hand.position.y=-.31;elbow.add(hand);
  oval(hand,leather,[0,-.035,.005],[.071,.1,.057]);
  oval(hand,skin,[side*-.058,-.022,.04],[.031,.056,.036]);
  for(let i=0;i<3;i++)part(hand,boxGeo,0x4a4a39,[side*(i-1)*.026,-.075,.048],[.013,.05,.012]);
  arms.push(arm);elbows.push(elbow);hands.push(hand);
 }
 // The Wayfarer Loom is built around Iri's left forearm, not a floating ring.
 const loom=new T.Group();loom.position.set(0,-.13,0);elbows[0].add(loom);
 band(loom,copper,[0,0,0],[.115,.26,.11]);
 band(loom,ceramic,[0,0,0],[.12,.17,.114]);
 for(const y of [-.105,.105])torus(loom,copper,[0,y,0],[.12,.12,.12],[Math.PI/2,0,0],.7);
 const loomGlass=oval(loom,teal,[-.11,0,.035],[.055,.09,.07],.22,.45);
 loomGlass.material=loomGlass.material.clone();loomGlass.userData.dynamicMaterial=true;
 torus(loom,copper,[-.135,0,.035],[.105,.105,.105],[0,Math.PI/2,0],.6);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;oval(loom,teal,[-.145,Math.cos(a)*.08,.035+Math.sin(a)*.08],[.018,.018,.018],.15,.5);}
 // The rucksack is rounded leather with straps, repair pockets and a bedroll.
 const pack=new T.Group();pack.position.set(0,.37,-.255);torso.add(pack);
 oval(pack,leather,[0,0,0],[.235,.29,.125]);
 oval(pack,0x88704e,[0,.15,-.06],[.24,.17,.11]);
 for(const side of [-1,1]){
  part(pack,boxGeo,0x473f30,[side*.13,-.03,-.126],[.042,.37,.022]);
  part(pack,boxGeo,copper,[side*.13,.04,-.143],[.06,.065,.014],.5);
  oval(pack,0x8c7955,[side*.215,-.1,.005],[.092,.13,.09]);
 }
 const roll=part(pack,new T.CylinderGeometry(.115,.115,.55,18),0xa4afa0,[0,.285,0],[1,1,1]);roll.rotation.z=Math.PI/2;
 for(const x of [-.19,.19])torus(pack,leather,[x,.285,0],[.119,.119,.119],[0,Math.PI/2,0],.1);
 link(pack,copper,[.23,-.04,-.03],[.29,.29,-.025],.023,.023);
 // Collar and scarf are separate surfaces, with reactive tails on the back.
 band(torso,accent,[0,.65,.005],[.18,.115,.15]);
 const scarfKnot=oval(torso,accent,[.135,.65,.115],[.085,.075,.08]);
 const scarfTails=[];
 for(const [i,w,l] of [[0,.16,.64],[1,.12,.45]]){const tail=clothStrip(accent,w,l,8);tail.position.set(.11-i*.17,.65,-.16);tail.rotation.x=.38;tail.rotation.z=i?.1:-.1;torso.add(tail);scarfTails.push(tail);}
 // Sculpted face: jaw and cheek volumes, quiet eyes, brows, ear folds and nose.
 const head=new T.Group();head.position.set(0,.73,0);torso.add(head);
 const skull=new T.SphereGeometry(1,24,18);const pos=skull.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const jaw=y<-.1?1-(Math.abs(y+.1)*.16):1;pos.setXYZ(i,x*.226*jaw,y*.275,z*.212*(y<-.5?.91:1));}skull.computeVertexNormals();
 part(head,skull,skin,[0,.155,.005],[1,1,1]);
 oval(head,skinShadow,[0,-.04,.015],[.11,.13,.11]);
 for(const side of [-1,1]){
  oval(head,skin,[side*.224,.16,.005],[.05,.083,.035]);oval(head,skinShadow,[side*.25,.16,.025],[.015,.044,.018]);
  oval(head,skin,[side*.127,.09,.149],[.072,.07,.044]);
  // Dark upper eye shapes keep the expression readable without toy-like dots.
  const eye=oval(head,0x36443e,[side*.087,.185,.193],[.051,.021,.013]);eye.rotation.z=side*-.04;
  oval(head,0xe8d6b0,[side*.086,.183,.202],[.034,.011,.006]);
  oval(head,0x3d5b52,[side*.082,.183,.207],[.012,.012,.007]);
  const brow=oval(head,hair,[side*.084,.227,.185],[.052,.011,.013]);brow.rotation.z=side*-.08;
 }
 oval(head,skin,[0,.13,.213],[.038,.062,.046]);oval(head,skinShadow,[0,.104,.242],[.04,.025,.019]);
 const mouth=oval(head,0x9e725b,[0,.035,.198],[.048,.008,.008]);
 oval(head,0xd8af86,[0,.01,.167],[.065,.03,.025]);
 // A swept, layered crop has shaped strands rather than a faceted sphere cap.
 const hairCap=new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI*.61);part(head,hairCap,hair,[0,.195,-.01],[.239,.278,.223]);
 for(let i=0;i<8;i++){
  const x=(i-3.5)*.052;const strand=oval(head,i%2?0x454a3f:hair,[x,.35-Math.abs(x)*.22,.086],[.07,.105,.13]);strand.rotation.z=-.5;strand.rotation.x=.32;strand.rotation.y=-.25;
 }
 for(const side of [-1,1])oval(head,hair,[side*.203,.22,-.07],[.036,.12,.12]);
 // A brass goggle band rests on the head, leaving the face visible.
 torus(head,leather,[0,.33,0],[.235,.225,.235],[Math.PI/2,0,0],.05);
 for(const x of [-.078,.078]){
  const lens=new T.Group();lens.position.set(x,.346,.167);lens.rotation.x=-.44;head.add(lens);
  torus(lens,copper,[0,0,0],[.061,.056,.061],[0,0,0],.65);
  oval(lens,0x78a09a,[0,0,0],[.05,.046,.012],.3);
  oval(lens,0xc7dfcc,[-.014,.012,.012],[.014,.005,.006],.2);
 }
 // Dependable mechanic's short blade. Hand socket is animated by the controller.
 const blade=new T.Group();blade.position.set(0,-.085,.075);hands[1].add(blade);
 const bladeGeo=new T.BufferGeometry();bladeGeo.setAttribute('position',new T.Float32BufferAttribute([-.055,0,0,.055,0,0,.058,.62,0,0,.78,0,-.058,.62,0,0,.34,.035,0,.34,-.035],3));bladeGeo.setIndex([0,1,5,1,2,5,2,3,5,3,4,5,4,0,5,1,0,6,2,1,6,3,2,6,4,3,6,0,4,6]);bladeGeo.computeVertexNormals();part(blade,bladeGeo,0xc9dbce,[0,.1,0],[1,1,1],.65);
 oval(blade,copper,[0,.085,0],[.125,.024,.06],.6);part(blade,cylinderGeo,leather,[0,-.055,0],[.037,.2,.037]);
 oval(blade,copper,[0,-.17,0],[.045,.025,.045],.6);
 blade.rotation.x=Math.PI;blade.visible=false;
 // A sheathed tool at the right hip is always available when the blade is away.
 const sheath=new T.Group();sheath.position.set(.27,.08,-.015);sheath.rotation.z=-.15;torso.add(sheath);
 oval(sheath,leather,[0,-.22,0],[.058,.31,.055]);band(sheath,copper,[0,.07,0],[.072,.035,.07]);
 part(sheath,cylinderGeo,0x7b6748,[0,.18,0],[.034,.2,.034]);oval(sheath,copper,[0,.29,0],[.045,.025,.045],.5);
 combineDecorations(group);
 group.userData={visual,torso,head,pelvis,arms,legs,knees,elbows,hands,feet,pack,blade,sheath,loom,loomGlass,scarfTails,coatPanels,body:torso,animation:{gait:0,blend:0,land:0,lastGrounded:true,lean:0}};
 updateCharacter(group,{time:0,speed:0,grounded:true,dt:1/60});
 return group;
}

function animateCloth(mesh,time,speed,phase,reduced){const p=mesh.geometry.attributes.position,b=mesh.userData.base;for(let i=0;i<p.count;i++){const f=(Math.floor(i/3))/(p.count/3-1);const a=reduced?0:Math.sin(time*3.1+f*4+phase)*f*(.012+speed*.004);p.setXYZ(i,b[i*3]+a,b[i*3+1],b[i*3+2]-(.05+speed*.012)*f*f+Math.sin(time*2.7+f*6+phase)*f*.014*(reduced?0:1));}p.needsUpdate=true;mesh.geometry.computeVertexNormals();}

export function updateCharacter(group,state={}){
 const d=group.userData;if(!d.visual)return;const dt=Math.min(state.dt??1/60,.05),time=state.time||0,speed=state.speed||0,grounded=state.grounded!==false,swim=!!state.swimming,glide=!!state.gliding,climb=!!state.climbing,block=!!state.blocking,attack=state.attack||0,heavy=!!state.heavy,reduced=!!state.reducedMotion;
 const anim=d.animation;const moving=grounded&&speed>.12&&!swim&&!state.riding;
 anim.blend=mix(anim.blend,moving?clamp(speed/4,0,1):0,1-Math.exp(-dt*12));
 if(moving)anim.gait+=dt*(speed>6?12:8.5)*clamp(speed/5,.15,1.4);
 if(grounded&&!anim.lastGrounded)anim.land=Math.min(.16,Math.abs(state.verticalSpeed||4)*.008);anim.lastGrounded=grounded;anim.land=mix(anim.land,0,1-Math.exp(-dt*14));
 const run=clamp((speed-5)/4,0,1),gait=anim.gait,blend=anim.blend;
 const bob=reduced?0:(Math.abs(Math.sin(gait))* .035+.008*Math.sin(time*1.8))*blend;
 d.visual.position.y=bob-anim.land;
 d.torso.rotation.x=mix(d.torso.rotation.x,glide?.12:swim?.72:climb?-.13:state.dodging?.45:run*.13,1-Math.exp(-dt*10));
 d.torso.rotation.z=reduced?0:Math.sin(gait)*.025*blend;
 d.torso.rotation.y=Math.sin(gait)*.035*blend;
 d.head.rotation.y=Math.sin(time*.37)*.035*(1-blend);d.head.rotation.x=glide?-.12:swim?-.48:Math.sin(time*.8)*.012;
 for(let i=0;i<2;i++){
  const phase=gait+i*Math.PI,step=Math.sin(phase),lift=Math.max(0,-Math.cos(phase));
  d.legs[i].rotation.x=swim?Math.sin(time*7+i*Math.PI)*.24:glide?.17+i*.06:climb?Math.sin(time*6+i*Math.PI)*.5:grounded?step*(.43+run*.3)*blend:-.24-(i===0?.3:0);
  d.legs[i].rotation.z=(i===0?.025:-.025)+(!grounded&&!glide?(i===0?-.03:.03):0);
  d.knees[i].rotation.x=swim?.28:glide?.25:climb?.65:grounded?lift*(.65+run*.25)*blend:.7+(i===0?.3:0);
  d.feet[i].rotation.x=grounded?-Math.max(0,step)*.12*blend:swim?.3:-.12;
  d.arms[i].rotation.x=glide?-2.67:swim?-1.1+Math.sin(time*5+i*Math.PI)*.6:climb?-2.2+Math.sin(time*6+i*Math.PI)*.45:-step*(.35+run*.32)*blend-.06;
  d.arms[i].rotation.z=glide?(i===0?-.43:.43):swim?(i===0?-.3:.3):(i===0?.09:-.09);
  d.elbows[i].rotation.x=glide?-.1:swim?-.35:climb?-.75:-.15-run*.55;
 }
 if(block){d.arms[0].rotation.x=-1.4;d.arms[0].rotation.z=-.3;d.elbows[0].rotation.x=-1.4;d.arms[1].rotation.x=-.65;d.elbows[1].rotation.x=-.7;}
 const striking=attack>0;
 d.blade.visible=striking||block;d.sheath.visible=!striking&&!block;
 if(striking){
  const duration=heavy?.65:.36,progress=clamp(1-attack/duration,0,1),swing=Math.sin(progress*Math.PI);
  d.torso.rotation.y=heavy?-.5+progress*.95:-.32+progress*.75;
  d.arms[1].rotation.x=-1.8+swing*2.4;d.arms[1].rotation.z=-.35+Math.cos(progress*Math.PI)*-.7;d.elbows[1].rotation.x=-.5+swing*.35;
  if(heavy){d.arms[0].rotation.x=-1.8+swing*1.8;d.elbows[0].rotation.x=-.6;d.arms[0].rotation.z=-.3;}
  d.blade.rotation.x=Math.PI-.7+progress*1.2;
 }else d.blade.rotation.x=Math.PI;
 d.pack.rotation.x=-d.torso.rotation.x*.25;
 d.loomGlass.material.emissiveIntensity=.25+(state.loom?.35:0)+Math.sin(time*2)*.08;
 d.scarfTails.forEach((m,i)=>animateCloth(m,time,speed,i*1.7,reduced));
 d.coatPanels.forEach((m,i)=>animateCloth(m,time,speed,i*2.7,reduced));
}

export function createSailcloth(){
 const group=new T.Group(),verts=[],uvs=[],indices=[],segments=12;
 // A shallow curved woven wing, with a copper leading edge and stitched panels.
 for(let j=0;j<=4;j++)for(let i=0;i<=segments;i++){
  const u=i/segments,v=j/4,x=(u-.5)*5.2,z=(v-.5)*2.25;
  const y=.46*(1-Math.pow((u-.5)*2,2))-.16*Math.pow((v-.4)*2,2);
  verts.push(x,y,z);uvs.push(u,v);
  if(j<4&&i<segments){const n=j*(segments+1)+i;indices.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
 const cloth=new T.Mesh(geo,new T.MeshStandardMaterial({color:0xdec493,side:T.DoubleSide,roughness:.95}));cloth.castShadow=true;cloth.userData.base=new Float32Array(verts);group.add(cloth);
 // Alternating teal stitched ribs are narrow enough to leave the woven wing light.
 for(let i=0;i<7;i++){const x=(i/6-.5)*5.2,y=.46*(1-Math.pow(x/2.6,2));link(group,i%2?0x668b7e:0x9e8153,[x,y-.08,-1.12],[x,y-.1,1.12],.015,.015);}
 link(group,0x9c7a4b,[-2.65,-.08,-1.1],[0,.37,-1.1],.035,.035);link(group,0x9c7a4b,[0,.37,-1.1],[2.65,-.08,-1.1],.035,.035);
 for(const s of [-1,1]){link(group,0x8f7952,[s*2.4,.02,.65],[s*.42,-.8,.28],.014,.014);link(group,0x8f7952,[s*2.4,.02,-.85],[s*.42,-.8,.28],.014,.014);}
 const emblem=torus(group,0x759e8a,[0,.48,.05],[.24,.24,.24],[Math.PI/2,0,0],.1);group.userData={cloth,emblem};return group;
}

export function updateSailcloth(sail,time,speed,reduced=false){const cloth=sail.userData.cloth;if(!cloth)return;const p=cloth.geometry.attributes.position,b=cloth.userData.base;for(let i=0;i<p.count;i++){const z=b[i*3+2];const wave=reduced?0:Math.sin(time*6+z*5+b[i*3]*.6)*.035*(z+1.2)/2.4;p.setY(i,b[i*3+1]+wave);}p.needsUpdate=true;sail.rotation.z=reduced?0:Math.sin(time*2)*.02;sail.rotation.x=.03+clamp(speed/10,0,1)*.05;}
