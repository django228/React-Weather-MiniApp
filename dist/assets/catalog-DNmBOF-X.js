import"./script-CPqdeA2b.js";const n="https://ceramic-api.onrender.com";function s(t){return`
    <article class="goods__card">
      <img src="${new URL(t.image,n)}" alt="${t.title}" loading="lazy">
      <div class="goods__card-details">
        <h3>${t.title}</h3>
        <p>${t.price} €</p>
      </div>
    </article>`}async function c(){const t=await fetch(`${n}/api/products`);if(!t.ok)throw new Error(`Failed to load: ${t.status}`);return t.json()}async function a(t="tea"){const e=document.querySelector(".goods__items");if(!e)return console.warn("No .goods__items found");e.innerHTML='<div class="loading">Loading…</div>';try{const o=await c();let i=[];t==="tea"&&(i=o.slice(0,5)),t==="kitchen"&&(i=o.slice(0,3)),t==="plants"&&(i=o.slice(0,2)),e.innerHTML=i.map(s).join("")}catch(o){console.error(o),e.innerHTML='<div class="error">Failed to load</div>'}}function r(){const t=document.querySelectorAll(".goods__control");t.length&&t.forEach(e=>e.addEventListener("click",async()=>{t.forEach(i=>i.classList.remove("active")),e.classList.add("active");const o=e.dataset.type;await a(o)}))}document.addEventListener("DOMContentLoaded",()=>{r(),a("tea")});
