/* 读易 · 十翼 UI 层
 * 依赖：shiyi.js（YZ，数据）、han.js（HJ / HM）、index.html 内联脚本
 *       （annotate / annotateM / cbtns / gua / esc / G / HM / HJ）
 * 十翼在站上分两处落地：
 *   一、彖传 64 条：挂在各卦下，由 sentencesOf / panelChuan 经 YZ_TUAN 取用；
 *   二、系辞上下、说卦、序卦、杂卦、文言五篇通论：整篇开卷读，由 YZ_BOOK_HTML 渲染。
 * 原文走 HJ（经文通道），今译走 HM（今译通道），界面文字一律 HM。
 */
(function () {
  if (typeof YZ === 'undefined') { /* shiyi.js 未加载：十翼功能整体缺席 */ return; }
  var YZ_OK = true;
  try { if (typeof window !== 'undefined') window.YZ_OK = true; } catch (e) {}

  /* ---------- 彖传索引 ---------- */
  var TUAN = {};
  YZ.tuan.forEach(function (t) { TUAN[t.n] = t; });
  YZ_TUAN = function (n) { return TUAN[n] || null; };

  /* ---------- 五篇通论 + 文言：key / 篇名 / 一句解题 / 附注 ---------- */
  var BOOKS = [
    ['xici_shang', '系辞上传', '通论《易》之为书：从乾坤生成说到卦爻体例，再说圣人何以作《易》。',
      '旧分章不一，此处依文气断为十二段，段号只为便于对着读，不改原文一字。'],
    ['xici_xia', '系辞下传', '续论卦爻之用：制器尚象、爻位吉凶、忧患九卦，落点在人如何处变。',
      '文气与上传相接而用意更切近人事。'],
    ['shuogua', '说卦传', '八卦的卦德与取象：天地雷风水火山泽各主何德、各像何物。',
      '全篇取象的总目录，站内〔象〕層所据即此。'],
    ['xugua', '序卦传', '六十四卦相承之次：一句一卦，说明下一卦因何而来。',
      '已散入各卦「十翼互见」，此处为通读全篇。'],
    ['zagua', '杂卦传', '打散卦序，两两对举，用一字点出一卦之性情。',
      '已散入各卦「十翼互见」，此处为通读全篇。'],
    ['wenyan', '文言传', '专为乾、坤二卦而作：把卦爻辞一句一句申说开来，是十翼里最细的一篇。',
      '乾、坤两卦下另有分段的删述，此处为全篇通读。']
  ];
  YZ_BOOKS = BOOKS;
  var MP = {};
  BOOKS.forEach(function (b) { MP[b[0]] = b; });
  YZ_MAP = MP;

  function cut(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; }

  /* ---------- 侧栏目录：彖传六十四 ---------- */
  YZ_SIDE_TUAN = function () {
    return '<div class="yzside">' + YZ.tuan.map(function (t) {
      return '<div class="yzrow" data-yj="t:' + t.n + '">'
        + '<span class="yzn">' + t.n + '</span>'
        + '<span class="yzt">' + HJ(gua(t.n).name) + '</span>'
        + '<span class="yzx">' + HJ(cut(t.yw, 20)) + '</span>'
        + '</div>';
    }).join('') + '</div>';
  };

  /* ---------- 侧栏目录：通论五篇 ---------- */
  YZ_SIDE_BOOKS = function () {
    let h = '<div class="yzside">';
    BOOKS.forEach(function (b) {
      const segs = YZ[b[0]] || [];
      let ch = 0;
      segs.forEach(function (s) { ch += s.yw ? s.yw.length : 0; });
      h += '<div class="yzbook" data-yj="b:' + b[0] + '">'
        + '<div class="ybh"><b>' + HM(b[1]) + '</b>'
        + '<span class="ybc">' + segs.length + ' ' + HM('段') + ' · ' + ch + ' ' + HM('字') + '</span></div>'
        + '<div class="ybt">' + HM(b[2]) + '</div>'
        + '</div>';
    });
    h += '<div class="yznote">' + HM('左「彖」按卦看一卦之断；左「論」看五篇通论全篇。'
      + '原文为公有领域古籍，今译由本站自研；顶栏繁简切换只换字形，不换文字。') + '</div>';
    return h + '</div>';
  };

  /* ---------- 段里提到的卦名 -> 可点的卦 chip ---------- */
  function guaList() {
    try { return (typeof G === 'undefined') ? [] : G; } catch (e) { return []; }
  }
  function guaChips(text) {
    const out = [], seen = {};
    guaList().forEach(function (g) {
      if (text.indexOf(g.name) >= 0 && !seen[g.n]) { seen[g.n] = 1; out.push(g.n); }
    });
    if (!out.length) return '';
    return '<div class="hjlink">' + out.slice(0, 12).map(function (n) {
      return '<span class="chip" data-n="' + n + '">' + HJ(gua(n).name) + '</span>';
    }).join('') + '</div>';
  }

  /* ---------- 主区：整篇通读 ---------- */
  YZ_BOOK_HTML = function (key) {
    const b = MP[key];
    if (!b) return '<div class="card"><div class="pend">' + HM('这一篇还没有内容。') + '</div></div>';
    const segs = YZ[key] || [];
    const idx = BOOKS.map(function (x) { return x[0]; }).indexOf(key);
    const prev = BOOKS[idx - 1], next = BOOKS[idx + 1];
    const total = segs.reduce(function (a, s) { return a + (s.yw ? s.yw.length : 0); }, 0);

    let h = '<div class="ghead yzhead"><div class="gtitle">'
      + '<h1>' + HM(b[1]) + '</h1>'
      + '<div class="meta">' + HM('十翼') + ' · ' + segs.length + ' ' + HM('段')
      + ' · ' + total + ' ' + HM('字') + '</div>'
      + '<div class="full">' + HM(b[2]) + '</div>'
      + '<div class="yzbar">'
      + '<button data-yz="home">' + HM('← 回到六十四卦') + '</button>'
      + '<span class="yzprev"></span>'
      + '<button data-yz="' + (prev ? prev[0] : '') + '"' + (prev ? '' : ' disabled') + '>'
      + HM('上一篇') + (prev ? ' · ' + HM(prev[1]) : '') + '</button>'
      + '<button data-yz="' + (next ? next[0] : '') + '"' + (next ? '' : ' disabled') + '>'
      + HM('下一篇') + (next ? ' · ' + HM(next[1]) : '') + '</button>'
      + '</div></div></div>';

    segs.forEach(function (s, i) {
      const head = HM('《周易》· ') + HM(b[1]) + ' · ' + HM('第') + ' ' + (i + 1) + ' ' + HM('段');
      h += '<div class="card" id="yzz-' + i + '"><div class="chead">'
        + '<span class="snum yzno">' + (i + 1) + '/' + segs.length + '</span>'
        + '<h3>' + HM(b[1]) + ' · ' + HM('第') + ' ' + (i + 1) + ' ' + HM('段') + '</h3>'
        + cbtns(HJ(s.yw), HM(s.bh), head, '') + '</div>'
        + '<div class="yuan">' + annotate(s.yw) + '</div>'
        + '<div class="bai">' + annotateM(s.bh) + '</div>'
        + guaChips(s.yw) + '</div>';
    });

    h += '<div class="card"><div class="chead"><h3>' + HM('关于这一篇') + '</h3></div>'
      + '<div class="yuan">' + HM(b[3]) + '</div>'
      + '<div class="disclaim">' + HM('原文为公有领域古籍；解题与今译由本站自研，是义理疏通而非某一家注的照录。') + '</div>'
      + '</div>';
    return h;
  };
})();
