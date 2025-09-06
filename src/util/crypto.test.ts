import { describe, it, expect } from 'vitest';
import { aes256GcmGenerateKey, aes256GcmEncrypt, aes256GcmDecrypt } from './crypto';

describe('aes256GcmGenerateKey', () => {
  it('should generate a 32-byte base64 key', () => {
    const key = aes256GcmGenerateKey();
    const buf = Buffer.from(key, 'base64');
    expect(buf.length).toBe(32);
  });

  it('should generate unique keys', () => {
    const key1 = aes256GcmGenerateKey();
    const key2 = aes256GcmGenerateKey();
    expect(key1).not.toBe(key2);
  });
});

describe('aes256GcmEncrypt and aes256GcmDecrypt', () => {
  const key = aes256GcmGenerateKey();
  const encoding: BufferEncoding = 'base64';

  it('should encrypt and decrypt a string correctly', () => {
    const plaintext = 'Hello, world!';
    const ciphertext = aes256GcmEncrypt({ plaintext, key, encoding });
    expect(ciphertext).not.toBe(plaintext);

    const decrypted = aes256GcmDecrypt({ ciphertext, key, encoding });
    expect(decrypted).toBe(plaintext);
  });

  it('should handle empty string', () => {
    const plaintext = '';
    const ciphertext = aes256GcmEncrypt({ plaintext, key, encoding });
    const decrypted = aes256GcmDecrypt({ ciphertext, key, encoding });
    expect(decrypted).toBe(plaintext);
  });

  it('should throw error with wrong key', () => {
    const plaintext = 'Sensitive data';
    const ciphertext = aes256GcmEncrypt({ plaintext, key, encoding });
    const wrongKey = aes256GcmGenerateKey();
    expect(() => aes256GcmDecrypt({ ciphertext, key: wrongKey, encoding })).toThrow();
  });

  it('should throw error with tampered ciphertext', () => {
    const plaintext = 'Test tamper';
    const ciphertext = aes256GcmEncrypt({ plaintext, key, encoding });
    // Tamper with ciphertext
    const tampered = ciphertext.slice(0, -2) + 'AA';
    expect(() => aes256GcmDecrypt({ ciphertext: tampered, key, encoding })).toThrow();
  });

  it('should support different encodings', () => {
    const plaintext = 'Encoding test';
    const hexCiphertext = aes256GcmEncrypt({ plaintext, key, encoding: 'hex' });
    const decrypted = aes256GcmDecrypt({ ciphertext: hexCiphertext, key, encoding: 'hex' });
    expect(decrypted).toBe(plaintext);
  });
});
