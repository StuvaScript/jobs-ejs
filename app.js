const express = require("express");
const app = express();
require("dotenv").config();
require("express-async-errors");
require("./lib/env-vars-checker");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const csrf = require("host-csrf");
const cookieParser = require("cookie-parser");
const exerciseRoutes = require("./routes/exercises");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

// Security
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("connect-flash")());

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

// CSRF
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}

app.use(express.json());

const csrf_options = {
  protected_operations: ["PATCH"],
  protected_content_types: ["application/json"],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options); //initialize and return middleware

// app.use(csrf_middleware(req, res, next));
app.use(session(sessionParms));
app.use(csrf_middleware);

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("./middleware/storeLocals"));
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/exercises", auth, exerciseRoutes);

app.set("view engine", "ejs");

// secret word handling
app.use("/secretWord", auth, secretWordRouter);

app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log(
    "Session User:",
    req.session.passport && req.session.passport.user
  );
  next();
});

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

app.use((err, req, res, next) => {
  if (err instanceof csrf.CSRFError) {
    // Token invalid or missing
    req.flash("error", "Invalid CSRF token, please try again.");
    return res.redirect("back"); // or wherever you want
  }
  next(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
