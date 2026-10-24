import {buildSkyLandscape} from './sky-landscape.js';
import {makeSkyTerrace,decorateSky} from './sky-art.js';
import * as T from '../vendor/three.module.js';
import {SKY_START,SKY_EXIT,SKY_PARTS,skyComplete,bindEquipment,grantGlider,REGIONAL_LEADS} from './journey-state.js';
const near=(p,x,y,z,r=3)=>Math.hypot(p.x-x,p.z-z)<r&&Math.abs(p.y-y)<3;
export class SkyJourney{
 constructor(g){this.g=g;this.transit=0;this.build();this.buildCloudSea();}
 build(){
  const g=this.g,w=g.world;this.group=new T.Group();g.scene.add(this.group);let active=this.group;const m=(kind,c,x,y,z,sx,sy,sz,e=0)=>w.mesh(kind,c,active,x,y,z,sx,sy,sz,e);
  const floor=(id,x,z,width,depth,y)=>makeSkyTerrace(w,this.group,id,x,z,width,depth,y);
  floor('sky-waking',-145,75,26,24,76);floor('sky-workshop',-145,41,26,26,76);
  // A real nine-pace gap: the panel in the marked bracket makes a walkable bridge.
  for(const z of [63,54])for(const x of [-148,-142])m('box',0x82bca6,x,76.1,z,.35,.4,2);
  for(const x of [-156,-134])for(const z of [84,66,51,30]){m('cylinder',0xc8d1ba,x,79,z,.45,6,.45);m('ring',0x8bbda8,x,82,z,1.5,1.5,1.5);}
  for(const [x,z]of [[-154,79],[-135,68],[-153,44]]){m('cylinder',0x63775d,x,76.4,z,1.3,.8,1.3);m('sphere',0x6a8966,x,77.2,z,1.5,.9,1.5);}
  this.guide=w.makeHuman(0xd7d9c5,0x6d9f96);this.guide.position.set(-149,76,80);this.group.add(this.guide);
  this.workbench=m('box',0xa48156,-173,76.7,92,3,1.4,2);m('sphere',0x9ee7d7,-173,77.7,92,.6,.8,.6,.7);
  this.seal=new T.Group();this.group.add(this.seal);for(let i=0;i<5;i++)w.mesh('box',0xb8ded1,this.seal,-149+i*2,78,43,1.7,4,.5,.3);
  this.seal.position.set(-28,0,45);
  this.riseGroup=new T.Group();this.riseGroup.position.set(30,12,55);this.group.add(this.riseGroup);active=this.riseGroup;
  w.riseSurfaces.push({id:'sky-maintenance-roof',x:-115,z:89,w:16,d:16,bottom:95.4,top:96});w.solids.push({id:'sky-maintenance-roof',x:-115,z:89,w:16,d:16,bottom:95.4,top:96});m('box',0xe1dac2,-145,83.7,34,16,.6,16);
  for(const x of [-152,-138])m('cylinder',0xc8cbb1,x,79.7,30,.4,7.4,.4);
  for(const r of [1.5,2.5,3.5]){const ring=m('ring',0x8bd4be,-145,83.35,37,r,r,r,.25);ring.rotation.x=Math.PI/2;}
  this.echoGroup=new T.Group();this.echoGroup.position.set(0,20,80);this.group.add(this.echoGroup);active=this.echoGroup;
  w.mesh('box',0xd9d7bd,active,-145,83.7,34,22,.6,20);w.solids.push({id:'echo-shrine-island',x:-145,z:114,w:22,d:20,top:104,bottom:103.4});
  w.riseSurfaces.push({id:'echo-shrine-island',x:-145,z:114,w:22,d:20,top:104,bottom:103.4});
  for(const x of [-151,-139]){m('box',0xa18151,x,87.5,34,.3,.3,4);m('cylinder',0xd2ccb1,x,86,32,.2,4,.2);}
  m('box',0x9c7c4d,-145,87.3,34,13,.14,.14);this.plate=m('box',0xe5b479,-145,84.03,34,3.8,.12,3.8,.15);
  m('cylinder',0x85bea8,-150,84.7,39,.4,1.4,.4);m('ring',0xe9c38b,-150,85.7,39,.6,.6,.6);
  active=this.group;
  m('cylinder',0x9da98b,-145,84.4,28,2,.8,2);this.exitRing=m('ring',0x9adbc8,-145,87,2,2.2,2.2,2.2,.35);
  this.carrier=new T.Group();g.scene.add(this.carrier);w.mesh('box',0xb68b55,this.carrier,0,0,0,5,.3,4);for(const x of [-2.2,2.2]){w.mesh('cylinder',0x72988a,this.carrier,x,1.5,0,.1,3,.1);w.mesh('box',0xded4b1,this.carrier,x,2.8,0,.15,1,4);}this.carrier.visible=false;
  this.cloth=w.mesh('box',0xe7be89,w.root,-12,10.7,93,1.5,.5,1);w.mesh('box',0x8f7352,w.root,8,10.7,100,2.4,1.4,1.6);w.mesh('box',0xe4d7ac,w.root,8,11.45,100,2,.07,1.3);
  w.interactables.push(
   {id:'forest-recall-east',type:'journey-forest-panel',x:-151,y:76,z:94,r:3,label:'Recall the forest crossing panel'},
   {id:'forest-recall-west',type:'journey-forest-panel',x:-173,y:76,z:98,r:3,label:'Recall the forest crossing panel'},
   {id:'sky-guide',type:'journey-guide',x:-149,y:76,z:80,r:3.5,label:'Speak with the keeper'},
   {id:'sky-reset-north',type:'journey-panel',x:-139,y:76,z:50,r:3,label:'Recall the bridge panel from this bank'},
   {id:'sky-reset',type:'journey-panel',x:-139,y:76,z:74,r:3,label:'Recall the bridge panel'},
   {id:'sky-forge',type:'journey-forge',x:-173,y:76,z:92,r:3,label:'Enter the equipment shrine workbench'},
   {id:'sky-memory',type:'journey-memory',x:-145,y:76,z:81,r:3,label:'Examine the fractured memory'},
   {id:'sky-courier-reset',type:'journey-courier',x:-150,y:104,z:119,r:3,label:'Reset the rewind shrine courier'},
   {id:'sky-depart',type:'journey-exit',x:-145,y:84,z:3,r:3,label:'Temple of Time · open the descent'},
   {id:'camp-cloth',type:'journey-cloth',x:-12,y:10,z:93,r:3,label:'Recover the weathercloth'},
   {id:'camp-map-station',type:'journey-map',x:8,y:10,z:100,r:3,label:'Read the regional reports'});
  decorateSky(g,this);buildSkyLandscape(g,this);
  for(let i=0;i<23;i++){const x=-136+i*.65,top=76+i*.4;w.mesh('box',0xd3d4ba,this.group,x,top-.2,86,1,.4,4);w.solids.push({id:'snow-route-'+i,x,z:86,w:1,d:4,top,bottom:top-.4});}
  for(const [id,y]of [['echo-lower-canopy',90]]){w.mesh('box',0xd9d9bd,this.group,-145,y-.3,117,8,.6,8);w.riseSurfaces.push({id,x:-145,z:117,w:8,d:8,top:y,bottom:y-.6});w.solids.push({id,x:-145,z:117,w:8,d:8,top:y,bottom:y-.6});for(const x of [-148,-142])w.mesh('cylinder',0xc5cbb4,this.group,x,(76+y)/2,120,.25,y-76,.25);}
  this.buildShrines();
  this.resetMark=m('ring',0x8edac1,-139,77,74,.8,.8,.8,.3);
 }
 buildShrines(){const w=this.g.world;this.shrines=[{id:'weave',x:-145,y:76,z:48,name:'Joining Shrine'},{id:'bind',x:-173,y:76,z:85,name:'Equipment Shrine'},{id:'rise',x:-115,y:96,z:89,name:'Ascent Shrine'},{id:'echo',x:-145,y:104,z:114,name:'Rewind Shrine'}];
  for(const s of this.shrines){for(const dx of [-2.4,2.4]){w.mesh('box',0x718e7a,this.group,s.x+dx,s.y+.3,s.z,1.2,.6,1.5);w.mesh('cylinder',0xd6d8bf,this.group,s.x+dx,s.y+2.3,s.z,.3,4,.3);}const arch=new T.Mesh(new T.TorusGeometry(2.4,.3,8,24,Math.PI),w.material(0xd4ddc3));arch.position.set(s.x,s.y+4.2,s.z);this.group.add(arch);s.light=w.mesh('sphere',0x8ce2c8,this.group,s.x,s.y+3,s.z,.35,.5,.35,.45);w.interactables.push({id:'shrine-'+s.id,type:'journey-shrine',trial:s.id,x:s.x,y:s.y,z:s.z,r:3,label:'Activate '+s.name});}
 }
 initialize(){const g=this.g,j=g.state.journey;if(j.stage==='descent'){j.stage='sky';this.move(SKY_EXIT);}this.transit=0;this.sync();}
 move(p){const g=this.g;g.releaseHeld(false);g.echo.reset();g.rise.cancel();g.loom=false;g.player.pos.set(p.x,p.y,p.z);g.player.vel.set(0,0,0);g.player.grounded=true;g.player.gliding=false;g.player.camInitialized=false;Object.assign(g.state.player,p);g.state.safe={...p};}
 buildCloudSea(){
  const g=this.g;this.cloudSea=new T.Mesh(new T.PlaneGeometry(1800,1800),new T.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`varying vec3 vWorld;uniform float time;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec2 p=vWorld.xz*.018+vec2(time*.006,0);float n=noise(p)*.6+noise(p*2.1)*.27+noise(p*4.3)*.13;vec3 c=mix(vec3(.67,.79,.81),vec3(.98,.96,.87),smoothstep(.18,.8,n));gl_FragColor=vec4(c,1.);}`,side:T.DoubleSide,depthWrite:true}));this.cloudSea.rotation.x=-Math.PI/2;this.cloudSea.position.set(-145,57,55);this.cloudSea.frustumCulled=false;g.scene.add(this.cloudSea);
  this.skyFog=new T.FogExp2(0xc5dadb,.0035);this.surfaceFog=g.scene.fog;
 }
 sync(){const g=this.g,s=g.state,j=s.journey,above=j.stage==='sky'||j.stage==='descent'&&this.transit<.72;this.group.visible=true;g.world.root.visible=!above;this.cloudSea.visible=above;this.cloudSea.material.uniforms.time.value=g.elapsed;g.scene.fog=above?this.skyFog:this.surfaceFog;if(this.above!==above){g.scene.background=new T.Color(above?0xc5dadb:0xa5bfbe);this.above=above;}
  for(const [id,mesh]of g.world.objectMeshes)if(id.startsWith('sky-')&&mesh.parent!==this.group)this.group.add(mesh);
  for(const slot of g.world.socketMeshes)if(slot.data.id==='sky-bridge'&&slot.group.parent!==this.group)this.group.add(slot.group);
  for(const e of g.enemies||[])e.mesh.visible=!above&&e.hp>0;
  this.cloth.visible=j.stage==='hub'&&!j.fabric;this.seal.visible=!j.bind;this.exitRing.material.emissiveIntensity=skyComplete(j)?.8:.1;
  const roof=g.world.riseSurfaces.find(s=>s.id==='sky-maintenance-roof');if(roof)roof.moving=j.stage!=='sky';
 }

 recover(){const j=this.g.state.journey;if(j.stage!=='sky')return false;this.move(j.rise?{x:-115,y:96,z:94}:j.weave?{x:-145,y:76,z:48}:SKY_START);this.g.state.player.hp=this.g.state.player.maxHp;this.g.state.player.stamina=this.g.state.player.maxStamina;this.g.player.invincible=1;this.g.toast('The keeper’s tether returns you to the last tutorial landing.');return true;}
 tick(dt){const g=this.g,j=g.state.journey,p=g.player.pos;this.sync();if(j.stage!=='sky')return;
  if(p.y<65){this.recover();return;}
  if(g.state.objects.some(o=>o.id==='sky-panel'&&o.socket==='sky-bridge'))j.weave=true;
  // The resonant barrier is a gameplay collider, even when approaching from the side.
  if(!j.bind&&near(p,-173,76,88,4)&&p.z<89){p.z=89;g.player.vel.z=Math.max(0,g.player.vel.z);}
  if(j.bind&&p.y>95&&near(p,-115,96,89,10)){j.rise=true;g.state.safe={x:p.x,y:96,z:p.z};}
  const courier=g.state.objects.find(o=>o.id==='sky-courier');if(courier&&j.rise&&!courier.driveStopped&&!courier.socket&&g.held?.id!==courier.id&&g.echo.playback?.id!==courier.id){const next={...courier,x:Math.min(-139,courier.x+dt*2)};if(!g.echo.blocked(courier,next))courier.x=next.x;}
  if(courier&&j.echoUsed&&!g.echo.playback&&Math.abs(courier.x+145)<1.5&&Math.abs(courier.z-114)<1.5&&Math.abs(courier.y-105.45)<.6&&!j.echo){j.echo=true;g.toast('Fourth trial complete · the descent cradle is ready.');g.audio.play('discover');g.save(false);}
  this.plate.material.emissiveIntensity=j.echo?.8:.15;for(const shrine of this.shrines)shrine.light.material.emissiveIntensity=j[shrine.id]?1:.2;
  const blade=g.player.mesh.userData.blade;if(blade&&!this.prism){this.prism=g.world.mesh('sphere',0x7ae9dc,blade,0,.38,.06,.1,.2,.08,.8);}if(this.prism)this.prism.visible=g.state.equipment.modifier==='prism';
 }
 hit(heavy){const g=this.g,j=g.state.journey;if(j.stage!=='sky'||j.bind||!near(g.player.pos,-173,76,88,5))return false;if(g.state.equipment.modifier!=='prism'){g.toast('The seal absorbs ordinary impacts. Combine one mossglass with your blade at the workbench.');g.audio.play('guard');return true;}j.bind=true;g.audio.play('hit');g.burst(new T.Vector3(-173,78,88),0xa4edda,18);g.toast('Resonant seal broken · the maintenance ceiling is ahead.');g.save(false);return true;}
 interact(o){const g=this.g,j=g.state.journey;if(!o.type.startsWith('journey-'))return false;
  if(o.type==='journey-shrine'){const id='sky-shrine-'+o.trial;if(!j[o.trial]){g.toast('Complete this shrine’s ability trial before activating its seal.');return true;}if(!g.state.collected.includes(id)){if(g.state.inventory.glass>998){g.toast('Make room for one mossglass first.');return true;}g.state.collected.push(id);g.state.inventory.glass++;g.audio.play('discover');g.save(false);g.toast('Shrine seal recorded · +1 mossglass');}else g.toast('This shrine is complete.');return true;}
  if(o.type==='journey-guide')g.ui.talk([['The Interval Keeper','Great Sky Island · local layout study'],['Your companion fell through the break beneath the castle. The brace caught you here. I can mend its four functions; I cannot tell you where she landed.','Fit the panel into the crossing bracket. At the workbench in the southwest forest, bind a prism to your blade and break the seal. The eastern snowy island holds the ascent shrine. Rise twice through the southern overhangs to reach the high rewind island. Activate the four shrine seals, then return to the temple.','The cradle will carry you down when all four systems answer. Your supplies and lost parts can be recovered here.']]);
  if(o.type==='journey-memory')g.ui.talk([['Before the fall','A fractured recollection'],['Beneath Hyrule Castle, Eda brushed dust from a mural. A figure bound in mineral threads opened its eyes. The floor broke between you.','You reached for her wrist. The old brace reached first—and caught only you. The memory ends at the moment her hand leaves yours.']],()=>{j.mural=true;g.save(false);});
  if(o.type==='journey-forest-panel')this.resetPart('sky-forest-panel');
  if(o.type==='journey-panel')this.resetPart('sky-panel');
  if(o.type==='journey-forge'){if(!g.state.equipment.modifier&&g.state.inventory.glass===0)g.state.inventory.glass=1;g.ui.talk([['Prism workbench','Bind · equipment combination'],['One mossglass fitted to the mechanic’s blade adds one damage and lets its strikes break resonant seals. The workbench replaces a missing tutorial prism.','Open the satchel to combine the material. The seal across the northern passage must be struck with the finished tool.']],()=>g.ui.openBook('inventory'));}
  if(o.type==='journey-courier')this.resetPart('sky-courier');
  if(o.type==='journey-exit'){if(!skyComplete(j)||this.shrines.some(s=>!g.state.collected.includes('sky-shrine-'+s.id))){g.toast('Activate all four shrine seals after completing their trials. Check the journal for your next step.');return true;}this.depart();}
  if(o.type==='journey-cloth'){if(j.stage!=='hub'){g.toast('This belongs to the surface camp.');return true;}if(!j.fabric){j.fabric=true;g.audio.play('pickup');g.toast('Weathercloth recovered. Return to Sella to fit your glider.');g.save(false);}else g.toast('Weathercloth already recovered.');}
  if(o.type==='journey-map'){if(!j.glider){g.toast('Speak with Sella and fit your glider first.');return true;}g.ui.talk([['Four regional reports','Future routes · not yet playable'],REGIONAL_LEADS.map(r=>r.name+': '+r.detail+' This route is still under construction.')]);}
  return true;
 }
 resetPart(id){const g=this.g,part={...SKY_PARTS.find(o=>o.id===id)};if(id==='sky-panel'&&g.player.pos.z<60)part.z=50;if(id==='sky-forest-panel'&&g.player.pos.x<-164)part.x=-174;g.echo.cancel();g.releaseHeld(false);let live=g.state.objects.find(o=>o.id===id);if(!live){if(g.state.objects.length>=24){g.toast('Free one component slot before recalling this part.');return;}live={...part};g.state.objects.push(live);}if(g.echo.blocked(live,part)){g.toast('Step away from the part’s starting plinth, then recall it.');return;}Object.assign(live,part);g.echo.history.clear(id);g.toast(part.kind==='panel'?'Panel recalled. Select Threadbind, lift it, approach the gap and place it in the marked bracket.':'Courier reset. Select Echo; let it pass the central plate, confirm, then cancel as it returns over the plate.');}
 depart(){const g=this.g;g.echo.cancel();g.rise.cancel();g.releaseHeld(false);g.loom=false;g.state.journey.stage='descent';this.transit=0;g.ui.play();g.caption('The wind cradle descends toward the central fields. Steer with movement; interact to land.');}
 updateTransit(dt){const g=this.g;this.sync();if(g.state.journey.stage!=='descent'||g.mode!=='journeyTransit'){this.carrier.visible=false;return;}this.transit=Math.min(1,this.transit+dt/9);const t=this.transit,e=t*t*(3-2*t),a=g.input.axes();g.player.pos.set(-145+133*e+a.x*5*Math.sin(Math.PI*t),84-74*e,3+107*e);g.player.vel.set(0,0,0);g.player.mesh.position.copy(g.player.pos);this.carrier.position.copy(g.player.pos).add(new T.Vector3(0,-.25,0));this.carrier.visible=true;g.prompt={text:'Wind cradle · steer the descent',key:g.input.label('interact'),sub:'Finish the landing · '+Math.round(t*100)+'%'};if(t===1)this.land();}
 land(){const g=this.g;g.state.journey.stage='hub';this.carrier.visible=false;this.move({x:-12,y:10,z:110});g.ui.play();g.toast('Surface camp reached. Find Sella; she can fit a sailcloth for free exploration.');g.save(false);}
 sella(){const g=this.g,j=g.state.journey;if(j.stage!=='hub'||j.glider)return false;if(!j.fabric)g.ui.talk([['Sella Venn','Central Hyrule · expedition camp'],['You came down in a maintenance basket? Next time, bring the instruction plate. I could use the laugh.','A scout left weathercloth in the supply bundle west of camp. Bring it here and I’ll fit you a proper glider. Then we can talk about the four regional reports.']],()=>{g.state.facts.metSella=true;g.save(false);});else g.ui.talk([['Sella Venn','A way to choose your own landing'],['This weave is sound. Hold the brace steady. There: spread the sailcloth after a jump, and watch your stamina.','Hebra, Eldin, Lanayru and the desert have each sent a distress report. The map station records them. Those routes are not built in this prototype yet; Bellwether’s basin remains open to explore.']],()=>{grantGlider(g.state);g.state.facts.metSella=true;g.audio.play('discover');g.save(false);g.toast('Glider fitted · map reports unlocked · opening-to-hub journey complete.');});return true;}
}
