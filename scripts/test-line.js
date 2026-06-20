// LINE 送信の動作確認用スクリプト
// .env に LINE_CHANNEL_ACCESS_TOKEN を入れてから実行する。
// 実行: npm run test-line

import { sendLineMessage } from "../src/line.js";

async function main() {
  await sendLineMessage(
    "✅ テスト通知です。\nオンクラス・メンション通知の接続確認ができました。",
  );
  console.log("✓ LINE に送信しました。スマホの LINE を確認してください。");
}

main().catch((err) => {
  console.error("✗ エラー:", err.message);
  process.exit(1);
});
