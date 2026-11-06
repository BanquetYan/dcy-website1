/* DCY V7.2 - front card thumbnail positioning; preserves source image */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const kinds={material:{id:'mId',list:()=>materials,table:'materials',url:'image_url',anchor:'mExamplePreview'},project:{id:'pId',list:()=>projects,table:'projects',url:'cover_url',anchor:'pGallery'}};
const state={};
function mount(kind){const spec=kinds[kind],anchor=$(spec.anchor);if(!anchor)return;
 let host=$('dcyThumb_'+kind);if(!host){host=document.createElement('section');host.id='dcyThumb_'+kind;host.className='dcy-thumb-editor';anchor.insertAdjacentElement('afterend',host)}
 const rec=spec.list().find(r=>String(r.id)===String($(spec.id)?.value));
 if(!rec){host.innerHTML='<h3>前台卡片縮圖</h3><p>請先選擇並編輯已儲存的資料。</p>';return}
 const url=rec[spec.url];if(!url){host.innerHTML='<h3>前台卡片縮圖</h3><p>此項目尚未設定封面照片，請先在原本的材料／作品表單設定封面。</p>';return}
 const val=rec.thumbnail_settings||{},config={zoom:clamp(val.zoom,100,250,100),x:clamp(val.x,0,100,50),y:clamp(val.y,0,100,50)};state[kind]=config;
 host.innerHTML='';const heading=document.createElement('h3');heading.textContent='前台卡片縮圖調整';host.append(heading);
 const note=document.createElement('p');note.className='dcy-thumb-note';note.textContent='只調整前台列表卡片顯示方式；原圖與圖片管理不受影響。';host.append(note);
 const frame=document.createElement('div');frame.className='dcy-thumb-frame';const img=document.createElement('img');img.src=url;img.alt='前台縮圖預覽';frame.append(img);host.append(frame);
 const inputs={};for(const [key,label,min,max] of [['zoom','放大倍率',100,250],['x','水平位置',0,100],['y','垂直位置',0,100]]){const l=document.createElement('label'),t=document.createElement('span'),input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.value=config[key];t.textContent=label+'：'+config[key]+(key==='zoom'?'%':'');l.append(t,input);host.append(l);inputs[key]=input;input.oninput=()=>{config[key]=Number(input.value);t.textContent=label+'：'+config[key]+(key==='zoom'?'%':'');draw()}}
 function draw(){img.style.objectPosition=config.x+'% '+config.y+'%';img.style.transform='scale('+(config.zoom/100)+')';img.style.transformOrigin=config.x+'% '+config.y+'%'}draw();
 const status=document.createElement('p');status.className='dcy-thumb-note';host.append(status);
 const reset=document.createElement('button');reset.type='button';reset.textContent='還原預設';reset.onclick=()=>{Object.assign(config,{zoom:100,x:50,y:50});Object.entries(inputs).forEach(([k,v])=>{v.value=config[k];v.dispatchEvent(new Event('input'))})};host.append(reset);
 const save=document.createElement('button');save.type='button';save.textContent='儲存前台縮圖設定';save.onclick=async()=>{save.disabled=true;status.textContent='儲存中…';try{const {error}=await db.from(spec.table).update({thumbnail_settings:{...config}}).eq('id',rec.id);if(error)throw error;rec.thumbnail_settings={...config};status.textContent='已儲存。重新整理前台頁面即可查看效果。'}catch(err){status.textContent='儲存失敗：'+err.message+'。請確認已執行 V7.2 SQL 升級。'}finally{save.disabled=false}};host.append(save);
}
function clamp(n,min,max,def){n=Number(n);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):def}
function wrap(name,kind){const original=window[name];if(typeof original!=='function')return;window[name]=function(...args){const result=original.apply(this,args);setTimeout(()=>mount(kind),0);return result}}
function init(){wrap('editMaterial','material');wrap('editProject','project');mount('material');mount('project')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
