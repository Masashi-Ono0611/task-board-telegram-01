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
   - グループ固有のタスク管理を実現

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
# Development Bot Configuration
BOT_TOKEN=8027369590:AAF_15giPci2zsUJAGdRfRCR9g4CGWm7SZA  # ローカル開発用ボット (@local_taskboard_masa_bot)
WEBAPP_URL=http://localhost:3000

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
3. 以下の環境変数を設定：
   ```
   # Production Bot Configuration
   BOT_TOKEN=8073261576:AAGeiHFrMEFPgKHZeSLDbINxc996FCAwy0o  # 本番用ボット (@dev_test_masashi_bot)
   WEBAPP_URL=https://task-board-telegram-01.vercel.app
   
   # 追加の環境変数（必要に応じて）
   NODE_ENV=production
   ```

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

## グループ固有のタスク管理

このアプリケーションはTelegramグループごとに個別のタスクリストを管理します：

1. ユーザーがTelegramグループで`/webapp`コマンドを実行
2. ボットがそのグループのIDを取得してBase64エンコード
3. エンコードしたIDをURLパラメータとしてWebアプリに渡す
4. Webアプリ側でIDをデコードして取得
5. そのグループIDに紐づくタスクをFirebaseから取得
6. 取得したタスクを画面に表示

### ローカルでのテスト方法

実際のグループIDを使わずにテストする場合：
```
http://localhost:3000?startapp=テストID（Base64エンコード）
```

例：`test-group-1`というIDをテストする場合：
```
http://localhost:3000?startapp=dGVzdC1ncm91cC0x
```

## デプロイメント設定

### Telegram Bot用の設定

#### package.jsonの設定
```json
{
  "scripts": {
    "start": "ts-node bot/index.ts",
    "bot:dev": "NODE_ENV=development ts-node --esm bot/index.ts",
    "bot:start": "NODE_ENV=production ts-node --esm bot/index.ts"
  }
}
```

#### 必要な依存関係
以下のパッケージが`dependencies`（not `devDependencies`）にあることを確認：
- `ts-node`
- `typescript`
- `@types/node`

これらは本番環境でのTypeScriptの実行に必要です。

## デプロイフロー

### 1. 開発時のブランチ管理とVercelデプロイ

1. 機能開発用のブランチを作成
```bash
git checkout -b feature/your-feature-name
```

2. 開発完了後、変更をプッシュ
```bash
git add .
git commit -m "feat: your commit message"
git push origin feature/your-feature-name
```

3. Vercelで自動的にプレビューデプロイが作成される
- URLフォーマット: `https://task-board-telegram-01-git-[branch-name]-masashiono0611s-projects.vercel.app/`
- このURLで機能テストを実施

### 2. 本番環境へのデプロイ

1. プレビュー環境での動作確認が完了したら、mainブランチへマージ
```bash
git checkout main
git pull
git merge feature/your-feature-name
git push
```

2. Vercelでの本番デプロイ
- mainブランチへのプッシュ後、自動的に本番環境へのデプロイが開始
- 本番URL: `https://task-board-telegram-01.vercel.app/`
- デプロイ状況はVercelのダッシュボードで確認可能

### 3. デプロイの確認

1. 本番環境での動作確認
- Telegramボットの動作確認
- Webアプリの機能確認
- デバッグ情報の確認

2. 問題が発見された場合
- 新しいブランチを作成して修正
- 上記のフローを再度実施

注意: 本番環境（mainブランチ）の安定性を保つため、必ずプレビュー環境での十分なテストを行ってからマージしてください。

## 技術スタック

- **フロントエンド**: Next.js, React, TailwindCSS
- **バックエンド**: Firebase Realtime Database
- **ボット**: Node.js, Telegraf
- **言語**: TypeScript

## デバッグモード

アプリケーションにはデバッグモードが組み込まれており、必要に応じて有効化できます。デバッグ機能は現在コメントアウトされていますが、以下のファイルで利用可能です：

### Webアプリケーション（app/page.tsx）
```typescript
/* デバッグ関連の型定義とコード
interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warn';
}
*/
```
デバッグ情報の表示を有効にするには、該当するコードブロックのコメントアウトを解除します。

### Firebase（app/lib/firebase.ts）
```typescript
/* デバッグ関連の関数とログ
const logToDOM = (message: string, type: 'info' | 'error' | 'warn' = 'info') => {
  // 実装詳細
};
*/
```
Firebaseの接続状態やデータ操作のログを表示するには、該当するコードブロックのコメントアウトを解除します。

デバッグモードを有効にすると以下の情報が表示されます：
- URLパラメータとその解析結果
- グループIDのエンコード/デコード状態
- Firebaseの接続状態
- データベース操作のログ
- エラーメッセージの詳細
