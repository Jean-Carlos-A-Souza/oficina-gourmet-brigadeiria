const money=(n:number)=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let installed=false;
async function enhanceQuotes(){
  if(location.pathname!=='/app')return;
  const heading=[...document.querySelectorAll('h1')].find(x=>x.textContent?.trim()==='Orçamentos');
  if(!heading)return;
  const panel=document.querySelector('main .panel');
  if(!panel)return;
  let quotes:any[]=[];
  try{const r=await fetch('/api/quotes',{credentials:'include'});if(!r.ok)return;quotes=await r.json()}catch{return}
  panel.querySelectorAll('.row').forEach(row=>{
    if(row.querySelector('.quoteDetailsBtn'))return;
    const txt=row.querySelector('b')?.textContent||'';
    const short=(txt.match(/#([^ ·]+)/)||[])[1];
    const q=quotes.find((x:any)=>String(x.id).slice(-5)===short);
    if(!q)return;
    const btn=document.createElement('button');btn.className='quoteDetailsBtn';btn.textContent='Ver detalhes';
    btn.onclick=()=>openQuote(q);
    row.appendChild(btn);
  })
}
function openQuote(q:any){
  document.querySelector('.quoteDetailsOverlay')?.remove();
  const overlay=document.createElement('div');overlay.className='quoteDetailsOverlay';
  const totalQty=(q.items||[]).reduce((s:number,x:any)=>s+Number(x.qty||0),0);
  overlay.innerHTML=`<div class="quoteDetailsModal"><div class="quoteDetailsHead"><div><small>ORÇAMENTO #${String(q.id).slice(-5)}</small><h2>${escapeHtml(q.client||'Cliente')}</h2><p>${escapeHtml(q.event||'Encomenda')} · ${q.date?new Date(q.date+'T12:00').toLocaleDateString('pt-BR'):'Sem data'}</p></div><button class="quoteClose" aria-label="Fechar">×</button></div><div class="quoteDetailStatus">Status: <b>${escapeHtml(q.status||'Rascunho')}</b></div><div class="quoteDetailItems">${(q.items||[]).map((x:any)=>`<div><span><b>${Number(x.qty)}×</b> ${escapeHtml(x.flavor||'Item')}</span><span>${money(x.unit)}/un.</span><strong>${money(Number(x.qty)*Number(x.unit))}</strong></div>`).join('')}</div><div class="quoteDetailSummary"><span>${totalQty} brigadeiros</span><b>Total ${money(q.total)}</b></div></div>`;
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
  overlay.querySelector('.quoteClose')?.addEventListener('click',()=>overlay.remove());
  document.body.appendChild(overlay);
}
function escapeHtml(v:string){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]||c))}
const obs=new MutationObserver(()=>setTimeout(enhanceQuotes,0));obs.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',enhanceQuotes);window.addEventListener('popstate',()=>setTimeout(enhanceQuotes,0));enhanceQuotes();
