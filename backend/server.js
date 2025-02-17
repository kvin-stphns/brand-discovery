require('dotenv').config();
const express = require('express');
const app = express();

// Now you can use process.env.OPENROUTER_API_KEY anywhere
const apiKey = process.env.OPENROUTER_API_KEY;

app.use(express.json());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});