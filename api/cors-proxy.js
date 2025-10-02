// CORS Proxy Server for Vietnam Address API
// This file can be deployed as a serverless function or used as a Node.js server

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: [
      "https://logistics-one-delta.vercel.app",
      "http://localhost:3000",
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

// Proxy endpoint for Vietnam Address API
app.get("/api/proxy", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Validate that the URL is from the allowed domain
    if (!url.includes("tailieu365.com/api/address")) {
      return res
        .status(400)
        .json({ error: "Only tailieu365.com API is allowed" });
    }

    console.log("Proxying request to:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Add CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    res.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Proxy request failed",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CORS Proxy server running on port ${PORT}`);
  });
}

module.exports = app;
