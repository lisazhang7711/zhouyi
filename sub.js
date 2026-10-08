/* sub.js —— 句子级内嵌层
   〔解〕历代解说 / 〔用〕处境卡 / 〔資〕他书互见
   与 layer.js 的区别：layer.js 是卦级整块面板，本文件按「每一句」生成，
   内嵌在该句卡片里，各自成一个可折叠的框。
   依赖：han.js(HJ/HM) data.js(G/YAO/TRIGRAM/linesOf) layer.js(DE/XIANG8/ADVICE/HUJIAN) */

/* ---------- 爻位通例：这套规则来自《易传》的爻位说，不是推演编造 ---------- */
const YAOWEI = [
  { n:'初', w:'一卦之始，位在最下', sx:'势未成而用未显',
    yl:'养正蓄力，不宜急于自见', ok:'沉潜蓄势，把基本功做实', no:'锋芒早露，以浅薄求大用' },
  { n:'二', w:'下卦之中，阴位', sx:'居中得正，在下而能安',
    yl:'以中正自守，不越位而能成事', ok:'守中而行，以内修应外', no:'越分干上，舍中求奇' },
  { n:'三', w:'下卦之极，阳位', sx:'过中而危，进退两难',
    yl:'知其危而能戒，则虽危无咎', ok:'戒慎恐惧，退守自省', no:'刚躁冒进，在下而争上位' },
  { n:'四', w:'上卦之始，迫近五之尊位', sx:'近君之地，多惧',
    yl:'以柔承刚，处近尊之地而不逼上', ok:'谨顺承上，以功归上', no:'挟功自专，近尊而僭' },
  { n:'五', w:'上卦之中，尊位', sx:'居中履尊，得位得中',
    yl:'以中正居尊，行其所当行', ok:'行中道，任贤，以位行其志', no:'刚愎自用，以位骄人' },
  { n:'上', w:'一卦之终，位在极处', sx:'物极将反，其道已穷',
    yl:'知进知退，与时偕极而不与之偕亡', ok:'知止，退藏，让位于新生', no:'亢而不返，穷极不舍' }
];
/* 用九 / 用六：六爻皆变之辞，不适用爻位通例 */
const YONGJIU = {
  xs:'用九是六爻皆阳、皆可变之辞，不在某一爻位上论，而是论「变」本身。',
  yl:'群龙皆能自见其首，则无一首可居其上，故曰「无首」而吉。义理上读成：刚而能用柔，则刚不为害。',
  mo:'把它读成一条通则：最强的状态不是压过所有人，而是不设一个必须被服从的首。'
};

/* 卦辞常见术语的读法：用于给卦辞一句点题 */
const CI_TERM = [
  ['元亨', '「元亨」是「大通顺」：条件具备，通道已开。'],
  ['利貞', '「利貞」是「宜于守正」：通是通了，但通的方向要靠守正来维持。'],
  ['利涉大川', '「利涉大川」指可以承担大的跨越——不是说没有风险，而是说这个风险值得冒。'],
  ['勿用', '「勿用」不是「不可用」，是「此刻不宜施用」：时机未到，用了反伤其本。'],
  ['无咎', '「无咎」不是「吉」，是「不招致过失」——善补过而已，标准比吉低一档。'],
  ['悔亡', '「悔亡」是「原本有悔的事不再有悔」，前提是已经做了该做的调整。'],
  ['吝', '「吝」是走窄了：不是凶，但路越走越窄，若不改辙就会转成吝之甚。'],
  ['厲', '「厲」是危险，但不等于凶：知危而能戒，往往反得无咎。'],
  ['凶', '「凶」在此处是断辞，指此路不通，须另寻其道，不是宿命。'],
  ['吉', '「吉」在此处是断辞，指此路可通，前提是依卦义而行。']
];
function ciPoint(g){
  const s = g.ci || '';
  const hit = CI_TERM.filter(function(t){ return s.indexOf(t[0]) >= 0; });
  if (!hit.length) return HM('就卦辞本身读：') + HJ(g.ci) + HM('——先通其文，再以上下卦之德推其义。');
  return hit.slice(0, 3).map(function(t){ return t[1]; }).join('');
}

/* 大象传拆读：前半是卦象，后半（「以」字之后）是君子之行 */
function xiangSplit(g){
  const s = g.xiang || '';
  const i = s.indexOf('以');
  if (i < 0) return { xiang:s, act:'' };
  return { xiang:s.slice(0, i), act:s.slice(i + 1) };
}

/* ---------- 〔解〕句子级解说 ---------- */
/* kind: 'ci' | 'xiang' | 'yao' | 'chuan' */
function subJie(g, kind, i){
  if (kind === 'ci') {
    const L = lidaiOf(g);
    return { gen:L.gen, rows:[
      [HM('象数一路'), HM(L.xs)],
      [HM('义理一路'), HM(L.yl)],
      [HM('现代读法'), HM(L.mo)],
      [HM('就卦辞而读'), ciPoint(g)]
    ]};
  }
  if (kind === 'xiang') {
    const X = xiangSplit(g), L = lidaiOf(g);
    return { gen:true, rows:[
      [HM('象数一路'), HM('大象传的体例是「先取上下卦之象，再落到人事」：')
        + HJ(g.down) + HM('为') + HJ(XIANG8[g.down]) + HM('，')
        + HJ(g.up) + HM('为') + HJ(XIANG8[g.up]) + HM('，合而成「') + HJ(X.xiang) + HM('」。')],
      [HM('义理一路'), HM('「') + HJ(X.act || g.xiang) + HM('」是大象传给出的行动项。义理派认为：')
        + HM('读《易》的落点在「以」字之后——观象不是目的，取法才是目的。')],
      [HM('现代读法'), HM('把大象传读成一句行为准则：处') + HJ(g.name) + HM('之境者，宜')
        + HJ(X.act || g.xiang) + HM('。') + HM(L.mo)]
    ]};
  }
  if (kind === 'yao') {
    const y = (YAO[g.n] || [])[i];
    const lines = linesOf(g);
    if (i >= 6 || !lines[i]) {
      return { gen:true, rows:[
        [HM('象数一路'), HM(YONGJIU.xs)],
        [HM('义理一路'), HM(YONGJIU.yl)],
        [HM('现代读法'), HM(YONGJIU.mo)]
      ]};
    }
    const W = YAOWEI[i], wei = i + 1;
    const yang = lines[i] === '1';
    const dewei = (wei % 2 === 1) === yang;
    const zhong = (wei === 2 || wei === 5);
    const mate = i < 3 ? i + 3 : i - 3;
    const ying = lines[mate] !== undefined ? (lines[mate] !== lines[i]) : false;
    return { gen:true, rows:[
      [HM('象数一路'), HM('第') + wei + HM('爻，') + (yang ? HM('阳爻') : HM('阴爻'))
        + HM('居') + (wei % 2 === 1 ? HM('阳位') : HM('阴位')) + HM('，')
        + (dewei ? HM('得位') : HM('失位')) + '；'
        + (zhong ? HM('得中；') : HM('未得中；'))
        + HM('与第') + (mate + 1) + HM('爻') + (ying ? HM('相应') : HM('无应')) + '。'
        + HM('爻位通例：') + HM(W.w) + HM('，') + HM(W.sx) + '。'],
      [HM('义理一路'), HM(W.yl) + HM('这一爻的断辞是「') + HJ(y ? y.c : '') + HM('」，')
        + HM('义理派不问这句断辞准不准，而问：身处此位者，当如何自处。')],
      [HM('现代读法'), HM('把爻位读成阶段：') + HM(W.w) + HM('。') + HM('此时所宜在')
        + HM(W.ok) + HM('，所忌在') + HM(W.no) + '。']
    ]};
  }
  /* 十翼句 */
  const map = {
    xu: HM('序卦传按通行卦序说明「此卦因何而来」，把六十四卦串成一条因果链，属十翼之一。它给的是卦与卦之间的承接关系。'),
    za: HM('杂卦传打乱卦序，以对举方式点出卦义，往往一语中的。它与序卦传互补：一个讲次序，一个讲对照。'),
    wy: HM('文言传专为乾坤二卦而作，反复申说二卦之义，是现存最早的「专卦注解」，也是义理派的源头文本。')
  };
  const k = String(i || 'xu');
  const which = k.indexOf('wy') === 0 ? 'wy' : (k === 'za' ? 'za' : 'xu');
  return { gen:true, rows:[[HM('此段的性质'), map[which]]] };
}

/* ---------- 〔用〕句子级处境卡 ---------- */
function subYong(g, kind, i){
  if (kind === 'ci' || kind === 'xiang') {
    const C = chujingOf(g);
    return { gen:C.gen, rows:[
      [HM('处境'), HM(C.sit)],
      [HM('判断依据'), HM(C.judge)],
      [HM('可为'), HM(C.ok)],
      [HM('忌'), HM(C.no)]
    ]};
  }
  const lines = linesOf(g);
  if (i >= 6 || !lines[i]) {
    return { gen:true, rows:[
      [HM('处境'), HM('六爻皆可变之时，全局处在转折点上。')],
      [HM('判断依据'), HM(YONGJIU.xs)],
      [HM('可为'), HM('主动求变，且不把变化系于一人一身')],
      [HM('忌'), HM('以刚自恃，或把「变」当成放弃原则的借口')]
    ]};
  }
  const W = YAOWEI[i], wei = i + 1;
  const yang = lines[i] === '1';
  const dewei = (wei % 2 === 1) === yang;
  return { gen:true, rows:[
    [HM('处境'), HM('处在第') + wei + HM('爻的位置：') + HM(W.w) + '。' + HM(W.sx) + '。'],
    [HM('判断依据'), HM('此爻') + (yang ? HM('阳') : HM('阴')) + '，'
      + (dewei ? HM('得位') : HM('失位'))
      + ((wei === 2 || wei === 5) ? HM('且得中') : HM('未得中'))
      + HM('。爻位的通例是「其刚柔与其位相称则安，不相称则须以德补之」。')],
    [HM('可为'), HM(W.ok)],
    [HM('忌'), HM(W.no)]
  ]};
}

/* ---------- 〔資〕句子级他书互见 ---------- */
/* yao=true 时只列通论条目，避免六爻重复刷同一批引文 */
function subZi(g, yao){
  const all = HUJIAN.filter(function(x){ return x.gua.length === 0 || x.gua.indexOf(g.n) >= 0; });
  return yao ? all.filter(function(x){ return x.gua.length === 0; }) : all;
}
