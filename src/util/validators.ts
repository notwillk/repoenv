import { FormatType } from './ParsedFormat';
import validator from 'validator';

type Validator = {
  type: FormatType;
  validator: (value: string) => boolean;
  numericalValue: (value: string) => number | null;
};

function noNumericalValue() {
  return null;
}

const validators: Record<FormatType, Validator> = {
  string: {
    type: 'string',
    validator: (s) => s.match(/^.*$/) !== null,
    numericalValue: (s) => s.length,
  },

  base64: {
    type: 'base64',
    validator: validator.isBase64,
    numericalValue: (s: string) => {
      if (!s) return 0;
      const cleaned = s.replace(/=+$/, '');
      // Returns the length in bytes of a base64 string
      return Math.floor((cleaned.length * 3) / 4);
    },
  },

  hex: {
    type: 'hex',
    validator: validator.isHexadecimal,
    numericalValue: (s: string) => {
      if (!s) return 0;
      return s.replace('0x', '').length / 2;
    },
  },

  integer: {
    type: 'integer',
    validator: validator.isInt,
    numericalValue: (s: string) => parseInt(s, 10),
  },

  float: {
    type: 'float',
    validator: validator.isFloat,
    numericalValue: (s: string) => parseFloat(s),
  },

  url: {
    type: 'url',
    validator: (s: string) => validator.isURL(s, { require_protocol: true }),
    numericalValue: noNumericalValue,
  },

  email: {
    type: 'email',
    validator: validator.isEmail,
    numericalValue: noNumericalValue,
  },

  uuid: {
    type: 'uuid',
    validator: validator.isUUID,
    numericalValue: noNumericalValue,
  },

  ipv4: {
    type: 'ipv4',
    validator: (s: string) => validator.isIP(s, 4),
    numericalValue: noNumericalValue,
  },

  ipv6: {
    type: 'ipv6',
    validator: (s: string) => validator.isIP(s, 6),
    numericalValue: noNumericalValue,
  },

  ulid: {
    type: 'ulid',
    validator: validator.isULID,
    numericalValue: noNumericalValue,
  },

  iso8601: {
    type: 'iso8601',
    validator: validator.isISO8601,
    numericalValue: noNumericalValue,
  },
};

export default validators;
