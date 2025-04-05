import cors from "cors";
import express from "express";
import serverless from "serverless-http";
import api from './routes/api.js';

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/', api);

app.use((req, res, next) => {
  return res.status(404).json({ error: "Not Found" });
});

export const application = serverless(app, {
  binary: ['*/*']
});
