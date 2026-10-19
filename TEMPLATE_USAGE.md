Template / Content reuse guidance

## Policy

- **Code and configuration** (everything outside `libs/*/src/md/`): Licensed under [MIT](./LICENSE). Reuse the project skeleton freely.
- **Portfolio content** (`libs/*/src/md/` files — biography, projects, publications, blog posts): Licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). These are example content only — replace with your own. Do not copy sample content into your portfolio.

## Why two licenses

The template structure (Next.js app, Nx workspace, scripts, configuration) is code
and benefits from a permissive license that lets others fork and adapt it. The
sample content (biography text, project descriptions, publication details, images)
is creative work that the content author may wish to reserve for their own use.

## Forking this template

1. Fork or duplicate this repository.
2. Replace `libs/content/src/md/profile.md` with your own biography and profile.
3. Replace or delete the sample content under `libs/projects/src/md/`, `libs/publications/src/md/`, and `libs/blog/src/md/`.
4. Delete `draft: true` from any frontmatter to publish an entry.
5. Update site metadata in `apps/main/src/configs/site-config.ts` as needed.
6. Run `npx nx run main:dev` to preview locally, then push to deploy via GitHub Actions.

See [docs/operations/deployment.md](docs/operations/deployment.md) for detailed fork/deployment instructions.
