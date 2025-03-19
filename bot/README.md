# Telegram Bot Configuration Guide

## 環境変数の設定

### ローカル開発環境
プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、以下の環境変数を設定します：

```env
# Bot Configuration
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=your_webapp_url_here

# Firebase Configuration (if needed)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Railway.appへのデプロイ
Railway.appにデプロイする際は、以下の手順で環境変数を設定します：

1. Railway.appのダッシュボードで「Variables」タブを開く
2. 「Raw Editor」ボタンをクリック
3. ローカルの`.env.local`ファイルの内容をそのままコピー＆ペースト

**注意**: 環境変数の設定時に以下のエラーが発生した場合：
```
ERROR: invalid key-value pair "= BOT_TOKEN=...": empty key
```
これは環境変数の形式に問題がある可能性があります。Raw Editorを使用することで、正しい形式で環境変数を設定できます。

## スクリプト

- 開発環境での実行: `npm run bot:dev`
- 本番環境での実行: `npm run start`

## デプロイメント設定

### package.jsonの設定
```json
{
  "scripts": {
    "start": "ts-node bot/index.ts",
    "bot:dev": "ts-node bot/index.ts"
  }
}
```

### 必要な依存関係
以下のパッケージが`dependencies`（not `devDependencies`）にあることを確認：
- `ts-node`
- `typescript`
- `@types/node`

これらは本番環境でのTypeScriptの実行に必要です。 