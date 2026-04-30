/**
 * Vercel Serverless Function Entry Point
 * Wraps the Express app for serverless execution.
 */
import app, { connectDB } from '../server/index.js';

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
