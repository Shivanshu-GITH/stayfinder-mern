# Contributing to StayFinder

Thank you for taking the time to contribute! Here is everything you need to know.

## Getting started

1. **Fork** the repository and clone your fork locally.
2. Follow the [Getting Started](README.md#-getting-started) steps to set up your environment.
3. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development workflow

- `npm run dev` starts the server with nodemon (auto-restart on changes).
- Keep the `.env` file local — never commit it.
- Test your changes against a real MongoDB Atlas cluster and Cloudinary account.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|--------|-------------|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `chore:` | Tooling, deps, config — no production code change |
| `docs:` | Documentation only |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `style:` | Formatting, whitespace — no logic change |
| `test:` | Adding or updating tests |

Examples:
```
feat: add pagination to listings index
fix: prevent wishlist duplicate entries on rapid clicks
docs: update env variable instructions in README
```

## Pull requests

- Keep PRs focused — one feature or fix per PR.
- Describe *what* changed and *why* in the PR description.
- Make sure the app runs without errors before submitting.

## Reporting issues

Open a [GitHub Issue](https://github.com/Shivanshu-GITH/stayfinder-mern/issues) and include:
- Steps to reproduce
- Expected vs actual behaviour
- Your Node.js version (`node -v`) and OS
