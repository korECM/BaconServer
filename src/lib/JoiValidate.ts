import express from 'express';
import Joi from 'joi';

export function reqValidate(schema: Joi.Schema, type: 'body' | 'params') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    switch (type) {
      case 'body':
        if (schema.validate(req.body).error) {
          console.log(schema.validate(req.body).error);
          return res.status(400).send();
        }
        break;
      case 'params':
        if (schema.validate(req.params).error) {
          return res.status(400).send();
        }
        break;
    }
    next();
  };
}
