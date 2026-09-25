const dbSite=supabase.createClient(DCY_CONFIG.SUPABASE_URL,DCY_CONFIG.SUPABASE_KEY);
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const NL=s=>E(s).replace(/\n/g,"<br>"), ST=n=>"★".repeat(+n||0)+"☆".repeat(5-(+n||0));
let SV=[],MT=[],PJ=[];
(async()=>{
 const [a,s,m,p,d,c]=await Promise.all([
 dbSite.from("about_content").select("*").eq("id",1).maybeSingle(),
 dbSite.from("services").select("*").eq("active",true).order("sort_order"),
 dbSite.from("materials").select("*").eq("active",true).order("category").order("sort_order"),
 dbSite.from("projects").select("*").eq("published",true).order("featured",{ascending:false}).order("sort_order"),
 dbSite.from("dm_files").select("*").eq("id",1).maybeSingle(),
 dbSite.from("site_settings").select("*").eq("id",1).maybeSingle()]);
 const A=a.data||{};SV=s.data||[];MT=m.data||[];PJ=p.data||[];
 aboutTitle.textContent=A.title||"關於我們";aboutSummary.textContent=A.summary||"專注於 3D 列印、產品打樣與設計開發服務。";aboutContent.innerHTML=NL(A.content||"");aboutPhilosophy.innerHTML=A.philosophy?`<b>經營理念</b><br>${NL(A.philosophy)}`:"";
 serviceGrid.innerHTML=SV.map((x,i)=>`<article class="card" onclick="openService('${x.id}')"><span class="num">SERVICE ${String(i+1).padStart(2,"0")}</span><h3>${E(x.name)}</h3><p>${E(x.description||"")}</p><span class="more">了解更多 →</span></article>`).join("");
 materialGrid.innerHTML=MT.map(x=>`<article class="card" onclick="openMaterial('${x.id}')"><span class="num">${E(x.category)}</span><h3>${E(x.name)}</h3><p>${E(x.summary||"點選查看材料特性、適用範圍與注意事項。")}</p><span class="more">查看材料 →</span></article>`).join("");
 projectGrid.innerHTML=PJ.length?PJ.map(x=>`<article class="project" onclick="openProject('${x.id}')">${x.cover_url?`<img src="${E(x.cover_url)}" alt="${E(x.title)}">`:`<div class="placeholder">DCY<br>PROJECT</div>`}<div class="body"><small>${x.featured?"FEATURED":"PROJECT"}</small><h3>${E(x.title)}</h3><p>${E(x.summary||"")}</p></div></article>`).join(""):`<p>案例整理中，後續將持續更新。</p>`;
 if(d.data?.file_url){dmLink.hidden=false;dmLink.href=d.data.file_url;dmLink.textContent=d.data.title||"查看／下載公司 DM"}
 renderContact(c.data||{});
})();
function modalOpen(h){modalBody.innerHTML=h;modal.hidden=false;document.body.style.overflow="hidden"}
modalClose.onclick=()=>{modal.hidden=true;document.body.style.overflow=""};modal.onclick=e=>{if(e.target===modal)modalClose.click()}
function openService(id){let x=SV.find(v=>v.id===id);if(!x)return;modalOpen(`<p class="eyebrow">SERVICE</p><h2>${E(x.name)}</h2>${x.image_url?`<img class="detail-img" src="${E(x.image_url)}">`:""}<p>${NL(x.full_content||x.description||"")}</p>${x.applications?`<h3>適合應用</h3><p>${NL(x.applications)}</p>`:""}<a class="btn" href="#contact" onclick="modalClose.click()">聯絡詢問</a>`)}
function openMaterial(id){let x=MT.find(v=>v.id===id);if(!x)return;modalOpen(`<p class="eyebrow">${E(x.category)}</p><h2>${E(x.name)}</h2>${x.image_url?`<img class="detail-img" src="${E(x.image_url)}">`:""}<p>${NL(x.full_content||x.summary||"")}</p><div class="ratings"><span>強度 ${ST(x.strength)}</span><span>韌性 ${ST(x.toughness)}</span><span>耐熱 ${ST(x.heat_resistance)}</span><span>表面 ${ST(x.surface_quality)}</span></div>${x.features?`<h3>材料特色</h3><p>${NL(x.features)}</p>`:""}${x.applications?`<h3>適合用途</h3><p>${NL(x.applications)}</p>`:""}${x.cautions?`<h3>注意事項</h3><p>${NL(x.cautions)}</p>`:""}<a class="btn" href="#contact" onclick="modalClose.click()">詢問此材料</a>`)}
function openProject(id){let x=PJ.find(v=>v.id===id);if(!x)return;let s=SV.find(v=>v.id===x.service_id),m=MT.find(v=>v.id===x.material_id);modalOpen(`<p class="eyebrow">PROJECT</p><h2>${E(x.title)}</h2>${!x.hide_client&&x.client_name?`<p><b>客戶：</b>${E(x.client_name)}</p>`:""}<p>${s?`<b>服務：</b>${E(s.name)}　`:""}${m?`<b>材料：</b>${E(m.name)}`:""}</p><p>${NL(x.content||x.summary||"")}</p><div class="gallery">${(x.gallery_urls||[]).map(u=>`<img src="${E(u)}">`).join("")}</div>`)}
function renderContact(s){let a=[];if(s.show_email&&s.email)a.push(["EMAIL",`mailto:${s.email}`,s.email]);if(s.show_line&&s.line_url)a.push(["LINE",s.line_url,"LINE 聯絡"]);if(s.show_phone&&s.phone)a.push(["TEL",`tel:${s.phone}`,s.phone]);if(s.show_instagram&&s.instagram_url)a.push(["INSTAGRAM",s.instagram_url,"Instagram"]);if(s.show_facebook&&s.facebook_url)a.push(["FACEBOOK",s.facebook_url,"Facebook"]);if(s.show_address&&s.address)a.push(["ADDRESS","",s.address]);contactGrid.innerHTML=a.map(([l,u,t])=>u?`<a href="${E(u)}" ${u.startsWith("http")?'target="_blank" rel="noopener"':""}><small>${l}</small><b>${E(t)}</b></a>`:`<div><small>${l}</small><b>${E(t)}</b></div>`).join("")}
