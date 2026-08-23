const INSTAGRAM_URL='https://www.instagram.com/oficinagourmetbrigadeiria/';
const WHATSAPP_URL='https://wa.me/5516997418895';

function mountInstagram(){
  if(location.pathname!=='/'||document.querySelector('.instagramSection'))return;
  const site=document.querySelector('.publicSite');
  const cta=document.querySelector('.publicCta');
  if(!site||!cta)return;

  const section=document.createElement('section');
  section.className='instagramSection';
  section.id='instagram';
  section.innerHTML=`
    <div class="instagramIntro">
      <div>
        <span class="instagramKicker">Siga nosso trabalho</span>
        <h2>Mais momentos no Instagram.</h2>
        <p>Acompanhe novidades, eventos, sabores e bastidores da Oficina Gourmet Brigadeiria.</p>
      </div>
      <a class="instagramFollow" href="${INSTAGRAM_URL}" target="_blank" rel="noreferrer">@oficinagourmetbrigadeiria <span>↗</span></a>
    </div>

    <div class="instagramCard">
      <div class="instagramProfile">
        <img class="instagramAvatar" src="/brand/logo.webp" alt="Oficina Gourmet Brigadeiria"/>
        <div class="instagramIdentity">
          <strong>Oficina Gourmet Brigadeiria</strong>
          <span>@oficinagourmetbrigadeiria</span>
        </div>
        <a class="instagramOpen" href="${INSTAGRAM_URL}" target="_blank" rel="noreferrer">Ver Instagram</a>
      </div>

      <div class="instagramStats" aria-label="Dados do Instagram em 23 de agosto de 2026">
        <div><strong>585</strong><span>publicações</span></div>
        <div><strong>3.240</strong><span>seguidores</span></div>
        <div><strong>2.360</strong><span>seguindo</span></div>
      </div>

      <div class="instagramBio">
        <p>✨ Doces finos para casamento e grandes eventos</p>
        <p>🍫 Brigadeiros artesanais feitos sob encomenda</p>
        <p>💍 Atendemos Jaboticabal e região</p>
      </div>

      <div class="instagramPreview">
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noreferrer"><img src="/brand/wedding.webp" alt="Eventos Oficina Gourmet"/></a>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noreferrer"><img src="/brand/sweets.webp" alt="Brigadeiros Oficina Gourmet"/></a>
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noreferrer"><img src="/brand/box.webp" alt="Encomendas Oficina Gourmet"/></a>
      </div>

      <div class="instagramActions">
        <a href="${INSTAGRAM_URL}" target="_blank" rel="noreferrer">Abrir perfil no Instagram</a>
        <a class="instagramWhatsapp" href="${WHATSAPP_URL}" target="_blank" rel="noreferrer">Pedir orçamento no WhatsApp</a>
      </div>
      <small class="instagramSnapshot">Números exibidos conforme o perfil em 23/08/2026.</small>
    </div>`;

  cta.parentNode?.insertBefore(section,cta);
}

const observer=new MutationObserver(()=>mountInstagram());
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',()=>setTimeout(mountInstagram,0));
window.addEventListener('load',mountInstagram);
mountInstagram();
