export const requiredString = {
  type: String,
  required: true,
  trim: true,
  minlength: 1,
} as const;

export const positiveInteger = {
  type: Number,
  required: true,
  validate: {
    validator: (value: number) => Number.isSafeInteger(value) && value > 0,
    message: '{PATH} must be a positive safe integer',
  },
} as const;

export const nonNegativeInteger = {
  type: Number,
  required: true,
  validate: {
    validator: (value: number) => Number.isSafeInteger(value) && value >= 0,
    message: '{PATH} must be a nonnegative safe integer',
  },
} as const;

export const idrAmount = nonNegativeInteger;
