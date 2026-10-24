import {lowerHeightAt,SURFACE_REGIONS} from './surface-data.js';
export const VERSION = '0.6.0';
export const SAVE_VERSION = 7;
export const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
export const lerp = (a,b,t) => a+(b-a)*t;
export const smooth = (a,b,v) => {const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
export const riverZ = x => 42+4*Math.sin(x*.025);
export function basinHeightAt(x,z) {
  let h=7+2.2*Math.sin(x*.025)*Math.cos(z*.026)+1.3*Math.sin(x*.065+z*.036);
  for (const [cx,cz,r,y] of [[25.5,91,28,10],[0,102,38,10],[-28,42,30,5.5],[-15,-16,25,9],[0,-103,38,19],[74,-45,24,7],[-98,2,38,26],[110,100,30,18]]) {
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
export function heightAt(x,z){const edge=Math.max(Math.abs(x),Math.abs(z));if(edge<=205)return basinHeightAt(x,z);const t=smooth(205,400,edge);return lerp(basinHeightAt(x,z),lowerHeightAt(x,z),t);}
export const WATER=3.2;
export const START={x:0,y:10,z:109};
export const ITEMS={
  copper:{name:'Copper salvage',icon:'copper',desc:'Weathered engine metal. Used in brackets and field repairs.',color:'#c99857'},
  fiber:{name:'Woven fiber',icon:'fiber',desc:'Reed thread, surprisingly strong. Used for panels and repairs.',color:'#bfce9a'},
  broth:{name:'Reedroot broth',icon:'flask',desc:'A warm field meal. Restores 3 health segments.',color:'#f3b883'},
  glass:{name:'Mossglass',icon:'crystal',desc:'A light-carrying mineral. Sella can reinforce your sailcloth with it.',color:'#7addca'},
  regulator:{name:'Weather regulator',icon:'loom',desc:'Bellwether’s local routing ledger, disconnected from the remote command line.',color:'#ead9b5'},
};
export const COMPONENTS={
  panel:{name:'Reedwood panel',mass:18,cost:{copper:1,fiber:2},size:[5.8,.45,11.4],color:0xc8a878},
  counterweight:{name:'Ceramic counterweight',mass:60,cost:{copper:3},size:[2.8,2.8,2.8],color:0xd9d7bd},
  raft:{name:'Reedwake raft',mass:32,cost:{copper:2,fiber:4},size:[6,.65,8],color:0xb28c58},
};
export const COURIER={id:'echo-courier',driveStopped:false,kind:'counterweight',x:18,y:11.45,z:91,rot:0,socket:null};
export const INITIAL_OBJECTS=[
  {id:'panel-a',kind:'panel',x:-20,y:heightAt(-20,63)+.25,z:63,rot:0,socket:null},
  {id:'panel-b',kind:'panel',x:-37,y:heightAt(-37,63)+.25,z:63,rot:Math.PI/2,socket:null},
  {id:'weight-a',kind:'counterweight',x:13,y:heightAt(13,-84)+1.4,z:-84,rot:0,socket:null},
  {id:'raft-a',kind:'raft',x:51,y:3.8,z:41,rot:0,socket:null},
  {...COURIER},
];
export const SOCKETS=[
  {id:'sky-forest-bridge',kind:'panel',x:-160,y:76.2,z:90,rot:Math.PI/2,label:'Forest island bridge bracket'},
  {id:'sky-bridge',kind:'panel',x:-145,y:76.2,z:58.5,rot:0,label:'Aerial maintenance bracket'},
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
 ...SURFACE_REGIONS.map((r,i)=>({id:'surface-foe-'+r.id,kind:i%2?'sentinel':'scavenger',x:r.x+48,z:r.z-48,hp:i%2?5:3})),
 {id:'scrapper-1',kind:'scavenger',x:-14,z:-8,hp:3},
 {id:'scrapper-2',kind:'scavenger',x:-26,z:-17,hp:3},
 {id:'sentinel-1',kind:'sentinel',x:0,z:-73,hp:5},
];
export const DEFAULT_SETTINGS={master:.8,music:.42,sfx:.7,ambient:.6,sensitivity:1,gamepadSensitivity:1,invertY:false,reducedMotion:false,highContrast:false,textScale:1,subtitles:true,climbAssist:true,sprintToggle:false,muteUnfocused:true,showCompass:true,showMinimap:true,guidance:true,resolution:1.5,vegetation:1,shadowDistance:48,quality:'high',bindings:{forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',interact:'KeyE',ability:'KeyQ',lockOn:'KeyT',abilityWheel:'Tab',weave:'Digit1',rise:'Digit2',echo:'Digit3',bind:'Digit4',dodge:'KeyC',attack:'Mouse0',attackAlt:'KeyX',block:'Mouse2',inventory:'KeyI',journal:'KeyJ',map:'KeyM',pause:'Escape',heal:'KeyH',rotate:'KeyR',detach:'KeyF',undo:'KeyZ'}};
export const ACTION_LABELS={forward:'Move forward',back:'Move backward',left:'Move left',right:'Move right',jump:'Jump / sailcloth',sprint:'Sprint',interact:'Interact / place',ability:'Use selected ability',lockOn:'Target lock',abilityWheel:'Ability wheel',weave:'Threadbind direct',rise:'Rise direct',echo:'Echo direct',bind:'Bind equipment',dodge:'Dodge',attack:'Light attack',attackAlt:'Alternate light attack',block:'Block / timed guard',inventory:'Satchel',journal:'Journal',map:'Map',pause:'Pause',heal:'Drink broth',rotate:'Rotate held object',detach:'Detach',undo:'Undo construction'};
export const OPENING={
 title:'The Last Forecast',
 edaQuote:'It counted the houses, Iri. Then it marked the valley empty.',
 aftermath:'Eda entered Bellwether to challenge its forecast. Her last courier returned without her.',
 objective:'Speak with Sella. Examine Eda’s courier east of camp.',
};
export const CHAPTERS=[
 {stage:0,title:'The Last Forecast',objective:'Speak with Sella at Reedwake Camp.',detail:'Bellwether has issued a forecast for the next engine cycle: the Listening Hollow is to be written off. Eda entered the intake to challenge it. Her courier came back alone. Sella is sheltering the people the forecast calls absent.'},
 {stage:1,title:'An occupied silence',objective:'Reach Bellwether Intake in the north.',detail:'Find the routing ledger before the next cycle. Eda’s courier east of camp holds optional testimony: reset its winch, select Echo from the ability wheel, rewind the moving weight and cancel over the amber plate. Threadbind can also place it there. Cross the river using panels, the western stones or water.'},
 {stage:2,title:'The weight of permission',objective:'Balance the intake’s counterweight cradle.',detail:'Bellwether asks for a maintenance weight before it will admit a person. Lift the ceramic weight onto its teal cradle with Threadbind [Q]. The nearby winch recalls a lost weight. The system still accepts its old permissions; it has stopped asking who they protect.'},
 {stage:3,title:'Two useful futures',objective:'Read the ledger and choose a local water route.',detail:'Keep the hollow’s root spillway flowing to sustain its luminous canopy and updraft, or reopen the surface crossing so camp supplies can move. The damaged regulator can maintain one branch. Neither choice restores the old network. Both leave work for the people who live here.'},
 {stage:4,title:'A forecast refused',objective:'Bring the regulator to Sella at Reedwake Camp.',detail:'Eda deliberately severed the remote command line. Her regulator lets the basin choose locally. Return it to Sella so that choice outlasts a single expedition. Discovered camp beacons can be reached from the field map.'},
 {stage:5,title:'Some things worth fixing differently',objective:'Chapter complete. Explore the basin and Eda’s courier archive.',detail:'Mossglass has a locally chosen route. Your reinforced sailcloth drains less stamina. Eda’s next destination, the Census Engine, is planned content beyond this playable basin. The courier archive, canopy cache, hollow and western lookout still offer discoveries.'},
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
 intro:[['Sella Venn','Field researcher'],['Seven people slept in my tent last night. Bellwether’s forecast says nobody lives below the intake. I would enjoy showing it my breakfast bill.','Eda went north to correct the ledger. Her courier came back without her. The moving weight east of camp can open its archive; your brace’s Echo can return its recent motion.','Then find Bellwether’s regulator. The crossing panels fit the old brackets. The stones to the west are less dignified, but just as effective.']],
 progress:[['Sella Venn','Field researcher'],['The intake’s iris opens under a ceramic counterweight. Its recall winch is on the right if the weight gets lost.','Eda’s courier east of camp carries her reasons for going in. You can read it before or after the intake. A person’s reasons ought to survive the paperwork.']],
 root:[['Sella Venn','Field researcher'],['You left the hollow its water. The roots are lifting warm air again. That gives us a route above the flood.','We still need a supply crossing. I can ask the salvagers for panels; I cannot ask a dead grove to grow back tomorrow.','Eda cut the line so we could decide. We’ll keep the regulator here, where people can argue with it. Take this reinforced sailcloth. You’ve earned a longer reach.']],
 old:[['Sella Venn','Field researcher'],['The surface crossing is open. The next supply party can bring food without swimming it across.','The hollow’s canopy has dimmed. I’ll keep its samples alive here while we work on a second water line. A useful repair still has a cost.','Eda cut the line so we could decide. The regulator stays here, with us. I reinforced your sailcloth. There is more work ahead, but tonight we can feed everyone.']],
 complete:[['Sella Venn','Field researcher'],['The regulator is staying at camp. Nobody gets to call this valley empty from somewhere comfortable.','Eda’s ledger names the Census Engine. I’m looking for a route; there isn’t one in our surveyed basin yet. If you haven’t read her courier archive, start east of camp.']],
 record:[['Bellwether · Local routing ledger','Eda Rook · maintenance objection'],['“Iri. I cut the command line. I know what that sounds like. The forecast was not predicting a flood. It was scheduling one, and charging the cost to a valley marked empty.”','“There are names in the margins. Generations of them. Each engineer thought they were saving the places that mattered. I followed the account back to the Census Engine. If I don’t return, don’t reconnect me to it.”','The regulator still holds two local circuits. One feeds the living hollow and its warm updraft. The other raises a crossing through the surface channel. It cannot hold both. This time the choice belongs to someone standing here.']],
 testimony:[['Eda’s unfiled objection','Courier archive · recovered testimony'],['“Sella asked me to count the hollow’s nests. Forty-three, if you count the one in my boot. Bellwether counted zero. Not because its instruments failed. Because its definition of a home has not changed in six hundred years.”','“I could amend the record. Somebody at the Census Engine could amend it back. So I’m taking the regulator off their line. I want a machine you can disagree with without being washed away.”','A working diagram accompanies the objection: two reedwood panels, staggered into a crossing. You record the pattern and take the courier’s field materials.']],
 hollow:[['A note tied to a root','Eda Rook'],['“The canopy hums whenever the intake opens. The roots are using the old conduit as a lung. Sella calls this adaptation. I call it an engineering qualification.”','Below it: seven names, with sleeping places and dietary complaints. These are the people Bellwether’s ledger has failed to count.']],
 bluff:[['Surveyor’s notebook','A crossed-out forecast'],['A chart labels the lower valley UNINHABITED. A later hand has drawn a cooking fire over the word.','“If your map cannot find a village, first check whether your map has decided not to see one.” An arrow points toward Bellwether’s ledger room.']],
 echo:[['A thread in the air','Eda’s unfinished survey'],['The brace catches a voice: “Yes, I signed the objection. No, I did not ask the engine’s permission to object.”','A second voice asks whether she has a plan. “Several. One of them is even sensible.” The recording ends before she explains which.']],
 loom:[['Wayfarer Loom','Field guide'],['[Q] uses the selected ability; the ability wheel offers Threadbind, Rise and Echo. Threadbind lifts marked panels, weights and rafts with [E].','Teal brackets accept matching parts. [R] rotates; [E] commits; [F] detaches; [Z] undoes. Canceling a held part restores its original position.','Echo records eight seconds of eligible free-object motion. Select it from the wheel, confirm with [E], and cancel [Q] to settle the object. It cannot rewind attached parts or carry passengers. Reset the courier east of camp for a safe experiment.']],
};
