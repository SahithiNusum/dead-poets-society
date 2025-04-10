"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaUserAlt, FaLock, FaCheckCircle } from "react-icons/fa"
import axios from "axios"

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    })
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const { username, password, confirmPassword } = formData

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            const response = await axios.post("http://localhost:5000/api/users/register", {
                username,
                password,
            })

            if (response.data.success) {
                navigate("/login")
            }
        } catch (err) {
            setError(err.response.data.message || "Registration failed")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dead Poet's Society Club</h1>
                    <p className="text-gray-600 mt-2">Join our community of poets</p>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <div className="flex items-center border rounded-lg px-3 py-2">
                            <FaUserAlt className="text-gray-400 mr-2" />
                            <input
                                className="w-full outline-none"
                                type="text"
                                name="username"
                                id="username"
                                value={username}
                                onChange={onChange}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="flex items-center border rounded-lg px-3 py-2">
                            <FaLock className="text-gray-400 mr-2" />
                            <input
                                className="w-full outline-none"
                                type="password"
                                name="password"
                                id="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Enter your password"
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="flex items-center border rounded-lg px-3 py-2">
                            <FaCheckCircle className="text-gray-400 mr-2" />
                            <input
                                className="w-full outline-none"
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                placeholder="Confirm your password"
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
                    >
                        Register
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
