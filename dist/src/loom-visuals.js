import * as T from '../vendor/three.module.js';
export class LoomVisuals{
 constructor(scene){
  this.points=new Float32Array(33*3);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(this.points,3));
  this.beam=new T.Line(geo,new T.LineBasicMaterial({color:0x9cf5d3,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));this.beam.frustumCulled=false;scene.add(this.beam);
  this.halo=new T.Mesh(new T.TorusGeometry(.22,.02,7,32),new T.MeshBasicMaterial({color:0xaeffdb,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));scene.add(this.halo);
  this.ghostMat=new T.MeshBasicMaterial({color:0x8df8cf,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});this.selected=null;this.ghost=null;this.scene=scene;
 }
 update(g){
  this.beam.visible=!!g.held;this.halo.visible=g.loom;
  const hand=g.player.pos.clone().add(new T.Vector3(-.4,1.25,.1));this.halo.position.copy(hand);this.halo.rotation.set(0,g.elapsed*2,g.elapsed*.7);
  const selected=g.held||g.selected;const mesh=selected&&g.world.objectMeshes.get(selected.id);
  if(this.selected!==mesh){if(this.ghost)this.scene.remove(this.ghost);this.ghost=null;this.selected=mesh;if(mesh){this.ghost=mesh.clone(true);this.ghost.traverse(c=>{if(c.isMesh){c.material=this.ghostMat;c.castShadow=false;c.receiveShadow=false;}});this.scene.add(this.ghost);}}
  if(this.ghost){this.ghost.visible=g.loom;this.ghost.position.copy(mesh.position);this.ghost.rotation.copy(mesh.rotation);this.ghost.scale.setScalar(1.015);this.ghostMat.color.set(g.preview?.socket?0x9df6d1:g.preview&&!g.preview.valid?0xef9c87:0x9ef0d0);}
  if(!g.held||!mesh)return;const end=mesh.position.clone(),length=hand.distanceTo(end);for(let i=0;i<33;i++){const t=i/32,p=hand.clone().lerp(end,t);p.y+=Math.sin(Math.PI*t)*(.8+length*.06);p.x+=Math.sin(t*20-g.elapsed*5)*Math.sin(Math.PI*t)*.08;this.points[i*3]=p.x;this.points[i*3+1]=p.y;this.points[i*3+2]=p.z;}this.beam.geometry.attributes.position.needsUpdate=true;
 }
}
