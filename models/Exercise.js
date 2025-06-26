// const { required } = require("joi");
const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    sets: {
      type: Number,
    },
    reps: {
      type: Number,
    },
    measurement: {
      type: Number,
      required: [true, "Please provide a measurement"],
    },
    measurementUnit: {
      type: String,
      required: [true, "Please provide a unit of measurement"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", ExerciseSchema);
