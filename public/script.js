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

    function renderProducts(productsList) {
        container.innerHTML = '';
        if (productsList.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 20px;">Nenhum produto encontrado.</p>';
            return;
        }

        productsList.forEach((produto, index) => {
            const html = `
                <div class="product-card" data-category="${produto.category}">
                    <div class="product-img-wrapper">
                        <img src="${produto.image_url}" alt="${produto.title}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <span class="product-category">${produto.category}</span>
                        <h4 class="product-title">${produto.title}</h4>
                        <div class="product-price">
                            <span class="price">R$ ${produto.price}</span>
                        </div>
                        <button class="btn-buy" onclick="window.location.href='produto.html'"><i class="fas fa-shopping-cart"></i> Comprar Agora</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
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
