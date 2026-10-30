const waNumber="6285117557133";
document.querySelectorAll(".wa").forEach(a=>{const message=a.dataset.msg||"Halo Seiton.id, saya ingin konsultasi.";a.href="https://wa.me/"+waNumber+"?text="+encodeURIComponent(message);a.target="_blank";a.rel="noopener noreferrer"});
const toggle=document.querySelector(".nav-toggle"),nav=document.querySelector(".site-nav");
if(toggle&&nav){toggle.addEventListener("click",()=>{const open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",String(open));toggle.textContent=open?"×":"☰"});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");toggle.textContent="☰"}))}
