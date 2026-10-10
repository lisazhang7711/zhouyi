/* 象數體例層
 * 取材：《說卦傳》（八卦卦德、取象）、漢易爻位通例（當位·得中·應·承乘據）、
 *       《周易正義·序卦》孔穎達「二二相耦，非覆即變」。
 * 不涉：卦氣、爻辰、納甲（屬術數一系，須配曆法干支，與本站定位不合）。
 * 本文件內容為公有領域古籍通例的自撰整理，非某一家原注的照錄。
 */

/* 八卦體例：卦德 / 自然 / 人倫 / 身 / 物 / 方位 / 五行
 * 卦德與取象出《說卦傳》；方位用後天八卦（說卦「帝出乎震」章）。 */
const XS8 = {
  '乾': { de:'健', nat:'天', ren:'父', body:'首', ani:'馬', dir:'西北', wx:'金',
          yin:'乾，健也；乾為天；乾為馬；乾為首；乾，天也，故稱乎父' },
  '坤': { de:'順', nat:'地', ren:'母', body:'腹', ani:'牛', dir:'西南', wx:'土',
          yin:'坤，順也；坤為地；坤為牛；坤為腹；坤，地也，故稱乎母' },
  '震': { de:'動', nat:'雷', ren:'長男', body:'足', ani:'龍', dir:'東', wx:'木',
          yin:'震，動也；震為雷；震為龍；震為足；震一索而得男，故謂之長男' },
  '巽': { de:'入', nat:'風（木）', ren:'長女', body:'股', ani:'雞', dir:'東南', wx:'木',
          yin:'巽，入也；巽為木、為風；巽為雞；巽為股；巽一索而得女，故謂之長女' },
  '坎': { de:'陷', nat:'水', ren:'中男', body:'耳', ani:'豕', dir:'北', wx:'水',
          yin:'坎，陷也；坎為水；坎為豕；坎為耳；坎再索而得男，故謂之中男' },
  '離': { de:'麗', nat:'火（日）', ren:'中女', body:'目', ani:'雉', dir:'南', wx:'火',
          yin:'離，麗也；離為火、為日；離為雉；離為目；離再索而得女，故謂之中女' },
  '艮': { de:'止', nat:'山', ren:'少男', body:'手', ani:'狗', dir:'東北', wx:'土',
          yin:'艮，止也；艮為山；艮為狗；艮為手；艮三索而得男，故謂之少男' },
  '兌': { de:'說（悅）', nat:'澤', ren:'少女', body:'口', ani:'羊', dir:'西', wx:'金',
          yin:'兌，說也；兌為澤；兌為羊；兌為口；兌三索而得女，故謂之少女' }
};

/* 爻位名（由下而上）與該位的通例 */
const XW_NAME = ['初', '二', '三', '四', '五', '上'];

/* 六爻體例：算當位 / 得中 / 應 / 承乘據
 * lines 為六位串，索引 0 = 初爻。 */
function xsYao(lines){
  const L = lines.split('');
  const pairOf = [3, 4, 5, 0, 1, 2];            /* 初↔四 二↔五 三↔上 */
  return L.map(function(c, i){
    const yang = c === '1';
    /* 爻名通例：初、上兩位先言位（初九、上六），中四爻先言剛柔（九二、六三） */
    const nm = (i === 0 || i === 5)
      ? XW_NAME[i] + (yang ? '九' : '六')
      : (yang ? '九' : '六') + XW_NAME[i];
    /* 當位：陽居奇位（初三五），陰居偶位（二四上） */
    const dang = (yang === (i % 2 === 0));
    /* 得中：二為下卦之中，五為上卦之中 */
    const zhong = (i === 1 || i === 4);
    /* 應：初四、二五、三上，陰陽相異則有應 */
    const j = pairOf[i], yj = L[j] === '1';
    const ying = yang !== yj;
    /* 承乘據：與上下鄰爻的剛柔關係 */
    let dn = '—', up = '—';
    if (i > 0) {
      const b = L[i - 1] === '1';
      if (!yang && b)  dn = '柔乘剛（乘剛，於例不順）';
      else if (yang && !b) dn = '剛據柔（陽據陰）';
      else dn = (yang ? '與下爻同為剛' : '與下爻同為柔');
    }
    if (i < 5) {
      const a = L[i + 1] === '1';
      if (!yang && a)  up = '柔承剛（以陰承陽，於例為順）';
      else if (yang && !a) up = '剛為柔所乘';
      else up = (yang ? '與上爻同為剛' : '與上爻同為柔');
    }
    return { i:i, name:nm, yang:yang, dang:dang, zhong:zhong,
             pair:XW_NAME[j] + (yj ? '九' : '六'), ying:ying, dn:dn, up:up };
  });
}

/* 卦序對偶：《周易》六十四卦二二相耦，非覆即變（孔穎達《周易正義》） */
function xsPair(n){
  const m = (n % 2 === 1) ? n + 1 : n - 1;      /* 1↔2 3↔4 … 63↔64 */
  if (m < 1 || m > 64) return null;
  const a = linesOf(gua(n)), b = linesOf(gua(m));
  const fu = b === a.split('').reverse().join('');
  const bian = b === a.split('').map(function(c){ return c === '1' ? '0' : '1'; }).join('');
  return { m:m, name:gua(m).name, rel: fu ? '覆' : (bian ? '變' : '—') };
}

/* 四種卦爻體例的釋名：正名 / 俗稱 / 規則 / 出處 */
const XS_TILI = [
  { k:'chg',  nm:'卦變', alias:'變卦、之卦',
    rule:'動爻陰陽互變，一卦由此入彼卦。無動爻則仍在本卦。',
    src:'爻辭「某之某」之例；《左傳》《國語》占例多稱「遇某之某」；漢易荀爽、虞翻有系統的卦變說。' },
  { k:'hu',   nm:'互體', alias:'互卦、中爻',
    rule:'二三四爻合成下互之卦，三四五爻合成上互之卦，兩者相重為互體。',
    src:'《左傳》莊公二十二年陳侯之筮，已有以互體說象之例；漢易京房、虞翻常用。' },
  { k:'cuo',  nm:'旁通', alias:'錯卦、對卦',
    rule:'六爻陰陽全面相反，兩卦彼此旁通。',
    src:'虞翻《周易注》「旁通」之例；後世又稱錯卦。' },
  { k:'zong', nm:'反對', alias:'綜卦、覆卦',
    rule:'卦畫整體上下顛倒而另成一卦。不能覆者則變，是為「非覆即變」。',
    src:'孔穎達《周易正義》論卦序「非覆即變」；來知德《周易集注》稱之為綜卦。' }
];
function xsTili(k){
  for (let i = 0; i < XS_TILI.length; i++) if (XS_TILI[i].k === k) return XS_TILI[i];
  return null;
}

/* 全卦象數概覽：剛柔、當位、得中、有應的計數 */
function xsSum(lines){
  const y = xsYao(lines);
  return {
    yang: y.filter(function(a){ return a.yang; }).length,
    yin : y.filter(function(a){ return !a.yang; }).length,
    dang: y.filter(function(a){ return a.dang; }).length,
    /* 應以組計：初四、二五、三上共三組，不按爻數重複計 */
    ying: (y[0].ying ? 1 : 0) + (y[1].ying ? 1 : 0) + (y[2].ying ? 1 : 0),
    zhong: y.filter(function(a){ return a.zhong; })
             .map(function(a){ return a.name + (a.dang ? '（得位）' : '（失位）'); }).join('、')
  };
}

/* ---------------- 句內〔象〕框的內容 ---------------- */

/* 卦辭：給全卦象數概覽 */
function xsSubCi(g){
  const lines = linesOf(g), s = xsSum(lines), p = xsPair(g.n);
  return { rows: [
    ['上下二體', '下' + g.down + '（' + XS8[g.down].de + '·' + XS8[g.down].nat + '）'
              + ' 上' + g.up + '（' + XS8[g.up].de + '·' + XS8[g.up].nat + '）'],
    ['剛柔', s.yang + ' 陽 ' + s.yin + ' 陰'],
    ['當位', s.dang + ' / 6 爻當位（陽居初三五、陰居二四上）'],
    ['有應', s.ying + ' / 3 組有應（初四、二五、三上，陰陽相異為有應）'],
    ['得中', s.zhong + '（二為下卦之中，五為上卦之中）'],
    ['卦序對偶', p ? '與第 ' + p.m + ' 卦 ' + p.name + ' 相' + p.rel + '（《周易》卦序二二相耦，非覆即變）' : '—']
  ] };
}

/* 大象傳：大象本即取上下二體之象而立辭 */
function xsSubXiang(g){
  const d = XS8[g.down], u = XS8[g.up];
  return { rows: [
    ['取象所自', '大象傳由上下二體之象立辭：內（下）' + g.down + '為' + d.nat + '，外（上）' + g.up + '為' + u.nat + '。'],
    ['下卦之德', g.down + '：' + d.de + '　象：' + d.nat + '　方位：' + d.dir + '　五行：' + d.wx],
    ['上卦之德', g.up + '：' + u.de + '　象：' + u.nat + '　方位：' + u.dir + '　五行：' + u.wx],
    ['說卦傳', d.yin + '；' + u.yin + '。']
  ] };
}

/* 爻辭：逐爻體例。i 為爻序（0–5）；i≥6 為用九 / 用六，不論爻位 */
function xsSubYao(g, i){
  const y = xsYao(linesOf(g));
  if (!y[i]) {
    return { rows: [
      ['爻位', '用九 / 用六是六爻皆變之辭，不在某一爻位上論，故不適用當位、得中、應、承乘諸例。'],
      ['所論', '論「變」本身：剛而能用柔，則剛不為害。']
    ] };
  }
  const a = y[i];
  return { rows: [
    ['爻名', a.name + '（' + XW_NAME[i] + '位，' + (a.yang ? '陽爻稱九' : '陰爻稱六') + '）'],
    ['當位', a.dang ? '當位（' + (a.yang ? '陽居陽位' : '陰居陰位') + '）'
                    : '失位（' + (a.yang ? '陽居陰位' : '陰居陽位') + '）'],
    ['得中', a.zhong ? '得中（' + (i === 1 ? '下卦之中' : '上卦之中') + '）' : '不在中位'],
    ['應', a.ying ? '與' + a.pair + '有應（陰陽相異）' : '與' + a.pair + '無應，謂之敵應（同為剛或同為柔）'],
    ['承乘（下）', a.dn],
    ['承乘（上）', a.up]
  ] };
}

/* 八卦體例總表 */
function xsTableHTML(){
  const order = ['乾', '坤', '震', '巽', '坎', '離', '艮', '兌'];
  let h = '<table class="xst"><tr><th>卦</th><th>德</th><th>自然</th><th>人倫</th>'
        + '<th>身</th><th>物</th><th>方位</th><th>五行</th></tr>';
  order.forEach(function(k){
    const x = XS8[k];
    h += '<tr><td>' + HJ(k) + '</td><td>' + HM(x.de) + '</td><td>' + HM(x.nat) + '</td>'
       + '<td>' + HM(x.ren) + '</td><td>' + HM(x.body) + '</td><td>' + HM(x.ani) + '</td>'
       + '<td>' + HM(x.dir) + '</td><td>' + HM(x.wx) + '</td></tr>';
  });
  return h + '</table>';
}
