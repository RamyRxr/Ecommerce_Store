export default class ProductLoader {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.products = [];
        this.filters = {
            category: null,
            minPrice: null,
            maxPrice: null,
            search: ''
        };
    }
    
    async loadProducts() {
        try {
            // Show loading state
            this.container.innerHTML = '<div class="loading">Loading products...</div>';
            
            // Build query string for filters
            const queryParams = new URLSearchParams();
            
            if (this.filters.category) {
                queryParams.append('category', this.filters.category);
            }
            
            if (this.filters.minPrice) {
                queryParams.append('min_price', this.filters.minPrice);
            }
            
            if (this.filters.maxPrice) {
                queryParams.append('max_price', this.filters.maxPrice);
            }
            
            if (this.filters.search) {
                queryParams.append('search', this.filters.search);
            }
            
            // Fetch products from API
            const response = await fetch(`api/products/list.php?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                this.products = data.data;
                this.renderProducts();
            } else {
                this.container.innerHTML = `<div class="error">${data.message || 'Failed to load products'}</div>`;
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.container.innerHTML = '<div class="error">Connection error. Please try again.</div>';
        }
    }
    
    renderProducts() {
        if (this.products.length === 0) {
            this.container.innerHTML = '<div class="no-products">No products found</div>';
            return;
        }
        
        this.container.innerHTML = '';
        
        this.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image_url || 'assets/images/product-placeholder.jpg'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
                    <p class="product-description">${product.description.substring(0, 100)}...</p>
                </div>
                <div class="product-actions">
                    <button class="view-btn" data-id="${product.product_id}">View Details</button>
                    <button class="add-to-cart-btn" data-id="${product.product_id}">Add to Cart</button>
                </div>
            `;
            
            this.container.appendChild(productCard);
        });
        
        // Add event listeners to buttons
        this.container.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                window.location.href = `product.html?id=${productId}`;
            });
        });
        
        this.container.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                this.addToCart(productId);
            });
        });
    }
    
    async addToCart(productId) {
        try {
            const formData = new FormData();
            formData.append('product_id', productId);
            formData.append('quantity', 1);
            
            const response = await fetch('api/cart/add.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Product added to cart');
            } else {
                alert(data.message || 'Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Connection error. Please try again.');
        }
    }
    
    setFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.loadProducts();
    }
}