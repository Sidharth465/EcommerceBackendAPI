# E-Commerce Backend API

A robust, scalable Node.js backend API for e-commerce applications built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

### ✅ Implemented

- **User Authentication System**
  - User registration with email validation
  - Password hashing with bcrypt (12 salt rounds)
  - Input validation with Joi
  - Duplicate email prevention
- **Security Features**
  - Helmet.js for security headers
  - CORS configuration
  - Request size limits (10MB)
  - Input sanitization
- **Logging System**
  - Morgan HTTP request logging
  - Environment-aware logging (console + file)
  - Persistent log files in `/logs` directory
- **Database Integration**
  - PostgreSQL with Sequelize ORM
  - Database migrations and seeders
  - Connection health checks
- **Error Handling**
  - Global error handler
  - Structured error responses
  - 404 route handling

### 🔄 In Progress

- User login with JWT tokens
- Password reset functionality
- Email verification

### 📋 Planned

- Product management (CRUD)
- Shopping cart functionality
- Order management
- Payment integration
- Admin dashboard
- API rate limiting

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Validation**: Joi
- **Security**: Helmet, bcrypt, CORS
- **Logging**: Morgan
- **Development**: ts-node-dev, nodemon

## 📁 Project Structure

```
src/
├── app.ts                 # Main Express application
├── server.ts              # Server startup and database connection
├── configs/
│   ├── env.ts            # Environment configuration
│   ├── database.ts       # Database connection setup
│   ├── logger.ts         # Logging configuration
│   └── index.ts          # Centralized config exports
├── controllers/
│   └── auth.controller.ts # Authentication request handlers
├── services/
│   └── user.service.ts   # User business logic
├── middlewares/
│   └── validation.middleware.ts # Request validation middleware
├── validators/
│   └── auth.validator.ts # Joi validation schemas
├── routers/
│   └── auth.router.ts    # Authentication routes
├── models/
│   ├── user.model.ts     # User database model
│   ├── category.model.ts # Product category model
│   ├── product.model.ts  # Product model
│   └── index.ts          # Model initialization
├── migrations/           # Database migration files
└── seeders/             # Database seed files
```

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- **Yarn (v1.22.0 or higher)** - This project uses Yarn as the package manager

> ⚠️ **Important**: This project is configured to use Yarn only. Using npm will cause errors.

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd E-com-backend
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Environment Configuration**
   Create environment files:

   ```bash
   # Create .env.uat for development
   cp .env.example .env.uat

   # Create .env.production for production
   cp .env.example .env.production
   ```

4. **Configure Database**
   Update your `.env.uat` file:

   ```env
   NODE_ENV=uat
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ecommerce_uat
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DIALECT=postgres
   ```

5. **Run Database Migrations**

   ```bash
   yarn db:migrate:uat
   ```

6. **Seed Database (Optional)**

   ```bash
   yarn sequelize-cli db:seed:all --env uat
   ```

7. **Start Development Server**
   ```bash
   yarn nodemon:uat
   ```

## 🔧 Available Scripts

```bash
# Development
yarn nodemon:uat          # Start development server (UAT environment)
yarn nodemon:prod         # Start production server

# Database Management
yarn db:migrate:uat       # Run migrations (UAT)
yarn db:migrate:prod      # Run migrations (Production)
yarn db:status:uat        # Check migration status (UAT)
yarn db:undo:uat          # Undo last migration (UAT)
yarn db:gen -- migration-name  # Generate new migration

# Code Quality
yarn lint                 # Run ESLint
yarn lint:fix            # Fix ESLint issues
yarn format              # Format code with Prettier
yarn prettier:check      # Check Prettier formatting
yarn type-check          # TypeScript type checking
yarn check:lines         # Check file line counts
yarn ci:check            # Run all CI checks locally
```

## 📊 Logging

### Log Files Location

- **Access Logs**: `logs/access.log`
- **Error Logs**: `logs/error.log` (production)

### Viewing Logs

```bash
# Watch logs in real-time
tail -f logs/access.log

# Search for specific requests
grep "POST" logs/access.log

# Find errors
grep " [45][0-9][0-9] " logs/access.log
```

## 🔒 Security Features

- **Password Security**: bcrypt with 12 salt rounds
- **Input Validation**: Joi schemas with custom error messages
- **Security Headers**: Helmet.js protection
- **CORS**: Configurable cross-origin resource sharing
- **Request Limits**: 10MB payload limit
- **SQL Injection Protection**: Sequelize ORM parameterized queries

## 🚧 Development Guidelines

### Code Organization

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Middlewares**: Reusable request processing
- **Validators**: Input validation schemas
- **Models**: Database entity definitions

### Adding New Features

1. Create migration for database changes
2. Update/create models
3. Add validation schemas
4. Implement service methods
5. Create controller handlers
6. Define routes
7. Update documentation

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**

   ```bash
   # Find process using port 3000
   lsof -i :3000

   # Kill the process
   kill -9 <PID>
   ```

3. **Migration Errors**

   ```bash
   # Check migration status
   npm run db:status:uat

   # Undo last migration if needed
   npm run db:undo:uat
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sidharth Verma**

- GitHub: [@sidharthverma](https://github.com/sidharthverma)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Sequelize team for the robust ORM
- All open-source contributors

---

**Built with ❤️ using Node.js and TypeScript**
