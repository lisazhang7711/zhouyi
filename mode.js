/* ============================================================
   mode.js · 读易 — 电脑版 / 手机版（竖屏排版）
   首次进入先选版本；之后顶栏按钮可随时重选
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

  var MODE_NAME = { desktop: '电脑版', mp: '手机版' };

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
        '<button class="mg-card" data-m="desktop">' +
          '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>' +
          '<b>电脑版</b>' +
          '<i>三栏常驻<br>目录 / 助手 固定在两侧</i>' +
          '<em class="mg-rec">推荐</em>' +
        '</button>' +
        '<button class="mg-card" data-m="mp">' +
          '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/></svg>' +
          '<b>手机版</b>' +
          '<i>窄屏排版<br>顶栏可换行 / 抽屉近满屏</i>' +
        '</button>' +
      '</div>' +
      '<button class="mg-cancel" id="mgCancel" hidden>继续当前版本</button>' +
      '<div class="mg-foot">手机版按窄屏排版，横屏时两侧留白略多；随时可在顶栏切换版本</div>' +
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

  function cur() {
    if (root.classList.contains('mode-desktop')) return 'desktop';
    if (root.classList.contains('mode-mobile')) return 'mp';
    return null;
  }

  function openGate() {
    var now = cur();
    Array.prototype.forEach.call(gate.querySelectorAll('.mg-card'), function (b) {
      b.classList.toggle('cur', b.getAttribute('data-m') === now);
    });
    var c = $('mgCancel');
    if (c) {
      c.hidden = !now;
      c.textContent = now ? '继续' + MODE_NAME[now] : '暂不选择';
    }
    gate.hidden = false;
  }

  function apply(m) {
    root.classList.remove('mode-mobile', 'mode-desktop', 'm-portrait', 'm-landscape');
    if (m === 'desktop') root.classList.add('mode-desktop');
    else root.classList.add('mode-mobile', 'm-portrait');
    root.classList.add('mready');
    closeAll();
    var sw = $('modeSwitch');
    if (sw) { sw.textContent = (MODE_NAME[m] || '选择版本'); sw.title = '点击重新选择版本'; }

    var st = $('sideTog'), at = $('aiTog');
    if (m !== 'desktop') {
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
  function read() {
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    if (v === 'mobile' || v === 'ml' || v === 'mp') v = 'mp';  /* 旧版「手机版 / 横屏版」统一归到手机版 */
    if (v !== 'desktop' && v !== 'mp') v = null;
    return v;
  }

  /* ---------- 顶栏版本按钮 ---------- */
  function addSwitch() {
    var bar = document.querySelector('header');
    if (!bar || $('modeSwitch')) return;
    var b = document.createElement('button');
    b.className = 'tbtn';
    b.id = 'modeSwitch';
    b.onclick = openGate;
    bar.appendChild(b);
  }

  /* ---------- 启动 ---------- */
  function boot() {
    document.body.appendChild(gate);
    document.body.appendChild(scrim);
    addSwitch();

    var m = read();
    if (m) {
      apply(m);
    } else {
      var sw = $('modeSwitch'); if (sw) sw.textContent = '选择版本';
    }
    openGate();

    Array.prototype.forEach.call(gate.querySelectorAll('.mg-card'), function (b) {
      b.onclick = function () {
        var m = b.getAttribute('data-m');
        save(m); gate.hidden = true; apply(m);
        try { toast && toast('已切到' + MODE_NAME[m]); } catch (e) {}
      };
    });
    var gc = $('mgCancel');
    if (gc) gc.onclick = function () { gate.hidden = true; };
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!gate.hidden && cur()) { gate.hidden = true; return; }
      closeAll();
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
