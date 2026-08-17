import axios from "axios";
import httpStatus from "http-status";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";
import { AuthContext } from "./authContext";

const client = axios.create({
    baseURL: `${server}/api/users`
})

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (name, username, password) => {
        const trimmedName = String(name ?? "").trim();
        const trimmedUsername = String(username ?? "").trim();
        const trimmedPassword = String(password ?? "").trim();

        if (!trimmedName || !trimmedUsername || !trimmedPassword) {
            throw new Error("Please fill in all fields.");
        }

        const request = await client.post("/register", {
            name: trimmedName,
            username: trimmedUsername,
            password: trimmedPassword
        });

        if (request.status === httpStatus.CREATED) {
            return request.data.message;
        }

        throw new Error(request.data.message || "Registration failed.");
    }

    const handleLogin = async (username, password) => {
        const trimmedUsername = String(username ?? "").trim();
        const trimmedPassword = String(password ?? "").trim();

        if (!trimmedUsername || !trimmedPassword) {
            throw new Error("Please fill in all fields.");
        }

        const request = await client.post("/login", {
            username: trimmedUsername,
            password: trimmedPassword
        });

        if (request.status === httpStatus.OK) {
            const token = request.data.token;
            localStorage.setItem("token", token);
            setUserData({ username: trimmedUsername, token });
            navigate("/home");
            return request.data;
        }

        throw new Error(request.data.message || "Login failed.");
    }

    const getHistoryOfUser = async () => {
        let request = await client.get("/get_all_activity", {
            params: {
                token: localStorage.getItem("token")
            }
        });
        return request.data
    }

    const addToUserHistory = async (meetingCode) => {
        let request = await client.post("/add_to_activity", {
            token: localStorage.getItem("token"),
            meeting_code: meetingCode
        });
        return request;
    }


    const data = {
        userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}
