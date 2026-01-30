/**
 * 主题脚本 - Theme Scripts
 * 
 * 功能：
 * 1. 移动端菜单切换
 * 2. 主题切换（浅色/深色/自动）
 * 3. 返回顶部
 * 4. 导航栏滚动效果
 * 5. 图片懒加载
 * 6. 性能优化
 */

(function() {
  'use strict';

  // ============================================
  // 工具函数
  // ============================================

  /**
   * 防抖函数
   * @param {Function} func - 要执行的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function}
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 节流函数
   * @param {Function} func - 要执行的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function}
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 获取滚动位置
   * @returns {number}
   */
  function getScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  // ============================================
  // 主题管理
  // ============================================

  const ThemeManager = {
    html: document.documentElement,
    lightBtn: document.getElementById('theme-light'),
    darkBtn: document.getElementById('theme-dark'),
    autoBtn: document.getElementById('theme-auto'),
    
    init() {
      this.loadTheme();
      this.bindEvents();
      this.updateActiveButton();
    },

    loadTheme() {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'theme-light') {
        this.setLightTheme();
      } else if (savedTheme === 'theme-dark') {
        this.setDarkTheme();
      } else {
        // 自动模式 - 跟随系统
        this.setAutoTheme();
      }
    },

    setLightTheme() {
      this.html.classList.remove('theme-dark');
      this.html.classList.add('theme-light');
      localStorage.setItem('theme', 'theme-light');
      this.updateActiveButton();
    },

    setDarkTheme() {
      this.html.classList.remove('theme-light');
      this.html.classList.add('theme-dark');
      localStorage.setItem('theme', 'theme-dark');
      this.updateActiveButton();
    },

    setAutoTheme() {
      this.html.classList.remove('theme-light', 'theme-dark');
      localStorage.setItem('theme', 'auto');
      this.updateActiveButton();
    },

    updateActiveButton() {
      const currentTheme = localStorage.getItem('theme') || 'auto';
      
      // 重置所有按钮状态
      this.lightBtn?.classList.remove('active');
      this.darkBtn?.classList.remove('active');
      this.autoBtn?.classList.remove('active');
      
      // 激活当前按钮
      if (currentTheme === 'theme-light') {
        this.lightBtn?.classList.add('active');
      } else if (currentTheme === 'theme-dark') {
        this.darkBtn?.classList.add('active');
      } else {
        this.autoBtn?.classList.add('active');
      }
    },

    bindEvents() {
      this.lightBtn?.addEventListener('click', () => this.setLightTheme());
      this.darkBtn?.addEventListener('click', () => this.setDarkTheme());
      this.autoBtn?.addEventListener('click', () => this.setAutoTheme());

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentTheme = localStorage.getItem('theme');
        if (!currentTheme || currentTheme === 'auto') {
          // 自动模式下跟随系统变化
          if (e.matches) {
            this.html.classList.add('theme-dark');
          } else {
            this.html.classList.remove('theme-dark');
          }
        }
      });
    }
  };

  // ============================================
  // 移动端菜单
  // ============================================

  const MobileMenu = {
    html: document.documentElement,
    navBtn: document.querySelector('.navbar-btn'),
    navList: document.querySelector('.navbar-list'),

    init() {
      if (!this.navBtn) return;
      this.bindEvents();
    },

    bindEvents() {
      // 菜单按钮点击
      this.navBtn.addEventListener('click', () => this.toggle());
      
      // 键盘支持
      this.navBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });

      // 点击导航链接关闭菜单
      this.navList?.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && this.html.classList.contains('show-mobile-nav')) {
          this.close();
        }
      });

      // ESC 键关闭菜单
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.html.classList.contains('show-mobile-nav')) {
          this.close();
        }
      });
    },

    toggle() {
      this.html.classList.toggle('show-mobile-nav');
      this.navBtn.classList.toggle('active');
      
      // 更新 aria-expanded
      const isExpanded = this.html.classList.contains('show-mobile-nav');
      this.navBtn.setAttribute('aria-expanded', isExpanded);
    },

    open() {
      this.html.classList.add('show-mobile-nav');
      this.navBtn.classList.add('active');
      this.navBtn.setAttribute('aria-expanded', 'true');
    },

    close() {
      this.html.classList.remove('show-mobile-nav');
      this.navBtn.classList.remove('active');
      this.navBtn.setAttribute('aria-expanded', 'false');
    }
  };

  // ============================================
  // 返回顶部
  // ============================================

  const BackToTop = {
    btn: document.querySelector('.back-to-top-fixed'),
    showThreshold: 300,

    init() {
      if (!this.btn) return;
      this.bindEvents();
      this.checkVisibility();
    },

    bindEvents() {
      // 点击返回顶部
      this.btn.addEventListener('click', () => this.scrollToTop());

      // 滚动时检查可见性
      window.addEventListener('scroll', throttle(() => {
        this.checkVisibility();
      }, 100), { passive: true });
    },

    checkVisibility() {
      const scrollTop = getScrollTop();
      if (scrollTop >= this.showThreshold) {
        this.btn.classList.add('show');
      } else {
        this.btn.classList.remove('show');
      }
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // ============================================
  // 导航栏滚动效果
  // ============================================

  const NavbarScroll = {
    navbar: document.querySelector('.navbar'),
    scrollThreshold: 50,

    init() {
      if (!this.navbar) return;
      this.bindEvents();
      this.checkScroll();
    },

    bindEvents() {
      window.addEventListener('scroll', throttle(() => {
        this.checkScroll();
      }, 100), { passive: true });
    },

    checkScroll() {
      const scrollTop = getScrollTop();
      if (scrollTop > this.scrollThreshold) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }
  };

  // ============================================
  // 图片懒加载
  // ============================================

  const LazyLoader = {
    init() {
      // 检查浏览器是否支持 IntersectionObserver
      if (!('IntersectionObserver' in window)) {
        this.loadAllImages();
        return;
      }

      this.observeImages();
    },

    observeImages() {
      const lazyImages = document.querySelectorAll('[background-image-lazy]');
      if (lazyImages.length === 0) return;

      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    },

    loadImage(element) {
      const imgUrl = element.dataset.img;
      if (!imgUrl) return;

      // 使用 requestAnimationFrame 优化性能
      requestAnimationFrame(() => {
        element.style.backgroundImage = `url(${imgUrl})`;
        element.classList.add('loaded');
      });
    },

    loadAllImages() {
      // 降级处理：直接加载所有图片
      const lazyImages = document.querySelectorAll('[background-image-lazy]');
      lazyImages.forEach(img => this.loadImage(img));
    }
  };

  // ============================================
  // 平滑滚动（锚点链接）
  // ============================================

  const SmoothScroll = {
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();
        
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // 更新 URL 但不跳转
        history.pushState(null, null, targetId);
      });
    }
  };

  // ============================================
  // 代码复制功能
  // ============================================

  const CodeCopy = {
    init() {
      const codeBlocks = document.querySelectorAll('figure.highlight');
      codeBlocks.forEach(block => this.addCopyButton(block));
    },

    addCopyButton(block) {
      const button = document.createElement('button');
      button.className = 'copy-btn';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');

      button.addEventListener('click', async () => {
        const code = block.querySelector('code')?.textContent || '';
        
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied!';
          button.classList.add('copied');
          
          setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
          button.textContent = 'Failed';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        }
      });

      block.style.position = 'relative';
      block.appendChild(button);
    }
  };

  // ============================================
  // 初始化
  // ============================================

  function init() {
    ThemeManager.init();
    MobileMenu.init();
    BackToTop.init();
    NavbarScroll.init();
    LazyLoader.init();
    SmoothScroll.init();
    CodeCopy.init();
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();