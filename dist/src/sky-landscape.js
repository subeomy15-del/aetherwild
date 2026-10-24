import * as T from '../vendor/three.module.js';
const minX=-184,minZ=-12,step=2,nx=43,nz=72;
const ellipse=(x,z,cx,cz,rx,rz)=>(x-cx)**2/rx**2+(z-cz)**2/rz**2;
export function skyLandHeight(x,z){
 const south=z>=63&&((x>=-156&&x<=-130&&ellipse(x,z,-145,93,39,37)<1)||(x<-164&&ellipse(x,z,-174,94,10,16)<1)||(x>=-124&&ellipse(x,z,-114,98,12,21)<1));
 const north=z<=54&&ellipse(x,z,-143,25,39,31)<1;
 const link=z>110&&z<125&&x>-157&&x<-127;if(!south&&!north&&!link)return null;
 let h=75.88;
 if(south){h+=14*Math.exp(-(((x+114)/13)**2+((z-100)/20)**2));h+=1.3*Math.exp(-(((x+172)/9)**2+((z-113)/14)**2));h-=.22*Math.exp(-(((x+168)/7)**4+((z-101)/6)**4));}
 return h;
}
export function buildSkyLandscape(g,j){const w=g.world,parent=j.group,positions=[],colors=[];
 const put=(a,b,c,col)=>{positions.push(...a,...b,...c);for(let i=0;i<3;i++)colors.push(col.r,col.g,col.b);};
 for(let iz=0;iz<nz-1;iz++)for(let ix=0;ix<nx-1;ix++){const x=minX+ix*step,z=minZ+iz*step,pts=[[x,z],[x+step,z],[x+step,z+step],[x,z+step]],hs=pts.map(p=>skyLandHeight(...p));if(hs.some(h=>h===null))continue;const a=pts.map(([a,b],i)=>[a,hs[i],b]);const h=hs.reduce((s,n)=>s+n,0)/4,c=new T.Color(h>83?0xe5e7dc:0x9eaf7b).multiplyScalar(.96+Math.sin(x*2+z)*.025);put(a[0],a[2],a[1],c);put(a[0],a[3],a[2],c);
  for(let k=0;k<4;k++){const next=(k+1)%4,dx=pts[next][0]-pts[k][0],dz=pts[next][1]-pts[k][1],cx=(pts[k][0]+pts[next][0])/2+dz*.55,cz=(pts[k][1]+pts[next][1])/2-dx*.55;if(skyLandHeight(cx,cz)!==null)continue;const b=a[k],c=a[next],lowB=[b[0]+(145+b[0])*.08,b[1]-21,b[2]],lowC=[c[0]+(145+c[0])*.08,c[1]-21,c[2]],col=new T.Color(0x799086).multiplyScalar(.88+(ix%3)*.07);put(b,c,lowC,col);put(b,lowC,lowB,col);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.96,side:T.DoubleSide}));mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
 // Queries use the same grid interpolation as the visible triangles.
 w.skyHeightAt=(x,z)=>{const gx=(x-minX)/step,gz=(z-minZ)/step,ix=Math.floor(gx),iz=Math.floor(gz);if(ix<0||iz<0||ix>=nx-1||iz>=nz-1)return null;const a=minX+ix*step,b=minZ+iz*step,hs=[[a,b],[a+step,b],[a+step,b+step],[a,b+step]].map(p=>skyLandHeight(...p));if(hs.some(h=>h===null))return null;const u=gx-ix,v=gz-iz;return u>=v?hs[0]+u*(hs[1]-hs[0])+v*(hs[2]-hs[1]):hs[0]+v*(hs[3]-hs[0])+u*(hs[2]-hs[3]);};
 let seed=9137;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const trees=[];for(let i=0;i<150&&trees.length<26;i++){const x=-179+rnd()*67,z=66+rnd()*58,h=w.skyHeightAt(x,z);if(h===null||h>81||Math.abs(x+145)<6||Math.hypot(x+159,z-90)<6||Math.hypot(x+168,z-101)<8||Math.hypot(x+139,z-74)<5)continue;trees.push({x,z,h});}
 const trunk=new T.InstancedMesh(w.geos.cylinder,w.material(0x64705b),trees.length),leaf=new T.InstancedMesh(w.geos.sphere,w.material(0xc0c77e),trees.length*5),dummy=new T.Object3D();trees.forEach((t,i)=>{dummy.position.set(t.x,t.h+2.2,t.z);dummy.scale.set(.27,4.4,.3);dummy.rotation.set(0,0,.08);dummy.updateMatrix();trunk.setMatrixAt(i,dummy.matrix);for(let n=0;n<5;n++){dummy.position.set(t.x+Math.cos(n*2.4)*1.4,t.h+4.5+n%2*.6,t.z+Math.sin(n*2.4)*1.4);dummy.scale.set(2.25,1.2,2.3);dummy.rotation.set(0,n,0);dummy.updateMatrix();leaf.setMatrixAt(i*5+n,dummy.matrix);}});trunk.castShadow=leaf.castShadow=true;trunk.receiveShadow=leaf.receiveShadow=true;parent.add(trunk,leaf);
 const pond=new T.Mesh(new T.CircleGeometry(7,48),new T.MeshStandardMaterial({color:0x84c9bb,roughness:.17,metalness:.18}));pond.rotation.x=-Math.PI/2;pond.position.set(-168,75.91,101);pond.scale.y=.8;parent.add(pond);
 for(let i=0;i<9;i++){const a=i*.7;w.mesh('sphere',0xc5c8aa,parent,-168+Math.cos(a)*7.3,75.95,101+Math.sin(a)*5.9,.5,.25,.4);}
 // Temple approach: twenty real collision steps, a raised forecourt and readable silhouette.
 for(let i=0;i<=20;i++){const z=23-i*.9,top=76+i*.4;w.mesh('box',0xd5d4ba,parent,-145,top-.2,z,8,.4,1.15);w.solids.push({id:'temple-step-'+i,x:-145,z,w:8,d:1.15,top,bottom:top-.4});}
 w.mesh('box',0xc7cbb1,parent,-145,83.5,1,22,1,7);w.solids.push({id:'temple-forecourt',x:-145,z:1,w:22,d:7,top:84,bottom:83});
 for(const x of [-154,-150,-140,-136]){w.mesh('box',0x879e88,parent,x,85,0,2,2,2);w.mesh('box',0xe0dfc5,parent,x,91,0,1.1,11,1.4);w.mesh('box',0x8ead99,parent,x,96.5,0,1.7,.6,2);}
 const arch=new T.Mesh(new T.TorusGeometry(5.1,.6,8,32,Math.PI),w.material(0xe0dfc5));arch.position.set(-145,93,0);parent.add(arch);w.mesh('box',0xc1cbb5,parent,-145,99,0,17,.7,3);w.mesh('cone',0x789d8a,parent,-145,102,0,3,5,3);w.mesh('ring',0x9bdeca,parent,-145,92,-.9,2.4,2.4,2.4,.3);
}
