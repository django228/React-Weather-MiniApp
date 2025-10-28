const API_BASE = "https://ceramic-api.onrender.com";

// формирование html для статьи блога
function blogArticleToHTML(article) {
    return `
    <article class="blog-article__item">
      <div class="blog-article__info">
        <img class="blog-article__img" src="${new URL(article.image, API_BASE)}" alt="${article.title}" loading="lazy">
        <div class="blog-article__content">
          <h3 class="blog-article__title">${article.title}</h3>
          <button class="btn-read blog-article__btn">read more</button>
        </div>
      </div>
      <p class="blog-article__excerpt">${article.excerpt}</p>
    </article>
    `;
}

async function fetchBlogArticles() {
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
}

async function renderBlogArticles() {
    const grid = document.querySelector(".blog-cards__grid");
    if (!grid) {
        return console.warn("No .blog-cards__grid found");
    }

    grid.innerHTML = `<div class="loading">Loading articles…</div>`;

    try {
        const data = await fetchBlogArticles();

        let shown = data;
        grid.innerHTML = shown.map(blogArticleToHTML).join("");
        
        // Добавляем анимацию появления карточек
        const articles = grid.querySelectorAll('.blog-article__item');
        articles.forEach((article, index) => {
            article.style.opacity = '0';
            article.style.transform = 'translateY(30px)';
            article.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                article.style.opacity = '1';
                article.style.transform = 'translateY(0)';
            }, index * 150);
        });
        
    } catch (err) {
        console.error(err);
        grid.innerHTML = `<div class="error">Failed to load articles</div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderBlogArticles();
});
