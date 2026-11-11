/* gated.js —— 登录可见内容：今译 / 处境卡 / 处境检索
 *
 * 为什么这些字不在本站的 js 文件里：
 *   静态站的一切文件都能被直接下载。把内容写在 data.js 里、只在界面上
 *   “藏起来”，任何人打开 devtools 或 curl 那个 .js 就全拿到了——那是窗帘，不是墙。
 *   所以这些文本根本不随站点发布，只存在 Supabase 的 zy_content 表，
 *   策略限定只有 authenticated 能 select。未登录时连数据都下不到。
 *
 * 交互约定：
 *   未登录 / 未载入 → 相关字段是空字符串，页面显示「登录后可见」；
 *   登录 → load() 取回数据，就地填进 G / YAO / SITUATIONS，再整页重绘；
 *   登出 → wipe() 把内存里的文本清回空，避免同一台机器换人后还看得见。
 */
(function () {
  'use strict';

  var TABLE = 'zy_content';

  /* G / YAO 是别的脚本里的顶层 const，属于全局词法绑定：
     能按名字取到，但不在 window 上（所以别写 window.G）。 */
  function allG() { return (typeof G !== 'undefined' && G) ? G : []; }
  function allYao() { return (typeof YAO !== 'undefined' && YAO) ? YAO : {}; }
  var loaded = false;
  var snap = null;          /* 载入前的空值快照，用于登出还原 */

  /* 只记“哪些位置本来是空的”，不记文本——这样登出时清得干净 */
  function takeSnap() {
    if (snap) return snap;
    snap = { gua: [], yao: {}, situ: 0 };
    allG().forEach(function (g) {
      snap.gua.push({ n: g.n, ciM: g.ciM || '', xiangM: g.xiangM || '' });
    });
    var YY = allYao();
    Object.keys(YY).forEach(function (n) {
      snap.yao[n] = YY[n].map(function (y) { return y.m || ''; });
    });
    snap.situ = SITUATIONS.length;
    return snap;
  }

  function findG(n) {
    var list = allG();
    for (var i = 0; i < list.length; i++) if (list[i].n === n) return list[i];
    return null;
  }

  function apply(p) {
    takeSnap();
    (p.gua || []).forEach(function (r) {
      var g = findG(r.n);
      if (g) { g.ciM = r.ciM || ''; g.xiangM = r.xiangM || ''; }
    });
    (p.yao || []).forEach(function (r) {
      var ys = allYao()[r.n];
      if (!ys) return;
      (r.m || []).forEach(function (m, i) { if (ys[i]) ys[i].m = m || ''; });
    });
    if (p.situations && p.situations.length) {
      SITUATIONS.length = 0;
      p.situations.forEach(function (it) { SITUATIONS.push(it); });
    }
    window.ZY_CHUJING = p.chujing || {};
    loaded = true;
  }

  function wipe() {
    if (!snap) return;
    snap.gua.forEach(function (r) {
      var g = findG(r.n);
      if (g) { g.ciM = r.ciM; g.xiangM = r.xiangM; }
    });
    Object.keys(snap.yao).forEach(function (n) {
      var ys = allYao()[n]; if (!ys) return;
      snap.yao[n].forEach(function (m, i) { if (ys[i]) ys[i].m = m; });
    });
    SITUATIONS.length = 0;
    window.ZY_CHUJING = {};
    loaded = false;
  }

  /* 未登录直接返回 false，不发请求——不登录的人连这次网络请求都看不到 */
  function load() {
    if (loaded) return Promise.resolve(true);
    if (!window.ZYAuth || !ZYAuth.session() || !ZYAuth.token || !ZYAuth.req) {
      return Promise.resolve(false);
    }
    return ZYAuth.token().then(function (tk) {
      return ZYAuth.req('/rest/v1/' + TABLE + '?id=eq.bundle&select=payload', { token: tk });
    }).then(function (rows) {
      if (!rows || !rows.length || !rows[0] || !rows[0].payload) return false;
      apply(rows[0].payload);
      return true;
    }).catch(function () { return false; });
  }

  window.ZY_CONTENT = {
    load: load,
    wipe: wipe,
    isLoaded: function () { return loaded; }
  };
})();
