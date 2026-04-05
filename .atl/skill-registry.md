# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Creating/building REST API endpoints | api-endpoint-builder | C:\Users\elkaw\.agents\skills\api-endpoint-builder\SKILL.md |
| Reporting bugs, fixing errors, debugging | bug-hunter | C:\Users\elkaw\.agents\skills\bug-hunter\SKILL.md |
| Deep audit before push, removing junk files | codebase-audit-pre-push | C:\Users\elkaw\.agents\skills\codebase-audit-pre-push\SKILL.md |
| Building with Hono framework | hono | C:\Users\elkaw\.agents\skills\hono\SKILL.md |
| Expert jq usage, JSON transformation | jq | C:\Users\elkaw\.agents\skills\jq\SKILL.md |
| Performance bottlenecks, optimization | performance-optimizer | C:\Users\elkaw\.agents\skills\performance-optimizer\SKILL.md |
| Validating skills against spec | skill-check | C:\Users\elkaw\.agents\skills\skill-check\SKILL.md |
| Tmux session/window management | tmux | C:\Users\elkaw\.agents\skills\tmux\SKILL.md |
| Creating GitHub issues | issue-creation | C:\Users\elkaw\.config\opencode\skills\issue-creation\SKILL.md |
| Creating pull requests | branch-pr | C:\Users\elkaw\.config\opencode\skills\branch-pr\SKILL.md |
| Creating new AI skills | skill-creator | C:\Users\elkaw\.config\opencode\skills\skill-creator\SKILL.md |
| Go testing, Bubbletea TUI testing | go-testing | C:\Users\elkaw\.config\opencode\skills\go-testing\SKILL.md |
| Reviewing React code, finishing features | react-doctor | C:\Users\elkaw\.config\opencode\skills\react-doctor\SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### api-endpoint-builder
- Include route handler with proper HTTP method (POST/GET/PUT/DELETE)
- Add input validation for request body, params, and query strings
- Implement authentication/authorization checks before business logic
- Use structured error handling with appropriate HTTP status codes
- Return consistent JSON response format: `{ success, data, error, message }`
- Document endpoint with OpenAPI/Swagger annotations
- Add integration tests covering happy path and error cases
- Never expose internal error details to clients (sanitize stack traces)

### bug-hunter
- Reproduce the bug consistently before attempting fixes
- Gather evidence: logs, error messages, stack traces, environment details
- Trace from symptoms to root cause (no guessing)
- Isolate the problem: binary search through code, disable features, add logging
- Test the fix in the same environment where bug occurred
- Add regression test to prevent recurrence
- Document root cause and fix in commit message

### codebase-audit-pre-push
- Scan for junk files: .DS_Store, Thumbs.db, temp files, editor configs
- Remove dead code: unused imports, commented code blocks, unreachable functions
- Check for security issues: hardcoded secrets, exposed keys, SQL injection risks
- Verify optimization: large bundles, uncompressed images, redundant dependencies
- Line-by-line review of changed files for production readiness
- Fail fast on critical issues (security, data loss risks)

### hono
- Ultra-fast web framework for Cloudflare Workers, Deno, Bun, Node.js
- Middleware pattern: `app.use('*', middleware)` for global, `app.use('/path/*', middleware)` for scoped
- Context object: `c.req` for request, `c.json()` for JSON response, `c.status()` for status code
- Routing: `app.get()`, `app.post()`, `app.put()`, `app.delete()` with path params `/:id`
- Validation: use Zod with `zValidator` middleware for request validation
- Built for edge runtimes — no Node.js-specific APIs in shared code

### jq
- Pipe data through filters: `jq '.field'`, `jq '.[] | .name'`
- Select with conditions: `jq 'select(.age > 18)'`
- Transform arrays: `jq 'map(.price * 1.1)'` for 10% increase
- Combine filters: `jq '.items[] | select(.active) | .name'`
- Use `-r` for raw output (no quotes), `-c` for compact JSON
- Handle nulls safely: `jq '.field // "default"'`

### performance-optimizer
- Measure before optimizing (baseline metrics required)
- Profile hot paths: CPU profilers, memory snapshots, database query logs
- Fix N+1 queries: use joins, batch loading, DataLoader pattern
- Optimize rendering: memoization, virtualization, code splitting
- Reduce bundle size: tree shaking, lazy loading, dynamic imports
- Measure after fixes and prove improvement with numbers

### skill-check
- Validate skill structure: frontmatter, purpose, when-to-use, examples
- Check semantic correctness: triggers match description, rules are actionable
- Verify naming conventions: kebab-case filenames, clear skill names
- Ensure examples are runnable and correct
- Catch common issues: missing frontmatter, vague rules, over-complex instructions

### tmux
- Session management: `tmux new -s name`, `tmux attach -t name`, `tmux ls`
- Window management: `Ctrl+b c` (new), `Ctrl+b n/p` (next/prev), `Ctrl+b ,` (rename)
- Pane management: `Ctrl+b %` (vertical split), `Ctrl+b "` (horizontal), `Ctrl+b arrow` (navigate)
- Detach/reattach: `Ctrl+b d` to detach, `tmux attach` to reattach
- Copy mode: `Ctrl+b [` to enter, `Space` to start selection, `Enter` to copy

### issue-creation
- Follow GitHub issue templates if available
- Clear title: action verb + component + problem (e.g., "Fix: Auth middleware throws on expired tokens")
- Description: expected behavior, actual behavior, steps to reproduce
- Include context: environment, version, error logs, screenshots
- Label appropriately: bug/feature/enhancement
- Link to related issues or PRs

### branch-pr
- Branch naming: `feature/description`, `bugfix/description`, `hotfix/description`
- Commit messages: conventional commits (feat:, fix:, docs:, refactor:)
- PR description: summary of changes, why needed, testing done, breaking changes
- Link PR to issue: use "Closes #123" or "Fixes #123" in description
- Request reviewers, assign yourself
- Ensure CI passes before requesting review

### skill-creator
- Follow Agent Skills spec for structure and frontmatter
- Include clear triggers in description (when to auto-load)
- Write actionable rules ("do X", "never Y"), not philosophical guidance
- Provide runnable examples for critical patterns
- Keep instructions concise (5-15 lines per rule)
- Test skill with real scenarios before publishing

### go-testing
- Table-driven tests: define `tests := []struct{ name, input, want }`, loop with `t.Run`
- Use `t.Helper()` in test helpers to report caller location
- Mock interfaces with `gomock` or manual stubs
- Bubbletea TUI testing: use `teatest.NewModel()` and simulate keypresses with `Send()`
- Coverage: `go test -cover -coverprofile=coverage.out`
- Benchmark: `func BenchmarkX(b *testing.B)` with `b.N` loop

### react-doctor
- Run after React changes: `npx -y react-doctor@latest . --verbose --diff`
- Catches security, performance, correctness, architecture issues
- Outputs 0-100 score with actionable diagnostics
- Fix errors first, then re-run to verify score improved
- Use `--diff` to see only issues in changed files

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| CLAUDE.md | C:\Users\elkaw\Desktop\Proyecto adopcion\App\FRONTEND_GESTION\CLAUDE.md | Index — references files below |
| AGENTS.md | C:\Users\elkaw\Desktop\Proyecto adopcion\App\FRONTEND_GESTION\AGENTS.md | Referenced by CLAUDE.md |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
