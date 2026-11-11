/* 〔境〕处境检索：用现代人的大白话处境做入口，映射到卦与首读之爻。
   设计依据：摩尔《跨越鸿沟》——实用主义者不买「品类」，只买「解决我此刻问题的东西」。
   用户不会先想「我要读周易」，只会想「我现在卡住了」。入口必须从后者开始。 */
/* 处境条目已移入云端内容库（Supabase zy_content），登录后才拉取填入。
   本地留空数组只是占位，不含任何条目文本。 */
const SITUATIONS = [];

/* 依处境索引反查：给一个卦号，返回它出现在哪些处境里 */
function situOf(n) {
  const out = [];
  SITUATIONS.forEach(function (s) {
    s.gua.forEach(function (g) { if (g.n === n) out.push({ id: s.id, name: s.name, why: g.why, y: g.y }); });
  });
  return out;
}

/* 处境视图 HTML（供 renderSide 调用） */
function situHTML() {
  if (!SITUATIONS.length) {
    /* 未登录（或登录了但内容库没上传）时的样子：说清楚是什么，并给登录入口 */
    const authed = !!(window.ZYAuth && window.ZYAuth.session());
    return '<div class="situsec"><div class="situtip">'
      + HM('处境检索：先选你现在的处境，再看对应的卦。共 20 组处境，覆盖起步、等待、受阻、抉择等常见卡点。')
      + '<br><br><b>' + HM(authed ? '内容尚未载入，刷新一次试试。' : '登录后可查看全部处境与对应卦爻。')
      + '</b><br>'
      + (authed ? '' : '<button class="btn-sm" data-acct="1" style="margin-top:10px">' + HM('登录 / 注册') + '</button>')
      + '</div></div>';
  }
  let h = '<div class="situsec">';
  h += '<div class="situtip">' + HM('先选你现在的处境，再看对应的卦。不用先想「我要读哪一卦」。') + '</div>';
  const openMap = (typeof situOpenMap === 'object' && situOpenMap) ? situOpenMap : {};
  SITUATIONS.forEach(function (s) {
    h += '<details class="situcard" data-situ="' + s.id + '"' + (openMap[s.id] ? ' open' : '') + '><summary>';
    h += '<b>' + HM(s.name) + '</b><span class="situask">' + HM(s.ask) + '</span></summary>';
    h += '<div class="situbody">';
    s.gua.forEach(function (g) {
      const gu = gua(g.n);
      const cj = (typeof chujingOf === 'function') ? chujingOf(gu) : null;
      h += '<div class="siturow' + (typeof cur === 'number' && cur === g.n ? ' on' : '')
        + '" data-n="' + g.n + '" data-y="' + HJ(g.y) + '">';
      h += '<div class="situnm">' + HJ(gu.name) + '<span class="situy">' + HM('先读 ' + g.y) + '</span></div>';
      h += '<div class="situwhy">' + HM(g.why) + '</div>';
      const sitText = (cj && cj.sit && !/undefined|NaN|\[object Object\]/.test(String(cj.sit))) ? cj.sit : '此卦处境暂缺';
      if (cj) {
        h += '<div class="situcj"><span class="k">' + HM('处境') + '</span>' + HM(sitText) + '</div>';
        h += '<div class="situok"><span class="k ok">' + HM('宜') + '</span>' + HM(cj.ok || '审时度势') +
             '<span class="k no">' + HM('忌') + '</span>' + HM(cj.no || '轻举妄动') + '</div>';
      }
      h += '</div>';
    });
    h += '</div></details>';
  });
  h += '</div>';
  return h;
}
