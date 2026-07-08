(function () {
  var pre = document.getElementById('preloader');
  if (!pre) return;

  var imgEl = document.getElementById('preloader-img');
  var pctEl = document.getElementById('preloader-percent');
  var heroImgEl = document.getElementById('hero-cycle-img');

  var cycleImages = [
    'photos/202406101.jpeg',
    'photos/20240510.jpeg',
    'photos/202509192.jpeg',
    'photos/20250729.jpeg',
    'photos/20240715.jpeg',
    'photos/202410301.jpeg'
  ];

  // Different photos than the preloader's set, cycling in the hero's
  // bracket square for as long as the visitor stays on the homepage.
  var heroImages = [
    'photos/20241031.jpeg',
    'photos/20250709.jpeg',
    'photos/202509191.jpeg',
    'photos/20241102.jpeg',
    'photos/20241027.jpeg',
    'photos/202509171.jpeg'
  ];

  // Every photo used on story.html — quietly warmed into the browser cache
  // in the background while the visitor is still on the homepage, so
  // clicking through to "Our Story" afterwards needs no further loading.
  var storyPhotos = [
    'photos/20240411.jpeg', 'photos/20240412.jpeg', 'photos/20240510.jpeg',
    'photos/20240512.jpeg', 'photos/20240609.jpeg', 'photos/20240610.jpeg',
    'photos/202406101.jpeg', 'photos/20240611.jpeg', 'photos/20240612.jpeg',
    'photos/20240613.jpeg', 'photos/20240614.jpeg', 'photos/20240615.jpeg',
    'photos/20240713.jpeg', 'photos/202407131.jpeg', 'photos/202407132.jpeg',
    'photos/20240714.jpeg', 'photos/20240715.jpeg', 'photos/202407151.jpeg',
    'photos/20240716.jpeg', 'photos/20240717.jpeg', 'photos/202407171.jpeg',
    'photos/20240718.jpeg', 'photos/20240804.png', 'photos/20241004.png',
    'photos/20241027.jpeg', 'photos/20241030.jpeg', 'photos/202410301.jpeg',
    'photos/20241031.jpeg', 'photos/202410311.jpeg', 'photos/20241101.jpeg',
    'photos/20241102.jpeg', 'photos/20250311.jpeg', 'photos/20250704.jpeg',
    'photos/20250708.jpeg', 'photos/20250709.jpeg', 'photos/20250712.jpeg',
    'photos/20250713.jpeg', 'photos/20250714.jpeg', 'photos/20250716.jpeg',
    'photos/20250727.jpeg', 'photos/20250729.jpeg', 'photos/202507291.jpeg',
    'photos/20250819.jpeg', 'photos/20250820.jpeg', 'photos/20250827.jpeg',
    'photos/20250903.jpeg', 'photos/20250913.jpeg', 'photos/20250917.jpeg',
    'photos/202509171.jpeg', 'photos/20250919.jpeg', 'photos/202509191.jpeg',
    'photos/202509192.jpeg', 'photos/202509193.jpeg', 'photos/20250920.jpeg',
    'photos/20251222.jpeg', 'photos/20251224.jpeg', 'photos/20251225.jpeg',
    'photos/202512251.jpeg', 'photos/202512252.jpeg', 'photos/20251226.jpeg',
    'photos/20251227.jpeg', 'photos/20251229.jpeg', 'photos/202512291.jpeg',
    'photos/20260104.jpeg', 'photos/20260106.jpeg', 'photos/20260221.jpeg',
    'photos/202602211.jpeg', 'photos/202602212.jpeg', 'photos/20260223.jpeg',
    'photos/20260228.jpeg', 'photos/20260302.jpeg', 'photos/20260303.jpeg',
    'photos/20260307.jpeg', 'photos/202603071.jpeg', 'photos/202603072.jpeg',
    'photos/202603073.jpeg', 'photos/20260308.jpeg', 'photos/202603081.png',
    'photos/20260313.jpeg', 'photos/20260314.jpeg', 'photos/20260518.jpeg'
  ];

  var STORAGE_KEY = 'anniversaryPreloaderShown';
  var alreadyShown = sessionStorage.getItem(STORAGE_KEY);
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startHeroCycle() {
    if (!heroImgEl || !heroImages.length) return;
    heroImgEl.src = heroImages[0];
    if (reducedMotion) return;
    var heroIndex = 0;
    setInterval(function () {
      heroIndex = (heroIndex + 1) % heroImages.length;
      heroImgEl.src = heroImages[heroIndex];
    }, 2600);
  }

  // Already played once this browser session (e.g. clicking "Home" again) —
  // skip straight past it, no re-animation, no scroll lock.
  if (alreadyShown) {
    pre.remove();
    prefetchStoryPhotos();
    startHeroCycle();
    return;
  }

  if (reducedMotion) {
    sessionStorage.setItem(STORAGE_KEY, '1');
    pre.remove();
    prefetchStoryPhotos();
    startHeroCycle();
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, '1');
  startHeroCycle();
  document.body.classList.add('preloading');

  var cycleTimer = null;
  if (imgEl && cycleImages.length) {
    var cycleIndex = 0;
    imgEl.src = cycleImages[0];
    cycleTimer = setInterval(function () {
      cycleIndex = (cycleIndex + 1) % cycleImages.length;
      imgEl.src = cycleImages[cycleIndex];
    }, 350);
  }

  // Only wait for "critical" images (the ones visible without scrolling).
  var criticalImages = Array.prototype.slice.call(document.images).filter(function (img) {
    return img.id !== 'preloader-img' && img.loading !== 'lazy';
  });

  var total = criticalImages.length;
  var loaded = 0;
  var startTime = Date.now();
  var MIN_DURATION = 3000;

  function updatePercent() {
    var pct = total === 0 ? 100 : Math.round((loaded / total) * 100);
    if (pctEl) pctEl.textContent = pct + '%';
  }

  function onOneDone() {
    loaded++;
    updatePercent();
    if (loaded >= total) finishWhenReady();
  }

  function finishWhenReady() {
    var elapsed = Date.now() - startTime;
    var wait = Math.max(0, MIN_DURATION - elapsed);
    setTimeout(finish, wait);
  }

  function finish() {
    if (cycleTimer) clearInterval(cycleTimer);
    pre.classList.add('is-done');
    document.body.classList.remove('preloading');
    setTimeout(function () { pre.remove(); }, 700);
  }

  function prefetchStoryPhotos() {
    storyPhotos.forEach(function (src) {
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Kick prefetching off right away — it's low priority in the browser,
  // so it won't compete with this page's own images, and it has the
  // whole homepage visit to finish quietly in the background.
  prefetchStoryPhotos();

  if (total === 0) {
    updatePercent();
    finishWhenReady();
  } else {
    criticalImages.forEach(function (img) {
      if (img.complete) {
        onOneDone();
      } else {
        img.addEventListener('load', onOneDone, { once: true });
        img.addEventListener('error', onOneDone, { once: true });
      }
    });
  }
})();
