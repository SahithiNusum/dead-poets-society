const express = require("express")
const Poem = require("../models/Poem")
const auth = require("../middleware/auth")
const jwt = require("jsonwebtoken")

const router = express.Router()

// Get all poems
router.get("/", auth, async (req, res) => {
    try {
        const poems = await Poem.find()
            .sort({ createdAt: -1 })
            .populate("author", "username")
            .populate("comments.author", "username")

        // Check if user liked each poem
        const userId = req.user.id

        // Add isLiked field to each poem
        poems.forEach((poem) => {
            poem._doc.isLiked = poem.likes.some((like) => like.toString() === userId)
        })

        res.json(poems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Get poems by current user
router.get("/user", auth, async (req, res) => {
    try {
        const poems = await Poem.find({ author: req.user.id })
            .sort({ createdAt: -1 })
            .populate("author", "username")
            .populate("comments.author", "username")

        res.json(poems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Get poems by specific user
router.get("/user/:userId", auth, async (req, res) => {
    try {
        const poems = await Poem.find({ author: req.params.userId })
            .sort({ createdAt: -1 })
            .populate("author", "username")
            .populate("comments.author", "username")

        // Check if current user liked each poem
        const userId = req.user.id

        // Add isLiked field to each poem
        poems.forEach((poem) => {
            poem._doc.isLiked = poem.likes.some((like) => like.toString() === userId)
        })

        res.json(poems)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Create a new poem
router.post("/", auth, async (req, res) => {
    try {
        const { title, content } = req.body

        const newPoem = new Poem({
            title,
            content,
            author: req.user.id,
        })

        const poem = await newPoem.save()
        await poem.populate("author", "username")

        res.status(201).json(poem)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Update a poem
router.put("/:id", auth, async (req, res) => {
    try {
        const { title, content } = req.body

        // Check if poem exists
        const poem = await Poem.findById(req.params.id)
        if (!poem) {
            return res.status(404).json({ message: "Poem not found" })
        }

        // Check if user is the author
        if (poem.author.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" })
        }

        // Update poem
        poem.title = title
        poem.content = content

        await poem.save()
        await poem.populate("author", "username")

        res.json(poem)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Delete a poem
router.delete("/:id", auth, async (req, res) => {
    try {
        // Check if poem exists
        const poem = await Poem.findById(req.params.id)
        if (!poem) {
            return res.status(404).json({ message: "Poem not found" })
        }

        // Check if user is the author
        if (poem.author.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" })
        }

        // Use findByIdAndDelete instead of remove()
        await Poem.findByIdAndDelete(req.params.id)

        res.json({ message: "Poem removed" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Like a poem
router.post("/:id/like", auth, async (req, res) => {
    try {
        const poem = await Poem.findById(req.params.id)
        if (!poem) {
            return res.status(404).json({ message: "Poem not found" })
        }

        // Check if the poem has already been liked by this user
        const isLiked = poem.likes.some((like) => like.toString() === req.user.id)

        if (isLiked) {
            // Unlike the poem
            poem.likes = poem.likes.filter((like) => like.toString() !== req.user.id)
        } else {
            // Like the poem
            poem.likes.push(req.user.id)
        }

        await poem.save()

        res.json({ likes: poem.likes, isLiked: !isLiked })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Comment on a poem
router.post("/:id/comment", auth, async (req, res) => {
    try {
        const { content } = req.body

        const poem = await Poem.findById(req.params.id)
        if (!poem) {
            return res.status(404).json({ message: "Poem not found" })
        }

        const newComment = {
            content,
            author: req.user.id,
        }

        poem.comments.push(newComment)
        await poem.save()

        // Get the newly added comment with author populated
        const addedComment = poem.comments[poem.comments.length - 1]
        await addedComment.populate("author", "username")

        res.json(addedComment)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Delete a comment
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

        // Check if user is the comment author or poem author
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
