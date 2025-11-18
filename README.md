# matching-event-ops-manager

婚活イベントなどの募集・決済・当日運営・アンケートまでを管理するイベント運営SaaSの骨格。

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL
- **Payment**: Stripe Checkout (テストモード)
- **Package Manager**: pnpm

## Features

### 管理画面
- `/events` - イベント一覧と新規作成フォーム
- `/events/[id]` - イベント詳細、参加者一覧、CSVエクスポート機能
- ステータス管理（下書き・公開・中止・完了）

### 公開画面
- `/public/events` - 公開イベント一覧と参加申込フォーム
- Stripe Checkoutによる決済機能

### データモデル
- **Event**: イベント情報（タイトル、日時、場所、定員、価格、ステータス）
- **Participant**: 参加者情報（名前、メール、性別、備考）
- **Application**: 申込情報（イベントID、参加者ID、決済ステータス）

## Getting Started

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、以下の設定を行います：

```bash
cp .env.example .env
```

#### Stripeキーの取得と設定

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. 開発者 > APIキー から以下を取得：
   - **公開可能キー** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **シークレットキー** (`sk_test_...`) → `STRIPE_SECRET_KEY`

3. `.env`ファイルを編集：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/matching_events?schema=public"

# Stripe (テストモード)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_secret_here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. PostgreSQLのセットアップ

Dockerを使用する場合：

```bash
docker run --name postgres-matching-events \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=matching_events \
  -p 5432:5432 \
  -d postgres:16
```

または、ローカルにインストールしたPostgreSQLを使用してください。

### 4. データベースのマイグレーション

```bash
pnpm db:push
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## スクリプト

- `pnpm dev` - 開発サーバー起動
- `pnpm build` - プロダクションビルド
- `pnpm start` - プロダクションサーバー起動
- `pnpm lint` - ESLint実行
- `pnpm db:push` - Prismaスキーマをデータベースに反映
- `pnpm db:generate` - Prisma Clientを生成
- `pnpm db:studio` - Prisma Studio起動（データベースGUI）

## テスト手順

### 1. イベントの作成（管理画面）

1. `/events` にアクセス
2. 「新規イベント作成」をクリック
3. フォームに入力して作成
4. ステータスを「公開」に変更

### 2. 参加申込（公開画面）

1. `/public/events` にアクセス
2. 公開中のイベントから申し込みたいイベントを選択
3. 参加者情報を入力
4. 「支払いへ進む」をクリック
5. Stripe Checkoutページで決済（テストモードでは`4242 4242 4242 4242`が使用可能）

### 3. 参加者確認（管理画面）

1. `/events/[id]` で参加者一覧を確認
2. 「CSVエクスポート」で参加者データをダウンロード

## Stripe テストカード

テストモードでは以下のカード番号が使用できます：

- **成功**: `4242 4242 4242 4242`
- **失敗**: `4000 0000 0000 0002`
- CVC: 任意の3桁
- 有効期限: 未来の日付

詳細は[Stripe Testing Documentation](https://stripe.com/docs/testing)を参照してください。

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── events/            # 管理画面
│   ├── public/events/     # 公開画面
│   └── api/trpc/          # tRPC APIエンドポイント
├── lib/                   # ユーティリティ
│   ├── prisma.ts          # Prisma Clientインスタンス
│   └── trpc/              # tRPCクライアント設定
├── prisma/                # Prismaスキーマ
│   └── schema.prisma
└── server/                # サーバーサイドロジック
    └── trpc/              # tRPCルーター
```

## License

MIT
