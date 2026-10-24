import * as T from '../vendor/three.module.js';
// Authored collision and visible terrace share the same bevelled footprint.
export function insideTerrace(x,z,b){const dx=Math.abs(x-b.x),dz=Math.abs(z-b.z);return dx<b.w/2&&dz<b.d/2&&(!b.bevel||dx+dz<b.w/2+b.d/2-b.bevel);}
export function makeSkyTerrace(world,parent,id,x,z,w,d,y){
 const edge=[[-w/2+3,-d/2],[w/2-3,-d/2],[w/2,-d/2+3],[w/2,d/2-3],[w/2-3,d/2],[-w/2+3,d/2],[-w/2,d/2-3],[-w/2,-d/2+3]];
 const v=[],colors=[];const tri=(a,b,c,color)=>{v.push(...a,...b,...c);for(let i=0;i<3;i++)colors.push(color.r,color.g,color.b);};
 const cap=new T.Color(0xc4c8a7);for(let i=0;i<8;i++)tri([0,0,0],[edge[i][0],0,edge[i][1]],[edge[(i+1)%8][0],0,edge[(i+1)%8][1]],cap);
 const scales=[1,1.02,.91,.72,.32,.05],heights=[0,-1.4,-4.5,-9,-15,-20];for(let k=0;k<5;k++)for(let i=0;i<8;i++){const j=(i+1)%8,s=scales[k],t=scales[k+1],h=heights[k],l=heights[k+1],a=[edge[i][0]*s,h,edge[i][1]*s],b=[edge[j][0]*s,h,edge[j][1]*s],c=[edge[j][0]*t,l,edge[j][1]*t],e=[edge[i][0]*t,l,edge[i][1]*t];const color=new T.Color([0xadb3a0,0x869384,0x718879,0x657c73,0x5c7772][k]).multiplyScalar(.88+(i%3)*.09);tri(a,c,b,color);tri(a,e,c,color);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.97,side:T.DoubleSide}));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);world.solids.push({id,x,z,w,d,bevel:3,top:y,bottom:y-.8});
 const m=(kind,c,a,b,e,sx,sy,sz)=>world.mesh(kind,c,parent,a,b,e,sx,sy,sz);
 // Clear central paths, soft planted edges and layered roots tie masonry to land.
 for(let i=0;i<8;i++){const a=i*Math.PI/4,r=.8;m('sphere',0x708b65,x+Math.cos(a)*(w/2-2),y+.25,z+Math.sin(a)*(d/2-2),1.6,.55,1.5);}
 for(let i=0;i<5;i++)m('box',0xe1d9bc,x+(i%2?.08:-.08),y+.025,z+d/2-3-i*2.5,3,.05,1.8);
 for(const [dx,dz]of [[-9,4],[9,-5]]){m('cylinder',0x626b52,x+dx,y+2.1,z+dz,.32,4.2,.38);for(let n=0;n<5;n++){const a=n*2.4;m('sphere',n%2?0xadb96f:0xc4c68a,x+dx+Math.cos(a)*1.3,y+4.6+(n%2)*.55,z+dz+Math.sin(a)*1.3,2.1,1.2,2);}}
 return mesh;
}
export function decorateSky(g,j){const w=g.world,p=j.group,m=(kind,c,x,y,z,sx,sy,sz,e=0)=>w.mesh(kind,c,p,x,y,z,sx,sy,sz,e);
 // A layered service arch frames the objective from the waking platform.
 for(const x of [-150.8,-139.2]){m('box',0x8b9d88,x,76.4,47,2,.8,2.4);m('box',0xd9d8bf,x,80,47,.9,6.5,1.2);m('box',0x91aa97,x,82.9,47,1.4,.45,1.6);}
 const arch=new T.Mesh(new T.TorusGeometry(5.8,.5,8,28,Math.PI),w.material(0xd8dac2));arch.position.set(-145,83,47);p.add(arch);
 for(const z of [31,35,39])for(const x of [-151,-139])m('box',0x769a88,x,83.32,z,1,.14,2.1,.3);
 for(let i=0;i<6;i++)m('box',0x8da88b,-137,76.1,70+i*1.5,2.5,.18,1);
 // Small sky-water basin and a long opaque fall disappear into the cloud bank.
 const water=new T.Mesh(new T.CircleGeometry(2.5,32),new T.MeshStandardMaterial({color:0x8ed3c6,roughness:.2,metalness:.2}));water.rotation.x=-Math.PI/2;water.scale.y=.6;water.position.set(-155,76.04,73);p.add(water);
 m('box',0x9bd9d0,-157.95,65.9,73,.12,20,1.9);m('box',0xc0ece1,-157.82,65.9,73,.08,20,.35);
 // Windborne motes, with a fixed allocation and no simulation growth.
 const pos=new Float32Array(60*3);for(let i=0;i<60;i++){pos[i*3]=-157+(i*7.31%24);pos[i*3+1]=77+(i*3.37%10);pos[i*3+2]=28+(i*11.13%58);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));const motes=new T.Points(geo,new T.PointsMaterial({color:0xffecc3,size:.065,transparent:true,opacity:.7,depthWrite:false}));p.add(motes);
}
