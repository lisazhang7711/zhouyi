/* ============================================================
   mode.js · 读易 — 手机版 / 电脑版
   首次进入先选版本；手机版为横屏排版，目录与助手走侧滑抽屉
   ============================================================ */
(function () {
  var KEY = 'zy.viewmode';
  var root = document.documentElement;
  var isTouch = false;
  try {
    isTouch = (window.matchMedia && matchMedia('(pointer:coarse)').matches) ||
              (navigator.maxTouchPoints > 0);
  } catch (e) {}
  if (isTouch) root.classList.add('mtouch');

  function $(id) { return document.getElementById(id); }

  /* ---------- 入口选择页 ---------- */
  var gate = document.createElement('div');
  gate.id = 'mgate';
  gate.hidden = true;
  gate.innerHTML =
    '<div class="mg-box">' +
      '<div class="mg-t">读易 · 周易精读</div>' +
      '<div class="mg-s">先选一种阅读方式 · 之后可在顶栏随时切换</div>' +
      '<div class="mg-cards">' +
        '<button class="mg-card" data-m="mobile">' +
          '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/></svg>' +
          '<b>手机版</b>' +
          '<i>横屏阅读<br>目录 / 助手 做成侧滑抽屉</i>' +
          '<em class="mg-rec"' + (isTouch ? '' : ' hidden') + '>推荐</em>' +
        '</button>' +
        '<button class="mg-card" data-m="desktop">' +
          '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>' +
          '<b>电脑版</b>' +
          '<i>三栏常驻<br>目录 / 助手 固定在两侧</i>' +
          '<em class="mg-rec"' + (isTouch ? ' hidden' : '') + '>推荐</em>' +
        '</button>' +
      '</div>' +
      '<div class="mg-foot">手机版按横屏排版：竖屏时目录与助手会挤满屏幕，会提示你转屏</div>' +
    '</div>';

  /* ---------- 竖屏提示 ---------- */
  var rot = document.createElement('div');
  rot.id = 'mrotate';
  rot.innerHTML =
    '<div class="mr-in">' +
      '<div class="mr-ico"><svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6">' +
      '<rect x="8" y="1.5" width="8" height="15" rx="2" transform="rotate(90 12 9)"/>' +
      '<path d="M4.5 20a8 8 0 0 1 0-11"/><path d="M2 17.5l2.6 2.8L7.4 17.8"/></svg></div>' +
      '<div class="mr-t">请横屏阅读</div>' +
      '<div class="mr-s">手机版是横屏排版<br>竖屏下目录和助手会挤满整个屏幕</div>' +
      '<button class="mr-btn" id="mrDesk">改用电脑版</button>' +
    '</div>';

  /* ---------- 抽屉遮罩 ---------- */
  var scrim = document.createElement('div');
  scrim.id = 'mscrim';
  scrim.onclick = function () { closeAll(); };

  /* ---------- 抽屉状态 ---------- */
  function closeAll() {
    root.classList.remove('m-side', 'm-ai');
    syncScrim(); syncBtns();
  }
  function drawer(name, open) {
    var cls = 'm-' + name;
    var on = (open === undefined) ? !root.classList.contains(cls) : !!open;
    if (on) { root.classList.remove('m-side', 'm-ai'); root.classList.add(cls); }
    else { root.classList.remove(cls); }
    syncScrim(); syncBtns();
  }
  function syncScrim() {
    if (scrim) scrim.classList.toggle('on',
      root.classList.contains('m-side') || root.classList.contains('m-ai'));
  }
  function syncBtns() {
    var st = $('sideTog'), at = $('aiTog');
    if (st) st.classList.toggle('on', root.classList.contains('m-side'));
    if (at) at.classList.toggle('on', root.classList.contains('m-ai'));
  }
  function syncTopbar() {
    var h = document.querySelector('header');
    if (h) root.style.setProperty('--mh', h.offsetHeight + 'px');
  }

  /* 保留站点原生开关，切回电脑版时还原 */
  var orig = {};

  function apply(m) {
    root.classList.remove('mode-mobile', 'mode-desktop');
    root.classList.add('mode-' + m, 'mready');
    closeAll();
    var sw = $('modeSwitch');
    if (sw) { sw.textContent = (m === 'mobile' ? '手机版' : '电脑版'); sw.title = '切换手机版 / 电脑版'; }

    var st = $('sideTog'), at = $('aiTog');
    if (m === 'mobile') {
      document.body.classList.remove('sideoff', 'aioff', 'aiforce', 'sidecollapse');
      if (st) { orig.side = st.onclick; st.onclick = function () { drawer('side'); }; }
      if (at) { orig.ai = at.onclick; at.onclick = function () { drawer('ai'); }; }
    } else {
      if (st && orig.side) st.onclick = orig.side;
      if (at && orig.ai) at.onclick = orig.ai;
    }
    setTimeout(syncTopbar, 40);
    window.dispatchEvent(new Event('resize'));
  }

  function save(m) { try { localStorage.setItem(KEY, m); } catch (e) {} }
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  /* ---------- 顶栏版本切换按钮 ---------- */
  function addSwitch() {
    var bar = document.querySelector('header');
    if (!bar || $('modeSwitch')) return;
    var b = document.createElement('button');
    b.className = 'tbtn';
    b.id = 'modeSwitch';
    b.onclick = function () {
      var now = root.classList.contains('mode-mobile') ? 'mobile' : 'desktop';
      var next = now === 'mobile' ? 'desktop' : 'mobile';
      save(next); apply(next);
      try { toast && toast(next === 'mobile' ? '已切到手机版（请横屏）' : '已切到电脑版'); } catch (e) {}
    };
    bar.appendChild(b);
  }

  /* ---------- 启动 ---------- */
  function boot() {
    document.body.appendChild(gate);
    document.body.appendChild(rot);
    document.body.appendChild(scrim);
    addSwitch();

    var m = read();
    if (m === 'mobile' || m === 'desktop') {
      apply(m);
    } else {
      gate.hidden = false;   /* 首次进入：先选 */
      var sw = $('modeSwitch'); if (sw) sw.textContent = '选择版本';
    }

    Array.prototype.forEach.call(gate.querySelectorAll('.mg-card'), function (b) {
      b.onclick = function () {
        var m = b.getAttribute('data-m');
        save(m); gate.hidden = true; apply(m);
      };
    });
    var md = $('mrDesk');
    if (md) md.onclick = function () { save('desktop'); apply('desktop'); };

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
    window.addEventListener('resize', syncTopbar);
    window.addEventListener('orientationchange', function () { setTimeout(syncTopbar, 300); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
