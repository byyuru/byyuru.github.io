document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Update Year (自動更新年份) ---
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- 2. Mobile Menu Logic (手機版選單) ---
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

    // --- 3. Scroll Reveal Animation (捲動出現動畫) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
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

    // --- 4. 核心功能：導航滑動與內容切換 (整合版) ---
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
                // 移除 inline style，全權交給 CSS 的 .active-content 控制
                section.style.display = ''; 
                section.classList.remove('active-content');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active-content');
            }
            
            // const allContents = document.querySelectorAll('#ux, #ui-ux, #visual, #award, #workshop, #3d .tab-content'); 
            // allContents.forEach(section => {
            //     section.style.display = 'none'; 
            //     section.classList.remove('active-content');
            // });

            // const targetSection = document.getElementById(targetId);
            // if (targetSection) {
            //     targetSection.style.display = 'block'; 
            //     targetSection.classList.add('active-content');
            // }
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
                // 【新增這段】強制將視窗捲動回最上方
                if (currentHash) {
                    // 利用微小的延遲 (10ms) 來抵銷瀏覽器原生的錨點跳轉
                    setTimeout(() => {
                        window.scrollTo({
                            top: 0,
                            left: 0,
                            behavior: 'instant' // 瞬間回到頂部，避免出現畫面往上滑的閃爍感
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

    // --- 5. 3D 視覺：圖片放大與幻燈片切換 (Lightbox - 事件代理增強版) ---
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("zoomed-img");
    const closeBtn = document.querySelector(".close-modal");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    
    if (modal && modalImg) {
        let currentIndex = 0; 
        let zoomableImages = [];

        // 打開 Modal
        const openModal = (index) => {
            // 每次打開時重新抓取圖片清單，確保抓到最新狀態的 DOM
            zoomableImages = Array.from(document.querySelectorAll(".zoomable img"));
            if (zoomableImages.length === 0) return;
            
            currentIndex = index;
            modalImg.src = zoomableImages[currentIndex].src;
            modal.style.display = "flex";
            
            // 強制瀏覽器重繪 (Reflow)，這能保證 transition 動畫順暢執行
            modal.offsetHeight; 
            
            modal.classList.add('show');
        };

        // 使用「事件代理」綁定點擊：監聽整個網頁，只要點到 .zoomable 內部就觸發
        document.addEventListener('click', (e) => {
            const zoomableContainer = e.target.closest('.zoomable');
            if (zoomableContainer) {
                const img = zoomableContainer.querySelector('img');
                if (img) {
                    // 找出被點擊的圖片在全部圖片中的排序
                    const allZoomables = Array.from(document.querySelectorAll('.zoomable'));
                    const index = allZoomables.indexOf(zoomableContainer);
                    openModal(index);
                }
            }
        });

        // 關閉 Modal
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

        // 切換上/下一張
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

        // 鍵盤操作支援
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('show')) {
                if (e.key === 'ArrowLeft') showPrevImage();
                if (e.key === 'ArrowRight') showNextImage();
                if (e.key === 'Escape') closeModal();
            }
        });
    }
});

// document.addEventListener('DOMContentLoaded', () => {
    
//     // --- 1. Update Year (自動更新年份) ---
//     const yearEl = document.getElementById('year');
//     if (yearEl) {
//         yearEl.textContent = new Date().getFullYear();
//     }

//     // --- 2. Mobile Menu Logic (手機版選單) ---
//     const mobileMenuBtn = document.getElementById('mobile-menu-btn');
//     const closeMenuBtn = document.getElementById('close-menu-btn');
//     const mobileMenu = document.getElementById('mobile-menu');
//     const mobileLinks = document.querySelectorAll('.mobile-link');

//     function toggleMenu() {
//         if (!mobileMenu) return;
//         const isOpen = mobileMenu.classList.toggle('open');
//         document.body.style.overflow = isOpen ? 'hidden' : ''; // 防止背景捲動
//     }

//     if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
//     if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    
//     mobileLinks.forEach(link => {
//         link.addEventListener('click', toggleMenu);
//     });

//     // --- 3. Scroll Reveal Animation (捲動出現動畫) ---
//     const revealElements = document.querySelectorAll('.reveal');
    
//     if ('IntersectionObserver' in window && revealElements.length > 0) {
//         const revealObserver = new IntersectionObserver((entries, observer) => {
//             entries.forEach(entry => {
//                 if (entry.isIntersecting) {
//                     entry.target.classList.add('active');
//                 }
//             });
//         }, {
//             root: null,
//             threshold: 0.1,
//             rootMargin: "0px"
//         });

//         revealElements.forEach(el => revealObserver.observe(el));
//     }

//     // --- 4. 核心功能：導航滑動與內容切換 (整合版) ---
//     // 這段程式碼負責：1. 滑動亮點位置 2. 切換下方顯示的內容 3. 處理從首頁跳轉過來的 Hash
    
//     const navItems = document.querySelectorAll('.nav-item-bt');
//     const highlight = document.getElementById('sliding-highlight-bt');
    
//     // 假設你的內容區塊有統一的 class (例如 .tab-content) 或者是直接透過 ID 抓取
//     // 為了通用性，這裡建議你確保你的內容區塊有 id="ux", id="ui-ux", id="visual"
//     // 並且這三個區塊都在同一個父層容器下
    
//     if (highlight && navItems.length > 0) {

//         // A. 更新亮點位置的函式
//         function updateHighlight(element) {
//             const offsetLeft = element.offsetLeft;
//             const width = element.offsetWidth;
//             highlight.style.transform = `translateX(${offsetLeft}px)`;
//             highlight.style.width = `${width}px`;
//         }

//         // B. 切換頁籤的主要邏輯
//         function activateTab(targetLink) {
//             // 1. 處理導覽列樣式 (移除舊的，加上新的)
//             navItems.forEach(nav => nav.classList.remove('active-bt'));
//             targetLink.classList.add('active-bt');
            
//             // 2. 移動亮點
//             updateHighlight(targetLink);

//             // 3. 處理內容切換 (根據 href="#ux" 抓取 id="ux")
//             const targetId = targetLink.getAttribute('href').substring(1); // 取得 id 名稱
            
//             // 先隱藏所有可能的內容區塊 (這裡假設你有給內容區塊一個共同 class 叫 .tab-content)
//             // 如果沒有共同 class，你可以手動列出所有可能的 ID
//             const allContents = document.querySelectorAll('#ux, #ui-ux, #visual, #award, #workshop, .tab-content'); 
//             allContents.forEach(section => {
//                 section.style.display = 'none'; // 或者移除 active class
//                 section.classList.remove('active-content');
//             });

//             // 顯示目標區塊
//             const targetSection = document.getElementById(targetId);
//             if (targetSection) {
//                 targetSection.style.display = 'block'; // 或者加上 active class
//                 targetSection.classList.add('active-content');
                
//                 // 讓畫面捲動到內容頂端 (可選)
//                 // targetSection.scrollIntoView({ behavior: 'smooth' });
//             }
//         }

//         // C. 綁定點擊事件
//         navItems.forEach(item => {
//             item.addEventListener('click', (e) => {
//                 e.preventDefault(); // 防止頁面直接跳轉，改由 JS 控制
//                 activateTab(item);
                
//                 // 更新網址 Hash (方便使用者分享連結，且不觸發頁面刷新)
//                 const hash = item.getAttribute('href');
//                 history.pushState(null, null, hash);
//             });
//         });

//         // D. 視窗大小改變時，重新計算亮點位置
//         window.addEventListener('resize', () => {
//             const currentActive = document.querySelector('.nav-item-bt.active-bt');
//             if (currentActive) updateHighlight(currentActive);
//         });

//         // --- E. 關鍵初始化邏輯 (解決你的問題) ---
//         // 頁面載入時，檢查網址 Hash
//         function init() {
//             const currentHash = window.location.hash; // 取得網址上的 #ux
//             let startTab = null;

//             // 1. 如果有 Hash，嘗試找到對應的按鈕
//             if (currentHash) {
//                 startTab = document.querySelector(`.nav-item-bt[href="${currentHash}"]`);
//             }

//             // 2. 如果沒有 Hash 或找不到，就用預設的第一個
//             if (!startTab) {
//                 startTab = navItems[0];
//             }

//             if (startTab) {
//                 // 暫時關閉動畫，避免初始載入時的「飛入」效果
//                 highlight.style.transition = 'none';
                
//                 // 執行切換
//                 activateTab(startTab);

//                 // 稍微延遲後把動畫開回來
//                 setTimeout(() => {
//                     highlight.style.transition = ''; 
//                 }, 100);
//             }
//         }

//         // 執行初始化
//         // 使用 setTimeout 0 確保 DOM 渲染完成後才計算寬度
//         setTimeout(init, 0);
//     }
// });
