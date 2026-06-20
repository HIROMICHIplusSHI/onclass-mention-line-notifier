// LINE Messaging API でメッセージを送る
// LINE_USER_ID があれば push（特定ユーザー宛）、なければ broadcast（友だち全員宛）。

const PUSH_URL = "https://api.line.me/v2/bot/message/push";
const BROADCAST_URL = "https://api.line.me/v2/bot/message/broadcast";

/**
 * LINE にテキストメッセージを送る
 * @param {string} text 送信する本文
 */
export async function sendLineMessage(text) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN を .env に設定してください");
  }

  const to = process.env.LINE_USER_ID;
  const url = to ? PUSH_URL : BROADCAST_URL;
  const payload = to
    ? { to, messages: [{ type: "text", text }] }
    : { messages: [{ type: "text", text }] };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE通知に失敗しました: HTTP ${res.status} ${body}`);
  }
}
