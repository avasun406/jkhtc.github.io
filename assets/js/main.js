/* ============================================================
   九寬科技官網 - 共享腳本
   功能：主題切換 / 移動端菜單 / 滾動揭示 / 數字遞增 / 導航滾動效果
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 主題切換（暗/亮，記憶偏好） ---------- */
  const THEME_KEY = 'jkthc-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initTheme = saved || (prefersDark ? 'dark' : 'dark'); // 默認深色
  root.setAttribute('data-theme', initTheme);

  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.textContent = initTheme === 'dark' ? '🌙' : '☀️';
    themeBtn.addEventListener('click', function () {
      const cur = root.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
    });
  }

  /* ---------- 移動端漢堡菜單 ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  if (hamburger && navLinks) {
    function openMenu() {
      navLinks.classList.add('open');
      navOverlay && navOverlay.classList.add('show');
      hamburger.classList.add('active');
      hamburger.innerHTML = '<i class="fas fa-times"></i>';
      hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      navLinks.classList.remove('open');
      navOverlay && navOverlay.classList.remove('show');
      hamburger.classList.remove('active');
      hamburger.innerHTML = '<i class="fas fa-bars"></i>';
      hamburger.setAttribute('aria-expanded', 'false');
    }
    hamburger.addEventListener('click', function () {
      if (navLinks.classList.contains('open')) closeMenu(); else openMenu();
    });
    navOverlay && navOverlay.addEventListener('click', closeMenu);
    // 點擊菜單項後關閉
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- 導航欄滾動效果（縮小+加深模糊） ---------- */
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ---------- 平滑滾動（錨點） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- 滾動揭示動畫 ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // 降級：直接顯示
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 數字遞增動畫 ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    const decimals = (target % 1 !== 0) ? 2 : 0;
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : Math.floor(target).toLocaleString();
    }
    requestAnimationFrame(step);
  }
  const countEls = document.querySelectorAll('.num[data-target]');
  if ('IntersectionObserver' in window && countEls.length) {
    const cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    countEls.forEach(function (el) { cio.observe(el); });
  } else {
    countEls.forEach(animateCount);
  }

  /* ---------- FAQ 手風琴 ---------- */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var ans = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      // 關閉所有其他
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        ans.style.maxHeight = null;
      } else {
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
})();
