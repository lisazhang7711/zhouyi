/* ============================================================
   mode.js · 读易 — 电脑版 / 手机版·竖屏 / 手机版·横屏
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

  var MODE_NAME = { desktop: '电脑版', mp: '手机版·竖屏', ml: '手机版·横屏' };

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
          '<em class="mg-rec"' + (isTouch ? ' hidden' : '') + '>推荐</em>' +
        '</button>' +
        '<button class="mg-card" data-m="mp">' +
          '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/></svg>' +
          '<b>手机版 · 竖屏</b>' +
          '<i>窄屏排版<br>顶栏可换行 / 抽屉近满屏</i>' +
          '<em class="mg-rec"' + (isTouch ? '' : ' hidden') + '>推荐</em>' +
        '</button>' +
        '<button class="mg-card" data-m="ml">' +
          '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="2" y="7" width="20" height="10" rx="2.5"/><path d="M18.5 11v2"/></svg>' +
          '<b>手机版 · 横屏</b>' +
          '<i>宽屏排版<br>顶栏压矮 / 抽屉收窄</i>' +
        '</button>' +
      '</div>' +
      '<button class="mg-cancel" id="mgCancel" hidden>继续当前版本</button>' +
      '<div class="mg-foot">横屏版按宽屏排版，竖屏拿手机时会提示转屏；竖屏版按窄屏排版，随时可用</div>' +
    '</div>';

  /* ---------- 竖屏提示（仅横屏版） ---------- */
  var rot = document.createElement('div');
  rot.id = 'mrotate';
  rot.innerHTML =
    '<div class="mr-in">' +
      '<div class="mr-ico"><svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6">' +
      '<rect x="8" y="1.5" width="8" height="15" rx="2" transform="rotate(90 12 9)"/>' +
      '<path d="M4.5 20a8 8 0 0 1 0-11"/><path d="M2 17.5l2.6 2.8L7.4 17.8"/></svg></div>' +
      '<div class="mr-t">请横屏阅读</div>' +
      '<div class="mr-s">你选的是手机版 · 横屏<br>竖屏下仍是竖屏排版，不会自动变横屏</div>' +
      '<div class="mr-btns">' +
        '<button class="mr-btn" id="mrDesk">改用电脑版</button>' +
        '<button class="mr-btn mr-keep" id="mrPortrait">换成竖屏版</button>' +
        '<button class="mr-btn mr-keep" id="mrMobile">仍用横屏版（不再提示）</button>' +
      '</div>' +
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
    if (root.classList.contains('m-portrait')) return 'mp';
    if (root.classList.contains('m-landscape')) return 'ml';
    return null;
  }

  function apply(m) {
    root.classList.remove('mode-mobile', 'mode-desktop', 'm-portrait', 'm-landscape');
    if (m === 'desktop') root.classList.add('mode-desktop');
    else root.classList.add('mode-mobile', m === 'mp' ? 'm-portrait' : 'm-landscape');
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
    if (v === 'mobile') v = 'ml';           /* 旧版「手机版」视为横屏版 */
    if (v !== 'desktop' && v !== 'mp' && v !== 'ml') v = null;
    return v;
  }

  function openGate() {
    var now = cur();
    Array.prototype.forEach.call(gate.querySelectorAll('.mg-card'), function (b) {
      if (b.getAttribute('data-m') === now) b.classList.add('cur');
      else b.classList.remove('cur');
    });
    var c = $('mgCancel');
    if (c) c.hidden = !now;
    gate.hidden = false;
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
    document.body.appendChild(rot);
    document.body.appendChild(scrim);
    addSwitch();

    var m = read();
    if (m) {
      apply(m);
    } else {
      openGate();
      var sw = $('modeSwitch'); if (sw) sw.textContent = '选择版本';
    }

    Array.prototype.forEach.call(gate.querySelectorAll('.mg-card'), function (b) {
      b.onclick = function () {
        var m = b.getAttribute('data-m');
        save(m); gate.hidden = true; apply(m);
        try { toast && toast('已切到' + MODE_NAME[m]); } catch (e) {}
      };
    });
    var gc = $('mgCancel');
    if (gc) gc.onclick = function () { gate.hidden = true; };
    var md = $('mrDesk');
    if (md) md.onclick = function () { save('desktop'); apply('desktop'); };
    var mpb = $('mrPortrait');
    if (mpb) mpb.onclick = function () { save('mp'); apply('mp'); };
    var mm = $('mrMobile');
    if (mm) mm.onclick = function () {
      root.classList.add('m-allow-portrait');
      try { localStorage.setItem(KEY + '_allowPortrait', '1'); } catch (e) {}
    };
    try { if (localStorage.getItem(KEY + '_allowPortrait') === '1') root.classList.add('m-allow-portrait'); } catch (e) {}

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
