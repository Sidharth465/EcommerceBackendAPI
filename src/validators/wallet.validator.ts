import Joi from "joi";


export const createWalletSchema = Joi.object({
    user_id: Joi.string()
      .guid({ version: 'uuidv4' })
      .required()
      .messages({
        'string.guid': 'user_id must be a valid',
        'any.required': 'user_id is required',
      }),
    amount: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.base': 'amount must be a number',
        'number.min': 'amount must be greater than or equal to 0',
        'any.required': 'amount is required',
      }),
  });

  export const transferWalletSchema = Joi.object({
    senderId: Joi.string()
      .guid({ version: 'uuidv4' })
      .required()
      .messages({
        'string.guid': 'senderId must be a valid UUID',
        'any.required': 'senderId is required',
      }),
      receiverId: Joi.string()
      .guid({ version: 'uuidv4' })
      .required()
      .messages({
        'string.guid': 'receiverId must be a valid UUID',
        'any.required': 'receiverId is required',
      }),
    amount: Joi.number()
      .greater(0)
      .required()
      .messages({
        'number.base': 'amount must be a number',
        'number.greater': 'amount must be greater than 0',
        'any.required': 'amount is required',
      }),
  });

