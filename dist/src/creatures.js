import * as T from '../vendor/three.module.js';
const materials=new Map();
const ellipsoid=new T.SphereGeometry(1,14,10);
const cylinder=new T.CylinderGeometry(1,1,1,12);
const plate=new T.BoxGeometry(1,1,1,1,1,1);
const torus=new T.TorusGeometry(1,.09,7,24);
function mat(color,metal=0,glow=0){const k=[color,metal,glow].join();if(!materials.has(k))materials.set(k,new T.MeshStandardMaterial({color,roughness:.7,metalness:metal,emissive:color,emissiveIntensity:glow}));return materials.get(k);}
function part(g,geo,color,x,y,z,sx,sy,sz,metal=0,glow=0){const m=new T.Mesh(geo,mat(color,metal,glow));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function limb(g,x,y,z,color,scale=1){const pivot=new T.Group();pivot.position.set(x,y,z);g.add(pivot);part(pivot,ellipsoid,color,0,-.22*scale,0,.12*scale,.34*scale,.14*scale);part(pivot,ellipsoid,0x414c42,0,-.49*scale,.08,.15*scale,.1*scale,.24*scale);return pivot;}
export function createScavenger(){
 const g=new T.Group(),body=new T.Group();g.add(body);
 part(body,ellipsoid,0x8b7553,0,.67,-.05,.53,.43,.75);
 part(body,ellipsoid,0xc6b488,0,.66,.38,.43,.36,.5);
 const head=new T.Group();head.position.set(0,1,.59);body.add(head);
 part(head,ellipsoid,0xb4a17a,0,0,0,.37,.31,.33);
 part(head,ellipsoid,0xd5c7a4,0,-.09,.28,.23,.16,.22);
 part(head,ellipsoid,0x424f46,0,-.035,.46,.13,.09,.07);
 for(const side of [-1,1]){
  const ear=part(head,ellipsoid,0x8d8061,side*.28,.29,-.05,.16,.31,.1);ear.rotation.z=-side*.4;
  const inner=part(head,ellipsoid,0xd0ab81,side*.28,.29,.025,.09,.2,.035);inner.rotation.z=-side*.4;
  part(head,ellipsoid,0x353e33,side*.23,.06,.23,.075,.085,.035);
  part(head,ellipsoid,0xf6d491,side*.23,.08,.254,.032,.04,.015,0,.4);
  const brow=part(head,ellipsoid,0x7f7555,side*.23,.15,.2,.12,.04,.06);brow.rotation.z=side*.25;
 }
 // A layered mineral carapace gives a distinctive, readable broad back.
 for(let i=0;i<5;i++){const z=-.55+i*.23;const p=part(body,ellipsoid,i%2?0x6c8674:0x849581,0,.98,z,.45-i*.025,.16,.23,.12);p.rotation.x=.18;}
 const legs=[];for(const x of [-.38,.38])for(const z of [-.47,.42])legs.push(limb(body,x,.58,z,0x736a4f));
 const tail=new T.Group();tail.position.set(0,.68,-.67);body.add(tail);const t=part(tail,ellipsoid,0x736b4e,0,.12,-.28,.1,.13,.4);t.rotation.x=.3;part(tail,ellipsoid,0xc1b58b,0,.24,-.52,.16,.18,.2);
 g.userData={body,head,legs,tail,type:'scavenger'};return g;
}
export function createSentinel(){
 const g=new T.Group(),body=new T.Group();g.add(body);
 part(body,ellipsoid,0x718c7e,0,1.42,0,.59,.64,.38,.25);
 part(body,ellipsoid,0xc4c4aa,0,1.57,.25,.47,.43,.2,.15);
 part(body,torus,0x9c8053,0,1.44,.45,.24,.24,.24,.6);
 part(body,ellipsoid,0x72dac3,0,1.44,.47,.13,.13,.07,.1,.8);
 part(body,cylinder,0x746f54,0,.95,0,.36,.23,.3,.45);
 const head=new T.Group();head.position.set(0,2.17,0);body.add(head);
 part(head,ellipsoid,0xd1cfb2,0,0,0,.38,.42,.33,.2);
 part(head,ellipsoid,0x3c6259,0,.02,.26,.31,.12,.1,.3);
 for(const s of [-1,1])part(head,ellipsoid,0xa6e6d3,s*.13,.03,.36,.065,.035,.02,0,1);
 const crest=part(head,ellipsoid,0xa38c5e,0,.43,-.02,.06,.27,.22,.4);crest.rotation.x=.3;
 const legs=[];for(const s of [-1,1]){
  const l=limb(body,s*.28,.92,0,0x7e9381,1.65);part(l,cylinder,0xc6c3a1,0,-.3,0,.16,.5,.17,.15);legs.push(l);
 }
 const arms=[];for(const s of [-1,1]){
  const arm=new T.Group();arm.position.set(s*.64,1.85,0);body.add(arm);part(arm,ellipsoid,0x8fa18b,0,-.16,0,.2,.34,.2,.15);part(arm,cylinder,0x667e6e,0,-.58,.06,.13,.6,.13,.25);part(arm,ellipsoid,0xd3ceb0,0,-.87,.12,.19,.19,.17,.2);arms.push(arm);
 }
 const shield=new T.Group();shield.position.set(-.1,-.54,.28);arms[0].add(shield);part(shield,ellipsoid,0x5c7f70,0,0,0,.48,.75,.16,.25);part(shield,torus,0xb09966,0,0,.1,.43,.67,.4,.55);part(shield,ellipsoid,0xc5c9a7,0,0,.2,.18,.32,.1,.2);
 const tool=new T.Group();tool.position.set(0,-.75,.15);arms[1].add(tool);part(tool,cylinder,0x7e6e48,0,.1,.17,.055,1.7,.055,.25);part(tool,ellipsoid,0x9cae9a,0,.9,.17,.34,.18,.14,.45);
 g.userData={body,head,legs,arms,tool,shield,type:'sentinel'};return g;
}
export function animateCreature(e,time,dt){
 const r=e.mesh.userData;if(!r.body)return;const moving=e.alert&&e.phase==='idle'&&e.stun<=0;const pace=time*(r.type==='scavenger'?8:4.5);
 r.body.position.y=Math.sin(time*2+e.home.x)*.025+(moving?Math.abs(Math.sin(pace))*.035:0);
 r.head.rotation.y=Math.sin(time*.7+e.home.z)*.06;
 for(let i=0;i<r.legs.length;i++)r.legs[i].rotation.x=moving?Math.sin(pace+(i%3===0?0:Math.PI))*.5:0;
 if(r.tail){r.tail.rotation.y=Math.sin(time*2.2)*.3;r.head.rotation.x=e.phase==='tell'?-.25:Math.sin(time)*.04;}
 if(r.arms){r.arms[0].rotation.x=e.phase==='tell'?-.65:-.25;r.arms[1].rotation.x=e.phase==='tell'?-2.7:e.phase==='recover'?-.15:Math.sin(pace)*.12;}
 r.body.rotation.z=e.stun>0?Math.sin(time*19)*.12:0;
}
