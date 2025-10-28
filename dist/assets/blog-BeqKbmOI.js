import"./script-CPqdeA2b.js";const r="https://ceramic-api.onrender.com";function s(t){return`
    <article class="blog-article__item">
      <div class="blog-article__info">
        <img class="blog-article__img" src="${new URL(t.image,r)}" alt="${t.title}" loading="lazy">
        <div class="blog-article__content">
          <h3 class="blog-article__title">${t.title}</h3>
          <button class="btn-read blog-article__btn">read more</button>
        </div>
      </div>
      <p class="blog-article__excerpt">${t.excerpt}</p>
    </article>
    `}async function i(){const t=await fetch(`${r}/api/posts`);if(!t.ok)throw new Error(`Failed to fetch: ${t.status}`);return t.json()}async function n(){const t=document.querySelector(".blog-cards__grid");if(!t)return console.warn("No .blog-cards__grid found");t.innerHTML='<div class="loading">Loading articles…</div>';try{let a=await i();t.innerHTML=a.map(s).join(""),t.querySelectorAll(".blog-article__item").forEach((e,l)=>{e.style.opacity="0",e.style.transform="translateY(30px)",e.style.transition="all 0.6s ease",setTimeout(()=>{e.style.opacity="1",e.style.transform="translateY(0)"},l*150)})}catch(o){console.error(o),t.innerHTML='<div class="error">Failed to load articles</div>'}}document.addEventListener("DOMContentLoaded",()=>{n()});
