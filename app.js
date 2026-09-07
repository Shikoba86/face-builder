import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const schema={
 HEAD:['headWidth','headHeight','headDepth','templeWidth','cheekWidth'],
 EYES:['eyeSize','eyeSpacing','eyeHeight','eyeDepth','eyeTilt'],
 NOSE:['noseWidth','noseLength','noseProjection','bridgeWidth','noseTip'],
 MOUTH:['mouthWidth','mouthHeight','lipFullness','mouthProjection'],
 JAW:['jawWidth','jawHeight','chinWidth','chinProjection'],
 ASYMMETRY:['eyeAsymmetry','noseAsymmetry','mouthAsymmetry']
};
const presetBank={
 HEAD:[['Narrow',{headWidth:-.45,cheekWidth:-.2}],['Broad',{headWidth:.42,cheekWidth:.28}],['Long',{headHeight:.48,headWidth:-.12}],['Compact',{headHeight:-.35,headWidth:.16}]],
 EYES:[['Deep',{eyeDepth:-.5,eyeSize:-.08}],['Wide-set',{eyeSpacing:.5}],['Close-set',{eyeSpacing:-.45}],['Upturned',{eyeTilt:.5}]],
 NOSE:[['Fine',{noseWidth:-.45,bridgeWidth:-.3}],['Broad',{noseWidth:.48,bridgeWidth:.35}],['Long',{noseLength:.52}],['Projected',{noseProjection:.55}]],
 MOUTH:[['Narrow',{mouthWidth:-.42}],['Wide',{mouthWidth:.48}],['Full',{lipFullness:.55}],['Thin',{lipFullness:-.5}]],
 JAW:[['Angular',{jawWidth:.48,chinWidth:.15}],['Narrow',{jawWidth:-.45,chinWidth:-.25}],['Strong chin',{chinProjection:.52}],['Soft',{jawWidth:-.15,chinProjection:-.25}]],
 ASYMMETRY:[['Subtle',{eyeAsymmetry:.12,noseAsymmetry:-.1,mouthAsymmetry:.08}],['Left',{eyeAsymmetry:-.25,noseAsymmetry:-.22}],['Right',{eyeAsymmetry:.25,noseAsymmetry:.22}],['Neutral',{eyeAsymmetry:0,noseAsymmetry:0,mouthAsymmetry:0}]]
};
const state={}; Object.values(schema).flat().forEach(k=>state[k]=0);
let history=[]; let active='HEAD';
const controlsEl=document.querySelector('#controls'),dnaEl=document.querySelector('#dna'),tabs=document.querySelector('#tabs'),presets=document.querySelector('#presets');
const label=k=>k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
function snapshot(){history.push({...state});if(history.length>30)history.shift()}
function buildUI(){
 tabs.innerHTML=''; Object.keys(schema).forEach(g=>{const b=document.createElement('button');b.textContent=g;b.className=g===active?'active':'';b.onclick=()=>{active=g;buildUI()};tabs.appendChild(b)});
 presets.innerHTML=`<div class="preset-title">${active} presets</div><div class="preset-grid"></div>`;const pg=presets.querySelector('.preset-grid');
 presetBank[active].forEach(([name,vals])=>{const b=document.createElement('button');b.textContent=name;b.onclick=()=>{snapshot();Object.assign(state,vals);syncUI();apply()};pg.appendChild(b)});
 controlsEl.innerHTML=''; schema[active].forEach(k=>{const r=document.createElement('div');r.className='row';r.innerHTML=`<div class="rowtop"><span>${label(k)}</span><span class="value">${state[k].toFixed(2)}</span></div><input data-k="${k}" type="range" min="-1" max="1" value="${state[k]}" step=".01">`;r.querySelector('input').addEventListener('pointerdown',()=>snapshot(),{once:true});r.querySelector('input').addEventListener('input',e=>{state[k]=+e.target.value;r.querySelector('.value').textContent=state[k].toFixed(2);apply()});controlsEl.appendChild(r)});
}
function syncUI(){document.querySelectorAll('input[data-k]').forEach(i=>{i.value=state[i.dataset.k];i.parentElement.querySelector('.value').textContent=state[i.dataset.k].toFixed(2)})}

const canvas=document.querySelector('#c');const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0d0e10);const camera=new THREE.PerspectiveCamera(31,1,.1,100);camera.position.set(0,.08,5.4);
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.target.set(0,.05,0);orbit.minDistance=3;orbit.maxDistance=7;orbit.enablePan=false;
scene.add(new THREE.HemisphereLight(0xffffff,0x20242b,2.0));const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(3,4,4);scene.add(key);const rim=new THREE.DirectionalLight(0xcbd7ff,2.0);rim.position.set(-4,2,-1);scene.add(rim);
const skin=new THREE.MeshPhysicalMaterial({color:0xb69582,roughness:.58,metalness:0,clearcoat:.08,clearcoatRoughness:.7});
const dark=new THREE.MeshStandardMaterial({color:0x3a2822,roughness:.9});const white=new THREE.MeshPhysicalMaterial({color:0xe9e5dd,roughness:.3});const irisMat=new THREE.MeshStandardMaterial({color:0x493d34,roughness:.4});
const face=new THREE.Group();scene.add(face);
const head=new THREE.Mesh(new THREE.SphereGeometry(1.08,96,72),skin);head.scale.set(.82,1.18,.88);face.add(head);
const cheeks=[];[-1,1].forEach(side=>{const c=new THREE.Mesh(new THREE.SphereGeometry(.38,48,32),skin);c.position.set(side*.48,-.08,.68);c.scale.set(1,.72,.62);face.add(c);cheeks.push({side,c})});
const eyes=[];[-1,1].forEach(side=>{const g=new THREE.Group();const ball=new THREE.Mesh(new THREE.SphereGeometry(.155,40,28),white);ball.scale.y=.78;const iris=new THREE.Mesh(new THREE.SphereGeometry(.062,28,20),irisMat);iris.position.z=.143;const pupil=new THREE.Mesh(new THREE.SphereGeometry(.027,20,14),dark);pupil.position.z=.196;g.add(ball,iris,pupil);face.add(g);eyes.push({side,g,ball,iris,pupil})});
const nose=new THREE.Group();const bridge=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.34,10,28),skin);bridge.rotation.x=Math.PI/2;bridge.position.set(0,.03,.83);bridge.scale.set(.8,1,.72);const tip=new THREE.Mesh(new THREE.SphereGeometry(.18,40,28),skin);tip.position.set(0,-.15,1.02);tip.scale.set(.9,.65,.78);nose.add(bridge,tip);face.add(nose);
const lips=new THREE.Group();const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.045,.35,8,24),new THREE.MeshStandardMaterial({color:0x825f58,roughness:.72}));upper.rotation.z=Math.PI/2;upper.position.y=.025;const lower=upper.clone();lower.material=upper.material.clone();lower.position.y=-.045;lower.scale.y=1.25;lips.add(upper,lower);lips.position.set(0,-.43,.91);face.add(lips);
const jaw=new THREE.Mesh(new THREE.SphereGeometry(.58,64,40),skin);jaw.position.set(0,-.62,.38);jaw.scale.set(1,.72,.72);face.add(jaw);
const chin=new THREE.Mesh(new THREE.SphereGeometry(.3,48,32),skin);chin.position.set(0,-.86,.61);chin.scale.set(1,.62,.78);face.add(chin);
const brows=[];[-1,1].forEach(side=>{const b=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.27,6,18),dark);b.rotation.z=Math.PI/2+side*.08;b.position.set(side*.38,.43,.91);face.add(b);brows.push({side,b})});
function apply(){
 head.scale.set(.82*(1+state.headWidth*.2),1.18*(1+state.headHeight*.15),.88*(1+state.headDepth*.16));
 cheeks.forEach(({side,c})=>{c.position.x=side*(.48+state.cheekWidth*.08);c.scale.x=1+state.cheekWidth*.22;c.position.y=-.08+state.templeWidth*.015});
 eyes.forEach(({side,g,ball,iris,pupil})=>{const asym=side<0?state.eyeAsymmetry:0;g.position.set(side*(.37+state.eyeSpacing*.1),.18+state.eyeHeight*.09+asym*.035,.91+state.eyeDepth*.1);g.rotation.z=side*state.eyeTilt*.13;const s=1+state.eyeSize*.2;ball.scale.set(s,s*(.78+asym*.03),s);iris.scale.setScalar(s);pupil.scale.setScalar(s)});
 brows.forEach(({side,b})=>{b.position.x=side*(.38+state.eyeSpacing*.08);b.position.y=.43+state.eyeHeight*.06+(side<0?state.eyeAsymmetry*.025:0);b.rotation.z=Math.PI/2+side*(.08+state.eyeTilt*.09)});
 bridge.scale.set(.8*(1+state.bridgeWidth*.35),1+state.noseLength*.3,.72*(1+state.noseProjection*.18));bridge.position.z=.83+state.noseProjection*.08;tip.scale.set(.9*(1+state.noseWidth*.32),.65*(1+state.noseTip*.2),.78*(1+state.noseProjection*.28));tip.position.set(state.noseAsymmetry*.04,-.15-state.noseLength*.12,1.02+state.noseProjection*.12);nose.rotation.z=state.noseAsymmetry*.035;
 lips.scale.set(1+state.mouthWidth*.3,1+state.mouthHeight*.15,1+state.mouthProjection*.18);upper.scale.y=1+state.lipFullness*.35;lower.scale.y=1.25*(1+state.lipFullness*.4);lips.position.set(state.mouthAsymmetry*.025,-.43,.91+state.mouthProjection*.08);lips.rotation.z=state.mouthAsymmetry*.06;
 jaw.scale.set(1+state.jawWidth*.24,.72*(1+state.jawHeight*.18),.72);jaw.position.y=-.62-state.jawHeight*.04;chin.scale.set(1+state.chinWidth*.3,.62,.78*(1+state.chinProjection*.25));chin.position.z=.61+state.chinProjection*.1;
 dnaEl.textContent=JSON.stringify({version:'0.2',engine:'manual-parametric',...state},null,2);
}
document.querySelector('#reset').onclick=()=>{snapshot();Object.keys(state).forEach(k=>state[k]=0);syncUI();apply()};
document.querySelector('#random').onclick=()=>{snapshot();Object.keys(state).forEach(k=>state[k]=+(Math.random()*1.15-.575).toFixed(2));syncUI();apply()};
document.querySelector('#undo').onclick=()=>{if(!history.length)return;Object.assign(state,history.pop());syncUI();apply()};
document.querySelector('#home').onclick=()=>{camera.position.set(0,.08,5.4);orbit.target.set(0,.05,0);orbit.update()};
document.querySelector('#save').onclick=()=>{const blob=new Blob([JSON.stringify({version:'0.2',engine:'manual-parametric',...state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='character-dna.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
function loop(){resize();orbit.update();renderer.render(scene,camera);requestAnimationFrame(loop)}
buildUI();apply();loop();
