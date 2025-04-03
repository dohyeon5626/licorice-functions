import { createJWE, decryptJWE } from './service/tokenService.js';
import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/content/:token/*", async (req, res, next) => {
  const { token } = req.params;
  const proxyPath = req.params[0];

  if (!token || !proxyPath) {
    return res.status(400).json({ error: "Bad Request" });
  }

  const pathList = proxyPath.split("/");
  if (pathList.length < 2) {
    return res.status(400).json({ error: "Bad Request" });
  }

  const user = pathList[0];
  const repo = pathList[1];

  let authToken = token;
  if (token.startsWith("ey")) {
    try {
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
        return res.status(401).json({ error: "Invalid token" });
      }
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
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
    console.log(error)
    return res.status(error.response?.status || 500).json({ error: "Failed to fetch content" });
  }
});

app.post("/token", async (req, res, next) => {
  try {
    const { user, repo, token: githubToken } = req.body;
    
    if (!user || !repo || !githubToken) {
      return res.status(400).json({ error: "Bad Request" });
    }
    
    const token = await createJWE(user, repo, githubToken);

    return res.status(200).json({ token: token });
  } catch (error) {
    console.log(error)
    return res.status(error.response?.status || 500).json({ error: "Failed to create token" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({ error: "Not Found" });
});

export const handler = serverless(app, {
  binary: ['*/*']
});
