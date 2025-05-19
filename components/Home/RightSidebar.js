function getProductImage(images) {
    if (images && Array.isArray(images) && images.length > 0) {
        const img = images[0];
        if (img.startsWith('http')) return img;
        if (img.includes('uploads/')) return '../' + img;
        if (img.startsWith('assets/')) return '../' + img;
        return '../backend/uploads/products/' + img;
    }
    return '../assets/images/products-images/placeholder.svg';
}

export default class RightSidebar {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.render();
    }

    async render() {
        const outer = document.createElement('div');
        outer.className = 'right-sidebar-outer';

        const sidebar = document.createElement('div');
        sidebar.className = 'right-sidebar';

        sidebar.innerHTML = `
            <div class="newest-items">
                <div class="section-header"><h3>Newest Products</h3></div>
                <div class="items-list" id="recent-products-list"></div>
            </div>
        `;

        outer.innerHTML = '';
        outer.appendChild(sidebar);

        const existing = document.querySelector('.right-sidebar-outer');
        if (existing) existing.replaceWith(outer);
        else this.container.appendChild(outer);

        const products = await this.fetchRecentProducts();
        this.renderProducts(products);
    }

    async fetchRecentProducts() {
        const res = await fetch('../backend/api/home/get_recent_products.php');
        const data = await res.json();
        return data.success ? data.products : [];
    }

    renderProducts(products) {
        const list = document.getElementById('recent-products-list');
        list.innerHTML = products.slice(0, 10).map(p => `
            <div class="item-card" data-id="${p.id}">
                <img src="${getProductImage(p.images)}" class="item-img" alt="${p.title}">
                <div class="item-info">
                    <div class="item-title">${p.title}</div>
                    <div class="price">$${parseFloat(p.price).toFixed(2)}</div>
                    <div class="item-desc">${p.description ? p.description.split('\n')[0].slice(0, 40) : ''}</div>
                </div>
            </div>
        `).join('');
        list.querySelectorAll('.item-card').forEach(card => {
            card.onclick = () => {
                window.location.href = `../HTML-Pages/ItemDetailsPage.html?id=${card.dataset.id}`;
            };
        });
    }
}