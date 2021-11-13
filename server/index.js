const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const authRoute = require("./routers/auth");
const postRoute = require("./routers/post");
const tagRoute = require("./routers/tag");
const userRoute = require("./routers/user");
const notificationRoute = require("./routers/notification");
const commentRoute = require("./routers/comment");
const likeRoute = require("./routers/like");
const retweetRoute = require("./routers/retweet");
const adminRoute = require("./routers/admin");

mongoose
    .connect(process.env.MONGO_ACCESS, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected :D"))
    .catch((e) => console.log(e));
app.use(bodyParser.json({ limit: "4mb", type: "application/json" }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api", authRoute);
app.use("/api", postRoute);
app.use("/api", tagRoute);
app.use("/api", userRoute);
app.use("/api", notificationRoute);
app.use("/api", commentRoute);
app.use("/api", likeRoute);
app.use("/api", retweetRoute);
app.use("/api", adminRoute);

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
