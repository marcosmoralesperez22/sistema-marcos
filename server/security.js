import crypto from 'crypto';

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function isPasswordHash(value = '') {
  return typeof value === 'string' && value.startsWith('scrypt$');
}

export function verifyPassword(password, storedPassword) {
  if (!isPasswordHash(storedPassword)) {
    return false;
  }

  const [, salt, storedHash] = storedPassword.split('$');
  if (!salt || !storedHash) return false;

  const expected = Buffer.from(storedHash, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function validatePasswordPolicy(password) {
  return typeof password === 'string' && password.length >= 12;
}
