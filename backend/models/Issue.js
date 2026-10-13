const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    studentId: { type: String, required: true },
    bookTitle: { type: String, required: true },
    issueDate: { type: String, required: true },
    returnDate: { type: String, default: "" },
    status: { type: String, enum: ["Issued", "Returned"], default: "Issued" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Issue", issueSchema);
