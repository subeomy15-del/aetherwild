import * as T from '../vendor/three.module.js';
import {COMPONENTS,heightAt} from './data.js';
import {MotionHistory,MotionPlayback,MAX_SAMPLES} from './motion-history.js';
export class EchoSystem{
 constructor(g){this.g=g;this.history=new MotionHistory();this.clock=0;this.aiming=false;this.playback=null;
  this.line=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:0xffcd87,transparent:true,opacity:.85,depthWrite:false}));this.line.geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(MAX_SAMPLES*3),3));this.outline=new T.BoxHelper(new T.Object3D(),0xffd394);this.outline.visible=false;g.scene.add(this.outline);this.line.frustumCulled=false;this.line.visible=false;g.scene.add(this.line);
  this.ghost=new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:0xffcd87,wireframe:true,transparent:true,opacity:.55}));this.ghost.visible=false;g.scene.add(this.ghost);
 }
 reset(){this.cancel();this.history.clear();this.clock=0;}
 cancel(){if(this.playback)this.history.clear(this.playback.id);this.playback=null;this.aiming=false;this.line.visible=this.ghost.visible=this.outline.visible=false;}
 toggle(){if(this.aiming){this.cancel();return;}this.g.releaseHeld(false);this.g.rise.cancel();this.g.loom=false;this.g.activeAbility='echo';this.g.player.locked=null;this.aiming=true;this.g.audio.play('attach');}
 reason(o){const g=this.g;if(!g.state.objects.includes(o)||Math.hypot(o.x-g.player.pos.x,o.z-g.player.pos.z)>24)return 'The object is outside Echo’s 24-pace reach.';if(o.socket)return 'Attached part: detach it with Threadbind first.';if(g.held?.id===o.id)return 'Release the held object first.';if(g.player.riding===o.id)return 'Dismount first. Seated vehicles cannot be rewound.';
  const [w,h,d]=COMPONENTS[o.kind].size,p=g.player.pos;if(Math.abs(p.x-o.x)<Math.max(w,d)/2+.6&&Math.abs(p.z-o.z)<Math.max(w,d)/2+.6&&p.y>o.y-h/2-1&&p.y<o.y+h/2+2.2)return 'Step away from the object. Echo does not carry passengers.';
  const path=this.history.path(o.id);if(path.length<2||!path.some(v=>Math.hypot(v.x-o.x,v.y-o.y,v.z-o.z)>.25))return 'No movement recorded. Try the courier weight east of camp.';return null;
 }
 commit(){if(this.playback)return;const o=this.target,g=this.g;if(!o){g.toast('Look toward a marked movable object within 24 paces.');return;}const reason=this.reason(o);if(reason){g.toast(reason);return;}if(g.state.player.stamina<10){g.toast('Echo needs 10 stamina. Rest on solid ground.');return;}g.state.player.stamina-=10;this.playback={id:o.id,motion:new MotionPlayback(this.history.path(o.id))};if(o.id==='echo-courier'||o.id==='sky-courier'){o.driveStopped=true;}if(o.id==='sky-courier'&&g.state.journey)g.state.journey.echoUsed=true;g.audio.play('echo');g.caption('Echo returns one object along its recent path. Rewards and history stay unchanged.');}
 blocked(o,p){const g=this.g,[w,h,d]=COMPONENTS[o.kind].size;
  if(Math.abs(p.x)>(g.world.surfaceWideActive?5990:183)||Math.abs(p.z)>(g.world.surfaceWideActive?4990:183)||p.y-h/2<heightAt(p.x,p.z)-.2)return true;
  for(const [dx,dz]of [[0,0],[w/2,d/2],[-w/2,d/2],[w/2,-d/2],[-w/2,-d/2]])if(g.world.obstacleAt(p.x+dx,p.z+dz,p.y-h/2+.1))return true;
  for(const other of g.state.objects){if(other.id===o.id)continue;const [ow,oh,od]=COMPONENTS[other.kind].size;if(Math.abs(p.x-other.x)<(Math.max(w,d)+Math.max(ow,od))/2-.15&&Math.abs(p.z-other.z)<(Math.max(w,d)+Math.max(ow,od))/2-.15&&Math.abs(p.y-other.y)<(h+oh)/2-.1)return true;}
  const a=g.player.pos;return Math.abs(a.x-p.x)<Math.max(w,d)/2+.5&&Math.abs(a.z-p.z)<Math.max(w,d)/2+.5&&a.y<p.y+h/2+.2&&a.y+2>p.y-h/2;
 }
 tick(dt){const g=this.g;this.clock+=dt;this.history.retain(g.state.objects.map(o=>o.id));
  const courier=g.state.objects.find(o=>o.id==='echo-courier');if(courier&&!courier.driveStopped&&!g.held&& !courier.socket&&this.playback?.id!==courier.id){const next={...courier,x:Math.min(33,courier.x+dt*2)};if(courier.z===91&&courier.x>=18&&courier.x<33&&!this.blocked(courier,next))courier.x=next.x;}
  if(this.playback){const o=g.state.objects.find(o=>o.id===this.playback.id),m=this.playback.motion;if(!o||o.socket){this.cancel();return;}const next=m.step(dt,o,p=>this.blocked(o,p));Object.assign(o,next);g.state.player.stamina=Math.max(0,g.state.player.stamina-dt*2);if(m.done||g.state.player.stamina===0){const reason=m.reason;this.cancel();g.toast(reason||'Echo settled. The object stays here.');}}
  for(const o of g.state.objects)if(!o.socket&&o.id!==g.held?.id&&o.id!==this.playback?.id)this.history.record(o.id,this.clock,o);
 }
 drawPath(o,path){const mesh=this.g.world.objectMeshes?.get(o.id);if(mesh){this.outline.setFromObject(mesh);this.outline.visible=true;}const attr=this.line.geometry.attributes.position;path.forEach((v,i)=>attr.setXYZ(i,v.x,v.y,v.z));attr.needsUpdate=true;this.line.geometry.setDrawRange(0,path.length);this.line.visible=path.length>1;if(path.length){const v=path[0];this.ghost.position.set(v.x,v.y,v.z);this.ghost.rotation.y=v.rot;this.ghost.scale.set(...COMPONENTS[o.kind].size);this.ghost.visible=true;}}
 preview(){this.line.visible=this.ghost.visible=this.outline.visible=false;if(!this.aiming||this.g.mode!=='play')return;const g=this.g,p=g.player.pos;let score=-Infinity;this.target=null;
  for(const o of g.state.objects){const dx=o.x-p.x,dz=o.z-p.z,d=Math.hypot(dx,dz),dot=(-Math.sin(g.player.yaw)*dx-Math.cos(g.player.yaw)*dz)/(d||1);if(d>24||dot<.72&&d>5)continue;const s=dot*6-d*.2;if(s>score){score=s;this.target=o;}}
  const o=this.target;if(this.playback){const moving=g.state.objects.find(v=>v.id===this.playback.id);if(moving)this.drawPath(moving,this.playback.motion.samples);g.prompt={text:'Echo · returning movement',key:g.input.label('ability'),sub:'Cancel to settle here · '+(this.playback.motion.cursor-this.playback.motion.end).toFixed(1)+' seconds remain'};return;}
  if(!o){g.prompt={text:'Echo · look at a movable object',sub:'24-pace reach · 8 seconds of recent motion · 10 stamina + 2 / second'};return;}
  const reason=this.reason(o),path=this.history.path(o.id);this.drawPath(o,path);
  g.prompt={text:reason?'Echo unavailable':'Echo · return '+COMPONENTS[o.kind].name,key:reason?g.input.label('ability'):g.input.label('interact'),sub:reason||'Amber trail = recorded motion · '+(path.at(-1).time-path[0].time).toFixed(1)+' seconds · 10 stamina + 2 / second'};
 }
}
