const serverless = require("serverless-http");
const express = require("express");

const app = express();
const jwt = require("jsonwebtoken");
const axios = require("axios");

const SECRET_KEY = process.env.SECRET_KEY;

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
      const payload = jwt.verify(token, SECRET_KEY);
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

app.use((req, res, next) => {
  return res.status(404).json({ error: "Not Found" });
});

exports.handler = serverless(app, {
  binary: ['*/*']
});
