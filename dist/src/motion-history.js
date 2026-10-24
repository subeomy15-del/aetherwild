// Session-only, bounded kinematic histories. Never serialised into expedition saves.
export const HISTORY_SECONDS=8, SAMPLE_INTERVAL=.05, MAX_SAMPLES=162, MAX_TRACKS=24;
const finite=p=>p&&['x','y','z','rot'].every(k=>Number.isFinite(p[k]));
export function interpolatePose(a,b,t){const d=Math.atan2(Math.sin(b.rot-a.rot),Math.cos(b.rot-a.rot));return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,rot:a.rot+d*t};}
export function poseAt(samples,time){if(!samples?.length)return null;if(time<=samples[0].time)return interpolatePose(samples[0],samples[0],0);for(let i=1;i<samples.length;i++)if(samples[i].time>=time){const a=samples[i-1],b=samples[i];return interpolatePose(a,b,(time-a.time)/(b.time-a.time));}return interpolatePose(samples.at(-1),samples.at(-1),0);}
export class MotionHistory{
 constructor(){this.tracks=new Map();}
 clear(id){if(id)this.tracks.delete(id);else this.tracks.clear();}
 retain(ids){const live=new Set(ids);for(const id of this.tracks.keys())if(!live.has(id))this.tracks.delete(id);}
 record(id,time,pose){
  if(typeof id!=='string'||!Number.isFinite(time)||!finite(pose))return false;
  let h=this.tracks.get(id);if(!h){if(this.tracks.size>=MAX_TRACKS)return false;h=[];this.tracks.set(id,h);}
  const last=h.at(-1);if(last&&time-last.time<SAMPLE_INTERVAL-1e-6)return false;
  // Teleports and construction commits start a new path; never sweep through walls.
  if(last&&Math.hypot(pose.x-last.x,pose.y-last.y,pose.z-last.z)>4)h.length=0;
  h.push({time,x:pose.x,y:pose.y,z:pose.z,rot:pose.rot});while(h.length>MAX_SAMPLES||h.length>1&&time-h[0].time>HISTORY_SECONDS)h.shift();return true;
 }
 path(id){return (this.tracks.get(id)||[]).map(p=>({...p}));}
}
export class MotionPlayback{
 constructor(samples){if(samples.length<2)throw Error('No recorded movement.');this.samples=samples.map(p=>({...p}));this.cursor=samples.at(-1).time;this.end=samples[0].time;this.done=false;}
 step(dt,current,blocked=()=>false){if(this.done||!Number.isFinite(dt)||dt<=0)return current;const next=Math.max(this.end,this.cursor-Math.min(dt,.04));const pose=poseAt(this.samples,next),distance=Math.hypot(pose.x-current.x,pose.y-current.y,pose.z-current.z);const steps=Math.ceil(distance/.2)||1;
  if(steps>24){this.done=true;this.reason='The recorded path has a discontinuity.';return current;}
  for(let i=1;i<=steps;i++)if(blocked(interpolatePose(current,pose,i/steps))){this.done=true;this.reason='The recorded path is obstructed.';return current;}
  this.cursor=next;this.done=next<=this.end;return pose;
 }
}
