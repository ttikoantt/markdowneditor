# セキュリティチェックリスト

## 公開リポジトリにプッシュ前のチェック項目

### 1. 個人情報・機密情報のチェック

```bash
# 個人名・ユーザー名・メールアドレスの検索
grep -rE "(your-name|your-email|@gmail\.com|@yahoo)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.md" .

# APIキー・トークンの検索
grep -rE "(sk-|ghp_|gho_|github_pat_|xoxb-|xoxp-|AKIA|ssh-rsa|password|secret|api.key|token|credential)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v pnpm-lock
```

### 2. 不要ファイルのチェック

```bash
# Gitで追跡されているファイル一覧
git ls-files

# 追跡すべきでないファイルの確認
git ls-files | grep -E "^dist/|\.env|\.pem|credential|secret"
git ls-files | grep -E "\.(d\.ts|d\.ts\.map)$" | grep -v "src/"
```

### 3. .gitignore に含めるべき項目

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# TypeScript compiled config files
*.config.js
*.config.d.ts
*.config.d.ts.map
!eslint.config.js
!tailwind.config.js
!postcss.config.js

# Build output
dist/
*.local

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/*
!.vscode/extensions.json
.idea/

# Testing
coverage/
playwright-report/
test-results/

# Logs
*.log

# Secrets
*.pem
*.key
```

---

## 2026-01-15 実施したセキュリティ対応

### 問題と対応

| 問題 | 対応 |
|------|------|
| TypeScript コンパイル済みファイルがリポジトリに含まれていた | `git rm --cached` で削除し、`.gitignore` に追加 |

### 削除したファイル

```
playwright.config.js
playwright.config.d.ts
playwright.config.d.ts.map
vite.config.js
vite.config.d.ts
vite.config.d.ts.map
vitest.config.js
vitest.config.d.ts
vitest.config.d.ts.map
```

### 確認済み：問題なし

- 個人名・ユーザー名：なし
- メールアドレス：テスト用の `test@example.com` のみ
- APIキー・トークン：なし
- パスワード・シークレット：なし
- `.env` ファイル：含まれていない
- `dist/` フォルダ：含まれていない

---

## GitHub Pages セキュリティ考慮事項

1. **XSS対策**: DOMPurify を使用して HTML をサニタイズ
2. **CSP**: GitHub Pages はデフォルトで HTTPS を強制
3. **File System Access API**: ユーザーの明示的な許可が必要
4. **Service Worker**: キャッシュは同一オリジンのリソースのみ
