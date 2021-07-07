const express = require("express");

const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("API running");
});
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
