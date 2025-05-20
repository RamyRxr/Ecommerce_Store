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

export default class CategorySlider {
    constructor(containerId, products) {
        this.container = document.getElementById(containerId);
        this.products = products;
        this.visibleCount = this.getVisibleCount();
        this.speed = 0.3;
        this.animationFrame = null;
        this.offset = 0;
        this.render();
        if (this.products.length > this.visibleCount) this.startInfiniteScroll();
        window.addEventListener('resize', () => this.onResize());
    }

    getVisibleCount() {
        const w = window.innerWidth;
        if (w > 1400) return 5;
        if (w > 1100) return 4;
        if (w > 800) return 3;
        return 2;
    }

    render() {
        this.visibleCount = this.getVisibleCount();
        let displayProducts = this.products;
        if (this.products.length <= this.visibleCount) {
            this.container.innerHTML = `
                <div class="category-slider-outer">
                    <div class="category-slider-inner">
                        ${displayProducts.map(p => this.cardHTML(p)).join('')}
                    </div>
                </div>
            `;
        } else {
            displayProducts = [...this.products, ...this.products];
            this.container.innerHTML = `
                <div class="category-slider-outer">
                    <div class="category-slider-inner" style="will-change: transform;">
                        ${displayProducts.map(p => this.cardHTML(p)).join('')}
                    </div>
                </div>
            `;
        }
        this.cards = this.container.querySelectorAll('.product-card');
        this.container.querySelectorAll('.product-card').forEach(card => {
            card.onclick = () => {
                window.location.href = `../HTML-Pages/ItemDetailsPage.html?id=${card.dataset.id}`;
            };
        });
        this.sliderInner = this.container.querySelector('.category-slider-inner');
        this.sliderOuter = this.container.querySelector('.category-slider-outer');
        this.offset = 0;
    }

    cardHTML(p) {
        return `
            <div class="product-card" data-id="${p.id}">
                <img src="${getProductImage(p.images)}" class="product-img" alt="${p.title}">
                <div class="product-title">${p.title}</div>
                <div class="product-price">
                    ${parseFloat(p.price).toFixed(2)} $
                    ${p.original_price && parseFloat(p.original_price) > parseFloat(p.price) ? `
                        <span class="old-price">${parseFloat(p.original_price).toFixed(2)} $</span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    startInfiniteScroll() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        const cardWidth = this.cards[0].offsetWidth + 18;
        const totalCards = this.products.length;
        const totalWidth = cardWidth * totalCards;
        const inner = this.sliderInner;
        this.offset = 0;
        const animate = () => {
            this.offset -= this.speed;
            if (Math.abs(this.offset) >= totalWidth) {
                this.offset = 0;
            }
            inner.style.transform = `translateX(${this.offset}px)`;
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    onResize() {
        this.render();
        if (this.products.length > this.visibleCount) this.startInfiniteScroll();
        else if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    }
}