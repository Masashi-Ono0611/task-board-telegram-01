# Task Board Telegram App

Telegramミニアプリとボットを組み合わせたタスク管理アプリケーション。

## プロジェクト構成

このプロジェクトは以下の2つの主要コンポーネントで構成されています：

1. **Web アプリケーション（Next.js）**
   - Telegramミニアプリとして動作
   - タスクの作成、表示、更新、削除機能を提供
   - Firebase Realtime Databaseでデータを管理

2. **Telegram Bot**
   - ミニアプリへのアクセスを提供
   - コマンドベースのインタラクション

## ホスティング構成

このプロジェクトは以下のように分散ホスティングされています：

- **Webアプリケーション**: [Vercel](https://vercel.com)
  - Next.jsアプリケーションのホスティング
  - 自動デプロイメント

- **データベース**: [Firebase](https://firebase.google.com)
  - タスクデータの保存
  - リアルタイム同期

- **Telegram Bot**: [Railway.app](https://railway.app)
  - 24/7稼働のボットホスティング
  - 自動デプロイメント

## 環境変数の設定

### ローカル開発環境
プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、以下の環境変数を設定します：

```env
# Bot Configuration
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=your_webapp_url_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### デプロイメント環境

#### Vercel（Webアプリケーション）
Vercelのプロジェクト設定で、Firebase関連の環境変数を設定します。

#### Railway.app（Telegram Bot）
Railway.appのダッシュボードで以下の手順で環境変数を設定します：

1. 「Variables」タブを開く
2. 「Raw Editor」ボタンをクリック
3. ローカルの`.env.local`ファイルの内容をコピー＆ペースト

**注意**: 環境変数の設定時に以下のエラーが発生した場合：
```
ERROR: invalid key-value pair "= BOT_TOKEN=...": empty key
```
これは環境変数の形式に問題がある可能性があります。Raw Editorを使用することで、正しい形式で環境変数を設定できます。

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（Webアプリケーション）
npm run dev

# 開発環境でのボットの起動
npm run bot:dev
```

## デプロイメント設定

### Telegram Bot用の設定

#### package.jsonの設定
```json
{
  "scripts": {
    "start": "ts-node bot/index.ts",
    "bot:dev": "ts-node bot/index.ts"
  }
}
```

#### 必要な依存関係
以下のパッケージが`dependencies`（not `devDependencies`）にあることを確認：
- `ts-node`
- `typescript`
- `@types/node`

これらは本番環境でのTypeScriptの実行に必要です。

## 技術スタック

- **フロントエンド**: Next.js, React, TailwindCSS
- **バックエンド**: Firebase Realtime Database
- **ボット**: Node.js, Telegraf
- **言語**: TypeScript
