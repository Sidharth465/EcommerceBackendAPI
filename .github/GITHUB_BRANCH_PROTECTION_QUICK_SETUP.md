# 🛡️ GitHub Branch Protection - Quick Setup Guide

## 🚨 Current Status

**Your trunk branch isn't protected** - This needs to be fixed immediately!

## ⚡ Quick Setup (5 minutes)

### Step 1: Go to Repository Settings

1. Navigate to your GitHub repository
2. Click **Settings** tab (top navigation)
3. Click **Branches** in left sidebar
4. Click **Add rule** button

### Step 2: Protect `trunk` Branch

#### Branch name pattern:

```
trunk
```

#### Check these boxes:

**🔒 Pull Request Requirements:**

- ✅ **Require a pull request before merging**
  - ✅ Required number of reviewers before merging: `1`
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (optional)

**🔍 Status Check Requirements:**

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ **Status checks to require** (add these):
    - `Code Quality & Standards`
    - `PR Title Validation`
    - `Security & Dependencies`
    - `Build & Test`

**💬 Conversation Requirements:**

- ✅ **Require conversation resolution before merging**

**🚫 Push Restrictions:**

- ✅ **Restrict pushes that create files**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict pushes to matching branches**

#### Click **Create** to save

### Step 3: Protect `develop` Branch

**Repeat Step 2 with these changes:**

- Branch name pattern: `develop`
- Same settings as trunk

### Step 4: Verify Protection

After setup, you should see:

```
🛡️ trunk - Protected
🛡️ develop - Protected
```

## 🎯 What This Achieves

### ✅ Enforced Git Flow:

```
feature/* → develop (PR required)
     ↓
  develop → trunk (PR required)
```

### ✅ Quality Gates:

- All CI/CD checks must pass
- Code review required
- No direct pushes allowed
- Conversations must be resolved

### ✅ Security:

- Prevents accidental force pushes
- Prevents branch deletion
- Requires status checks
- Enforces team review process

## 🚨 What Happens Without Protection

**❌ Anyone can:**

- Push directly to trunk/develop
- Force push and rewrite history
- Delete the branch
- Merge without review
- Bypass CI/CD checks

**✅ With Protection:**

- Only PRs allowed
- CI/CD must pass
- Review required
- History protected

## 🔧 Advanced Options (Optional)

### For Enterprise Teams:

- **Require signed commits**
- **Require deployments to succeed**
- **Lock branch** (read-only)
- **Allow force pushes** (for specific users)

### For Open Source:

- **Require status checks for administrators**
- **Include administrators** in restrictions

## 📋 Verification Checklist

After setup, test:

- [ ] Try to push directly to trunk (should fail)
- [ ] Try to push directly to develop (should fail)
- [ ] Create PR from feature branch to develop (should work)
- [ ] Try to merge PR without CI passing (should fail)
- [ ] Try to merge PR without review (should fail)

## 🆘 Troubleshooting

### "Status checks not found"

- Push a commit to trigger CI/CD first
- Status checks appear after first CI run

### "Can't add status checks"

- Make sure CI/CD workflow has run at least once
- Check workflow job names match exactly

### "Protection not working"

- Verify you're not a repository admin with bypass permissions
- Check if "Include administrators" is enabled

---

**⚡ This setup takes 5 minutes but protects your entire codebase!**
