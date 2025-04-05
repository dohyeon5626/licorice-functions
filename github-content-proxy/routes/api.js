import axios from "axios";
import { Router } from "express";
import { createJWE, decryptJWE } from '../service/service.js';

const router = Router();

router.get("/content/:token/*", async (req, res, next) => {
  const { token } = req.params;
  const proxyPath = req.params[0];

  if (!token || !proxyPath) {
    throw new Error('Bad Request');
  }

  const pathList = proxyPath.split("/");
  if (pathList.length < 2) {
    throw new Error('Bad Request');
  }

  const user = pathList[0];
  const repo = pathList[1];

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
    const response = await axios.get(`https://raw.githubusercontent.com/${proxyPath}`, {
      headers: {
        Authorization: `token ${authToken}`
      },
      responseType: 'arraybuffer'
    });

    res.setHeader('Content-Type', response.headers['content-type']);

    return res.status(response.status).send(Buffer.from(response.data));

  } catch (error) {
    throw new Error('Failed Github Request');
  }
});

router.post("/token", async (req, res, next) => {
  const { user, repo, token: githubToken } = req.body;
  
  if (!user || !repo || !githubToken) {
    throw new Error('Bad Request');
  }
  
  const token = await createJWE(user, repo, githubToken);

  return res.status(200).json({ token: token });
});

export default router;