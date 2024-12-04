import React, { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "./Profile.css";
import Header from "../../Pages/Header/Header";
import avatar_default from "./avatar_default.png";

const Profile = () => {
    const [avatar, setAvatar] = useState(avatar_default);
    const fileInputRef = useRef(null);
    const [elo, setElo] = useState(null); // State to store the fetched ELO
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserElo = async () => {
            try {
                const token = localStorage.getItem("token"); // Assuming JWT is stored in localStorage

                if (!token) {
                    throw new Error("User not authenticated");
                }

                const response = await fetch("http://localhost:5000/user-elo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // Send the token in the Authorization header
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch user ELO.");
                }

                const data = await response.json();
                setElo(data.elo); // Set the ELO value from the backend
            } catch (err) {
                setError(err.message); // Handle errors
            }
        };

        fetchUserElo(); // Fetch the user's ELO when the component mounts
    }, []);

    // Sample ELO rating data - replace with actual data from your backend
    const eloData = [
        { date: 'Jan', rating: 1200 },
        { date: 'Feb', rating: 1250 },
        { date: 'Mar', rating: 1225 },
        { date: 'Apr', rating: 1300 },
        { date: 'May', rating: 1275 },
        { date: 'Jun', rating: 1350 }
    ];

    // Handle when a new image is selected
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatar(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Trigger the hidden file input when avatar is clicked
    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
            <Header />
            <div className="profile-container">
                <div className="profile-left">
                    <img
                        src={avatar}
                        alt="Profile"
                        className="profile-avatar"
                        onClick={handleAvatarClick}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                    />
                    <h2 className="profile-elo">Current ELO: {elo}</h2>
                </div>

                <div className="profile-graph">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={eloData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis
                                domain={['dataMin - 100', 'dataMax + 100']}
                                label={{ value: 'ELO Rating', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="rating"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={{ r: 6 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Profile;