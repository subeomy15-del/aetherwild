import * as T from '../vendor/three.module.js';
import {clamp} from './data.js';
export function probeRise(position,surfaces,obstacleAt=()=>null){
 const overhead=surfaces.filter(s=>Math.abs(position.x-s.x)<s.w/2-.65&&Math.abs(position.z-s.z)<s.d/2-.65&&s.bottom>position.y+1.9).sort((a,b)=>a.bottom-b.bottom)[0];
 if(!overhead)return {valid:false,reason:'No suitable ceiling overhead. Find the marked ceramic canopy at Bellwether.'};
 if(overhead.moving)return {valid:false,reason:'This ceiling is moving. Rise needs a stable surface.'};
 if(overhead.top-overhead.bottom>3)return {valid:false,reason:'The ceiling is too thick for the damaged brace.'};
 if(overhead.top-position.y>16)return {valid:false,reason:'The exit is beyond Rise’s 16-pace range.'};
 const exit={x:position.x,y:overhead.top+.025,z:position.z};
 if(Math.abs(exit.x)>184||Math.abs(exit.z)>184)return {valid:false,reason:'The exit is outside the surveyed basin.'};
 if(obstacleAt(exit.x,exit.z,exit.y))return {valid:false,reason:'The exit has no room to stand.'};
 if(surfaces.some(s=>s.id!==overhead.id&&Math.abs(exit.x-s.x)<s.w/2+.5&&Math.abs(exit.z-s.z)<s.d/2+.5&&s.bottom<exit.y+2.2&&s.top>exit.y))return {valid:false,reason:'Another surface blocks the exit.'};
 return {valid:true,exit,surface:overhead,reason:'Clear exit · '+(overhead.top-position.y).toFixed(1)+' paces · 10 stamina'};
}
export class RiseSystem{
 constructor(game){this.g=game;this.aiming=false;this.transit=null;this.preview=null;
  this.line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,10,0)]),new T.LineDashedMaterial({color:0xd4e8ac,dashSize:.3,gapSize:.2,transparent:true,opacity:.75,depthWrite:false}));game.scene.add(this.line);
  this.ring=new T.Mesh(new T.TorusGeometry(.8,.035,7,40),new T.MeshBasicMaterial({color:0xbaecc3,transparent:true,opacity:.9,depthWrite:false}));this.ring.rotation.x=Math.PI/2;game.scene.add(this.ring);this.line.visible=this.ring.visible=false;
 }
 toggle(){if(this.aiming){this.cancel();return;}if(this.g.player.riding){this.g.toast('Dismount before using Rise.');return;}this.g.releaseHeld(false);this.g.loom=false;this.g.activeAbility='rise';this.aiming=true;this.g.audio.play('attach');}
 cancel(){if(this.transit){const g=this.g;g.player.pos.copy(this.transit.start);g.player.mesh.position.copy(g.player.pos);g.player.vel.set(0,0,0);g.player.grounded=true;Object.assign(g.state.player,g.player.snapshot());g.mode='play';g.input.enabled=true;}this.transit=null;this.aiming=false;this.line.visible=this.ring.visible=false;}
 commit(){if(!this.preview?.valid){this.g.toast(this.preview?.reason||'No valid exit.');this.g.audio.play('error');return;}if(this.g.state.player.stamina<10){this.g.toast('Rise needs 10 stamina. Rest first.');return;}
  const g=this.g;this.transit={start:g.player.pos.clone(),end:new T.Vector3(this.preview.exit.x,this.preview.exit.y,this.preview.exit.z),time:0};g.player.mantle=null;g.player.gliding=false;g.player.grounded=false;g.player.vel.set(0,0,0);g.mode='rise';g.audio.play('sail');g.caption('The brace threads a path through the ceramic canopy.');
 }
 update(dt){
  const g=this.g;if(this.transit){const m=this.transit;m.time+=dt;const t=clamp(m.time/1.35,0,1),ease=t*t*(3-2*t);g.player.pos.lerpVectors(m.start,m.end,ease);g.player.mesh.position.copy(g.player.pos);g.player.mesh.rotation.y+=g.settings.reducedMotion?0:dt*.8;g.prompt={text:'Cancel Rise',key:g.input.label('ability'),sub:'Your entry point stays safe until you arrive'};
   if(t>=1){g.player.pos.copy(m.end);g.player.vel.set(0,0,0);g.player.grounded=true;g.state.player.stamina-=10;Object.assign(g.state.player,g.player.snapshot());this.transit=null;this.aiming=false;g.mode='play';this.line.visible=this.ring.visible=false;g.audio.play('attach');g.burst(g.player.pos.clone().add(new T.Vector3(0,.2,0)),0xc7f4c9,10);g.toast('Rise complete. Your sailcloth is ready for the descent.');}return;
  }
  this.line.visible=this.ring.visible=false;if(!this.aiming)return;
  this.preview=probeRise(g.player.pos,g.world.riseSurfaces,(x,z,y)=>g.world.obstacleAt(x,z,y));
  const start=g.player.pos.clone().add(new T.Vector3(0,1.7,0)),end=this.preview.valid?new T.Vector3(this.preview.exit.x,this.preview.exit.y+.1,this.preview.exit.z):start.clone().add(new T.Vector3(0,5,0));const p=this.line.geometry.attributes.position;p.setXYZ(0,start.x,start.y,start.z);p.setXYZ(1,end.x,end.y,end.z);p.needsUpdate=true;this.line.computeLineDistances();this.line.visible=true;this.line.material.color.set(this.preview.valid?0xc3eeba:0xd7ad89);if(this.preview.valid){this.ring.visible=true;this.ring.position.copy(end);this.ring.rotation.z=g.elapsed*.4;}
  g.prompt={text:this.preview.valid?'Rise · clear exit':'Rise unavailable',key:this.preview.valid?g.input.label('interact'):g.input.label('ability'),sub:this.preview.reason};
 }
}
