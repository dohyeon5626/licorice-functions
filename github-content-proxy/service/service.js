import axios from "axios";
import { CompactEncrypt, compactDecrypt } from 'jose';

let SECRET_KEY = new Uint8Array(Buffer.from(process.env.SECRET_KEY, 'base64'));

export const getContent = async (user, repo, proxyPath, token) => {
  let authToken = token;
  if (token.startsWith("ey")) {
    const payload = await decryptJWE(token);
    if (
      payload.token &&
      payload.user &&
      payload.repo &&
      payload.user === user &&
      payload.repo === repo
    ) {
      authToken = payload.token;
    } else {
      throw new Error('Invalid Token');
    }
  }

  try {
    return await axios.get(`https://raw.githubusercontent.com/${proxyPath}`, {
      headers: {
        Authorization: `token ${authToken}`
      },
      responseType: 'arraybuffer'
    });
  } catch (error) {
    console.log(error)
    throw new Error('Failed Github Request');
  }
}

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

const decryptJWE = async (jwe) => {
  try {
    const { plaintext } = await compactDecrypt(jwe, SECRET_KEY);
    const payload = JSON.parse(new TextDecoder().decode(plaintext));
    
    return payload;
  } catch (error) {
      throw new Error('Invalid Token');
  }
};