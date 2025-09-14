import { Request, Response } from "express";
import { UserService, CreateUserData } from "../services/user.service";

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body;

      const user = await UserService.registerUser(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
        },
      });
    } catch (error) {
      // Handle known errors
      if (error instanceof Error) {
        if (error.message === "User with this email already exists") {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }
      }

      // Handle unexpected errors
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Login user (placeholder for future implementation)
   */
  static async login(req: Request, res: Response) {
    try {
      // TODO: Implement login logic
      res.status(501).json({
        success: false,
        message: "Login endpoint not implemented yet",
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
