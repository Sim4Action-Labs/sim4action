# Contributing to SIM4Action

Thank you for your interest in contributing to SIM4Action! This document provides guidelines and information for contributors.

## How to Contribute

### Reporting Bugs

- Use the [bug report template](https://github.com/Sim4Action-Labs/sim4action/issues/new?template=bug_report.md)
- Include your browser, OS, and Python version
- Provide steps to reproduce the issue
- Include screenshots or error messages if applicable

### Suggesting Features

- Use the [feature request template](https://github.com/Sim4Action-Labs/sim4action/issues/new?template=feature_request.md)
- Describe the use case and expected behaviour
- Explain how the feature aligns with the platform's goals

### Pull Requests

1. Fork the repository and create a feature branch from `main`
2. Make your changes, following the code style guidelines below
3. Add or update tests for your changes
4. Ensure all tests pass: `pytest tests/ -v`
5. Ensure code passes linting: `ruff check platform/*.py tests/`
6. Submit a pull request using the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

## Code Style

### Python
- Follow PEP 8 conventions
- Use type hints where practical
- Use `ruff` for linting

### JavaScript
- ES6+ syntax with ES module imports/exports
- No build step or bundler required
- JSDoc comments for public functions and classes

### General
- Keep the no-build-step frontend philosophy: no npm, webpack, or bundlers
- Platform code must remain domain-agnostic: no system-specific logic
- Configuration belongs in `systems/{id}/config.json`, not in platform code

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Sim4Action-Labs/sim4action.git
cd sim4action

# Install Python dependencies
pip install networkx pandas pytest ruff

# Run the server (serves the demo system)
python platform/server.py

# Run the test suite
pytest tests/ -v

# Run the linter
ruff check platform/*.py tests/
```

## Testing

- Python tests use `pytest` and are located in `tests/`
- JavaScript tests for `diffusion.js` use Node.js and are in `tests/test_diffusion_node.mjs`
- All pull requests must pass CI before merging

## Contributor License Agreement

By submitting a pull request, you agree that your contributions are licensed under the same AGPL-3.0 license that covers the project. The project maintainer retains the right to offer the software under alternative licenses for commercial use.

## Questions?

Open a [discussion](https://github.com/Sim4Action-Labs/sim4action/discussions) or [issue](https://github.com/Sim4Action-Labs/sim4action/issues) on GitHub.
