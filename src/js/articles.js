const API_URL = "https://ceramic-api.onrender.com";

function articleToHTML(article) {
    return `
    <article class="posts__entry">
      <div class="posts__entry-details">
        <img class="posts__entry-image" src="${new URL(article.image, API_URL)}" alt="${article.title}" loading="lazy">
        <div class="posts__entry-header">
          <h3 class="posts__entry-title">${article.title}</h3>
          <button class="btn-read posts__entry-action">read</button>
        </div>
      </div>
      <p class="posts__entry-summary">${article.excerpt} €</p>
    </article>
    `;
}

async function loadArticles() {
    const response = await fetch(`${API_URL}/api/posts`);
    if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`);
    }
    return response.json();
}

async function displayArticles() {
    const container = document.querySelector(".posts__items");
    if (!container) {
        return console.warn("No .posts__items found");
    }

    container.innerHTML = `<div class="loading">Loading…</div>`;

    try {
        const articles = await loadArticles();

        let items = articles;
        container.innerHTML = items.map(articleToHTML).join("");
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="error">Failed to load</div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    displayArticles();
});

