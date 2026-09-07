import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const VERSION='1.3';
const BODY_VERTEX_COUNT=13380; // hm08 human surface; helper geometry starts after this range
const TARGET_ROOT='https://raw.githubusercontent.com/makehumancommunity/mpfb2/master/src/mpfb/data/targets/';
const C={
 HEAD:{
  headWidth:['head/head-scale-horiz-decr.target.gz','head/head-scale-horiz-incr.target.gz'],
  headHeight:['head/head-scale-vert-decr.target.gz','head/head-scale-vert-incr.target.gz'],
  headDepth:['head/head-scale-depth-decr.target.gz','head/head-scale-depth-incr.target.gz'],
  headFat:['head/head-fat-decr.target.gz','head/head-fat-incr.target.gz'],
  headAngle:['head/head-angle-in.target.gz','head/head-angle-out.target.gz']},
 FOREHEAD:{
  foreheadHeight:['forehead/forehead-scale-vert-decr.target.gz','forehead/forehead-scale-vert-incr.target.gz'],
  templeWidth:['forehead/forehead-temple-decr.target.gz','forehead/forehead-temple-incr.target.gz'],
  foreheadDepth:['forehead/forehead-trans-backward.target.gz','forehead/forehead-trans-forward.target.gz']},
 BROWS:{
  browAngle:['eyebrows/eyebrows-angle-down.target.gz','eyebrows/eyebrows-angle-up.target.gz'],
  browHeight:['eyebrows/eyebrows-trans-down.target.gz','eyebrows/eyebrows-trans-up.target.gz'],
  browDepth:['eyebrows/eyebrows-trans-backward.target.gz','eyebrows/eyebrows-trans-forward.target.gz']},
 EYES:{
  leftEyeSize:['eyes/l-eye-scale-decr.target.gz','eyes/l-eye-scale-incr.target.gz'],
  rightEyeSize:['eyes/r-eye-scale-decr.target.gz','eyes/r-eye-scale-incr.target.gz'],
  leftEyeSpacing:['eyes/l-eye-trans-in.target.gz','eyes/l-eye-trans-out.target.gz'],
  rightEyeSpacing:['eyes/r-eye-trans-in.target.gz','eyes/r-eye-trans-out.target.gz'],
  leftEyeHeight:['eyes/l-eye-trans-down.target.gz','eyes/l-eye-trans-up.target.gz'],
  rightEyeHeight:['eyes/r-eye-trans-down.target.gz','eyes/r-eye-trans-up.target.gz'],
  leftEyeFold:['eyes/l-eye-eyefold-concave.target.gz','eyes/l-eye-eyefold-convex.target.gz'],
  rightEyeFold:['eyes/r-eye-eyefold-concave.target.gz','eyes/r-eye-eyefold-convex.target.gz']},
 NOSE:{
  noseBase:['nose/nose-base-down.target.gz','nose/nose-base-up.target.gz'],
  noseCurve:['nose/nose-curve-concave.target.gz','nose/nose-curve-convex.target.gz'],
  noseFlaring:['nose/nose-flaring-decr.target.gz','nose/nose-flaring-incr.target.gz'],
  noseHump:['nose/nose-hump-decr.target.gz','nose/nose-hump-incr.target.gz'],
  noseGreek:['nose/nose-greek-decr.target.gz','nose/nose-greek-incr.target.gz'],
  noseCompression:['nose/nose-compression-compress.target.gz','nose/nose-compression-uncompress.target.gz']},
 CHEEKS:{
  leftCheekBones:['cheek/l-cheek-bones-decr.target.gz','cheek/l-cheek-bones-incr.target.gz'],
  rightCheekBones:['cheek/r-cheek-bones-decr.target.gz','cheek/r-cheek-bones-incr.target.gz'],
  leftCheekVolume:['cheek/l-cheek-volume-decr.target.gz','cheek/l-cheek-volume-incr.target.gz'],
  rightCheekVolume:['cheek/r-cheek-volume-decr.target.gz','cheek/r-cheek-volume-incr.target.gz']},
 MOUTH:{
  mouthWidth:['mouth/mouth-scale-horiz-decr.target.gz','mouth/mouth-scale-horiz-incr.target.gz'],
  mouthHeight:['mouth/mouth-scale-vert-decr.target.gz','mouth/mouth-scale-vert-incr.target.gz'],
  mouthDepth:['mouth/mouth-scale-depth-decr.target.gz','mouth/mouth-scale-depth-incr.target.gz'],
  upperLipVolume:['mouth/mouth-upperlip-volume-decr.target.gz','mouth/mouth-upperlip-volume-incr.target.gz'],
  lowerLipVolume:['mouth/mouth-lowerlip-volume-decr.target.gz','mouth/mouth-lowerlip-volume-incr.target.gz'],
  cupidsBow:['mouth/mouth-cupidsbow-decr.target.gz','mouth/mouth-cupidsbow-incr.target.gz'],
  mouthCorners:['mouth/mouth-angles-down.target.gz','mouth/mouth-angles-up.target.gz']},
 CHIN:{
  chinWidth:['chin/chin-width-decr.target.gz','chin/chin-width-incr.target.gz'],
  chinHeight:['chin/chin-height-decr.target.gz','chin/chin-height-incr.target.gz'],
  chinProminence:['chin/chin-prominent-decr.target.gz','chin/chin-prominent-incr.target.gz'],
  chinBones:['chin/chin-bones-decr.target.gz','chin/chin-bones-incr.target.gz'],
  prognathism:['chin/chin-prognathism-decr.target.gz','chin/chin-prognathism-incr.target.gz'],
  chinCleft:['chin/chin-cleft-decr.target.gz','chin/chin-cleft-incr.target.gz']},
 EARS:{
  leftEarSize:['ears/l-ear-scale-decr.target.gz','ears/l-ear-scale-incr.target.gz'],
  rightEarSize:['ears/r-ear-scale-decr.target.gz','ears/r-ear-scale-incr.target.gz'],
  leftEarHeight:['ears/l-ear-scale-vert-decr.target.gz','ears/l-ear-scale-vert-incr.target.gz'],
  rightEarHeight:['ears/r-ear-scale-vert-decr.target.gz','ears/r-ear-scale-vert-incr.target.gz'],
  leftEarWing:['ears/l-ear-wing-decr.target.gz','ears/l-ear-wing-incr.target.gz'],
  rightEarWing:['ears/r-ear-wing-decr.target.gz','ears/r-ear-wing-incr.target.gz']}
};
const state={};Object.values(C).forEach(g=>Object.keys(g).forEach(k=>state[k]=0));
let active='HEAD',history=[],base,geometry,targetCache=new Map(),applyToken=0,loadedCount=0,failedCount=0;
const $=s=>document.querySelector(s),tabs=$('#tabs'),presets=$('#presets'),controlsEl=$('#controls'),dna=$('#dna'),badge=$('#badge');
const label=k=>k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
function snap(){history.push({...state});if(history.length>30)history.shift()}
function buildUI(){tabs.innerHTML='';Object.keys(C).forEach(g=>{const b=document.createElement('button');b.textContent=g;b.className=g===active?'active':'';b.onclick=()=>{active=g;buildUI()};tabs.appendChild(b)});presets.innerHTML=`<div class="preset-title">${Object.keys(state).length} REAL MPFB FACE CONTROLS · -1 to +1</div>`;controlsEl.innerHTML='';Object.keys(C[active]).forEach(k=>{const r=document.createElement('div');r.className='row';r.innerHTML=`<div class="rowtop"><span>${label(k)}</span><span class="value">${state[k].toFixed(2)}</span></div><input data-k="${k}" type="range" min="-1" max="1" value="${state[k]}" step=".01">`;const i=r.querySelector('input');i.addEventListener('pointerdown',snap,{once:true});i.oninput=e=>{state[k]=+e.target.value;r.querySelector('.value').textContent=state[k].toFixed(2);apply()};controlsEl.appendChild(r)})}
function sync(){document.querySelectorAll('input[data-k]').forEach(i=>{i.value=state[i.dataset.k];i.parentElement.querySelector('.value').textContent=(+i.value).toFixed(2)})}
async function gunzipText(url){const res=await fetch(url);if(!res.ok)throw Error(`${res.status}`);const ds=new DecompressionStream('gzip');return new Response(res.body.pipeThrough(ds)).text()}
async function target(path){if(targetCache.has(path))return targetCache.get(path);try{const text=await gunzipText(TARGET_ROOT+path);const a=[];for(const line of text.split(/\r?\n/)){if(!line||line[0]==='#')continue;const p=line.trim().split(/\s+/);if(p.length>=4)a.push([+p[0],+p[1],+p[2],+p[3]])}targetCache.set(path,a);loadedCount++;return a}catch(e){console.warn('Target failed',path,e);targetCache.set(path,[]);failedCount++;return []}}
async function apply(){if(!geometry)return;const token=++applyToken,contributions=[];for(const defs of Object.values(C))for(const [k,pair] of Object.entries(defs)){const v=state[k];if(v)contributions.push([target(v<0?pair[0]:pair[1]),Math.abs(v)])}const loaded=await Promise.all(contributions.map(async([p,a])=>[await p,a]));if(token!==applyToken)return;const pos=geometry.attributes.position.array;pos.set(base);for(const [rows,amount] of loaded)for(const [idx,x,y,z] of rows){if(idx>=BODY_VERTEX_COUNT)continue;const o=idx*3;pos[o]+=x*amount;pos[o+1]+=y*amount;pos[o+2]+=z*amount}geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();badge.textContent=`V1.3R · HM08 FACE · ${BODY_VERTEX_COUNT.toLocaleString()} BODY VERTICES · TARGETS ${loadedCount}${failedCount?' / '+failedCount+' ERR':''}`;dna.textContent=JSON.stringify({version:VERSION,engine:'local-hm08+official-mpfb-targets',identity:'deterministic',...state},null,2)}
function parseOBJ(text){const verts=[],tris=[];for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(line.startsWith('v ')){const p=line.split(/\s+/);verts.push(+p[1],+p[2],+p[3])}else if(line.startsWith('f ')){const ids=line.split(/\s+/).slice(1).map(x=>parseInt(x.split('/')[0],10)-1);if(ids.some(i=>i<0||i>=BODY_VERTEX_COUNT))continue;for(let i=1;i<ids.length-1;i++)tris.push(ids[0],ids[i],ids[i+1])}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts.slice(0,BODY_VERTEX_COUNT*3),3));g.setIndex(tris);g.computeVertexNormals();return g}
const renderer=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0d0e10);const camera=new THREE.PerspectiveCamera(28,1,.1,100);camera.position.set(0,7.12,4.15);const orbit=new OrbitControls(camera,$('#c'));orbit.enableDamping=true;orbit.target.set(0,7.08,1.18);orbit.enablePan=false;orbit.minDistance=1.35;orbit.maxDistance=5;scene.add(new THREE.HemisphereLight(0xffffff,0x20242b,2.2));const key=new THREE.DirectionalLight(0xffffff,3.8);key.position.set(3,10,5);scene.add(key);const rim=new THREE.DirectionalLight(0xdde5ff,1.4);rim.position.set(-4,8,2);scene.add(rim);
async function load(){try{badge.textContent='V1.3 · LOADING LOCAL HM08…';const res=await fetch('./base.obj',{cache:'no-store'});if(!res.ok)throw Error(`base.obj ${res.status}`);geometry=parseOBJ(await res.text());base=new Float32Array(geometry.attributes.position.array);scene.add(new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color:0xb9947e,roughness:.72,clearcoat:.02,side:THREE.FrontSide})));await apply()}catch(e){badge.textContent='V1.3 · MESH LOAD ERROR';console.error(e)}}
$('#reset').onclick=()=>{snap();Object.keys(state).forEach(k=>state[k]=0);sync();apply()};$('#random').onclick=()=>{snap();Object.keys(state).forEach(k=>state[k]=+(Math.random()*.5-.25).toFixed(2));sync();apply()};$('#undo').onclick=()=>{if(history.length){Object.assign(state,history.pop());sync();apply()}};$('#home').onclick=()=>{camera.position.set(0,7.12,4.15);orbit.target.set(0,7.08,1.18);orbit.update()};$('#save').onclick=()=>{const b=new Blob([JSON.stringify({version:VERSION,engine:'local-hm08+official-mpfb-targets',...state},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='character-dna-v1.3.json';a.click()};
function loop(){const c=$('#c'),w=c.clientWidth,h=c.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}orbit.update();renderer.render(scene,camera);requestAnimationFrame(loop)}
buildUI();load();loop();
