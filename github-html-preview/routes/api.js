import asyncHandler from 'express-async-handler';
import { Router } from "express";
import { getContent, getToken } from '../service/service.js';
import AppError from './exception.js';

const router = Router();

router.get("/content/:token/*", asyncHandler(async (req, res) => {
  const { token } = req.params;
  const proxyPath = req.params[0];

  if (!token || !proxyPath) throw new AppError(404, 'Bad Request');
  const pathList = proxyPath.split("/");
  if (pathList.length < 2) throw new AppError(404, 'Bad Request');

  const response = await getContent(pathList[0], pathList[1], proxyPath, token);
  res.setHeader('Content-Type', response.contentType);
  return res.status(response.status).send(response.data);
}));

router.post("/token", asyncHandler(async (req, res) => {
  const { user, repo, token: githubToken } = req.body;
  if (!user || !repo || !githubToken) throw new AppError(404, 'Bad Request');
  
  return res.status(200).json({ token: await getToken(user, repo, githubToken) });
}));

export default router;