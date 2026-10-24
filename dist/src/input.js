import {clamp} from './data.js';
export class Input{
 constructor(canvas,settings){
  this.canvas=canvas;this.settings=settings;this.held=new Set();this.pressed=new Set();this.mouse={x:0,y:0,wheel:0};this.device='keyboard';this.padPrev={};this.padHeld={};this.padPressed={};this.move={x:0,y:0};this.look={x:0,y:0};this.enabled=false;this.rebind=null;
  window.addEventListener('keydown',e=>{
   if(this.rebind){e.preventDefault();const cb=this.rebind;this.rebind=null;cb(e.code);return;}
   if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;
   this.device='keyboard';if(!this.held.has(e.code))this.pressed.add(e.code);this.held.add(e.code);
   if(this.enabled&&Object.values(this.settings.bindings).includes(e.code))e.preventDefault();
  });
  window.addEventListener('keyup',e=>this.held.delete(e.code));
  window.addEventListener('mousedown',e=>{if(this.rebind){e.preventDefault();e.stopImmediatePropagation();const cb=this.rebind;this.rebind=null;cb('Mouse'+e.button);}},{capture:true});
  window.addEventListener('blur',()=>this.clear());
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('mousedown',e=>{this.device='keyboard';if(this.rebind){const cb=this.rebind;this.rebind=null;cb('Mouse'+e.button);return;}if(!this.enabled)return;if(document.pointerLockElement!==canvas){this.lock();return;}const c='Mouse'+e.button;if(!this.held.has(c))this.pressed.add(c);this.held.add(c);});
  window.addEventListener('mouseup',e=>this.held.delete('Mouse'+e.button));
  window.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&this.enabled){this.mouse.x+=e.movementX;this.mouse.y+=e.movementY;}});
  canvas.addEventListener('wheel',e=>{if(this.enabled){this.mouse.wheel+=Math.sign(e.deltaY);e.preventDefault();}},{passive:false});
 }
 lock(){if(!this.enabled||new URLSearchParams(location.search).has('qa'))return;try{const p=this.canvas.requestPointerLock();p?.catch?.(()=>{});}catch{}}
 unlock(){if(document.pointerLockElement)document.exitPointerLock();this.clear();}
 clear(){this.held.clear();this.pressed.clear();this.mouse={x:0,y:0,wheel:0};this.move={x:0,y:0};this.look={x:0,y:0};this.padHeld={};this.padPressed={};}
 update(){
  this.padPressed={};this.padHeld={};this.move={x:0,y:0};this.look={x:0,y:0};
  const pads=navigator.getGamepads?.()||[];const p=Array.from(pads).find(v=>v?.connected);if(!p){this.padPrev={};return;}
  const dead=v=>Math.abs(v)>.18?(v-Math.sign(v)*.18)/.82:0;
  const mx=dead(p.axes[0]||0),my=dead(p.axes[1]||0),lx=dead(p.axes[2]||0),ly=dead(p.axes[3]||0);
  const map={jump:0,dodge:1,interact:2,ability:3,block:4,attack:5,detach:6,heavy:7,pause:9,map:8,sprint:10,undo:11,lockOn:11,heal:12,inventory:13,journal:14,rotate:15};
  let active=Math.abs(mx)+Math.abs(my)+Math.abs(lx)+Math.abs(ly)>.01;
  for(const[a,i]of Object.entries(map)){const b=p.buttons[i]?.pressed||false;this.padHeld[a]=b;this.padPressed[a]=b&&!this.padPrev[a];if(this.padPressed[a])active=true;}
  if(active)this.device='gamepad';this.padPrev={...this.padHeld};
  if(this.device==='gamepad'){this.move={x:mx,y:my};this.look={x:lx,y:ly};}
 }
 down(action){return this.held.has(this.settings.bindings[action])||this.padHeld[action]||false;}
 hit(action){return this.pressed.has(this.settings.bindings[action])||(action==='attack'&&this.pressed.has(this.settings.bindings.attackAlt))||this.padPressed[action]||false;}
 code(c){return this.pressed.has(c);}
 axes(){return {x:clamp((this.down('right')?1:0)-(this.down('left')?1:0)+this.move.x,-1,1),y:clamp((this.down('back')?1:0)-(this.down('forward')?1:0)+this.move.y,-1,1)};}
 endFrame(){this.pressed.clear();this.padPressed={};this.mouse.x=0;this.mouse.y=0;this.mouse.wheel=0;}
 label(action){
  if(this.device==='gamepad')return ({jump:'A',dodge:'B',interact:'X',ability:'Y',block:'LB',attack:'RB',pause:'MENU',map:'VIEW',sprint:'LS',heal:'↑',inventory:'↓',journal:'←',rotate:'→',detach:'LT',undo:'RS',lockOn:'RS'})[action]||action;
  return keyName(this.settings.bindings[action]);
 }
}
export function keyName(c){return c?.replace('Key','').replace('Digit','').replace('Left','').replace('Right','').replace('Mouse0','LMB').replace('Mouse2','RMB').replace('Space','SPACE').replace('Escape','ESC')||'?';}
