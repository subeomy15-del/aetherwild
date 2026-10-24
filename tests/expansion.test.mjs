import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {freshState,SaveStore,encodeSave,decodeSave,sanitizeSettings} from '../dist/src/core.js';
import {SaveSlots} from '../dist/src/save-slots.js';
import {probeRise} from '../dist/src/rise.js';
import {Player} from '../dist/src/player.js';
import {World} from '../dist/src/world.js';
import {DEFAULT_SETTINGS,heightAt} from '../dist/src/data.js';
class MemoryStorage{constructor(){this.map=new Map();}getItem(k){return this.map.get(k)??null;}setItem(k,v){this.map.set(k,String(v));}removeItem(k){this.map.delete(k);}}
test('legacy v2 progress migrates to v4 without erasing choices, parts, inventory or discovery',()=>{
 const old=freshState();old.version=2;delete old.expedition;delete old.abilities;old.facts.route='roots';old.facts.intakeOpen=true;old.inventory.copper=17;old.discovered.push('bellwether');old.objects[0].socket='crossing-south';
 const migrated=decodeSave(encodeSave(old));assert.equal(migrated.version,4);assert.equal(migrated.inventory.copper,17);assert.equal(migrated.facts.route,'roots');assert.equal(migrated.objects[0].socket,'crossing-south');assert.ok(migrated.discovered.includes('bellwether'));assert.deepEqual(migrated.abilities,['weave','rise','echo']);
});
test('named expedition creation preserves legacy data and rejects occupied slots',()=>{
 const storage=new MemoryStorage(),legacy=new SaveStore(storage),first=freshState();first.facts.metSella=true;legacy.write(first);const original=storage.getItem(legacy.key);const slots=new SaveSlots(storage);
 const second=slots.create('A different road','2');assert.equal(second.expedition.name,'A different road');assert.equal(storage.getItem(legacy.key),original);assert.equal(slots.active,'2');assert.throws(()=>slots.create('Overwrite','1'),/already holds/);assert.equal(storage.getItem(legacy.key),original);
 const reloaded=new SaveSlots(storage);assert.equal(reloaded.active,'2');assert.equal(reloaded.store('1').load().facts.metSella,true);assert.equal(reloaded.store('2').load().expedition.name,'A different road');
});
test('a corrupt expedition is preserved and cannot be silently replaced',()=>{
 const storage=new MemoryStorage();storage.setItem('aetherwild.save.v2','broken');const slots=new SaveSlots(storage);assert.equal(slots.list()[0].occupied,true);assert.equal(slots.list()[0].state,null);assert.throws(()=>slots.create('New','1'),/already holds/);assert.equal(storage.getItem('aetherwild.save.v2'),'broken');
});
const ceiling={id:'roof',x:0,z:0,w:18,d:18,bottom:11.4,top:12};
test('Rise accepts a clear thin canopy and rejects missing, distant, thick, moving or obstructed exits',()=>{
 assert.equal(probeRise({x:0,y:0,z:0},[ceiling]).valid,true);
 assert.match(probeRise({x:30,y:0,z:0},[ceiling]).reason,/No suitable/);
 assert.match(probeRise({x:0,y:-10,z:0},[ceiling]).reason,/16-pace/);
 assert.match(probeRise({x:0,y:0,z:0},[{...ceiling,top:16}]).reason,/thick/);
 assert.match(probeRise({x:0,y:0,z:0},[{...ceiling,moving:true}]).reason,/moving/);
 assert.match(probeRise({x:0,y:0,z:0},[ceiling],()=>({})).reason,/room/);
 assert.match(probeRise({x:0,y:0,z:0},[ceiling,{...ceiling,id:'upper',bottom:13,top:14}]).reason,/blocks/);
});
test('saved settings reject malformed values and clamp renderer budgets',()=>{
 const s=sanitizeSettings({resolution:99,vegetation:-2,textScale:Infinity,quality:'ultra',showMinimap:'no',bindings:{interact:'<script>'}});
 assert.equal(s.resolution,1.5);assert.equal(s.vegetation,.3);assert.equal(s.textScale,DEFAULT_SETTINGS.textScale);assert.equal(s.quality,'high');assert.equal(s.showMinimap,true);assert.equal(s.bindings.interact,'KeyE');
});
function playerGame(){
 const input={held:new Set(),mouse:{x:0,y:0,wheel:0},look:{x:0,y:0},hit:()=>false,down:()=>false,axes:()=>({x:0,y:0}),label:a=>a};
 const game={state:freshState(),settings:structuredClone(DEFAULT_SETTINGS),scene:new T.Scene(),camera:new T.PerspectiveCamera(57,1.6,.12,1050),input,elapsed:0,loom:false,held:null,enemies:[],audio:{play(){},lastFoot:0},toast(){},heal(){},damage(){},respawn(){},combatHit(){},world:{surfaceAt(x,z){return {height:heightAt(x,z),platform:null};},obstacleAt(){return null;}}};return game;
}
test('shore camera keeps following distance and clears the bank rather than filling the view with the player',()=>{
 const g=playerGame(),p=new Player(g);p.pos.set(-21.7,2.6,48.2);p.swimming=true;p.camera(1/60);assert.ok(Math.hypot(g.camera.position.x-p.pos.x,g.camera.position.z-p.pos.z)>=3.8);assert.ok(g.camera.position.y>=heightAt(g.camera.position.x,g.camera.position.z)+.7);assert.ok(g.camera.position.toArray().every(Number.isFinite));
});
test('a shoreline mantle reaches a stable bridge top and spends bounded stamina',()=>{
 const g=playerGame(),p=new Player(g);p.pos.set(-24.8,2.6,48.2);p.swimming=true;g.world.surfaceAt=(x,z)=>({height:x<=-25.1&&x>=-30.9&&z>=41.9&&z<=53.3?5.775:.6,platform:null});
 assert.equal(p.tryMantle(-1,0),true);assert.equal(g.state.player.stamina,90);for(let i=0;i<60;i++)p.advanceMantle(1/60);assert.equal(p.mantle,null);assert.ok(Math.abs(p.pos.y-5.8)<.001);assert.equal(p.grounded,true);
});
test('camera obstruction is resolved on the player side of a closed iris',()=>{
 const g=playerGame(),p=new Player(g);p.pos.set(-3.7,19.2,-96.5);p.yaw=2.4;g.world.cameraObstacleAt=(x,y,z)=>Math.abs(x)<4.25&&Math.abs(z+99)<.5&&y>19&&y<26;p.camera(1/60);assert.ok(g.camera.position.z>-98.5);assert.ok(g.camera.position.toArray().every(Number.isFinite));
});
test('riding uses a wider camera orbit and returns smoothly to walking distance',()=>{
 const g=playerGame(),p=new Player(g);p.riding='raft';p.camera(1/60);assert.ok(Math.hypot(g.camera.position.x-p.pos.x,g.camera.position.z-p.pos.z)>9);p.riding=null;p.camera(1/60);assert.ok(p.cameraOrbitDistance>9);for(let i=0;i<180;i++)p.camera(1/60);assert.ok(p.cameraOrbitDistance<6.5);
});
test('the route choice creates a physical road crossing or a bounded usable updraft',()=>{
 const state=freshState(),world={solids:[]};state.facts.route='channels';
 assert.equal(World.prototype.surfaceAt.call(world,0,42,6,state).platform,'restored-road');state.facts.route='roots';assert.equal(World.prototype.surfaceAt.call(world,0,42,6,state).platform,null);
 const h=heightAt(76,-44);assert.equal(World.prototype.windAt(76,h+4,-44,state).y,7);assert.equal(World.prototype.windAt(76,h+25,-44,state).y,0);assert.equal(World.prototype.windAt(110,h+4,-44,state).y,0);
 const g=playerGame(),p=new Player(g);g.state.facts.route='roots';p.pos.set(76,h+6,-44);p.grounded=false;p.gliding=true;g.world.windAt=World.prototype.windAt;
 for(let i=0;i<60;i++){g.elapsed+=1/60;p.update(1/60);}assert.ok(p.pos.y>h+7);assert.ok(g.state.player.stamina<100);assert.ok(p.pos.toArray().every(Number.isFinite));
});
test('airborne state changes cannot refill stamina, and Echo suppresses grounded regeneration during playback',()=>{
 const g=playerGame(),p=new Player(g);g.state.player.stamina=40;p.pos.set(0,30,109);p.grounded=false;p.vel.y=0;
 for(let i=0;i<15;i++)p.update(1/60);assert.equal(g.state.player.stamina,40);
 p.pos.set(0,10,109);p.vel.set(0,0,0);p.grounded=true;g.echo={playback:{id:'weight'}};p.update(1/60);assert.equal(g.state.player.stamina,40);g.echo.playback=null;p.update(1/60);assert.ok(g.state.player.stamina>40);
});
