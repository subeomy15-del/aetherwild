import * as T from '../vendor/three.module.js';
import {World} from './world.js';
import {Player} from './player.js';
import {Input} from './input.js';
import {AudioSystem} from './audio.js';
import {UI} from './ui.js';
import {freshState,clone,SaveStore,loadSettings,applyFact,discover,transact,makeBlueprint,reconstruct} from './core.js';
import {START,INITIAL_OBJECTS,ENEMIES,SOCKETS,LOCATIONS,COMPONENTS,DIALOGUE,heightAt,WATER,clamp,distance} from './data.js';

class Game{
 constructor(){
  this.canvas=document.querySelector('#game');this.settings=loadSettings(localStorage);this.state=freshState();this.saves=new SaveStore(localStorage);this.mode='title';this.started=false;this.elapsed=0;this.autosave=0;this.loom=false;this.held=null;this.selected=null;this.undo=[];this.prompt=null;this.effects=[];this.debug=false;this.region='Reedwake Camp';this.frameTimes=[];this.lastStage=0;this.reach=9;
  this.renderer=new T.WebGLRenderer({canvas:this.canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(innerWidth,innerHeight);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.17;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.scene=new T.Scene();this.scene.fog=new T.FogExp2(0xc6d2ba,.0036);this.camera=new T.PerspectiveCamera(57,innerWidth/innerHeight,.12,1050);
  this.scene.add(new T.HemisphereLight(0xf4edd3,0x5c8166,2.1));
  this.sun=new T.DirectionalLight(0xffe6b6,2.7);this.sun.position.set(-70,130,70);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);Object.assign(this.sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:.5,far:250});this.sun.shadow.bias=-.0008;this.sun.shadow.normalBias=.06;this.scene.add(this.sun);this.scene.add(this.sun.target);
  this.world=new World(this.scene);this.input=new Input(this.canvas,this.settings);this.audio=new AudioSystem(this.settings);this.player=new Player(this);this.ui=new UI(this);this.audio.caption=text=>this.caption(text);
  this.ray=new T.Raycaster();this.forward=new T.Vector3();this.aim=new T.Vector3();this.outline=new T.BoxHelper(new T.Object3D(),0xa2e6c7);this.outline.visible=false;this.scene.add(this.outline);
  this.makeEnemies();this.world.sync(this.state);this.applySettings();this.ui.title();this.player.mesh.visible=false;
  window.addEventListener('resize',()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);});
  window.addEventListener('blur',()=>{if(this.mode==='play')this.ui.openBook('pause');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.started){this.save(false);if(this.mode==='play')this.ui.openBook('pause');}});
  this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.save(false);this.toast('Graphics context interrupted. Your safe progress was saved; reload to recover.');});
  window.addEventListener('beforeunload',()=>{if(this.started)this.save(false);});
  this.lastFrame=performance.now();requestAnimationFrame(t=>this.frame(t));
  window.__aetherwild=this;
 }
 applySettings(){
  localStorage.setItem('aetherwild.settings',JSON.stringify(this.settings));document.documentElement.style.fontSize=16*this.settings.textScale+'px';document.body.classList.toggle('high-contrast',this.settings.highContrast);document.body.classList.toggle('reduced-motion',this.settings.reducedMotion);this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.settings.quality==='low'?1:1.5));this.renderer.shadowMap.enabled=this.settings.quality!=='low';this.audio?.apply();
 }
 newGame(){
  if(this.started)this.releaseHeld(false);this.state=freshState();
  for(const o of this.state.objects)if(o.kind!=='raft')o.y=Math.max(o.y,heightAt(o.x,o.z)+COMPONENTS[o.kind].size[1]/2+.06);
  this.begin();this.toast('Welcome to Reedwake. WASD to move · mouse to look · E to speak.');this.toast('Space to jump. Press Space again in the air to open your sailcloth.');
 }
 begin(){this.started=true;this.loom=false;this.held=null;this.selected=null;this.undo=[];this.autosave=0;this.player.load(this.state);this.makeEnemies();this.world.sync(this.state);this.audio.start();this.ui.play();this.save(false);}
 loadGame(){const state=this.saves.load();if(!state){this.toast('No valid save was found. Begin a new expedition.');return;}this.state=state;this.begin();this.toast(this.saves.error||'Expedition restored.');}
 save(notify=false){
  if(!this.started)return false;
  if(this.held)this.releaseHeld(false);
  const snap=clone(this.state);const threatened=this.enemies.some(e=>e.hp>0&&e.alert&&distance(e,this.player.pos)<18);
  if(!this.player.grounded||this.player.swimming||threatened||snap.player.hp<=0){Object.assign(snap.player,snap.safe);snap.player.hp=Math.max(2,snap.player.hp);}
  try{this.saves.write(snap);this.state.saveTime=snap.saveTime;if(notify)this.toast('Expedition saved. A verified backup is kept.');return true;}catch(e){this.toast('Could not save: '+e.message);return false;}
 }
 toast(text){this.ui?.toast(text);}
 caption(text){if(!this.settings.subtitles)return;const el=document.querySelector('#caption');el.textContent=text;el.style.display='block';clearTimeout(this.captionTimer);this.captionTimer=setTimeout(()=>el.style.display='none',3500);}
 guide(){this.ui.talk(DIALOGUE.loom);}
 heal(){if(this.state.player.hp>=this.state.player.maxHp){this.toast('You are already feeling well.');return;}if(!transact(this.state.inventory,{broth:-1})){this.toast('No broth left. Rest and prepare some at camp.');return;}this.state.player.hp=Math.min(this.state.player.maxHp,this.state.player.hp+3);this.audio.play('pickup');this.toast('Warm reedroot broth · +3 health');}
 respawn(died=true){
  this.releaseHeld(false);this.player.load({...this.state,player:{...this.state.player,...this.state.safe}});Object.assign(this.state.player,this.state.safe);this.state.player.hp=this.state.player.maxHp;this.state.player.stamina=this.state.player.maxStamina;this.player.invincible=3;
  for(const e of this.enemies){e.alert=false;e.phase='idle';e.x=e.home.x;e.z=e.home.z;e.mesh.position.set(e.x,heightAt(e.x,e.z),e.z);}
  this.toast(died?'A thread, unbroken. Your discoveries are safe.':'Recovered to your last safe ground.');
 }
 travel(id){
  if(this.enemies.some(e=>e.hp>0&&e.alert&&distance(e,this.player.pos)<18)){this.toast('Find quiet ground before using a beacon.');return;}
  if(this.player.riding){this.toast('Dismount before beacon travel.');return;}
  this.releaseHeld(false);const p=id==='reedwake'?{x:11,y:10,z:105}:{x:18,y:heightAt(18,-85),z:-85};this.player.pos.set(p.x,p.y,p.z);this.player.vel.set(0,0,0);this.player.camInitialized=false;this.state.safe={...p};Object.assign(this.state.player,p);this.state.player.stamina=this.state.player.maxStamina;this.ui.play();this.save(false);this.audio.play('discover');
 }
 handleInput(){
  const i=this.input;
  if(i.code('Backquote'))this.debug=!this.debug;
  if(this.mode!=='play'){
   if(i.hit('pause')){if(this.mode==='dialogue')this.ui.next();else if(this.started)this.ui.play();else this.ui.title();}
   else if(i.hit('interact')||i.hit('jump')){if(this.mode==='dialogue'){const d=this.ui.dialogue;if(d?.choices&&d.index===d.lines.length-1)document.activeElement?.click();else this.ui.next();}else if(i.device==='gamepad')document.activeElement?.click();}
   if(i.device==='gamepad'){
    const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected);const y=pad?.axes[1]||0;
    if(Math.abs(y)>.6&&this.elapsed-(this.lastMenuMove||0)>.24){this.lastMenuMove=this.elapsed;const els=Array.from(this.ui.overlay.querySelectorAll('button:not(:disabled),input,select'));const ix=els.indexOf(document.activeElement);els[(ix+(y>0?1:-1)+els.length)%els.length]?.focus();}
   }
   return;
  }
  if(i.hit('pause')){this.releaseHeld(false);this.ui.openBook('pause');return;}
  for(const[a,t]of [['inventory','inventory'],['journal','journal'],['map','map']])if(i.hit(a)){this.releaseHeld(false);this.ui.openBook(t);return;}
  if(i.hit('ability')){if(this.held)this.releaseHeld(false);this.loom=!this.loom;this.audio.play('attach');}
  if(this.loom){if(i.hit('rotate')&&this.held){this.held.rot+=Math.PI/2;this.audio.play('menu');}if(i.hit('undo'))this.undoConstruction();if(i.hit('detach')&&this.selected)this.detach(this.selected);if(i.hit('interact')){if(this.held)this.placeHeld();else if(this.selected)this.pickupObject(this.selected);else this.toast('Look toward a teal-marked panel, weight or raft.');}}
  else if(i.hit('interact')&&this.interaction)this.interact(this.interaction);
 }
 frame(now){
  const raw=(now-this.lastFrame)/1000;this.lastFrame=now;const dt=Math.min(raw,.04);this.elapsed+=dt;this.input.update();this.handleInput();
  if(this.mode==='play'){
   this.player.update(dt);this.updateConstruction(dt);this.updateEnemies(dt);this.world.update(dt,this.state);this.world.sync(this.state,this.held?.id);this.findInteraction();this.discoverPlaces();this.state.playtime+=dt;this.autosave+=dt;
   if(this.autosave>45&&this.player.grounded&&!this.held&&!this.enemies.some(e=>e.alert&&e.hp>0)){this.autosave=0;this.save(false);}
  }else{this.world.update(dt,this.state);this.world.sync(this.state,this.held?.id);this.prompt=null;}
  this.updateEffects(dt);this.player.camera(dt,!this.started);this.player.mesh.visible=this.started&&(this.player.invincible<=0||Math.floor(this.player.invincible*16)%2===0||this.player.dodgeTime>0);
  const p=this.player.pos;this.sun.position.set(p.x-70,130,p.z+70);this.sun.target.position.set(p.x,0,p.z);this.sun.target.updateMatrixWorld();
  this.ui.update(dt);this.audio.update(dt,this.mode==='play',this.region.includes('Hollow')?'hollow':'surface');this.renderer.render(this.scene,this.camera);this.input.endFrame();
  this.frameTimes.push(raw*1000);if(this.frameTimes.length>90)this.frameTimes.shift();const debug=document.querySelector('#debug');debug.hidden=!this.debug;if(this.debug){const ms=this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length;debug.textContent=`AETHERWILD · v0.1\n${(1000/ms).toFixed(0)} fps · ${ms.toFixed(1)} ms\nDraw calls ${this.renderer.info.render.calls} · Triangles ${this.renderer.info.render.triangles}\nComponents ${this.state.objects.length}/24 · Active enemies ${this.enemies.filter(e=>e.hp>0&&e.alert).length}/3\nKinematic simulation · No dynamic joints\nGeometry ${this.renderer.info.memory.geometries} · Textures ${this.renderer.info.memory.textures}\n${this.region}\n${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)} · ${this.player.swimming?'swim':this.player.gliding?'sail':this.player.grounded?'ground':'air'}\nSave ${JSON.stringify(this.state).length} bytes · Held ${this.held?.id||'none'}\nBackquote toggles this overlay`;}
  requestAnimationFrame(t=>this.frame(t));
 }
 discoverPlaces(){
  for(const l of LOCATIONS)if(distance(l,this.player.pos)<l.r){this.region=l.name;if(discover(this.state,l.id)){this.audio.play('discover');this.ui.reveal(l);if(l.id==='bellwether')this.toast('The cradle needs a heavy ceramic weight. Marked objects respond to Threadbind.');}}
 }
 findInteraction(){
  if(this.loom)return;
  this.interaction=null;this.prompt=null;let best=999;
  for(const o of this.world.interactables){if(o.type==='pickup'&&this.state.collected.includes(o.id))continue;const d=distance(o,this.player.pos);if(d<o.r&&Math.abs(o.y-this.player.pos.y)<4&&d<best){best=d;this.interaction=o;}}
  if(!this.interaction){for(const o of this.state.objects)if(o.kind==='raft'&&distance(o,this.player.pos)<4&&!this.player.riding){this.interaction={type:'raft',data:o,label:'Board the reedwake raft'};break;}}
  if(this.interaction)this.prompt={text:this.interaction.label};
  if(this.player.riding)this.prompt={text:'Dismount raft',key:this.input.label('jump'),sub:'WASD / left stick to sail · shallow banks stop the hull'};
 }
 interact(o){
  if(o.type==='npc'){
   if(this.state.facts.route&&!this.state.facts.rewarded){const type=this.state.facts.route==='roots'?'root':'old';this.ui.talk(DIALOGUE[type],()=>{applyFact(this.state,'rewarded');this.save(false);this.ui.ending();this.audio.play('discover');});}
   else if(this.state.facts.rewarded)this.ui.talk(DIALOGUE.complete);
   else if(!this.state.facts.metSella)this.ui.talk(DIALOGUE.intro,()=>{applyFact(this.state,'metSella');this.save(false);this.toast('Journal updated · Reach Bellwether Intake.');});
   else this.ui.talk(DIALOGUE.progress);
  }
  if(o.type==='guide')this.guide();
  if(o.type==='camp'){
   this.state.player.hp=this.state.player.maxHp;this.state.player.stamina=this.state.player.maxStamina;
   if(this.state.inventory.broth<5&&transact(this.state.inventory,{fiber:-1,broth:1}))this.toast('Field recipe recorded: woven reed fiber → warming reedroot broth.');
   else this.toast('Rested at the fire. Health and stamina restored.');this.state.safe={x:4,y:10,z:106};this.audio.play('pickup');this.save(false);
  }
  if(o.type==='beacon'){this.state.safe={x:11,y:10,z:105};this.save(true);this.audio.play('discover');}
  if(o.type==='northBeacon'){this.state.safe={x:18,y:heightAt(18,-85),z:-85};discover(this.state,'bellwether');this.save(true);this.audio.play('discover');}
  if(o.type==='pickup'){const p=o.data;if(transact(this.state.inventory,{[p.kind]:p.count})){this.state.collected.push(p.id);this.audio.play('pickup');this.toast(`+${p.count} ${p.kind==='glass'?'mossglass':p.kind==='broth'?'reedroot broth':p.kind+' salvage'}`);}}
  if(o.type==='resetCrossing'){this.resetObjects(['panel-a','panel-b']);this.toast('The crossing winch recalls both marked panels.');}
  if(o.type==='resetWeight'){this.resetObjects(['weight-a']);this.toast('The counterweight returns to its cradle-side rest.');}
  if(o.type==='plate')this.ui.talk([['Counterweight cradle','Bellwether Intake'],['A worn engraving: “A weight at rest gives the water room to move.” The cradle accepts the marked ceramic weight.','Use Threadbind [Q] to lift the weight beside the right-hand winch, then move it to this teal cradle. The iris stays open once balanced.']]);
  if(o.type==='regulator'){
   if(!this.state.facts.intakeOpen){this.ui.talk([['The silent regulator','Bellwether Intake'],['The regulator is locked to the intake’s safety iris. The teal counterweight cradle at the southern entrance is empty.','A ceramic weight rests beside the right-hand winch. Set it on the marked cradle with Threadbind. If it is lost, the winch will recall it.']]);return;}
   if(this.state.facts.route){this.ui.talk([['Weather regulator','Route established'],[this.state.facts.route==='roots'?'Water now feeds the luminous hollow. The bell has learned a new note.':'Water now follows the old surface channels. The trade road will dry.','Bring the recovered regulator to Sella at Reedwake Camp.']]);return;}
   this.ui.talk(DIALOGUE.record,choice=>{applyFact(this.state,'route',choice);this.world.sync(this.state);this.audio.play('bell');this.burst(new T.Vector3(0,24,-109),0xb5ead0,16);this.toast('Regulator recovered. Return to Sella — or travel to Reedwake from the map.');this.save(false);},[{id:'roots',title:'Open the root spillway',desc:'Sustain the new luminous ecosystem. The old road stays flooded.'},{id:'channels',title:'Restore the surface channels',desc:'Drain the trade road. The luminous hollow will lose its water.'}]);
  }
  if(o.type==='hollow')this.ui.talk(DIALOGUE.hollow);
  if(o.type==='bluff')this.ui.talk(DIALOGUE.bluff);
  if(o.type==='ruinNote')this.ui.talk([['A salvager’s warning','Scratched into a ceramic plate'],['“They aren’t guarding the ruins. They’re guarding their lunch. If one crouches and rattles, step aside before it springs.”','“The big one up the road has a shield. Wait for it to strike, then hit the gap. A timed guard will shake it loose.”']]);
  if(o.type==='raft'){this.player.riding=o.data.id;this.player.gliding=false;this.toast('Raft boarded. Move to sail · jump to dismount.');}
 }
 updateConstruction(){
  this.outline.visible=false;this.selected=null;if(!this.loom){return;}
  this.prompt=null;
  if(this.held){
   const o=this.held,def=COMPONENTS[o.kind];this.reach=clamp(this.reach+this.input.mouse.wheel*.7,4,16);const dir=new T.Vector3(-Math.sin(this.player.yaw),0,-Math.cos(this.player.yaw));const candidate=this.player.pos.clone().addScaledVector(dir,this.reach);const ground=this.world.surfaceAt(candidate.x,candidate.z,this.player.pos.y+4,this.state,o.id).height;
   this.preview={x:candidate.x,z:candidate.z,y:o.kind==='raft'&&ground<WATER?WATER+.42:ground+def.size[1]/2+.05,rot:o.rot,socket:null};
   let socket=SOCKETS.filter(s=>s.kind===o.kind&&!this.state.objects.some(v=>v.id!==o.id&&v.socket===s.id)&&Math.hypot(s.x-candidate.x,s.z-candidate.z)<7).sort((a,b)=>distance(a,candidate)-distance(b,candidate))[0];
   const angle=Math.abs(Math.sin(o.rot-(socket?.rot||0)));
   if(socket&&angle<.15){Object.assign(this.preview,{x:socket.x,y:socket.y,z:socket.z,rot:socket.rot,socket:socket.id});}
   const valid=Math.abs(this.preview.x)<181&&Math.abs(this.preview.z)<181&&!this.world.obstacleAt(this.preview.x,this.preview.z,this.preview.y);
   this.preview.valid=valid;const mesh=this.world.objectMeshes.get(o.id);mesh.position.set(this.preview.x,this.preview.y,this.preview.z);mesh.rotation.y=this.preview.rot;
   this.outline.setFromObject(mesh);this.outline.material.color.set(this.preview.socket?0x8ff4c7:valid?0xedce88:0xe89a7f);this.outline.visible=true;
   this.prompt={text:this.preview.socket?'Attach · '+socket.label:!valid?'Placement blocked':socket&&angle>=.15?'Rotate to align with the bracket':'Place '+def.name,sub:this.preview.socket?'Rigid bracket · stable · '+def.mass+' kg':`${this.input.label('rotate')} rotate · scroll adjusts reach · ${def.mass} kg`};
  }else{
   this.camera.getWorldDirection(this.forward);let best=-999;
   for(const o of this.state.objects){const mesh=this.world.objectMeshes.get(o.id);if(!mesh)continue;this.aim.copy(mesh.position).sub(this.camera.position);const dist=distance(o,this.player.pos);if(dist>24)continue;const dot=this.aim.normalize().dot(this.forward),score=dot*8-dist*.06;if((dot>.88||dist<5)&&score>best){this.selected=o;best=score;}}
   if(this.selected){const mesh=this.world.objectMeshes.get(this.selected.id);this.outline.setFromObject(mesh);this.outline.material.color.set(0x9fe9c9);this.outline.visible=true;this.prompt={text:'Lift '+COMPONENTS[this.selected.kind].name,sub:COMPONENTS[this.selected.kind].mass+' kg · '+(this.selected.socket?'attached — lift detaches':'Loom-compatible mechanical sockets')};}
   else this.prompt={text:'Find a teal-marked component',key:this.input.label('ability'),sub:'Panels at the crossing · ceramic weight at the intake · raft at the shore'};
  }
 }
 pickupObject(o){this.undo.push(clone(this.state.objects));if(this.undo.length>12)this.undo.shift();this.held=o;this.heldOriginal=clone(o);o.socket=null;this.reach=clamp(distance(o,this.player.pos),5,13);this.audio.play('attach');}
 placeHeld(){if(!this.preview?.valid){this.audio.play('error');this.toast('The placement is blocked. Move to clear ground.');return;}const o=this.held;Object.assign(o,{x:this.preview.x,y:this.preview.y,z:this.preview.z,rot:this.preview.rot,socket:this.preview.socket});this.held=null;this.heldOriginal=null;this.audio.play('attach');this.burst(new T.Vector3(o.x,o.y+1,o.z),0x9ee5c0,6);
  if(o.socket==='intake-weight'&&!this.state.facts.intakeOpen){applyFact(this.state,'intakeOpen');this.audio.play('bell');this.caption('The counterweight settles. The intake iris opens.');this.toast('The iris opens. Read the regulator inside.');this.save(false);}
  if(o.socket?.startsWith('crossing')&&this.state.objects.filter(v=>v.socket?.startsWith('crossing')).length===2){this.toast('A thread across the water. The aqueduct is passable.');this.audio.play('discover');}
 }
 releaseHeld(commit=false){if(!this.held)return;if(commit&&this.preview?.valid)this.placeHeld();else{Object.assign(this.held,this.heldOriginal);this.held=null;this.heldOriginal=null;}this.outline.visible=false;}
 detach(o){this.undo.push(clone(this.state.objects));o.socket=null;o.x+=4.5;o.y=Math.max(heightAt(o.x,o.z)+COMPONENTS[o.kind].size[1]/2+.05,o.kind==='raft'?WATER+.42:0);this.audio.play('detach');this.toast('Detached. '+this.input.label('undo')+' undoes the operation.');}
 undoConstruction(){this.releaseHeld(false);if(!this.undo.length){this.toast('No recent construction operation to undo.');return;}this.state.objects=this.undo.pop();this.world.sync(this.state);this.audio.play('detach');this.toast('Construction operation undone.');}
 resetObjects(ids){this.releaseHeld(false);this.undo.push(clone(this.state.objects));for(const id of ids){const initial=INITIAL_OBJECTS.find(v=>v.id===id);const o=this.state.objects.find(v=>v.id===id);if(o&&initial){Object.assign(o,clone(initial));if(o.kind!=='raft')o.y=Math.max(o.y,heightAt(o.x,o.z)+COMPONENTS[o.kind].size[1]/2+.05);}}this.world.sync(this.state);this.audio.play('attach');}
 recordBlueprint(name){
  if(this.state.blueprints.length>=12){this.toast('Your fieldbook holds 12 blueprints. Remove one first.');return;}
  const objs=this.state.objects.filter(o=>distance(o,this.player.pos)<18);try{const bp=makeBlueprint(name,objs);this.state.blueprints.push(bp);this.toast('Recorded '+bp.name+' · '+bp.parts.length+' actual components.');this.ui.openBook('blueprints');}catch(e){this.toast(e.message);}
 }
 buildBlueprint(id){const bp=this.state.blueprints.find(v=>v.id===id);if(!bp)return;const p=this.player.pos,origin={x:p.x-Math.sin(this.player.yaw)*9,y:heightAt(p.x,p.z)+1,z:p.z-Math.cos(this.player.yaw)*9};const result=reconstruct(this.state,bp,origin);if(!result.ok){this.toast(result.message);return;}for(const o of result.objects){const def=COMPONENTS[o.kind];o.y=Math.max(o.y,heightAt(o.x,o.z)+def.size[1]/2+.05);}this.world.sync(this.state);this.audio.play('attach');this.toast('Reconstructed '+bp.name+'. Components are ready for Threadbind.');this.ui.play();}
 dismantle(){const o=this.state.objects.filter(v=>v.owned&&distance(v,this.player.pos)<18).sort((a,b)=>distance(a,this.player.pos)-distance(b,this.player.pos))[0];if(!o){this.toast('No owned component within 18 paces. Tutorial parts have reset winches.');return;}if(transact(this.state.inventory,COMPONENTS[o.kind].cost)){this.state.objects=this.state.objects.filter(v=>v.id!==o.id);this.world.sync(this.state);this.toast('Dismantled. All component materials returned.');this.ui.openBook('blueprints');}}
 makeEnemies(){
  if(this.enemies)for(const e of this.enemies)this.scene.remove(e.mesh);
  this.enemies=ENEMIES.map(def=>{
   const group=new T.Group(),sentinel=def.kind==='sentinel',w=this.world;
   if(sentinel){w.mesh('cylinder',0x7d9682,group,0,1.25,0,.6,1.6,.6);w.mesh('sphere',0xd6d2ad,group,0,2.3,0,.5,.45,.5);w.mesh('box',0x557e70,group,-.6,1.2,.32,.65,1.6,.35);w.mesh('box',0xc7d9b2,group,.65,1.4,.3,.14,1.8,.14);}
   else{w.mesh('sphere',0x8c8864,group,0,.6,0,.65,.6,.85);w.mesh('sphere',0xb3b08a,group,0,1,.55,.43,.4,.45);for(const x of [-.34,.34])w.mesh('cone',0x6e7e5b,group,x,1.4,.3,.16,.5,.13);for(const x of [-.4,.4])for(const z of [-.45,.45])w.mesh('cylinder',0x59694f,group,x,.28,z,.1,.55,.1);}
   for(const x of [-.17,.17])w.mesh('sphere',0xf1be81,group,x,sentinel?2.35:1.08,sentinel?.46:.92,.06,.07,.05,.7);
   const telegraph=new T.Mesh(new T.RingGeometry(.8,1,32),new T.MeshBasicMaterial({color:0xe99978,side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false}));telegraph.rotation.x=-Math.PI/2;telegraph.position.y=.08;group.add(telegraph);group.position.set(def.x,heightAt(def.x,def.z),def.z);group.visible=!this.state.defeated.includes(def.id);this.scene.add(group);
   return {...def,x:def.x,z:def.z,home:{x:def.x,z:def.z},hp:this.state.defeated.includes(def.id)?0:def.hp,maxHp:def.hp,mesh:group,phase:'idle',timer:0,cooldown:0,alert:false,telegraph,facing:0,stun:0};
  });
 }
 clearLine(a,b){const d=distance(a,b);for(let i=1;i<d;i+=1.5){const t=i/d;if(this.world.obstacleAt(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,Math.max(heightAt(a.x,a.z),heightAt(b.x,b.z))))return false;}return true;}
 updateEnemies(dt){
  const p=this.player.pos;for(const e of this.enemies){if(e.hp<=0)continue;e.cooldown=Math.max(0,e.cooldown-dt);e.stun=Math.max(0,e.stun-dt);const d=distance(e,p),home=distance(e,e.home),dy=Math.abs(p.y-heightAt(e.x,e.z));
   if(d<20&&dy<5&&this.clearLine(e,p)&&!this.player.riding)e.alert=true;if(d>32||home>26||dy>9)e.alert=false;
   e.telegraph.material.opacity=0;
   if(e.stun>0){e.mesh.rotation.z=Math.sin(this.elapsed*20)*.08;continue;}e.mesh.rotation.z=0;
   if(e.phase==='tell'){
    e.timer-=dt;e.telegraph.material.opacity=.65;e.telegraph.scale.setScalar(1+(1-e.timer/.7)*.7);e.mesh.scale.y=.85;
    if(e.timer<=0){e.mesh.scale.y=1;e.phase='recover';e.timer=e.kind==='sentinel'?1.3:.9;if(d<(e.kind==='sentinel'?3.3:2.8)&&dy<3&&this.clearLine(e,p)){
     if(this.player.blockTime>0){if(this.player.blockTime<.3){e.stun=1.5;e.hp=Math.max(0,e.hp-1);this.audio.play('guard');this.caption('Timed guard — the attacker staggers.');this.burst(p.clone().add(new T.Vector3(0,1,0)),0xd7eac1,9);if(e.hp===0)this.defeat(e);}else if(this.state.player.stamina>12){this.state.player.stamina-=12;this.audio.play('guard');}else this.damage(1,e);}
     else this.damage(e.kind==='sentinel'?2:1,e);
    }}
   }else if(e.phase==='recover'){e.timer-=dt;if(e.timer<=0){e.phase='idle';e.cooldown=.4;}}
   else if(e.alert){
    e.facing=Math.atan2(p.x-e.x,p.z-e.z);e.mesh.rotation.y=e.facing;
    if(d<3&&dy<3&&e.cooldown<=0){e.phase='tell';e.timer=e.kind==='sentinel'?.9:.7;this.caption(e.kind==='sentinel'?'Sentinel raises its tool.':'Scavenger crouches and rattles.');}
    else if(d>2.3){const speed=e.kind==='sentinel'?2.1:3.2,nx=e.x+Math.sin(e.facing)*dt*speed,nz=e.z+Math.cos(e.facing)*dt*speed;if(heightAt(nx,nz)>WATER+.1&&!this.world.obstacleAt(nx,nz,heightAt(nx,nz))){e.x=nx;e.z=nz;}}
   }else if(home>1){const a=Math.atan2(e.home.x-e.x,e.home.z-e.z);e.x+=Math.sin(a)*dt*2;e.z+=Math.cos(a)*dt*2;e.mesh.rotation.y=a;}
   e.mesh.position.set(e.x,heightAt(e.x,e.z),e.z);if(e.kind==='scavenger'&&e.alert)e.mesh.position.y+=Math.sin(this.elapsed*9)*.06;
  }
 }
 combatHit(heavy){const p=this.player.pos;let hit=false;for(const e of this.enemies){if(e.hp<=0||distance(e,p)>(heavy?3.7:3)||Math.abs(heightAt(e.x,e.z)-p.y)>3||!this.clearLine(p,e))continue;const a=Math.atan2(e.x-p.x,e.z-p.z),arc=Math.abs(Math.atan2(Math.sin(a-this.player.facing),Math.cos(a-this.player.facing)));if(arc>1.25)continue;
   const shield=e.kind==='sentinel'&&e.phase!=='recover'&&e.stun<=0&&!heavy;if(shield){this.audio.play('guard');this.toast('Shield holds. Use a heavy strike or punish its recovery.');e.alert=true;continue;}
   e.hp-=heavy?2:1;e.stun=heavy?.8:.3;e.alert=true;const nx=e.x+Math.sin(a)*(heavy?1.8:.7),nz=e.z+Math.cos(a)*(heavy?1.8:.7);if(!this.world.obstacleAt(nx,nz,heightAt(nx,nz))){e.x=nx;e.z=nz;}this.burst(new T.Vector3(e.x,heightAt(e.x,e.z)+1,e.z),0xefc08a,7);this.audio.play('hit');hit=true;if(e.hp<=0)this.defeat(e);
  }if(hit&&!this.settings.reducedMotion){this.player.zoom=Math.max(5,this.player.zoom-.12);}}
 defeat(e){e.hp=0;e.mesh.visible=false;if(!this.state.defeated.includes(e.id)){this.state.defeated.push(e.id);transact(this.state.inventory,{copper:e.kind==='sentinel'?3:1});this.toast(e.kind==='sentinel'?'Sentinel quieted · +3 copper':'Scavenger retreats · +1 copper');}}
 damage(amount,source){if(this.player.invincible>0||this.mode!=='play')return;this.state.player.hp=Math.max(0,this.state.player.hp-amount);this.player.invincible=1.25;this.audio.play('hurt');if(source){const a=Math.atan2(this.player.pos.x-source.x,this.player.pos.z-source.z);this.player.vel.x=Math.sin(a)*7;this.player.vel.z=Math.cos(a)*7;this.player.vel.y=3;}this.burst(this.player.pos.clone().add(new T.Vector3(0,1,0)),0xe8a281,5);if(this.state.player.hp<=0){this.releaseHeld(false);this.ui.death();}}
 burst(pos,color,count=8){for(let i=0;i<count&&this.effects.length<64;i++){const m=new T.Mesh(this.world.geos.lowSphere,this.world.material(color,.3));m.position.copy(pos);m.scale.setScalar(.07+Math.random()*.1);this.scene.add(m);this.effects.push({m,life:.65,max:.65,v:new T.Vector3((Math.random()-.5)*5,Math.random()*4+1,(Math.random()-.5)*5)});}}
 updateEffects(dt){for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.life-=dt;if(e.life<=0){this.scene.remove(e.m);this.effects.splice(i,1);continue;}e.v.y-=dt*7;e.m.position.addScaledVector(e.v,dt);e.m.scale.multiplyScalar(.98);}}
}

try{new Game();}catch(error){console.error(error);document.querySelector('#overlay').innerHTML=`<div class="modal-shade"><section class="ending"><div class="eyebrow">Graphics could not start</div><h2>Aetherwild</h2><p>This prototype needs a browser with WebGL 2 enabled. Try Chrome or Edge with hardware acceleration turned on.</p><p style="font-size:.7rem;margin-top:20px">${String(error.message).replace(/[<>&]/g,'')}</p><button class="primary" style="margin-top:20px" onclick="location.reload()">Try again</button></section></div>`;}
