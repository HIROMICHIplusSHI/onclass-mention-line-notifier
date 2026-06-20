# オンクラス メンション → LINE 通知

オンラインクラス（the-online-class）の**メンション見逃しを LINE で通知**するツール。
GitHub Actions が5分おきに動き、新しいメンションがあれば LINE に届けます。PC を閉じていても動きます（無料）。

## 仕組み

```
GitHub Actions（5分おき）
  ① ログイン（メアド+パス → CSRF → セッションCookie取得）
  ② 自分宛のメンション一覧を取得
  ③ 前回より新しいメンションだけ LINE に通知
```

- `is_read`（既読フラグ）はアプリを開くと変わってしまうため、判定には使わない
- 代わりに「前回どこまで通知したか」を `state.json` に記録し、**新着だけを1回ずつ**通知する
- `state.json` は GitHub Actions のキャッシュで実行間に引き継ぐ

## ファイル構成

| ファイル | 役割 |
|---|---|
| `src/login.js` | ログイン（CSRF 2段階）してセッションCookieを返す |
| `src/mentions.js` | メンション一覧を取得 |
| `src/line.js` | LINE Messaging API で送信（push / broadcast 両対応） |
| `src/state.js` | 通知済みの状態を読み書き |
| `src/index.js` | 上記をつなぐメイン処理 |
| `scripts/check.js` | ログイン+取得の動作確認（`npm run check`） |
| `scripts/test-line.js` | LINE 送信テスト（`npm run test-line`） |

## ローカルでの動かし方

1. `.env.example` をコピーして `.env` を作り、値を埋める
2. 動作確認:
   ```bash
   npm run check      # ログイン → メンション取得
   npm run test-line  # LINE にテスト送信
   npm start          # 本番と同じ処理（新着があれば通知）
   ```

> `.env` は秘密情報。`.gitignore` 済みでコミットされません。

## 必要な値（環境変数 / GitHub Secrets）

| 名前 | 内容 |
|---|---|
| `OC_EMAIL` | オンクラスのログインメール |
| `OC_PASSWORD` | オンクラスのパスワード |
| `OC_ENTERPRISE_ID` | 所属エンタープライズID（メンションAPIのクエリ） |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API のチャネルアクセストークン |
| `LINE_USER_ID` | 送信先の User ID（未設定なら友だち全員に broadcast） |

## GitHub Actions の設定

1. このリポジトリを GitHub に push
2. **Settings → Secrets and variables → Actions** で上記5つを登録
3. **Actions タブ → メンション通知 → Run workflow** で手動テスト
4. 以降は5分おきに自動実行

> スケジュール実行は GitHub 側の混雑で数分遅れることがあります（仕様）。
