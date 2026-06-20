# オンクラス メンション → LINE 通知

オンラインクラス（the-online-class）の**メンション見逃しを LINE で通知**するツール。
GitHub Actions が5分おきに動き、新しいメンションがあれば LINE に届けます。PC を閉じていても動きます（無料）。

## 🍴 フォークして使う人へ（まずこれ）

このリポジトリを **Fork** したら、各自で設定しないと動きません。理由は次の2つです。

- フォークしたリポジトリは **GitHub Actions が既定で無効**
- **Secrets はフォークにコピーされない**（セキュリティのため）

### 1. Actions を有効化する

- リポジトリ上部の **Actions** タブを開く
- **「I understand my workflows, go ahead and enable them」** をクリック

### 2. 自分の Secrets を登録する

**Settings → Secrets and variables → Actions → New repository secret** で、下の5つを自分の値で登録します（値の意味は[必要な値](#必要な値環境変数--github-secrets)を参照）。

| 名前 | 内容 |
|---|---|
| `OC_EMAIL` | オンクラスのログインメール |
| `OC_PASSWORD` | オンクラスのパスワード |
| `OC_ENTERPRISE_ID` | 所属エンタープライズID |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE のチャネルアクセストークン |
| `LINE_USER_ID` | LINE の User ID（未設定なら友だち全員に broadcast） |

### 3. 手動でテスト実行

- **Actions タブ → メンション通知 → Run workflow** を押す
- 緑のチェックが付けば成功。以降は自動で回り始めます

### 4. 自動運用の注意

- 設定後は **5分おき（遅延あり）** に自動チェックされます
- ⚠️ スケジュール実行は GitHub 側の都合で**数分〜十数分遅れる／たまにスキップ**されます（GitHub Actions の仕様。即時性より「見逃さない」が目的）
- ⚠️ リポジトリに **60日間コミットが無いとスケジュールが自動停止**します。止まったら何かコミットすれば復活します

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
