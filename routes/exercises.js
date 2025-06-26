const express = require("express");
// const passport = require("passport");
const router = express.Router();

const {
  displayAllExercises,
  addExercise,
  displayExerciseForm,
  getExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/exercises");

router.route("/").get(displayAllExercises).post(addExercise);
router.route("/new").get(displayExerciseForm);
router.route("/edit/:id").get(getExercise);
router.post("/update/:id", updateExercise);
router.route("/delete/:id").post(deleteExercise);

module.exports = router;
