const db=supabase.createClient(DCY_CONFIG.SUPABASE_URL,DCY_CONFIG.SUPABASE_KEY);
const login=document.querySelector("#login"),panel=document.querySelector("#panel");
async function boot(){const {data:{session}}=await db.auth.getSession();session?show(session.user):hide()}
function show(u){login.hidden=true;panel.hidden=false;document.querySelector("#user").textContent=u.email;loadServices();loadMaterials()}
function hide(){login.hidden=false;panel.hidden=true}
loginForm.onsubmit=async e=>{e.preventDefault();loginMsg.textContent="登入中…";const {data,error}=await db.auth.signInWithPassword({email:email.value,password:password.value});if(error)return loginMsg.textContent=error.message;loginMsg.textContent="";show(data.user)}
logout.onclick=async()=>{await db.auth.signOut();hide()}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.hidden=true);document.querySelector("#"+b.dataset.tab).hidden=false;title.textContent=b.dataset.tab==="services"?"服務管理":"材料管理"})
serviceForm.onsubmit=async e=>{e.preventDefault();const {error}=await db.from("services").insert({name:sname.value,description:sdesc.value,sort_order:+sorder.value,active:true});if(error)return alert(error.message);serviceForm.reset();loadServices()}
materialForm.onsubmit=async e=>{e.preventDefault();const {error}=await db.from("materials").insert({category:mcat.value,name:mname.value,sort_order:+morder.value,active:true});if(error)return alert(error.message);materialForm.reset();loadMaterials()}
async function loadServices(){const {data,error}=await db.from("services").select("*").order("sort_order");if(error)return;serviceList.innerHTML=data.map(x=>`<div class="row"><b>${esc(x.name)}</b><p>${esc(x.description||"")}</p><button class="danger" onclick="del('services','${x.id}')">刪除</button></div>`).join("")}
async function loadMaterials(){const {data,error}=await db.from("materials").select("*").order("category").order("sort_order");if(error)return;materialList.innerHTML=data.map(x=>`<div class="row"><b>${esc(x.category)}｜${esc(x.name)}</b><p>排序 ${x.sort_order}</p><button class="danger" onclick="del('materials','${x.id}')">刪除</button></div>`).join("")}
async function del(t,id){if(!confirm("確定刪除？"))return;const {error}=await db.from(t).delete().eq("id",id);if(error)return alert(error.message);t==="services"?loadServices():loadMaterials()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}boot();