import { Router } from "express";
import { getContent, createJWE } from '../service/service.js';

const router = Router();

router.get("/content/:token/*", async (req, res) => {
  const { token } = req.params;
  const proxyPath = req.params[0];

  if (!token || !proxyPath) throw new Error('Bad Request');
  const pathList = proxyPath.split("/");
  if (pathList.length < 2) throw new Error('Bad Request');

  const response = await getContent(pathList[0], pathList[1], proxyPath, token);
  res.setHeader('Content-Type', response.contentType);
  return res.status(response.status).send(response.data);
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