# 🔐 JWT Authentication System - Complete Learning Guide

> **Senior Backend Developer's Guide: From Zero to Production**

This guide teaches you how to build a **production-grade JWT authentication system** with refresh tokens, exactly like the ones used by companies like Shopify, Stripe, and modern e-commerce platforms.

## 📚 **Table of Contents**

1. [Phase 1: Understanding Core Concepts](#-phase-1-understanding-core-concepts)
2. [Phase 2: Building Blocks](#️-phase-2-building-blocks)
3. [Phase 3: Security Layer](#️-phase-3-security-layer)
4. [Phase 4: Controllers](#-phase-4-controllers)
5. [Phase 5: Routes](#️-phase-5-routes)
6. [Phase 6: Complete Flow](#-phase-6-complete-flow)
7. [Learning Checklist](#-learning-checklist)
8. [Industry Usage](#-industry-usage)

---

## 🎯 **Phase 1: Understanding Core Concepts**

### **What Problem Are We Solving?**

**Traditional Session-Based Authentication:**

```typescript
// ❌ OLD WAY: Server stores user sessions
const traditionalSession = {
  server: {
    memory: {
      session_123: { userId: 'user_456', role: 'admin' },
    },
  },
  problems: [
    'Server memory usage grows with users',
    'Hard to scale horizontally',
    'Session data lost if server restarts',
    "Doesn't work well with mobile apps",
  ],
};
```

**Modern JWT-Based Authentication:**

```typescript
// ✅ NEW WAY: Store user data IN the token itself
const jwtApproach = {
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...', // Contains user data
  server: 'stateless', // No session storage needed
  benefits: [
    'Horizontal scaling',
    'Mobile-friendly',
    'No server memory usage',
    'Works across microservices',
  ],
};
```

### **The Two-Token Architecture**

```typescript
// 🎯 CORE CONCEPT: Why Two Tokens?
const authenticationStrategy = {
  accessToken: {
    purpose: 'Daily API requests',
    lifespan: '15 minutes',
    storage: 'Memory/localStorage',
    security: 'Short-lived = less risk if stolen',
  },
  refreshToken: {
    purpose: 'Generate new access tokens',
    lifespan: '7 days',
    storage: 'Database + client',
    security: 'Can be revoked + tracked',
  },
};

// 🔄 THE REFRESH CYCLE:
// Day 1: Login → Get both tokens
// Day 1-7: Use access token for APIs (refresh every 15min automatically)
// Day 8: Refresh token expires → User must login again
```

### **JWT Token Structure**

```typescript
// 📋 JWT FORMAT: header.payload.signature
const jwtStructure = {
  header: {
    alg: 'HS256', // Algorithm used to sign
    typ: 'JWT', // Token type
  },
  payload: {
    userId: 'uuid-123',
    email: 'user@example.com',
    role: 'customer',
    exp: 1234567890, // Expiration timestamp
    iss: 'your-app', // Issuer
    aud: 'your-frontend', // Audience
  },
  signature: 'HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)',
};
```

---

## 🏗️ **Phase 2: Building Blocks**

### **Step 1: JWT Service (Core Engine)**

> 🎯 **Build this FIRST** - This is your foundation

```typescript
// File: src/services/jwt.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class JWTService {
  // 🔑 STEP 1: Generate Access Token
  static generateAccessToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(
      {
        ...payload,
        type: 'access', // Mark token type
      },
      process.env.ACCESS_SECRET!,
      {
        expiresIn: '15m',
        issuer: 'your-app',
        audience: 'your-frontend',
      },
    );
  }

  // 🔄 STEP 2: Generate Refresh Token
  static generateRefreshToken(payload: { userId: string; familyId: string }): string {
    return jwt.sign(
      {
        ...payload,
        type: 'refresh',
      },
      process.env.REFRESH_SECRET!,
      {
        expiresIn: '7d',
        issuer: 'your-app',
        audience: 'your-frontend',
        jwtid: payload.familyId,
      },
    );
  }

  // ✅ STEP 3: Verify Access Token
  static verifyAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET!) as any;
      if (decoded.type !== 'access') throw new Error('Wrong token type');
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      }
      throw new Error('INVALID_ACCESS_TOKEN');
    }
  }

  // ✅ STEP 4: Verify Refresh Token
  static verifyRefreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET!) as any;
      if (decoded.type !== 'refresh') throw new Error('Wrong token type');
      return { ...decoded, familyId: decoded.jti };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      throw new Error('INVALID_REFRESH_TOKEN');
    }
  }

  // 🔐 STEP 5: Hash tokens for database storage
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
```

**📝 Learning Notes:**

```
JWT Service = Core Engine
- generateAccessToken() → Creates 15min token for API calls
- generateRefreshToken() → Creates 7day token for token renewal
- verifyAccessToken() → Validates API requests
- verifyRefreshToken() → Validates refresh requests
- hashToken() → Secure storage in database
```

### **Step 2: Database Models (Data Structure)**

> 🎯 **Build this SECOND** - Defines your data structure

```typescript
// File: src/models/refreshToken.model.ts
import { DataTypes, Sequelize } from 'sequelize';

export const defineRefreshTokenModel = (sequelize: Sequelize) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      tokenHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'token_hash',
      },
      familyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'family_id',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
      replacedByTokenId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'replaced_by_token_id',
      },
      userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'user_agent',
      },
      ip: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      deviceId: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: 'device_id',
      },
    },
    {
      tableName: 'refresh_tokens',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['tokenHash'], unique: true },
        { fields: ['familyId'] },
        { fields: ['expiresAt'] },
        { fields: ['revokedAt'] },
      ],
    },
  );

  return RefreshToken;
};
```

**🔍 Security Insight:**

```sql
-- Why we hash tokens in database
Raw JWT: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
SHA256 Hash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"

-- If database is compromised:
-- ❌ Raw JWT: Attacker can use tokens immediately
-- ✅ Hash: Attacker gets useless hash values
```

**📝 Learning Notes:**

```
Refresh Token Table = Security Storage
- Stores HASHED refresh tokens (not raw JWT)
- familyId = Groups tokens from same login session
- revokedAt = null means active, timestamp means revoked
- Device tracking for security monitoring
```

### **Step 3: Refresh Token Service (Token Operations)**

> 🎯 **Build this THIRD** - Handles token lifecycle

```typescript
// File: src/services/refreshToken.service.ts
export class RefreshTokenService {
  // 💾 STEP 1: Store new refresh token
  static async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    userAgent?: string;
    ip?: string;
    deviceId?: string;
  }) {
    return await RefreshToken.create(data);
  }

  // 🔍 STEP 2: Find token by hash
  static async findByHash(tokenHash: string) {
    return await RefreshToken.findOne({
      where: { tokenHash, revokedAt: null },
    });
  }

  // ✅ STEP 3: Validate refresh token (CRITICAL SECURITY)
  static async validateRefreshToken(token: string) {
    try {
      // A. Verify JWT signature & expiration
      const decoded = JWTService.verifyRefreshToken(token);

      // B. Check if token exists in database
      const tokenHash = JWTService.hashToken(token);
      const tokenRecord = await this.findByHash(tokenHash);

      if (!tokenRecord) {
        return { valid: false, reason: 'Token not found' };
      }

      // C. Check if token was revoked
      if (tokenRecord.revokedAt) {
        // 🚨 SECURITY ALERT: Token reuse detected!
        await this.revokeTokenFamily(tokenRecord.familyId);
        return { valid: false, reason: 'Token reuse detected' };
      }

      // D. Check database expiration
      if (tokenRecord.expiresAt < new Date()) {
        return { valid: false, reason: 'Token expired' };
      }

      return { valid: true, tokenRecord };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  // 🔄 STEP 4: Rotate tokens (create new, revoke old)
  static async rotateToken(oldToken: string, userInfo: any) {
    const validation = await this.validateRefreshToken(oldToken);

    if (!validation.valid) {
      return null;
    }

    // Create new tokens with SAME family ID
    const familyId = validation.tokenRecord.familyId;
    const newAccessToken = JWTService.generateAccessToken(userInfo);
    const newRefreshToken = JWTService.generateRefreshToken({
      userId: userInfo.userId,
      familyId,
    });

    // Store new refresh token
    const newTokenHash = JWTService.hashToken(newRefreshToken);
    await this.createRefreshToken({
      userId: userInfo.userId,
      tokenHash: newTokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Revoke old token
    const oldTokenHash = JWTService.hashToken(oldToken);
    await this.revokeToken(oldTokenHash);

    return { newAccessToken, newRefreshToken };
  }

  // ❌ STEP 5: Revoke token
  static async revokeToken(tokenHash: string) {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash } });
  }

  // 🚨 STEP 6: Revoke entire token family (security breach)
  static async revokeTokenFamily(familyId: string) {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { familyId, revokedAt: null } });
  }
}
```

**📝 Learning Notes:**

```
RefreshToken Service = Token Lifecycle Manager
- createRefreshToken() → Store new token in DB
- validateRefreshToken() → Multi-step security validation
- rotateToken() → Create new tokens, revoke old ones
- revokeToken() → Mark single token as invalid
- revokeTokenFamily() → Security breach response
```

---

## 🛡️ **Phase 3: Security Layer**

### **Step 4: Authentication Middleware (Request Guard)**

> 🎯 **Build this FOURTH** - Protects your routes

```typescript
// File: src/middleware/auth.middleware.ts
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // STEP 1: Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // STEP 2: Verify access token
    try {
      const decoded = JWTService.verifyAccessToken(token);

      // STEP 3: Get user from database (ensure user still exists)
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // STEP 4: Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.message === 'ACCESS_TOKEN_EXPIRED') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'ACCESS_TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};
```

**📝 Learning Notes:**

```
Auth Middleware = Route Protector
- Runs on EVERY protected route
- Extracts token from Authorization header
- Verifies token signature & expiration
- Checks user still exists in database
- Attaches user to req.user for controllers
```

---

## 🎮 **Phase 4: Controllers**

### **Step 5: Auth Controller (Business Logic)**

> 🎯 **Build this FIFTH** - Handles auth requests

```typescript
// File: src/controllers/auth.controller.ts
export class AuthController {
  // 🚪 LOGIN: Start of authentication flow
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // STEP 1: Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // STEP 2: Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // STEP 3: Generate tokens
      const familyId = crypto.randomUUID();
      const accessToken = JWTService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      const refreshToken = JWTService.generateRefreshToken({
        userId: user.id,
        familyId,
      });

      // STEP 4: Store refresh token
      const tokenHash = JWTService.hashToken(refreshToken);
      await RefreshTokenService.createRefreshToken({
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      // STEP 5: Return tokens
      res.json({
        user: { id: user.id, email: user.email, role: user.role },
        tokens: { accessToken, refreshToken },
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // 🔄 REFRESH: Extend authentication
  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      // STEP 1: Validate & rotate tokens
      const result = await RefreshTokenService.rotateToken(refreshToken, {
        // User info will be extracted from the refresh token
      });

      if (!result) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // STEP 2: Return new tokens
      res.json({
        tokens: {
          accessToken: result.newAccessToken,
          refreshToken: result.newRefreshToken,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Refresh failed' });
    }
  }

  // 🚪 LOGOUT: End authentication
  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        const tokenHash = JWTService.hashToken(refreshToken);
        await RefreshTokenService.revokeToken(tokenHash);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}
```

**📝 Learning Notes:**

```
Auth Controller = Business Logic
- login() → Validate credentials + Generate tokens + Store refresh token
- refresh() → Validate refresh token + Generate new tokens
- logout() → Revoke refresh token
```

---

## 🛣️ **Phase 5: Routes**

### **Step 6: Route Configuration**

> 🎯 **Build this SIXTH** - Exposes your API

```typescript
// File: src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 🔓 PUBLIC ROUTES (no authentication required)
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// 🔒 PROTECTED ROUTES (authentication required)
router.get('/profile', authenticate, AuthController.getProfile);
router.get('/sessions', authenticate, AuthController.getSessions);

export default router;
```

---

## 🌊 **Phase 6: Complete Flow**

### **The Complete Authentication Journey**

```typescript
// 🎯 COMPLETE AUTHENTICATION FLOW

// 1. USER REGISTRATION/LOGIN
const loginFlow = {
  step1: 'User sends email/password',
  step2: 'Server validates credentials',
  step3: 'Server generates familyId = UUID',
  step4: 'Server creates accessToken (15min) + refreshToken (7days)',
  step5: 'Server stores refreshToken hash in database',
  step6: 'Server returns both tokens to client',
  step7: 'Client stores tokens (localStorage/memory)',
};

// 2. MAKING API CALLS
const apiCallFlow = {
  step1: 'Client sends: Authorization: Bearer <accessToken>',
  step2: 'Middleware extracts token from header',
  step3: 'Middleware verifies JWT signature & expiration',
  step4: 'Middleware gets user from database',
  step5: 'Middleware attaches user to req.user',
  step6: 'Controller processes request with user context',
  step7: 'Server returns protected data',
};

// 3. TOKEN EXPIRATION & REFRESH
const refreshFlow = {
  step1: 'Access token expires after 15 minutes',
  step2: 'Next API call returns 401 "ACCESS_TOKEN_EXPIRED"',
  step3: 'Client detects expiration',
  step4: 'Client calls /refresh with refreshToken',
  step5: 'Server validates refreshToken (JWT + database)',
  step6: 'Server generates NEW accessToken + refreshToken (same family)',
  step7: 'Server revokes OLD refreshToken',
  step8: 'Server stores NEW refreshToken',
  step9: 'Server returns new tokens',
  step10: 'Client stores new tokens',
  step11: 'Client retries original API call with new accessToken',
};

// 4. SECURITY FEATURES
const securityFlow = {
  tokenReuse: 'If revoked refreshToken used → Revoke entire family',
  familyTracking: 'All tokens from same login share familyId',
  deviceTracking: 'Store userAgent + IP with each token',
  autoCleanup: 'Periodically delete expired tokens',
  rateLimit: 'Limit login/refresh attempts per IP',
};
```

### **Timeline Example**

```
🕐 T=0:        User logs in
               └── Server: Generate tokens (access: 15min, refresh: 7days)
               └── Client: Store tokens

🕐 T=2min:     User makes API call
               └── Client: Send access token
               └── Server: Verify token ✅ (13min remaining)
               └── Server: Return data

🕐 T=15min 1s: User makes API call (TOKEN EXPIRED!)
               └── Client: Send expired access token
               └── Server: Return 401 { "code": "ACCESS_TOKEN_EXPIRED" }
               └── Client: Detect TOKEN_EXPIRED
               └── Client: Call /refresh with refresh token
               └── Server: Validate refresh token ✅
               └── Server: Generate new tokens
               └── Client: Store new tokens
               └── Client: Retry original API call
               └── Server: Return data ✅

🕐 T=15min 5s: User gets response (seamless experience!)
```

---

## 📋 **Learning Checklist**

### **✅ Phase 1: Foundation (Study)**

- [ ] Understand JWT structure (header.payload.signature)
- [ ] Learn why we need 2 tokens
- [ ] Understand the refresh cycle timing
- [ ] Study security benefits vs traditional sessions

### **✅ Phase 2: Core Services (Code)**

- [ ] Build JWTService (token generation/verification)
- [ ] Create RefreshToken model
- [ ] Build RefreshTokenService (lifecycle management)
- [ ] Test token generation and validation

### **✅ Phase 3: Security (Code)**

- [ ] Build auth middleware
- [ ] Implement token validation
- [ ] Add security checks
- [ ] Test with expired tokens

### **✅ Phase 4: Business Logic (Code)**

- [ ] Build AuthController
- [ ] Implement login/refresh/logout
- [ ] Handle error cases
- [ ] Test all endpoints

### **✅ Phase 5: API Layer (Code)**

- [ ] Define routes
- [ ] Apply middleware
- [ ] Test endpoints
- [ ] Add rate limiting

### **✅ Phase 6: Master the Flow (Understand)**

- [ ] Trace complete login flow
- [ ] Trace API call flow
- [ ] Trace refresh flow
- [ ] Understand security features
- [ ] Test token reuse scenarios

---

## 🏭 **Industry Usage**

### **Companies Using This Approach:**

**E-Commerce Platforms:**

- ✅ Shopify (platform APIs)
- ✅ WooCommerce (WordPress ecosystem)
- ✅ BigCommerce (SaaS platform)
- ✅ Magento (Adobe Commerce)

**API-First Companies:**

- ✅ Stripe (payments)
- ✅ Twilio (communications)
- ✅ SendGrid (email)
- ✅ Auth0 (authentication service)

**Modern SaaS Platforms:**

- ✅ Slack (team communication)
- ✅ Notion (productivity)
- ✅ Figma (design)
- ✅ Vercel (deployment)

### **When to Use This System:**

**✅ Perfect For:**

- E-commerce platforms
- SaaS applications
- Mobile apps
- API-first businesses
- Startups to mid-size companies
- Developer-facing products

**❌ Consider Alternatives For:**

- Banking/financial services (need server sessions)
- Healthcare systems (HIPAA compliance)
- Government applications (regulatory requirements)
- Simple web apps (sessions might be easier)

---

## 🚀 **Your Learning Schedule**

**Week 1: Foundation**

- Day 1: Study JWT basics + Phase 1 concepts
- Day 2: Build JWTService + understand token structure
- Day 3: Create database models + understand storage

**Week 2: Implementation**

- Day 4: Build RefreshTokenService + test token operations
- Day 5: Create auth middleware + understand request flow
- Day 6: Build AuthController + test login/logout

**Week 3: Mastery**

- Day 7: Add routes + test complete flow
- Day 8: Study security features + test edge cases
- Day 9: Practice building from scratch
- Day 10: Review industry patterns + optimize

---

## 🎯 **Start Your Journey**

1. **Begin with JWTService** - This is your foundation
2. **Test each component** as you build it
3. **Understand the flow** before moving to the next phase
4. **Practice rebuilding** from memory
5. **Study real-world examples** from the companies listed

Remember: Every senior developer started exactly where you are now. The key is understanding **why** each piece exists, not just **how** to code it.

**Ready to build production-grade authentication? Let's start with Phase 1! 🚀**

---

## 📞 **Need Help?**

If you get stuck on any phase:

1. Review the learning notes for that section
2. Test each function individually
3. Trace through the complete flow
4. Compare with industry examples
5. Ask specific questions about the concepts you're struggling with

**Happy coding! 🎉**
