# Trading Bot Swarm Copilot & Codex Configuration Guide

## Purpose and Scope
- Establish a repeatable, security-first setup for GitHub Copilot and Codex acting as pair programmers within the Trading Bot Swarm ecosystem.
- Ensure assistants apply consistent style, testing, and release behaviors while protecting secrets and production assets.
- Define behavioral guardrails so AI-assisted changes stay reviewable, observable, and aligned with automated quality gates.

## Configuration Overview
- **Testing & Linting:** Always run unit tests and linters for code changes; documentation-only edits can skip. Gate merges on green checks.
- **Code Style:** Prefer explicit types, small pure functions, and early returns. Keep imports ordered, avoid unused symbols, and document public methods.
- **Async Patterns:** Use `async/await` with centralized error logging. Avoid silent promise handling; wrap long-running tasks with timeouts.
- **Security Defaults:** Never commit secrets. Enforce `.env.example` patterns, minimum permissions for tokens, and audit logging for automation.
- **Logging & Observability:** Emit structured logs with request identifiers. Add metrics for key flows (signals received, trades executed, failures).
- **CI/CD Integration:** Require quality gates (lint + tests) before deploy. Block releases on vulnerability findings. Prefer ephemeral preview environments.
- **Version Control:** Use small, reviewable commits with descriptive messages. Reference issues in commit bodies when relevant.

## Custom Instruction Behavior
- **Copilot role:** Acts as a guarded pair programmer that proposes minimal, reversible changes and cites rationale in comments when code paths are non-obvious.
- **Codex role:** Enforces policy compliance—rejects unsafe patterns, adds TODOs for missing tests, and reminds contributors to run quality gates.
- **Example behavioral rules:**
  - Always surface potential security or performance regressions in review notes.
  - Decline to generate code that bypasses existing lint, test, or auth flows.
  - Prefer dependency-free solutions unless a library is already standardized.

### Conceptual YAML Custom Instructions
```yaml
copilot:
  purpose: "Safe, policy-aware pair programming for Trading Bot Swarm"
  guardrails:
    - enforce_tests: true
    - enforce_linters: true
    - forbid_secret_injection: true
    - prefer_existing_patterns: true
  coding_style:
    imports: ordered
    functions: small_pure
    comments: explain_nonobvious_logic
  async:
    default_pattern: async_await
    error_handling: centralized_logging
  documentation:
    update_required: when_behavior_changes

codex:
  purpose: "Policy enforcer and reviewer for automation and releases"
  behaviors:
    - reject: missing_tests_on_code_changes
    - reject: bypassing_ci
    - flag: missing_security_checks
  review_notes:
    - remind: run_lint_and_tests
    - remind: skip_checks_for_docs_only
    - remind: rotate_tokens_and_audit_logs
```

## GitHub Workflow Example: Lint and Test Automation
Trigger on pull requests to `main` and manual dispatch. Blocks merge if lint or tests fail.
```yaml
name: quality-gate

on:
  pull_request:
    branches: [main]
  workflow_dispatch: {}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm test -- --runInBand
```

## Semantic Release and Version Tagging
- Adopt conventional commits for auto-generated changelogs and tags.
- Protect `main` so releases run only from CI with a service token.
- Example workflow:
```yaml
name: release

on:
  workflow_dispatch: {}
  push:
    branches: [main]

jobs:
  semantic-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Semantic release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

## Security and Dependency Scanning
- Run security scans on pull requests and nightly against `main`.
- Fail builds on critical vulnerabilities; create issues automatically.
```yaml
name: security-scan

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 2 * * *"

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Audit dependencies
        run: npm audit --production
      - name: Static analysis
        run: npm run lint:security
```

## Contributor Guidelines
- Propose changes via pull requests with concise summaries and linked issues.
- Include test and lint evidence for code changes; indicate when documentation-only changes skip checks.
- Review criteria: alignment with coding standards, security posture, observability coverage, and release readiness.
- Validation: reviewers approve only when quality gates are green and risk notes are addressed.

## Troubleshooting and Optimization
- **Frequent Copilot divergences:** Reset to repository instructions and re-open the session.
- **Lint failures:** Run `npm run lint -- --fix` and re-validate before pushing.
- **Flaky tests:** Quarantine with `@flaky` tags and open follow-up issues; do not disable CI gates.
- **Credential errors:** Rotate tokens, purge local caches, and retry with least-privilege scopes.

## Maintenance Schedule
- Review this guide monthly or after significant architectural, security, or tooling changes.
- Update CI snippets and custom instructions when new policies roll out.
- Track changes in release notes to keep automation and contributors aligned.

---
Goal: standardize excellence and strengthen the reliability, performance, and safety of the trading ecosystem.
