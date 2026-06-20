// メイン処理：ログイン → メンション取得 → 新着だけ LINE 通知
// GitHub Actions から5分おきに実行される想定。

import { login } from "./login.js";
import { fetchMentions } from "./mentions.js";
import { sendLineMessage } from "./line.js";
import { loadState, saveState } from "./state.js";

// メンション1件を LINE 用のテキストに整形する
function formatMention(mention) {
  const chat = mention.chat ?? {};
  const channel = chat.channel?.name ?? "チャンネル";
  const sender = chat.user_name ?? "誰か";
  const text = (chat.text ?? "").trim();
  return `🔔 オンクラスでメンションされました\n[${channel}] ${sender}さん\n\n${text}`;
}

// a が b より後（新しい）かどうか
function isNewer(a, b) {
  return new Date(a).getTime() > new Date(b).getTime();
}

async function main() {
  const email = process.env.OC_EMAIL;
  const password = process.env.OC_PASSWORD;
  const enterpriseId = process.env.OC_ENTERPRISE_ID;
  if (!email || !password || !enterpriseId) {
    throw new Error("OC_EMAIL / OC_PASSWORD / OC_ENTERPRISE_ID が未設定です");
  }

  // ① ログイン → ② メンション取得
  const { cookie } = await login(email, password);
  const mentions = await fetchMentions(cookie, enterpriseId);

  const state = await loadState();

  // 初回実行：過去のメンションを一気に通知すると大量になるので、
  // 通知はせず "現在地" だけ記録する。
  if (!state.lastNotifiedAt) {
    const newest = mentions[0]?.created_at ?? new Date().toISOString();
    await saveState({ lastNotifiedAt: newest });
    console.log("初回実行：現在地を記録しました（通知なし）");
    return;
  }

  // ③ 前回より新しいメンションだけ抽出（古い順に通知したいので逆順に）
  const fresh = mentions
    .filter((m) => isNewer(m.created_at, state.lastNotifiedAt))
    .reverse();

  if (fresh.length === 0) {
    console.log("新しいメンションはありません");
    return;
  }

  // ④ LINE 通知
  for (const mention of fresh) {
    await sendLineMessage(formatMention(mention));
    console.log(`通知しました: ${mention.id}`);
  }

  // ⑤ 一番新しいメンションの時刻を記録
  await saveState({ lastNotifiedAt: mentions[0].created_at });
  console.log(`${fresh.length} 件のメンションを通知しました`);
}

main().catch((err) => {
  console.error("✗ エラー:", err.message);
  process.exit(1);
});
