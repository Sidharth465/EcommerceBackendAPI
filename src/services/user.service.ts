import bcrypt from 'bcrypt';
import { sequelize } from '../configs/database';
import { initModels } from '../models';

// Initialize models
const models = initModels(sequelize);

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Register a new user
   */
  static async registerUser(userData: CreateUserData): Promise<UserResponse> {
    const { email, password, name, role = 'customer' } = userData;

    // Check if user already exists
    const existingUser = await models.User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create the user
    const user = await models.User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name.trim(),
      role,
    });

    // Return user data without password
    return {
      id: user.getDataValue('id'),
      email: user.getDataValue('email'),
      name: user.getDataValue('name'),
      role: user.getDataValue('role'),
      createdAt: user.getDataValue('createdAt'),
      updatedAt: user.getDataValue('updatedAt'),
    };
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email: string) {
    return await models.User.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by ID
   */
  static async findUserById(id: string) {
    return await models.User.findByPk(id);
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
