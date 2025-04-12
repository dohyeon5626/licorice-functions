import axios from "axios";
import { createJWE, decryptJWEAndGetPayload } from '../util/jwe.js';

let SECRET_KEY = new Uint8Array(Buffer.from(process.env.SECRET_KEY, 'base64'));

export const getContent = async (user, repo, proxyPath, token) => {
  if (token.startsWith("ey")) {
    const payload = await decryptJWEAndGetPayload(token, SECRET_KEY);
    if (
      payload.token &&
      payload.user &&
      payload.repo &&
      payload.user === user &&
      payload.repo === repo &&
      payload.exp > Math.floor(Date.now() / 1000)
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