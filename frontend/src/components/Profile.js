"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaHeart, FaComment } from "react-icons/fa"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const Profile = () => {
    const [userPoems, setUserPoems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [editingPoem, setEditingPoem] = useState(null)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
    })
    const [visibleComments, setVisibleComments] = useState({})
    const { user } = useAuth()

    const fetchUserPoems = async () => {
        try {
            // Use the correct endpoint with the user's ID
            const response = await axios.get(`http://localhost:5000/api/poems/user/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            setUserPoems(response.data)
            setLoading(false)
        } catch (err) {
            setError("Failed to fetch your poems")
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserPoems()
    }, [])

    const handleEditClick = (poem) => {
        setEditingPoem(poem._id)
        setFormData({
            title: poem.title,
            content: poem.content,
        })
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()

        try {
            const response = await axios.put(`http://localhost:5000/api/poems/${editingPoem}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            // Update the poems list with the edited poem
            setUserPoems(userPoems.map((poem) => (poem._id === editingPoem ? response.data : poem)))
            setEditingPoem(null)
        } catch (err) {
            console.error("Error updating poem:", err)
            alert("Failed to update poem. Please try again.")
        }
    }

    const handleDelete = async (poemId) => {
        if (!window.confirm("Are you sure you want to delete this poem?")) return

        try {
            // Use the correct endpoint for poem deletion
            await axios.delete(`http://localhost:5000/api/poems/${poemId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            // Remove the deleted poem from the list
            setUserPoems(userPoems.filter((poem) => poem._id !== poemId))
        } catch (err) {
            console.error("Error deleting poem:", err)
            alert("Failed to delete poem. Please try again.")
        }
    }

    const handleDeleteComment = async (poemId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return

        try {
            // Use the correct endpoint for comment deletion
            await axios.delete(`http://localhost:5000/api/poems/${poemId}/comment/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            // Update poems state by removing the deleted comment
            setUserPoems(
                userPoems.map((poem) => {
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
            alert("Failed to delete comment. Please try again.")
        }
    }

    const toggleComments = (poemId) => {
        setVisibleComments((prev) => ({
            ...prev,
            [poemId]: !prev[poemId],
        }))
    }

    if (loading) return <div className="text-center py-8">Loading your profile...</div>
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>

    return (
        <div>
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold">{user?.username || "User"}</h2>
                        <p className="text-gray-600">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Your Poems</h3>

                {userPoems.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">You haven't shared any poems yet.</p>
                ) : (
                    <div className="space-y-6">
                        {userPoems.map((poem) => (
                            <div key={poem._id} className="border rounded-lg p-4">
                                {editingPoem === poem._id ? (
                                    <form onSubmit={handleUpdate}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                                                Content
                                            </label>
                                            <textarea
                                                id="content"
                                                name="content"
                                                value={formData.content}
                                                onChange={handleChange}
                                                rows="6"
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingPoem(null)}
                                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold">{poem.title}</h4>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleEditClick(poem)} className="text-gray-500 hover:text-purple-600">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(poem._id)} className="text-gray-500 hover:text-red-600">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="whitespace-pre-line mb-3 text-gray-700">{poem.content}</div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <FaHeart className="text-red-500 mr-1" />
                                                    <span>{poem.likes?.length || 0} likes</span>
                                                </div>

                                                {poem.comments && poem.comments.length > 0 && (
                                                    <button
                                                        onClick={() => toggleComments(poem._id)}
                                                        className="flex items-center text-gray-500 hover:text-purple-600"
                                                    >
                                                        <FaComment className="mr-1" />
                                                        <span>{poem.comments.length} comments</span>
                                                    </button>
                                                )}
                                            </div>
                                            <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        {poem.comments && poem.comments.length > 0 && visibleComments[poem._id] && (
                                            <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                                                <h5 className="font-medium mb-2 text-sm">Comments</h5>
                                                <div className="space-y-3">
                                                    {poem.comments.map((comment) => (
                                                        <div key={comment._id} className="flex">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm">
                                                                {comment.author.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-2 bg-white p-2 rounded-lg flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="text-sm font-medium">{comment.author.username}</p>
                                                                    <button
                                                                        onClick={() => handleDeleteComment(poem._id, comment._id)}
                                                                        className="text-gray-400 hover:text-red-500"
                                                                        title="Delete comment"
                                                                    >
                                                                        <FaTrash size={12} />
                                                                    </button>
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
