import'./instagram-gallery.css';
const IG='https://www.instagram.com/oficinagourmetbrigadeiria/';
function refresh(){
  const section=document.querySelector('.instagramSection');if(!section)return;
  section.querySelector('.instagramStats')?.remove();
  section.querySelector('.instagramSnapshot')?.remove();
  const preview=section.querySelector('.instagramPreview');if(!preview)return;
  preview.innerHTML=['/brand/event.webp','/brand/wedding.webp','/brand/sweets.webp','/brand/box.webp'].map((src,i)=>`<a href="${IG}" target="_blank" rel="noreferrer"><img src="${src}" alt="Trabalho da Oficina Gourmet ${i+1}"/></a>`).join('');
}
const observer=new MutationObserver(refresh);observer.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',refresh);window.addEventListener('popstate',()=>setTimeout(refresh,0));refresh();
