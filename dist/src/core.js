import {SAVE_VERSION,START,INITIAL_OBJECTS,DEFAULT_SETTINGS,COMPONENTS,clamp,questStage} from './data.js';
export const clone = v => JSON.parse(JSON.stringify(v));
let idSequence=0;
function nextId(prefix,occupied=[]){
 const ids=new Set(occupied);let id;
 do{id=prefix+'-'+Date.now().toString(36)+'-'+(idSequence++).toString(36);}while([...ids].some(existing=>existing===id||existing.startsWith(id+'-')));
 return id;
}
export function freshState(){return {version:SAVE_VERSION,player:{...START,hp:6,maxHp:6,stamina:100,maxStamina:100},safe:{...START},inventory:{copper:3,fiber:4,broth:3,glass:0,regulator:0},facts:{metSella:false,intakeOpen:false,route:null,rewarded:false},discovered:['reedwake'],collected:[],defeated:[],objects:clone(INITIAL_OBJECTS),blueprints:[],pins:[],playtime:0,saveTime:null};}
export function transact(inventory,delta){
 if(!inventory||!delta||Object.entries(delta).some(([k,n])=>!Object.hasOwn(inventory,k)||!Number.isSafeInteger(n)||inventory[k]+n<0||inventory[k]+n>999))return false;
 for(const [k,n] of Object.entries(delta))inventory[k]+=n;return true;
}
export function applyFact(state,key,value=true){
 if(!Object.hasOwn(state.facts,key))return false;
 if(key==='route'&&!['roots','channels'].includes(value))return false;
 state.facts[key]=value;
 if(key==='route'){state.facts.intakeOpen=true;state.inventory.regulator=1;}
 if(key==='rewarded'){
   if(!state.facts.route){state.facts.rewarded=false;return false;}
   state.player.maxStamina=130;state.player.stamina=130;
 }
 return true;
}
export function discover(state,id){if(state.discovered.includes(id))return false;state.discovered.push(id);return true;}
export function makeBlueprint(name,objects){
 if(typeof name!=='string'||!name.trim()||!Array.isArray(objects)||!objects.length||objects.length>12)throw Error('Choose 1–12 nearby components.');
 const origin=objects[0];
 const parts=objects.map(o=>{
   if(!COMPONENTS[o.kind]||!['x','y','z'].every(k=>Number.isFinite(o[k]))||!Number.isFinite(o.rot??0))throw Error('Invalid component data.');
   return {kind:o.kind,x:Math.round((o.x-origin.x)*100)/100,y:Math.round((o.y-origin.y)*100)/100,z:Math.round((o.z-origin.z)*100)/100,rot:o.rot||0};
 });
 if(parts.some(p=>['x','y','z','rot'].some(k=>Math.abs(p[k])>=400)))throw Error('This arrangement is too large to record.');
 return {id:nextId('bp'),name:name.trim().slice(0,32),parts};
}
export function blueprintCost(bp){const cost={};for(const p of bp.parts)for(const [k,n]of Object.entries(COMPONENTS[p.kind]?.cost||{}))cost[k]=(cost[k]||0)+n;return cost;}
export function reconstruct(state,bp,origin){
 if(!Array.isArray(bp?.parts)||!bp.parts.length||bp.parts.length>12||state.objects.length+bp.parts.length>24)return {ok:false,message:'The field limit is 24 components. Dismantle a build first.'};
 if(!bp.parts.every(p=>COMPONENTS[p.kind]&&[p.x,p.y,p.z,p.rot].every(Number.isFinite)))return {ok:false,message:'This blueprint has invalid component data.'};
 if(!origin||!['x','y','z'].every(k=>Number.isFinite(origin[k])))return {ok:false,message:'Choose a valid place for this build.'};
 const id=nextId('build',state.objects.map(o=>o.id));
 const objects=bp.parts.map((p,i)=>({...p,id:`${id}-${i}`,x:p.x+origin.x,y:p.y+origin.y,z:p.z+origin.z,socket:null,owned:true}));
 if(objects.some(o=>Math.abs(o.x)>=205||Math.abs(o.z)>=205||o.y<=-10||o.y>=200))return {ok:false,message:'This build would leave the surveyed basin. Move farther from the boundary.'};
 const cost=blueprintCost(bp);
 if(!transact(state.inventory,Object.fromEntries(Object.entries(cost).map(([k,v])=>[k,-v]))))return {ok:false,message:'Missing materials: '+Object.entries(cost).map(([k,v])=>v+' '+k).join(', ')};
 state.objects.push(...objects);return {ok:true,objects};
}
export function checksum(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
export function validateState(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||![1,2].includes(raw.version))throw Error('Unrecognized save version.');
 const s=clone(raw);
 if(s.version===1){s.pins??=[];s.blueprints??=[];s.version=2;}
 for(const key of ['x','y','z','hp','maxHp','stamina','maxStamina'])if(!Number.isFinite(s.player?.[key]))throw Error('Invalid player state.');
 if(Math.abs(s.player.x)>210||Math.abs(s.player.z)>210||s.player.y < -20||s.player.y>300)throw Error('Invalid player position.');
 if(!s.safe||!['x','y','z'].every(k=>Number.isFinite(s.safe[k])&&Math.abs(s.safe[k])<210))throw Error('Invalid safe position.');
 s.player.maxHp=clamp(s.player.maxHp,6,30);s.player.hp=clamp(s.player.hp,1,s.player.maxHp);s.player.maxStamina=clamp(s.player.maxStamina,100,200);s.player.stamina=clamp(s.player.stamina,0,s.player.maxStamina);
 const expected=freshState();
 if(!s.inventory||!Object.keys(expected.inventory).every(k=>Number.isSafeInteger(s.inventory[k])&&s.inventory[k]>=0&&s.inventory[k]<=999))throw Error('Invalid inventory.');
 if(!s.facts||!['metSella','intakeOpen','rewarded'].every(k=>typeof s.facts[k]==='boolean')||![null,'roots','channels'].includes(s.facts.route))throw Error('Invalid quest state.');
 if(s.facts.rewarded&&!s.facts.route)throw Error('Impossible quest reward.');
 for(const k of ['discovered','collected','defeated'])if(!Array.isArray(s[k])||s[k].length>512||!s[k].every(v=>typeof v==='string'&&v.length<80))throw Error('Invalid world facts.');
 if(!Array.isArray(s.objects)||s.objects.length>24||new Set(s.objects.map(o=>o.id)).size!==s.objects.length||!s.objects.every(o=>typeof o.id==='string'&&COMPONENTS[o.kind]&&['x','y','z','rot'].every(k=>Number.isFinite(o[k]))&&Math.abs(o.x)<205&&Math.abs(o.z)<205&&o.y>-10&&o.y<200&&(o.socket===null||typeof o.socket==='string')))throw Error('Invalid construction data.');
 if(!Array.isArray(s.blueprints)||s.blueprints.length>12||!s.blueprints.every(b=>typeof b.id==='string'&&typeof b.name==='string'&&b.name.length<=32&&b.parts?.length>0&&b.parts.length<=12&&b.parts.every(p=>COMPONENTS[p.kind]&&['x','y','z','rot'].every(k=>Number.isFinite(p[k])&&Math.abs(p[k])<400))))throw Error('Invalid blueprint data.');
 if(!Array.isArray(s.pins)||s.pins.length>12||!s.pins.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.abs(p.x)<205&&Math.abs(p.z)<205&&typeof p.note==='string'&&p.note.length<=50))throw Error('Invalid map pins.');
 s.playtime=Number.isFinite(s.playtime)?clamp(s.playtime,0,1e8):0;
 return s;
}
export function encodeSave(state){const payload=JSON.stringify(validateState(state));return JSON.stringify({format:'aetherwild',version:SAVE_VERSION,checksum:checksum(payload),payload});}
export function decodeSave(text){const e=JSON.parse(text);if(e.format!=='aetherwild'||typeof e.payload!=='string'||e.payload.length>300000||checksum(e.payload)!==e.checksum)throw Error('Save checksum did not match.');return validateState(JSON.parse(e.payload));}
export class SaveStore{
 constructor(storage){this.storage=storage;this.key='aetherwild.save.v2';this.error=null;}
 write(state){
   const candidate=clone(state);candidate.saveTime=new Date().toISOString();
   const data=encodeSave(candidate);const s=this.storage;
   s.setItem(this.key+'.staging',data);
   decodeSave(s.getItem(this.key+'.staging'));
   const old=s.getItem(this.key);if(old){try{decodeSave(old);s.setItem(this.key+'.backup',old);}catch{}}
   s.setItem(this.key,data);s.removeItem(this.key+'.staging');state.saveTime=candidate.saveTime;return true;
 }
 load(){this.error=null;for(const suffix of ['', '.backup']){try{const raw=this.storage.getItem(this.key+suffix);if(raw){const state=decodeSave(raw);if(suffix)this.error='Primary save was damaged. Recovered the previous backup.';return state;}}catch(error){this.error=error.message;}}return null;}
 exists(){return !!this.load();}
}
export function loadSettings(storage){try{const s=JSON.parse(storage.getItem('aetherwild.settings'));return {...clone(DEFAULT_SETTINGS),...s,bindings:{...DEFAULT_SETTINGS.bindings,...s?.bindings}};}catch{return clone(DEFAULT_SETTINGS);}}
export function questSummary(state){return {stage:questStage(state),completed:state.facts.rewarded,choice:state.facts.route};}
