import { CompactEncrypt, compactDecrypt } from 'jose';

export const createJWE = async (payload, secretKey) => {
    return await new CompactEncrypt(new TextEncoder().encode(JSON.stringify(payload)))
    .setProtectedHeader({ alg: 'dir', enc: 'A128GCM' })
    .encrypt(secretKey);
};

export const decryptJWEAndGetPayload = async (jwe, secretKey) => {
    const { plaintext } = await compactDecrypt(jwe, secretKey);
    return JSON.parse(new TextDecoder().decode(plaintext));
};