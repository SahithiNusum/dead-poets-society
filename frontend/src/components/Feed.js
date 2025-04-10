"use client"

import { useState, useEffect } from "react"
import { FaHeart, FaRegHeart, FaComment, FaTrash } from "react-icons/fa"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const Feed = () => {
    const [poems, setPoems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [commentText, setCommentText] = useState("")
    const [activeCommentId, setActiveCommentId] = useState(null)
    const [visibleComments, setVisibleComments] = useState({})
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPoems = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/poems", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
                setPoems(response.data)
                setLoading(false)
            } catch (err) {
                setError("Failed to fetch poems")
                setLoading(false)
            }
        }

        fetchPoems()

        // Set up an interval to refresh the feed every 30 seconds
        const intervalId = setInterval(fetchPoems, 30000)

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId)
    }, [])

    const handleLike = async (poemId) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/poems/${poemId}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            )

            // Update poems state with the updated likes
            setPoems(
                poems.map((poem) =>
                    poem._id === poemId ? { ...poem, likes: response.data.likes, isLiked: response.data.isLiked } : poem,
                ),
            )
        } catch (err) {
            console.error("Error liking poem:", err)
        }
    }

    const handleComment = async (poemId) => {
        if (!commentText.trim()) return

        try {
            const response = await axios.post(
                `http://localhost:5000/api/poems/${poemId}/comment`,
                { content: commentText },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            )

            // Update poems state with the new comment
            setPoems(
                poems.map((poem) => (poem._id === poemId ? { ...poem, comments: [...poem.comments, response.data] } : poem)),
            )

            setCommentText("")
            setActiveCommentId(null)
        } catch (err) {
            console.error("Error commenting on poem:", err)
        }
    }

    const handleDeleteComment = async (poemId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return

        try {
            await axios.delete(`http://localhost:5000/api/poems/${poemId}/comment/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            // Update poems state by removing the deleted comment
            setPoems(
                poems.map((poem) => {
                    if (poem._id === poemId) {
                        return {
                            ...poem,
                            comments: poem.comments.filter((comment) => comment._id !== commentId),
                        }
                    }
                    return poem
                }),
            )
        } catch (err) {
            console.error("Error deleting comment:", err)
        }
    }

    const toggleComments = (poemId) => {
        setVisibleComments((prev) => ({
            ...prev,
            [poemId]: !prev[poemId],
        }))
    }

    if (loading) return <div className="text-center py-8">Loading poems...</div>
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Poetry Feed</h2>

            {poems.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                    <p className="text-gray-600">No poems have been shared yet. Be the first to share your poetry!</p>
                </div>
            ) : (
                poems.map((poem) => (
                    <div key={poem._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold cursor-pointer"
                                    onClick={() => navigate(`/user/${poem.author._id}`)}
                                >
                                    {poem.author.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <p
                                        className="font-medium cursor-pointer hover:text-purple-600"
                                        onClick={() => navigate(`/user/${poem.author._id}`)}
                                    >
                                        {poem.author.username}
                                    </p>
                                    <p className="text-gray-500 text-sm">{new Date(poem.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2">{poem.title}</h3>
                            <div className="whitespace-pre-line mb-4 text-gray-700">{poem.content}</div>

                            <div className="flex items-center space-x-4 text-gray-500">
                                <button
                                    onClick={() => handleLike(poem._id)}
                                    className="flex items-center space-x-1 hover:text-purple-600"
                                >
                                    {poem.isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                                    <span>{poem.likes?.length || 0}</span>
                                </button>

                                <button
                                    onClick={() => setActiveCommentId(activeCommentId === poem._id ? null : poem._id)}
                                    className="flex items-center space-x-1 hover:text-purple-600"
                                >
                                    <FaComment />
                                    <span>{poem.comments?.length || 0}</span>
                                </button>
                            </div>
                        </div>

                        {poem.comments && poem.comments.length > 0 && (
                            <>
                                <button
                                    onClick={() => toggleComments(poem._id)}
                                    className="text-sm text-purple-600 hover:text-purple-800 px-6 py-2 flex items-center"
                                >
                                    {visibleComments[poem._id] ? "Hide comments" : "Show comments"}
                                </button>

                                {visibleComments[poem._id] && (
                                    <div className="bg-gray-50 p-4 border-t">
                                        <h4 className="font-medium mb-2">Comments</h4>
                                        <div className="space-y-3">
                                            {poem.comments.map((comment) => (
                                                <div key={comment._id} className="flex">
                                                    <div
                                                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm cursor-pointer"
                                                        onClick={() => navigate(`/user/${comment.author._id}`)}
                                                    >
                                                        {comment.author.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-2 bg-white p-2 rounded-lg flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <p
                                                                className="text-sm font-medium cursor-pointer hover:text-purple-600"
                                                                onClick={() => navigate(`/user/${comment.author._id}`)}
                                                            >
                                                                {comment.author.username}
                                                            </p>
                                                            {(user.id === comment.author._id || user.id === poem.author._id) && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(poem._id, comment._id)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                    title="Delete comment"
                                                                >
                                                                    <FaTrash size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-sm">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Comment form */}
                        {activeCommentId === poem._id && (
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        placeholder="Write a comment..."
                                    />
                                    <button
                                        onClick={() => handleComment(poem._id)}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}

export default Feed
