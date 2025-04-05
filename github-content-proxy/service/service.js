import { CompactEncrypt, compactDecrypt } from 'jose';

let SECRET_KEY = new Uint8Array(Buffer.from(process.env.SECRET_KEY, 'base64'));;

export const createJWE = async (user, repo, githubToken) => {
    return await new CompactEncrypt(new TextEncoder().encode(JSON.stringify({
        user,
        repo,
        token: githubToken,
        exp: Math.floor(Date.now() / 1000) + 3600
    })))
    .setProtectedHeader({ alg: 'dir', enc: 'A128GCM' })
    .encrypt(SECRET_KEY);
};

export const decryptJWE = async (jwe) => {
  try {
    const { plaintext } = await compactDecrypt(jwe, SECRET_KEY);
    const payload = JSON.parse(new TextDecoder().decode(plaintext));
    
    return payload;
  } catch (error) {
      throw new Error('Invalid Token');
  }
};