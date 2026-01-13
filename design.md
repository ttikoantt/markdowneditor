# マークダウンエディター 設計書

## 1. システムアーキテクチャ

### 1.1 全体構成（Webアプリ版 - Phase 1）

```
┌─────────────────────────────────────────────────────┐
│                  Modern Browser                     │
│  ┌───────────────────────────────────────────────┐  │
│  │           React Application Layer             │  │
│  │  - UIコンポーネント                            │  │
│  │  - 状態管理（Zustand）                         │  │
│  │  - ルーティング                                │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │          Editor Layer (TipTap)                │  │
│  │  - WYSIWYGエディター（ProseMirrorベース）      │  │
│  │  - マークダウン双方向変換                      │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │              Data Layer                       │  │
│  │  - File System Access API                     │  │
│  │  - ワークスペース管理                          │  │
│  │  - 検索エンジン（Fuse.js）                     │  │
│  │  - 設定管理（localStorage）                    │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │          Service Worker Layer                 │  │
│  │  - オフラインキャッシュ                        │  │
│  │  - アセット管理                                │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│       File System Access API & Browser Storage     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Local File System (ユーザー許可後アクセス)   │  │
│  │  - マークダウンファイル (.md)                  │  │
│  │  - 画像ファイル                                │  │
│  │  - ワークスペースフォルダ                      │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Browser Storage                              │  │
│  │  - localStorage: 設定、最近使用したファイル    │  │
│  │  - IndexedDB: フォルダハンドル、検索インデックス│  │
│  │  - Cache API: オフラインアセット               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 1.2 技術スタック

#### コアフレームワーク
- **フレームワーク**: React 18+
- **言語**: TypeScript 5+
- **ビルドツール**: Vite 5+
- **パッケージマネージャー**: pnpm

#### UI/UX
- **状態管理**: Zustand
- **スタイリング**: TailwindCSS + PostCSS
- **エディター**: TipTap 2+ (ProseMirrorベース)
- **アイコン**: Lucide React または Heroicons
- **テーマ**: CSS Variables + Tailwind Dark Mode

#### データ処理
- **マークダウン処理**:
  - unified
  - remark
  - remark-parse
  - remark-stringify
  - remark-gfm（GitHub Flavored Markdown）
- **ファイルシステム**: File System Access API（ネイティブブラウザAPI）
- **検索エンジン**: Fuse.js（軽量全文検索）
- **画像処理**: Canvas API（リサイズ、最適化）

#### PWA機能
- **Service Worker**: Workbox
- **オフラインストレージ**:
  - IndexedDB（Dexie.js）
  - localStorage
  - Cache API

#### 開発ツール
- **リンター**: ESLint + Prettier
- **テスト**:
  - Vitest（ユニットテスト）
  - React Testing Library（コンポーネントテスト）
  - Playwright（E2Eテスト）
- **型チェック**: TypeScript
- **Git Hooks**: Husky + lint-staged

#### デプロイ
- **ホスティング**: GitHub Pages
- **CI/CD**: GitHub Actions
- **バンドル最適化**:
  - Code Splitting
  - Tree Shaking
  - Lazy Loading
  - Compression (gzip/brotli)

---

## 2. モジュール設計

### 2.1 ディレクトリ構成

```
markdowneditor/
├── public/                      # 静的ファイル
│   ├── index.html
│   ├── manifest.json            # PWAマニフェスト
│   ├── icons/                   # アプリアイコン
│   └── robots.txt
│
├── src/                         # Reactアプリケーション
│   ├── main.tsx                 # エントリーポイント
│   ├── App.tsx                  # ルートコンポーネント
│   ├── vite-env.d.ts            # Vite型定義
│   │
│   ├── components/              # UIコンポーネント
│   │   ├── Editor/              # エディター関連
│   │   │   ├── Editor.tsx       # メインエディター
│   │   │   ├── Toolbar.tsx      # ツールバー
│   │   │   ├── MenuBar.tsx      # メニューバー
│   │   │   └── StatusBar.tsx    # ステータスバー
│   │   │
│   │   ├── Sidebar/             # サイドバー関連
│   │   │   ├── Sidebar.tsx      # サイドバーコンテナ
│   │   │   ├── FileTree.tsx     # ファイルツリー
│   │   │   ├── FileItem.tsx     # ファイルアイテム
│   │   │   └── FolderItem.tsx   # フォルダアイテム
│   │   │
│   │   ├── Tabs/                # タブ関連
│   │   │   ├── TabBar.tsx       # タブバー
│   │   │   └── Tab.tsx          # 個別タブ
│   │   │
│   │   └── Dialogs/             # ダイアログ
│   │       ├── OpenFolder.tsx   # フォルダ選択
│   │       ├── NewFile.tsx      # 新規ファイル
│   │       └── Settings.tsx     # 設定画面
│   │
│   ├── hooks/                   # カスタムフック
│   │   ├── useFileSystem.ts     # ファイル操作
│   │   ├── useWorkspace.ts      # ワークスペース
│   │   ├── useEditor.ts         # エディター状態
│   │   └── useSettings.ts       # 設定管理
│   │
│   ├── store/                   # 状態管理
│   │   ├── index.ts             # ストア設定
│   │   ├── fileSlice.ts         # ファイル状態
│   │   ├── editorSlice.ts       # エディター状態
│   │   └── settingsSlice.ts     # 設定状態
│   │
│   ├── lib/                     # ユーティリティ
│   │   ├── markdown/            # マークダウン処理
│   │   │   ├── parser.ts        # パース処理
│   │   │   ├── serializer.ts    # シリアライズ
│   │   │   └── extensions.ts    # 拡張機能
│   │   │
│   │   ├── fileSystem/          # File System Access API
│   │   │   ├── fileSystemAPI.ts # ファイルシステムAPI
│   │   │   ├── directoryHandle.ts # ディレクトリハンドル管理
│   │   │   ├── fileHandle.ts    # ファイルハンドル管理
│   │   │   └── permissions.ts   # 権限管理
│   │   │
│   │   ├── search/              # 全文検索
│   │   │   ├── searchEngine.ts  # Fuse.js統合
│   │   │   ├── indexer.ts       # インデックス作成
│   │   │   └── searchWorker.ts  # Web Worker検索
│   │   │
│   │   ├── storage/             # ブラウザストレージ
│   │   │   ├── indexedDB.ts     # IndexedDBラッパー
│   │   │   ├── localStorage.ts  # localStorageラッパー
│   │   │   └── cache.ts         # Cache APIラッパー
│   │   │
│   │   └── utils/               # 汎用ユーティリティ
│   │       ├── debounce.ts
│   │       ├── validators.ts
│   │       └── imageOptimizer.ts # 画像最適化
│   │
│   ├── types/                   # 型定義
│   │   ├── file.ts
│   │   ├── editor.ts
│   │   └── workspace.ts
│   │
│   ├── styles/                  # スタイル
│   │   ├── global.css           # グローバルスタイル
│   │   ├── tailwind.css         # Tailwind imports
│   │   └── themes/
│   │       ├── variables.css    # CSS変数
│   │       ├── light.css
│   │       └── dark.css
│   │
│   ├── workers/                 # Web Workers
│   │   └── search.worker.ts     # 検索用Worker
│   │
│   └── sw.ts                    # Service Worker（Workbox）
│
├── dist/                        # ビルド出力
├── .github/                     # GitHub設定
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.json
├── .prettierrc
└── README.md
```

---

## 3. データモデル

### 3.1 ファイルシステムモデル

```typescript
// ワークスペース
interface Workspace {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  lastOpenedAt: Date;
}

// ファイルツリーノード
interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  parent?: string;
  isExpanded?: boolean;
}

// 開いているファイル
interface OpenFile {
  id: string;
  path: string;
  name: string;
  content: string;
  isDirty: boolean;      // 未保存の変更があるか
  lastSaved: Date;
  cursorPosition?: number;
}

// タブ情報
interface Tab {
  id: string;
  fileId: string;
  isActive: boolean;
}
```

### 3.2 エディターモデル

```typescript
// エディター状態
interface EditorState {
  activeFileId: string | null;
  openFiles: Map<string, OpenFile>;
  tabs: Tab[];
  cursorPosition: number;
  selection: {
    from: number;
    to: number;
  } | null;
}

// エディター設定
interface EditorConfig {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
}
```

### 3.3 アプリケーション設定

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  autoSaveInterval: number;  // ミリ秒
  recentWorkspaces: Workspace[];
  lastOpenedWorkspaceId: string | null;
  editor: EditorConfig;
  shortcuts: Record<string, string>;
  sidebarWidth: number;
  windowState: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    isMaximized: boolean;
  };
}
```

---

## 4. コアコンポーネント設計

### 4.1 エディターコンポーネント

```typescript
// src/components/Editor/Editor.tsx
interface EditorProps {
  fileId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

/**
 * TipTapベースのWYSIWYGエディター
 *
 * 機能:
 * - マークダウンとProseMirror documentの双方向変換
 * - ツールバーとの連携
 * - キーボードショートカット
 * - 自動保存トリガー
 */
```

#### TipTap拡張機能

```typescript
import { Extension } from '@tiptap/core';

// カスタム拡張一覧
const extensions = [
  StarterKit,              // 基本機能
  Heading,                 // 見出し
  Bold,                    // 太字
  Italic,                  // 斜体
  Strike,                  // 取り消し線
  BulletList,              // 箇条書き
  OrderedList,             // 番号付きリスト
  TaskList,                // チェックボックス
  Link,                    // リンク
  Image,                   // 画像
  CodeBlock,               // コードブロック
  Blockquote,              // 引用
  HorizontalRule,          // 水平線
  Table,                   // テーブル
  Markdown,                // マークダウンシリアライザー
];
```

### 4.2 ファイルツリーコンポーネント

```typescript
// src/components/Sidebar/FileTree.tsx
interface FileTreeProps {
  workspace: Workspace;
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (parentPath: string) => void;
  onFileDelete: (path: string) => void;
  onFileRename: (path: string, newName: string) => void;
}

/**
 * ファイルツリー表示
 *
 * 機能:
 * - フォルダの展開/折りたたみ
 * - ドラッグ&ドロップによるファイル移動
 * - 右クリックメニュー（新規作成、削除、名前変更）
 * - ファイル検索フィルター
 */
```

### 4.3 ツールバーコンポーネント

```typescript
// src/components/Editor/Toolbar.tsx
interface ToolbarProps {
  editor: Editor | null;  // TipTap editor instance
}

/**
 * エディターツールバー
 *
 * ボタン:
 * - テキスト装飾: 太字、斜体、下線、取り消し線
 * - 見出し: H1〜H6ドロップダウン
 * - リスト: 箇条書き、番号付き、チェックボックス
 * - 挿入: リンク、画像、コードブロック、引用、テーブル
 * - その他: Undo/Redo
 */
```

---

## 5. File System Access API設計

### 5.1 ファイルシステムAPI

```typescript
// src/lib/fileSystem/fileSystemAPI.ts

/**
 * File System Access APIラッパー
 * ブラウザのネイティブAPIを使用してローカルファイルシステムにアクセス
 */

export class FileSystemAPI {
  /**
   * フォルダ選択ダイアログを表示
   */
  static async selectDirectory(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });
      return directoryHandle;
    } catch (error) {
      if (error.name === 'AbortError') {
        // ユーザーがキャンセル
        return null;
      }
      throw error;
    }
  }

  /**
   * ファイル読み込み
   */
  static async readFile(
    fileHandle: FileSystemFileHandle
  ): Promise<string> {
    const file = await fileHandle.getFile();
    return await file.text();
  }

  /**
   * ファイル書き込み
   */
  static async writeFile(
    fileHandle: FileSystemFileHandle,
    content: string
  ): Promise<void> {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  /**
   * 新規ファイル作成
   */
  static async createFile(
    directoryHandle: FileSystemDirectoryHandle,
    fileName: string
  ): Promise<FileSystemFileHandle> {
    return await directoryHandle.getFileHandle(fileName, { create: true });
  }

  /**
   * ファイル削除
   */
  static async deleteFile(
    directoryHandle: FileSystemDirectoryHandle,
    fileName: string
  ): Promise<void> {
    await directoryHandle.removeEntry(fileName);
  }

  /**
   * ディレクトリ内のファイル一覧取得
   */
  static async listDirectory(
    directoryHandle: FileSystemDirectoryHandle
  ): Promise<FileNode[]> {
    const entries: FileNode[] = [];

    for await (const [name, handle] of directoryHandle.entries()) {
      const node: FileNode = {
        id: crypto.randomUUID(),
        name,
        path: await this.getFullPath(handle),
        type: handle.kind === 'file' ? 'file' : 'folder',
        handle, // ハンドルを保持
      };

      entries.push(node);
    }

    return entries.sort((a, b) => {
      // フォルダを先に、その後ファイル名でソート
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * フルパス取得（ブラウザの制限により相対パス）
   */
  private static async getFullPath(
    handle: FileSystemHandle
  ): Promise<string> {
    // File System Access APIではフルパスは取得できないため
    // ワークスペースルートからの相対パスを返す
    return handle.name;
  }

  /**
   * 権限確認
   */
  static async verifyPermission(
    handle: FileSystemHandle,
    readWrite: boolean = true
  ): Promise<boolean> {
    const options = readWrite ? { mode: 'readwrite' as const } : {};

    // 権限チェック
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }

    // 権限リクエスト
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }

    return false;
  }
}
```

### 5.2 ディレクトリハンドル管理

```typescript
// src/lib/fileSystem/directoryHandle.ts

/**
 * ディレクトリハンドルの永続化とキャッシュ管理
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface HandleDB extends DBSchema {
  'directory-handles': {
    key: string;
    value: {
      id: string;
      name: string;
      handle: FileSystemDirectoryHandle;
      lastAccessed: number;
    };
  };
}

export class DirectoryHandleManager {
  private db: IDBPDatabase<HandleDB> | null = null;

  async init(): Promise<void> {
    this.db = await openDB<HandleDB>('file-system-handles', 1, {
      upgrade(db) {
        db.createObjectStore('directory-handles', { keyPath: 'id' });
      },
    });
  }

  /**
   * ディレクトリハンドルを保存
   */
  async saveHandle(
    id: string,
    name: string,
    handle: FileSystemDirectoryHandle
  ): Promise<void> {
    await this.db?.put('directory-handles', {
      id,
      name,
      handle,
      lastAccessed: Date.now(),
    });
  }

  /**
   * ディレクトリハンドルを取得
   */
  async getHandle(id: string): Promise<FileSystemDirectoryHandle | null> {
    const entry = await this.db?.get('directory-handles', id);
    if (!entry) return null;

    // 権限を確認
    const hasPermission = await FileSystemAPI.verifyPermission(
      entry.handle,
      true
    );

    if (!hasPermission) {
      return null;
    }

    // 最終アクセス時刻を更新
    await this.db?.put('directory-handles', {
      ...entry,
      lastAccessed: Date.now(),
    });

    return entry.handle;
  }

  /**
   * すべてのディレクトリハンドルを取得
   */
  async getAllHandles(): Promise<
    Array<{
      id: string;
      name: string;
      handle: FileSystemDirectoryHandle;
    }>
  > {
    const handles = await this.db?.getAll('directory-handles');
    return handles || [];
  }

  /**
   * ディレクトリハンドルを削除
   */
  async deleteHandle(id: string): Promise<void> {
    await this.db?.delete('directory-handles', id);
  }
}
```

### 5.3 ブラウザ互換性チェック

```typescript
// src/lib/fileSystem/compatibility.ts

/**
 * File System Access APIのサポート状況を確認
 */
export function isFileSystemAccessSupported(): boolean {
  return (
    'showDirectoryPicker' in window &&
    'showOpenFilePicker' in window &&
    'showSaveFilePicker' in window
  );
}

/**
 * フォールバック機能の提供
 */
export class FileSystemFallback {
  /**
   * 従来のファイルダウンロード
   */
  static downloadFile(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 従来のファイルアップロード
   */
  static uploadFile(): Promise<{ name: string; content: string } | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const content = await file.text();
        resolve({ name: file.name, content });
      };

      input.click();
    });
  }
}
```

---

## 6. マークダウン変換設計

### 6.1 変換フロー

```
ユーザー入力 → ProseMirror Document → Markdown文字列 → ファイル保存
                     ↑                      ↓
                     └──────────────────────┘
                    ファイル読み込み時に逆変換
```

### 6.2 変換ライブラリ

```typescript
// src/lib/markdown/parser.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { ProseMirrorNode } from 'prosemirror-model';

/**
 * マークダウン → ProseMirrorノード変換
 */
export function markdownToProseMirror(markdown: string): ProseMirrorNode {
  // unified + remarkでASTを生成
  const ast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown);

  // ASTをProseMirrorノードに変換
  return convertASTtoProseMirror(ast);
}

/**
 * ProseMirrorノード → マークダウン変換
 */
export function proseMirrorToMarkdown(doc: ProseMirrorNode): string {
  // ProseMirrorノードをマークダウンテキストに変換
  // TipTapのMarkdown extensionを使用
  return editor.storage.markdown.getMarkdown();
}
```

---

## 7. 状態管理設計（Zustand使用）

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppStore {
  // ワークスペース
  currentWorkspace: Workspace | null;
  setWorkspace: (workspace: Workspace) => void;

  // ファイル
  fileTree: FileNode[];
  openFiles: Map<string, OpenFile>;
  activeFileId: string | null;
  setFileTree: (tree: FileNode[]) => void;
  openFile: (file: OpenFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => Promise<void>;

  // タブ
  tabs: Tab[];
  addTab: (fileId: string) => void;
  removeTab: (fileId: string) => void;
  setActiveTab: (fileId: string) => void;

  // 設定
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初期状態と実装...
      }),
      {
        name: 'markdown-editor-storage',
        partialize: (state) => ({
          settings: state.settings,
          currentWorkspace: state.currentWorkspace,
        }),
      }
    )
  )
);
```

---

## 8. UIデザイン設計

### 8.1 レイアウト構成

```
┌────────────────────────────────────────────────────────────┐
│  Menu Bar (File, Edit, View, Help)                        │
├──────────┬─────────────────────────────────────────────────┤
│          │  Toolbar (太字 斜体 H1▼ リスト リンク...)      │
│          ├─────────────────────────────────────────────────┤
│          │  Tab Bar                                        │
│          │  ┌─────┬─────┬─────┐                            │
│          │  │File1│File2│  +  │                            │
│          │  └─────┴─────┴─────┘                            │
│          ├─────────────────────────────────────────────────┤
│  Side    │                                                 │
│  bar     │                                                 │
│          │            Editor Area                          │
│  ┌────┐  │                                                 │
│  │📁  │  │         (WYSIWYG Content)                       │
│  │📄  │  │                                                 │
│  │📄  │  │                                                 │
│  └────┘  │                                                 │
│          │                                                 │
│          ├─────────────────────────────────────────────────┤
│          │  Status Bar (行:列 | 文字数 | 保存状態)         │
└──────────┴─────────────────────────────────────────────────┘
```

### 8.2 カラーパレット

#### ライトモード
```css
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--bg-hover: #e8e8e8;
--text-primary: #1a1a1a;
--text-secondary: #6b6b6b;
--border: #d4d4d4;
--accent: #0066cc;
```

#### ダークモード
```css
--bg-primary: #1e1e1e;
--bg-secondary: #2d2d2d;
--bg-hover: #3a3a3a;
--text-primary: #e0e0e0;
--text-secondary: #a0a0a0;
--border: #404040;
--accent: #4da6ff;
```

---

## 9. パフォーマンス最適化

### 9.1 仮想化
- 大きなファイルツリーに対して`react-window`を使用
- 10,000行以上のファイルに対してエディター仮想化

### 9.2 遅延読み込み
- フォルダは展開時に子要素を読み込み
- ファイル内容はタブを開いた時に読み込み

### 9.3 デバウンス
- 自動保存は最後の編集から500ms後に実行
- 検索は300ms後に実行

### 9.4 メモ化
- React.memo、useMemo、useCallbackを適切に使用
- ファイルツリーの再レンダリング最小化

---

## 8. 全文検索機能設計

### 8.1 検索エンジン

```typescript
// src/lib/search/searchEngine.ts
import Fuse from 'fuse.js';

interface SearchableFile {
  id: string;
  path: string;
  name: string;
  content: string;
  metadata: {
    size: number;
    modified: number;
  };
}

export class SearchEngine {
  private fuse: Fuse<SearchableFile> | null = null;
  private index: SearchableFile[] = [];

  /**
   * 検索インデックスを作成
   */
  async buildIndex(files: SearchableFile[]): Promise<void> {
    this.index = files;

    this.fuse = new Fuse(files, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'content', weight: 0.6 },
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }

  /**
   * 検索実行
   */
  search(query: string): SearchResult[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const results = this.fuse.search(query);
    return results.map((result) => ({
      file: result.item,
      score: result.score || 0,
      matches: result.matches || [],
    }));
  }

  /**
   * インデックス更新（ファイル追加・更新）
   */
  async updateFile(file: SearchableFile): Promise<void> {
    const existingIndex = this.index.findIndex((f) => f.id === file.id);

    if (existingIndex >= 0) {
      this.index[existingIndex] = file;
    } else {
      this.index.push(file);
    }

    await this.buildIndex(this.index);
  }

  /**
   * インデックスからファイル削除
   */
  async removeFile(fileId: string): Promise<void> {
    this.index = this.index.filter((f) => f.id !== fileId);
    await this.buildIndex(this.index);
  }
}
```

### 8.2 Web Worker検索（パフォーマンス向上）

```typescript
// src/workers/search.worker.ts
import { SearchEngine } from '../lib/search/searchEngine';

const searchEngine = new SearchEngine();

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'BUILD_INDEX':
      await searchEngine.buildIndex(payload.files);
      self.postMessage({ type: 'INDEX_BUILT' });
      break;

    case 'SEARCH':
      const results = searchEngine.search(payload.query);
      self.postMessage({ type: 'SEARCH_RESULTS', payload: { results } });
      break;

    case 'UPDATE_FILE':
      await searchEngine.updateFile(payload.file);
      self.postMessage({ type: 'FILE_UPDATED' });
      break;

    case 'REMOVE_FILE':
      await searchEngine.removeFile(payload.fileId);
      self.postMessage({ type: 'FILE_REMOVED' });
      break;
  }
};
```

---

## 9. 画像処理設計

### 9.1 画像最適化

```typescript
// src/lib/utils/imageOptimizer.ts

export class ImageOptimizer {
  /**
   * 画像をリサイズ・最適化
   */
  static async optimizeImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.85
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // アスペクト比を保持してリサイズ
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * クリップボードから画像を取得
   */
  static async getImageFromClipboard(): Promise<File | null> {
    const items = await navigator.clipboard.read();

    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          return new File([blob], `pasted-${Date.now()}.png`, { type });
        }
      }
    }

    return null;
  }

  /**
   * ワークスペース内に画像を保存
   */
  static async saveImageToWorkspace(
    directoryHandle: FileSystemDirectoryHandle,
    imageBlob: Blob,
    fileName: string
  ): Promise<string> {
    // assetsフォルダを作成
    const assetsFolder = await directoryHandle.getDirectoryHandle('assets', {
      create: true,
    });

    const imageHandle = await assetsFolder.getFileHandle(fileName, {
      create: true,
    });
    const writable = await imageHandle.createWritable();
    await writable.write(imageBlob);
    await writable.close();

    return `./assets/${fileName}`;
  }
}
```

---

## 10. セキュリティ設計

### 10.1 Webアプリセキュリティ

```html
<!-- public/index.html -->
<!-- Content Security Policy -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src 'self';
  "
/>
```

### 10.2 ファイルアクセス制限
- File System Access APIは必ずユーザー許可が必要
- ワークスペース外のファイルへのアクセスは不可
- パストラバーサル攻撃の防止（ブラウザが自動的に防御）

### 10.3 入力検証

```typescript
// src/lib/utils/validators.ts

export class Validators {
  /**
   * ファイル名の検証
   */
  static isValidFileName(fileName: string): boolean {
    // 不正な文字を除外
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    return !invalidChars.test(fileName) && fileName.length > 0;
  }

  /**
   * マークダウンファイルかチェック
   */
  static isMarkdownFile(fileName: string): boolean {
    return /\.(md|markdown)$/i.test(fileName);
  }

  /**
   * XSS対策：HTMLエスケープ
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
```

### 10.4 HTTPS必須
- GitHub PagesはデフォルトでHTTPS
- Service WorkerはHTTPSでのみ動作
- File System Access APIはHTTPSでのみ動作

---

## 11. テスト戦略

### 11.1 単体テスト
- ユーティリティ関数のテスト（Vitest）
- マークダウン変換のテスト
- 状態管理ロジックのテスト

### 11.2 コンポーネントテスト
- React Testing Libraryでコンポーネントテスト
- エディター操作のテスト
- ファイルツリー操作のテスト

### 11.3 E2Eテスト
- Playwright/Spectronでアプリ全体のテスト
- ファイル保存・読み込みフロー
- ワークスペース切り替え

---

## 12. ビルド・デプロイ

### 12.1 開発環境

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動（HMR有効）
pnpm dev

# 型チェック
pnpm type-check

# リンター実行
pnpm lint

# ユニットテスト
pnpm test

# E2Eテスト
pnpm test:e2e
```

### 12.2 本番ビルド

```bash
# プロダクションビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Markdown Editor',
        short_name: 'MDEditor',
        description: 'WYSIWYG Markdown Editor',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit'],
          'utils-vendor': ['zustand', 'fuse.js'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tiptap/react'],
  },
});
```

### 12.3 GitHub Pages デプロイ

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
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

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 12.4 バンドル最適化

- **Code Splitting**: ルートベースで自動分割
- **Tree Shaking**: 未使用コードの除去
- **Minification**: Terserで圧縮
- **Lazy Loading**: React.lazy()でコンポーネント遅延読み込み
- **Image Optimization**: 画像の遅延読み込みと最適化
- **Compression**: Gzip/Brotli圧縮（GitHub Pages標準）

### 12.5 パフォーマンス目標

- Lighthouse Score: 90+
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3.5s
- Total Blocking Time (TBT): < 300ms
- Cumulative Layout Shift (CLS): < 0.1
- バンドルサイズ: < 500KB (gzip)

---

## 13. 将来の拡張性

### 13.1 プラグインシステム
- プラグインAPIの定義
- プラグインローダーの実装
- カスタムエディター拡張のサポート

### 13.2 クラウド同期
- ワークスペースのクラウド保存
- リアルタイム同期

### 13.3 その他
- グラフビュー（Obsidian風）
- バックリンク機能
- タグシステム

---

**作成日**: 2026-01-10
**バージョン**: 1.0

---

## 関連ドキュメント

- [要件定義書](./requirements.md) - 機能要件と非機能要件
- [アーキテクチャレビュー](./architecture-review.md) - アーキテクト視点での評価
- [TDD戦略](./tdd-strategy.md) - テスト駆動開発のアプローチ
- [テストケース仕様](./test-cases.md) - 詳細なテストケース一覧
- [テストスイートテンプレート](./test-suite-templates.md) - すぐに使えるテストコードテンプレート

---
