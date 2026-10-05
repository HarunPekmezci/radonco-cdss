<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Automated Workflow & Git Policy
At the end of every completed task or refactoring step:
1. Verify type-safety and compilation (`npx tsc --noEmit` or `npm run build`).
2. Automatically stage all modified and created files (`git add .`).
3. Commit with an accurate, concise Conventional Commit message (`git commit -m "feat/fix: <summary>"`).
4. Immediately push changes to the upstream remote repository (`git push`).
Do not pause to ask for manual confirmation to push unless a merge conflict or fatal git error occurs.

<!-- END:nextjs-agent-rules -->
