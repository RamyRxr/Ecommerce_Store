export default class BannerSlider {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        this.isAdmin = user && user.is_admin;
        this.images = [];
        this.current = 0;
        this.interval = null;
        this.init();
    }

    async init() {
        await this.loadImages();
        this.render();
        this.startAutoSlide();
    }

    async loadImages() {
        const res = await fetch('../backend/api/home/get_banners.php');
        const data = await res.json();
        this.images = data.success ? data.banners : [];
    }

    getBannerImage(url) {
        if (!url) return '../backend/uploads/banner/4.jpg';
        if (url.startsWith('http')) return url;
        if (url.includes('uploads/banner/')) return '../' + url.replace(/\\/g, '/');
        if (!url.includes('/')) return '../backend/uploads/banner/' + url;
        return '../backend/uploads/banner/' + url.replace(/\\/g, '/');
    }

    render() {
        let bannerImg, controls = '';
        if (!this.images.length) {
            bannerImg = `<img src="../backend/uploads/banner/4.jpg" class="banner-img" id="banner-img" alt="Banner Placeholder" style="opacity:1;">`;
        } else {
            bannerImg = `<img src="${this.getBannerImage(this.images[this.current].url)}" class="banner-img" id="banner-img" style="opacity:1;">`;
        }
        if (this.isAdmin) {
            controls = `
                <div class="banner-controls">
                    <button id="add-banner-btn" title="Add Banner"><i class='bx bx-plus'></i></button>
                    <button id="delete-banner-btn" title="Delete Banner"><i class='bx bx-trash'></i></button>
                </div>
            `;
        }
        this.container.innerHTML = `
            <div class="banner-slider">
                ${bannerImg}
                ${controls}
            </div>
        `;
        if (this.isAdmin) this.setupAdminControls();
    }

    setupAdminControls() {
        document.getElementById('add-banner-btn').onclick = () => this.addBanner();
        document.getElementById('delete-banner-btn').onclick = () => this.deleteBanner();
    }

    async addBanner() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('banner', file);
            await fetch('../backend/api/home/add_banner.php', { method: 'POST', body: formData });
            await this.loadImages();
            this.current = this.images.length - 1;
            this.render();
        };
        input.click();
    }

    async deleteBanner() {
        if (!this.images.length) return;
        const id = this.images[this.current].id;
        await fetch(`../backend/api/home/delete_banner.php?id=${id}`, { method: 'POST' });
        await this.loadImages();
        this.current = 0;
        this.render();
    }

    startAutoSlide() {
        if (this.interval) clearInterval(this.interval);
        if (this.images.length <= 1) return;
        this.interval = setInterval(() => {
            const img = document.getElementById('banner-img');
            if (img) {
                img.style.opacity = 0;
                setTimeout(() => {
                    this.current = (this.current + 1) % this.images.length;
                    img.src = this.getBannerImage(this.images[this.current].url);
                    img.onload = () => {
                        img.style.opacity = 1;
                    };
                }, 400);
            }
        }, 5000);
    }
}