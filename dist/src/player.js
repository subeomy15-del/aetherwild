import * as T from '../vendor/three.module.js';
import {START,WATER,heightAt,clamp,lerp} from './data.js';
const v=new T.Vector3();
export class Player{
 constructor(game){
  this.game=game;this.pos=new T.Vector3(START.x,START.y,START.z);this.vel=new T.Vector3();this.grounded=true;this.yaw=0;this.pitch=.3;this.zoom=8;this.facing=Math.PI;this.coyote=.12;this.jumpBuffer=0;this.gliding=false;this.swimming=false;this.climbing=false;this.dodgeTime=0;this.invincible=0;this.attackTime=0;this.attackCooldown=0;this.blockTime=0;this.attacked=false;this.heavy=false;this.walkTime=0;this.sprintOn=false;this.locked=null;this.riding=null;this.lastSafe=0;
  this.mesh=game.world.makeHuman(0x436d73,0xc58c57);game.scene.add(this.mesh);
  this.pack=game.world.mesh('box',0xb39b74,this.mesh,0,1.17,-.39,.65,.8,.35);
  game.world.mesh('ring',0x8de0c7,this.mesh,-.45,1.1,.1,.19,.19,.19,.5);
  this.blade=new T.Group();this.blade.position.set(.5,1.1,.2);game.world.mesh('box',0xdce2c4,this.blade,0,.35,0,.12,.9,.08);game.world.mesh('box',0xa48751,this.blade,0,-.12,0,.32,.1,.15);this.mesh.add(this.blade);
  this.sail=new T.Group();this.sail.position.set(0,2.8,0);
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([-2.7,0,.2,0,.5,-1.5,2.7,0,.2,-1.6,-.15,1,0,.1,1.2,1.6,-.15,1],3));geo.setIndex([0,1,3,1,4,3,1,2,5,1,5,4]);geo.computeVertexNormals();const cloth=new T.Mesh(geo,new T.MeshStandardMaterial({color:0xe3c49a,side:T.DoubleSide,roughness:1,flatShading:true}));this.sail.add(cloth);this.sail.visible=false;this.mesh.add(this.sail);
  this.shadow=new T.Mesh(new T.CircleGeometry(.63,24),new T.MeshBasicMaterial({color:0x253c36,transparent:true,opacity:.23,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;game.scene.add(this.shadow);
  this.cameraPos=new T.Vector3();this.cameraTarget=new T.Vector3();this.camInitialized=false;
 }
 load(state){this.pos.set(state.player.x,state.player.y,state.player.z);this.vel.set(0,0,0);this.yaw=0;this.pitch=.26;this.camInitialized=false;this.invincible=1;this.gliding=false;this.swimming=false;this.riding=null;this.attackTime=0;this.attackCooldown=0;this.dodgeTime=0;this.mesh.position.copy(this.pos);}
 snapshot(){return {x:this.pos.x,y:this.pos.y,z:this.pos.z};}
 update(dt){
  const g=this.game,input=g.input,s=g.state.player,settings=g.settings;
  this.invincible=Math.max(0,this.invincible-dt);this.attackCooldown=Math.max(0,this.attackCooldown-dt);this.dodgeTime=Math.max(0,this.dodgeTime-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);this.coyote=this.grounded?.13:Math.max(0,this.coyote-dt);
  const mx=input.mouse.x*.0022*settings.sensitivity+input.look.x*dt*2.4*settings.gamepadSensitivity;
  const my=input.mouse.y*.0018*settings.sensitivity+input.look.y*dt*1.8*settings.gamepadSensitivity;
  this.yaw-=mx;this.pitch=clamp(this.pitch+my*(settings.invertY?-1:1),-.38,1.12);
  if(!g.held)this.zoom=clamp(this.zoom+input.mouse.wheel*.6,4.5,13);
  if(input.held.has('ArrowLeft'))this.yaw+=dt*1.6;if(input.held.has('ArrowRight'))this.yaw-=dt*1.6;
  if(input.held.has('ArrowUp'))this.pitch=Math.max(-.38,this.pitch-dt);if(input.held.has('ArrowDown'))this.pitch=Math.min(1.12,this.pitch+dt);
  const axis=input.axes();let len=Math.hypot(axis.x,axis.y);if(len>1){axis.x/=len;axis.y/=len;len=1;}
  const moveX=axis.x*Math.cos(this.yaw)+axis.y*Math.sin(this.yaw),moveZ=-axis.x*Math.sin(this.yaw)+axis.y*Math.cos(this.yaw);
  if(settings.sprintToggle&&input.hit('sprint'))this.sprintOn=!this.sprintOn;
  const sprint=(settings.sprintToggle?this.sprintOn:input.down('sprint'))&&len>.1&&s.stamina>1&&!g.loom&&!this.swimming;
  const blocking=input.down('block')&&!g.loom&&this.grounded&&this.dodgeTime===0;
  this.blockTime=blocking?this.blockTime+dt:0;
  if(input.hit('jump')){
   if(this.riding){this.riding=null;this.vel.y=6;this.grounded=false;}
   else if(!this.grounded&&!this.swimming&&this.coyote<=0){this.gliding=!this.gliding&&s.stamina>5;if(this.gliding){this.vel.y=Math.max(this.vel.y,-2);g.audio.play('sail');}}
   else this.jumpBuffer=.16;
  }
  if(input.hit('dodge')&&!g.loom&&s.stamina>=16&&this.dodgeTime===0){s.stamina-=16;this.dodgeTime=.34;this.invincible=.26;const a=len>.1?Math.atan2(moveX,moveZ):this.facing;this.vel.x=Math.sin(a)*12;this.vel.z=Math.cos(a)*12;g.audio.play('swing');}
  if(input.hit('attack')&&!g.loom&&!this.swimming&&this.attackCooldown<=0){this.heavy=input.down('sprint')||input.down('heavy');this.attackTime=this.heavy?.65:.36;this.attackCooldown=this.heavy?.85:.43;this.attacked=false;if(this.heavy)s.stamina=Math.max(0,s.stamina-12);g.audio.play('swing');}
  if(this.attackTime>0){this.attackTime-=dt;const threshold=this.heavy?.32:.2;if(this.attackTime<threshold&&!this.attacked){g.combatHit(this.heavy);this.attacked=true;}}
  if(input.hit('heal'))g.heal();
  const ground=g.world.surfaceAt(this.pos.x,this.pos.z,this.pos.y,g.state,g.held?.id);
  this.platform=ground.platform;
  this.swimming=ground.height<WATER-.9&&this.pos.y<WATER+.2&&!this.riding;
  this.climbing=false;
  if(this.riding){
   const raft=g.state.objects.find(o=>o.id===this.riding);if(!raft)this.riding=null;
   else{const x=clamp(raft.x+moveX*dt*5,-185,185),z=clamp(raft.z+moveZ*dt*5,-185,185);if(heightAt(x,z)<WATER-.25){raft.x=x;raft.z=z;}raft.y=WATER+.42+Math.sin(g.elapsed*1.4)*.045;if(len>.1)raft.rot=lerp(raft.rot,Math.atan2(moveX,moveZ),1-Math.exp(-dt*3));this.pos.set(raft.x,raft.y+.5,raft.z);this.vel.set(0,0,0);this.grounded=true;}
  }
  if(!this.riding){
   let speed=this.swimming?3.3:this.gliding?7.4:sprint?9.2:g.loom?3.6:blocking?2:5.3;
   if(this.attackTime>0)speed*=.45;
   const acceleration=this.grounded?len>.1?18:14:this.swimming?5:4.4;
   if(this.dodgeTime===0){this.vel.x=lerp(this.vel.x,moveX*speed,1-Math.exp(-acceleration*dt));this.vel.z=lerp(this.vel.z,moveZ*speed,1-Math.exp(-acceleration*dt));}
   if(this.jumpBuffer>0&&this.coyote>0&&!this.swimming){this.vel.y=8.4;this.grounded=false;this.coyote=0;this.jumpBuffer=0;g.audio.play('jump');}
   const old=this.pos.clone(),nx=this.pos.x+this.vel.x*dt,nz=this.pos.z+this.vel.z*dt;
   const next=g.world.surfaceAt(nx,nz,this.pos.y,g.state,g.held?.id);const obs=g.world.obstacleAt(nx,nz,this.pos.y);
   if(obs&&obs.climb&&len>.1&&s.stamina>1&&settings.climbAssist){this.climbing=true;this.pos.y+=dt*3.5;s.stamina=Math.max(0,s.stamina-dt*9);if(this.pos.y>obs.top-.15){this.pos.x=nx;this.pos.z=nz;this.pos.y=obs.top;this.vel.y=2;}}
   else if(!obs){
    const step=next.height-this.pos.y;
    if(!this.grounded||step<.62||step<Math.hypot(this.vel.x,this.vel.z)*dt*1.05+.05){this.pos.x=nx;this.pos.z=nz;}
    else {const gx=g.world.surfaceAt(nx,this.pos.z,this.pos.y,g.state,g.held?.id),gz=g.world.surfaceAt(this.pos.x,nz,this.pos.y,g.state,g.held?.id);if(gx.height-this.pos.y<.5)this.pos.x=nx;if(gz.height-this.pos.y<.5)this.pos.z=nz;}
   }
   this.pos.x=clamp(this.pos.x,-185,185);this.pos.z=clamp(this.pos.z,-185,185);
   if(this.swimming){this.vel.y=lerp(this.vel.y,(WATER-.58-this.pos.y)*6,dt*5);this.pos.y+=this.vel.y*dt;if(len>.1)s.stamina-=dt*6;if(input.down('jump')&&s.stamina>0){this.pos.y+=dt*1.3;this.vel.y=2;}}
   else if(!this.climbing){this.vel.y-=dt*(this.gliding?3:22);if(this.gliding)this.vel.y=Math.max(this.vel.y,-2.25);this.pos.y+=this.vel.y*dt;}
   const surface=g.world.surfaceAt(this.pos.x,this.pos.z,Math.max(old.y,this.pos.y),g.state,g.held?.id);
   if(this.pos.y<=surface.height&&this.vel.y<=0){const impact=this.vel.y;this.pos.y=surface.height;this.vel.y=0;this.grounded=true;this.gliding=false;if(impact<-17&&this.invincible<=0){g.damage(Math.ceil((-impact-17)/7),null);g.toast('Hard landing — deploy your sailcloth with '+input.label('jump')+'.');}if(impact<-8)g.audio.play('step');}
   else this.grounded=false;
  }
  if(this.gliding){s.stamina-=dt*(g.state.facts.rewarded?2.4:5);if(s.stamina<=0){this.gliding=false;g.toast('Your arms are tired. Find a place to land.');}}
  else if(sprint&&this.grounded)s.stamina-=dt*9;
  else if(!this.swimming&&!this.climbing&&this.dodgeTime===0&&!blocking)s.stamina=Math.min(s.maxStamina,s.stamina+dt*20);
  s.stamina=clamp(s.stamina,0,s.maxStamina);
  if(this.swimming&&s.stamina<=0){g.damage(1,null);this.pos.copy(new T.Vector3(g.state.safe.x,g.state.safe.y,g.state.safe.z));this.vel.set(0,0,0);s.stamina=s.maxStamina*.5;g.toast('Sella’s safety line brings you back to shore.');}
  if(len>.1&&!blocking){const target=Math.atan2(moveX,moveZ);this.facing+=Math.atan2(Math.sin(target-this.facing),Math.cos(target-this.facing))*(1-Math.exp(-dt*15));}
  this.walkTime+=dt*Math.hypot(this.vel.x,this.vel.z)*1.8;
  const walking=this.grounded&&len>.1&&!this.riding;
  this.mesh.position.copy(this.pos);this.mesh.rotation.y=this.facing;
  for(let i=0;i<2;i++){const swing=walking?Math.sin(this.walkTime+i*Math.PI)*.55:0;this.mesh.userData.legs[i].rotation.x=swing;this.mesh.userData.arms[i].rotation.x=this.gliding?-2.6:-swing*.75;}
  if(blocking)this.mesh.userData.arms[0].rotation.x=-1.2;
  this.blade.rotation.x=this.attackTime>0?-1.3+Math.sin(this.attackTime*(this.heavy?7:12))*1.8:.15;this.blade.rotation.z=this.attackTime>0?-1.3:.2;
  this.mesh.visible=this.invincible<=0||Math.floor(this.invincible*16)%2===0||this.dodgeTime>0;
  this.sail.visible=this.gliding;this.sail.rotation.z=settings.reducedMotion?0:Math.sin(g.elapsed*2)*.025;
  const floor=g.world.surfaceAt(this.pos.x,this.pos.z,this.pos.y,g.state).height;this.shadow.position.set(this.pos.x,Math.max(floor,WATER)+.04,this.pos.z);this.shadow.scale.setScalar(clamp(1-(this.pos.y-floor)*.035,.3,1));
  if(walking&&g.elapsed-this.game.audio.lastFoot>.34/(sprint?1.6:1)){g.audio.play(this.swimming?'water':'step');g.audio.lastFoot=g.elapsed;}
  if(this.grounded&&!this.swimming&&floor>WATER+.5&&!g.enemies.some(e=>e.alert&&e.hp>0)&&g.elapsed-this.lastSafe>4){g.state.safe=this.snapshot();this.lastSafe=g.elapsed;}
  if(this.pos.y<-15||!Number.isFinite(this.pos.y))g.respawn(false);
  Object.assign(s,this.snapshot());
 }
 camera(dt,title=false){
  const g=this.game,cam=g.camera;
  let target,desired;
  if(title){target=new T.Vector3(-3,16,-35);desired=new T.Vector3(45,34,138);}
  else{target=this.pos.clone().add(new T.Vector3(0,1.65,0));const d=this.zoom;desired=target.clone().add(new T.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch)*d,Math.sin(this.pitch)*d+1.1,Math.cos(this.yaw)*Math.cos(this.pitch)*d));
   // Terrain-aware camera pull-in prevents the orbit from clipping through slopes.
   for(let t=.1;t<=1;t+=.1){v.lerpVectors(target,desired,t);if(v.y<heightAt(v.x,v.z)+.65){desired.lerpVectors(target,desired,Math.max(.2,t-.1));break;}}
   desired.y=Math.max(desired.y,heightAt(desired.x,desired.z)+.7);
  }
  const t=this.camInitialized?1-Math.exp(-dt*(g.settings.reducedMotion?24:12)):1;
  this.cameraPos.lerp(desired,t);this.cameraTarget.lerp(target,t);this.camInitialized=true;cam.position.copy(this.cameraPos);cam.lookAt(this.cameraTarget);
 }
}
