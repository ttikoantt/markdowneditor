# テスト駆動開発（TDD）戦略

**作成日**: 2026-01-10
**バージョン**: 1.0

---

## 目次

1. [TDD基本方針](#1-tdd基本方針)
2. [テストレベルと戦略](#2-テストレベルと戦略)
3. [テストツールとセットアップ](#3-テストツールとセットアップ)
4. [TDDワークフロー](#4-tddワークフロー)
5. [モック戦略](#5-モック戦略)
6. [カバレッジ目標](#6-カバレッジ目標)
7. [継続的インテグレーション](#7-継続的インテグレーション)

---

## 1. TDD基本方針

### 1.1 TDDサイクル（Red-Green-Refactor）

```
1. 🔴 RED: テストを書く（失敗することを確認）
   ↓
2. 🟢 GREEN: 最小限のコードで実装（テストをパス）
   ↓
3. 🔵 REFACTOR: リファクタリング（テストをパスしたまま改善）
   ↓
   繰り返し
```

### 1.2 テスト作成の優先順位

**優先度: 高**
1. コアビジネスロジック
   - マークダウン変換
   - ファイル操作
   - ワークスペース管理
2. セキュリティクリティカルな機能
   - 入力検証
   - ファイル名のサニタイズ
3. エラーハンドリング
   - 各種エラーケース
   - フォールバック処理

**優先度: 中**
1. UIコンポーネント
   - エディターコンポーネント
   - ファイルツリー
   - ツールバー
2. 状態管理
   - Zustandストア
   - 状態の永続化

**優先度: 低**
1. スタイリング
2. アニメーション
3. 非機能的な補助機能

### 1.3 テストカバレッジ目標

| テストレベル | カバレッジ目標 | 優先度 |
|-------------|---------------|--------|
| ユニットテスト | 85%以上 | 高 |
| 統合テスト | 75%以上 | 高 |
| E2Eテスト | 主要フロー100% | 中 |
| コンポーネントテスト | 80%以上 | 高 |

---

## 2. テストレベルと戦略

### 2.1 ユニットテスト（Unit Tests）

**対象**: 個別の関数・クラス・ユーティリティ

**ツール**: Vitest

**テスト対象例**:
- マークダウンパーサー/シリアライザー
- ファイルシステムAPI
- バリデーター
- ユーティリティ関数
- 検索エンジン

**方針**:
- すべての公開関数をテスト
- エッジケース、境界値、エラーケースを網羅
- 依存関係はモック化

### 2.2 コンポーネントテスト（Component Tests）

**対象**: Reactコンポーネント

**ツール**: React Testing Library + Vitest

**テスト対象例**:
- エディターコンポーネント
- ファイルツリー
- ツールバー
- ダイアログ
- サイドバー

**方針**:
- ユーザーの視点でテスト（ユーザーがどう操作するか）
- アクセシビリティを重視（role、aria属性）
- 実装の詳細ではなく、動作をテスト

### 2.3 統合テスト（Integration Tests）

**対象**: 複数のモジュール/コンポーネントの連携

**ツール**: Vitest + React Testing Library

**テスト対象例**:
- エディター + マークダウン変換
- ファイルツリー + ファイルシステムAPI
- 検索機能 + ファイル読み込み
- ワークスペース管理 + ストレージ

**方針**:
- モックは最小限に
- 実際の統合動作を確認
- データフローの検証

### 2.4 E2Eテスト（End-to-End Tests）

**対象**: ユーザーストーリー全体

**ツール**: Playwright

**テスト対象例**:
- ワークスペースを開く → ファイルを作成 → 編集 → 保存
- 検索 → ファイルを開く → 編集
- 画像を貼り付け → 保存 → 再読み込み
- テーマ切り替え

**方針**:
- 主要なユーザーフローのみ
- クリティカルパスを優先
- 実際のブラウザで実行

---

## 3. テストツールとセットアップ

### 3.1 依存関係

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@vitest/ui": "^1.0.4",
    "vitest": "^1.0.4",
    "jsdom": "^23.0.1",
    "playwright": "^1.40.1",
    "@playwright/test": "^1.40.1",
    "msw": "^2.0.11",
    "happy-dom": "^12.10.3"
  }
}
```

### 3.2 Vitest設定

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        'dist/',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3.3 テストセットアップ

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 各テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});

// File System Access APIのモック
global.window.showDirectoryPicker = vi.fn();
global.window.showOpenFilePicker = vi.fn();
global.window.showSaveFilePicker = vi.fn();

// IndexedDBのモック
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};
global.indexedDB = indexedDB as any;

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Clipboard APIのモック
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn(),
    write: vi.fn(),
    read: vi.fn(),
  },
});
```

### 3.4 Playwright設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 4. TDDワークフロー

### 4.1 機能実装の標準フロー

#### ステップ1: テストファイルの作成

```typescript
// src/lib/markdown/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './parser';

describe('parseMarkdown', () => {
  it('should exist', () => {
    expect(parseMarkdown).toBeDefined();
  });
});
```

**実行**: `pnpm test` → 🔴 失敗（関数が未定義）

#### ステップ2: 最小限の実装

```typescript
// src/lib/markdown/parser.ts
export function parseMarkdown(markdown: string) {
  return null;
}
```

**実行**: `pnpm test` → 🟢 成功

#### ステップ3: テストケースの追加

```typescript
// src/lib/markdown/parser.test.ts
describe('parseMarkdown', () => {
  it('should parse heading', () => {
    const result = parseMarkdown('# Hello');
    expect(result).toHaveProperty('type', 'heading');
    expect(result).toHaveProperty('level', 1);
    expect(result).toHaveProperty('text', 'Hello');
  });

  it('should parse bold text', () => {
    const result = parseMarkdown('**bold**');
    expect(result).toHaveProperty('type', 'bold');
    expect(result).toHaveProperty('text', 'bold');
  });
});
```

**実行**: `pnpm test` → 🔴 失敗

#### ステップ4: 実装の拡張

```typescript
// src/lib/markdown/parser.ts
export function parseMarkdown(markdown: string) {
  // 実装...
}
```

**実行**: `pnpm test` → 🟢 成功

#### ステップ5: リファクタリング

コードの改善、最適化を行い、テストが通ることを確認。

### 4.2 TDDのベストプラクティス

1. **小さなステップで進める**: 一度に1つの機能のみ追加
2. **テストを先に書く**: 実装前にテストを書くことで仕様を明確化
3. **最小限の実装**: テストをパスする最小限のコードのみ書く
4. **頻繁にコミット**: 各RED-GREEN-REFACTORサイクルでコミット
5. **テストの可読性**: テストコードも本番コード同様に重要
6. **モックは最小限に**: 可能な限り実際のコードを使用

---

## 5. モック戦略

### 5.1 モック対象

| API/機能 | モック方法 | 理由 |
|---------|-----------|------|
| File System Access API | Vitest Mock | ブラウザAPIのため |
| IndexedDB | fake-indexeddb | 複雑な非同期処理 |
| localStorage | カスタムモック | シンプルな実装 |
| Clipboard API | Vitest Mock | ブラウザAPIのため |
| TipTap Editor | Partial Mock | 複雑すぎるため |
| Web Worker | Vitest Mock | テスト環境未対応 |

### 5.2 モックの実装例

#### File System Access APIのモック

```typescript
// src/test/mocks/fileSystemAPI.ts
import { vi } from 'vitest';

export const mockFileSystemDirectoryHandle = {
  kind: 'directory' as const,
  name: 'test-workspace',
  getFileHandle: vi.fn(),
  getDirectoryHandle: vi.fn(),
  removeEntry: vi.fn(),
  resolve: vi.fn(),
  entries: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  queryPermission: vi.fn().mockResolvedValue('granted'),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  isSameEntry: vi.fn(),
};

export const mockFileSystemFileHandle = {
  kind: 'file' as const,
  name: 'test.md',
  getFile: vi.fn().mockResolvedValue(
    new File(['# Test'], 'test.md', { type: 'text/markdown' })
  ),
  createWritable: vi.fn().mockResolvedValue({
    write: vi.fn(),
    close: vi.fn(),
  }),
  queryPermission: vi.fn().mockResolvedValue('granted'),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  isSameEntry: vi.fn(),
};

export function setupFileSystemMocks() {
  global.window.showDirectoryPicker = vi
    .fn()
    .mockResolvedValue(mockFileSystemDirectoryHandle);
  global.window.showOpenFilePicker = vi
    .fn()
    .mockResolvedValue([mockFileSystemFileHandle]);
  global.window.showSaveFilePicker = vi
    .fn()
    .mockResolvedValue(mockFileSystemFileHandle);
}
```

#### IndexedDBのモック

```typescript
// src/test/mocks/indexedDB.ts
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

export function setupIndexedDBMock() {
  global.indexedDB = new IDBFactory();
}
```

#### TipTap Editorのモック

```typescript
// src/test/mocks/tiptap.ts
import { vi } from 'vitest';

export const mockEditor = {
  commands: {
    setContent: vi.fn(),
    focus: vi.fn(),
    toggleBold: vi.fn(),
    toggleItalic: vi.fn(),
    setHeading: vi.fn(),
  },
  getHTML: vi.fn().mockReturnValue('<p>Test</p>'),
  getJSON: vi.fn().mockReturnValue({ type: 'doc', content: [] }),
  destroy: vi.fn(),
  isActive: vi.fn().mockReturnValue(false),
  can: vi.fn().mockReturnValue({ toggleBold: vi.fn().mockReturnValue(true) }),
  on: vi.fn(),
  off: vi.fn(),
};
```

### 5.3 テストデータ

```typescript
// src/test/fixtures/testData.ts

export const TEST_MARKDOWN = {
  simple: '# Hello World\n\nThis is a test.',
  withBold: 'This is **bold** text.',
  withItalic: 'This is *italic* text.',
  withLink: 'This is [a link](https://example.com).',
  withImage: '![alt text](./image.png)',
  withCode: 'This is `code` inline.',
  withCodeBlock: '```typescript\nconst x = 1;\n```',
  withList: '- Item 1\n- Item 2\n- Item 3',
  complex: `# Heading 1

## Heading 2

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
console.log('Hello');
\`\`\`

![Image](./test.png)
`,
};

export const TEST_FILES = {
  markdownFile: {
    id: 'file-1',
    name: 'test.md',
    path: '/workspace/test.md',
    content: TEST_MARKDOWN.simple,
    type: 'file' as const,
  },
  nestedFile: {
    id: 'file-2',
    name: 'nested.md',
    path: '/workspace/folder/nested.md',
    content: TEST_MARKDOWN.complex,
    type: 'file' as const,
  },
};

export const TEST_WORKSPACE = {
  id: 'workspace-1',
  name: 'Test Workspace',
  path: '/test/workspace',
  createdAt: new Date('2026-01-10'),
  lastOpenedAt: new Date('2026-01-10'),
};
```

---

## 6. カバレッジ目標

### 6.1 グローバル目標

- **ライン カバレッジ**: 85%以上
- **関数 カバレッジ**: 85%以上
- **ブランチ カバレッジ**: 80%以上
- **ステートメント カバレッジ**: 85%以上

### 6.2 モジュール別目標

| モジュール | カバレッジ目標 | 優先度 |
|-----------|---------------|--------|
| `lib/markdown/*` | 95%以上 | 最高 |
| `lib/fileSystem/*` | 90%以上 | 最高 |
| `lib/search/*` | 90%以上 | 高 |
| `lib/utils/*` | 95%以上 | 高 |
| `components/Editor/*` | 85%以上 | 高 |
| `components/Sidebar/*` | 80%以上 | 中 |
| `store/*` | 90%以上 | 高 |
| `hooks/*` | 85%以上 | 高 |

### 6.3 カバレッジレポート

```bash
# カバレッジレポート生成
pnpm test:coverage

# HTMLレポートを開く
open coverage/index.html
```

### 6.4 カバレッジの監視

```typescript
// vitest.config.ts の coverage.thresholds
thresholds: {
  lines: 85,        // これを下回るとテスト失敗
  functions: 85,
  branches: 80,
  statements: 85,
}
```

---

## 7. 継続的インテグレーション

### 7.1 GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run coverage
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload E2E test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  quality-gate:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Check test results
        run: echo "All tests passed!"
```

### 7.2 package.jsonスクリプト

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix"
  }
}
```

### 7.3 Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

---

## 8. テスト実行フロー

### 8.1 開発中

```bash
# ウォッチモードでテスト実行（変更を検知して自動実行）
pnpm test:watch

# UIモードでテスト実行（ブラウザで結果確認）
pnpm test:ui
```

### 8.2 コミット前

```bash
# 型チェック
pnpm type-check

# リンター実行
pnpm lint

# すべてのテスト実行
pnpm test:unit

# カバレッジ確認
pnpm test:coverage
```

### 8.3 プルリクエスト前

```bash
# すべてのチェックを実行
pnpm type-check && pnpm lint && pnpm test:coverage && pnpm test:e2e

# またはCI/CDと同じコマンドを実行
pnpm ci:test  # package.jsonに定義
```

---

## 9. テストのベストプラクティス

### 9.1 良いテストの特徴

✅ **FIRST原則**:
- **F**ast: 高速に実行される
- **I**ndependent: 他のテストに依存しない
- **R**epeatable: 何度実行しても同じ結果
- **S**elf-validating: 自動的に成功/失敗を判定
- **T**imely: 適切なタイミングで書かれる

✅ **AAA パターン**:
```typescript
test('should do something', () => {
  // Arrange（準備）
  const input = 'test';

  // Act（実行）
  const result = doSomething(input);

  // Assert（検証）
  expect(result).toBe('expected');
});
```

✅ **明確なテスト名**:
```typescript
// ❌ 悪い例
test('test1', () => { ... });

// ✅ 良い例
test('should parse markdown heading with level 1', () => { ... });
```

### 9.2 避けるべきアンチパターン

❌ **テストの依存関係**:
```typescript
// ❌ 悪い例
let sharedState;

test('test1', () => {
  sharedState = setup();
});

test('test2', () => {
  // test1に依存している
  expect(sharedState).toBeDefined();
});
```

❌ **実装の詳細をテスト**:
```typescript
// ❌ 悪い例
test('should have state property', () => {
  expect(component.state).toBeDefined();
});

// ✅ 良い例
test('should display loading text', () => {
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

❌ **過度なモック**:
```typescript
// ❌ 悪い例 - すべてをモック
vi.mock('./fileSystem');
vi.mock('./parser');
vi.mock('./validator');

// ✅ 良い例 - 必要最小限のモック
vi.mock('./fileSystem'); // 外部依存のみ
```

### 9.3 テストのメンテナンス

1. **定期的なリファクタリング**: テストコードも本番コード同様にリファクタリング
2. **重複の削除**: ヘルパー関数やフィクスチャの活用
3. **古いテストの削除**: 不要になったテストは削除
4. **ドキュメント化**: 複雑なテストには説明を追加

---

## 10. トラブルシューティング

### 10.1 よくある問題

#### 問題1: テストが遅い

**原因**:
- 過度な非同期処理
- 大量のモックセットアップ
- E2Eテストの実行

**解決策**:
```typescript
// タイムアウトの調整
test('slow operation', async () => {
  // ...
}, 10000); // 10秒

// 並列実行の無効化（必要な場合のみ）
test.sequential('must run in sequence', () => {
  // ...
});
```

#### 問題2: フレーキーなテスト（不安定なテスト）

**原因**:
- タイミングの問題
- 外部依存
- 共有状態

**解決策**:
```typescript
// waitForを使用
import { waitFor } from '@testing-library/react';

test('async operation', async () => {
  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});

// リトライ
test.retry(3)('flaky test', () => {
  // ...
});
```

#### 問題3: モックが動作しない

**解決策**:
```typescript
// モックのクリア
import { vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

// モックの確認
test('mock verification', () => {
  const mockFn = vi.fn();
  mockFn('test');

  expect(mockFn).toHaveBeenCalledWith('test');
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

---

**作成日**: 2026-01-10
**次回更新**: Phase 1完了後
