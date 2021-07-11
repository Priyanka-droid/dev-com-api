const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const path = require("path");

const app = express();
// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views"));

// app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 8000;
// const db =
//   "mongodb+srv://PriyankaDB:<password>@cluster0.ky6fu.mongodb.net/dev-connector?retryWrites=true&w=majority";
// mongoose
//   .connect(db)
//   .then(() => {
//     console.log("mongodb connection established");
//   })
//   .catch(() => {
//     console.log("connection failed");
//   });

connectDB();
// app.get("/", (req, res) => {
//   res.status(200).render("base");
// });

app.use(express.json({ extended: false }));

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));
app.get("/", (req, res) => {
  res.send("API running");
});
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
