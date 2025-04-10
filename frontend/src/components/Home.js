"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaRss, FaUser, FaSignOutAlt, FaPen } from "react-icons/fa"
import Feed from "./Feed"
import Profile from "./Profile"
import { useAuth } from "../context/AuthContext"

const Home = () => {
    const [activeTab, setActiveTab] = useState("feed")
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <header className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-purple-700">Dead Poet's Society Club</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab("compose")}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <FaPen className="mr-2" />
                            Compose
                        </button>
                    </div>
                </header>

                <main className="flex flex-col md:flex-row gap-6">
                    {/* Navigation Sidebar */}
                    <div className="w-full md:w-64 bg-white shadow-md rounded-lg p-4 h-fit">
                        <nav>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => setActiveTab("feed")}
                                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${activeTab === "feed" ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100"
                                            }`}
                                    >
                                        <FaRss className="mr-3" />
                                        Feed
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${activeTab === "profile" ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100"
                                            }`}
                                    >
                                        <FaUser className="mr-3" />
                                        Profile
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 rounded-lg flex items-center text-red-600 hover:bg-red-50"
                                    >
                                        <FaSignOutAlt className="mr-3" />
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === "feed" && <Feed />}
                        {activeTab === "profile" && <Profile />}
                        {activeTab === "compose" && (
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Compose a Poem</h2>
                                <form>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                            placeholder="Enter poem title"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                                            Content
                                        </label>
                                        <textarea
                                            id="content"
                                            rows="8"
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                            placeholder="Write your poem here..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
                                    >
                                        Publish Poem
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Home
