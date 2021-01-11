const express = require("express");
const mongoos = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const UserRoutes = require("./routes/userRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const PlanRoutes = require("./routes/planRoutes");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
let URI = process.env.MONGO_URI;
let port = process.env.PORT;
mongoos
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) =>
    app.listen(port || 5000, () => {
      console.log("server connected");
    })
  )
  .catch((err) => console.log(err));

//middleware
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
//user routes
app.use(UserRoutes);
app.use(checkoutRoutes);
app.use(PlanRoutes);
//routes
app.get("/", (req, res) => {
  res.send("server started");
});
