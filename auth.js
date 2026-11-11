/* 读易 · 账号与跨设备同步
   直接用 fetch 调 Supabase 的 GoTrue(Auth) 与 PostgREST，
   不引 supabase-js CDN：一个外部脚本 404 就会让整站登录失效，
   和 MAT1001 那个 KaTeX 是同一类风险。 */
(function () {
  'use strict';

  var BASE = 'https://itkjrodrzenefmxsyrnx.supabase.co';
  var KEY = 'sb_publishable_Tfq41bRCMvAVZYgYuEJe9g_RkrFKQZB';
  var TABLE = 'zy_state';
  var SK = 'zy.auth';

  var sess = readSess();
  var listeners = [];
  var refreshing = null;

  /* ---------------- 基础 ---------------- */
  function readSess() {
    try { return JSON.parse(localStorage.getItem(SK) || 'null'); } catch (e) { return null; }
  }
  function writeSess(s) {
    sess = s;
    try {
      if (s) localStorage.setItem(SK, JSON.stringify(s));
      else localStorage.removeItem(SK);
    } catch (e) {}
    emit();
  }
  function emit() {
    listeners.forEach(function (fn) { try { fn(sess); } catch (e) {} });
  }
  function sec() { return Math.floor(Date.now() / 1000); }

  function req(path, opt) {
    opt = opt || {};
    var h = { 'apikey': KEY, 'Content-Type': 'application/json' };
    h['Authorization'] = 'Bearer ' + (opt.token || KEY);
    if (opt.headers) for (var k in opt.headers) h[k] = opt.headers[k];
    return fetch(BASE + path, {
      method: opt.method || 'GET',
      headers: h,
      body: opt.body == null ? undefined : JSON.stringify(opt.body)
    }).then(function (r) {
      return r.text().then(function (t) {
        var d = null;
        try { d = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) {
          var msg = (d && (d.error_description || d.msg || d.message || d.error || d.hint)) || ('HTTP ' + r.status);
          var err = new Error(msg);
          err.status = r.status;
          err.data = d;
          throw err;
        }
        return d;
      });
    });
  }

  function adopt(d) {
    if (!d || !d.access_token) return null;
    var s = {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: d.expires_at || (sec() + (d.expires_in || 3600)),
      user: d.user || (sess && sess.user) || null
    };
    writeSess(s);
    return s;
  }

  /* access_token 只在 1 小时有效，过期就用 refresh_token 换；
     并发调用共用同一个请求，避免同时刷新导致后一个把前一个作废。 */
  function token() {
    if (!sess || !sess.refresh_token) return Promise.reject(new Error('未登录'));
    if (sess.expires_at - 60 > sec() && sess.access_token) return Promise.resolve(sess.access_token);
    if (!refreshing) {
      refreshing = req('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', body: { refresh_token: sess.refresh_token }
      }).then(function (d) {
        refreshing = null;
        var s = adopt(d);
        if (!s) throw new Error('登录状态已失效');
        return s.access_token;
      }).catch(function (e) {
        refreshing = null;
        writeSess(null);
        throw e;
      });
    }
    return refreshing;
  }

  /* ---------------- 账号 ---------------- */
  function signUp(email, pwd) {
    return req('/auth/v1/signup', { method: 'POST', body: { email: email, password: pwd } })
      .then(function (d) {
        /* 项目开了「邮箱确认」时这里只有 user 没有 session，
           需要用户去邮箱点确认链接，再回来登录。 */
        if (d && d.access_token) { adopt(d); return { session: sess, needConfirm: false }; }
        return { session: null, needConfirm: true, user: d && d.user };
      });
  }

  function signIn(email, pwd) {
    return req('/auth/v1/token?grant_type=password', {
      method: 'POST', body: { email: email, password: pwd }
    }).then(function (d) {
      var s = adopt(d);
      if (!s) throw new Error('登录失败');
      return s;
    });
  }

  function signOut() {
    var t = sess && sess.access_token;
    writeSess(null);
    if (!t) return Promise.resolve();
    return req('/auth/v1/logout', { method: 'POST', token: t }).catch(function () {});
  }

  function user() { return sess && sess.user; }
  function session() { return sess; }

  /* ---------------- 数据 ---------------- */
  function pull() {
    return token().then(function (t) {
      var uid = sess.user && sess.user.id;
      if (!uid) throw new Error('缺少用户 ID');
      return req('/rest/v1/' + TABLE + '?select=data,ts&user_id=eq.' + uid, { token: t })
        .then(function (rows) {
          if (!rows || !rows.length) return null;
          return { data: rows[0].data, ts: rows[0].ts };
        });
    });
  }

  function push(data) {
    return token().then(function (t) {
      var uid = sess.user && sess.user.id;
      if (!uid) throw new Error('缺少用户 ID');
      var body = [{ user_id: uid, data: data, ts: data.ts || Date.now(), updated_at: new Date().toISOString() }];
      return req('/rest/v1/' + TABLE + '?on_conflict=user_id', {
        method: 'POST',
        token: t,
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: body
      });
    });
  }

  /* ---------------- 对外 ---------------- */
  /* 确认邮件的链接是 Site_URL#access_token=...&refresh_token=...：
     Supabase 把登录凭证直接放在链接里（隐式流）。如果用户把 Site URL 配成
     本站，点完邮件就等于已登录——这里负责把链接吃下来，别浪费。 */
  function handleHash() {
    var h = location.hash || '';
    if (h.indexOf('access_token=') < 0) return false;
    var m = {};
    h.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) m[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    if (!m.access_token) return false;
    var ein = parseInt(m.expires_in || '3600', 10);
    var s = adopt({
      access_token: m.access_token,
      refresh_token: m.refresh_token,
      expires_at: sec() + ein
    });
    if (!s) return false;
    /* fragment 里没有用户资料，单独取一次 */
    req('/auth/v1/user', { token: m.access_token }).then(function (u) {
      if (sess && sess.access_token === m.access_token) {
        sess.user = u;
        writeSess(sess);
      }
    }).catch(function () {});
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    return true;
  }

  window.ZYAuth = {
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    pull: pull,
    push: push,
    user: user,
    session: session,
    onChange: function (fn) { listeners.push(fn); try { fn(sess); } catch (e) {} },
    /* 打开页面时先看是不是从确认邮件跳回来的；再用本地 refresh_token 静默续期 */
    boot: function () {
      if (handleHash()) return Promise.resolve(sess);
      if (!sess) { emit(); return Promise.resolve(null); }
      return token().then(function () { return sess; }).catch(function () { return null; });
    }
  };
})();
