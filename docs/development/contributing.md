# Contributing to FilaFlow

Thank you for your interest in contributing to FilaFlow! 

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/FilaFlow.git
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```

## Development Setup

### Backend (Python)
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Run server
uvicorn spoolman.main:app --reload
```

### Frontend (React)
```bash
cd client
npm install
npm run dev
```

The dev server runs on http://localhost:5173 with hot reload.

## Code Style

### Python
- Follow PEP 8
- Use type hints
- Run `ruff` for linting

### TypeScript/React
- Use functional components
- Follow existing patterns in `client/src/`
- Run `npm run lint` before committing

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new dashboard widget
fix: Correct progress bar calculation
docs: Update installation guide
chore: Update dependencies
```

## Pull Requests

1. Update CHANGELOG.md with your changes
2. Ensure all tests pass
3. Update documentation if needed
4. Create PR against `master` branch
5. Describe your changes clearly

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **PATCH** (0.1.X): Bug fixes
- **MINOR** (0.X.0): New features
- **MAJOR** (X.0.0): Breaking changes

Update `VERSION` file when releasing.

## Questions?

Open an issue on GitHub or reach out to the maintainers.
