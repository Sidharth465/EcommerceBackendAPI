import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true, // Convert values to appropriate types
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(
        (detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};
