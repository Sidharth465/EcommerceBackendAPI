# 🛡️ Branch Protection Setup Guide

This document explains how to set up branch protection rules to enforce the Git flow in your repository.

## 🎯 Git Flow Rules

```
feature/*, bugfix/*, hotfix/* → develop (PR only)
                                   ↓
                               develop → trunk (PR only)
```

**🚫 Direct pushes to `trunk` and `develop` are NOT allowed!**

## ⚙️ GitHub Branch Protection Setup

### Step 1: Go to Repository Settings

1. Navigate to your GitHub repository
2. Click **Settings** tab
3. Click **Branches** in the left sidebar

### Step 2: Protect `main` Branch

1. Click **Add rule** or **Add protection rule**
2. Branch name pattern: `main`
3. Enable these settings:

#### Required Settings:

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (or more for team projects)
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if you have CODEOWNERS file)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks to require:
    - `Branch Flow Validation`
    - `Code Quality & Standards`
    - `PR Title Validation`
    - `Security & Dependencies`
    - `Build & Test`

- ✅ **Require conversation resolution before merging**
- ✅ **Restrict pushes that create files**
- ✅ **Restrict pushes to matching branches**

#### Admin Settings:

- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict pushes to matching branches**

### Step 3: Protect `develop` Branch

1. Click **Add rule** again
2. Branch name pattern: `develop`
3. Enable the same settings as `main` branch

### Step 4: Additional Restrictions (Optional)

Create rules for feature branches:

- Branch name pattern: `feature/*`
- ✅ **Delete head branches automatically** (cleans up after merge)

## 🚀 Enforced Workflow

### ✅ Allowed Operations:

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-api

# Work and push feature branch
git add .
git commit -m "feat: Add new API endpoint"
git push origin feature/new-api

# Create PR: feature/new-api → develop ✅
# After approval and merge, create release PR: develop → main ✅
```

### ❌ Blocked Operations:

```bash
# Direct push to main (BLOCKED)
git checkout main
git commit -m "hotfix"
git push origin main  # ❌ REJECTED

# Direct push to develop (BLOCKED)
git checkout develop
git commit -m "update"
git push origin develop  # ❌ REJECTED

# Feature branch to main (BLOCKED by CI)
# PR: feature/api → main  # ❌ CI FAILS
```

## 🔧 Emergency Procedures

### Hotfix Process:

1. Create hotfix branch from `main`
2. Fix the issue
3. Create PR: `hotfix/critical-bug → main`
4. After merge, create PR: `main → develop` (to sync changes)

### Admin Override (Emergency Only):

- Repository admins can temporarily disable protection
- **Always re-enable protection after emergency**
- Document the reason in commit messages

## 📊 Monitoring Compliance

### CI/CD Checks:

- Branch flow validation runs on every PR
- Detailed error messages guide developers
- Automatic PR comments show status

### GitHub Insights:

- Monitor branch protection bypasses
- Review merge patterns
- Track compliance metrics

## 🎓 Developer Guidelines

### Branch Naming Convention:

```
feature/user-authentication
feature/shopping-cart
bugfix/login-validation
bugfix/cart-calculation
hotfix/security-patch
hotfix/critical-performance
```

### PR Title Convention:

```
feat: Add user authentication system
fix: Resolve cart calculation bug
docs: Update API documentation
refactor: Simplify user service
```

### Workflow Commands:

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Regular commits
git add .
git commit -m "feat: Implement feature logic"
git push origin feature/my-feature

# Create PR via GitHub UI: feature/my-feature → develop
# After merge, delete feature branch
git checkout develop
git pull origin develop
git branch -d feature/my-feature
```

## 🆘 Troubleshooting

### "Push to main rejected"

**Solution:** Create a PR instead of direct push

### "Branch flow validation failed"

**Solution:** Follow the correct flow (feature → develop → main)

### "Status checks required"

**Solution:** Wait for all CI checks to pass before merging

### "Branch not up to date"

**Solution:** Merge latest changes from target branch

---

**This setup ensures code quality, prevents conflicts, and maintains a clean Git history!** 🚀
