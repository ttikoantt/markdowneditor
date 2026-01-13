# テストスイートテンプレート集

**作成日**: 2026-01-10
**目的**: TDD実装時にコピー&ペーストですぐに使えるテストテンプレート

---

## 目次

1. [ユニットテストテンプレート](#1-ユニットテストテンプレート)
2. [コンポーネントテストテンプレート](#2-コンポーネントテストテンプレート)
3. [統合テストテンプレート](#3-統合テストテンプレート)
4. [E2Eテストテンプレート](#4-e2eテストテンプレート)
5. [モック・フィクスチャテンプレート](#5-モックフィクスチャテンプレート)

---

## 1. ユニットテストテンプレート

### 1.1 基本的なユニットテストテンプレート

```typescript
// src/lib/[module]/[function].test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { functionName } from './function';

describe('functionName', () => {
  // セットアップ
  beforeEach(() => {
    // テスト前の準備
  });

  // クリーンアップ
  afterEach(() => {
    // テスト後の片付け
  });

  describe('正常系', () => {
    it('should [期待される動作]', () => {
      // Arrange（準備）
      const input = 'test input';

      // Act（実行）
      const result = functionName(input);

      // Assert（検証）
      expect(result).toBe('expected output');
    });
  });

  describe('異常系', () => {
    it('should throw error when [エラー条件]', () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      expect(() => functionName(invalidInput)).toThrow('Error message');
    });
  });

  describe('境界値テスト', () => {
    it('should handle empty input', () => {
      expect(functionName('')).toBe('');
    });

    it('should handle large input', () => {
      const largeInput = 'a'.repeat(10000);
      expect(() => functionName(largeInput)).not.toThrow();
    });
  });
});
```

### 1.2 非同期関数のテストテンプレート

```typescript
// src/lib/[module]/[asyncFunction].test.ts
import { describe, it, expect, vi } from 'vitest';
import { asyncFunction } from './asyncFunction';

describe('asyncFunction', () => {
  it('should resolve with expected value', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await asyncFunction(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should reject with error when [条件]', async () => {
    // Arrange
    const invalidInput = null;

    // Act & Assert
    await expect(asyncFunction(invalidInput)).rejects.toThrow('Error');
  });

  it('should handle timeout', async () => {
    // モックタイマーを使用
    vi.useFakeTimers();

    const promise = asyncFunction('slow');

    // 時間を進める
    await vi.advanceTimersByTimeAsync(5000);

    await expect(promise).resolves.toBeDefined();

    vi.useRealTimers();
  });
});
```

### 1.3 クラスのテストテンプレート

```typescript
// src/lib/[module]/[ClassName].test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ClassName } from './ClassName';

describe('ClassName', () => {
  let instance: ClassName;

  beforeEach(() => {
    instance = new ClassName();
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      expect(instance).toBeInstanceOf(ClassName);
      expect(instance.property).toBeDefined();
    });

    it('should accept initialization options', () => {
      const customInstance = new ClassName({ option: 'value' });
      expect(customInstance.property).toBe('value');
    });
  });

  describe('method', () => {
    it('should [メソッドの機能]', () => {
      const result = instance.method('param');
      expect(result).toBe('expected');
    });

    it('should maintain internal state', () => {
      instance.method('first');
      instance.method('second');

      expect(instance.getState()).toEqual(['first', 'second']);
    });
  });

  describe('private methods (through public API)', () => {
    it('should correctly use internal logic', () => {
      // プライベートメソッドは公開APIを通してテスト
      const result = instance.publicMethodUsingPrivate();
      expect(result).toBe('expected');
    });
  });
});
```

---

## 2. コンポーネントテストテンプレート

### 2.1 基本的なReactコンポーネントテスト

```typescript
// src/components/[ComponentName]/[ComponentName].test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const defaultProps = {
    prop1: 'value1',
    prop2: 'value2',
    onAction: vi.fn(),
  };

  it('should render component', () => {
    render(<ComponentName {...defaultProps} />);

    // テキストの存在確認
    expect(screen.getByText('Expected Text')).toBeInTheDocument();

    // 役割（role）による要素の確認
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display props correctly', () => {
    render(<ComponentName {...defaultProps} prop1="Custom Value" />);

    expect(screen.getByText('Custom Value')).toBeInTheDocument();
  });

  it('should call callback when user interacts', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(<ComponentName {...defaultProps} onAction={mockCallback} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should update when props change', () => {
    const { rerender } = render(<ComponentName {...defaultProps} prop1="Initial" />);

    expect(screen.getByText('Initial')).toBeInTheDocument();

    rerender(<ComponentName {...defaultProps} prop1="Updated" />);

    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.queryByText('Initial')).not.toBeInTheDocument();
  });

  describe('User Interactions', () => {
    it('should handle keyboard input', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');

      expect(input).toHaveValue('Hello');
    });

    it('should handle keyboard shortcuts', async () => {
      const user = userEvent.setup();
      const mockSave = vi.fn();

      render(<ComponentName {...defaultProps} onSave={mockSave} />);

      await user.keyboard('{Control>}s{/Control}');

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ComponentName {...defaultProps} />);

      const element = screen.getByLabelText('Descriptive Label');
      expect(element).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);

      await user.tab();

      const firstElement = screen.getByRole('button');
      expect(firstElement).toHaveFocus();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render loading state', () => {
      render(<ComponentName {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render error state', () => {
      render(<ComponentName {...defaultProps} error="Error message" />);

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
});
```

### 2.2 フックを使うコンポーネントのテスト

```typescript
// src/components/[ComponentName]/[ComponentName].test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

// カスタムフックをモック
vi.mock('@/hooks/useCustomHook', () => ({
  useCustomHook: vi.fn(),
}));

import { useCustomHook } from '@/hooks/useCustomHook';

describe('ComponentName with Hooks', () => {
  const mockHookReturn = {
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useCustomHook).mockReturnValue(mockHookReturn);
  });

  it('should display loading state from hook', () => {
    vi.mocked(useCustomHook).mockReturnValue({
      ...mockHookReturn,
      loading: true,
    });

    render(<ComponentName />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display data from hook', () => {
    vi.mocked(useCustomHook).mockReturnValue({
      ...mockHookReturn,
      data: { value: 'Test Data' },
    });

    render(<ComponentName />);

    expect(screen.getByText('Test Data')).toBeInTheDocument();
  });

  it('should call refetch when button clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();

    vi.mocked(useCustomHook).mockReturnValue({
      ...mockHookReturn,
      refetch: mockRefetch,
    });

    render(<ComponentName />);

    const refetchButton = screen.getByRole('button', { name: /refetch/i });
    await user.click(refetchButton);

    expect(mockRefetch).toHaveBeenCalled();
  });
});
```

### 2.3 コンテキストプロバイダーを使うコンポーネントのテスト

```typescript
// src/components/[ComponentName]/[ComponentName].test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';
import { TestProvider } from '@/test/utils/TestProvider';

// テストプロバイダーラッパー
function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProvider {...options}>{children}</TestProvider>
    ),
  });
}

describe('ComponentName with Context', () => {
  it('should use context values', () => {
    renderWithProviders(<ComponentName />, {
      contextValue: { user: 'Test User' },
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should update when context changes', () => {
    const { rerender } = renderWithProviders(<ComponentName />, {
      contextValue: { count: 0 },
    });

    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(
      <TestProvider contextValue={{ count: 5 }}>
        <ComponentName />
      </TestProvider>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
```

---

## 3. 統合テストテンプレート

### 3.1 複数コンポーネントの統合テスト

```typescript
// src/__tests__/integration/[feature].test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureContainer } from '@/components/Feature/FeatureContainer';
import { setupMocks } from '@/test/utils/setupMocks';

describe('Feature Integration', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('should complete full user flow', async () => {
    const user = userEvent.setup();

    // コンテナコンポーネント（複数の子コンポーネントを含む）をレンダリング
    render(<FeatureContainer />);

    // ステップ1: 初期表示の確認
    expect(screen.getByText('Welcome')).toBeInTheDocument();

    // ステップ2: ユーザー操作
    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    // ステップ3: 非同期処理の完了を待つ
    await waitFor(() => {
      expect(screen.getByText('Process Started')).toBeInTheDocument();
    });

    // ステップ4: 次の操作
    const input = screen.getByRole('textbox');
    await user.type(input, 'Test Input');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // ステップ5: 結果の確認
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('should handle error scenario', async () => {
    const user = userEvent.setup();

    // エラーを発生させるモックを設定
    vi.mocked(apiCall).mockRejectedValue(new Error('API Error'));

    render(<FeatureContainer />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
  });
});
```

### 3.2 状態管理との統合テスト

```typescript
// src/__tests__/integration/store-integration.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppStore } from '@/store';
import { Component } from '@/components/Component';

// ストアのリセット用ヘルパー
function resetStore() {
  useAppStore.getState().reset();
}

describe('Store Integration', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should update store when component action is triggered', async () => {
    const user = userEvent.setup();

    render(<Component />);

    // 初期状態の確認
    expect(useAppStore.getState().value).toBe(0);

    // ユーザー操作
    const button = screen.getByRole('button', { name: /increment/i });
    await user.click(button);

    // ストアが更新されていることを確認
    await waitFor(() => {
      expect(useAppStore.getState().value).toBe(1);
    });

    // UIに反映されていることを確認
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should sync multiple components through store', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Component />
        <AnotherComponent />
      </>
    );

    // 一方のコンポーネントで操作
    const button = screen.getByRole('button', { name: /update/i });
    await user.click(button);

    // もう一方のコンポーネントにも反映されることを確認
    await waitFor(() => {
      expect(screen.getAllByText('Updated')).toHaveLength(2);
    });
  });
});
```

---

## 4. E2Eテストテンプレート

### 4.1 基本的なE2Eテストテンプレート

```typescript
// e2e/[feature].spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前に実行
    await page.goto('/');
  });

  test('should complete basic user flow', async ({ page }) => {
    // ステップ1: ナビゲーション
    await page.goto('/feature');

    // ステップ2: ページの表示確認
    await expect(page.getByRole('heading', { name: /feature/i })).toBeVisible();

    // ステップ3: フォーム入力
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');

    // ステップ4: 送信
    await page.getByRole('button', { name: /submit/i }).click();

    // ステップ5: 結果の確認
    await expect(page.getByText('Success')).toBeVisible();

    // ステップ6: URLの確認
    await expect(page).toHaveURL('/success');
  });

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/feature');

    // 無効なデータで送信
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByRole('button', { name: /submit/i }).click();

    // エラーメッセージの確認
    await expect(page.getByText('Invalid email')).toBeVisible();

    // フォームがまだ表示されていることを確認
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('should persist data across page reload', async ({ page }) => {
    await page.goto('/feature');

    // データを入力
    await page.getByLabel('Name').fill('Persistent User');

    // ページをリロード
    await page.reload();

    // データが保持されていることを確認
    await expect(page.getByLabel('Name')).toHaveValue('Persistent User');
  });
});
```

### 4.2 複雑なE2Eフローのテンプレート

```typescript
// e2e/complex-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complex User Flow', () => {
  test('should complete multi-step process', async ({ page }) => {
    // ステップ1: ログイン
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/dashboard');

    // ステップ2: ダッシュボードでアクション
    await page.getByRole('button', { name: /create new/i }).click();

    // ステップ3: モーダルでフォーム入力
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal.getByLabel('Title').fill('New Item');
    await modal.getByLabel('Description').fill('This is a test item');
    await modal.getByRole('button', { name: /save/i }).click();

    // ステップ4: モーダルが閉じることを確認
    await expect(modal).not.toBeVisible();

    // ステップ5: 新しいアイテムが表示されることを確認
    await expect(page.getByText('New Item')).toBeVisible();

    // ステップ6: アイテムをクリックして詳細表示
    await page.getByText('New Item').click();

    await expect(page).toHaveURL(/\/items\/\d+/);
    await expect(page.getByText('This is a test item')).toBeVisible();

    // ステップ7: 編集
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel('Title').fill('Updated Item');
    await page.getByRole('button', { name: /save/i }).click();

    // ステップ8: 更新が反映されることを確認
    await expect(page.getByText('Updated Item')).toBeVisible();
    await expect(page.getByText('Successfully updated')).toBeVisible();
  });

  test('should handle concurrent actions', async ({ page, context }) => {
    // 複数タブでの同時操作をテスト
    await page.goto('/dashboard');

    // 新しいタブを開く
    const page2 = await context.newPage();
    await page2.goto('/dashboard');

    // 両方のタブで操作
    await page.getByRole('button', { name: /action/i }).click();
    await page2.getByRole('button', { name: /action/i }).click();

    // 両方のタブで結果を確認
    await expect(page.getByText('Success')).toBeVisible();
    await expect(page2.getByText('Success')).toBeVisible();
  });
});
```

### 4.3 ファイルアップロードのE2Eテスト

```typescript
// e2e/file-upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('File Upload', () => {
  test('should upload file successfully', async ({ page }) => {
    await page.goto('/upload');

    // ファイル選択
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures', 'test-file.md')
    );

    // アップロードボタンをクリック
    await page.getByRole('button', { name: /upload/i }).click();

    // アップロード成功の確認
    await expect(page.getByText('File uploaded successfully')).toBeVisible();

    // ファイル名が表示されることを確認
    await expect(page.getByText('test-file.md')).toBeVisible();
  });

  test('should handle drag and drop', async ({ page }) => {
    await page.goto('/upload');

    // ドロップゾーンを取得
    const dropZone = page.getByTestId('drop-zone');

    // ファイルをドラッグ&ドロップ
    const buffer = await page.request
      .get(path.join(__dirname, 'fixtures', 'test-file.md'))
      .then((r) => r.body());

    await dropZone.dispatchEvent('drop', {
      dataTransfer: {
        files: [
          {
            name: 'test-file.md',
            type: 'text/markdown',
            buffer,
          },
        ],
      },
    });

    // ファイルが追加されたことを確認
    await expect(page.getByText('test-file.md')).toBeVisible();
  });
});
```

---

## 5. モック・フィクスチャテンプレート

### 5.1 API モックテンプレート

```typescript
// src/test/mocks/api.ts
import { vi } from 'vitest';

export const mockApiResponse = {
  success: {
    data: { id: 1, name: 'Test' },
    status: 200,
    statusText: 'OK',
  },
  error: {
    data: null,
    status: 500,
    statusText: 'Internal Server Error',
  },
};

export function setupApiMocks() {
  global.fetch = vi.fn((url: string) => {
    if (url.includes('/api/success')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockApiResponse.success.data,
      } as Response);
    }

    if (url.includes('/api/error')) {
      return Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as Response);
    }

    return Promise.reject(new Error('Not Found'));
  });
}

export function clearApiMocks() {
  vi.clearAllMocks();
}
```

### 5.2 テストフィクスチャテンプレート

```typescript
// src/test/fixtures/[entity].ts

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date('2026-01-01'),
};

export const mockWorkspace = {
  id: 'workspace-1',
  name: 'Test Workspace',
  path: '/test/workspace',
  files: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-10'),
};

export const mockFile = {
  id: 'file-1',
  name: 'test.md',
  path: '/workspace/test.md',
  content: '# Test\n\nThis is a test file.',
  size: 100,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-10'),
};

// ファクトリー関数
export function createMockFile(overrides = {}) {
  return {
    ...mockFile,
    ...overrides,
    id: `file-${Math.random()}`,
  };
}

export function createMockWorkspace(overrides = {}) {
  return {
    ...mockWorkspace,
    ...overrides,
    id: `workspace-${Math.random()}`,
  };
}
```

### 5.3 テストユーティリティテンプレート

```typescript
// src/test/utils/testUtils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// すべてのプロバイダーをラップするカスタムレンダー
function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* 他のプロバイダーをここに追加 */}
      {children}
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// 便利なヘルパー関数
export function waitForLoadingToFinish() {
  return screen.findByText((content, element) => {
    return element?.tagName.toLowerCase() === 'div' && content === '';
  });
}

export async function fillForm(fields: Record<string, string>) {
  const user = userEvent.setup();

  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(new RegExp(label, 'i'));
    await user.clear(input);
    await user.type(input, value);
  }
}

// エクスポート
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
```

---

## 6. TDD実装チェックリスト

実装開始前にこのチェックリストを確認してください。

### 実装前

- [ ] テストファイルを作成（`*.test.ts` or `*.test.tsx`）
- [ ] 必要なモック・フィクスチャを準備
- [ ] テストケースのリストを作成
- [ ] 優先順位を決定（高→中→低）

### TDDサイクル

各機能について以下を繰り返す：

#### 🔴 RED（テストを書く）
- [ ] 期待される動作をテストコードで記述
- [ ] テストを実行して失敗することを確認
- [ ] 失敗理由が期待通りか確認（実装が無いため失敗）

#### 🟢 GREEN（実装する）
- [ ] テストをパスする最小限のコードを実装
- [ ] テストを実行して成功することを確認
- [ ] すべてのテストが通ることを確認

#### 🔵 REFACTOR（リファクタリング）
- [ ] コードの重複を削除
- [ ] 可読性を向上
- [ ] パフォーマンスを最適化
- [ ] テストが全て通ることを再確認

### 実装後

- [ ] カバレッジを確認（`pnpm test:coverage`）
- [ ] 目標カバレッジ（85%）を達成しているか確認
- [ ] リンターとフォーマッターを実行
- [ ] コミット前にすべてのテストを実行
- [ ] コードレビューの準備

---

## 7. よく使うコマンド一覧

```bash
# テストの実行
pnpm test                    # すべてのテスト
pnpm test:watch             # ウォッチモード
pnpm test:ui                # UIモード
pnpm test:coverage          # カバレッジ付き実行

# 特定のテストのみ実行
pnpm test path/to/test.test.ts
pnpm test --grep "test name"

# E2Eテスト
pnpm test:e2e               # すべてのE2E
pnpm test:e2e:ui            # UIモード
pnpm test:e2e:debug         # デバッグモード

# カバレッジ
pnpm test:coverage          # カバレッジ生成
open coverage/index.html    # カバレッジレポート表示

# 型チェックとリント
pnpm type-check             # 型チェック
pnpm lint                   # リンター実行
pnpm lint:fix               # 自動修正
```

---

**作成日**: 2026-01-10
**更新**: 実装中に随時アップデート
