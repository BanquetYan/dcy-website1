(async()=>{
  if(!window.supabase||!window.DCY_CONFIG)return;
  const db=window.supabase.createClient(DCY_CONFIG.SUPABASE_URL,DCY_CONFIG.SUPABASE_KEY);
  const {data:services}=await db.from("services").select("*").eq("active",true).order("sort_order");
  if(services?.length){
    const box=document.querySelector(".services");
    box.innerHTML=services.map((x,i)=>`<article><span>${String(i+1).padStart(2,"0")}</span><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.description||"")}</p></article>`).join("");
  }
  const {data:materials}=await db.from("materials").select("*").eq("active",true).order("category").order("sort_order");
  if(materials?.length){
    const sec=document.querySelector("#materials");
    const intro=sec.querySelector(".section-head");
    sec.querySelectorAll(".material-group").forEach(x=>x.remove());
    const groups=Object.groupBy?Object.groupBy(materials,x=>x.category):materials.reduce((a,x)=>((a[x.category]??=[]).push(x),a),{});
    Object.entries(groups).forEach(([cat,items])=>{
      const d=document.createElement("div");d.className="material-group";
      d.innerHTML=`<h3>${escapeHtml(cat)}</h3><div class="material-tags">${items.map(x=>`<span>${escapeHtml(x.name)}</span>`).join("")}</div>`;
      intro.insertAdjacentElement("afterend",d);
    });
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
})();