const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Issue = require("../models/Issue");

// Create a new book
router.post("/books", async (req, res) => {
  try {
    const { title, author, category, isbn, year, quantity } = req.body;

    if (!title || !author || !category || !isbn || !year || quantity == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Book.findOne({ isbn });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    const book = new Book({
      title,
      author,
      category,
      isbn,
      year,
      quantity,
      available: quantity,
    });
    await book.save();

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all books, with optional search
router.get("/books", async (req, res) => {
  try {
    const search = req.query.search;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { author: regex }, { category: regex }];
    }

    const books = await Book.find(filter).sort({ title: 1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single book
router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update book
router.put("/books/:id", async (req, res) => {
  try {
    const { title, author, category, year, quantity } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: "Book not found" });

    book.title = title ?? book.title;
    book.author = author ?? book.author;
    book.category = category ?? book.category;
    book.year = year ?? book.year;

    if (quantity != null) {
      const change = quantity - book.quantity;
      book.quantity = quantity;
      book.available = Math.max(0, book.available + change);
    }

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete book
router.delete("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    await book.remove();
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const books = await Book.find();
    const availableBooks = books.reduce((sum, book) => sum + book.available, 0);
    const issuedBooks = books.reduce(
      (sum, book) => sum + Math.max(0, book.quantity - book.available),
      0,
    );
    const totalStudents = await Issue.distinct("studentId").then(
      (ids) => ids.length,
    );
    const today = new Date().toISOString().slice(0, 10);
    const returnedToday = await Issue.countDocuments({
      status: "Returned",
      returnDate: today,
    });

    res.json({
      totalBooks,
      availableBooks,
      issuedBooks,
      returnedToday,
      totalStudents,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
