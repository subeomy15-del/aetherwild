import {beginJourney} from './journey-state.js';
import {SaveStore,freshState} from './core.js';
const IDS=['1','2','3'];
export class SaveSlots{
 constructor(storage){this.storage=storage;this.active=IDS.includes(storage.getItem('aetherwild.active-slot'))?storage.getItem('aetherwild.active-slot'):'1';}
 store(id=this.active){if(!IDS.includes(id))throw Error('Unknown expedition slot.');return new SaveStore(this.storage,id==='1'?'aetherwild.save.v2':'aetherwild.save.slot-'+id);}
 select(id){if(!IDS.includes(id))throw Error('Unknown expedition slot.');this.storage.setItem('aetherwild.active-slot',id);this.active=id;return this.store(id);}
 list(){return IDS.map(id=>{const store=this.store(id),state=store.load();const occupied=!!(this.storage.getItem(store.key)||this.storage.getItem(store.key+'.backup'));return {id,state,occupied,error:store.error,name:state?.expedition.name||'Unreadable expedition'};});}
 latest(){return this.list().filter(s=>s.state).sort((a,b)=>String(b.state.saveTime||'').localeCompare(String(a.state.saveTime||'')))[0]||null;}
 create(name,id){
  const slot=this.list().find(s=>s.id===id);if(!slot)throw Error('Choose an expedition slot.');
  if(slot.occupied)throw Error('This slot already holds an expedition. Load it or choose an empty slot.');
  const state=beginJourney(freshState());state.expedition.name=String(name||'New Expedition').trim().slice(0,32)||'New Expedition';
  // The first verified write succeeds before active-slot metadata changes.
  this.store(id).write(state);this.select(id);return state;
 }
}
