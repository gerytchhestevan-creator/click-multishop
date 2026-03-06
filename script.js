document.addEventListener('DOMContentLoaded', () => {
    // Banco de dados local carregado via products.js
    const localProducts = window.fullProductsList || [];
    console.log('Catálogo carregado:', localProducts.length, 'produtos found.');
    // 1. Sticky Header Effect
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Simple Reveal Animation on Scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Function to apply reveal to dynamic elements
    window.reaplicarAnimacoes = function () {
        const elementsToReveal = document.querySelectorAll('.product-card:not(.observed), .category-card:not(.observed), .feature-item:not(.observed)');
        elementsToReveal.forEach((el, index) => {
            el.classList.add('observed');
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
            revealObserver.observe(el);
        });
    };

    // 3. Render Products
    const container = document.getElementById('produtos-container');
    if (container) {
        renderProducts(localProducts);
    }

    function sanitize(str) {
        const el = document.createElement('span');
        el.textContent = str;
        return el.innerHTML;
    }

    function renderProducts(productsList) {
        container.innerHTML = '';
        if (productsList.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 20px;">Nenhum produto encontrado.</p>';
            return;
        }

        productsList.forEach((produto) => {
            // SEGURANÇA: criamos elementos DOM com textContent para evitar XSS
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.category = produto.category;

            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'product-img-wrapper';
            const img = document.createElement('img');
            img.src = produto.image_url || '';
            img.alt = produto.title || '';
            img.loading = 'lazy';
            imgWrapper.appendChild(img);

            const info = document.createElement('div');
            info.className = 'product-info';

            const catSpan = document.createElement('span');
            catSpan.className = 'product-category';
            catSpan.textContent = produto.category; // safe — sem innerHTML

            const titleEl = document.createElement('h4');
            titleEl.className = 'product-title';
            titleEl.textContent = produto.title; // safe

            const priceDiv = document.createElement('div');
            priceDiv.className = 'product-price';
            const priceSpan = document.createElement('span');
            priceSpan.className = 'price';
            priceSpan.textContent = 'R$ ' + (produto.price || '0,00');
            priceDiv.appendChild(priceSpan);

            const buyBtn = document.createElement('button');
            buyBtn.className = 'btn-buy';
            buyBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar Agora';

            // Se o produto tiver link de checkout, redireciona; senão vai para página do produto
            const link = produto.buy_link || produto.checkout_url || null;
            buyBtn.addEventListener('click', () => {
                if (link) {
                    window.open(link, '_blank', 'noopener,noreferrer');
                } else {
                    window.location.href = 'produto.html';
                }
            });

            info.appendChild(catSpan);
            info.appendChild(titleEl);
            info.appendChild(priceDiv);
            info.appendChild(buyBtn);

            card.appendChild(imgWrapper);
            card.appendChild(info);
            container.appendChild(card);
        });

        window.reaplicarAnimacoes();
    }

    // 4. Global Filter Logic
    window.filterCategory = function (category, event) {
        if (event) event.preventDefault();

        const filtered = category === 'Todos'
            ? localProducts
            : localProducts.filter(p => p.category === category);

        renderProducts(filtered);

        const targetSection = document.getElementById('destaques');
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
            const headerTitle = targetSection.querySelector('.section-header h2');
            if (headerTitle) {
                headerTitle.innerHTML = category === 'Todos'
                    ? 'Destaques <span class="highlight">Premium</span>'
                    : `${category} <span class="highlight">Premium</span>`;
            }
        }
    };

    // 5. Mobile menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            alert('Menu mobile em desenvolvimento.');
        });
    }

    // 6. Search functionality
    const searchInput = document.querySelector('.hero-search-large input');
    const searchBtn = document.querySelector('.hero-search-large .btn-primary');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const query = searchInput.value.toLowerCase();
            const filtered = localProducts.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
            renderProducts(filtered);
            document.getElementById('destaques').scrollIntoView({ behavior: 'smooth' });
        });
    }
});
