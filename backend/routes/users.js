const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body

        // Check if user already exists
        let user = await User.findOne({ username })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Create new user
        user = new User({
            username,
            password,
        })

        await user.save()

        res.status(201).json({ success: true, message: "User registered successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Login user
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body

        // Check if user exists
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // Check password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // Create and sign JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" })

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt,
            },
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Get current user
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// Get user by ID
router.get("/:userId", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
