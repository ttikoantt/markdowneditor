# 詳細テストケース仕様

**作成日**: 2026-01-10
**バージョン**: 1.0

---

## 目次

1. [ユニットテスト](#1-ユニットテスト)
2. [コンポーネントテスト](#2-コンポーネントテスト)
3. [統合テスト](#3-統合テスト)
4. [E2Eテスト](#4-e2eテスト)

---

## 1. ユニットテスト

### 1.1 マークダウンパーサー (`lib/markdown/parser.ts`)

#### テストスイート: `parseMarkdown()`

| # | テストケース | 入力 | 期待される出力 | 優先度 |
|---|------------|------|--------------|--------|
| 1.1.1 | 見出しレベル1のパース | `"# Hello"` | `{ type: 'heading', level: 1, text: 'Hello' }` | 高 |
| 1.1.2 | 見出しレベル2-6のパース | `"## H2"`, `"### H3"`, ... | 各レベルに対応したオブジェクト | 高 |
| 1.1.3 | 太字テキストのパース | `"**bold**"` | `{ type: 'bold', text: 'bold' }` | 高 |
| 1.1.4 | 斜体テキストのパース | `"*italic*"` | `{ type: 'italic', text: 'italic' }` | 高 |
| 1.1.5 | 取り消し線のパース | `"~~strike~~"` | `{ type: 'strike', text: 'strike' }` | 中 |
| 1.1.6 | リンクのパース | `"[text](url)"` | `{ type: 'link', text: 'text', url: 'url' }` | 高 |
| 1.1.7 | 画像のパース | `"![alt](url)"` | `{ type: 'image', alt: 'alt', url: 'url' }` | 高 |
| 1.1.8 | コードブロックのパース | ` ```js\ncode\n``` ` | `{ type: 'codeBlock', lang: 'js', code: 'code' }` | 高 |
| 1.1.9 | インラインコードのパース | `` `code` `` | `{ type: 'inlineCode', code: 'code' }` | 高 |
| 1.1.10 | 箇条書きリストのパース | `"- item1\n- item2"` | `{ type: 'list', items: [...] }` | 高 |
| 1.1.11 | 番号付きリストのパース | `"1. item1\n2. item2"` | `{ type: 'orderedList', items: [...] }` | 高 |
| 1.1.12 | チェックボックスのパース | `"- [ ] todo\n- [x] done"` | タスクリストオブジェクト | 中 |
| 1.1.13 | テーブルのパース | マークダウンテーブル | テーブルオブジェクト | 中 |
| 1.1.14 | 引用のパース | `"> quote"` | `{ type: 'blockquote', text: 'quote' }` | 中 |
| 1.1.15 | 水平線のパース | `"---"` | `{ type: 'hr' }` | 低 |
| 1.1.16 | 複数要素の混在 | 複合マークダウン | 複数のオブジェクト配列 | 高 |
| 1.1.17 | 空文字列の処理 | `""` | `null` or `[]` | 中 |
| 1.1.18 | 不正なマークダウン | `"#no space"` | エラーまたは通常テキスト | 中 |
| 1.1.19 | エスケープ文字の処理 | `"\\*not italic\\*"` | エスケープが反映された結果 | 中 |
| 1.1.20 | UTF-8文字の処理 | `"# こんにちは"` | 正しくパース | 高 |

**テストコード例**:
```typescript
// src/lib/markdown/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './parser';

describe('parseMarkdown', () => {
  describe('Headings', () => {
    it('should parse heading level 1', () => {
      const result = parseMarkdown('# Hello');
      expect(result).toMatchObject({
        type: 'heading',
        level: 1,
        text: 'Hello',
      });
    });

    it('should parse heading levels 2-6', () => {
      const levels = [2, 3, 4, 5, 6];
      levels.forEach((level) => {
        const markdown = '#'.repeat(level) + ' Heading';
        const result = parseMarkdown(markdown);
        expect(result).toMatchObject({
          type: 'heading',
          level,
        });
      });
    });
  });

  describe('Text formatting', () => {
    it('should parse bold text', () => {
      const result = parseMarkdown('**bold**');
      expect(result).toMatchObject({
        type: 'bold',
        text: 'bold',
      });
    });

    it('should parse italic text', () => {
      const result = parseMarkdown('*italic*');
      expect(result).toMatchObject({
        type: 'italic',
        text: 'italic',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const result = parseMarkdown('');
      expect(result).toEqual([]);
    });

    it('should handle invalid markdown', () => {
      const result = parseMarkdown('#no space');
      expect(result).toBeDefined();
    });

    it('should handle UTF-8 characters', () => {
      const result = parseMarkdown('# こんにちは');
      expect(result).toMatchObject({
        type: 'heading',
        text: 'こんにちは',
      });
    });
  });
});
```

---

### 1.2 マークダウンシリアライザー (`lib/markdown/serializer.ts`)

#### テストスイート: `serializeToMarkdown()`

| # | テストケース | 入力 | 期待される出力 | 優先度 |
|---|------------|------|--------------|--------|
| 1.2.1 | 見出しのシリアライズ | `{ type: 'heading', level: 1, text: 'Hello' }` | `"# Hello"` | 高 |
| 1.2.2 | 太字のシリアライズ | `{ type: 'bold', text: 'bold' }` | `"**bold**"` | 高 |
| 1.2.3 | 斜体のシリアライズ | `{ type: 'italic', text: 'italic' }` | `"*italic*"` | 高 |
| 1.2.4 | リンクのシリアライズ | `{ type: 'link', text: 'text', url: 'url' }` | `"[text](url)"` | 高 |
| 1.2.5 | 画像のシリアライズ | `{ type: 'image', alt: 'alt', url: 'url' }` | `"![alt](url)"` | 高 |
| 1.2.6 | コードブロックのシリアライズ | コードブロックオブジェクト | ` ```lang\ncode\n``` ` | 高 |
| 1.2.7 | リストのシリアライズ | リストオブジェクト | `"- item1\n- item2"` | 高 |
| 1.2.8 | 複数要素のシリアライズ | 複数オブジェクト配列 | 完全なマークダウン | 高 |
| 1.2.9 | 空配列の処理 | `[]` | `""` | 中 |
| 1.2.10 | null/undefined の処理 | `null` | `""` or エラー | 中 |
| 1.2.11 | パース→シリアライズの往復 | 任意のマークダウン | 元のマークダウンと同等 | 高 |

**テストコード例**:
```typescript
// src/lib/markdown/serializer.test.ts
import { describe, it, expect } from 'vitest';
import { serializeToMarkdown } from './serializer';
import { parseMarkdown } from './parser';

describe('serializeToMarkdown', () => {
  it('should serialize heading', () => {
    const ast = { type: 'heading', level: 1, text: 'Hello' };
    const result = serializeToMarkdown(ast);
    expect(result).toBe('# Hello');
  });

  it('should serialize bold text', () => {
    const ast = { type: 'bold', text: 'bold' };
    const result = serializeToMarkdown(ast);
    expect(result).toBe('**bold**');
  });

  describe('Round-trip conversion', () => {
    const testCases = [
      '# Heading',
      '**bold** and *italic*',
      '[link](https://example.com)',
      '- item1\n- item2',
      '```js\nconst x = 1;\n```',
    ];

    testCases.forEach((markdown) => {
      it(`should maintain: ${markdown}`, () => {
        const ast = parseMarkdown(markdown);
        const result = serializeToMarkdown(ast);
        expect(result.trim()).toBe(markdown.trim());
      });
    });
  });
});
```

---

### 1.3 File System API (`lib/fileSystem/fileSystemAPI.ts`)

#### テストスイート: `FileSystemAPI`

| # | テストケース | 入力 | 期待される動作 | 優先度 |
|---|------------|------|--------------|--------|
| 1.3.1 | ディレクトリ選択 | ユーザー選択 | `FileSystemDirectoryHandle` を返す | 高 |
| 1.3.2 | ディレクトリ選択キャンセル | ユーザーキャンセル | `null` を返す | 高 |
| 1.3.3 | ファイル読み込み成功 | 有効な `FileHandle` | ファイル内容の文字列を返す | 高 |
| 1.3.4 | ファイル読み込み失敗 | 無効な `FileHandle` | エラーをスロー | 高 |
| 1.3.5 | ファイル書き込み成功 | 内容 + `FileHandle` | 正常に書き込み完了 | 高 |
| 1.3.6 | ファイル書き込み失敗 | 権限なし | エラーをスロー | 高 |
| 1.3.7 | ファイル作成 | ファイル名 | 新しい `FileHandle` を返す | 高 |
| 1.3.8 | ファイル削除 | ファイル名 | 正常に削除完了 | 高 |
| 1.3.9 | ディレクトリ一覧取得 | `DirectoryHandle` | `FileNode[]` を返す | 高 |
| 1.3.10 | 権限確認（許可済み） | `Handle` | `true` を返す | 高 |
| 1.3.11 | 権限確認（未許可） | `Handle` | `false` を返す | 高 |
| 1.3.12 | 権限リクエスト成功 | ユーザー許可 | `true` を返す | 高 |
| 1.3.13 | 権限リクエスト拒否 | ユーザー拒否 | `false` を返す | 高 |
| 1.3.14 | 大きなファイルの読み込み | 10MB+ファイル | 正常に読み込み | 中 |
| 1.3.15 | UTF-8以外のエンコーディング | Shift-JISファイル | 適切に処理またはエラー | 低 |

**テストコード例**:
```typescript
// src/lib/fileSystem/fileSystemAPI.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileSystemAPI } from './fileSystemAPI';
import {
  mockFileSystemDirectoryHandle,
  mockFileSystemFileHandle,
} from '@/test/mocks/fileSystemAPI';

describe('FileSystemAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('selectDirectory', () => {
    it('should return directory handle on success', async () => {
      global.window.showDirectoryPicker = vi
        .fn()
        .mockResolvedValue(mockFileSystemDirectoryHandle);

      const result = await FileSystemAPI.selectDirectory();

      expect(result).toBe(mockFileSystemDirectoryHandle);
      expect(window.showDirectoryPicker).toHaveBeenCalledWith({
        mode: 'readwrite',
        startIn: 'documents',
      });
    });

    it('should return null on user cancel', async () => {
      global.window.showDirectoryPicker = vi
        .fn()
        .mockRejectedValue(new DOMException('User cancelled', 'AbortError'));

      const result = await FileSystemAPI.selectDirectory();

      expect(result).toBeNull();
    });

    it('should throw on other errors', async () => {
      global.window.showDirectoryPicker = vi
        .fn()
        .mockRejectedValue(new Error('Unknown error'));

      await expect(FileSystemAPI.selectDirectory()).rejects.toThrow(
        'Unknown error'
      );
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const mockFile = new File(['# Test'], 'test.md');
      mockFileSystemFileHandle.getFile.mockResolvedValue(mockFile);

      const result = await FileSystemAPI.readFile(mockFileSystemFileHandle);

      expect(result).toBe('# Test');
    });

    it('should handle large files', async () => {
      const largeContent = 'a'.repeat(10 * 1024 * 1024); // 10MB
      const mockFile = new File([largeContent], 'large.md');
      mockFileSystemFileHandle.getFile.mockResolvedValue(mockFile);

      const result = await FileSystemAPI.readFile(mockFileSystemFileHandle);

      expect(result).toBe(largeContent);
    });
  });

  describe('writeFile', () => {
    it('should write file content', async () => {
      const mockWritable = {
        write: vi.fn(),
        close: vi.fn(),
      };
      mockFileSystemFileHandle.createWritable.mockResolvedValue(mockWritable);

      await FileSystemAPI.writeFile(mockFileSystemFileHandle, '# New Content');

      expect(mockWritable.write).toHaveBeenCalledWith('# New Content');
      expect(mockWritable.close).toHaveBeenCalled();
    });
  });

  describe('verifyPermission', () => {
    it('should return true if permission already granted', async () => {
      mockFileSystemFileHandle.queryPermission.mockResolvedValue('granted');

      const result = await FileSystemAPI.verifyPermission(
        mockFileSystemFileHandle
      );

      expect(result).toBe(true);
      expect(mockFileSystemFileHandle.requestPermission).not.toHaveBeenCalled();
    });

    it('should request permission if not granted', async () => {
      mockFileSystemFileHandle.queryPermission.mockResolvedValue('prompt');
      mockFileSystemFileHandle.requestPermission.mockResolvedValue('granted');

      const result = await FileSystemAPI.verifyPermission(
        mockFileSystemFileHandle
      );

      expect(result).toBe(true);
      expect(mockFileSystemFileHandle.requestPermission).toHaveBeenCalled();
    });

    it('should return false if permission denied', async () => {
      mockFileSystemFileHandle.queryPermission.mockResolvedValue('denied');
      mockFileSystemFileHandle.requestPermission.mockResolvedValue('denied');

      const result = await FileSystemAPI.verifyPermission(
        mockFileSystemFileHandle
      );

      expect(result).toBe(false);
    });
  });
});
```

---

### 1.4 バリデーター (`lib/utils/validators.ts`)

#### テストスイート: `Validators`

| # | テストケース | 入力 | 期待される出力 | 優先度 |
|---|------------|------|--------------|--------|
| 1.4.1 | 有効なファイル名 | `"test.md"` | `true` | 高 |
| 1.4.2 | 空のファイル名 | `""` | `false` | 高 |
| 1.4.3 | 不正文字を含むファイル名 | `"test/file.md"` | `false` | 高 |
| 1.4.4 | Windowsで予約されたファイル名 | `"CON.md"` | `false` | 中 |
| 1.4.5 | マークダウンファイルの判定 | `"test.md"` | `true` | 高 |
| 1.4.6 | マークダウンファイルの判定 | `"test.markdown"` | `true` | 高 |
| 1.4.7 | 非マークダウンファイルの判定 | `"test.txt"` | `false` | 高 |
| 1.4.8 | HTMLエスケープ | `"<script>"` | `"&lt;script&gt;"` | 高 |
| 1.4.9 | HTMLエスケープ（既にエスケープ済み） | `"&lt;div&gt;"` | `"&amp;lt;div&amp;gt;"` | 中 |
| 1.4.10 | 長いファイル名 | 255文字のファイル名 | 適切に処理 | 低 |

**テストコード例**:
```typescript
// src/lib/utils/validators.test.ts
import { describe, it, expect } from 'vitest';
import { Validators } from './validators';

describe('Validators', () => {
  describe('isValidFileName', () => {
    it('should accept valid file name', () => {
      expect(Validators.isValidFileName('test.md')).toBe(true);
      expect(Validators.isValidFileName('my-file_123.md')).toBe(true);
    });

    it('should reject empty file name', () => {
      expect(Validators.isValidFileName('')).toBe(false);
    });

    it('should reject file name with invalid characters', () => {
      const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
      invalidChars.forEach((char) => {
        expect(Validators.isValidFileName(`test${char}file.md`)).toBe(false);
      });
    });

    it('should reject reserved Windows file names', () => {
      const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1'];
      reserved.forEach((name) => {
        expect(Validators.isValidFileName(`${name}.md`)).toBe(false);
      });
    });
  });

  describe('isMarkdownFile', () => {
    it('should recognize .md extension', () => {
      expect(Validators.isMarkdownFile('test.md')).toBe(true);
    });

    it('should recognize .markdown extension', () => {
      expect(Validators.isMarkdownFile('test.markdown')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(Validators.isMarkdownFile('test.MD')).toBe(true);
      expect(Validators.isMarkdownFile('test.Markdown')).toBe(true);
    });

    it('should reject non-markdown files', () => {
      expect(Validators.isMarkdownFile('test.txt')).toBe(false);
      expect(Validators.isMarkdownFile('test.html')).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(Validators.escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(Validators.escapeHtml('A & B')).toBe('A &amp; B');
      expect(Validators.escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    });

    it('should handle already escaped HTML', () => {
      const escaped = Validators.escapeHtml('&lt;div&gt;');
      expect(escaped).toBe('&amp;lt;div&amp;gt;');
    });

    it('should handle empty string', () => {
      expect(Validators.escapeHtml('')).toBe('');
    });
  });
});
```

---

### 1.5 検索エンジン (`lib/search/searchEngine.ts`)

#### テストスイート: `SearchEngine`

| # | テストケース | 入力 | 期待される動作 | 優先度 |
|---|------------|------|--------------|--------|
| 1.5.1 | インデックス構築 | ファイル配列 | インデックス正常作成 | 高 |
| 1.5.2 | 単純な検索 | "test" | マッチするファイルを返す | 高 |
| 1.5.3 | 大文字小文字を区別しない検索 | "TEST" | マッチするファイルを返す | 高 |
| 1.5.4 | 部分一致検索 | "hel" (→ "hello") | マッチするファイルを返す | 高 |
| 1.5.5 | ファイル名での検索 | ファイル名のキーワード | ファイル名マッチを返す | 高 |
| 1.5.6 | コンテンツでの検索 | コンテンツのキーワード | コンテンツマッチを返す | 高 |
| 1.5.7 | 空のクエリ | "" | 空配列を返す | 中 |
| 1.5.8 | マッチなしの検索 | "xyz123" | 空配列を返す | 中 |
| 1.5.9 | 検索結果のスコアリング | 複数マッチ | スコア順にソート | 中 |
| 1.5.10 | ファイルの追加 | 新しいファイル | インデックス更新 | 高 |
| 1.5.11 | ファイルの更新 | 既存ファイル | インデックス更新 | 高 |
| 1.5.12 | ファイルの削除 | ファイルID | インデックスから削除 | 高 |
| 1.5.13 | 大規模データセット | 10,000ファイル | 許容可能な速度で検索 | 中 |
| 1.5.14 | 特殊文字の検索 | "#heading" | 正しくマッチ | 低 |
| 1.5.15 | 日本語の検索 | "検索" | 正しくマッチ | 中 |

**テストコード例**:
```typescript
// src/lib/search/searchEngine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine } from './searchEngine';

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;
  const testFiles = [
    {
      id: '1',
      path: '/test1.md',
      name: 'test1.md',
      content: 'Hello world',
      metadata: { size: 100, modified: Date.now() },
    },
    {
      id: '2',
      path: '/test2.md',
      name: 'test2.md',
      content: 'Goodbye world',
      metadata: { size: 200, modified: Date.now() },
    },
  ];

  beforeEach(async () => {
    searchEngine = new SearchEngine();
    await searchEngine.buildIndex(testFiles);
  });

  describe('buildIndex', () => {
    it('should build search index', async () => {
      const engine = new SearchEngine();
      await engine.buildIndex(testFiles);

      const results = engine.search('world');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('search', () => {
    it('should find matching files', () => {
      const results = searchEngine.search('hello');
      expect(results).toHaveLength(1);
      expect(results[0].file.id).toBe('1');
    });

    it('should be case insensitive', () => {
      const results = searchEngine.search('HELLO');
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', () => {
      const results = searchEngine.search('xyz123');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const results = searchEngine.search('');
      expect(results).toEqual([]);
    });

    it('should search in file names', () => {
      const results = searchEngine.search('test1');
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('test1.md');
    });

    it('should search in content', () => {
      const results = searchEngine.search('goodbye');
      expect(results).toHaveLength(1);
      expect(results[0].file.content).toContain('Goodbye');
    });

    it('should rank results by score', () => {
      const results = searchEngine.search('world');
      expect(results).toHaveLength(2);
      // スコアでソートされていることを確認
      expect(results[0].score).toBeLessThanOrEqual(results[1].score);
    });
  });

  describe('updateFile', () => {
    it('should update existing file in index', async () => {
      const updatedFile = {
        ...testFiles[0],
        content: 'Updated content',
      };

      await searchEngine.updateFile(updatedFile);

      const results = searchEngine.search('updated');
      expect(results).toHaveLength(1);
      expect(results[0].file.content).toBe('Updated content');
    });

    it('should add new file to index', async () => {
      const newFile = {
        id: '3',
        path: '/new.md',
        name: 'new.md',
        content: 'New file content',
        metadata: { size: 100, modified: Date.now() },
      };

      await searchEngine.updateFile(newFile);

      const results = searchEngine.search('new');
      expect(results).toHaveLength(1);
    });
  });

  describe('removeFile', () => {
    it('should remove file from index', async () => {
      await searchEngine.removeFile('1');

      const results = searchEngine.search('hello');
      expect(results).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should handle large dataset', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `file-${i}`,
        path: `/file-${i}.md`,
        name: `file-${i}.md`,
        content: `Content ${i}`,
        metadata: { size: 100, modified: Date.now() },
      }));

      const startTime = Date.now();
      await searchEngine.buildIndex(largeDataset);
      const buildTime = Date.now() - startTime;

      expect(buildTime).toBeLessThan(5000); // 5秒以内

      const searchStart = Date.now();
      searchEngine.search('Content');
      const searchTime = Date.now() - searchStart;

      expect(searchTime).toBeLessThan(500); // 500ms以内
    });
  });
});
```

---

### 1.6 画像最適化 (`lib/utils/imageOptimizer.ts`)

#### テストスイート: `ImageOptimizer`

| # | テストケース | 入力 | 期待される動作 | 優先度 |
|---|------------|------|--------------|--------|
| 1.6.1 | 画像リサイズ | 大きな画像 | 指定サイズにリサイズ | 高 |
| 1.6.2 | アスペクト比の維持 | 任意の画像 | アスペクト比が保持 | 高 |
| 1.6.3 | 品質の調整 | 画像 + 品質設定 | 指定品質で圧縮 | 中 |
| 1.6.4 | サイズより小さい画像 | 小さい画像 | そのままのサイズ | 中 |
| 1.6.5 | 不正な画像ファイル | 壊れた画像 | エラーをスロー | 高 |
| 1.6.6 | クリップボードから画像取得 | クリップボードに画像 | `File` オブジェクトを返す | 高 |
| 1.6.7 | クリップボードに画像なし | クリップボードに画像なし | `null` を返す | 中 |
| 1.6.8 | ワークスペースへの保存 | 画像 + ディレクトリ | 正常に保存、パスを返す | 高 |
| 1.6.9 | 保存パスの生成 | ファイル名 | `./assets/filename` を返す | 中 |
| 1.6.10 | 同名ファイルの上書き | 既存ファイル名 | 確認またはリネーム | 低 |

**テストコード例**:
```typescript
// src/lib/utils/imageOptimizer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageOptimizer } from './imageOptimizer';
import { setupFileSystemMocks } from '@/test/mocks/fileSystemAPI';

describe('ImageOptimizer', () => {
  beforeEach(() => {
    setupFileSystemMocks();
  });

  describe('optimizeImage', () => {
    it('should resize large image', async () => {
      // テスト用の画像ファイルを作成
      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 2000;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const file = new File([blob], 'large.png', { type: 'image/png' });

      const optimized = await ImageOptimizer.optimizeImage(
        file,
        1920,
        1080,
        0.85
      );

      expect(optimized.size).toBeLessThan(file.size);
    });

    it('should maintain aspect ratio', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1000; // 2:1 ratio

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const file = new File([blob], 'test.png', { type: 'image/png' });

      const optimized = await ImageOptimizer.optimizeImage(file, 1000, 1000);

      // アスペクト比が保持されていることを確認
      const img = new Image();
      const url = URL.createObjectURL(optimized);
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });

      expect(img.width / img.height).toBeCloseTo(2, 1);
    });

    it('should handle corrupted image', async () => {
      const file = new File(['not an image'], 'fake.png', {
        type: 'image/png',
      });

      await expect(
        ImageOptimizer.optimizeImage(file)
      ).rejects.toThrow('Failed to load image');
    });
  });

  describe('getImageFromClipboard', () => {
    it('should get image from clipboard', async () => {
      const mockBlob = new Blob(['image data'], { type: 'image/png' });
      const mockClipboardItem = {
        types: ['image/png'],
        getType: vi.fn().mockResolvedValue(mockBlob),
      };

      navigator.clipboard.read = vi
        .fn()
        .mockResolvedValue([mockClipboardItem]);

      const result = await ImageOptimizer.getImageFromClipboard();

      expect(result).toBeInstanceOf(File);
      expect(result?.type).toBe('image/png');
    });

    it('should return null when no image in clipboard', async () => {
      const mockClipboardItem = {
        types: ['text/plain'],
        getType: vi.fn(),
      };

      navigator.clipboard.read = vi
        .fn()
        .mockResolvedValue([mockClipboardItem]);

      const result = await ImageOptimizer.getImageFromClipboard();

      expect(result).toBeNull();
    });
  });

  describe('saveImageToWorkspace', () => {
    it('should save image and return path', async () => {
      const mockBlob = new Blob(['image'], { type: 'image/png' });
      const mockDirectoryHandle = {
        getDirectoryHandle: vi.fn().mockResolvedValue({
          getFileHandle: vi.fn().mockResolvedValue({
            createWritable: vi.fn().mockResolvedValue({
              write: vi.fn(),
              close: vi.fn(),
            }),
          }),
        }),
      };

      const path = await ImageOptimizer.saveImageToWorkspace(
        mockDirectoryHandle as any,
        mockBlob,
        'test.png'
      );

      expect(path).toBe('./assets/test.png');
      expect(mockDirectoryHandle.getDirectoryHandle).toHaveBeenCalledWith(
        'assets',
        { create: true }
      );
    });
  });
});
```

---

## 2. コンポーネントテスト

### 2.1 エディターコンポーネント (`components/Editor/Editor.tsx`)

#### テストスイート: `<Editor />`

| # | テストケース | アクション | 期待される動作 | 優先度 |
|---|------------|----------|--------------|--------|
| 2.1.1 | コンポーネントのレンダリング | 初期表示 | エディターが表示される | 高 |
| 2.1.2 | 初期コンテンツの設定 | `initialContent` プロップ | コンテンツが表示される | 高 |
| 2.1.3 | テキスト入力 | ユーザーがテキスト入力 | `onContentChange` が呼ばれる | 高 |
| 2.1.4 | 太字の適用 | 太字ボタンクリック | テキストが太字になる | 高 |
| 2.1.5 | 斜体の適用 | 斜体ボタンクリック | テキストが斜体になる | 高 |
| 2.1.6 | 見出しの適用 | 見出しボタンクリック | 見出しが適用される | 高 |
| 2.1.7 | リンクの挿入 | リンクボタンクリック | リンクダイアログ表示 | 中 |
| 2.1.8 | 画像の挿入 | 画像ボタンクリック | 画像挿入ダイアログ表示 | 中 |
| 2.1.9 | Ctrl+S で保存 | Ctrl+S キー押下 | `onSave` が呼ばれる | 高 |
| 2.1.10 | Ctrl+B で太字 | Ctrl+B キー押下 | 選択テキストが太字 | 中 |
| 2.1.11 | Ctrl+I で斜体 | Ctrl+I キー押下 | 選択テキストが斜体 | 中 |
| 2.1.12 | Undo/Redo | Ctrl+Z, Ctrl+Y | 操作を元に戻す/やり直す | 中 |
| 2.1.13 | マークダウンのプレビュー | プレビュー切り替え | マークダウンが表示される | 低 |
| 2.1.14 | アクセシビリティ | キーボードナビゲーション | フォーカス移動が正常 | 中 |
| 2.1.15 | エラー状態の表示 | エラー発生 | エラーメッセージ表示 | 中 |

**テストコード例**:
```typescript
// src/components/Editor/Editor.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from './Editor';

describe('Editor', () => {
  const mockOnContentChange = vi.fn();
  const mockOnSave = vi.fn();

  const defaultProps = {
    fileId: 'test-file',
    initialContent: '',
    onContentChange: mockOnContentChange,
    onSave: mockOnSave,
  };

  it('should render editor', () => {
    render(<Editor {...defaultProps} />);

    const editor = screen.getByRole('textbox', { name: /editor/i });
    expect(editor).toBeInTheDocument();
  });

  it('should display initial content', () => {
    render(<Editor {...defaultProps} initialContent="# Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should call onContentChange when text is typed', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);

    const editor = screen.getByRole('textbox');
    await user.type(editor, 'New text');

    expect(mockOnContentChange).toHaveBeenCalled();
  });

  it('should apply bold formatting', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} initialContent="test" />);

    // テキストを選択
    const editor = screen.getByRole('textbox');
    await user.tripleClick(editor);

    // 太字ボタンをクリック
    const boldButton = screen.getByRole('button', { name: /bold/i });
    await user.click(boldButton);

    expect(mockOnContentChange).toHaveBeenCalled();
    // 実際のマークダウンコンテンツに **test** が含まれることを確認
  });

  it('should apply italic formatting', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} initialContent="test" />);

    const editor = screen.getByRole('textbox');
    await user.tripleClick(editor);

    const italicButton = screen.getByRole('button', { name: /italic/i });
    await user.click(italicButton);

    expect(mockOnContentChange).toHaveBeenCalled();
  });

  it('should save on Ctrl+S', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);

    const editor = screen.getByRole('textbox');
    await user.click(editor);
    await user.keyboard('{Control>}s{/Control}');

    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should apply bold on Ctrl+B', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} initialContent="test" />);

    const editor = screen.getByRole('textbox');
    await user.tripleClick(editor);
    await user.keyboard('{Control>}b{/Control}');

    expect(mockOnContentChange).toHaveBeenCalled();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<Editor {...defaultProps} />);

    // Tabキーでフォーカス移動
    await user.tab();

    // エディターにフォーカスが当たっていることを確認
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveFocus();
  });
});
```

---

### 2.2 ファイルツリーコンポーネント (`components/Sidebar/FileTree.tsx`)

#### テストスイート: `<FileTree />`

| # | テストケース | アクション | 期待される動作 | 優先度 |
|---|------------|----------|--------------|--------|
| 2.2.1 | ファイルツリーの表示 | 初期表示 | ファイルとフォルダが表示 | 高 |
| 2.2.2 | ファイルのクリック | ファイルクリック | `onFileSelect` が呼ばれる | 高 |
| 2.2.3 | フォルダの展開 | フォルダクリック | フォルダが展開される | 高 |
| 2.2.4 | フォルダの折りたたみ | 展開済みフォルダクリック | フォルダが折りたたまれる | 高 |
| 2.2.5 | 右クリックメニュー | ファイルを右クリック | コンテキストメニュー表示 | 中 |
| 2.2.6 | 新規ファイル作成 | メニューから新規作成 | `onFileCreate` が呼ばれる | 高 |
| 2.2.7 | ファイル削除 | メニューから削除 | 確認ダイアログ表示 | 高 |
| 2.2.8 | ファイル名変更 | メニューから名前変更 | 入力フィールド表示 | 中 |
| 2.2.9 | ドラッグ&ドロップ | ファイルをドラッグ | ファイル移動 | 低 |
| 2.2.10 | 空のフォルダ表示 | ファイルなしのフォルダ | 「空のフォルダ」表示 | 低 |
| 2.2.11 | ファイルアイコン表示 | 様々なファイル | 適切なアイコン表示 | 低 |
| 2.2.12 | キーボードナビゲーション | 矢印キー操作 | ファイルツリーを移動 | 中 |
| 2.2.13 | 検索フィルター | 検索キーワード入力 | マッチするファイルのみ表示 | 中 |
| 2.2.14 | ソート機能 | ソートボタンクリック | 名前順/日付順でソート | 低 |
| 2.2.15 | 大量のファイル | 1000+ファイル | 仮想スクロールで快適表示 | 中 |

**テストコード例**:
```typescript
// src/components/Sidebar/FileTree.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileTree } from './FileTree';
import { TEST_WORKSPACE, TEST_FILES } from '@/test/fixtures/testData';

describe('FileTree', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnFileCreate = vi.fn();
  const mockOnFileDelete = vi.fn();
  const mockOnFileRename = vi.fn();

  const defaultProps = {
    workspace: TEST_WORKSPACE,
    files: [TEST_FILES.markdownFile],
    onFileSelect: mockOnFileSelect,
    onFileCreate: mockOnFileCreate,
    onFileDelete: mockOnFileDelete,
    onFileRename: mockOnFileRename,
  };

  it('should render file tree', () => {
    render(<FileTree {...defaultProps} />);

    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  it('should call onFileSelect when file is clicked', async () => {
    const user = userEvent.setup();
    render(<FileTree {...defaultProps} />);

    const file = screen.getByText('test.md');
    await user.click(file);

    expect(mockOnFileSelect).toHaveBeenCalledWith(TEST_FILES.markdownFile);
  });

  it('should expand folder when clicked', async () => {
    const user = userEvent.setup();
    const folderStructure = [
      {
        id: 'folder-1',
        name: 'Folder',
        type: 'folder' as const,
        path: '/folder',
        children: [TEST_FILES.markdownFile],
      },
    ];

    render(<FileTree {...defaultProps} files={folderStructure} />);

    const folder = screen.getByText('Folder');
    await user.click(folder);

    // フォルダが展開され、子ファイルが表示されることを確認
    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  it('should show context menu on right click', async () => {
    const user = userEvent.setup();
    render(<FileTree {...defaultProps} />);

    const file = screen.getByText('test.md');
    await user.pointer({ keys: '[MouseRight]', target: file });

    // コンテキストメニューが表示されることを確認
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Rename')).toBeInTheDocument();
  });

  it('should create new file', async () => {
    const user = userEvent.setup();
    render(<FileTree {...defaultProps} />);

    // 右クリックメニューから「New File」を選択
    const file = screen.getByText('test.md');
    await user.pointer({ keys: '[MouseRight]', target: file });

    const newFileButton = screen.getByText('New File');
    await user.click(newFileButton);

    expect(mockOnFileCreate).toHaveBeenCalled();
  });

  it('should show confirmation dialog when deleting file', async () => {
    const user = userEvent.setup();
    render(<FileTree {...defaultProps} />);

    const file = screen.getByText('test.md');
    await user.pointer({ keys: '[MouseRight]', target: file });

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    // 確認ダイアログが表示されることを確認
    expect(
      screen.getByText(/are you sure you want to delete/i)
    ).toBeInTheDocument();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<FileTree {...defaultProps} />);

    // ファイルツリーにフォーカス
    const tree = screen.getByRole('tree');
    tree.focus();

    // 矢印キーで移動
    await user.keyboard('{ArrowDown}');

    // 最初のファイルがフォーカスされることを確認
    const file = screen.getByText('test.md');
    expect(file).toHaveFocus();
  });

  it('should filter files based on search query', async () => {
    const user = userEvent.setup();
    const multipleFiles = [
      TEST_FILES.markdownFile,
      TEST_FILES.nestedFile,
    ];

    render(<FileTree {...defaultProps} files={multipleFiles} />);

    // 検索入力
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'nested');

    // "nested.md"のみ表示されることを確認
    expect(screen.getByText('nested.md')).toBeInTheDocument();
    expect(screen.queryByText('test.md')).not.toBeInTheDocument();
  });

  describe('Performance', () => {
    it('should handle large number of files', () => {
      const manyFiles = Array.from({ length: 1000 }, (_, i) => ({
        id: `file-${i}`,
        name: `file-${i}.md`,
        path: `/file-${i}.md`,
        type: 'file' as const,
        content: '',
      }));

      const { container } = render(
        <FileTree {...defaultProps} files={manyFiles} />
      );

      // レンダリングが完了することを確認
      expect(container).toBeInTheDocument();

      // 仮想スクロールにより、すべてのアイテムが DOM にないことを確認
      const renderedItems = screen.queryAllByRole('treeitem');
      expect(renderedItems.length).toBeLessThan(1000);
    });
  });
});
```

---

### 2.3 ツールバーコンポーネント (`components/Editor/Toolbar.tsx`)

#### テストスイート: `<Toolbar />`

| # | テストケース | アクション | 期待される動作 | 優先度 |
|---|------------|----------|--------------|--------|
| 2.3.1 | ツールバーの表示 | 初期表示 | すべてのボタンが表示 | 高 |
| 2.3.2 | 太字ボタンのクリック | ボタンクリック | エディターで太字適用 | 高 |
| 2.3.3 | 斜体ボタンのクリック | ボタンクリック | エディターで斜体適用 | 高 |
| 2.3.4 | 見出しドロップダウン | ドロップダウン選択 | 見出しレベル適用 | 高 |
| 2.3.5 | リンクボタンのクリック | ボタンクリック | リンクダイアログ表示 | 中 |
| 2.3.6 | 画像ボタンのクリック | ボタンクリック | 画像挿入ダイアログ表示 | 中 |
| 2.3.7 | Undo/Redoボタン | ボタンクリック | 操作を元に戻す/やり直す | 中 |
| 2.3.8 | アクティブ状態の表示 | テキスト選択 | アクティブボタンがハイライト | 中 |
| 2.3.9 | 無効状態の表示 | 操作不可時 | ボタンが無効化 | 中 |
| 2.3.10 | ツールチップの表示 | ボタンホバー | ツールチップ表示 | 低 |
| 2.3.11 | モバイル表示 | 画面サイズ変更 | レスポンシブレイアウト | 低 |
| 2.3.12 | アクセシビリティ | スクリーンリーダー | 適切なaria属性 | 中 |

**テストコード例**:
```typescript
// src/components/Editor/Toolbar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './Toolbar';
import { mockEditor } from '@/test/mocks/tiptap';

describe('Toolbar', () => {
  it('should render all buttons', () => {
    render(<Toolbar editor={mockEditor} />);

    expect(screen.getByLabelText(/bold/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/italic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heading/i)).toBeInTheDocument();
  });

  it('should toggle bold when bold button is clicked', async () => {
    const user = userEvent.setup();
    render(<Toolbar editor={mockEditor} />);

    const boldButton = screen.getByLabelText(/bold/i);
    await user.click(boldButton);

    expect(mockEditor.commands.toggleBold).toHaveBeenCalled();
  });

  it('should toggle italic when italic button is clicked', async () => {
    const user = userEvent.setup();
    render(<Toolbar editor={mockEditor} />);

    const italicButton = screen.getByLabelText(/italic/i);
    await user.click(italicButton);

    expect(mockEditor.commands.toggleItalic).toHaveBeenCalled();
  });

  it('should show active state for bold button', () => {
    mockEditor.isActive.mockReturnValue(true);
    render(<Toolbar editor={mockEditor} />);

    const boldButton = screen.getByLabelText(/bold/i);
    expect(boldButton).toHaveClass('active');
  });

  it('should disable undo button when cannot undo', () => {
    mockEditor.can().undo = vi.fn().mockReturnValue(false);
    render(<Toolbar editor={mockEditor} />);

    const undoButton = screen.getByLabelText(/undo/i);
    expect(undoButton).toBeDisabled();
  });

  it('should show tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<Toolbar editor={mockEditor} />);

    const boldButton = screen.getByLabelText(/bold/i);
    await user.hover(boldButton);

    expect(await screen.findByText(/make text bold/i)).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<Toolbar editor={mockEditor} />);

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toBeInTheDocument();

    const boldButton = screen.getByRole('button', { name: /bold/i });
    expect(boldButton).toHaveAttribute('aria-label', 'Bold');
  });
});
```

---

## 3. 統合テスト

### 3.1 エディター + マークダウン変換

| # | テストケース | シナリオ | 期待される動作 | 優先度 |
|---|------------|---------|--------------|--------|
| 3.1.1 | エディターでの編集 → マークダウン変換 | ユーザーがWYSIWYGで編集 | 正しいマークダウンに変換 | 高 |
| 3.1.2 | マークダウン読み込み → エディター表示 | マークダウンファイル読み込み | WYSIWYGで正しく表示 | 高 |
| 3.1.3 | 編集 → 保存 → 再読み込み | ファイル保存後再度開く | 変更が保持されている | 高 |
| 3.1.4 | 複雑なマークダウンの往復変換 | 複合要素のマークダウン | データが失われない | 高 |
| 3.1.5 | 画像挿入 → 保存 → 再読み込み | 画像を含むファイル | 画像が正しく表示 | 中 |

**テストコード例**:
```typescript
// src/__tests__/integration/editor-markdown.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@/components/Editor/Editor';
import { parseMarkdown } from '@/lib/markdown/parser';
import { serializeToMarkdown } from '@/lib/markdown/serializer';
import { TEST_MARKDOWN } from '@/test/fixtures/testData';

describe('Editor + Markdown Integration', () => {
  it('should convert WYSIWYG editing to markdown', async () => {
    const user = userEvent.setup();
    let currentContent = '';

    const handleContentChange = (content: string) => {
      currentContent = content;
    };

    render(
      <Editor
        fileId="test"
        initialContent=""
        onContentChange={handleContentChange}
        onSave={vi.fn()}
      />
    );

    // WYSIWYGエディターで太字を適用
    const editor = screen.getByRole('textbox');
    await user.type(editor, 'bold text');
    await user.selectAll();
    await user.keyboard('{Control>}b{/Control}');

    // マークダウンに変換されていることを確認
    expect(currentContent).toContain('**bold text**');
  });

  it('should display markdown as WYSIWYG', () => {
    const markdown = '# Hello World\n\n**Bold text**';

    render(
      <Editor
        fileId="test"
        initialContent={markdown}
        onContentChange={vi.fn()}
        onSave={vi.fn()}
      />
    );

    // WYSIWYGとして表示されていることを確認
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Bold text')).toHaveStyle('font-weight: bold');
  });

  it('should maintain content through save and reload', async () => {
    const testContent = TEST_MARKDOWN.complex;
    let savedContent = '';

    const handleSave = (content: string) => {
      savedContent = content;
    };

    const { rerender } = render(
      <Editor
        fileId="test"
        initialContent={testContent}
        onContentChange={vi.fn()}
        onSave={handleSave}
      />
    );

    // 保存
    await userEvent.keyboard('{Control>}s{/Control}');

    // 再読み込み
    rerender(
      <Editor
        fileId="test"
        initialContent={savedContent}
        onContentChange={vi.fn()}
        onSave={handleSave}
      />
    );

    // 内容が保持されていることを確認
    expect(savedContent).toBe(testContent);
  });

  it('should handle round-trip conversion without data loss', () => {
    const originalMarkdown = TEST_MARKDOWN.complex;

    // Markdown → AST
    const ast = parseMarkdown(originalMarkdown);

    // AST → Markdown
    const convertedMarkdown = serializeToMarkdown(ast);

    // 再度 Markdown → AST
    const ast2 = parseMarkdown(convertedMarkdown);

    // ASTが同じであることを確認（データ損失なし）
    expect(ast2).toEqual(ast);
  });
});
```

---

### 3.2 ファイルツリー + ファイルシステムAPI

| # | テストケース | シナリオ | 期待される動作 | 優先度 |
|---|------------|---------|--------------|--------|
| 3.2.1 | ワークスペース開く → ファイルツリー表示 | ディレクトリ選択 | ファイル一覧が表示 | 高 |
| 3.2.2 | ファイル作成 → ツリー更新 | 新規ファイル作成 | ツリーに追加表示 | 高 |
| 3.2.3 | ファイル削除 → ツリー更新 | ファイル削除 | ツリーから削除 | 高 |
| 3.2.4 | ファイル名変更 → ツリー更新 | ファイル名変更 | ツリーに反映 | 中 |
| 3.2.5 | 深い階層のフォルダ構造 | 多層フォルダ | 正しく表示・操作可能 | 中 |

**テストコード例**:
```typescript
// src/__tests__/integration/filetree-filesystem.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileTree } from '@/components/Sidebar/FileTree';
import { FileSystemAPI } from '@/lib/fileSystem/fileSystemAPI';
import { setupFileSystemMocks } from '@/test/mocks/fileSystemAPI';
import { TEST_WORKSPACE } from '@/test/fixtures/testData';

describe('FileTree + FileSystem Integration', () => {
  beforeEach(() => {
    setupFileSystemMocks();
  });

  it('should display files from workspace', async () => {
    const mockDirectoryHandle = {
      entries: async function* () {
        yield ['test.md', { kind: 'file', name: 'test.md' }];
        yield ['folder', { kind: 'directory', name: 'folder' }];
      },
    };

    const files = await FileSystemAPI.listDirectory(
      mockDirectoryHandle as any
    );

    render(
      <FileTree
        workspace={TEST_WORKSPACE}
        files={files}
        onFileSelect={vi.fn()}
        onFileCreate={vi.fn()}
        onFileDelete={vi.fn()}
        onFileRename={vi.fn()}
      />
    );

    expect(screen.getByText('test.md')).toBeInTheDocument();
    expect(screen.getByText('folder')).toBeInTheDocument();
  });

  it('should create new file and update tree', async () => {
    const user = userEvent.setup();
    const mockOnFileCreate = vi.fn();

    render(
      <FileTree
        workspace={TEST_WORKSPACE}
        files={[]}
        onFileSelect={vi.fn()}
        onFileCreate={mockOnFileCreate}
        onFileDelete={vi.fn()}
        onFileRename={vi.fn()}
      />
    );

    // 新規ファイル作成ボタンをクリック
    const newFileButton = screen.getByLabelText(/new file/i);
    await user.click(newFileButton);

    // ファイル名入力
    const input = screen.getByPlaceholderText(/file name/i);
    await user.type(input, 'new-file.md{Enter}');

    await waitFor(() => {
      expect(mockOnFileCreate).toHaveBeenCalledWith(
        expect.stringContaining('new-file.md')
      );
    });
  });

  it('should delete file and update tree', async () => {
    const user = userEvent.setup();
    const mockOnFileDelete = vi.fn();

    const files = [
      {
        id: 'file-1',
        name: 'to-delete.md',
        path: '/to-delete.md',
        type: 'file' as const,
      },
    ];

    render(
      <FileTree
        workspace={TEST_WORKSPACE}
        files={files}
        onFileSelect={vi.fn()}
        onFileCreate={vi.fn()}
        onFileDelete={mockOnFileDelete}
        onFileRename={vi.fn()}
      />
    );

    // ファイルを右クリック
    const file = screen.getByText('to-delete.md');
    await user.pointer({ keys: '[MouseRight]', target: file });

    // 削除を選択
    const deleteButton = screen.getByText(/delete/i);
    await user.click(deleteButton);

    // 確認ダイアログで確認
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnFileDelete).toHaveBeenCalledWith('/to-delete.md');
    });
  });
});
```

---

### 3.3 検索機能 + ファイル読み込み

| # | テストケース | シナリオ | 期待される動作 | 優先度 |
|---|------------|---------|--------------|--------|
| 3.3.1 | 検索 → ファイルを開く | 検索してファイル選択 | ファイルがエディターで開く | 高 |
| 3.3.2 | インデックス構築 → 検索 | ワークスペース読み込み | すべてのファイルが検索可能 | 高 |
| 3.3.3 | ファイル更新 → インデックス更新 | ファイル編集後保存 | 新しい内容が検索可能 | 高 |
| 3.3.4 | 検索結果のハイライト | 検索キーワード入力 | マッチ箇所がハイライト | 中 |
| 3.3.5 | 大量ファイルの検索 | 1000+ファイル | 快適に検索可能 | 中 |

---

## 4. E2Eテスト

### 4.1 基本フロー

| # | テストケース | ユーザーストーリー | 検証ポイント | 優先度 |
|---|------------|-------------------|------------|--------|
| 4.1.1 | 初回起動 | 初めてアプリを開く | ウェルカム画面が表示 | 高 |
| 4.1.2 | ワークスペース選択 | フォルダを選択 | ファイルツリーが表示 | 高 |
| 4.1.3 | ファイル作成と編集 | 新規ファイル作成 → 編集 | ファイルが作成・保存される | 高 |
| 4.1.4 | ファイルの保存と再読み込み | ファイル保存 → 閉じる → 再度開く | 内容が保持されている | 高 |
| 4.1.5 | 画像の挿入 | 画像をドラッグ&ドロップ | 画像が挿入・表示される | 中 |
| 4.1.6 | テーマ切り替え | ダーク/ライトモード切り替え | テーマが変更される | 中 |
| 4.1.7 | 全文検索 | キーワードで検索 → ファイル開く | 検索結果が表示され、ファイルが開く | 高 |
| 4.1.8 | 複数ファイルの編集 | 複数ファイルをタブで開く | タブ切り替えが正常動作 | 中 |
| 4.1.9 | オフライン動作 | オフライン時の操作 | オフラインで動作し、オンライン復帰時に同期 | 低 |
| 4.1.10 | ブラウザリロード | ページリロード | 状態が復元される | 中 |

**テストコード例**:
```typescript
// e2e/basic-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Basic User Flow', () => {
  test('should open workspace and create file', async ({ page }) => {
    await page.goto('/');

    // ウェルカム画面が表示されることを確認
    await expect(page.getByText(/welcome/i)).toBeVisible();

    // ワークスペースを開くボタンをクリック
    await page.getByRole('button', { name: /open workspace/i }).click();

    // ブラウザのファイル選択ダイアログをモック（E2E環境では実際のファイルシステムを使用）
    // 実際のテストでは、テスト用のワークスペースを事前に準備

    // ファイルツリーが表示されることを確認
    await expect(page.getByRole('tree')).toBeVisible();

    // 新規ファイルを作成
    await page.getByRole('button', { name: /new file/i }).click();
    await page.getByPlaceholder(/file name/i).fill('test.md');
    await page.keyboard.press('Enter');

    // エディターにファイルが開かれることを確認
    await expect(page.getByRole('textbox', { name: /editor/i })).toBeVisible();

    // テキストを入力
    await page.getByRole('textbox').fill('# My First Note\n\nThis is a test.');

    // 保存
    await page.keyboard.press('Control+S');

    // 保存完了の通知を確認
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test('should search and open file', async ({ page }) => {
    await page.goto('/');

    // ワークスペースを開く（省略）

    // 検索ボックスに入力
    await page.getByPlaceholder(/search/i).fill('test');

    // 検索結果が表示されることを確認
    await expect(page.getByText('test.md')).toBeVisible();

    // 検索結果をクリックしてファイルを開く
    await page.getByText('test.md').click();

    // ファイルの内容が表示されることを確認
    await expect(page.getByText(/my first note/i)).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');

    // テーマ切り替えボタンをクリック
    await page.getByRole('button', { name: /theme/i }).click();

    // ダークモードに変更されることを確認
    await expect(page.locator('html')).toHaveClass(/dark/);

    // 再度クリックしてライトモードに戻す
    await page.getByRole('button', { name: /theme/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should persist state across reload', async ({ page }) => {
    await page.goto('/');

    // ファイルを作成・編集（省略）
    const testContent = '# Persistent Test';
    await page.getByRole('textbox').fill(testContent);
    await page.keyboard.press('Control+S');

    // ページをリロード
    await page.reload();

    // 同じファイルが開かれ、内容が保持されていることを確認
    await expect(page.getByText(testContent)).toBeVisible();
  });

  test('should handle image insertion', async ({ page }) => {
    await page.goto('/');

    // ファイルを開く（省略）

    // 画像ボタンをクリック
    await page.getByRole('button', { name: /image/i }).click();

    // 画像ファイルをアップロード
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/test-image.png');

    // 画像が挿入されることを確認
    await expect(page.locator('img[alt*="test-image"]')).toBeVisible();

    // 保存
    await page.keyboard.press('Control+S');

    // リロード後も画像が表示されることを確認
    await page.reload();
    await expect(page.locator('img[alt*="test-image"]')).toBeVisible();
  });
});
```

---

## 5. テスト実行順序

### 5.1 開発時の実行順序

```
1. ユニットテスト（最優先）
   - lib/markdown/*
   - lib/fileSystem/*
   - lib/utils/*
   ↓
2. コンポーネントテスト
   - components/Editor/*
   - components/Sidebar/*
   ↓
3. 統合テスト
   - エディター + マークダウン
   - ファイルツリー + ファイルシステム
   ↓
4. E2Eテスト（最後）
   - 主要ユーザーフロー
```

### 5.2 CI/CDでの実行順序

```
1. リンター + 型チェック
   ↓
2. ユニットテスト（並列実行）
   ↓
3. コンポーネントテスト（並列実行）
   ↓
4. カバレッジチェック（閾値確認）
   ↓
5. 統合テスト
   ↓
6. E2Eテスト（並列実行）
   ↓
7. レポート生成
```

---

**作成日**: 2026-01-10
**次回更新**: Phase 1 実装中に随時更新
