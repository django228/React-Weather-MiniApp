const API_URL = "https://ceramic-api.onrender.com";

function itemToHTML(item) {
    return `
    <article class="goods__card">
      <img src="${new URL(item.image, API_URL)}" alt="${item.title}" loading="lazy">
      <div class="goods__card-details">
        <h3>${item.title}</h3>
        <p>${item.price} €</p>
      </div>
    </article>`;
}

async function loadItems() {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`);
    }
    return response.json();
}

async function displayItems(type = "tea") {
    const container = document.querySelector(".goods__items");
    if (!container) {
        return console.warn("No .goods__items found");
    }

    container.innerHTML = `<div class="loading">Loading…</div>`;

    try {
        const items = await loadItems();

        let filtered = [];
        if (type === "tea") filtered = items.slice(0, 5);
        if (type === "kitchen") filtered = items.slice(0, 3);
        if (type === "plants") filtered = items.slice(0, 2);

        container.innerHTML = filtered.map(itemToHTML).join("");
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="error">Failed to load</div>`;
    }
}

function initControls() {
    const controls = document.querySelectorAll(".goods__control");
    if (!controls.length) return;

    controls.forEach((control) =>
        control.addEventListener("click", async () => {
            controls.forEach((c) => c.classList.remove("active"));
            control.classList.add("active");

            const type = control.dataset.type;
            await displayItems(type);
        })
    );
}

document.addEventListener("DOMContentLoaded", () => {
    initControls();
    displayItems("tea");
});

