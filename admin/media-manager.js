/* DCY V7.1 - gallery management. Does not delete Storage objects. */
(() => {
'use strict';
const el = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const specs = {
 material:{form:'materialForm', id:'mId', container:'mExamplePreview', table:'materials', field:'example_urls', collection:()=>materials, folder:'materials/examples'},
 project:{form:'projectForm', id:'pId', container:'pGalleryManager', table:'projects', field:'gallery_urls', collection:()=>projects, folder:'projects/gallery'}
};
let editing=null;
function ensureUI(){
 const p=el('pGallery'); if(p&&!el('pGalleryManager')) {const d=document.createElement('div');d.id='pGalleryManager';p.closest('label').insertAdjacentElement('afterend',d)}
 Object.entries(specs).forEach(([type,s])=>{const target=el(s.container);if(!target)return;target.classList.add('dcy-media-manager');target.dataset.type=type;});
}
function render(type){const s=specs[type],host=el(s.container);if(!host)return;const id=el(s.id).value,record=s.collection().find(v=>v.id===id);host.innerHTML='';if(!record){host.textContent='先儲存資料，再進行照片排序、替換或移除。';return}
 const arr=Array.isArray(record[s.field])?record[s.field]:[];
 const heading=document.createElement('h3');heading.textContent=`圖片管理（${arr.length} 張）`;host.append(heading);
 arr.forEach((url,i)=>{const card=document.createElement('div');card.className='dcy-media-row';const img=document.createElement('img');img.src=url;img.alt=`第 ${i+1} 張`;img.loading='lazy';card.append(img);
 const tools=document.createElement('div');tools.className='dcy-media-tools';const label=document.createElement('span');label.textContent=`第 ${i+1} 張`;tools.append(label);
 const actions=[['↑',()=>move(type,i,-1)],['↓',()=>move(type,i,1)],['裁切',()=>crop(type,i)],['替換',()=>replace(type,i)],['移除',()=>remove(type,i)]];
 actions.forEach(([name,fn])=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.disabled=(name==='↑'&&i===0)||(name==='↓'&&i===arr.length-1);b.addEventListener('click',fn);tools.append(b)});card.append(tools);host.append(card)});
 const note=document.createElement('p');note.className='dcy-media-hint';note.textContent='排序、裁切、替換、移除會立即儲存。移除只解除此頁引用，不刪除雲端原始檔。';host.append(note)
}
async function save(type,urls){const s=specs[type],id=el(s.id).value;if(!id)return;const {error}=await db.from(s.table).update({[s.field]:urls}).eq('id',id);if(error){alert('圖片更新失敗：'+error.message);return false}const record=s.collection().find(x=>x.id===id);if(record)record[s.field]=urls;render(type);return true}
function get(type){const s=specs[type],r=s.collection().find(x=>x.id===el(s.id).value);return [...(r?.[s.field]||[])]}
async function move(type,i,delta){const a=get(type),j=i+delta;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];await save(type,a)}
async function remove(type,i){if(!confirm('確定從此頁移除這張圖片？雲端原始檔會保留。'))return;const a=get(type);a.splice(i,1);await save(type,a)}
function choose(){return new Promise(resolve=>{const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>resolve(input.files[0]||null);input.click()})}
async function replace(type,i){const f=await choose();if(!f)return;try{const url=await upload(f,specs[type].folder);const a=get(type);a[i]=url;await save(type,a)}catch(e){alert('圖片上傳失敗：'+e.message)}}
async function crop(type,i){const url=get(type)[i];if(!url)return;const overlay=document.createElement('div');overlay.className='dcy-crop-overlay';overlay.innerHTML='<div class="dcy-crop-panel"><h3>裁切圖片（輸出 4:3）</h3><canvas width="1000" height="750"></canvas><label>縮放 <input type="range" min="100" max="300" value="100" id="dcyCropZoom"></label><label>水平位置 <input type="range" min="0" max="100" value="50" id="dcyCropX"></label><label>垂直位置 <input type="range" min="0" max="100" value="50" id="dcyCropY"></label><div class="dcy-crop-actions"><button type="button" id="dcyCropCancel">取消</button><button type="button" id="dcyCropSave">裁切並替換</button></div><p>裁切後會上傳新圖片，原始圖片保留在雲端。</p></div>';document.body.append(overlay);
 const canvas=overlay.querySelector('canvas'),ctx=canvas.getContext('2d'),im=new Image();im.crossOrigin='anonymous';im.onload=draw;im.onerror=()=>{alert('圖片無法載入裁切工具，可能是雲端跨網域設定限制。');overlay.remove()};im.src=url;
 const z=overlay.querySelector('#dcyCropZoom'),x=overlay.querySelector('#dcyCropX'),y=overlay.querySelector('#dcyCropY');[z,x,y].forEach(input=>input.oninput=draw);
 function draw(){if(!im.naturalWidth)return;const factor=Math.max(canvas.width/im.naturalWidth,canvas.height/im.naturalHeight)*(+z.value/100),w=im.naturalWidth*factor,h=im.naturalHeight*factor;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(im,-(w-canvas.width)*(+x.value/100),-(h-canvas.height)*(+y.value/100),w,h)}
 overlay.querySelector('#dcyCropCancel').onclick=()=>overlay.remove();overlay.querySelector('#dcyCropSave').onclick=()=>{try{canvas.toBlob(async blob=>{if(!blob){alert('裁切失敗');return}try{const file=new File([blob],`crop-${Date.now()}.jpg`,{type:'image/jpeg'}),newUrl=await upload(file,specs[type].folder),a=get(type);a[i]=newUrl;if(await save(type,a))overlay.remove()}catch(e){alert('儲存裁切圖片失敗：'+e.message)}},'image/jpeg',.9)}catch(e){alert('裁切失敗：'+e.message)}};
}
function wrap(name,type){const original=window[name];if(typeof original!=='function')return;window[name]=function(...args){const result=original.apply(this,args);setTimeout(()=>render(type),0);return result}}
function init(){ensureUI();wrap('editMaterial','material');wrap('editProject','project');const origResetMaterial=window.resetMaterial;if(typeof origResetMaterial==='function')window.resetMaterial=function(...args){const r=origResetMaterial.apply(this,args);render('material');return r};
 ['material','project'].forEach(type=>{const s=specs[type],form=el(s.form);if(form)form.addEventListener('submit',()=>setTimeout(()=>render(type),1500))});
 render('material');render('project')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
