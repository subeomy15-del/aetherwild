import * as T from '../vendor/three.module.js';
import {clamp,smooth,OPENING} from './data.js';
export class Opening{
 constructor(game){
  this.g=game;this.time=0;this.done=false;this.triggered=false;
  this.overlay=document.createElement('div');this.overlay.className='cinema';this.overlay.innerHTML='<div class="cinema-bar top"></div><div class="cinema-bar bottom"></div><div class="cinema-chapter"><span>THE NEXT CYCLE HAS ALREADY BEEN SCHEDULED</span><h2>Mossglass Basin</h2></div><div class="cinema-dialogue"><span>EDA · LAST RECORDED TRANSMISSION</span><p>“'+OPENING.edaQuote+'”</p></div><button class="cinema-skip">Hold on to the thread <b>[ SPACE ] Skip</b></button>';
  game.ui.overlay.innerHTML='';game.ui.overlay.append(this.overlay);game.ui.hud.hidden=true;game.mode='opening';game.input.enabled=false;game.input.unlock();
  this.overlay.querySelector('button').addEventListener('click',()=>this.finish());
  this.ring=new T.Mesh(new T.RingGeometry(.93,1,128),new T.MeshBasicMaterial({color:0x8bf5d2,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));this.ring.rotation.x=-Math.PI/2;this.ring.position.set(0,21,-105);game.scene.add(this.ring);
  this.beam=new T.Mesh(new T.CylinderGeometry(.18,.4,170,16,1,true),new T.MeshBasicMaterial({color:0xb3fce4,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));this.beam.position.set(0,105,-109);game.scene.add(this.beam);
  game.audio.tone(98,7,'sine',.13,'music');game.audio.tone(147,9,'sine',.075,'music',1.2);
 }
 update(dt){
  if(this.done)return;this.time+=dt;const t=this.time,g=this.g,reduced=g.settings.reducedMotion;
  this.overlay.style.setProperty('--cinema-time',t);
  this.overlay.querySelector('.cinema-chapter').style.opacity=clamp(Math.min(t/.7,(4.3-t)/1.1),0,1);
  this.overlay.querySelector('.cinema-dialogue').style.opacity=clamp(Math.min((t-4.7)/.8,(11.5-t)/1.2),0,1);
  const camStart=new T.Vector3(27,19.5,119),camEnd=new T.Vector3(10,17,112);const a=smooth(0,11,t);
  g.camera.position.lerpVectors(camStart,camEnd,reduced?0:a);g.camera.lookAt(new T.Vector3(-2,16,-58));
  if(t>3.1&&!this.triggered){this.triggered=true;g.audio.play('bell');g.caption('A pulse rolls out from Bellwether. Eda’s voice breaks through the Loom.');g.burst(new T.Vector3(0,43,-109),0xc0ffe0,32);}
  const pulse=clamp((t-3.1)/3.3,0,1);this.ring.scale.setScalar(1+pulse*190);this.ring.material.opacity=t>3.1?(1-pulse)*.48:0;this.ring.position.y=18-pulse*4;this.beam.material.opacity=t>3.1&&t<6?Math.sin((t-3.1)/2.9*Math.PI)*.42:0;
  if(t>11.7)this.finish();
 }
 finish(){if(this.done)return;this.done=true;const g=this.g;g.scene.remove(this.ring,this.beam);this.ring.geometry.dispose();this.ring.material.dispose();this.beam.geometry.dispose();this.beam.material.dispose();g.opening=null;g.player.camInitialized=false;g.ui.play();g.toast('Find Sella. Eda’s courier has returned east of camp.');g.toast(g.input.label('forward')+' move · '+g.input.label('sprint')+' sprint · '+g.input.label('jump')+' jump / sailcloth · '+g.input.label('interact')+' interact');g.save(false);}
}
