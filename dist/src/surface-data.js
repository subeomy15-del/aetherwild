// Internal world coordinates: north is -Z. Geography is reference-inspired, not surveyed.
export const SURFACE_LIMIT_X=6000,SURFACE_LIMIT_Z=5000,SURFACE_TILE=400;
export const SURFACE_REGIONS=[
 {id:'central',name:'Central Hyrule',x:560,z:420,color:0x9eaf75,subtitle:'Roads through a broken kingdom'},
 {id:'hebra',name:'Hebra',x:-3500,z:-3100,color:0xdce4dc,subtitle:'Wind beneath the snow line'},
 {id:'eldin',name:'Eldin',x:2050,z:-2550,color:0xa98a69,subtitle:'Old furnaces under red stone'},
 {id:'akkala',name:'Akkala',x:4050,z:-2400,color:0xb8a06b,subtitle:'Copper leaves and survey roads'},
 {id:'lanayru',name:'Lanayru',x:2850,z:150,color:0x91b8a5,subtitle:'Rivers gathering toward the sea'},
 {id:'necluda',name:'Necluda',x:2350,z:2650,color:0xa9b880,subtitle:'Fields between the coastal hills'},
 {id:'faron',name:'Faron',x:500,z:3700,color:0x6f9c71,subtitle:'Rain on the southern canopy'},
 {id:'gerudo',name:'Gerudo',x:-3650,z:2300,color:0xcbb68a,subtitle:'Shelter along the sand road'},
];
export const SURFACE_ROADS=SURFACE_REGIONS.filter(r=>r.id!=='central').map(r=>({a:{x:560,z:420},b:r}));
SURFACE_ROADS.push({a:{x:560,z:420},b:{id:'castle',x:0,z:-1050}});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const hill=(x,z,cx,cz,rx,rz,h)=>h*Math.exp(-((x-cx)**2/rx**2+(z-cz)**2/rz**2));
export function distanceToRoad(x,z){let best=Infinity;for(const {a,b}of SURFACE_ROADS){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1);best=Math.min(best,Math.hypot(x-a.x-dx*t,z-a.z-dz*t));}return best;}
export function surfaceRegionAt(x,z){let best=SURFACE_REGIONS[0],d=Infinity;for(const r of SURFACE_REGIONS){const n=Math.hypot(x-r.x,z-r.z);if(n<d){d=n;best=r;}}return best;}
export function lowerHeightAt(x,z){
 let h=24+11*Math.sin(x*.0014)*Math.cos(z*.0011)+6*Math.sin(x*.003+z*.0016);
 h+=hill(x,z,-3700,-3200,1400,1150,530)+hill(x,z,-2800,-3700,800,700,220);
 h+=hill(x,z,-3200,900,700,1400,320)+hill(x,z,1400,-2300,1100,1000,390);
 const v=Math.hypot((x-2050)/750,(z+2550)/750);h+=350*Math.exp(-v*v*2.3)-160*Math.exp(-v*v*32);
 h+=hill(x,z,4200,-2700,1100,1000,145)+hill(x,z,2500,2400,1300,1000,110)+hill(x,z,700,3400,1400,900,90);
 const sand=smooth(-2200,-4000,x)*smooth(700,1800,z);h=h*(1-sand*.7)+sand*(10+5*Math.sin(x*.009+z*.003));
 const river=1700+Math.sin(z*.0011)*500,channel=Math.abs(x-river);h=h*(smooth(32,85,channel))+.5*(1-smooth(32,85,channel));
 const lake=((x-700)/470)**2+((z-2100)/350)**2;h=h*smooth(.8,1.2,lake)-2*(1-smooth(.8,1.2,lake));
 const coast=smooth(4100,4900,z)+smooth(5000,5900,Math.abs(x));h=h*(1-clamp(coast,0,1))-22*clamp(coast,0,1);
 // Gentle transport corridors with authored bridges over the lowest river cuts.
 const road=1-smooth(10,80,distanceToRoad(x,z));let nearest=Infinity,grade=28;for(const {a,b}of SURFACE_ROADS){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1),d=Math.hypot(x-a.x-dx*t,z-a.z-dz*t);if(d<nearest){nearest=d;grade=28+(regionBase(b)-28)*smooth(0,1,t);}}h=h*(1-road)+Math.max(7,grade)*road;
 for(const r of SURFACE_REGIONS){const f=1-smooth(35,115,Math.hypot(x-r.x,z-r.z));const base=regionBase(r);h=h*(1-f)+base*f;}
 return h;
}
function regionBase(r){return {central:28,hebra:230,eldin:180,akkala:105,lanayru:22,necluda:65,faron:65,gerudo:19}[r.id]??55;}
export function surfaceState(){return {visited:['central'],solved:[],mirrors:[0,0,0],mount:{x:13,y:10,z:110}};}
export function validateSurface(s){if(!s||!Array.isArray(s.visited)||s.visited.length>8||new Set(s.visited).size!==s.visited.length||!s.visited.every(id=>SURFACE_REGIONS.some(r=>r.id===id))||!Array.isArray(s.solved)||s.solved.length>4||new Set(s.solved).size!==s.solved.length||!s.solved.every(id=>['lanayru-filter','eldin-vent','gerudo-light','regional-survey'].includes(id))||!Array.isArray(s.mirrors)||s.mirrors.length!==3||!s.mirrors.every(n=>Number.isInteger(n)&&n>=0&&n<4)||!s.mount||!['x','y','z'].every(k=>Number.isFinite(s.mount[k]))||Math.abs(s.mount.x)>6000||Math.abs(s.mount.z)>5000||s.mount.y< -30||s.mount.y>1200)throw Error('Invalid surface expedition data.');return s;}
