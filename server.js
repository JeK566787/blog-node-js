const express = require("express");

const morgan = require("morgan");
const mongoose = require("mongoose");

require("dotenv").config();

const methodOverride = require("method-override");
const postRoutes = require("./routes/post-routes");
const postApiRoutes = require("./routes/api-post-routes");
const contactRoutes = require("./routes/contact-routes");
const authRoutes = require("./routes/auth-routes");
const cookieParser = require("cookie-parser");

const createPath = require("./helpers/create-path");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => console.log("Connected to DB"))
  .catch((error) => console.log(error));

app.listen(process.env.PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`listening port ${process.env.PORT}`);
});

app.use(express.urlencoded({ extended: false }));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use(express.static("styles"));

app.use(methodOverride("_method"));

app.use(cookieParser());

app.get("/", authMiddleware, (req, res) => {
  const title = "Home";
  res.render(createPath("index"), { title });
});
app.get("/enter", (req, res) => {
  const title = "Enter";
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.render(createPath("enter"), { title });
});

app.use(express.json());

app.use(postRoutes);
app.use(contactRoutes);
app.use(authRoutes);
app.use(postApiRoutes);

// app.get("/logout", authMiddleware, (req, res) => {
//   res.clearCookie("token");
//   res.clearCookie("refreshToken");
//   return res.redirect("/");
// });

app.use((req, res) => {
  const title = "Error Page";
  res.status(404).render(createPath("error"), { title });
});
