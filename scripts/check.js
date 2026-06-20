// 動作確認用スクリプト
// ログイン → 自分のメンション取得 が通るかをローカルで検証する。
// 実行: npm run check

import { login } from "../src/login.js";
import { fetchMentions } from "../src/mentions.js";

async function main() {
  const email = process.env.OC_EMAIL;
  const password = process.env.OC_PASSWORD;
  const enterpriseId = process.env.OC_ENTERPRISE_ID;

  if (!email || !password || !enterpriseId) {
    throw new Error(
      "OC_EMAIL / OC_PASSWORD / OC_ENTERPRISE_ID を .env に設定してください",
    );
  }

  console.log("① ログイン中...");
  const { cookie, user } = await login(email, password);
  console.log(`   ✓ ログイン成功: ${user.name}（${user.email}）`);

  console.log("② メンション取得中...");
  const mentions = await fetchMentions(cookie, enterpriseId);
  const unread = mentions.filter((m) => !m.is_read);
  console.log(`   ✓ 合計 ${mentions.length} 件 / 未読 ${unread.length} 件`);

  console.log("③ 直近のメンション（最大3件）:");
  for (const m of mentions.slice(0, 3)) {
    const chat = m.chat ?? {};
    const text = (chat.text ?? "").replace(/\s+/g, " ").slice(0, 40);
    const status = m.is_read ? "既読" : "未読";
    console.log(`   - [${status}] ${chat.user_name}: ${text}…`);
  }
}

main().catch((err) => {
  console.error("✗ エラー:", err.message);
  process.exit(1);
});
