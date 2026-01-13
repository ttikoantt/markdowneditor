# TDD実装ガイド

**マークダウンエディター プロジェクト**

このガイドは、テスト駆動開発（TDD）でプロジェクトを実装するための完全なリファレンスです。

---

## 📚 ドキュメント構成

### 1. プロジェクト全体
- **[requirements.md](./requirements.md)** - 要件定義書
  - 機能要件、非機能要件、リリース計画
  - MVP機能の詳細

- **[design.md](./design.md)** - 設計書
  - アーキテクチャ、技術スタック
  - モジュール設計、データモデル
  - API設計、セキュリティ設計

- **[architecture-review.md](./architecture-review.md)** - アーキテクチャレビュー
  - 技術的妥当性の評価
  - リスク分析と対策
  - 改善提案と優先順位

### 2. TDD実装
- **[tdd-strategy.md](./tdd-strategy.md)** - TDD戦略
  - TDDワークフロー
  - テストレベルと戦略
  - モック戦略、カバレッジ目標

- **[test-cases.md](./test-cases.md)** - テストケース仕様
  - 網羅的なテストケース一覧
  - ユニット、コンポーネント、統合、E2Eテスト
  - 各モジュールごとの詳細テストシナリオ

- **[test-suite-templates.md](./test-suite-templates.md)** - テストスイートテンプレート
  - コピー&ペーストで使えるテストコード
  - ユニット、コンポーネント、統合、E2Eテストのテンプレート
  - モック・フィクスチャのテンプレート

---

## 🚀 TDD実装の開始手順

### ステップ1: 環境セットアップ

```bash
# 1. プロジェクト初期化
pnpm create vite@latest . --template react-ts

# 2. 依存関係のインストール
pnpm install

# 3. テスト関連の依存関係を追加
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom

# 4. E2Eテストツールを追加
pnpm add -D playwright @playwright/test
pnpm exec playwright install

# 5. その他の開発ツール
pnpm add -D eslint prettier husky lint-staged
```

### ステップ2: 設定ファイルのセットアップ

以下のファイルを作成：
- `vitest.config.ts` - [tdd-strategy.md](./tdd-strategy.md#32-vitest設定)を参照
- `playwright.config.ts` - [tdd-strategy.md](./tdd-strategy.md#34-playwright設定)を参照
- `src/test/setup.ts` - [tdd-strategy.md](./tdd-strategy.md#33-テストセットアップ)を参照

### ステップ3: ディレクトリ構造の作成

```bash
mkdir -p src/{components,lib,store,hooks,types,styles,workers,test/{mocks,fixtures,utils}}
mkdir -p e2e/fixtures
```

### ステップ4: テストフィクスチャとモックの準備

1. `src/test/fixtures/testData.ts` を作成
   - [test-suite-templates.md](./test-suite-templates.md#52-テストフィクスチャテンプレート)のテンプレートをコピー

2. `src/test/mocks/` 配下にモックファイルを作成
   - `fileSystemAPI.ts`
   - `indexedDB.ts`
   - `tiptap.ts`

3. `src/test/utils/testUtils.tsx` を作成
   - [test-suite-templates.md](./test-suite-templates.md#53-テストユーティリティテンプレート)のテンプレートをコピー

---

## 📝 TDD実装の流れ

### フェーズ1: ユーティリティとコアロジック（1週目）

優先順位に従って以下を実装：

#### 1. バリデーター（最優先）
```bash
# テストファイル作成
touch src/lib/utils/validators.test.ts

# テストケースを test-cases.md の 1.4 から参照
# テストコードを test-suite-templates.md の 1.1 テンプレートで作成

# TDDサイクル開始
pnpm test:watch
```

**実装順序**:
1. `isValidFileName` のテスト → 実装
2. `isMarkdownFile` のテスト → 実装
3. `escapeHtml` のテスト → 実装

#### 2. マークダウンパーサー
```bash
touch src/lib/markdown/parser.test.ts
```

**実装順序**（[test-cases.md](./test-cases.md#11-マークダウンパーサー-libmarkdownparserts) 参照）:
1. 見出しのパース（H1-H6）
2. テキスト装飾（太字、斜体、取り消し線）
3. リンクと画像
4. リストとコードブロック
5. エッジケース

#### 3. マークダウンシリアライザー
```bash
touch src/lib/markdown/serializer.test.ts
```

#### 4. File System API
```bash
touch src/lib/fileSystem/fileSystemAPI.test.ts
```

#### 5. 検索エンジン
```bash
touch src/lib/search/searchEngine.test.ts
```

#### 6. 画像最適化
```bash
touch src/lib/utils/imageOptimizer.test.ts
```

### フェーズ2: コンポーネント（2週目）

#### 1. エディターコンポーネント
```bash
touch src/components/Editor/Editor.test.tsx
```

**実装順序**（[test-cases.md](./test-cases.md#21-エディターコンポーネント-componentseditoreditorstsx) 参照）:
1. 基本的なレンダリング
2. テキスト入力と変更検知
3. フォーマッティング（太字、斜体）
4. キーボードショートカット
5. アクセシビリティ

#### 2. ツールバーコンポーネント
```bash
touch src/components/Editor/Toolbar.test.tsx
```

#### 3. ファイルツリーコンポーネント
```bash
touch src/components/Sidebar/FileTree.test.tsx
```

#### 4. その他のUIコンポーネント
- サイドバー
- タブバー
- ダイアログ

### フェーズ3: 統合テスト（3週目）

#### 1. エディター + マークダウン変換
```bash
touch src/__tests__/integration/editor-markdown.test.tsx
```

#### 2. ファイルツリー + ファイルシステム
```bash
touch src/__tests__/integration/filetree-filesystem.test.tsx
```

#### 3. 検索機能 + ファイル読み込み
```bash
touch src/__tests__/integration/search-files.test.tsx
```

### フェーズ4: E2Eテスト（4週目）

#### 1. 基本フロー
```bash
touch e2e/basic-flow.spec.ts
```

**テストシナリオ**（[test-cases.md](./test-cases.md#41-基本フロー) 参照）:
1. 初回起動 → ワークスペース選択
2. ファイル作成 → 編集 → 保存
3. 検索 → ファイルを開く
4. テーマ切り替え
5. ブラウザリロード時の状態復元

#### 2. 画像挿入フロー
```bash
touch e2e/image-insertion.spec.ts
```

#### 3. 複数ファイル編集フロー
```bash
touch e2e/multi-file-editing.spec.ts
```

---

## 🔄 TDDワークフロー（詳細）

### 各機能の実装サイクル

#### 1. 🔴 RED: テストを書く

```typescript
// 例: バリデーターのテスト
describe('Validators', () => {
  it('should accept valid file name', () => {
    // このテストは最初は失敗する（関数が未実装のため）
    expect(Validators.isValidFileName('test.md')).toBe(true);
  });
});
```

```bash
# テストを実行して失敗を確認
pnpm test
# ❌ ReferenceError: Validators is not defined
```

#### 2. 🟢 GREEN: 最小限の実装

```typescript
// src/lib/utils/validators.ts
export class Validators {
  static isValidFileName(fileName: string): boolean {
    // 最小限の実装（まずはテストをパスさせる）
    return fileName.length > 0;
  }
}
```

```bash
# テストを実行して成功を確認
pnpm test
# ✅ Test passed
```

#### 3. 追加のテストケース

```typescript
it('should reject empty file name', () => {
  expect(Validators.isValidFileName('')).toBe(false);
});

it('should reject file name with invalid characters', () => {
  expect(Validators.isValidFileName('test/file.md')).toBe(false);
});
```

```bash
# 新しいテストは失敗する
pnpm test
# ❌ Expected false, received true
```

#### 4. 完全な実装

```typescript
export class Validators {
  static isValidFileName(fileName: string): boolean {
    if (fileName.length === 0) return false;

    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    return !invalidChars.test(fileName);
  }
}
```

```bash
# すべてのテストが成功
pnpm test
# ✅ All tests passed
```

#### 5. 🔵 REFACTOR: リファクタリング

```typescript
// より読みやすく、保守しやすいコードに改善
export class Validators {
  private static readonly INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;

  static isValidFileName(fileName: string): boolean {
    if (!fileName || fileName.length === 0) {
      return false;
    }

    return !this.INVALID_FILENAME_CHARS.test(fileName);
  }
}
```

```bash
# リファクタリング後もテストが通ることを確認
pnpm test
# ✅ All tests passed
```

---

## 📊 進捗管理

### 毎日のチェックリスト

- [ ] 今日実装する機能を決定
- [ ] テストケースを確認（test-cases.md参照）
- [ ] テストを先に書く（RED）
- [ ] 最小限の実装（GREEN）
- [ ] リファクタリング（REFACTOR）
- [ ] カバレッジを確認（85%以上を維持）
- [ ] コミット

### 毎週のチェックリスト

- [ ] 週の目標を達成したか確認
- [ ] すべてのテストが通っているか確認
- [ ] カバレッジレポートをレビュー
- [ ] コードレビューを実施
- [ ] 次週の計画を立てる

### カバレッジ目標

```bash
# カバレッジを確認
pnpm test:coverage

# 目標値
# - Lines: 85%以上
# - Functions: 85%以上
# - Branches: 80%以上
# - Statements: 85%以上
```

---

## 🛠️ よく使うコマンド

### 開発中

```bash
# ウォッチモードでテスト実行（推奨）
pnpm test:watch

# UIモードでテスト実行
pnpm test:ui

# 特定のファイルのみテスト
pnpm test path/to/file.test.ts

# 特定のテスト名でフィルター
pnpm test --grep "test name"
```

### コミット前

```bash
# 型チェック
pnpm type-check

# リンター実行
pnpm lint

# すべてのテスト実行
pnpm test

# カバレッジ確認
pnpm test:coverage
```

### E2Eテスト

```bash
# E2Eテスト実行
pnpm test:e2e

# UIモードでE2Eテスト
pnpm test:e2e:ui

# デバッグモード
pnpm test:e2e:debug
```

---

## 📖 参考資料

### TDD関連
- [tdd-strategy.md](./tdd-strategy.md) - TDD基本方針とワークフロー
- [test-cases.md](./test-cases.md) - 網羅的なテストケース一覧
- [test-suite-templates.md](./test-suite-templates.md) - すぐに使えるテンプレート

### プロジェクト関連
- [requirements.md](./requirements.md) - 要件定義
- [design.md](./design.md) - 設計書
- [architecture-review.md](./architecture-review.md) - アーキテクチャレビュー

### 外部リソース
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [TDD by Example (Kent Beck)](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

---

## 💡 TDDのベストプラクティス

### 1. 小さなステップで進める
- 一度に1つの機能のみ実装
- テストは1つずつ追加
- 頻繁にコミット（各RED-GREEN-REFACTORサイクル）

### 2. テストを先に書く
- 実装前にテストを書くことで仕様を明確化
- テストが失敗することを確認してから実装
- テストがパスする最小限のコードのみ書く

### 3. リファクタリングを恐れない
- テストがあるので安心してリファクタリング可能
- 定期的にコードの品質を改善
- テストが通っている限り、自由に変更できる

### 4. テストの可読性を重視
- テストコードも本番コード同様に重要
- 明確なテスト名を付ける
- AAAパターン（Arrange-Act-Assert）を使用

### 5. モックは最小限に
- 可能な限り実際のコードを使用
- 外部依存のみモック化
- 過度なモックはテストの価値を下げる

---

## 🎯 成功の指標

### コード品質
- ✅ すべてのテストが通る
- ✅ カバレッジ85%以上
- ✅ リンターエラーなし
- ✅ 型エラーなし

### 開発速度
- ✅ 機能追加時のバグが少ない
- ✅ リファクタリングが容易
- ✅ デバッグ時間が短い

### チーム
- ✅ コードレビューがスムーズ
- ✅ 仕様がテストで明確
- ✅ 安心して変更できる

---

## 🚨 トラブルシューティング

### テストが遅い
→ [tdd-strategy.md](./tdd-strategy.md#101-よくある問題) 参照

### フレーキーなテスト（不安定）
→ [tdd-strategy.md](./tdd-strategy.md#101-よくある問題) 参照

### モックが動作しない
→ [tdd-strategy.md](./tdd-strategy.md#101-よくある問題) 参照

### カバレッジが上がらない
→ エッジケースと異常系のテストを追加

---

## 📞 サポート

質問やフィードバックがある場合：

1. 各ドキュメントを確認
2. テストテンプレートを参照
3. 既存のテストコードを確認
4. チームメンバーに相談

---

**最終更新**: 2026-01-10
**次回レビュー**: 実装開始後1週間

---

Happy TDD! 🚀
