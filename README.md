# Matching Event Ops Manager

婚活イベントなどの募集・決済・当日運営を管理するイベント運営SaaSの骨格実装。

## Overview

このプロジェクトは、マッチングイベント（婚活パーティー、街コンなど）の運営を効率化するためのWebアプリケーションです。管理者はイベントの作成・管理・参加者管理を行い、参加者はオンラインで申し込みと決済を完了できます。

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: tRPC v11 (エンドツーエンドの型安全性)
- **Database**: PostgreSQL + Prisma ORM
- **Payment**: Stripe Checkout (テストモード対応)
- **Testing**: Vitest + Testing Library
- **Container**: Docker + Docker Compose
- **Package Manager**: pnpm

## Domain Model Summary

### Core Entities

1. **Event** (イベント)
   - イベントの基本情報（タイトル、日時、場所、定員、価格）
   - ステータス管理（draft, published, cancelled, completed）

2. **Participant** (参加者)
   - 参加者の基本情報（名前、メール、性別、備考）
   - メールアドレスはユニーク制約

3. **Application** (申込)
   - イベントと参加者の紐付け
   - 決済ステータス（pending, paid, cancelled, refunded）
   - Stripe CheckoutセッションIDの保持

### Key Relationships

- Event → Applications (1:N)
- Participant → Applications (1:N)
- Event + Participant → Application (ユニーク制約で重複申込防止)

## Features

### 管理画面 (`/events`)
- ✅ イベント一覧表示（申込数/定員を表示）
- ✅ 新規イベント作成フォーム
- ✅ イベント詳細ページ
- ✅ 参加者一覧表示
- ✅ CSVエクスポート機能
- ✅ ステータス更新（下書き・公開・中止・完了）

### 公開画面 (`/public/events`)
- ✅ 公開イベント一覧
- ✅ 参加申込フォーム
- ✅ Stripe Checkoutによる決済
- ✅ 定員チェック
- ✅ 重複申込防止

### API Layer (tRPC)
- ✅ 型安全なエンドツーエンドAPI
- ✅ Zodによる入力バリデーション
- ✅ カスタムエラーハンドリング
- ✅ 決済処理の統合

## Getting Started

### Requirements

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose (推奨)
- Stripe アカウント（テストモード）

### Quick Start with Docker Compose (推奨)

最も簡単な起動方法：

```bash
# 1. リポジトリをクローン
git clone https://github.com/yourusername/matching-event-ops-manager.git
cd matching-event-ops-manager

# 2. 環境変数ファイルを作成
cp .env.example .env

# 3. StripeキーをOPTIONAL: .envに設定（後述）

# 4. Docker Composeで起動（DB + App）
docker compose up -d

# 5. ログを確認
docker compose logs -f app
```

アプリが起動したら [http://localhost:3000](http://localhost:3000) にアクセスしてください。

**Note**: Docker Composeは自動的に以下を実行します：
- PostgreSQL の起動
- データベーススキーマの反映 (`pnpm db:push`)
- サンプルデータの投入 (`pnpm db:seed`)
- 開発サーバーの起動 (`pnpm dev`)

### Manual Setup (Dockerなし)

#### 1. 依存関係のインストール

```bash
pnpm install
```

#### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/matching_events?schema=public"

# Stripe (テストモード)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 3. PostgreSQLのセットアップ

```bash
# Dockerを使用する場合
docker run --name postgres-matching-events \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=matching_events \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### 4. データベースのセットアップ

```bash
# スキーマを反映
pnpm db:push

# サンプルデータを投入
pnpm db:seed
```

#### 5. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### Stripeキーの取得（オプション）

決済機能をテストする場合は、Stripeキーが必要です：

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン（無料アカウント作成可能）
2. **開発者 > APIキー** から以下を取得：
   - **公開可能キー** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **シークレットキー** (`sk_test_...`) → `STRIPE_SECRET_KEY`
3. `.env`ファイルに設定

## Available Scripts

### Development
- `pnpm dev` - 開発サーバー起動（ホットリロード有効）
- `pnpm build` - プロダクションビルド
- `pnpm start` - プロダクションサーバー起動
- `pnpm lint` - ESLint実行

### Database
- `pnpm db:push` - Prismaスキーマをデータベースに反映
- `pnpm db:generate` - Prisma Clientを生成
- `pnpm db:seed` - サンプルデータを投入
- `pnpm db:reset` - データベースをリセットしてseed実行
- `pnpm db:studio` - Prisma Studio起動（データベースGUI）

### Testing
- `pnpm test` - テスト実行（Vitest）
- `pnpm test:watch` - テストをwatch モードで実行

### Docker
- `pnpm docker:up` - Docker Compose起動
- `pnpm docker:down` - Docker Compose停止
- `pnpm docker:logs` - Appコンテナのログ表示

## Example Flow（垂直スライス）

プロジェクトには完全に動作するエンドツーエンドフローが実装されています：

### 1. イベント作成から公開まで（管理者）

```
1. http://localhost:3000/events にアクセス
2. 「新規イベント作成」をクリック
3. イベント情報を入力：
   - タイトル: "テスト婚活パーティー"
   - 日時: 未来の日付
   - 場所: "東京・渋谷"
   - 定員: 30
   - 価格: 5000
   - ステータス: "下書き"
4. 「作成」ボタンをクリック
5. 作成されたイベントをクリックして詳細ページへ
6. ステータスを "公開" に変更
```

### 2. 参加申込と決済（参加者）

```
1. http://localhost:3000/public/events にアクセス
2. 公開されているイベントを確認
3. 「このイベントに申し込む」をクリック
4. 参加者情報を入力：
   - 名前: "山田太郎"
   - メール: "test@example.com"
   - 性別: 選択
5. 「支払いへ進む」をクリック
6. Stripe Checkoutページに遷移
7. テストカード情報を入力:
   - カード番号: 4242 4242 4242 4242
   - 有効期限: 未来の日付
   - CVC: 123
8. 支払い完了後、イベント一覧に戻る
```

### 3. 参加者管理とCSVエクスポート（管理者）

```
1. http://localhost:3000/events にアクセス
2. 先ほど作成したイベントをクリック
3. 参加者一覧を確認（申込者が表示される）
4. 「CSVエクスポート」ボタンをクリック
5. 参加者データをダウンロード
```

### デモデータ

`pnpm db:seed`を実行すると、以下のサンプルデータが投入されます：

- **イベント**: 5件（公開3件、下書き1件、完了1件）
- **参加者**: 6名
- **申込**: 10件（各イベントに複数の申込）

デモデータを使用すると、すぐに動作を確認できます。

### Stripe テストカード

決済機能をテストする際は、以下のテストカードを使用できます：

| カード番号 | 結果 |
|-----------|------|
| `4242 4242 4242 4242` | 成功 |
| `4000 0000 0000 0002` | 失敗 |
| `4000 0000 0000 9995` | 残高不足 |

- **CVC**: 任意の3桁
- **有効期限**: 未来の日付

詳細は[Stripe Testing Documentation](https://stripe.com/docs/testing)を参照。

## Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── events/                  # 管理画面
│   │   ├── [id]/                # イベント詳細ページ
│   │   └── page.tsx             # イベント一覧・作成
│   ├── public/events/           # 公開画面
│   │   └── page.tsx             # イベント一覧・申込
│   ├── api/trpc/[trpc]/         # tRPC APIエンドポイント
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # ホームページ
│
├── lib/                         # 共有ライブラリ
│   ├── prisma.ts                # Prisma Clientシングルトン
│   ├── utils.ts                 # ユーティリティ関数
│   ├── errors.ts                # カスタムエラークラス
│   ├── trpc/                    # tRPCクライアント設定
│   │   ├── client.ts
│   │   └── Provider.tsx
│   └── __tests__/               # ユニットテスト
│
├── server/                      # サーバーサイドロジック
│   └── trpc/
│       ├── trpc.ts              # tRPC設定
│       └── routers/
│           ├── _app.ts          # メインルーター
│           ├── event.ts         # イベント関連API
│           └── application.ts   # 申込関連API
│
├── prisma/                      # データベース関連
│   ├── schema.prisma            # Prismaスキーマ定義
│   └── seed/
│       └── index.ts             # シードスクリプト
│
├── test/                        # テスト設定
│   └── setup.ts
│
├── docker-compose.yml           # Docker Compose設定
├── Dockerfile                   # Dockerイメージ定義
├── vitest.config.ts             # Vitestテスト設定
└── .env.example                 # 環境変数テンプレート
```

## Testing

```bash
# すべてのテストを実行
pnpm test

# Watchモードで実行
pnpm test:watch
```

現在のテストカバレッジ：
- ✅ ユーティリティ関数（`lib/utils.ts`）
- ✅ 価格フォーマット
- ✅ イベント定員チェック
- ✅ バリデーション関数

## Future Extensions

このプロジェクトは以下のような拡張が可能です：

### 短期的な改善
- [ ] 認証・認可の実装（NextAuth.js）
- [ ] Webhook処理（Stripe決済完了時の自動ステータス更新）
- [ ] メール通知機能（申込確認、リマインダー）
- [ ] 参加者の詳細プロフィール機能
- [ ] イベント検索・フィルタリング機能

### 中期的な機能追加
- [ ] マッチング機能（イベント後のカップリング）
- [ ] アンケート機能（イベント後のフィードバック収集）
- [ ] 当日運営サポート（チェックイン、座席管理）
- [ ] 参加者間メッセージング
- [ ] イベント分析ダッシュボード

### 技術的な改善
- [ ] E2Eテスト（Playwright）
- [ ] CI/CDパイプライン（GitHub Actions）
- [ ] パフォーマンス最適化（React Server Components活用）
- [ ] リアルタイム更新（WebSocket or SSE）
- [ ] 多言語対応（i18n）

### スケーラビリティ
- [ ] マルチテナント対応
- [ ] Redis キャッシング
- [ ] S3による画像管理
- [ ] CDN統合
- [ ] マイクロサービス化の検討

## Contributing

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## License

MIT
