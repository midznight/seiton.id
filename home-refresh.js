const waNumber="6285117557133";
document.querySelectorAll('a[href="#contact"]').forEach(a=>{a.href="https://wa.me/"+waNumber+"?text="+encodeURIComponent("Halo Seiton.id, saya ingin konsultasi gratis tentang usaha saya.");a.target="_blank";a.rel="noopener noreferrer"});
const toggle=document.querySelector(".nav-toggle"),nav=document.querySelector(".nav");
if(toggle&&nav){toggle.addEventListener("click",()=>{const open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Tutup navigasi":"Buka navigasi")});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false")}))}
