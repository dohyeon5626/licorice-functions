import axios from "axios";
import { createJWE, decryptJWEAndGetPayload } from '../util/jwe.js';
import AppError from "../routes/exception.js";

const SECRET_KEY = new Uint8Array(Buffer.from(process.env.SECRET_KEY, 'base64'));
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export const getContent = async (user, repo, proxyPath, token) => {
  let response;
  if (token.startsWith("ey")) {
    let payload
    try {
      payload = await decryptJWEAndGetPayload(token, SECRET_KEY);
    } catch (error) {
      throw new AppError(401, 'Invalid Token');
    }
    if (
      payload.user &&
      payload.repo &&
      payload.user === user &&
      payload.repo === repo &&
      payload.exp > Math.floor(Date.now() / 1000)
    ) {
      if (!payload.token && (!payload.tokenList || !Array.isArray(payload.tokenList)))
        throw new AppError(401, 'Invalid Token');
      if (payload.token) {
        response = await axios.get(`https://raw.githubusercontent.com/${proxyPath}`, {
          headers: {
            Authorization: `token ${payload.token}`
          },
          responseType: 'arraybuffer',
          validateStatus: () => true
        });
      } else {
        for(let githubToken of payload.tokenList) {
          response = await axios.get(`https://raw.githubusercontent.com/${proxyPath}`, {
            headers: {
              Authorization: `token ${githubToken}`
            },
            responseType: 'arraybuffer',
            validateStatus: () => true
          });
          if (response.status === 200) break;
        }
      }
    } else {
      throw new AppError(401, 'Invalid Token');
    }
  } else {
    response = await axios.get(`https://raw.githubusercontent.com/${proxyPath}`, {
      headers: {
        Authorization: `token ${token}`
      },
      responseType: 'arraybuffer',
      validateStatus: () => true
    });
  }

  return {
    contentType: response.headers['content-type'],
    status: response.status,
    data: Buffer.from(response.data)
  }
}

export const getToken = async (user, repo, githubToken, githubTokenList) => {
  if (githubToken) {
    return await createJWE({
      user,
      repo,
      token: githubToken,
      exp: Math.floor(Date.now() / 1000) + 3600
    }, SECRET_KEY);
  } else {
    return await createJWE({
      user,
      repo,
      tokenList: githubTokenList,
      exp: Math.floor(Date.now() / 1000) + 3600
    }, SECRET_KEY);
  }
  
}

export const getGithubAuthorizeUrl = (redirectUri) => {
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:repo`;
}

export const getGithubToken = async (code, redirectUri) => {
  return axios.post(
    `https://github.com/login/oauth/access_token`,
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code
    },
    {
      headers: {
        Accept: 'application/json'
      }
    }).then(res => res.data).then(data => {
      if (data.error) throw new AppError(401, 'Invalid Authentication Information');
      return {
        access: {
          token: data.access_token,
          expiresIn: data.expires_in
        },
        refresh: {
          token: data.refresh_token,
          expiresIn: data.refresh_token_expires_in
        }
      }
    }).catch(() => { throw new AppError(401, 'Invalid Authentication Information'); });
}

export const refreshGithubAccessToken = async(refreshToken) => {
  return axios.post(
    `https://github.com/login/oauth/access_token`,
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    },
    {
      headers: {
        Accept: 'application/json'
      }
    }).then(res => res.data).then(data => {
      if (data.error) throw new AppError(401, 'Invalid Authentication Information');
      return {
        access: {
          token: data.access_token,
          expiresIn: data.expires_in
        },
        refresh: {
          token: data.refresh_token,
          expiresIn: data.refresh_token_expires_in
        }
      }
    }).catch(() => { throw new AppError(401, 'Invalid Authentication Information'); });
}