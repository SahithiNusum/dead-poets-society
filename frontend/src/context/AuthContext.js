"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { jwtDecode } from 'jwt-decode';
// You may need to install this package

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check for existing token on startup
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token")

            if (token) {
                try {
                    // Verify token is valid
                    const decoded = jwtDecode(token)

                    const currentTime = Date.now() / 1000

                    if (decoded.exp < currentTime) {
                        // Token expired
                        localStorage.removeItem("token")
                        setUser(null)
                    } else {
                        // Get user data
                        const response = await axios.get("http://localhost:5000/api/users/me", {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        })
                        setUser(response.data)
                    }
                } catch (err) {
                    console.error("Auth verification error:", err)
                    localStorage.removeItem("token")
                    setUser(null)
                }
            }

            setLoading(false)
        }

        checkAuth()
    }, [])

    const login = (token, userData) => {
        localStorage.setItem("token", token)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
    }

    return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}
