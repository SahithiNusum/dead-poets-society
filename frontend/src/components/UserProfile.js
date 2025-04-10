"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaHeart, FaComment, FaArrowLeft } from "react-icons/fa"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const UserProfile = () => {
    const [userProfile, setUserProfile] = useState(null)
    const [userPoems, setUserPoems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [visibleComments, setVisibleComments] = useState({})
    const { user } = useAuth()
    const { userId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Fetch user profile
                const profileResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })

                setUserProfile(profileResponse.data)

                // Fetch user's poems
                const poemsResponse = await axios.get(`http://localhost:5000/api/poems/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })

                setUserPoems(poemsResponse.data)
                setLoading(false)
            } catch (err) {
                console.error("Error fetching user profile:", err)
                setError("Failed to load user profile")
                setLoading(false)
            }
        }

        fetchUserProfile()
    }, [userId])

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
            setUserPoems(
                userPoems.map((poem) =>
                    poem._id === poemId ? { ...poem, likes: response.data.likes, isLiked: response.data.isLiked } : poem,
                ),
            )
        } catch (err) {
            console.error("Error liking poem:", err)
        }
    }

    const toggleComments = (poemId) => {
        setVisibleComments((prev) => ({
            ...prev,
            [poemId]: !prev[poemId],
        }))
    }

    if (loading) return <div className="text-center py-8">Loading profile...</div>
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>
    if (!userProfile) return <div className="text-center py-8">User not found</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-purple-600 hover:text-purple-800 mb-6">
                <FaArrowLeft className="mr-2" /> Back
            </button>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {userProfile.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold">{userProfile.username}</h2>
                        <p className="text-gray-600">Member since {new Date(userProfile.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{userProfile.username}'s Poems</h3>

                {userPoems.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">This user hasn't shared any poems yet.</p>
                ) : (
                    <div className="space-y-6">
                        {userPoems.map((poem) => (
                            <div key={poem._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{poem.title}</h3>
                                    <div className="whitespace-pre-line mb-4 text-gray-700">{poem.content}</div>

                                    <div className="flex items-center space-x-4 text-gray-500">
                                        <button
                                            onClick={() => handleLike(poem._id)}
                                            className="flex items-center space-x-1 hover:text-purple-600"
                                        >
                                            {poem.isLiked ? <FaHeart className="text-red-500" /> : <FaHeart />}
                                            <span>{poem.likes?.length || 0}</span>
                                        </button>

                                        <button
                                            onClick={() => toggleComments(poem._id)}
                                            className="flex items-center space-x-1 hover:text-purple-600"
                                        >
                                            <FaComment />
                                            <span>{poem.comments?.length || 0}</span>
                                        </button>
                                    </div>

                                    {poem.comments && poem.comments.length > 0 && (
                                        <>
                                            <button
                                                onClick={() => toggleComments(poem._id)}
                                                className="text-sm text-purple-600 hover:text-purple-800 mt-2 flex items-center"
                                            >
                                                {visibleComments[poem._id] ? "Hide comments" : "Show comments"}
                                            </button>

                                            {visibleComments[poem._id] && (
                                                <div className="bg-gray-50 p-4 border-t mt-2">
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
                                                                    <p
                                                                        className="text-sm font-medium cursor-pointer hover:text-purple-600"
                                                                        onClick={() => navigate(`/user/${comment.author._id}`)}
                                                                    >
                                                                        {comment.author.username}
                                                                    </p>
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserProfile
