const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 0 },
    available: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

bookSchema.pre("save", function (next) {
  if (this.isNew) {
    this.available = this.quantity;
  }
  next();
});

module.exports = mongoose.model("Book", bookSchema);
