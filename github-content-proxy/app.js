import cors from "cors";
import express from "express";
import serverless from "serverless-http";
import api from './routes/api.js';
import { notFound } from "./routes/middleware.js";

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/', api);

app.use(notFound);

export const application = serverless(app, {
  binary: ['*/*']
});
