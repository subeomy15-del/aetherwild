export const VERSION = '0.1.0';
export const SAVE_VERSION = 2;
export const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
export const lerp = (a,b,t) => a+(b-a)*t;
export const smooth = (a,b,v) => {const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
export const riverZ = x => 42+4*Math.sin(x*.025);
export function heightAt(x,z) {
  let h=7+2.2*Math.sin(x*.025)*Math.cos(z*.026)+1.3*Math.sin(x*.065+z*.036);
  for (const [cx,cz,r,y] of [[0,102,38,10],[-28,42,30,5.5],[-15,-16,25,9],[0,-103,38,19],[74,-45,24,7],[-98,2,38,26],[110,100,30,18]]) {
    const f=1-smooth(r*.45,r,Math.hypot(x-cx,z-cz));h=lerp(h,y,f);
  }
  const lake=(x-68)**2/46**2+(z-35)**2/43**2;
  h=lerp(h,.3,1-smooth(.6,1.2,lake));
  const channel=Math.abs(z-riverZ(x));
  h=lerp(h,.6,1-smooth(6,12,channel));
  const edge=Math.max(Math.abs(x),Math.abs(z));
  h+=smooth(145,205,edge)*(18+12*Math.sin(x*.028+z*.023)**2);
  return h;
}
export const WATER=3.2;
export const START={x:0,y:10,z:109};
export const ITEMS={
  copper:{name:'Copper salvage',icon:'copper',desc:'Weathered engine metal. Used in brackets and field repairs.',color:'#c99857'},
  fiber:{name:'Woven fiber',icon:'fiber',desc:'Reed thread, surprisingly strong. Used for panels and repairs.',color:'#bfce9a'},
  broth:{name:'Reedroot broth',icon:'flask',desc:'A warm field meal. Restores 3 health segments.',color:'#f3b883'},
  glass:{name:'Mossglass',icon:'crystal',desc:'A light-carrying mineral. Sella can reinforce your sailcloth with it.',color:'#7addca'},
  regulator:{name:'Weather regulator',icon:'loom',desc:'A ceramic memory of the basin’s old water routes.',color:'#ead9b5'},
};
export const COMPONENTS={
  panel:{name:'Reedwood panel',mass:18,cost:{copper:1,fiber:2},size:[5.8,.45,11.4],color:0xc8a878},
  counterweight:{name:'Ceramic counterweight',mass:60,cost:{copper:3},size:[2.8,2.8,2.8],color:0xd9d7bd},
  raft:{name:'Reedwake raft',mass:32,cost:{copper:2,fiber:4},size:[6,.65,8],color:0xb28c58},
};
export const INITIAL_OBJECTS=[
  {id:'panel-a',kind:'panel',x:-20,y:heightAt(-20,63)+.25,z:63,rot:0,socket:null},
  {id:'panel-b',kind:'panel',x:-37,y:heightAt(-37,63)+.25,z:63,rot:Math.PI/2,socket:null},
  {id:'weight-a',kind:'counterweight',x:13,y:heightAt(13,-84)+1.4,z:-84,rot:0,socket:null},
  {id:'raft-a',kind:'raft',x:51,y:3.8,z:41,rot:0,socket:null},
];
export const SOCKETS=[
  {id:'crossing-south',kind:'panel',x:-28,y:5.55,z:47.6,rot:0,label:'South bracket'},
  {id:'crossing-north',kind:'panel',x:-28,y:5.55,z:36.2,rot:0,label:'North bracket'},
  {id:'intake-weight',kind:'counterweight',x:-10,y:20.5,z:-91,rot:0,label:'Counterweight cradle'},
];
export const LOCATIONS=[
 {id:'reedwake',name:'Reedwake Camp',subtitle:'A small certainty in a changed world',x:0,z:98,r:22,icon:'camp',discover:true},
 {id:'crossing',name:'The Unfinished Crossing',subtitle:'Somebody left in a hurry',x:-28,z:51,r:16,icon:'bridge'},
 {id:'reedwatch',name:'Reedwatch Ruins',subtitle:'The local salvage has opinions',x:-16,z:-16,r:24,icon:'ruin'},
 {id:'bellwether',name:'Bellwether Intake',subtitle:'A machine learning to breathe again',x:0,z:-103,r:32,icon:'engine'},
 {id:'hollow',name:'The Listening Hollow',subtitle:'The roots kept what the engines forgot',x:76,z:-43,r:19,icon:'root'},
 {id:'bluff',name:'Surveyor’s Rest',subtitle:'There is always another way around',x:-98,z:2,r:18,icon:'flag'},
 {id:'mossglass',name:'Glasswater Shore',subtitle:'The sky, held in a mineral',x:83,z:38,r:18,icon:'crystal'},
];
export const PICKUPS=[
 {id:'camp-copper',kind:'copper',count:4,x:9,z:91},
 {id:'bank-fiber',kind:'fiber',count:4,x:-12,z:64},
 {id:'shore-glass',kind:'glass',count:2,x:89,z:24},
 {id:'reedwatch-cache',kind:'copper',count:5,x:-21,z:-30,chest:true},
 {id:'bluff-cache',kind:'glass',count:2,x:-101,z:0,chest:true},
 {id:'hollow-glass',kind:'glass',count:2,x:73,z:-49},
 {id:'orchard-broth',kind:'broth',count:2,x:40,z:77,chest:true},
 {id:'intake-cache',kind:'fiber',count:5,x:21,z:-111,chest:true},
];
export const ENEMIES=[
 {id:'scrapper-1',kind:'scavenger',x:-14,z:-8,hp:3},
 {id:'scrapper-2',kind:'scavenger',x:-26,z:-17,hp:3},
 {id:'sentinel-1',kind:'sentinel',x:0,z:-73,hp:5},
];
export const DEFAULT_SETTINGS={music:.42,sfx:.7,ambient:.6,sensitivity:1,gamepadSensitivity:1,invertY:false,reducedMotion:false,highContrast:false,textScale:1,subtitles:true,climbAssist:true,sprintToggle:false,quality:'high',bindings:{forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',interact:'KeyE',ability:'KeyQ',dodge:'KeyC',attack:'Mouse0',block:'Mouse2',inventory:'KeyI',journal:'KeyJ',map:'KeyM',pause:'Escape',heal:'KeyH',rotate:'KeyR',detach:'KeyF',undo:'KeyZ'}};
export const ACTION_LABELS={forward:'Move forward',back:'Move backward',left:'Move left',right:'Move right',jump:'Jump / sailcloth',sprint:'Sprint',interact:'Interact / place',ability:'Threadbind',dodge:'Dodge',attack:'Light attack',block:'Block / timed guard',inventory:'Satchel',journal:'Journal',map:'Map',pause:'Pause',heal:'Drink broth',rotate:'Rotate held object',detach:'Detach',undo:'Undo construction'};
export const CHAPTERS=[
 {stage:0,title:'A basin holding its breath',objective:'Speak with Sella at Reedwake Camp.',detail:'The old weather bell is silent. A researcher is waiting beside the expedition tent.'},
 {stage:1,title:'A thread across the water',objective:'Reach Bellwether Intake in the north.',detail:'Use Threadbind [Q] to move the marked panels onto the aqueduct brackets. Or take the stepping stones west, swim, or find the ridge trail.'},
 {stage:2,title:'The weight of a little rain',objective:'Balance the intake’s counterweight cradle.',detail:'At the intake, move the ceramic weight onto the glowing cradle. Its mass will lift the central iris. Missing weight? Use the nearby reset winch.'},
 {stage:3,title:'What the roots remember',objective:'Choose a water route at the regulator.',detail:'The intake is open. The old route drains the luminous hollow; the root route feeds it. Read the record and choose at the central console.'},
 {stage:4,title:'A different kind of repair',objective:'Return to Sella at Reedwake Camp.',detail:'The basin is moving again. Follow the new water and bring Sella the regulator. Camp beacons can return you to a discovered safe place from the map.'},
 {stage:5,title:'The Basin That Breathes',objective:'Adventure complete. The basin is yours to explore.',detail:'Your reinforced sailcloth uses less stamina. Explore the optional hollow, shore and surveyor’s bluff; experiment with construction or revisit the bell.'},
];
export function questStage(state){
 if(state.facts.rewarded)return 5;
 if(state.facts.route)return 4;
 if(state.facts.intakeOpen)return 3;
 if(state.discovered.includes('bellwether'))return 2;
 if(state.facts.metSella)return 1;
 return 0;
}
export const DIALOGUE={
 intro:[['Sella Venn','Field researcher'],['You’re the mechanic? Good. I’m Sella. The bell in that tower used to tell the rain where to go.','Now the basin floods, and the old roots glow. I rather like the glowing. I’m less fond of sleeping in a puddle.','Your Loom can move those marked panels at the crossing. Fit them into the brackets, or find your own way north.','Open Bellwether’s intake. Find out what it’s doing before you fix it. Machines aren’t always right just because they’re old.']],
 progress:[['Sella Venn','Field researcher'],['Bellwether is the ceramic ring on the northern ridge. The teal brackets at the crossing will take a panel.','There’s also a trail around the western stones. The frogs have been using it with unreasonable confidence.']],
 root:[['Sella Venn','Field researcher'],['You gave the water to the roots? I wondered if the engine would let you.','The bell sounds different. Less certain of itself. I think I like that.','Here. I worked mossglass into your sailcloth. It’ll carry you farther now. And the camp beacon is yours whenever you need a place to land.']],
 old:[['Sella Venn','Field researcher'],['The channels are clear. Tovan’s caravans will have a road again.','The hollow has gone quiet. I’ll keep watching it. Repair can be the beginning of a question, too.','I reinforced your sailcloth with mossglass. Take it. The next answer is probably somewhere inconvenient.']],
 complete:[['Sella Venn','Field researcher'],['The basin is already changing. There’s a luminous hollow east of the ruins and a surveyor’s cache on the western bluff.','Take your time. The world won’t become less strange if you hurry.']],
 record:[['Bellwether record · 19 years ago','Recovered ceramic memory'],['DIRECTIVE: Return all rain to the authorized surface channels. Root incursions are to be deprived of water.','ANNOTATION, ENGINEER EDA: These are not incursions. They are drinking. Someone changed the directive after the roots began to sing.','Two routes remain. The upper channel will clear the old road. The lower spillway will sustain the new hollow. The regulator cannot feed both.']],
 hollow:[['A voice in the root','Field note'],['The light answers your footsteps. A little late, as though something enormous is listening from a very long way away.','Tucked into a bark fold: “If the machine says empty, look again.” The note is signed Eda.']],
 bluff:[['Surveyor’s notebook','Optional discovery'],['“From here: a bell that cannot ring, a shore that holds the sky, and a root that has no business being so large.”','“The road is the route someone has already tried. Useful, but not a binding agreement.”']],
 loom:[['Wayfarer Loom','Field guide'],['[Q] enters Threadbind. Look at a marked panel, weight or raft, then [E] to lift it. Move and turn the camera to position it.','Teal brackets accept matching parts. A solid teal preview means the joint is aligned; amber means a free placement. [R] rotates the object. [E] commits.','[F] detaches a part. [Z] undoes the last operation. Every essential puzzle has a local reset. Blueprints in the fieldbook store actual component arrangements.']],
};
