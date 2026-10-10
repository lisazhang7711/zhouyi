/* qa.js —— 右侧小助手的问答引擎
   默认离线：全部回答由本站数据当场算出，不联网、不编造。
   若用户在小助手设置里填了兼容 OpenAI 格式的接口，则改走远程模型。 */

/* 预设问题：第一次打开时给的几个入口 */
const QA_PRESET = [
  '乾卦讲什么',
  '潜龙勿用是什么意思',
  '身处困境该看哪一卦',
  '元亨利贞怎么读',
  '第29卦是什么',
  '这个阅读器怎么用'
];

/* ---------------- 工具 ---------------- */
function qaFindGua(q){
  let m = q.match(/第?\s*([0-9１-９一二三四五六七八九十]{1,3})\s*卦/);
  if (m) {
    let s = m[1], n = 0;
    if (/[0-9]/.test(s)) n = parseInt(s, 10);
    else {
      const CN = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
      if (s.length === 1) n = CN[s] || 0;
      else if (s[0] === '十') n = 10 + (CN[s[1]] || 0);
      else if (s[1] === '十') n = (CN[s[0]] || 0) * 10;
    }
    if (n >= 1 && n <= 64) return gua(n);
  }
  for (let i = 0; i < G.length; i++) {
    const nm = SCRIPT === 'trad' ? s2tm(G[i].name) : t2s(G[i].name);
    if (q.indexOf(nm) >= 0) return G[i];
  }
  return null;
}
function qaSearch(q, limit){
  const key = q.replace(/[？?。，、\s]/g, '');
  if (!key) return [];
  const out = [];
  G.forEach(function(g){
    (YAO[g.n] || []).forEach(function(y, i){
      const hay = HJ(y.t + y.c + (y.x||'')) + HM(y.m);
      if (hay.indexOf(key) >= 0) out.push({ n:g.n, k:g.n + ':y' + i, t:HJ(y.t), y:HJ(y.c), m:HM(y.m) });
    });
    if ((HJ(g.ci) + HM(g.ciM)).indexOf(key) >= 0)
      out.push({ n:g.n, k:g.n + ':ci', t:HM('卦辞'), y:HJ(g.ci), m:HM(g.ciM) });
    if ((HJ(g.xiang) + HM(g.xiangM)).indexOf(key) >= 0)
      out.push({ n:g.n, k:g.n + ':xiang', t:HM('大象传'), y:HJ(g.xiang), m:HM(g.xiangM) });
  });
  return out.slice(0, limit || 6);
}

/* ---------------- 离线回答 ---------------- */
/* 返回 {title, blocks:[{k:'p'|'kv'|'q'|'list', v}], go:[卦号]} */
function askLocal(q){
  const s = String(q || '').trim();
  if (!s) return null;

  /* ① 用法 / 帮助 */
  if (/怎么用|如何使用|怎样用|怎么用这个|帮助|help|功能|怎么收藏|怎么用这个站/i.test(s)) {
    return { title: HM('这个阅读器怎么用'), go: [], blocks:[
      {k:'p', v: HM('一句话：左边选卦，右边读句子，每句下面有三个可展开的框。')},
      {k:'list', v:[
        HM('⧉ 原文 / 今译 / 引用 —— 点一下即复制，「引用」自带出处与署名，可直接粘进文章。'),
        HM('☆ —— 收藏这一句。收过的句子从左侧「★」页取回。'),
        HM('第 1/9 徽标 —— 本卦第几句 / 共几句，点一下标为已读。'),
        HM('〔解〕〔用〕〔資〕 —— 每句下面的三个折叠框：历代解说 / 处境卡 / 他书互见。'),
        HM('点卦名下的主题标签 —— 进入该主题的连续阅读流，显示「第 i / 共 N 句」。'),
        HM('点爻线 —— 设为动爻，下方实时算出变卦、互卦、错卦、综卦。')
      ]},
      {k:'p', v: HM('顶栏可切简体 / 繁体、日间 / 夜间、文白对照 / 仅原文 / 仅今译。')}
    ]};
  }

  /* ② 卦象推演 */
  if (/錯卦|错卦|綜卦|综卦|互卦|變卦|变卦/.test(s)) {
    const g = qaFindGua(s);
    if (g) {
      const lines = linesOf(g), mv = [false,false,false,false,false,false];
      const d = derive(lines, mv);
      const nm = function(l){ const x = guaByLines(l); return x ? HJ(x.name) + '（' + l + '）' : l; };
      return { title: HJ(g.name) + HM('卦的四张推演'), go:[g.n], blocks:[{k:'kv', v:[
        [HM('错卦'), HM('六爻阴阳全反 → ') + nm(d.cuo)],
        [HM('综卦'), HM('卦象上下颠倒 → ') + nm(d.zong)],
        [HM('互卦'), HM('二三四爻为下卦、三四五爻为上卦 → ') + nm(d.hu)],
        [HM('变卦'), HM('未设动爻时与本卦同；点爻线设动爻后实时变化')]
      ]}]};
    }
  }

  /* ③ 处境卡 / 怎么用 / 怎么办 */
  if (/处境|怎么办|如何做|怎麼辦|该怎么做|怎么用|如何用/.test(s)) {
    const g = qaFindGua(s);
    if (g) {
      const C = chujingOf(g);
      return { title: HJ(g.name) + HM('卦 · 处境卡'), go:[g.n], blocks:[
        {k:'kv', v:[[HM('处境'), HM(C.sit)], [HM('判断依据'), HM(C.judge)],
                    [HM('可为'), HM(C.ok)], [HM('忌'), HM(C.no)]]},
        {k:'p', v: HM('处境卡是把卦象读成一种处境模型，属义理引申，既非经文原意，也不用于预测。')}
      ]};
    }
  }

  /* ④ 字词 / 术语解释 */
  if (/什么意思|什麼意思|是什么意思|什么意思|什么叫|什麼叫|何谓|解释|释义|怎么读|怎麼讀/.test(s)) {
    const cleaned = s.replace(/什么意思|什麼意思|是什么意思|什么意思|什么叫|什麼叫|何谓|解释|释义|怎么读|怎麼讀|的|了|是|？|\?|\s/g, '');
    const term = HJ(cleaned);
    if (term && GLOSS_MAP && GLOSS_MAP[term]) {
      return { title: HM('字词 · ') + HJ(term), go:[], blocks:[
        {k:'q', v: HJ(term) + '　' + HM(GLOSS_MAP[term])}
      ]};
    }
    const g = qaFindGua(s);
    if (g && /卦$/.test(s.replace(/什么意思|什麼意思|是什么意思|什么叫|什麼叫/g, ''))) { /* 落到 ⑤ */ }
    else if (term) {
      const hit = qaSearch(term, 4);
      if (hit.length) {
        return { title: HM('含「') + HJ(term) + HM('」的句子'), go:[], blocks:
          hit.map(function(x){ return {k:'q', v: HJ(gua(x.n).name) + ' · ' + x.t + '\n' + x.y + '\n' + x.m}; }) };
      }
      return { title: HM('词典里暂时没有这一条'), go:[], blocks:[
        {k:'p', v: HM('本站字词典收录的是读《周易》常用的字与术语。你可以换个说法，或直接问某一卦，例如「坎卦讲什么」。')}
      ]};
    }
  }

  /* ⑤ 某一卦 */
  const g = qaFindGua(s);
  if (g) {
    const L = lidaiOf(g), C = chujingOf(g);
    return { title: HM('第') + g.n + HM('卦 ') + HJ(g.name) + '（' + HJ(g.full) + '）', go:[g.n], blocks:[
      {k:'kv', v:[
        [HM('卦体'), HM('下') + HJ(g.down) + '（' + HJ(XIANG8[g.down]) + '）'
                 + HM('，上') + HJ(g.up) + '（' + HJ(XIANG8[g.up]) + '）'],
        [HM('卦德'), HM('内') + HM(DE[g.down]) + HM('而外') + HM(DE[g.up])],
        [HM('主题'), g.tags.map(function(t){ return HJ(t); }).join('、')]
      ]},
      {k:'q', v: HM('卦辞') + '\n' + HJ(g.ci) + '\n' + HM(g.ciM)},
      {k:'q', v: HM('大象传') + '\n' + HJ(g.xiang) + '\n' + HM(g.xiangM)},
      {k:'p', v: HM('处境：') + HM(C.sit) + HM('　宜：') + HM(C.ok) + HM('　忌：') + HM(C.no)}
    ]};
  }

  /* ⑥ 主题 */
  const tag = TAGS.filter(function(t){
    return s.indexOf(SCRIPT === 'trad' ? s2tm(t) : t2s(t)) >= 0;
  })[0] || (s.length <= 4 ? TAGS.filter(function(t){
    return (SCRIPT === 'trad' ? s2tm(t) : t2s(t)).indexOf(s) >= 0; })[0] : null);
  if (tag) {
    const list = G.filter(function(x){ return x.tags.indexOf(tag) >= 0; });
    return { title: HM('主题 · ') + HJ(tag), go: list.slice(0, 6).map(function(x){ return x.n; }), blocks:[
      {k:'p', v: HM('这个主题下共 ') + list.length + HM(' 卦：')},
      {k:'list', v: list.map(function(x){ return HM('第') + x.n + HM('卦 ') + HJ(x.name) + '（' + HJ(x.full) + '）'; })}
    ]};
  }

  /* ⑦ 全文搜句子 */
  const hit = qaSearch(s, 6);
  if (hit.length) {
    return { title: HM('找到 ') + hit.length + HM(' 条相关句子'),
      go: hit.map(function(x){ return x.n; }),
      blocks: hit.map(function(x){
        return {k:'q', v: HM('第') + x.n + HM('卦 ') + HJ(gua(x.n).name) + ' · ' + x.t
                     + '\n' + x.y + '\n' + x.m};
      }) };
  }

  /* ⑧ 兜底 */
  return { title: HM('我还没学会这个问法'), go:[], blocks:[
    {k:'p', v: HM('目前我能确定回答这几类：某一卦讲了什么、某个字词什么意思、某主题有哪些卦、某卦的处境与用法、含某词的句子。')},
    {k:'list', v: QA_PRESET.map(function(x){ return HM(x); })}
  ]};
}

/* ================= 功能性 bug 反馈 =================
   场景：用户描述的「本该能用、却没实现」的功能点。
   识别到就：① 记入本地后台（可配置上报地址自动 POST）
            ② 固定回复「您提到的问题后台正在修理bug中。」，不走问答引擎。 */

/* 故障词：明确表达「没实现 / 失效 / 报错」 */
const BUG_WORDS = [
  'bug', 'BUG', '报错', '出错', '错误', '失效', '失灵', '无效', '不生效', '没生效',
  '没反应', '点了没', '点不了', '点不动', '点不开', '打不开', '用不了', '不能用', '不可用',
  '无法', '不能', '实现不了', '做不到', '加载不出', '显示不出', '刷不出', '卡住', '卡死',
  '崩溃', '闪退', '白屏', '空白', '乱码', '错位', '重叠', '坏了', '跳不过去', '跳不了',
  '搜不到', '搜索不到', '复制不了', '复制不出', '粘不了', '保存不了', '没保存', '没跳转', '跳错'
];
/* 本站功能点：命中才认定为「功能性 bug」，避免把内容提问误判成故障 */
const BUG_FEATS = [
  ['复制',   ['复制', '拷贝', '⧉', '原文按钮', '引用按钮']],
  ['引用',   ['引用', '出处', '署名']],
  ['收藏',   ['收藏', '星标', '☆', '★']],
  ['目录',   ['目录', '侧栏', '侧边', '卦序', '卦阵', '窄轨', '收缩', '收起', '展开目录']],
  ['小助手', ['助手', '问答', '提问', '对话框', '聊天']],
  ['推演',   ['推演', '变卦', '互卦', '错卦', '综卦', '动爻', '爻线']],
  ['折叠框', ['解〕', '用〕', '資〕', '资〕', '折叠', '展开', '内嵌框']],
  ['字注',   ['字注', '注释', '释义', '虚线下划', '词条']],
  ['搜索',   ['搜索', '检索', '查找框']],
  ['主题',   ['主题', '标签', '主题流', '阅读流']],
  ['简繁',   ['简体', '繁体', '简繁', '字形']],
  ['主题模式', ['夜间', '日间', '深色', '暗色', '白天']],
  ['已读',   ['已读', '进度', '徽标', '标记']],
  ['跳转',   ['跳转', '跳到', '滚动', '定位']],
  ['页面',   ['页面', '刷新', '加载', '显示', '排版', '布局']],
  ['设置',   ['设置', '模型设置', '接口', '保存']]
];
/* 兜底故障句式：动词 + 不了/不动/不开/不出/不到 等 */
const BUG_RE = /(不了|不动|不开|不出|不到|不灵|不行|不起来|没出来|没动静|没效果|无反应|没能|未生效)/;
/* 兜底指代词：没点名功能，但故障表述很强时也算 */
const BUG_DEICTIC = ['按钮', '功能', '这个', '这里', '点了', '它', '网页', '网站', '站',
                     '按鈕', '功能', '這個', '這裡', '點了', '網頁', '網站'];

function bugMatchFeats(q){
  const out = [];
  BUG_FEATS.forEach(function(p){
    if (p[1].some(function(w){ return q.indexOf(w) >= 0; })) out.push(p[0]);
  });
  return out;
}
/* 返回 null 或 {feats:[...]}。输入同时按原字形与简体归一化匹配，简繁都能命中 */
function bugDetect(q){
  const raw = String(q || '');
  if (raw.length > 200) return null;
  const s = raw + ' ' + t2s(raw);
  const hasBug = BUG_WORDS.some(function(w){ return s.indexOf(w) >= 0; }) || BUG_RE.test(s);
  if (!hasBug) return null;
  /* 排除明显的内容型提问：「为什么…不能…」是在问义理，不是报故障 */
  if (/为什么|為什麼|为何|為何|什么意思|什麼意思|怎么讲|怎麼講|出处|出自/.test(s)
      && !bugMatchFeats(s).length) return null;
  const feats = bugMatchFeats(s);
  const deictic = BUG_DEICTIC.some(function(w){ return s.indexOf(w) >= 0; });
  if (!feats.length && !deictic) return null;
  return { feats: feats };
}

/* ---- 后台：本地记录 + 可选上报 ---- */
function bugCfg(){
  try { return JSON.parse(localStorage.getItem('zy.bugep') || 'null'); } catch(e){ return null; }
}
function bugLogs(){
  try { const a = JSON.parse(localStorage.getItem('zy.buglog') || '[]'); return Array.isArray(a) ? a : []; }
  catch(e){ return []; }
}
function bugPost(rec){
  const c = bugCfg();
  if (!c || !c.ep) return;
  try {
    fetch(c.ep, { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(rec) });
  } catch(e){}
}
function logBug(q, feats){
  const arr = bugLogs();
  const rec = {
    id: arr.length + 1,
    t: new Date().toISOString(),
    q: q,
    feats: feats || [],
    gua: (typeof cur === 'number' ? cur : 0),
    mode: (typeof SCRIPT === 'string' ? SCRIPT : ''),
    ua: (typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : '').slice(0, 160)
  };
  arr.push(rec);
  try { localStorage.setItem('zy.buglog', JSON.stringify(arr)); } catch(e){}
  bugPost(rec);
  if (typeof renderBugUI === 'function') { try { renderBugUI(); } catch(e){} }
  return rec.id;
}
/* 固定话术：首句必须原样出现 */
function bugReply(feats, no){
  const b = [
    {k:'p', v: HM('您提到的问题后台正在修理bug中。')},
    {k:'p', v: HM('已记为 #') + no + (feats && feats.length
        ? HM('，涉及功能：') + feats.map(function(x){ return HJ(x); }).join('、') : '') + HM('。')}
  ];
  b.push({k:'p', v: HM('再补一句「在第几卦、点了哪个按钮」，定位会快很多。')});
  b.push({k:'p', v: HM('也可以先刷新页面，或切一下日间 / 夜间，有时只是渲染没跟上。')});
  return { title: HM('问题已记录'), go: [], blocks: b };
}

/* ---------------- 可选：接远程模型 ---------------- */
function aiCfg(){
  try { return JSON.parse(localStorage.getItem('zy.ai') || 'null'); } catch(e){ return null; }
}
function askRemote(q, done){
  const c = aiCfg();
  if (!c || !c.endpoint || !c.key) { done(null); return; }
  const body = {
    model: c.model || 'gpt-4o-mini',
    messages: [
      { role:'system', content:'你是《周易》精读阅读器里的助手。只回答与《周易》及本站用法有关的问题，'
        + '不提供占卜、算命、预测。回答用简体中文，控制在 200 字以内，先给结论再给依据。' },
      { role:'user', content:q }
    ]
  };
  try {
    fetch(c.endpoint, { method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + c.key },
      body: JSON.stringify(body) })
      .then(function(r){ return r.json(); })
      .then(function(j){
        const t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        done(t || null);
      })
      .catch(function(){ done(null); });
  } catch(e){ done(null); }
}

/* 统一入口：cb(answer) */
function ask(q, cb){
  const c = aiCfg();
  if (c && c.endpoint && c.key) {
    askRemote(q, function(t){
      cb(t ? { title: HM('（联网）'), go:[], blocks:[{k:'p', v:t}] } : askLocal(q));
    });
  } else {
    cb(askLocal(q));
  }
}
