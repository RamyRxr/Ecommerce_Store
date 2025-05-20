import BannerSlider from './BannerSlider.js';
import CategorySlider from './CategorySlider.js';

export default class HomeComponent {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.render();
    }

    async render() {
        const outer = document.createElement('div');
        outer.className = 'home-content';

        const main = document.createElement('div');
        main.className = 'main-content-container';

        main.innerHTML = `
            <div id="banner-slider"></div>
            <div id="categories-section"></div>
        `;

        outer.innerHTML = '';
        outer.appendChild(main);

        const existing = document.querySelector('.home-content');
        if (existing) existing.replaceWith(outer);
        else this.container.appendChild(outer);

        new BannerSlider('banner-slider');

        // Fetch all non-empty categories from backend
        const categoriesRes = await fetch('../backend/api/home/get_non_empty_categories.php');
        const categoriesData = await categoriesRes.json();
        const categories = categoriesData.success ? categoriesData.categories : [];

        const categoriesSection = document.getElementById('categories-section');
        for (const cat of categories) {
            const products = await this.fetchCategoryProducts(cat);
            if (!products.length) continue;
            const catDiv = document.createElement('div');
            catDiv.className = 'category-section';
            catDiv.innerHTML = `<h2 class="category-title">${cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>
                <div id="slider-${cat}"></div>`;
            categoriesSection.appendChild(catDiv);
            new CategorySlider(`slider-${cat}`, products);
        }
    }

    async fetchCategoryProducts(category) {
        const res = await fetch(`../backend/api/home/get_category_products.php?category=${encodeURIComponent(category)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.success ? data.products : [];
    }
}