const express = require("express");
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/database");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken);

function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body || {};
    if (
      typeof title !== "string" || !title.trim() ||
      typeof content !== "string" || !content.trim()
    ) {
      return res.status(400).json({ message: "title and content are required" });
    }

    const note = {
      title: title.trim(),
      content: content.trim(),
      ownerId: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await getDatabase().collection("notes").insertOne(note);
    req.appEvents.emit("note:created", { userId: req.user.userId, title: note.title });

    return res.status(201).json({ ...note, _id: result.insertedId });
  } catch (error) {
    console.error("Create note error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const notes = await getDatabase().collection("notes")
      .find({ ownerId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json(notes);
  } catch (error) {
    console.error("List notes error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid note id" });

  try {
    const note = await getDatabase().collection("notes").findOne({
      _id: id,
      ownerId: req.user.userId
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json(note);
  } catch (error) {
    console.error("Get note error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid note id" });

  const { title, content } = req.body || {};
  if (
    typeof title !== "string" || !title.trim() ||
    typeof content !== "string" || !content.trim()
  ) {
    return res.status(400).json({ message: "title and content are required" });
  }

  try {
    const result = await getDatabase().collection("notes").updateOne(
      { _id: id, ownerId: req.user.userId },
      { $set: { title: title.trim(), content: content.trim(), updatedAt: new Date() } }
    );
    if (!result.matchedCount) return res.status(404).json({ message: "Note not found" });

    const updated = await getDatabase().collection("notes").findOne({
      _id: id,
      ownerId: req.user.userId
    });
    return res.json(updated);
  } catch (error) {
    console.error("Update note error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid note id" });

  try {
    const result = await getDatabase().collection("notes").deleteOne({
      _id: id,
      ownerId: req.user.userId
    });
    if (!result.deletedCount) return res.status(404).json({ message: "Note not found" });
    return res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
