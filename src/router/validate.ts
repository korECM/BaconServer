import Joi from 'joi';

export function isInvalid(data: any, schema: Joi.Schema) {
  const result = schema.validate(data);
  return result.error;
}
