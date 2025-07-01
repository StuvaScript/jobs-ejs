const User = require("../models/User");
const parseVErr = require("../util/parseValidationErrs");
const csrf = require("host-csrf");

const registerShow = (req, res) => {
  res.render("register");
};

const registerDo = async (req, res, next) => {
  if (req.body.password != req.body.password1) {
    req.flash("error", "The passwords entered do not match.");
    return res.status(400).render("register", { errors: req.flash("error") });
  }
  try {
    const user = await User.create(req.body);

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
    } else {
      return next(e);
    }
    return res.status(400).render("register", { errors: req.flash("error") });
  }
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

const logonShow = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  const token = csrf.token(req, res);
  res.render("logon", { _csrf: token });
};

module.exports = {
  registerShow,
  registerDo,
  logoff,
  logonShow,
};
