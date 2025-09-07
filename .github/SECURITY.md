# Security Policy

## Supported Versions

Currently supporting security updates for:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within DeepSix, please create a PR. All security vulnerabilities will be promptly addressed.

### Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Measures

This project implements several security measures:

### 1. **Dependency Management**

- Automated dependency updates via Dependabot
- Weekly security scans for vulnerable packages
- Strict version pinning for critical dependencies

### 2. **API Security**

- Rate limiting on all API endpoints (100 requests/minute)
- Input validation and sanitization
- Error handling without information disclosure
- CORS restricted to specific domains

### 3. **Environment Variables**

- Sensitive data stored in environment variables
- No hardcoded secrets in codebase
- GitHub Secrets for CI/CD

### 4. **Build Security**

- ESLint security rules enabled
- TypeScript strict mode
- No exposed API keys in client-side code

## Automated Security

This repository uses:

- **Dependabot** for automated dependency updates
- **GitHub Security Advisories** for vulnerability alerts
- **CodeQL** analysis (if enabled in GitHub settings)

## Response Time

- Critical vulnerabilities: 24-48 hours
- High severity: 3-5 days
- Medium/Low severity: 1-2 weeks
