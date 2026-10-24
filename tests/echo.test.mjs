import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {MotionHistory,MotionPlayback,interpolatePose,MAX_SAMPLES,MAX_TRACKS} from '../dist/src/motion-history.js';
import {EchoSystem} from '../dist/src/echo.js';
import {freshState,validateState,encodeSave,decodeSave} from '../dist/src/core.js';
const pose=x=>({x,y:12,z:91,rot:0});
test('motion buffers bound time, samples and entity count, prune removed entities, and reject invalid samples',()=>{
 const h=new MotionHistory();for(let i=0;i<2000;i++)h.record('weight',i*.05,pose(i*.01));const path=h.path('weight');assert.ok(path.length<=MAX_SAMPLES);assert.ok(path.at(-1).time-path[0].time<=8.001);assert.equal(h.record('weight',-1,pose(0)),false);assert.equal(h.record('bad',100,{...pose(1),x:NaN}),false);
 for(let i=0;i<100;i++)h.record('p'+i,1,pose(0));assert.equal(h.tracks.size,MAX_TRACKS);h.retain(['weight']);assert.equal(h.tracks.size,1);h.clear();assert.equal(h.tracks.size,0);
});
test('yaw interpolation follows the shortest arc at the angle boundary',()=>{
 const p=interpolatePose({...pose(0),rot:Math.PI-.1},{...pose(1),rot:-Math.PI+.1},.5);assert.ok(Math.abs(p.rot-Math.PI)<1e-9);assert.equal(p.x,.5);
});
test('playback freezes without steps, clamps long frames, stops before an obstruction and cannot traverse a teleport',()=>{
 const samples=[{...pose(0),time:0},{...pose(2),time:1}],m=new MotionPlayback(samples);let p=pose(2);assert.equal(m.cursor,1);p=m.step(100,p);assert.ok(p.x>1.9);assert.ok(m.cursor>.95);
 for(let i=0;i<30&&!m.done;i++)p=m.step(.04,p,v=>v.x<1);assert.ok(p.x>=1);assert.match(m.reason,/obstructed/);const h=new MotionHistory();h.record('x',0,pose(0));h.record('x',1,pose(20));assert.equal(h.path('x').length,1);
});
function game(){return {scene:new T.Scene(),state:freshState(),player:{pos:new T.Vector3(12,10,87),yaw:-Math.PI/2},world:{obstacleAt:()=>null},releaseHeld(){},rise:{cancel(){}},audio:{play(){}},toast(){},caption(){},input:{label:a=>a}};}
test('Echo settles on cancellation, blocks seated and attached objects, spends stamina once, and never changes rewards',()=>{
 const g=game(),e=new EchoSystem(g),o=g.state.objects.find(v=>v.id==='echo-courier');e.target=o;for(let i=0;i<=20;i++)e.history.record(o.id,i*.05,{...o,x:18+i*.1});o.x=20;g.state.collected.push('proof');const before=structuredClone(g.state.inventory);e.commit();assert.ok(e.playback);assert.equal(g.state.player.stamina,90);e.tick(.04);assert.ok(o.x<20);const at=o.x;e.cancel();e.tick(.04);assert.equal(o.x,at);assert.deepEqual(g.state.inventory,before);assert.deepEqual(g.state.collected,['proof']);assert.equal(o.driveStopped,true);
 o.socket='test';assert.match(e.reason(o),/Attached/);o.socket=null;g.player.riding=o.id;assert.match(e.reason(o),/Dismount/);g.player.riding=null;g.player.pos.set(o.x,o.y+1.4,o.z);assert.match(e.reason(o),/passengers/);
});
test('v3 migration preserves expeditions, choices and components; Echo history is session-only',()=>{
 const old=freshState();old.version=3;old.abilities=['weave','rise'];old.objects=old.objects.filter(o=>o.id!=='echo-courier');old.facts.route='channels';old.facts.rewarded=true;old.inventory.copper=37;const v=validateState(old);assert.equal(v.version,7);assert.equal(v.inventory.copper,37);assert.equal(v.facts.route,'channels');assert.ok(v.objects.some(o=>o.id==='echo-courier'));assert.equal(v.objects[0].id,old.objects[0].id);assert.ok(v.abilities.includes('echo'));assert.deepEqual(decodeSave(encodeSave(v)),v);assert.equal('history' in v,false);
});

test('courier rewards commit atomically, survive reload and cannot be claimed twice or from an invalid position',async()=>{
 const {claimCourierArchive}=await import('../dist/src/core.js');const s=freshState(),before=structuredClone(s);assert.equal(claimCourierArchive(s).ok,false);assert.deepEqual(s,before);const weight=s.objects.find(o=>o.id==='echo-courier');weight.x=25.5;weight.driveStopped=true;s.inventory.copper=998;const full=structuredClone(s);assert.equal(claimCourierArchive(s).ok,false);assert.deepEqual(s,full);s.inventory.copper=3;assert.equal(claimCourierArchive(s).ok,true);assert.equal(s.inventory.copper,6);assert.equal(s.blueprints.at(-1).parts.length,2);const loaded=decodeSave(encodeSave(s)),saved=structuredClone(loaded);assert.equal(claimCourierArchive(loaded).ok,false);assert.deepEqual(loaded,saved);
});
test('Echo obstruction and removal exit playback without transferring ownership or serializing sample timestamps',()=>{
 const g=game(),e=new EchoSystem(g),o=g.state.objects.find(v=>v.id==='echo-courier');for(let i=0;i<=20;i++)e.history.record(o.id,i*.05,{...o,x:18+i*.1});o.x=20;e.target=o;e.commit();g.world.obstacleAt=()=>({});e.tick(.04);assert.equal(e.playback,null);assert.equal(o.x,20);assert.equal('time' in o,false);g.world.obstacleAt=()=>null;e.history.record(o.id,2,{...o,x:19});e.history.record(o.id,3,{...o,x:20});e.target=o;e.commit();assert.ok(e.playback);g.state.objects=g.state.objects.filter(v=>v.id!==o.id);e.tick(.04);assert.equal(e.playback,null);assert.equal(e.history.tracks.has(o.id),false);
});
