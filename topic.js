/* 〔主〕主题索引：三级话题树。
   一层 = 大话题（索引里只排这一层，按拼音首字母分桶）
   二层 = 话题下的一个面向
   三层 = 具体主题词（就是卦数据里原有的 tag，数据本身不改）
   为什么要三层：单个词（制度 / 刚强 / 协作）是「词」，看不出它属于哪件事；
   挂到话题下才有上下文。用户可以只展开到任意一层就停下。 */
const TOPICS = [
  { id: 'biange', name: '變革與更新', py: 'B', note: '改与不改、什么时候改', sub: [
    { name: '革故鼎新', py: 'G', tags: ['變革', '革命', '鼎新'] },
    { name: '動靜之機', py: 'D', tags: ['震動', '靜止', '非常'] }
  ]},
  { id: 'chukun', name: '處困之道', py: 'C', note: '卡住、受阻、进退两难时', sub: [
    { name: '險與阻', py: 'X', tags: ['險陷', '困境', '窮困', '阻塞'] },
    { name: '怎麼應', py: 'Y', tags: ['隱忍', '退避', '順應', '舒緩', '漂泊', '順入'] }
  ]},
  { id: 'xiuyang', name: '個人修養', py: 'G', note: '一个人怎么对待自己', sub: [
    { name: '立誠', py: 'L', tags: ['修身', '誠信', '節制'] },
    { name: '氣度', py: 'Q', tags: ['剛強', '文飾', '附麗'] }
  ]},
  { id: 'jintui', name: '進退取捨', py: 'J', note: '什么时候上、什么时候停', sub: [
    { name: '進取開創', py: 'J', tags: ['進取', '開創', '行動', '上升', '晉升'] },
    { name: '退守', py: 'T', tags: ['等待', '止步', '守成'] },
    { name: '分寸', py: 'F', tags: ['漸進', '小越'] }
  ]},
  { id: 'jueduan', name: '決斷與推行', py: 'J', note: '怎么判断、怎么落地', sub: [
    { name: '研判', py: 'Y', tags: ['決策', '決斷', '觀察'] },
    { name: '施行', py: 'S', tags: ['完成', '未成', '通達'] }
  ]},
  { id: 'lingdao', name: '領導與統御', py: 'L', note: '带人、聚人、用人', sub: [
    { name: '居上位', py: 'J', tags: ['領導'] },
    { name: '聚人', py: 'J', tags: ['聚合', '相遇'] }
  ]},
  { id: 'renji', name: '人際與協作', py: 'R', note: '跟人怎么处', sub: [
    { name: '相與', py: 'X', tags: ['人際', '協作', '感應', '和悅'] },
    { name: '離合', py: 'L', tags: ['衝突', '異中求同', '離散'] }
  ]},
  { id: 'shengshuai', name: '盛衰與時運', py: 'S', note: '起落、聚散、长久与风险', sub: [
    { name: '盛', py: 'F', tags: ['豐盛', '盛大'] },
    { name: '衰與復', py: 'S', tags: ['衰敗', '復興'] },
    { name: '聚與散', py: 'J', tags: ['積蓄', '增益', '減損'] },
    { name: '恆與危', py: 'H', tags: ['持久', '風險'] }
  ]},
  { id: 'zhidu', name: '制度與秩序', py: 'Z', note: '规矩怎么立、乱了怎么收', sub: [
    { name: '法度', py: 'F', tags: ['制度', '治理'] },
    { name: '整飭', py: 'Z', tags: ['失序', '整頓'] }
  ]},
  { id: 'jiaohua', name: '教化與齊家', py: 'J', note: '教人、育人、安家', sub: [
    { name: '啟蒙', py: 'Q', tags: ['教育', '養正'] },
    { name: '家與民', py: 'J', tags: ['齊家', '養民'] }
  ]}
];

/* 三层词的拼音首字母，只用于同层内排序 */
const PY_LEAF = {
  '變革': 'B', '革命': 'G', '鼎新': 'D', '震動': 'Z', '靜止': 'J', '非常': 'F',
  '險陷': 'X', '困境': 'K', '窮困': 'Q', '阻塞': 'Z',
  '隱忍': 'Y', '退避': 'T', '順應': 'S', '舒緩': 'S', '漂泊': 'P', '順入': 'S',
  '修身': 'X', '誠信': 'C', '節制': 'J', '剛強': 'G', '文飾': 'W', '附麗': 'F',
  '進取': 'J', '開創': 'K', '行動': 'X', '上升': 'S', '晉升': 'J',
  '等待': 'D', '止步': 'Z', '守成': 'S', '漸進': 'J', '小越': 'X',
  '決策': 'J', '決斷': 'J', '觀察': 'G', '完成': 'W', '未成': 'W', '通達': 'T',
  '領導': 'L', '聚合': 'J', '相遇': 'X',
  '人際': 'R', '協作': 'X', '感應': 'G', '和悅': 'H',
  '衝突': 'C', '異中求同': 'Y', '離散': 'L',
  '豐盛': 'F', '盛大': 'S', '衰敗': 'S', '復興': 'F',
  '積蓄': 'J', '增益': 'Z', '減損': 'J', '持久': 'C', '風險': 'F',
  '制度': 'Z', '治理': 'Z', '失序': 'S', '整頓': 'Z',
  '教育': 'J', '養正': 'Y', '齊家': 'Q', '養民': 'Y'
};

function guasOfTag(tag) {
  if (typeof G === 'undefined') return [];
  return G.filter(function (g) { return g.tags && g.tags.indexOf(tag) >= 0; });
}

/* 一个词属于哪个话题：返回 {l1, l2}（找不到返回 null，不该发生） */
function topicPath(tag) {
  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i];
    for (let j = 0; j < t.sub.length; j++) {
      if (t.sub[j].tags.indexOf(tag) >= 0) return { l1: t, l2: t.sub[j] };
    }
  }
  return null;
}

/* 悬停卦卡上的词时给出所属话题，让「蹦词」也有上下文 */
function topicTitle(tag) {
  const p = topicPath(tag);
  return p ? (p.l1.name + ' › ' + p.l2.name) : '';
}

function topicCount(t) {
  const set = {};
  t.sub.forEach(function (s) {
    s.tags.forEach(function (tag) {
      guasOfTag(tag).forEach(function (g) { set[g.n] = 1; });
    });
  });
  return Object.keys(set).length;
}

function topicHTML() {
  const openMap = (typeof topicOpenMap === 'object' && topicOpenMap) ? topicOpenMap : {};
  const buckets = {};
  TOPICS.forEach(function (t) { (buckets[t.py] = buckets[t.py] || []).push(t); });
  const letters = Object.keys(buckets).sort();

  let h = '<div class="topicsec">';
  /* 索引条：只排一级话题的首字母 */
  h += '<div class="topicidx">';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (L) {
    const has = !!buckets[L];
    h += '<span class="tpi' + (has ? '' : ' off') + '"'
      + (has ? ' data-py="' + L + '" title="' + HM('展开这一字母下的话题') + '"' : '') + '>' + L + '</span>';
  });
  h += '</div>';
  h += '<div class="topictip">' + HM('索引只列大话题，按拼音首字母排。点到哪一层就停在哪一层，不必全展开。') + '</div>';

  letters.forEach(function (L) {
    h += '<div class="tpgrp" data-py="' + L + '"><div class="tpplet">' + L + '</div>';
    buckets[L].forEach(function (t) {
      h += '<details class="tpcard" data-topic="' + t.id + '"' + (openMap[t.id] ? ' open' : '') + '><summary>'
        + '<b>' + HJ(t.name) + '</b><span class="tpcnt">' + topicCount(t) + ' ' + HM('卦') + '</span>'
        + '<span class="tpnote">' + HM(t.note || '') + '</span></summary>';
      h += '<div class="tpbody">';
      t.sub.forEach(function (s, si) {
        const id2 = t.id + '-' + si;
        h += '<details class="tpsub" data-topic="' + id2 + '"' + (openMap[id2] ? ' open' : '') + '><summary>'
          + '<b>' + HJ(s.name) + '</b><span class="tpcnt">' + s.tags.length + ' ' + HM('詞') + '</span></summary>';
        h += '<div class="tpbody">';
        s.tags.slice().sort(function (a, b) {
          return (PY_LEAF[a] || 'Z') < (PY_LEAF[b] || 'Z') ? -1 : 1;
        }).forEach(function (tag) {
          const list = guasOfTag(tag);
          const id3 = id2 + '-' + tag;
          h += '<details class="tpleaf" data-topic="' + id3 + '"' + (openMap[id3] ? ' open' : '') + '><summary>'
            + '<span class="tplname">' + HJ(tag) + '</span>'
            + '<span class="tpcnt">' + list.length + '</span></summary>';
          h += '<div class="tpbody tpguas">';
          h += list.map(function (g) {
            return '<span class="chip' + (typeof cur === 'number' && g.n === cur ? ' on' : '')
              + '" data-n="' + g.n + '">' + HJ(g.name) + '</span>';
          }).join('');
          h += '</div></details>';
        });
        h += '</div></details>';
      });
      h += '</div></details>';
    });
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* 展开状态持久化：切卦、切视图、刷新都保持（与处境栏同一套做法） */
function topicSetOpen(id, v) {
  if (typeof topicOpenMap !== 'object' || !topicOpenMap) topicOpenMap = {};
  topicOpenMap[id] = !!v;
  try { localStorage.setItem('zy.topicopen', JSON.stringify(topicOpenMap)); } catch (e) {}
}

function bindTopic(el) {
  el.querySelectorAll('.tpi[data-py]').forEach(function (b) {
    b.onclick = function () {
      const grp = el.querySelector('.tpgrp[data-py="' + b.dataset.py + '"]');
      if (!grp) return;
      grp.querySelectorAll('details.tpcard').forEach(function (d) {
        d.open = true; topicSetOpen(d.dataset.topic, true);
      });
      if (grp.scrollIntoView) grp.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  });
  /* 点具体某一卦：跳卦会重绘侧栏，这里先把从三层到一层的整条链都记成「展开」。
     不能只靠 ontoggle —— details 的 toggle 事件是异步排队的，连续操作时来不及写入。 */
  el.querySelectorAll('.tpguas .chip[data-n]').forEach(function (c) {
    c.onclick = function () {
      let d = c.closest('details');
      while (d) {
        if (d.dataset && d.dataset.topic) topicSetOpen(d.dataset.topic, true);
        d = d.parentElement ? d.parentElement.closest('details') : null;
      }
      cur = +c.dataset.n;
      if (typeof resetMv === 'function') resetMv();
      renderAll();
    };
  });
  el.querySelectorAll('details[data-topic]').forEach(function (d) {
    d.ontoggle = function () { topicSetOpen(d.dataset.topic, !!d.open); };
  });
}

if (typeof module !== 'undefined' && module.exports) module.exports = { TOPICS: TOPICS, PY_LEAF: PY_LEAF, topicPath: topicPath };
