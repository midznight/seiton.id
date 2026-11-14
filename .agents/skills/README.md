# Agent Skills — Seiton.id

Skill standar Agent Skills yang tersedia di repository ini berada di `.agents/skills/<nama-skill>/SKILL.md`.

## Cara memanggil

Gunakan instruksi bahasa alami yang menyebut nama skill, misalnya:

- "Gunakan `brainstorming` untuk merumuskan ruang lingkup fitur ini."
- "Ikuti `test-driven-development` dengan siklus RED-GREEN-REFACTOR."
- "Gunakan `systematic-debugging` untuk menemukan akar masalah sebelum mengubah kode."
- "Minta `domain-driven-design` meninjau bounded context dan domain model."
- "Jalankan `differential-review` untuk meninjau perubahan keamanan pada branch ini."
- "Gunakan `web-design-guidelines` dan `frontend-design` untuk mengaudit UI."

Agent yang mendukung pemanggilan eksplisit dapat memakai `/nama-skill` (misalnya Claude Code) atau `$nama-skill` (misalnya Codex). Sintaks yang tepat bergantung pada coding-agent/harness. Skill dengan metadata `description` juga dapat dipilih otomatis oleh agent ketika permintaan cocok.

## Daftar skill

### Discovery dan workflow
- `find-skills`
- `brainstorming`
- `writing-plans`
- `executing-plans`
- `dispatching-parallel-agents`
- `subagent-driven-development`
- `using-superpowers`
- `using-git-worktrees`
- `finishing-a-development-branch`
- `requesting-code-review`
- `receiving-code-review`
- `writing-skills`
- `diagnosing-superpowers`

### Testing dan debugging
- `test-driven-development`
- `systematic-debugging`
- `verification-before-completion`
- `grill-me` (shortcut; delegates to `grilling`)
- `grilling` (dependency for `grill-me`)
- `tdd`
- `fallow`
- `fallow-review`
- `fallow-mutation`
- `fallow-setup`
- `fallow-cloud-setup`
- `regression-hunt`
- `testing-handbook-generator`
- `post-patch-validation`

### Arsitektur, API, dan data
- `domain-driven-design`
- `vertical-slice-architecture`
- `service-boundaries`
- `event-driven-systems`
- `persistence-design`
- `event-sourcing`
- `codebase-design`
- `design-review`
- `api-and-interface-design`
- `archify`

### Security dan code review
- `audit-context-building`
- `differential-review`
- `sharp-edges`
- `sarif-parsing`
- `supply-chain-risk-auditor`
- `variant-analysis`
- `vulnerability-triage-brocards`
- `agentic-actions-auditor`
- `semgrep-rule-creator`
- `semgrep-rule-variant-creator`
- `code-improver`
- `pr-improver`

### Frontend dan desain
- `ui-ux-pro-max` (sudah tersedia sebelumnya dengan data, referensi, dan skrip pendukung)
- `frontend-design`
- `web-design-guidelines`
- `impeccable`
- `design-taste-frontend`

## Asal repositori

- `find-skills`: `vercel-labs/skills` (direktori `skills/find-skills`; nama repo yang diberikan semula tidak ditemukan).
- Superpowers: `obra/superpowers`.
- `grill-me` dan `tdd`: `mattpocock/skills`.
- Skill arsitektur: `eralmansouri/skills`.
- `archify`: `tt-a1i/archify`.
- Skill Fallow: `fallow-rs/fallow-skills`.
- `api-and-interface-design`: `addyosmani/agent-skills`.
- Skill audit/review yang dipilih: `trailofbits/skills`.
- `frontend-design`: `anthropics/skills`.
- `web-design-guidelines`: `vercel-labs/agent-skills` (nama repo yang diberikan semula bukan repositori sumbernya).
- `impeccable`: `pbakaus/impeccable`.
- `design-taste-frontend`: `Leonxlnx/taste-skill`.
- `ui-ux-pro-max`: `nextlevelbuilder/ui-ux-pro-max-skill` (sudah ada di repository sebelum perubahan ini).

## Catatan kompatibilitas dan kelengkapan

1. Penyalinan manual ini menambahkan berkas `SKILL.md`. Sebagian skill dari upstream juga merujuk ke folder `references/`, `scripts/`, data, binary, atau CLI terpisah. Berkas pendukung tersebut tidak semuanya divendorkan oleh fallback ini. Untuk fungsi penuh, ikuti langkah setup di `SKILL.md` dan dokumentasi upstream—terutama Archify, Impeccable, Taste Skill, dan Fallow CLI.
2. `wshobson/agents` tidak menyediakan `backend-architect`, `database-architect`, atau `security-auditor` sebagai skill berformat `SKILL.md`; nama-nama tersebut adalah agent profiles di bawah `plugins/*/agents/`. Karena itu, berkas tersebut tidak disamarkan sebagai Agent Skills.
3. Skill `ui-ux-pro-max` tidak disalin ulang karena sudah terpasang lengkap pada branch utama.
4. Perubahan manual dilakukan melalui GitHub, karena sesi ini tidak memiliki terminal/working tree yang terhubung ke root proyek. Perintah `npx skills add` yang dicantumkan dalam permintaan tidak dijalankan di terminal proyek.

