# Contributing to Spring Radio

This document outlines the Git workflow and development process for contributing to Spring Radio.

## Git Workflow

### Branch Strategy

- `main` - Production branch. All deployments are made from this branch.
- `feature/*` - Feature branches for new development
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Emergency fixes for production issues

### Development Process

1. Create a new branch from `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

2. Make your changes locally:
- Use `./dev.sh` to run the development environment
- Test your changes thoroughly
- Commit your changes with meaningful commit messages

3. Keep your branch up to date:
```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git rebase main
```

4. Push your branch and create a Pull Request:
```bash
git push origin feature/your-feature-name
```
- Create a Pull Request on GitHub
- Add a clear description of your changes
- Request review from team members

5. Code Review Process:
- At least one approval is required
- Address any feedback and make necessary changes
- Keep commits clean and organized

6. Merging:
- Once approved, your PR will be merged into `main`
- Delete your feature branch after merging

### Deployment

Only authorized team members can deploy to production:

1. Ensure you're on the `main` branch:
```bash
git checkout main
git pull origin main
```

2. Deploy using the deployment script:
```bash
./deploy.sh
```

3. Verify the deployment at:
- Client: https://spring-radio.lm.r.appspot.com
- API: https://api-dot-spring-radio.lm.r.appspot.com

## Development Guidelines

### Local Development

1. Set up your environment:
```bash
# Clone the repository
git clone https://github.com/your-username/Spring-Radio.git
cd Spring-Radio

# Install dependencies
cd client && npm install
cd ../server && npm install
```

2. Start the development environment:
```bash
./dev.sh
```

### Testing

Before submitting a PR:
1. Test your changes locally
2. Ensure all features work as expected
3. Test file uploads and other critical functionality
4. Check for any console errors
5. Verify API endpoints work correctly

### Code Style

- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write clean, maintainable code

## Questions?

If you have any questions about the contribution process, feel free to:
1. Open an issue for discussion
2. Ask in the team chat
3. Contact the project maintainers
