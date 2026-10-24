# Documentation Index

This directory contains the full documentation for the academic portfolio template.
Start with the document that matches your goal:

| If you want to…                                          | Read                                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Understand the project's purpose and acceptance criteria | [product/goals-and-requirements.md](product/goals-and-requirements.md)       |
| Follow the visual design and experience phases           | [roadmap/visual-design-roadmap.md](roadmap/visual-design-roadmap.md)         |
| Add or edit projects and publications (Markdown)         | [product/content-authoring.md](product/content-authoring.md)                 |
| Understand how the application is structured             | [architecture/overview.md](architecture/overview.md)                         |
| Understand why key technical decisions were made         | [architecture/decisions/](architecture/decisions/) (see below)               |
| Set up the project locally and run checks                | [operations/local-development.md](operations/local-development.md)           |
| Deploy or reconfigure deployment                         | [operations/deployment.md](operations/deployment.md)                         |
| Update dependencies                                      | [operations/dependency-maintenance.md](operations/dependency-maintenance.md) |
| Troubleshoot common issues                               | [operations/troubleshooting.md](operations/troubleshooting.md)               |
| Write and run accessibility tests                        | [operations/accessibility-testing.md](operations/accessibility-testing.md)   |
| Review Lighthouse CI performance audit results           | [performance/before-after.md](performance/before-after.md)                   |

## Architecture Decision Records

| ADR                                                                     | Decision                             | Key trade-off                                                            |
| ----------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| [0001](architecture/decisions/0001-static-hosting.md)                   | Static export on GitHub Pages        | No SSR or ISR — all pages prerendered                                    |
| [0002](architecture/decisions/0002-workspace-tooling.md)                | Retain Nx workspace                  | ~150MB deps for dependency-aware builds and task orchestration           |
| [0003](architecture/decisions/0003-markdown-content.md)                 | `gray-matter` + `marked`             | No HTML sanitization — content must be trusted                           |
| [0004](architecture/decisions/0004-content-validation-and-rendering.md) | Runtime frontmatter validation       | Invalid content fails the build                                          |
| [0005](architecture/decisions/0005-testing-strategy.md)                 | Vitest as sole test framework        | No Jest compatibility                                                    |
| [0006](architecture/decisions/0006-shared-frontend-tooling.md)          | Adopt shared Prettier/ESLint configs | Upstream changes require workspace updates                               |
| [0007](architecture/decisions/0007-licensing-policy.md)                 | Three-tier licensing policy          | Separate licenses for code, sample content, and owner content            |
| [0008](architecture/decisions/0008-design-system.md)                    | Design-system library                | New Nx project adds config overhead; mitigates via strict boundary rules |

## Frontend Modernization

| Document                                                                                     | Description                                                 |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [architecture/audit-frontend-modernization.md](architecture/audit-frontend-modernization.md) | Audit of the implementation brief vs. the actual repository |
| [roadmap/frontend-modernization.md](roadmap/frontend-modernization.md)                       | Phased implementation plan (Phases 4–6)                     |
| [tickets/](tickets/)                                                                         | Implementation-ready work items (T-001 through T-010b)      |
