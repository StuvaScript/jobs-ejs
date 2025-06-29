const Exercise = require("../models/Exercise");
const parseValidationErrors = require("../util/parseValidationErrs");
const csrf = require("host-csrf");

const displayAllExercises = async (req, res, next) => {
  try {
    const exercises = await Exercise.find({ createdBy: req.user._id }).lean();

    const token = csrf.token(req, res);
    res.render("exercises", { exercises, _csrf: token });
  } catch (err) {
    next(err);
  }
};

const displayExerciseForm = (req, res) => {
  const token = csrf.token(req, res);
  res.render("exercise", { exercise: null, _csrf: token });
};

const addExercise = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    await Exercise.create(req.body);
    req.flash("info", "Exercise added.");
    res.redirect("/exercises");
  } catch (e) {
    if (e.name === "ValidationError") {
      parseValidationErrors(e, req);

      const token = csrf.token(req, res);
      return res.render("exercise", {
        exercise: req.body,
        errors: req.flash("error"),
        _csrf: token,
      });
    }
    next(e);
  }
};

const getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).lean();
    if (!exercise) {
      req.flash("error", "Exercise not found or not authorized.");
      return res.redirect("/exercises");
    }

    const token = csrf.token(req, res);
    res.render("exercise", { exercise, _csrf: token });
  } catch (e) {
    next(e);
  }
};

const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!exercise) {
      req.flash("error", "Exercise not found or not authorized.");
      return res.redirect("/exercises");
    }
    Object.assign(exercise, req.body);
    await exercise.save();
    req.flash("info", "Exercise updated.");
    res.redirect("/exercises");
  } catch (e) {
    if (e.name === "ValidationError") {
      parseValidationErrors(e, req);

      const token = csrf.token(req, res);
      req.body._id = req.params.id;
      return res.render("exercise", {
        exercise: req.body,
        errors: req.flash("error"),
        _csrf: token,
      });
    }
    next(e);
  }
};

const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!exercise) {
      req.flash("error", "Exercise not found or not authorized.");
    } else {
      req.flash("info", "Exercise deleted.");
    }
    res.redirect("/exercises");
  } catch (e) {
    next(e);
  }
};

module.exports = {
  displayAllExercises,
  displayExerciseForm,
  addExercise,
  getExercise,
  updateExercise,
  deleteExercise,
};

// const Exercise = require("../models/Exercise");
// const parseVErr = require("../util/parseValidationErrs");
// const csrf = require("host-csrf");

// const registerShow = (req, res) => {
//   res.render("register");
// };

// const registerDo = async (req, res, next) => {
//   if (req.body.password != req.body.password1) {
//     req.flash("error", "The passwords entered do not match.");
//     return res.render("register", { errors: req.flash("error") });
//   }
//   try {
//     await Exercise.create(req.body);
//   } catch (e) {
//     if (e.constructor.name === "ValidationError") {
//       parseVErr(e, req);
//     } else if (e.name === "MongoServerError" && e.code === 11000) {
//       req.flash("error", "That email address is already registered.");
//     } else {
//       return next(e);
//     }
//     return res.render("register", { errors: req.flash("error") });
//   }
//   res.redirect("/");
// };

// const logoff = (req, res) => {
//   req.session.destroy(function (err) {
//     if (err) {
//       console.log(err);
//     }
//     res.redirect("/");
//   });
// };

// const logonShow = (req, res) => {
//   if (req.user) {
//     return res.redirect("/");
//   }
//

// const token = csrf.token(req, res);
//   res.render("logon", { _csrf: token });
// };

// const displayAllExercises = (req, res) => {
//   res.send("displayAllExercises");
// };

// const addExercise = (req, res) => {
//   res.send("addExercise");
// };

// const displayForm = (req, res) => {
//   res.send("displayForm");
// };

// const getExercise = (req, res) => {
//   res.send("getExercise");
// };

// const updateExercise = (req, res) => {
//   res.send("updateExercise");
// };

// const deleteExercise = (req, res) => {
//   res.send("deleteExercise");
// };

// module.exports = {
//   displayAllExercises,
//   addExercise,
//   displayForm,
//   getExercise,
//   updateExercise,
//   deleteExercise,
// };
