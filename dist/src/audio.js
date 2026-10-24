export class AudioSystem{
 constructor(settings){this.settings=settings;this.context=null;this.time=0;this.step=0;this.lastFoot=0;this.caption=()=>{};this.focused=true;}
 start(){
  if(this.context){this.context.resume();return;}
  const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
  this.context=new AudioContext();const c=this.context;this.master=c.createGain();this.master.gain.value=.52*this.settings.master;this.master.connect(c.destination);this.buses={};
  for(const k of ['music','sfx','ambient']){const g=c.createGain();g.gain.value=this.settings[k];g.connect(this.master);this.buses[k]=g;}
  const buffer=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=buffer.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v=(v+(Math.random()*2-1)*.025)*.995;d[i]=v;}
  const noise=c.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=440;const gain=c.createGain();gain.gain.value=.2;noise.connect(filter).connect(gain).connect(this.buses.ambient);noise.start();
 }
 apply(){if(this.context){for(const[k,g]of Object.entries(this.buses))g.gain.setTargetAtTime(Number(this.settings[k])||0,this.context.currentTime,.08);this.master.gain.setTargetAtTime(this.settings.muteUnfocused&&!this.focused?0:.52*this.settings.master,this.context.currentTime,.08);}}
 focus(focused){this.focused=focused;this.apply();}
 tone(freq,duration=.2,type='sine',volume=.2,bus='sfx',delay=0,endFreq=null){
  const c=this.context;if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(this.buses[bus]);o.start(t);o.stop(t+duration+.05);
 }
 play(id){
  if(id==='attach'){this.tone(330,.24,'triangle',.3);this.tone(660,.4,'sine',.25,'sfx',.08);}
  if(id==='detach'){this.tone(440,.16,'triangle',.16,'sfx',0,150);}
  if(id==='error')this.tone(120,.18,'triangle',.2,'sfx',0,80);
  if(id==='pickup'){this.tone(587,.2,'sine',.25);this.tone(880,.4,'sine',.15,'sfx',.1);}
  if(id==='discover'){[293.66,440,587.33,659.25].forEach((n,i)=>this.tone(n,1.5,'sine',.15,'sfx',i*.18));}
  if(id==='swing')this.tone(170,.12,'sawtooth',.07,'sfx',0,40);
  if(id==='hit'){this.tone(80,.18,'triangle',.4,'sfx',0,25);this.tone(330,.1,'square',.06);}
  if(id==='guard'){this.tone(740,.4,'triangle',.23);this.tone(1110,.3,'sine',.14,'sfx',.05);}
  if(id==='hurt')this.tone(110,.4,'triangle',.35,'sfx',0,45);
  if(id==='jump')this.tone(160,.13,'sine',.12,'sfx',0,320);
  if(id==='echo'){this.tone(740,.65,'sine',.12,'sfx',0,185);this.tone(370,.9,'triangle',.055,'sfx',.09,92.5);}
  if(id==='sail')this.tone(460,.45,'sine',.07,'sfx',0,220);
  if(id==='step')this.tone(70+Math.random()*25,.07,'triangle',.09);
  if(id==='water')this.tone(260,.18,'sine',.12,'sfx',0,80);
  if(id==='menu')this.tone(540,.09,'sine',.09);
  if(id==='bell'){[147,293.66,440.5,589,738].forEach((n,i)=>this.tone(n,3-i*.2,'sine',.17/(i*.3+1),'sfx',.06*i));this.caption('The weather bell rings. Water begins to move.');}
 }
 update(dt,playing,zone){if(!this.context||!playing)return;this.time+=dt;if(this.time>5.2){this.time=0;const notes=zone==='hollow'?[220,293.66,329.63,440,493.88]:[196,220,293.66,329.63,440];const n=notes[[0,2,4,1,3,2,0,4][this.step++%8]];this.tone(n,3.8,'sine',.08,'music');if(this.step%3===0)this.tone(n/2,5,'triangle',.055,'music',.35);}}
}
