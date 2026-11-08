document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 主導覽列滑動底線邏輯 (Active Line) ---
    const marker = document.getElementById('nav-marker');
    const navLinks = document.querySelectorAll('.nav-links a');

    function indicator(e) {
        marker.style.left = e.offsetLeft + "px";
        marker.style.width = e.offsetWidth + "px";
    }

    // 初始化：找到目前有 .active 的連結並移動線條
    const activeLink = document.querySelector('.nav-links a.active');
    if (activeLink && marker) {
        indicator(activeLink);
    }

    // 點擊事件監聽
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            indicator(e.currentTarget);
        });
    });

    // 視窗大小改變時重新計算底線位置
    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.nav-links a.active');
        if (currentActive && marker) {
            indicator(currentActive);
        }
    });

    // --- 2. 自動更新年份 ---
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- 3. 手機版選單邏輯 (Mobile Menu) ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        if (!mobileMenu) return;
        const isOpen = mobileMenu.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : ''; // 防止背景捲動
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // --- 4. 捲動出現動畫 (Scroll Reveal) ---
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: "0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- 5. 頁面內部分頁/標籤切換邏輯 (如果有用到 .nav-item-bt) ---
    const navItems = document.querySelectorAll('.nav-item-bt');
    const highlight = document.getElementById('sliding-highlight-bt');
    
    if (highlight && navItems.length > 0) {
        function updateHighlight(element) {
            const offsetLeft = element.offsetLeft;
            const width = element.offsetWidth;
            highlight.style.transform = `translateX(${offsetLeft}px)`;
            highlight.style.width = `${width}px`;
        }

        function activateTab(targetLink) {
            navItems.forEach(nav => nav.classList.remove('active-bt'));
            targetLink.classList.add('active-bt');
            updateHighlight(targetLink);

            const targetId = targetLink.getAttribute('href').substring(1); 
            const allContents = document.querySelectorAll('.tab-content'); 
            allContents.forEach(section => {
                section.style.display = ''; 
                section.classList.remove('active-content');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active-content');
            }
        }

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault(); 
                activateTab(item);
                const hash = item.getAttribute('href');
                history.pushState(null, null, hash);
            });
        });

        window.addEventListener('resize', () => {
            const currentActive = document.querySelector('.nav-item-bt.active-bt');
            if (currentActive) updateHighlight(currentActive);
        });

        function init() {
            const currentHash = window.location.hash; 
            let startTab = null;

            if (currentHash) {
                startTab = document.querySelector(`.nav-item-bt[href="${currentHash}"]`);
            }

            if (!startTab) {
                startTab = navItems[0];
            }

            if (startTab) {
                highlight.style.transition = 'none';
                activateTab(startTab);
                
                if (currentHash) {
                    setTimeout(() => {
                        window.scrollTo({
                            top: 0,
                            left: 0,
                            behavior: 'instant'
                        });
                    }, 10);
                }

                setTimeout(() => {
                    highlight.style.transition = ''; 
                }, 100);
            }
        }

        setTimeout(init, 0);
    }

    // --- 6. 3D 視覺：圖片放大與幻燈片切換 (Lightbox) ---
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("zoomed-img");
    const closeBtn = document.querySelector(".close-modal");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    
    if (modal && modalImg) {
        let currentIndex = 0; 
        let zoomableImages = [];

        const openModal = (index) => {
            zoomableImages = Array.from(document.querySelectorAll(".zoomable img"));
            if (zoomableImages.length === 0) return;
            
            currentIndex = index;
            modalImg.src = zoomableImages[currentIndex].src;
            modal.style.display = "flex";
            modal.offsetHeight; 
            modal.classList.add('show');
        };

        document.addEventListener('click', (e) => {
            const zoomableContainer = e.target.closest('.zoomable');
            if (zoomableContainer) {
                const img = zoomableContainer.querySelector('img');
                if (img) {
                    const allZoomables = Array.from(document.querySelectorAll('.zoomable'));
                    const index = allZoomables.indexOf(zoomableContainer);
                    openModal(index);
                }
            }
        });

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = "none";
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        const showPrevImage = () => {
            if (zoomableImages.length === 0) return;
            currentIndex = (currentIndex === 0) ? zoomableImages.length - 1 : currentIndex - 1;
            modalImg.src = zoomableImages[currentIndex].src;
        };

        const showNextImage = () => {
            if (zoomableImages.length === 0) return;
            currentIndex = (currentIndex === zoomableImages.length - 1) ? 0 : currentIndex + 1;
            modalImg.src = zoomableImages[currentIndex].src;
        };

        if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
        if (nextBtn) nextBtn.addEventListener('click', showNextImage);

        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('show')) {
                if (e.key === 'ArrowLeft') showPrevImage();
                if (e.key === 'ArrowRight') showNextImage();
                if (e.key === 'Escape') closeModal();
            }
        });
    }
});
