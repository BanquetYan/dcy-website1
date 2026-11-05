const db=supabase.createClient(DCY_CONFIG.SUPABASE_URL,DCY_CONFIG.SUPABASE_KEY);
const $=id=>document.getElementById(id);let services=[],materials=[],projects=[];
async function boot(){const {data:{session}}=await db.auth.getSession();if(session)showApp(session.user)}
$("loginForm").onsubmit=async e=>{e.preventDefault();$("loginMsg").textContent="登入中…";const {data,error}=await db.auth.signInWithPassword({email:$("loginEmail").value,password:$("loginPassword").value});$("loginMsg").textContent=error?error.message:"";if(data.user)showApp(data.user)}
$("logoutBtn").onclick=async()=>{await db.auth.signOut();location.reload()}
function showApp(u){$("login").hidden=true;$("app").hidden=false;$("userEmail").textContent=u.email;loadAll()}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(t=>t.hidden=true);$(b.dataset.tab).hidden=false;document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("pageTitle").textContent=b.textContent})
async function upload(file,folder){if(!file)return"";const ext=file.name.split(".").pop();const path=`${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from("website-media").upload(path,file,{upsert:false});if(error)throw error;return db.storage.from("website-media").getPublicUrl(path).data.publicUrl}
async function loadAll(){await Promise.all([loadBrand(),loadAbout(),loadServices(),loadMaterials(),loadProjects(),loadDM(),loadContact()]);fillSelects()}

async function loadBrand(){const {data}=await db.from("site_settings").select("*").eq("id",1).maybeSingle();if(!data)return;$("bName").value=data.company_name||"鼎程溢企業社";$("bNameEn").value=data.company_name_en||"DING CHENG YI ENTERPRISE";$("bLogoWidth").value=data.logo_width||86;$("bShowText").checked=data.show_brand_text!==false;if(data.admin_logo_url){document.querySelectorAll(".login img,.admin-shell aside img").forEach(i=>i.src=data.admin_logo_url)}}
$("brandForm").onsubmit=async e=>{e.preventDefault();try{let p={company_name:$("bName").value,company_name_en:$("bNameEn").value,logo_width:Math.max(50,Math.min(180,+$("bLogoWidth").value||86)),show_brand_text:$("bShowText").checked,updated_at:new Date().toISOString()};if($("bLogo").files[0])p.logo_url=await upload($("bLogo").files[0],"brand");if($("bAdminLogo").files[0])p.admin_logo_url=await upload($("bAdminLogo").files[0],"brand");if($("bFavicon").files[0])p.favicon_url=await upload($("bFavicon").files[0],"brand");let {error}=await db.from("site_settings").update(p).eq("id",1);if(error)throw error;$("brandMsg").textContent="✓ 品牌設定已儲存，重新整理前台即可看到更新"}catch(err){$("brandMsg").textContent=err.message}}
async function loadAbout(){const {data}=await db.from("about_content").select("*").eq("id",1).maybeSingle();if(!data)return;$("aTitle").value=data.title||"";$("aSummary").value=data.summary||"";$("aContent").value=data.content||"";$("aPhilosophy").value=data.philosophy||""}
$("aboutForm").onsubmit=async e=>{e.preventDefault();const {error}=await db.from("about_content").update({title:$("aTitle").value,summary:$("aSummary").value,content:$("aContent").value,philosophy:$("aPhilosophy").value,updated_at:new Date().toISOString()}).eq("id",1);$("aboutMsg").textContent=error?error.message:"✓ 已儲存"}
async function loadServices(){const {data}=await db.from("services").select("*").order("sort_order");services=data||[];$("serviceList").innerHTML=services.map(x=>`<div class="list-item"><div><b>${x.name}</b><br><small>${x.active?"官網顯示":"已隱藏"}</small></div><div class="actions"><button onclick="editService('${x.id}')">編輯</button><button class="delete" onclick="delService('${x.id}')">刪除</button></div></div>`).join("");fillSelects()}
$("serviceForm").onsubmit=async e=>{e.preventDefault();try{let image="";if($("sImage").files[0])image=await upload($("sImage").files[0],"services");let payload={name:$("sName").value,description:$("sDesc").value,full_content:$("sFull").value,applications:$("sApps").value,sort_order:+$("sOrder").value||0,active:$("sActive").checked};if(image)payload.image_url=image;let q=$("sId").value?db.from("services").update(payload).eq("id",$("sId").value):db.from("services").insert(payload);let {error}=await q;if(error)throw error;resetService();await loadServices()}catch(err){alert(err.message)}}
window.editService=id=>{let x=services.find(v=>v.id===id);$("sId").value=x.id;$("sName").value=x.name;$("sDesc").value=x.description||"";$("sFull").value=x.full_content||"";$("sApps").value=x.applications||"";$("sOrder").value=x.sort_order||0;$("sActive").checked=x.active;scrollTo({top:0,behavior:"smooth"})}
window.delService=async id=>{if(confirm("確定刪除此服務？")){await db.from("services").delete().eq("id",id);loadServices()}}
function resetService(){$("serviceForm").reset();$("sId").value="";$("sActive").checked=true}$("sReset").onclick=resetService
async function loadMaterials(){const {data}=await db.from("materials").select("*").order("category").order("sort_order");materials=data||[];$("materialList").innerHTML=materials.map(x=>`<div class="list-item"><div><b>${x.name}</b> <small>${x.category}｜${x.active?"顯示":"隱藏"}</small></div><div class="actions"><button onclick="editMaterial('${x.id}')">編輯</button><button class="delete" onclick="delMaterial('${x.id}')">刪除</button></div></div>`).join("");fillSelects()}
$("materialForm").onsubmit=async e=>{e.preventDefault();try{let image="";if($("mImage").files[0])image=await upload($("mImage").files[0],"materials");let p={category:$("mCategory").value,name:$("mName").value,summary:$("mSummary").value,full_content:$("mFull").value,features:$("mFeatures").value,applications:$("mApps").value,cautions:$("mCautions").value,colors:$("mColors").value,strength:+$("mStrength").value,toughness:+$("mToughness").value,heat_resistance:+$("mHeat").value,surface_quality:+$("mSurface").value,sort_order:+$("mOrder").value||0,active:$("mActive").checked};if(image)p.image_url=image;let old=materials.find(x=>x.id===$("mId").value),examples=[];for(const f of $("mExamples").files)examples.push(await upload(f,"materials/examples"));if(examples.length)p.example_urls=[...(old?.example_urls||[]),...examples];let q=$("mId").value?db.from("materials").update(p).eq("id",$("mId").value):db.from("materials").insert(p);let {error}=await q;if(error)throw error;resetMaterial();await loadMaterials()}catch(err){alert(err.message)}}
window.editMaterial=id=>{let x=materials.find(v=>v.id===id);$("mId").value=x.id;$("mCategory").value=x.category;$("mName").value=x.name;$("mSummary").value=x.summary||"";$("mFull").value=x.full_content||"";$("mFeatures").value=x.features||"";$("mApps").value=x.applications||"";$("mCautions").value=x.cautions||"";$("mColors").value=x.colors||"";$("mExamplePreview").innerHTML=(x.example_urls||[]).map(u=>`<img src="${u}">`).join("");$("mStrength").value=x.strength||3;$("mToughness").value=x.toughness||3;$("mHeat").value=x.heat_resistance||3;$("mSurface").value=x.surface_quality||3;$("mOrder").value=x.sort_order||0;$("mActive").checked=x.active;scrollTo({top:0,behavior:"smooth"})}
window.delMaterial=async id=>{if(confirm("確定刪除此材料？")){await db.from("materials").delete().eq("id",id);loadMaterials()}}
function resetMaterial(){$("materialForm").reset();$("mId").value="";["mStrength","mToughness","mHeat","mSurface"].forEach(x=>$(x).value=3);$("mActive").checked=true}$("mReset").onclick=resetMaterial
function fillSelects(){if(!$("pService"))return;$("pService").innerHTML='<option value="">未指定</option>'+services.map(x=>`<option value="${x.id}">${x.name}</option>`).join("");$("pMaterial").innerHTML='<option value="">未指定</option>'+materials.map(x=>`<option value="${x.id}">${x.name}</option>`).join("")}
async function loadProjects(){const {data}=await db.from("projects").select("*").order("sort_order");projects=data||[];$("projectList").innerHTML=projects.map(x=>`<div class="list-item"><div><b>${x.title}</b><br><small>${x.published?"已發布":"草稿"}${x.featured?"｜精選":""}</small></div><div class="actions"><button onclick="editProject('${x.id}')">編輯</button><button class="delete" onclick="delProject('${x.id}')">刪除</button></div></div>`).join("")}
$("projectForm").onsubmit=async e=>{e.preventDefault();try{let cover="";if($("pCover").files[0])cover=await upload($("pCover").files[0],"projects");let gallery=[];for(const f of $("pGallery").files)gallery.push(await upload(f,"projects/gallery"));let old=projects.find(x=>x.id===$("pId").value);let p={title:$("pTitle").value,client_name:$("pClient").value,hide_client:$("pHideClient").checked,service_id:$("pService").value||null,material_id:$("pMaterial").value||null,industry:$("pIndustry").value,summary:$("pSummary").value,content:$("pContent").value,production_notes:$("pNotes").value,completed_on:$("pCompleted").value||null,featured:$("pFeatured").checked,published:$("pPublished").checked,sort_order:+$("pOrder").value||0};if(cover)p.cover_url=cover;if(gallery.length)p.gallery_urls=[...(old?.gallery_urls||[]),...gallery];let q=$("pId").value?db.from("projects").update(p).eq("id",$("pId").value):db.from("projects").insert(p);let {error}=await q;if(error)throw error;resetProject();await loadProjects()}catch(err){alert(err.message)}}
window.editProject=id=>{let x=projects.find(v=>v.id===id);$("pId").value=x.id;$("pTitle").value=x.title;$("pClient").value=x.client_name||"";$("pHideClient").checked=x.hide_client;$("pService").value=x.service_id||"";$("pMaterial").value=x.material_id||"";$("pIndustry").value=x.industry||"";$("pSummary").value=x.summary||"";$("pContent").value=x.content||"";$("pNotes").value=x.production_notes||"";$("pCompleted").value=x.completed_on||"";$("pFeatured").checked=x.featured;$("pPublished").checked=x.published;$("pOrder").value=x.sort_order||0;scrollTo({top:0,behavior:"smooth"})}
window.delProject=async id=>{if(confirm("確定刪除此案例？")){await db.from("projects").delete().eq("id",id);loadProjects()}}
function resetProject(){$("projectForm").reset();$("pId").value="";$("pHideClient").checked=true;$("pPublished").checked=true;fillSelects()}$("pReset").onclick=resetProject
async function loadDM(){const {data}=await db.from("dm_files").select("*").eq("id",1).maybeSingle();if(data)$("dmTitle").value=data.title||""}
$("dmForm").onsubmit=async e=>{e.preventDefault();try{let p={title:$("dmTitle").value,updated_at:new Date().toISOString()};if($("dmFile").files[0])p.file_url=await upload($("dmFile").files[0],"dm");let {error}=await db.from("dm_files").update(p).eq("id",1);if(error)throw error;$("dmMsg").textContent="✓ DM 已更新"}catch(err){$("dmMsg").textContent=err.message}}
async function loadContact(){const {data}=await db.from("site_settings").select("*").eq("id",1).maybeSingle();if(!data)return;$("cEmail").value=data.email||"";$("cLine").value=data.line_url||"";$("cPhone").value=data.phone||"";$("cInstagram").value=data.instagram_url||"";$("cFacebook").value=data.facebook_url||"";$("cAddress").value=data.address||"";$("showEmail").checked=data.show_email;$("showLine").checked=data.show_line;$("showPhone").checked=data.show_phone;$("showInstagram").checked=data.show_instagram;$("showFacebook").checked=data.show_facebook;$("showAddress").checked=data.show_address}
$("contactForm").onsubmit=async e=>{e.preventDefault();let p={email:$("cEmail").value,line_url:$("cLine").value,phone:$("cPhone").value,instagram_url:$("cInstagram").value,facebook_url:$("cFacebook").value,address:$("cAddress").value,show_email:$("showEmail").checked,show_line:$("showLine").checked,show_phone:$("showPhone").checked,show_instagram:$("showInstagram").checked,show_facebook:$("showFacebook").checked,show_address:$("showAddress").checked,updated_at:new Date().toISOString()};let {error}=await db.from("site_settings").update(p).eq("id",1);$("contactMsg").textContent=error?error.message:"✓ 已儲存"}
boot();

// ===== V6 modules =====
let inquiries=[],articles=[],faqs=[];
async function loadHome(){const {data}=await db.from('site_settings').select('*').eq('id',1).maybeSingle();if(!data)return;$('hTitle').value=data.hero_title||'從想法，到實際製作。';$('hSubtitle').value=data.hero_subtitle||'';$('hDescription').value=data.hero_description||'';$('hQuoteText').value=data.quote_button_text||'取得報價'}
$('homeForm').onsubmit=async e=>{e.preventDefault();try{let p={hero_title:$('hTitle').value,hero_subtitle:$('hSubtitle').value,hero_description:$('hDescription').value,quote_button_text:$('hQuoteText').value,updated_at:new Date().toISOString()};if($('hImage').files[0])p.hero_image_url=await upload($('hImage').files[0],'home');let {error}=await db.from('site_settings').update(p).eq('id',1);if(error)throw error;$('homeMsg').textContent='✓ 首頁設定已儲存'}catch(err){$('homeMsg').textContent=err.message}}
// ===== V7.1 inquiry management: complete customer details =====
function inquiryEscape(value){
  return String(value===null||value===undefined||String(value).trim()===''?'未提供':value)
    .replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function inquiryField(label,value){
  return `<div style="min-width:0;overflow-wrap:anywhere"><small style="opacity:.7">${inquiryEscape(label)}</small><div>${inquiryEscape(value)}</div></div>`;
}
async function loadInquiries(){
  const list=$('inquiryList');
  const {data,error}=await db.from('inquiries').select('*').order('created_at',{ascending:false});
  if(error){console.error('詢價讀取失敗',error);list.textContent='詢價資料讀取失敗：'+error.message;return;}
  inquiries=data||[];
  $('dInquiries').textContent=inquiries.filter(x=>x.status==='new').length;
  const rows=[];
  const statuses=[['new','新詢價'],['contacted','已聯絡'],['quoting','報價中'],['quoted','已報價'],['won','成交'],['lost','未成交']];
  for(const x of inquiries){
    const links=[];
    for(let i=0;i<(Array.isArray(x.file_urls)?x.file_urls:[]).length;i++){
      const {data:signed,error:signError}=await db.storage.from('inquiry-files').createSignedUrl(x.file_urls[i],3600);
      if(signError){console.warn('附件連結取得失敗',signError);continue;}
      if(signed?.signedUrl){
        try{const url=new URL(signed.signedUrl,location.href);if(url.protocol==='https:'||url.protocol==='http:')links.push(`<a href="${inquiryEscape(url.href)}" target="_blank" rel="noopener noreferrer">附件 ${i+1}</a>`)}catch(e){console.warn('附件網址無效',e)}
      }
    }
    const material=materials.find(m=>m.id===x.material_id);
    const date=x.created_at?new Date(x.created_at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'}):'未提供';
    const email=String(x.email||'').trim();
    const phone=String(x.phone||'').trim();
    const mailLink=email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?`<a href="mailto:${encodeURIComponent(email)}">寄送 Email</a>`:'';
    const telLink=phone&&/^[+\d\s()\-#]+$/.test(phone)?`<a href="tel:${phone.replace(/[^+\d]/g,'')}">撥打電話</a>`:'';
    rows.push(`<div class="inquiry-item" style="align-items:start;gap:24px">
      <div style="min-width:0;flex:1">
        <h3 style="margin:0 0 8px;overflow-wrap:anywhere">${inquiryEscape(x.inquiry_no)}</h3>
        <small>${inquiryEscape(date)}｜${inquiryEscape(x.request_type)}</small>
        <h4>客戶聯絡資料</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px">
          ${inquiryField('客戶姓名',x.customer_name)}
          ${inquiryField('公司名稱',x.company_name)}
          ${inquiryField('聯絡電話',x.phone)}
          ${inquiryField('Email',x.email)}
          ${inquiryField('LINE ID',x.line_id)}
        </div>
        <p>${[telLink,mailLink].filter(Boolean).join('　')}</p>
        <h4>製作需求</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px">
          ${inquiryField('製作服務',x.request_type)}
          ${inquiryField('材料',material?.name||x.material_id)}
          ${inquiryField('數量',x.quantity)}
          ${inquiryField('尺寸',x.dimensions)}
          ${inquiryField('用途',x.purpose)}
          ${inquiryField('期望交期',x.desired_date)}
        </div>
        <h4>需求詳細說明</h4>
        <p style="white-space:pre-wrap;overflow-wrap:anywhere">${inquiryEscape(x.description)}</p>
        ${links.length?`<div>附件：${links.join('　')}</div>`:''}
      </div>
      <div style="min-width:220px;flex:0 1 300px">
        <label>案件狀態
          <select onchange="setInquiryStatus('${inquiryEscape(x.id)}',this.value)">
            ${statuses.map(([v,label])=>`<option value="${v}" ${x.status===v?'selected':''}>${label}</option>`).join('')}
          </select>
        </label>
        <label>內部備註
          <textarea placeholder="內部備註" onchange="setInquiryNote('${inquiryEscape(x.id)}',this.value)">${x.admin_note?inquiryEscape(x.admin_note):''}</textarea>
        </label>
      </div>
    </div>`);
  }
  list.innerHTML=rows.join('')||'<p>目前沒有詢價。</p>';
}
window.setInquiryStatus=async(id,status)=>{
  const {error}=await db.from('inquiries').update({status,updated_at:new Date().toISOString()}).eq('id',id);
  if(error){alert('案件狀態更新失敗：'+error.message);await loadInquiries();return;}
  await loadInquiries();
};
window.setInquiryNote=async(id,admin_note)=>{
  const {error}=await db.from('inquiries').update({admin_note,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)alert('內部備註儲存失敗：'+error.message);
};
async function loadArticles(){const {data}=await db.from('articles').select('*').order('published_at',{ascending:false});articles=data||[];$('articleList').innerHTML=articles.map(x=>`<div class="list-item"><div><b>${x.title}</b><br><small>${x.category}｜${x.published?'已發布':'草稿'}</small></div><div class="actions"><button onclick="editArticle('${x.id}')">編輯</button><button class="delete" onclick="delArticle('${x.id}')">刪除</button></div></div>`).join('')}
$('articleForm').onsubmit=async e=>{e.preventDefault();try{let p={title:$('arTitle').value,category:$('arCategory').value,summary:$('arSummary').value,content:$('arContent').value,published:$('arPublished').checked,published_at:$('arDate').value||new Date().toISOString().slice(0,10),sort_order:+$('arOrder').value||0,updated_at:new Date().toISOString()};if($('arCover').files[0])p.cover_url=await upload($('arCover').files[0],'articles');let q=$('arId').value?db.from('articles').update(p).eq('id',$('arId').value):db.from('articles').insert(p),{error}=await q;if(error)throw error;resetArticle();loadArticles()}catch(err){alert(err.message)}};window.editArticle=id=>{let x=articles.find(v=>v.id===id);$('arId').value=x.id;$('arTitle').value=x.title;$('arCategory').value=x.category;$('arSummary').value=x.summary||'';$('arContent').value=x.content||'';$('arDate').value=x.published_at||'';$('arPublished').checked=x.published;$('arOrder').value=x.sort_order||0};window.delArticle=async id=>{if(confirm('確定刪除此文章？')){await db.from('articles').delete().eq('id',id);loadArticles()}};function resetArticle(){$('articleForm').reset();$('arId').value='';$('arPublished').checked=true}$('arReset').onclick=resetArticle;
async function loadFaqs(){const {data}=await db.from('faqs').select('*').order('sort_order');faqs=data||[];$('faqAdminList').innerHTML=faqs.map(x=>`<div class="list-item"><div><b>${x.question}</b><br><small>${x.category}｜${x.active?'顯示':'隱藏'}</small></div><div class="actions"><button onclick="editFaq('${x.id}')">編輯</button><button class="delete" onclick="delFaq('${x.id}')">刪除</button></div></div>`).join('')}
$('faqForm').onsubmit=async e=>{e.preventDefault();let p={category:$('fCategory').value,question:$('fQuestion').value,answer:$('fAnswer').value,active:$('fActive').checked,sort_order:+$('fOrder').value||0},q=$('fId').value?db.from('faqs').update(p).eq('id',$('fId').value):db.from('faqs').insert(p),{error}=await q;if(error)alert(error.message);else{resetFaq();loadFaqs()}};window.editFaq=id=>{let x=faqs.find(v=>v.id===id);$('fId').value=x.id;$('fCategory').value=x.category;$('fQuestion').value=x.question;$('fAnswer').value=x.answer||'';$('fActive').checked=x.active;$('fOrder').value=x.sort_order||0};window.delFaq=async id=>{if(confirm('確定刪除此 FAQ？')){await db.from('faqs').delete().eq('id',id);loadFaqs()}};function resetFaq(){$('faqForm').reset();$('fId').value='';$('fActive').checked=true}$('fReset').onclick=resetFaq;
async function loadSeo(){const {data}=await db.from('site_settings').select('*').eq('id',1).maybeSingle();if(!data)return;$('seoTitle').value=data.seo_title||'';$('seoDescription').value=data.seo_description||'';$('seoKeywords').value=data.seo_keywords||''}
$('seoForm').onsubmit=async e=>{e.preventDefault();try{let p={seo_title:$('seoTitle').value,seo_description:$('seoDescription').value,seo_keywords:$('seoKeywords').value,updated_at:new Date().toISOString()};if($('seoImage').files[0])p.share_image_url=await upload($('seoImage').files[0],'seo');let {error}=await db.from('site_settings').update(p).eq('id',1);if(error)throw error;$('seoMsg').textContent='✓ SEO 設定已儲存'}catch(err){$('seoMsg').textContent=err.message}}
const oldLoadAll=loadAll;loadAll=async function(){await oldLoadAll();await Promise.all([loadHome(),loadInquiries(),loadArticles(),loadFaqs(),loadSeo()]);$('dServices').textContent=services.length;$('dMaterials').textContent=materials.length;$('dProjects').textContent=projects.length}

async function loadQuoteSettings(){const {data}=await db.from('site_settings').select('quote_upload_enabled,quote_upload_help').eq('id',1).maybeSingle();if(!data)return;$('quoteUploadEnabled').checked=data.quote_upload_enabled===true;$('quoteUploadHelp').value=data.quote_upload_help||''} $('quoteSettingsForm').onsubmit=async e=>{e.preventDefault();let {error}=await db.from('site_settings').update({quote_upload_enabled:$('quoteUploadEnabled').checked,quote_upload_help:$('quoteUploadHelp').value,updated_at:new Date().toISOString()}).eq('id',1);$('quoteSettingsMsg').textContent=error?error.message:'✓ 詢價設定已儲存'}; const v7old=loadAll;loadAll=async function(){await v7old();await loadQuoteSettings()};