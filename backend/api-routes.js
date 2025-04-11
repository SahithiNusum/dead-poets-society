// This file shows the API routes that need to be added to the backend

const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../models/User")
const Poem = require("../models/Poem")

// In users.js, add this new route to get the current user
// GET /api/users/me
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// In users.js, add this new route to get a user by ID
// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// In poems.js, add this new route to get poems by a specific user
// GET /api/poems/user/:userId
router.get("/user/:userId", auth, async (req, res) => {
    try {
        const poems = await Poem.find({ author: req.params.userId })
            .sort({ createdAt: -1 })
            .populate("author", "username")
            .populate("comments.author", "username")

        // Check if the current user has liked each poem
        const userId = req.user.id
        poems.forEach((poem) => {
            poem._doc.isLiked = poem.likes.some((like) => like.toString() === userId)
        })

        res.json(poems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// In poems.js, add this new route to delete a comment
// DELETE /api/poems/:id/comment/:commentId
router.delete("/:id/comment/:commentId", auth, async (req, res) => {
    try {
        const poem = await Poem.findById(req.params.id)
        if (!poem) {
            return res.status(404).json({ message: "Poem not found" })
        }

        // Find the comment
        const comment = poem.comments.find((c) => c._id.toString() === req.params.commentId)

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        // Check if user is authorized to delete the comment (comment author or poem author)
        if (comment.author.toString() !== req.user.id && poem.author.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to delete this comment" })
        }

        // Remove the comment
        poem.comments = poem.comments.filter((c) => c._id.toString() !== req.params.commentId)

        await poem.save()

        res.json({ message: "Comment removed" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
//