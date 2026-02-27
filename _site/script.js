document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Effect
    const header = document.getElementById('main-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

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

    // Apply reveal to elements
    const elementsToReveal = document.querySelectorAll('.category-card, .product-card, .feature-item');

    elementsToReveal.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        revealObserver.observe(el);
    });

    // 3. Mobile menu toggle (placeholder functionality)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            alert('Menu mobile seria aberto aqui. Para este demo focado em UI, o menu completo desktop é mostrado em telas maiores.');
        });
    }

    // 4. Button feedbacks
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Você seria redirecionado para a página do produto ou o item seria adicionado ao carrinho.');
        });
    });

    const searchBtn = document.querySelector('.hero-search-large .btn-primary');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidade de busca seria ativada!');
        });
    }

    const demoLinks = document.querySelectorAll('.demo-link');
    demoLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Você seria redirecionado para esta página na loja oficial!');
        });
    });
});
