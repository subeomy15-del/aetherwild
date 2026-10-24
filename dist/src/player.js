import * as T from '../vendor/three.module.js';
import {START,WATER,heightAt,clamp,lerp} from './data.js';
import {createCharacter,updateCharacter,createSailcloth,updateSailcloth} from './characters.js';
const v=new T.Vector3();
function terrainCameraHeight(target,position){
 let required=position.y;
 for(let t=.12;t<=1.001;t+=.055){v.lerpVectors(target,position,t);required=Math.max(required,target.y+(heightAt(v.x,v.z)+.72-target.y)/t);}
 return required;
}
function avoidCameraWalls(target,position,world){
 if(!world.cameraObstacleAt)return {position,blocked:false};
 for(let t=.12;t<=1.001;t+=.035){v.lerpVectors(target,position,t);if(world.cameraObstacleAt(v.x,v.y,v.z))return {position:target.clone().lerp(position,Math.max(.08,t-.07)),blocked:true};}
 return {position,blocked:false};
}
export class Player{
 constructor(game){
  this.game=game;this.pos=new T.Vector3(START.x,START.y,START.z);this.vel=new T.Vector3();this.grounded=true;this.yaw=0;this.pitch=.12;this.zoom=6.4;this.facing=Math.PI;this.coyote=.12;this.jumpBuffer=0;this.gliding=false;this.swimming=false;this.climbing=false;this.mantle=null;this.dodgeTime=0;this.invincible=0;this.damageFlash=0;this.attackTime=0;this.attackCooldown=0;this.blockTime=0;this.attacked=false;this.heavy=false;this.walkTime=0;this.sprintOn=false;this.locked=null;this.riding=null;this.lastSafe=0;this.landImpact=0;this.wasGrounded=true;
  this.mesh=createCharacter(0x2f6268,0xbd824a);game.scene.add(this.mesh);
  this.pack=this.mesh.userData.pack;
  this.blade=this.mesh.userData.blade;
  this.sail=createSailcloth();this.sail.position.set(0,2.9,0);this.sail.visible=false;this.mesh.add(this.sail);
  this.shadow=new T.Mesh(new T.CircleGeometry(.63,24),new T.MeshBasicMaterial({color:0x253c36,transparent:true,opacity:.23,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;game.scene.add(this.shadow);
  this.cameraPos=new T.Vector3();this.cameraTarget=new T.Vector3();this.camInitialized=false;
 }
 load(state){this.pos.set(state.player.x,state.player.y,state.player.z);this.vel.set(0,0,0);this.yaw=0;this.pitch=.12;this.zoom=6.4;this.camInitialized=false;this.invincible=1;this.damageFlash=0;this.gliding=false;this.swimming=false;this.riding=null;this.mantle=null;this.attackTime=0;this.attackCooldown=0;this.dodgeTime=0;this.jumpBuffer=0;this.coyote=.13;this.grounded=true;this.landImpact=0;this.wasGrounded=true;this.mesh.position.copy(this.pos);}
 snapshot(){return {x:this.pos.x,y:this.pos.y,z:this.pos.z};}
 tryMantle(moveX,moveZ){
  const g=this.game,s=g.state.player;if(this.mantle||s.stamina<10||this.riding||this.gliding)return false;
  const inWater=this.swimming||(this.pos.y<WATER+.2&&g.world.surfaceAt(this.pos.x,this.pos.z,this.pos.y,g.state,g.held?.id).height<WATER-.9);
  if(!inWater&&!this.grounded)return false;
  const magnitude=Math.hypot(moveX,moveZ),angle=magnitude>.15?Math.atan2(moveX,moveZ):this.facing;
  const maxRise=inWater?(g.settings.climbAssist?3.4:2.2):1.45,maxReach=inWater?3.4:1.7;
  let target=null;
  for(const offset of [0,-.18,.18]){
   for(let reach=.7;reach<=maxReach+.01;reach+=.3){
    const a=angle+offset,x=this.pos.x+Math.sin(a)*reach,z=this.pos.z+Math.cos(a)*reach;
    const surface=g.world.surfaceAt(x,z,this.pos.y+maxRise,g.state,g.held?.id),rise=surface.height-this.pos.y;
    if(rise<.55||rise>maxRise||surface.height<WATER+.2||Math.abs(x)>184||Math.abs(z)>184)continue;
    // Leave room for both feet. A narrow edge or the side of a tree does not
    // become a valid mantle just because a ray happened to touch it.
    const heights=[[.27,0],[-.27,0],[0,.27],[0,-.27]].map(([dx,dz])=>g.world.surfaceAt(x+dx,z+dz,surface.height+.1,g.state,g.held?.id).height);
    if(heights.some(h=>Math.abs(h-surface.height)>.52))continue;
    let blocked=false;for(let t=.25;t<=1;t+=.25)if(g.world.obstacleAt(this.pos.x+(x-this.pos.x)*t,this.pos.z+(z-this.pos.z)*t,Math.max(this.pos.y,surface.height)+.15)){blocked=true;break;}
    if(blocked)continue;
    target=new T.Vector3(x,surface.height+.025,z);break;
   }
   if(target)break;
  }
  if(!target)return false;
  this.mantle={start:this.pos.clone(),target,time:0,duration:.28+Math.max(0,target.y-this.pos.y)*.035};
  this.vel.set(0,0,0);this.grounded=false;this.gliding=false;this.jumpBuffer=0;this.coyote=0;this.facing=Math.atan2(target.x-this.pos.x,target.z-this.pos.z);s.stamina-=10;g.audio.play('step');return true;
 }
 advanceMantle(dt){
  const m=this.mantle;if(!m)return;m.time+=dt;const t=clamp(m.time/m.duration,0,1),smooth=n=>n*n*(3-2*n);
  const horizontal=smooth(clamp((t-.12)/.88,0,1)),vertical=smooth(clamp(t/.8,0,1));
  this.pos.x=lerp(m.start.x,m.target.x,horizontal);this.pos.z=lerp(m.start.z,m.target.z,horizontal);this.pos.y=lerp(m.start.y,m.target.y+.12,vertical)-.12*smooth(clamp((t-.8)/.2,0,1));
  this.vel.set(0,0,0);this.swimming=false;this.climbing=true;
  if(t>=1){this.pos.copy(m.target);this.mantle=null;this.grounded=true;this.climbing=false;this.landImpact=0;}
 }
 update(dt){
  const WATER=this.game.world.waterAt?.(this.pos.x,this.pos.z)??3.2;
  const g=this.game,input=g.input,s=g.state.player,settings=g.settings;
  this.invincible=Math.max(0,this.invincible-dt);this.damageFlash=Math.max(0,this.damageFlash-dt);this.attackCooldown=Math.max(0,this.attackCooldown-dt);this.dodgeTime=Math.max(0,this.dodgeTime-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);this.coyote=this.grounded?.13:Math.max(0,this.coyote-dt);
  const mx=input.mouse.x*.0022*settings.sensitivity+input.look.x*dt*2.4*settings.gamepadSensitivity;
  const my=input.mouse.y*.0018*settings.sensitivity+input.look.y*dt*1.8*settings.gamepadSensitivity;
  this.yaw-=mx;this.pitch=clamp(this.pitch+my*(settings.invertY?-1:1),-.38,1.12);
  const lockedTarget=!g.loom&&!g.rise?.aiming&&this.locked?g.enemies.find(e=>e.id===this.locked&&e.hp>0&&Math.hypot(e.x-this.pos.x,e.z-this.pos.z)<30):null;
  if(this.locked&&!lockedTarget)this.locked=null;
  if(lockedTarget){const angle=Math.atan2(this.pos.x-lockedTarget.x,this.pos.z-lockedTarget.z);this.yaw+=Math.atan2(Math.sin(angle-this.yaw),Math.cos(angle-this.yaw))*(1-Math.exp(-dt*7));}
  if(!g.held)this.zoom=clamp(this.zoom+input.mouse.wheel*.6,4.5,13);
  if(input.held.has('ArrowLeft'))this.yaw+=dt*1.6;if(input.held.has('ArrowRight'))this.yaw-=dt*1.6;
  if(input.held.has('ArrowUp'))this.pitch=Math.max(-.38,this.pitch-dt);if(input.held.has('ArrowDown'))this.pitch=Math.min(1.12,this.pitch+dt);
  const axis=input.axes();let len=Math.hypot(axis.x,axis.y);if(len>1){axis.x/=len;axis.y/=len;len=1;}
  const moveX=axis.x*Math.cos(this.yaw)+axis.y*Math.sin(this.yaw),moveZ=-axis.x*Math.sin(this.yaw)+axis.y*Math.cos(this.yaw);
  if(settings.sprintToggle&&input.hit('sprint'))this.sprintOn=!this.sprintOn;
  const sprint=(settings.sprintToggle?this.sprintOn:input.down('sprint'))&&len>.1&&s.stamina>1&&!g.loom&&!this.swimming;
  const blocking=input.down('block')&&!g.loom&&this.grounded&&this.dodgeTime===0;
  this.blockTime=blocking?this.blockTime+dt:0;
  if(input.hit('jump')&&!this.mantle){
   if(this.riding){this.riding=null;this.vel.y=6;this.grounded=false;}
   else if(this.tryMantle(moveX,moveZ)){}
   else if(!this.grounded&&!this.swimming&&this.coyote<=0){
    const below=g.world.surfaceAt(this.pos.x,this.pos.z,this.pos.y,g.state,g.held?.id).height;
    if(this.vel.y<0&&this.pos.y-below<.65&&!this.gliding)this.jumpBuffer=.16;
    else{if(g.state.journey&&!g.state.journey.glider){g.toast('No sailcloth yet. Sella can repair one at Reedwake.');}else this.gliding=!this.gliding&&s.stamina>5;if(this.gliding){this.vel.y=Math.max(this.vel.y,-2);g.audio.play('sail');}}
   }
   else this.jumpBuffer=.16;
  }
  if(input.hit('dodge')&&!g.loom&&s.stamina>=16&&this.dodgeTime===0){s.stamina-=16;this.dodgeTime=.34;this.invincible=.26;const a=len>.1?Math.atan2(moveX,moveZ):this.facing;this.vel.x=Math.sin(a)*12;this.vel.z=Math.cos(a)*12;g.audio.play('swing');}
  if(input.hit('attack')&&!g.loom&&!g.rise?.aiming&&!g.echo?.aiming&&!this.swimming&&this.attackCooldown<=0){this.heavy=input.down('sprint')||input.down('heavy');this.attackTime=this.heavy?.65:.36;this.attackCooldown=this.heavy?.85:.43;this.attacked=false;if(this.heavy)s.stamina=Math.max(0,s.stamina-12);g.audio.play('swing');}
  if(this.attackTime>0){this.attackTime-=dt;const threshold=this.heavy?.32:.2;if(this.attackTime<threshold&&!this.attacked){g.combatHit(this.heavy);this.attacked=true;}}
  if(input.hit('heal'))g.heal();
  const ground=g.world.surfaceAt(this.pos.x,this.pos.z,this.pos.y,g.state,g.held?.id);
  this.platform=ground.platform;
  this.swimming=ground.height<WATER-.9&&this.pos.y<WATER+.2&&!this.riding&&!this.mantle;
  this.climbing=!!this.mantle;const mantleFrame=!!this.mantle;
  if(mantleFrame)this.advanceMantle(dt);
  else if(this.riding){
   const raft=g.state.objects.find(o=>o.id===this.riding);if(!raft)this.riding=null;
   else{const x=clamp(raft.x+moveX*dt*5,-185,185),z=clamp(raft.z+moveZ*dt*5,-185,185);if(heightAt(x,z)<WATER-.25){raft.x=x;raft.z=z;}raft.y=WATER+.42+Math.sin(g.elapsed*1.4)*.045;if(len>.1)raft.rot=lerp(raft.rot,Math.atan2(moveX,moveZ),1-Math.exp(-dt*3));this.pos.set(raft.x,raft.y+.5,raft.z);this.vel.set(0,0,0);this.grounded=true;}
  }
  if(!this.riding&&!mantleFrame){
   let speed=this.swimming?3.3:this.gliding?7.4:sprint?9.2:g.loom?3.6:blocking?2:5.3;
   if(this.attackTime>0)speed*=.45;
   const acceleration=this.grounded?len>.1?18:14:this.swimming?5:4.4;
   if(this.dodgeTime===0){this.vel.x=lerp(this.vel.x,moveX*speed,1-Math.exp(-acceleration*dt));this.vel.z=lerp(this.vel.z,moveZ*speed,1-Math.exp(-acceleration*dt));}
   if(this.jumpBuffer>0&&this.coyote>0&&!this.swimming){this.vel.y=8.4;this.grounded=false;this.coyote=0;this.jumpBuffer=0;g.audio.play('jump');}
   const old=this.pos.clone(),nx=this.pos.x+this.vel.x*dt,nz=this.pos.z+this.vel.z*dt;
   const next=g.world.surfaceAt(nx,nz,this.pos.y,g.state,g.held?.id);const obs=g.world.obstacleAt(nx,nz,this.pos.y);
   if(obs&&obs.climb&&len>.1&&s.stamina>1&&settings.climbAssist){this.climbing=true;this.pos.y+=dt*3.5;s.stamina=Math.max(0,s.stamina-dt*9);if(this.pos.y>obs.top-.15){this.pos.x=nx;this.pos.z=nz;this.pos.y=obs.top;this.vel.y=2;}}
   else if(obs&&!obs.climb){
    // Keep tangent movement around trunks and round masonry. Stopping both
    // axes on a glancing contact made narrow paths feel sticky.
    const dx=nx-obs.x,dz=nz-obs.z,length=Math.hypot(dx,dz)||1,radius=obs.r+.405;
    const sx=obs.x+dx/length*radius,sz=obs.z+dz/length*radius;
    const slide=g.world.surfaceAt(sx,sz,this.pos.y,g.state,g.held?.id);
    if((!this.grounded||slide.height-this.pos.y<.62)&&!g.world.obstacleAt(sx,sz,this.pos.y)){this.pos.x=sx;this.pos.z=sz;}
   }
   else if(!obs){
    const step=next.height-this.pos.y;
    if(!this.grounded||step<.62||step<Math.hypot(this.vel.x,this.vel.z)*dt*1.05+.05){this.pos.x=nx;this.pos.z=nz;}
    else {const gx=g.world.surfaceAt(nx,this.pos.z,this.pos.y,g.state,g.held?.id),gz=g.world.surfaceAt(this.pos.x,nz,this.pos.y,g.state,g.held?.id);if(gx.height-this.pos.y<.5)this.pos.x=nx;if(gz.height-this.pos.y<.5)this.pos.z=nz;}
   }
   const limit=g.world.overworldActive?2590:185;this.pos.x=clamp(this.pos.x,-limit,limit);this.pos.z=clamp(this.pos.z,-limit,limit);
   if(this.swimming){this.vel.y=lerp(this.vel.y,(WATER-.58-this.pos.y)*6,dt*5);this.pos.y+=this.vel.y*dt;if(len>.1)s.stamina-=dt*6;if(input.down('jump')&&s.stamina>0){this.pos.y+=dt*1.3;this.vel.y=2;}}
   else if(!this.climbing){this.vel.y-=dt*(this.gliding?3:22);if(this.gliding){const wind=g.world.windAt?.(this.pos.x,this.pos.y,this.pos.z,g.state);if(wind){this.vel.x+=wind.x*dt;this.vel.z+=wind.z*dt;this.vel.y+=wind.y*dt;}this.vel.y=Math.max(this.vel.y,-2.25);}this.pos.y+=this.vel.y*dt;}
   const surface=g.world.surfaceAt(this.pos.x,this.pos.z,Math.max(old.y,this.pos.y),g.state,g.held?.id);
   if(this.pos.y<=surface.height&&this.vel.y<=0){const impact=this.vel.y;this.landImpact=impact;this.pos.y=surface.height;this.vel.y=0;this.grounded=true;this.gliding=false;if(impact<-17&&this.invincible<=0){g.damage(Math.ceil((-impact-17)/7),null);g.toast('Hard landing — deploy your sailcloth with '+input.label('jump')+'.');}if(impact<-8)g.audio.play('step');}
   else this.grounded=false;
  }
  if(this.gliding){s.stamina-=dt*(g.state.facts.rewarded?2.4:5);if(s.stamina<=0){this.gliding=false;g.toast('Your arms are tired. Find a place to land.');}}
  else if(sprint&&this.grounded)s.stamina-=dt*9;
  else if(this.grounded&&!g.echo?.playback&&!this.swimming&&!this.climbing&&this.dodgeTime===0&&!blocking)s.stamina=Math.min(s.maxStamina,s.stamina+dt*20);
  s.stamina=clamp(s.stamina,0,s.maxStamina);
  if(this.swimming&&s.stamina<=0){g.damage(1,null);this.pos.copy(new T.Vector3(g.state.safe.x,g.state.safe.y,g.state.safe.z));this.vel.set(0,0,0);s.stamina=s.maxStamina*.5;g.toast('Sella’s safety line brings you back to shore.');}
  if(lockedTarget){const target=Math.atan2(lockedTarget.x-this.pos.x,lockedTarget.z-this.pos.z);this.facing+=Math.atan2(Math.sin(target-this.facing),Math.cos(target-this.facing))*(1-Math.exp(-dt*20));}
  else if(len>.1&&!blocking){const target=Math.atan2(moveX,moveZ);this.facing+=Math.atan2(Math.sin(target-this.facing),Math.cos(target-this.facing))*(1-Math.exp(-dt*15));}
  this.walkTime+=dt*Math.hypot(this.vel.x,this.vel.z)*1.8;
  const walking=this.grounded&&len>.1&&!this.riding;
  this.mesh.position.copy(this.pos);this.mesh.rotation.y=this.facing;
  updateCharacter(this.mesh,{dt,time:g.elapsed,speed:Math.hypot(this.vel.x,this.vel.z),grounded:this.grounded,verticalSpeed:this.grounded?this.landImpact:this.vel.y,gliding:this.gliding,swimming:this.swimming,climbing:this.climbing,attack:this.attackTime,heavy:this.heavy,blocking,dodging:this.dodgeTime>0,riding:!!this.riding,loom:g.loom,reducedMotion:settings.reducedMotion});
  this.mesh.visible=this.invincible<=0||Math.floor(this.invincible*16)%2===0||this.dodgeTime>0;
  this.sail.visible=this.gliding;if(this.gliding)updateSailcloth(this.sail,g.elapsed,Math.hypot(this.vel.x,this.vel.z),settings.reducedMotion);
  const floor=g.world.surfaceAt(this.pos.x,this.pos.z,this.pos.y,g.state).height;this.shadow.position.set(this.pos.x,Math.max(floor,WATER)+.04,this.pos.z);this.shadow.scale.setScalar(clamp(1-(this.pos.y-floor)*.035,.3,1));
  if(walking&&g.elapsed-this.game.audio.lastFoot>.34/(sprint?1.6:1)){g.audio.play(this.swimming?'water':'step');g.audio.lastFoot=g.elapsed;}
  if(this.grounded&&!this.swimming&&floor>WATER+.5&&!g.enemies.some(e=>e.alert&&e.hp>0)&&g.elapsed-this.lastSafe>4){g.state.safe=this.snapshot();this.lastSafe=g.elapsed;}
  if(this.pos.y<-15||!Number.isFinite(this.pos.y))g.respawn(false);
  Object.assign(s,this.snapshot());
 }
 camera(dt,title=false){
  const g=this.game,cam=g.camera;
  let target,desired,occluded=false;
  if(title){target=new T.Vector3(-13,18,-56);desired=new T.Vector3(35,30,128);}
  else{
   const forward=new T.Vector3(-Math.sin(this.yaw),0,-Math.cos(this.yaw)),right=new T.Vector3(Math.cos(this.yaw),0,-Math.sin(this.yaw));
   target=this.pos.clone().add(new T.Vector3(0,1.65,0)).addScaledVector(forward,1.35).addScaledVector(right,.18);
   const orbitTarget=this.riding?Math.max(10.5,this.zoom):this.zoom;this.cameraOrbitDistance=this.camInitialized?lerp(this.cameraOrbitDistance??orbitTarget,orbitTarget,1-Math.exp(-dt*4)):orbitTarget;
   const d=Math.max(4.5,this.cameraOrbitDistance);desired=this.pos.clone().add(new T.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch)*d,1.8+Math.sin(this.pitch)*d+(this.riding?1.1:0),Math.cos(this.yaw)*Math.cos(this.pitch)*d)).addScaledVector(right,.48);
   // Raise the orbit above a bank instead of pulling it into Iri's head. A
   // following distance is preserved while the camera clears terrain behind us.
   const required=terrainCameraHeight(target,desired);
   desired.y=Math.max(desired.y,Math.min(required,this.pos.y+d*1.8+3),heightAt(desired.x,desired.z)+.72,this.swimming?WATER+.7:-Infinity);
  }
  if(!title&&g.mode!=='rise'){const result=avoidCameraWalls(target,desired,g.world);desired=result.position;occluded=result.blocked;}
  const t=this.camInitialized?1-Math.exp(-dt*(g.settings.reducedMotion?30:14)):1;
  this.cameraPos.lerp(desired,t);this.cameraTarget.lerp(target,this.camInitialized?1-Math.exp(-dt*20):1);
  if(!title){
   const dx=this.cameraPos.x-this.pos.x,dz=this.cameraPos.z-this.pos.z,horizontal=Math.hypot(dx,dz),minimum=occluded?1.1:3.8;
   if(horizontal<minimum){const a=horizontal>.1?Math.atan2(dx,dz):this.yaw;this.cameraPos.x=this.pos.x+Math.sin(a)*minimum;this.cameraPos.z=this.pos.z+Math.cos(a)*minimum;}
   // Collision correction rises immediately; returning to the normal orbit is
   // damped above. This avoids spending several frames inside a steep shore.
   const clearance=terrainCameraHeight(this.cameraTarget,this.cameraPos);
   this.cameraPos.y=Math.max(this.cameraPos.y,Math.min(clearance,this.pos.y+this.zoom*1.8+3),heightAt(this.cameraPos.x,this.cameraPos.z)+.72);
   if(g.mode!=='rise'){const result=avoidCameraWalls(this.cameraTarget,this.cameraPos,g.world);if(result.blocked)this.cameraPos.copy(result.position);}
  }
  this.cameraBlockedClose=!title&&this.cameraPos.distanceTo(this.pos.clone().add(new T.Vector3(0,1.4,0)))<2.05;
  this.camInitialized=true;cam.position.copy(this.cameraPos);cam.lookAt(this.cameraTarget);
 }
}
