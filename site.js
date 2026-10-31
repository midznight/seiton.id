const WHATSAPP_NUMBER="6285117557133";
document.querySelectorAll("a.wa").forEach((link)=>{const message=link.dataset.message||"Halo Seiton.id, saya ingin konsultasi.";link.href="https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message);link.target="_blank";link.rel="noopener noreferrer";});
const menuButton=document.querySelector(".menu-toggle");
const primaryNav=document.querySelector("#primary-nav");
if(menuButton&&primaryNav){
  const closeMenu=()=>{primaryNav.classList.remove("is-open");menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Buka menu");};
  menuButton.addEventListener("click",()=>{const isOpen=menuButton.getAttribute("aria-expanded")==="true";if(isOpen){closeMenu();}else{primaryNav.classList.add("is-open");menuButton.setAttribute("aria-expanded","true");menuButton.setAttribute("aria-label","Tutup menu");}});
  primaryNav.querySelectorAll("a").forEach((link)=>link.addEventListener("click",closeMenu));
  document.addEventListener("keydown",(event)=>{if(event.key==="Escape")closeMenu();});
  document.addEventListener("click",(event)=>{if(!primaryNav.contains(event.target)&&!menuButton.contains(event.target))closeMenu();});
}