"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token")
        if (token) {
            axios
                .get("http://localhost:5000/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    setUser(res.data)
                    setLoading(false)
                })
                .catch(() => {
                    localStorage.removeItem("token")
                    setUser(null)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
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
