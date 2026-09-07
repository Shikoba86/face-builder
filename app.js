import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ROOT='https://raw.githubusercontent.com/makehumancommunity/mpfb2/master/src/mpfb/data/';
const controls={
 HEAD:{
  headWidth:['head/head-scale-horiz-decr.target.gz','head/head-scale-horiz-incr.target.gz'],
  headHeight:['head/head-scale-vert-decr.target.gz','head/head-scale-vert-incr.target.gz'],
  headDepth:['head/head-scale-depth-decr.target.gz','head/head-scale-depth-incr.target.gz'],
  headFat:['head/head-fat-decr.target.gz','head/head-fat-incr.target.gz'],
  foreheadHeight:['forehead/forehead-scale-vert-decr.target.gz','forehead/forehead-scale-vert-incr.target.gz'],
  templeWidth:['forehead/forehead-temple-decr.target.gz','forehead/forehead-temple-incr.target.gz']
 },
 NOSE:{
  noseBase:['nose/nose-base-down.target.gz','nose/nose-base-up.target.gz'],
  noseCurve:['nose/nose-curve-concave.target.gz','nose/nose-curve-convex.target.gz'],
  noseFlaring:['nose/nose-flaring-decr.target.gz','nose/nose-flaring-incr.target.gz'],
  noseHump:['nose/nose-hump-decr.target.gz','nose/nose-hump-incr.target.gz'],
  noseGreek:['nose/nose-greek-decr.target.gz','nose/nose-greek-incr.target.gz'],
  noseCompression:['nose/nose-compression-compress.target.gz','nose/nose-compression-uncompress.target.gz']
 },
 CHIN:{
  chinWidth:['chin/chin-width-decr.target.gz','chin/chin-width-incr.target.gz'],
  chinHeight:['chin/chin-height-decr.target.gz','chin/chin-height-incr.target.gz'],
  chinProminence:['chin/chin-prominent-decr.target.gz','chin/chin-prominent-incr.target.gz'],
  chinBones:['chin/chin-bones-decr.target.gz','chin/chin-bones-incr.target.gz'],
  prognathism:['chin/chin-prognathism-decr.target.gz','chin/chin-prognathism-incr.target.gz']
 }
};
const state={}; Object.values(controls).forEach(g=>Object.keys(g).forEach(k=>state[k]=0));
let active='HEAD',history=[],base=[],geometry,mesh,targetCache=new Map();
const $=s=>document.querySelector(s), tabs=$('#tabs'),presets=$('#presets'),controlsEl=$('#controls'),dna=$('#dna'),badge=$('#badge');
const label=k=>k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
function snap(){history.push({...state});if(history.length>30)history.shift()}
function buildUI(){tabs.innerHTML='';Object.keys(controls).forEach(g=>{let b=document.createElement('button');b.textContent=g;b.className=g===active?'active':'';b.onclick=()=>{active=g;buildUI()};tabs.appendChild(b)});presets.innerHTML='<div class="preset-title">ANATOMICAL MORPHS · -1 to +1</div>';controlsEl.innerHTML='';Object.keys(controls[active]).forEach(k=>{let r=document.createElement('div');r.className='row';r.innerHTML=`<div class="rowtop"><span>${label(k)}</span><span class="value">${state[k].toFixed(2)}</span></div><input data-k="${k}" type="range" min="-1" max="1" value="${state[k]}" step=".01">`;let i=r.querySelector('input');i.addEventListener('pointerdown',snap,{once:true});i.oninput=e=>{state[k]=+e.target.value;r.querySelector('.value').textContent=state[k].toFixed(2);apply()};controlsEl.appendChild(r)})}
function sync(){document.querySelectorAll('input[data-k]').forEach(i=>{i.value=state[i.dataset.k];i.parentElement.querySelector('.value').textContent=(+i.value).toFixed(2)})}
async function gunzipText(url){const res=await fetch(url);if(!res.ok)throw Error(res.status);const ds=new DecompressionStream('gzip');return await new Response(res.body.pipeThrough(ds)).text()}
async function target(path){if(targetCache.has(path))return targetCache.get(path);try{const text=await gunzipText(ROOT+'targets/'+path);const m=new Map();for(const line of text.split(/\r?\n/)){if(!line||line[0]==='#')continue;const p=line.trim().split(/\s+/);if(p.length>=4)m.set(+p[0],[+p[1],+p[2],+p[3]])}targetCache.set(path,m);return m}catch(e){console.warn('Target unavailable',path,e);targetCache.set(path,new Map());return new Map()}}
async function apply(){if(!geometry)return;const pos=geometry.attributes.position.array;for(let i=0;i<base.length;i++)pos[i]=base[i];const jobs=[];for(const [group,defs] of Object.entries(controls))for(const [k,pair] of Object.entries(defs)){const v=state[k];if(!v)continue;const path=v<0?pair[0]:pair[1],amount=Math.abs(v);jobs.push(target(path).then(m=>{for(const [idx,d] of m){const o=idx*3;if(o+2<pos.length){pos[o]+=d[0]*amount;pos[o+1]+=d[1]*amount;pos[o+2]+=d[2]*amount}}}))}await Promise.all(jobs);geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();dna.textContent=JSON.stringify({version:'1.0-alpha',engine:'makehuman-targets',identity:'deterministic',...state},null,2)}
function parseOBJ(text){const verts=[],tris=[];for(const line of text.split(/\r?\n/)){if(line.startsWith('v ')){const p=line.trim().split(/\s+/);verts.push(+p[1],+p[2],+p[3])}else if(line.startsWith('f ')){const ids=line.trim().split(/\s+/).slice(1).map(x=>parseInt(x.split('/')[0])-1);for(let i=1;i<ids.length-1;i++)tris.push(ids[0],ids[i],ids[i+1])}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(tris);g.computeVertexNormals();return g}
const renderer=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;const scene=new THREE.Scene();scene.background=new THREE.Color(0x0d0e10);const camera=new THREE.PerspectiveCamera(28,1,.1,100);camera.position.set(0,7.25,4.2);const orbit=new OrbitControls(camera,$('#c'));orbit.enableDamping=true;orbit.target.set(0,7.15,1.15);orbit.enablePan=false;orbit.minDistance=1.7;orbit.maxDistance=6;scene.add(new THREE.HemisphereLight(0xffffff,0x20242b,2.3));const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(3,10,5);scene.add(key);const rim=new THREE.DirectionalLight(0xcbd7ff,1.8);rim.position.set(-4,8,2);scene.add(rim);
async function load(){try{const res=await fetch(ROOT+'3dobjs/base.obj');if(!res.ok)throw Error(res.status);geometry=parseOBJ(await res.text());base=Array.from(geometry.attributes.position.array);mesh=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color:0xb89580,roughness:.62,clearcoat:.06,side:THREE.DoubleSide}));scene.add(mesh);badge.textContent='FACE BUILDER V1 · REAL ANATOMY';await apply()}catch(e){badge.textContent='V1 · ANATOMY LOAD ERROR';console.error(e)}}
$('#reset').onclick=()=>{snap();Object.keys(state).forEach(k=>state[k]=0);sync();apply()};$('#random').onclick=()=>{snap();Object.keys(state).forEach(k=>state[k]=+(Math.random()*.8-.4).toFixed(2));sync();apply()};$('#undo').onclick=()=>{if(history.length){Object.assign(state,history.pop());sync();apply()}};$('#home').onclick=()=>{camera.position.set(0,7.25,4.2);orbit.target.set(0,7.15,1.15);orbit.update()};$('#save').onclick=()=>{const b=new Blob([JSON.stringify({version:'1.0-alpha',engine:'makehuman-targets',...state},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='character-dna-v1.json';a.click()};function loop(){const c=$('#c'),w=c.clientWidth,h=c.clientHeight;if(w&&h&&(c.width!==Math.floor(w*renderer.getPixelRatio())||c.height!==Math.floor(h*renderer.getPixelRatio()))){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}orbit.update();renderer.render(scene,camera);requestAnimationFrame(loop)}buildUI();load();loop();
