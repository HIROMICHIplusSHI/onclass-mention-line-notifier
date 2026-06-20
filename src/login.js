// オンラインクラスへのログイン処理
// 「CSRFトークン取得」→「メアド/パスでログイン」の2段階で、
// 認証済みのセッションCookieを取得する。

const API_BASE = "https://api.the-online-class.com/v1";
const ORIGIN = "https://app.the-online-class.com";

// Set-Cookie ヘッダ群から _oc_user_session の値だけ取り出す
function extractSessionCookie(setCookies) {
  for (const raw of setCookies) {
    const match = raw.match(/_oc_user_session=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * ログインして認証済みセッションCookieを返す
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ cookie: string, user: object }>}
 */
export async function login(email, password) {
  // ① CSRFトークンと仮セッションCookieを取得
  const csrfRes = await fetch(`${API_BASE}/auth/user/csrf_token`, {
    headers: {
      accept: "application/json, text/plain, */*",
      origin: ORIGIN,
      referer: `${ORIGIN}/`,
    },
  });
  if (!csrfRes.ok) {
    throw new Error(`CSRFトークン取得に失敗しました: HTTP ${csrfRes.status}`);
  }

  const csrfToken = csrfRes.headers.get("x-csrf-token");
  const tempCookie = extractSessionCookie(csrfRes.headers.getSetCookie());
  if (!csrfToken || !tempCookie) {
    throw new Error("CSRFトークンまたは仮セッションの取得に失敗しました");
  }

  // ② メアド+パスでログイン（CSRFトークンと仮Cookieはペアで送る）
  const loginRes = await fetch(`${API_BASE}/auth/user/session`, {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
      origin: ORIGIN,
      referer: `${ORIGIN}/`,
      cookie: `_oc_user_session=${tempCookie}`,
    },
    body: JSON.stringify({ session: { email, password } }),
  });
  if (!loginRes.ok) {
    throw new Error(`ログインに失敗しました: HTTP ${loginRes.status}`);
  }

  const result = await loginRes.json();
  if (!result.authenticated) {
    throw new Error("認証に失敗しました（メールアドレス/パスワードを確認してください）");
  }

  // ログイン成功で差し替わった「本物の」セッションCookieを取り出して返す
  const authCookie = extractSessionCookie(loginRes.headers.getSetCookie());
  if (!authCookie) {
    throw new Error("認証後のセッションCookieが取得できませんでした");
  }

  return {
    cookie: `_oc_user_session=${authCookie}`,
    user: result.user,
  };
}
