import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,transact,applyFact,discover,makeBlueprint,blueprintCost,reconstruct,encodeSave,decodeSave,validateState,SaveStore,questSummary} from '../dist/src/core.js';
import {questStage,SAVE_VERSION} from '../dist/src/data.js';

class MemoryStorage {
 constructor(){this.values=new Map();this.failOn=null;}
 getItem(key){return this.values.get(key)??null;}
 setItem(key,value){if(key===this.failOn)throw Error('Quota exceeded');this.values.set(key,String(value));}
 removeItem(key){this.values.delete(key);}
}

test('inventory transactions commit together and reject an unaffordable recipe without spending',()=>{
 const inv=freshState().inventory;
 const before=structuredClone(inv);
 assert.equal(transact(inv,{copper:-2,fiber:-20}),false);
 assert.deepEqual(inv,before);
 assert.equal(transact(inv,{copper:-2,fiber:-2}),true);
 assert.equal(inv.copper,1);assert.equal(inv.fiber,2);
 assert.equal(transact(inv,{broth:1000}),false);
 assert.equal(transact(inv,{copper:.5}),false);
 assert.equal(transact(inv,{invented:1}),false);
});

test('quest facts accept exploration and puzzle completion before speaking to the NPC',()=>{
 const s=freshState();assert.equal(questStage(s),0);
 assert.equal(discover(s,'bellwether'),true);assert.equal(discover(s,'bellwether'),false);
 assert.equal(questStage(s),2);
 assert.equal(applyFact(s,'intakeOpen'),true);assert.equal(questStage(s),3);
 assert.equal(applyFact(s,'route','roots'),true);assert.equal(questStage(s),4);
 assert.equal(s.inventory.regulator,1);
 applyFact(s,'metSella');assert.equal(questStage(s),4);
 applyFact(s,'rewarded');applyFact(s,'rewarded');
 assert.deepEqual(questSummary(s),{stage:5,completed:true,choice:'roots'});
 assert.equal(s.player.maxStamina,130);assert.equal(s.inventory.regulator,1);
});

test('reward prerequisites and route identities cannot be bypassed',()=>{
 const s=freshState();assert.equal(applyFact(s,'rewarded'),false);assert.equal(s.facts.rewarded,false);
 assert.equal(applyFact(s,'route','both'),false);assert.equal(s.facts.route,null);
 assert.equal(applyFact(s,'invented'),false);
});

test('versioned saves preserve inventory, objects, quest facts, discovery and blueprints',()=>{
 const s=freshState();applyFact(s,'route','channels');s.collected.push('shore-glass');s.inventory.glass=2;
 s.objects[0].socket='crossing-south';s.objects[0].z=47.6;
 s.blueprints.push(makeBlueprint('Crossing',s.objects.slice(0,2)));
 const encoded=encodeSave(s);assert.deepEqual(decodeSave(encoded),s);
 const envelope=JSON.parse(encoded);envelope.payload=envelope.payload.replace('channels','roots');
 assert.throws(()=>decodeSave(JSON.stringify(envelope)),/checksum/);
});

test('v1 saves migrate missing notes and blueprints; future and malformed saves fail validation',()=>{
 const legacy=freshState();legacy.version=1;delete legacy.pins;delete legacy.blueprints;
 const migrated=validateState(legacy);assert.equal(migrated.version,SAVE_VERSION);assert.deepEqual(migrated.pins,[]);assert.deepEqual(migrated.blueprints,[]);
 const future=freshState();future.version=99;assert.throws(()=>validateState(future),/version/);
 const bad=freshState();bad.inventory.copper=-1;assert.throws(()=>validateState(bad),/inventory/);
 const dup=freshState();dup.objects.push({...dup.objects[0]});assert.throws(()=>validateState(dup),/construction/);
});

test('primary save corruption recovers the last complete backup',()=>{
 const storage=new MemoryStorage(),store=new SaveStore(storage),s=freshState();
 store.write(s);s.inventory.copper=12;store.write(s);
 storage.setItem(store.key,'interrupted bytes');
 const recovered=store.load();assert.equal(recovered.inventory.copper,3);assert.match(store.error,/backup/);
});

test('a failed atomic replacement keeps the previous main save usable',()=>{
 const storage=new MemoryStorage(),store=new SaveStore(storage),s=freshState();store.write(s);
 s.inventory.copper=20;storage.failOn=store.key;
 assert.throws(()=>store.write(s),/Quota/);assert.equal(store.load().inventory.copper,3);
});

test('blueprints preserve relative arrangement and rotation and reconstruct actual parts',()=>{
 const s=freshState();s.inventory.copper=30;s.inventory.fiber=30;
 const parts=[{...s.objects[0],x:10,y:6,z:20,rot:Math.PI/2},{...s.objects[1],x:10,y:6,z:31.4,rot:0}];
 const bp=makeBlueprint('  Twin bridge  ',parts);assert.equal(bp.name,'Twin bridge');
 assert.deepEqual(blueprintCost(bp),{copper:2,fiber:4});
 const result=reconstruct(s,JSON.parse(JSON.stringify(bp)),{x:-20,y:8,z:55});assert.equal(result.ok,true);
 assert.equal(result.objects[1].z,66.4);assert.equal(result.objects[0].rot,Math.PI/2);
 assert.equal(result.objects[0].socket,null);assert.equal(result.objects[0].owned,true);
 assert.equal(s.inventory.copper,28);assert.equal(s.inventory.fiber,26);
 assert.doesNotThrow(()=>validateState(s));
});

test('missing construction materials or component limit leaves state unchanged',()=>{
 const s=freshState();s.inventory.copper=0;const bp=makeBlueprint('panel',[s.objects[0]]);const before=structuredClone(s);
 assert.equal(reconstruct(s,bp,{x:0,y:10,z:100}).ok,false);assert.deepEqual(s,before);
 s.objects=Array.from({length:24},(_,i)=>({...before.objects[0],id:'cap-'+i}));s.inventory.copper=10;
 const capped=structuredClone(s);assert.equal(reconstruct(s,bp,{x:0,y:10,z:100}).ok,false);assert.deepEqual(s,capped);
});

test('consecutive reconstructions always use unique stable IDs',()=>{
 const s=freshState();s.inventory.copper=99;s.inventory.fiber=99;const bp=makeBlueprint('panel',[s.objects[0]]);
 for(let i=0;i<8;i++)assert.equal(reconstruct(s,bp,{x:0,y:10,z:100}).ok,true);
 assert.equal(new Set(s.objects.map(o=>o.id)).size,s.objects.length);
 assert.doesNotThrow(()=>validateState(s));
});

test('out-of-bounds or invalid blueprint placements are rejected before materials are spent',()=>{
 const s=freshState();const bp=makeBlueprint('panel',[s.objects[0]]),before=structuredClone(s);
 assert.equal(reconstruct(s,bp,{x:9000,y:10,z:100}).ok,false);assert.deepEqual(s,before);
 assert.equal(reconstruct(s,bp,{x:NaN,y:10,z:100}).ok,false);assert.deepEqual(s,before);
});
