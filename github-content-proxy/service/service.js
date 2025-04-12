import axios from "axios";
import { CompactEncrypt, compactDecrypt } from 'jose';

let SECRET_KEY = new Uint8Array(Buffer.from(process.env.SECRET_KEY, 'base64'));

export const getContent = async (user, repo, proxyPath, token) => {
  if (token.startsWith("ey")) {
    const payload = await decryptJWEAndGetPayload(token, SECRET_KEY);
    if (
      payload.token &&
      payload.user &&
      payload.repo &&
      payload.user === user &&
      payload.repo === repo
    ) {
      token = payload.token;
    } else {
      throw new Error('Invalid Token');
    }
  }

  const response = await axios.get(`https://raw.githubusercontent.com/${proxyPath}`, {
    headers: {
      Authorization: `token ${token}`
    },
    responseType: 'arraybuffer',
    validateStatus: () => true
  });

  return {
    contentType: response.headers['content-type'],
    status: response.status,
    data: Buffer.from(response.data)
  }
}

export const getToken = async (user, repo, githubToken) => {
  return await createJWE({
    user,
    repo,
    token: githubToken,
    exp: Math.floor(Date.now() / 1000) + 3600
  }, SECRET_KEY);
}

export const createJWE = async (payload, secretKey) => {
    return await new CompactEncrypt(new TextEncoder().encode(JSON.stringify(payload)))
    .setProtectedHeader({ alg: 'dir', enc: 'A128GCM' })
    .encrypt(secretKey);
};

const decryptJWEAndGetPayload = async (jwe, secretKey) => {
  try {
    const { plaintext } = await compactDecrypt(jwe, secretKey);
    const payload = JSON.parse(new TextDecoder().decode(plaintext));
    
    return payload;
  } catch (error) {
      throw new Error('Invalid Token');
  }
};