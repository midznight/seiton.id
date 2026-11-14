# AI Agent Skills — Seiton.id

## Lokasi dan cara kerja

Skill dipasang secara lokal untuk proyek ini, bukan secara global ke mesin developer. Direktori utama:

`.agents/skills/<skill-name>/SKILL.md`

Claude Code juga memiliki salinan kompatibel di `.claude/skills/` untuk skill yang memang ada di lokasi tersebut. Agen yang mendukung standar Agent Skills dapat memuat berkas `SKILL.md` sesuai nama dan deskripsi frontmatter.

## Ringkasan per kategori

| Kategori | Repository | Hasil |
|---|---|---|
| Meta / workflow | obra/superpowers | 15 skill |
| Perencanaan / TDD | mattpocock/skills | grill-me, tdd |
| Arsitektur / DDD | eralmansouri/skills | 8 skill |
| Arsitektur kode | tt-a1i/archify | archify |
| Analisis kode Rust | fallow-rs/fallow-skills | 7 skill |
| API contract | addyosmani/agent-skills | api-and-interface-design |
| Security research | trailofbits/skills | 97 skill |
| Frontend design | anthropics/skills | frontend-design |
| Design system | pbakaus/impeccable | impeccable |
| Taste / anti-template | Leonxlnx/taste-skill | design-taste-frontend |
| Design intelligence | nextlevelbuilder/ui-ux-pro-max-skill | ui-ux-pro-max (sudah terpasang sebelumnya) |
| Skill discovery | vercel-labs/skills | find-skills (sudah ada sebelumnya; nama sumber pada permintaan perlu dikoreksi) |
| Web design review | vercel-labs/agent-skills + vercel-labs/web-interface-guidelines | web-design-guidelines (fallback manual, aturan dipin lokal) |
| Backend / database / security | wshobson/agents | backend-architect, database-architect, security-auditor (fallback manual dari agent definitions) |


## Kegagalan CLI dan penanganannya

1. `vercel-labs/find-skills` bukan repository standalone. Skill resminya adalah `vercel-labs/skills` pada `skills/find-skills/SKILL.md`; skill yang benar sudah ada dan diverifikasi terhadap sumber upstream. Ditambahkan `UPSTREAM.md` dan `LICENSE`.
2. `vercel-labs/web-design-guidelines` bukan repository standalone. Skill resmi ditemukan di `vercel-labs/agent-skills/skills/web-design-guidelines/SKILL.md`. Skill dipasang manual bersama snapshot aturan `guidelines.md` dari `vercel-labs/web-interface-guidelines` commit `434b7f91364665f2f733b310ec54809bf8f37937`. Snapshot lokal digunakan agar review tidak menerima perubahan instruksi remote yang tidak ditinjau.
3. `wshobson/agents` menyediakan `backend-architect`, `database-architect`, dan `security-auditor` sebagai agent-definition Markdown, bukan format Skills. Isi arahan upstream dipertahankan dan dibungkus dengan frontmatter Agent Skills pada folder skill masing-masing.
4. `nextlevelbuilder/ui-ux-pro-max-skill` tidak diinstal ulang karena telah tersedia dari pekerjaan sebelumnya.

## Cara memanggil

Tuliskan nama skill dan pekerjaan yang ingin dilakukan dalam prompt coding agent. Contoh:

- `Use brainstorming to clarify requirements before implementing this feature.`
- `Use writing-plans to prepare a staged implementation plan.`
- `Use tdd to implement this endpoint test-first.`
- `Use systematic-debugging to investigate the failing order flow.`
- `Use domain-driven-design to identify the bounded contexts and invariants.`
- `Use event-driven-systems to design reliable order notifications.`
- `Use backend-architect to review the Worker API boundaries and retry/idempotency strategy.`
- `Use database-architect to review the D1 schema, indexes, and transaction boundaries.`
- `Use security-auditor to threat-model this change and assess OWASP risks.`
- `Use frontend-design and web-design-guidelines to implement and review a page.`
- `Use ui-ux-pro-max to select the appropriate interface pattern and accessibility guidance.`
- `Use impeccable and design-taste-frontend to critique and refine visual hierarchy.`
- `Use find-skills to discover an additional skill for a specialized task.`

Jika agen mendukung auto-selection, ia juga dapat memilih skill dari `name` dan `description` pada frontmatter tanpa pemanggilan eksplisit.

## Indeks folder skill

- `.agents/skills/address-sanitizer/SKILL.md`
- `.agents/skills/adjudicate-regression/SKILL.md`
- `.agents/skills/aflpp/SKILL.md`
- `.agents/skills/agentic-actions-auditor/SKILL.md`
- `.agents/skills/algorand-vulnerability-scanner/SKILL.md`
- `.agents/skills/api-and-interface-design/SKILL.md`
- `.agents/skills/archify/SKILL.md`
- `.agents/skills/atheris/SKILL.md`
- `.agents/skills/audit-augmentation/SKILL.md`
- `.agents/skills/audit-context-building/SKILL.md`
- `.agents/skills/audit-prep-assistant/SKILL.md`
- `.agents/skills/backend-architect/SKILL.md`
- `.agents/skills/brainstorming/SKILL.md`
- `.agents/skills/burpsuite-project-parser/SKILL.md`
- `.agents/skills/c-review/SKILL.md`
- `.agents/skills/cairo-vulnerability-scanner/SKILL.md`
- `.agents/skills/cargo-fallow/SKILL.md`
- `.agents/skills/cargo-fuzz/SKILL.md`
- `.agents/skills/chrome-mcp-troubleshooting/SKILL.md`
- `.agents/skills/code-improver/SKILL.md`
- `.agents/skills/code-maturity-assessor/SKILL.md`
- `.agents/skills/codebase-design/SKILL.md`
- `.agents/skills/codeql/SKILL.md`
- `.agents/skills/constant-time-analysis/SKILL.md`
- `.agents/skills/constant-time-testing/SKILL.md`
- `.agents/skills/cosmos-vulnerability-scanner/SKILL.md`
- `.agents/skills/coverage-analysis/SKILL.md`
- `.agents/skills/crypto-protocol-diagram/SKILL.md`
- `.agents/skills/cvss-scoring/SKILL.md`
- `.agents/skills/database-architect/SKILL.md`
- `.agents/skills/design-review/SKILL.md`
- `.agents/skills/design-taste-frontend/SKILL.md`
- `.agents/skills/devcontainer-setup/SKILL.md`
- `.agents/skills/diagnosing-superpowers/SKILL.md`
- `.agents/skills/diagramming-code/SKILL.md`
- `.agents/skills/differential-review/SKILL.md`
- `.agents/skills/dimensional-analysis/SKILL.md`
- `.agents/skills/dispatching-parallel-agents/SKILL.md`
- `.agents/skills/domain-driven-design/SKILL.md`
- `.agents/skills/dwarf-expert/SKILL.md`
- `.agents/skills/entry-point-analyzer/SKILL.md`
- `.agents/skills/event-driven-systems/SKILL.md`
- `.agents/skills/event-sourcing/SKILL.md`
- `.agents/skills/executing-plans/SKILL.md`
- `.agents/skills/fallow/SKILL.md`
- `.agents/skills/fallow-cloud-setup/SKILL.md`
- `.agents/skills/fallow-codex-onboarding/SKILL.md`
- `.agents/skills/fallow-mutation/SKILL.md`
- `.agents/skills/fallow-review/SKILL.md`
- `.agents/skills/fallow-setup/SKILL.md`
- `.agents/skills/find-skills/SKILL.md`
- `.agents/skills/finishing-a-development-branch/SKILL.md`
- `.agents/skills/firebase-apk-scanner/SKILL.md`
- `.agents/skills/fp-check/SKILL.md`
- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/fuzzing-dictionary/SKILL.md`
- `.agents/skills/fuzzing-obstacles/SKILL.md`
- `.agents/skills/genotoxic/SKILL.md`
- `.agents/skills/gh-cli/SKILL.md`
- `.agents/skills/github-triage/SKILL.md`
- `.agents/skills/goal-prompt/SKILL.md`
- `.agents/skills/graph-evolution/SKILL.md`
- `.agents/skills/grill-me/SKILL.md`
- `.agents/skills/guidelines-advisor/SKILL.md`
- `.agents/skills/harness-writing/SKILL.md`
- `.agents/skills/hunt-regressions/SKILL.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/implement-patch/SKILL.md`
- `.agents/skills/interpreting-culture-index/SKILL.md`
- `.agents/skills/let-fate-decide/SKILL.md`
- `.agents/skills/libafl/SKILL.md`
- `.agents/skills/libfuzzer/SKILL.md`
- `.agents/skills/mermaid-to-proverif/SKILL.md`
- `.agents/skills/modern-cpp/SKILL.md`
- `.agents/skills/modern-python/SKILL.md`
- `.agents/skills/mutation-testing/SKILL.md`
- `.agents/skills/open-sourcing/SKILL.md`
- `.agents/skills/ossfuzz/SKILL.md`
- `.agents/skills/patching-bugs/SKILL.md`
- `.agents/skills/persistence-design/SKILL.md`
- `.agents/skills/post-patch-validation/SKILL.md`
- `.agents/skills/pr-improver/SKILL.md`
- `.agents/skills/prepare-regression/SKILL.md`
- `.agents/skills/property-based-testing/SKILL.md`
- `.agents/skills/prove-patch/SKILL.md`
- `.agents/skills/receiving-code-review/SKILL.md`
- `.agents/skills/regression-hunt/SKILL.md`
- `.agents/skills/replay-regression/SKILL.md`
- `.agents/skills/report-regressions/SKILL.md`
- `.agents/skills/reproduce-bug/SKILL.md`
- `.agents/skills/reproduce-regression/SKILL.md`
- `.agents/skills/requesting-code-review/SKILL.md`
- `.agents/skills/review-walkthrough/SKILL.md`
- `.agents/skills/rust-review/SKILL.md`
- `.agents/skills/ruzzy/SKILL.md`
- `.agents/skills/sarif-parsing/SKILL.md`
- `.agents/skills/second-opinion/SKILL.md`
- `.agents/skills/secure-workflow-guide/SKILL.md`
- `.agents/skills/security-auditor/SKILL.md`
- `.agents/skills/semgrep/SKILL.md`
- `.agents/skills/semgrep-rule-creator/SKILL.md`
- `.agents/skills/semgrep-rule-variant-creator/SKILL.md`
- `.agents/skills/service-boundaries/SKILL.md`
- `.agents/skills/sharp-edges/SKILL.md`
- `.agents/skills/skill-improver/SKILL.md`
- `.agents/skills/slicing-code-context/SKILL.md`
- `.agents/skills/solana-vulnerability-scanner/SKILL.md`
- `.agents/skills/spec-to-code-compliance/SKILL.md`
- `.agents/skills/subagent-driven-development/SKILL.md`
- `.agents/skills/substrate-vulnerability-scanner/SKILL.md`
- `.agents/skills/supply-chain-risk-auditor/SKILL.md`
- `.agents/skills/systematic-debugging/SKILL.md`
- `.agents/skills/taint-trace/SKILL.md`
- `.agents/skills/tdd/SKILL.md`
- `.agents/skills/test-driven-development/SKILL.md`
- `.agents/skills/testing-handbook-generator/SKILL.md`
- `.agents/skills/token-integration-analyzer/SKILL.md`
- `.agents/skills/ton-vulnerability-scanner/SKILL.md`
- `.agents/skills/trailmark/SKILL.md`
- `.agents/skills/trailmark-finding-triage/SKILL.md`
- `.agents/skills/trailmark-review-gate/SKILL.md`
- `.agents/skills/trailmark-structural/SKILL.md`
- `.agents/skills/trailmark-summary/SKILL.md`
- `.agents/skills/trailmark-variant-neighborhood/SKILL.md`
- `.agents/skills/ui-ux-pro-max/SKILL.md`
- `.agents/skills/using-git-worktrees/SKILL.md`
- `.agents/skills/using-superpowers/SKILL.md`
- `.agents/skills/validate-bug/SKILL.md`
- `.agents/skills/variant-analysis/SKILL.md`
- `.agents/skills/vector-forge/SKILL.md`
- `.agents/skills/verification-before-completion/SKILL.md`
- `.agents/skills/vertical-slice-architecture/SKILL.md`
- `.agents/skills/vulnerability-triage-brocards/SKILL.md`
- `.agents/skills/web-design-guidelines/SKILL.md`
- `.agents/skills/writing-lean-proofs/SKILL.md`
- `.agents/skills/writing-plans/SKILL.md`
- `.agents/skills/writing-skills/SKILL.md`
- `.agents/skills/wycheproof/SKILL.md`
- `.agents/skills/yara-rule-authoring/SKILL.md`
- `.agents/skills/zeroize-audit/SKILL.md`

## Provenance dan pemeliharaan

- `skills-lock.json` memuat sumber, jalur upstream, dan hash untuk skill yang dikelola oleh Skills CLI.
- Skill yang diimpor manual menyertakan `UPSTREAM.md` dan lisensi yang sesuai di folder skill.
- Tinjau diff dan sumber upstream sebelum pembaruan. Jangan menjalankan skrip atau perintah yang disediakan skill tanpa pemeriksaan terlebih dahulu.
