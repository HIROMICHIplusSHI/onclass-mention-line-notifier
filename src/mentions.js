// 自分宛のメンション一覧を取得する

const API_BASE = "https://api.the-online-class.com/v1";
const ORIGIN = "https://app.the-online-class.com";

/**
 * 自分宛のメンション一覧を取得する
 * @param {string} cookie  login() で取得した認証済みCookie
 * @param {string} enterpriseId  所属エンタープライズID
 * @returns {Promise<Array<object>>}
 */
export async function fetchMentions(cookie, enterpriseId) {
  const url = `${API_BASE}/user/communities/activity/mentions?enterprise_id=${enterpriseId}`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      cookie,
      origin: ORIGIN,
      referer: `${ORIGIN}/`,
    },
  });
  if (!res.ok) {
    throw new Error(`メンション取得に失敗しました: HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data ?? [];
}
