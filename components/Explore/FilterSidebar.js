export default class FilterSidebar {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.categories = [
            'Smartphones', 'Laptops', 'Tablets', 'Desktops',
            'Monitors', 'Headphones', 'Speakers', 'Cameras',
            'Gaming Consoles', 'Smart Home', 'Wearables', 'Accessories',
            'Audio', 'Storage', 'Components', 'Networking'
        ];
        this.brands = [
            'Apple', 'Samsung', 'Sony', 'Microsoft', 'Google',
            'Dell', 'HP', 'Lenovo', 'LG', 'Asus', 'Acer',
            'Logitech', 'Bose', 'JBL', 'Canon', 'Nikon',
            'Intel', 'AMD', 'Nvidia', 'Western Digital', 'SanDisk'
        ];
        this.minPrice = 0;
        this.maxPrice = 10000;
        this.currentMinPrice = 0;
        this.currentMaxPrice = 10000;
        this.isUnlimited = false;
        this.init();
    }

    async init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const filterHTML = `
            <div class="filter-container">
                <div class="filter-top">
                    <h3>Filters</h3>
                </div>

                <div class="filter-section">
                    <div class="Categoris-header">
                        <h2>Categories</h2>
                    </div>
                    
                    ${this.categories.map(category => `
                        <div>
                            <input type="checkbox" id="category-${category.toLowerCase().replace(/\s+/g, '-')}" name="category" value="${category}"> 
                            <label for="category-${category.toLowerCase().replace(/\s+/g, '-')}">${category}</label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="filter-section">
                    <div class="Categoris-header">
                        <h2>Price Range</h2>
                    </div>
                    <div class="price-slider-container">
                        <div class="price-range-track">
                            <div class="price-range-progress"></div>
                            <input type="range" id="min-price-range" min="${this.minPrice}" max="${this.maxPrice}" value="${this.currentMinPrice}" class="range-slider min-slider">
                            <input type="range" id="max-price-range" min="${this.minPrice}" max="${this.maxPrice}" value="${this.currentMaxPrice}" class="range-slider max-slider" ${this.isUnlimited ? 'disabled' : ''}>
                        </div>
                        <div class="price-range-values">
                            <span id="price-range-display">$${this.currentMinPrice} - ${this.isUnlimited ? 'Unlimited' : '$' + this.currentMaxPrice}</span>
                        </div>
                        <div class="price-range-inputs">
                            <div>
                                <span>$</span>
                                <input type="number" id="min-price" class="price-input" value="${this.currentMinPrice}" min="${this.minPrice}" max="${this.maxPrice}">
                            </div>
                            <div>
                                <span>$</span>
                                <input type="number" id="max-price" class="price-input" value="${this.currentMaxPrice}" min="${this.minPrice}" max="${this.maxPrice}"
                                    ${this.isUnlimited ? 'disabled' : ''}>
                            </div>
                        </div>
                        <div class="unlimited-checkbox">
                            <input type="checkbox" id="unlimited-price" ${this.isUnlimited ? 'checked' : ''}>
                            <label for="unlimited-price">Unlimited maximum price</label>
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <div class="Categoris-header">
                        <h2>Brand</h2>
                    </div>
                    ${this.brands.map(brand => `
                        <div>
                            <input type="checkbox" id="brand-${brand.toLowerCase().replace(/\s+/g, '-')}" name="brand" value="${brand}"> 
                            <label for="brand-${brand.toLowerCase().replace(/\s+/g, '-')}">${brand}</label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="filter-section">
                    <div class="Categoris-header">
                        <h2>Rating</h2>
                    </div>
                    <div class="rating-options">
                        <div>
                            <input type="radio" id="rating-any" name="rating" value="0" checked> 
                            <label for="rating-any">Any rating</label>
                        </div>
                        <div>
                            <input type="radio" id="rating-4" name="rating" value="4"> 
                            <label for="rating-4">4+ <i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bx-star'></i></label>
                        </div>
                        <div>
                            <input type="radio" id="rating-3" name="rating" value="3"> 
                            <label for="rating-3">3+ <i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i></label>
                        </div>
                        <div>
                            <input type="radio" id="rating-2" name="rating" value="2"> 
                            <label for="rating-2">2+ <i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i></label>
                        </div>
                        <div>
                            <input type="radio" id="rating-1" name="rating" value="1"> 
                            <label for="rating-1">1+ <i class='bx bxs-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i></label>
                        </div>
                    </div>
                </div>

                <div class="filter-section">
                    <div class="Categoris-header">
                        <h2>Availability</h2>
                    </div>
                    <div>
                        <input type="checkbox" id="show-out-of-stock" name="availability" checked>
                        <label for="show-out-of-stock">Include out of stock</label>
                    </div>
                </div>
                
                <button id="apply-filters" class="apply-button">Apply Filters</button>
                <button id="reset-filters" class="reset-button">Reset</button>
            </div>
        `;

        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-sidebar';
        filterContainer.innerHTML = filterHTML;

        const existingFilter = document.querySelector('.filter-sidebar');
        if (existingFilter) {
            existingFilter.replaceWith(filterContainer);
        } else {
            this.container.appendChild(filterContainer);
        }
    }

    setupEventListeners() {
        const minPriceRange = document.getElementById('min-price-range');
        const maxPriceRange = document.getElementById('max-price-range');
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        const priceDisplay = document.getElementById('price-range-display');
        const rangeProgress = document.querySelector('.price-range-progress');
        const unlimitedCheckbox = document.getElementById('unlimited-price');

        this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);

        if (minPriceRange && maxPriceRange && minPrice && maxPrice && priceDisplay && rangeProgress) {
            minPriceRange.addEventListener('input', () => {
                const minVal = parseInt(minPriceRange.value);
                let maxVal = this.isUnlimited ? this.maxPrice : parseInt(maxPriceRange.value);

                if (minVal > maxVal && !this.isUnlimited) {
                    minPriceRange.value = maxVal;
                    minPrice.value = maxVal;
                } else {
                    minPrice.value = minVal;
                }

                priceDisplay.textContent = `$${minPrice.value} - ${this.isUnlimited ? 'Unlimited' : '$' + maxPrice.value}`;
                this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
            });

            if (!this.isUnlimited) {
                maxPriceRange.addEventListener('input', () => {
                    const minVal = parseInt(minPriceRange.value);
                    const maxVal = parseInt(maxPriceRange.value);

                    if (maxVal < minVal) {
                        maxPriceRange.value = minVal;
                        maxPrice.value = minVal;
                    } else {
                        maxPrice.value = maxVal;
                    }

                    priceDisplay.textContent = `$${minPrice.value} - $${maxPrice.value}`;
                    this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
                });
            }

            minPrice.addEventListener('change', () => {
                const minVal = parseInt(minPrice.value);
                let maxVal = this.isUnlimited ? this.maxPrice : parseInt(maxPrice.value);

                if (minVal < this.minPrice) {
                    minPrice.value = this.minPrice;
                    minPriceRange.value = this.minPrice;
                } else if (minVal > maxVal && !this.isUnlimited) {
                    minPrice.value = maxVal;
                    minPriceRange.value = maxVal;
                } else {
                    minPriceRange.value = minVal;
                }

                priceDisplay.textContent = `$${minPrice.value} - ${this.isUnlimited ? 'Unlimited' : '$' + maxPrice.value}`;
                this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
            });

            if (!this.isUnlimited) {
                maxPrice.addEventListener('change', () => {
                    const minVal = parseInt(minPrice.value);
                    const maxVal = parseInt(maxPrice.value);

                    if (maxVal > this.maxPrice) {
                        maxPrice.value = this.maxPrice;
                        maxPriceRange.value = this.maxPrice;
                    } else if (maxVal < minVal) {
                        maxPrice.value = minVal;
                        maxPriceRange.value = minVal;
                    } else {
                        maxPriceRange.value = maxVal;
                    }

                    priceDisplay.textContent = `$${minPrice.value} - $${maxPrice.value}`;
                    this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
                });
            }
        }

        if (unlimitedCheckbox && maxPrice && maxPriceRange) {
            unlimitedCheckbox.addEventListener('change', () => {
                this.isUnlimited = unlimitedCheckbox.checked;

                if (this.isUnlimited) {
                    maxPrice.disabled = true;
                    maxPriceRange.disabled = true;
                    maxPrice.value = this.maxPrice;
                    maxPriceRange.value = this.maxPrice;

                    if (priceDisplay) {
                        priceDisplay.textContent = `$${minPrice.value} - Unlimited`;
                    }
                } else {
                    maxPrice.disabled = false;
                    maxPriceRange.disabled = false;

                    if (priceDisplay) {
                        priceDisplay.textContent = `$${minPrice.value} - $${maxPrice.value}`;
                    }
                }
                this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
            });
        }

        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetAllFilters();
                document.dispatchEvent(new CustomEvent('resetAllFiltersInSidebar'));
            });
        }

        document.addEventListener('resetAllFiltersInSidebar', () => {
            this.resetAllFilters();
        });

        const applyButton = document.getElementById('apply-filters');
        if (applyButton) {
            applyButton.addEventListener('click', async () => {
                const showOutOfStockCheckbox = document.getElementById('show-out-of-stock');
                const filters = {
                    categories: Array.from(document.querySelectorAll('input[name="category"]:checked')).map(el => el.value),
                    brands: Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(el => el.value),
                    rating: document.querySelector('input[name="rating"]:checked')?.value || 0,
                    price: {
                        min: parseInt(document.getElementById('min-price').value) || 0,
                        max: document.getElementById('unlimited-price').checked ? 'unlimited' :
                            parseInt(document.getElementById('max-price').value)
                    },
                    showOutOfStock: showOutOfStockCheckbox ? showOutOfStockCheckbox.checked : true
                };

                document.dispatchEvent(new CustomEvent('filtersAppliedFromSidebar', {
                    detail: { filters }
                }));
            });
        }
    }

    resetAllFilters() {
        document.querySelectorAll('input[name="category"]:checked, input[name="brand"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });

        const ratingAny = document.getElementById('rating-any');
        if (ratingAny) ratingAny.checked = true;

        const showOutOfStockCheckbox = document.getElementById('show-out-of-stock');
        if (showOutOfStockCheckbox) showOutOfStockCheckbox.checked = true;


        const unlimitedCheckbox = document.getElementById('unlimited-price');
        const minPriceRange = document.getElementById('min-price-range');
        const maxPriceRange = document.getElementById('max-price-range');
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        const priceDisplay = document.getElementById('price-range-display');
        const rangeProgress = document.querySelector('.price-range-progress');

        if (unlimitedCheckbox) {
            unlimitedCheckbox.checked = false;
            this.isUnlimited = false;
        }

        if (minPriceRange && maxPriceRange && minPrice && maxPrice && priceDisplay && rangeProgress) {
            minPriceRange.value = this.minPrice;
            maxPriceRange.value = this.maxPrice;
            minPrice.value = this.minPrice;
            maxPrice.value = this.maxPrice;
            maxPrice.disabled = false;
            maxPriceRange.disabled = false;
            priceDisplay.textContent = `$${this.minPrice} - $${this.maxPrice}`;
            this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
        }
    }

    updateRangeProgress(minSlider, maxSlider, progressBar) {
        if (!progressBar || !minSlider || !maxSlider) return;

        const min = parseInt(minSlider.min);
        const max = parseInt(minSlider.max);
        const minVal = parseInt(minSlider.value);
        let maxVal = this.isUnlimited ? max : parseInt(maxSlider.value);

        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;

        progressBar.style.left = `${minPercent}%`;
        progressBar.style.width = `${maxPercent - minPercent}%`;
    }
}