export const VERSION = '0.3.0';
export const SAVE_VERSION = 3;
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
  regulator:{name:'Weather regulator',icon:'loom',desc:'Bellwether’s ceramic memory. It holds Eda’s first signal after the pulse.',color:'#ead9b5'},
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
export const DEFAULT_SETTINGS={master:.8,music:.42,sfx:.7,ambient:.6,sensitivity:1,gamepadSensitivity:1,invertY:false,reducedMotion:false,highContrast:false,textScale:1,subtitles:true,climbAssist:true,sprintToggle:false,muteUnfocused:true,showCompass:true,showMinimap:true,guidance:true,resolution:1.5,vegetation:1,shadowDistance:48,quality:'high',bindings:{forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',interact:'KeyE',ability:'KeyQ',lockOn:'KeyT',abilityWheel:'Tab',weave:'Digit1',rise:'Digit2',dodge:'KeyC',attack:'Mouse0',attackAlt:'KeyX',block:'Mouse2',inventory:'KeyI',journal:'KeyJ',map:'KeyM',pause:'Escape',heal:'KeyH',rotate:'KeyR',detach:'KeyF',undo:'KeyZ'}};
export const ACTION_LABELS={forward:'Move forward',back:'Move backward',left:'Move left',right:'Move right',jump:'Jump / sailcloth',sprint:'Sprint',interact:'Interact / place',ability:'Use selected ability',lockOn:'Target lock',abilityWheel:'Ability wheel',weave:'Threadbind direct',rise:'Rise direct',dodge:'Dodge',attack:'Light attack',attackAlt:'Alternate light attack',block:'Block / timed guard',inventory:'Satchel',journal:'Journal',map:'Map',pause:'Pause',heal:'Drink broth',rotate:'Rotate held object',detach:'Detach',undo:'Undo construction'};
export const OPENING={
 title:'The morning the horizon moved',
 captions:[
  {speaker:'EDA · LAST TRANSMISSION',text:'Iri, the bell is ringing below us. That isn’t possible.',duration:4},
  {speaker:'REEDWAKE CAMP · DAWN',text:'One pulse. The horizon opened.',duration:3.5},
  {speaker:'IRI · EXPEDITION MECHANIC',text:'Her tether came back. She didn’t.',duration:4},
 ],
 edaQuote:'If the line goes quiet, follow what the machines remember.',
 aftermath:'Eda is missing. Bellwether caught the pulse. Find its record.',
 objective:'Speak with Sella at Reedwake Camp.',
};
export const CHAPTERS=[
 {stage:0,title:'The line went quiet',objective:'Speak with Sella at Reedwake Camp.',detail:'A pulse from the weather engine tore open the horizon. Your expedition partner Eda vanished; her tether washed back to camp. Sella may know where to begin.'},
 {stage:1,title:'Follow the broken line',objective:'Reach Bellwether Intake in the north.',detail:'Bellwether caught the pulse that took Eda. Find its transit record. Threadbind [Q] can move the crossing’s marked panels into their brackets. The western stones, water and ridge offer other approaches.'},
 {stage:2,title:'A voice behind the iris',objective:'Balance the intake’s counterweight cradle.',detail:'The regulator’s memory is behind the closed iris. Move the marked ceramic weight onto its teal cradle with Threadbind. The nearby recall winch recovers a lost weight.'},
 {stage:3,title:'The first signal',objective:'Choose a water route at the regulator.',detail:'Read Bellwether’s memory for Eda’s signal, then release the intake. The surface channels will clear the old road; the root spillway will sustain the luminous hollow. Either route can carry the recovered record back to camp.'},
 {stage:4,title:'She crossed alive',objective:'Return to Sella at Reedwake Camp.',detail:'Eda’s signal names the Ninth Relay, somewhere in the fractured Crown. Bring Sella the regulator so the expedition can plan its next move. The field map offers travel to discovered camp beacons.'},
 {stage:5,title:'A signal beyond the clouds',objective:'First chapter complete. Explore Mossglass Basin.',detail:'You found evidence that Eda survived the pulse. The Ninth Relay is the next lead in the planned adventure; it is not accessible in this prototype. Your reinforced sailcloth uses less stamina. The hollow, shore and surveyor’s bluff still hold useful discoveries.'},
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
 intro:[['Sella Venn','Field researcher'],['Eda’s tether washed up before you did. No blood. The signal thread was still warm.','Bellwether caught the pulse. If it kept a transit record, we can find where it sent her. That ceramic ring on the northern ridge.','The crossing is out. Your Loom can lift the marked panels into the brackets—or find a quicker way. Bring me the record, Iri.']],
 progress:[['Sella Venn','Field researcher'],['Bellwether’s memory is inside its intake. If the iris is shut, look for a counterweight cradle and a marked ceramic weight.','And Iri? Eda left a message before she went ahead: “Tell them I want my good wrench back.” I’m keeping it safe.']],
 root:[['Sella Venn','Field researcher'],['That’s her voice. After the pulse. She made it through.','The Ninth Relay... I’ve seen that name on an old Crown chart. I’ll find it. You kept the hollow alive; perhaps those roots know a way up.','Take this. I reinforced your sailcloth with mossglass. If we’re following Eda into the sky, you’ll need more than stubbornness.']],
 old:[['Sella Venn','Field researcher'],['That’s Eda. She made it through—and she left us a place to look. The Ninth Relay.','The old road will dry now. We can get supplies in while I search the Crown charts. I’ll move what I can from the hollow before it goes dark.','Your sailcloth is reinforced. Mossglass in the weave. You found her signal, Iri. That’s our first step.']],
 complete:[['Sella Venn','Field researcher'],['I’m still matching the Ninth Relay to the old charts. No route yet. You don’t have to keep standing over my shoulder.','There’s a surveyor’s notebook on the western bluff, and Eda visited the roots east of the ruins before the pulse. We might have missed something.']],
 record:[['Bellwether emergency buffer · Today, 06:14','Recovered signal · Eda'],['“Iri. I’m alive. The pulse didn’t throw me—it moved the room. There’s sky outside the floor. Find the Ninth Relay. And don’t reset the network. Not yet.”','Her signal passed through Bellwether after the horizon opened. Beneath it, a much older entry: FRACTURE COMMAND ACCEPTED. The engines’ fall was authorized. By whom, the record does not say.','The intake must release into one surviving route. Surface channels will clear the expedition road. The lower spillway will feed the luminous hollow. Either can power the memory transfer; the regulator cannot supply both.']],
 hollow:[['Eda’s field note','Written before the pulse'],['“Iri says the roots are humming because I hit my head on the supply shelf. The roots stop whenever I try to record them. This is not helping my case.”','Below it, a careful diagram: the roots are wrapped around a buried signal conduit. “The engines call this ground empty. Something down there disagrees.”']],
 bluff:[['Surveyor’s notebook','An older expedition'],['“Bellwether below. The Crown beyond. Between them, broken machinery still turns toward a station our charts have lost: the Ninth Relay.”','A second hand added, years later: “There is a route. The weather is using it.”']],
 echo:[['A thread in the air','Eda’s trail · Memory trace'],['The broken signal catches for an instant. Eda, laughing: “If I’m late, check the intake before you organize a funeral.”','Her outline turns toward Bellwether, then the trace breaks into the wind. A fragment, not a path.']],
 loom:[['Wayfarer Loom','Field guide'],['[Q] enters Threadbind. Look at a marked panel, weight or raft, then [E] to lift it. Move and turn the camera to position it.','Teal brackets accept matching parts. A solid teal preview means the joint is aligned; amber means a free placement. [R] rotates the object. [E] commits.','[F] detaches a part. [Z] undoes the last operation. Every essential puzzle has a local reset. Blueprints in the fieldbook store actual component arrangements.']],
};
