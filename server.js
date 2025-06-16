const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Start OAuth
app.get("/auth/jobber", (req, res) => {
  const authUrl = `https://api.getjobber.com/api/oauth/authorize?client_id=${process.env.JOBBER_CLIENT_ID}&redirect_uri=${process.env.JOBBER_REDIRECT_URI}&response_type=code&scope=read_clients read_invoices`;
  res.redirect(authUrl);
});

// Handle Jobber callback
app.get("/oauth/jobber/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post("https://api.getjobber.com/api/oauth/token", {
      client_id: process.env.JOBBER_CLIENT_ID,
      client_secret: process.env.JOBBER_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: process.env.JOBBER_REDIRECT_URI,
    });

    const accessToken = tokenRes.data.access_token;
    res.send(`Access token: ${accessToken}`);
  } catch (err) {
    res.status(500).send("OAuth failed: " + JSON.stringify(err.response?.data || err.message));
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Example: Get invoices
app.get("/invoices", async (req, res) => {
  const token = req.query.token; // You can pass the token in the URL temporarily
  try {
    const response = await axios.get("https://api.getjobber.com/api/invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
});
