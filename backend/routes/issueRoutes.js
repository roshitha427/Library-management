const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const Book = require("../models/Book");

// Issue a book
router.post("/issue", async (req, res) => {
  try {
    const { studentName, studentId, bookTitle, issueDate } = req.body;

    if (!studentName || !studentId || !bookTitle || !issueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const book = await Book.findOne({ title: bookTitle });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.available <= 0) {
      return res.status(400).json({ message: "Book is not available" });
    }

    book.available -= 1;
    await book.save();

    const issue = new Issue({
      studentName,
      studentId,
      bookTitle,
      issueDate,
      status: "Issued",
    });
    await issue.save();

    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get issue records
router.get("/issue", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Return a book
router.put("/return/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue)
      return res.status(404).json({ message: "Issue record not found" });
    if (issue.status === "Returned") {
      return res.status(400).json({ message: "Book already returned" });
    }

    const book = await Book.findOne({ title: issue.bookTitle });
    if (book) {
      book.available += 1;
      await book.save();
    }

    issue.returnDate = new Date().toISOString().slice(0, 10);
    issue.status = "Returned";
    await issue.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
