import React, { useEffect, useState } from 'react';
import './BookRecommendations.css';

const BookRecommendations = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserIndex, setSelectedUserIndex] = useState(null);
    const [recommendations, setRecommendations] = useState({ level: [], both: [] });

    useEffect(() => {
        fetch('http://localhost:3001/api/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error('Failed to fetch users:', err));
    }, []);

    const handleUserChange = async (e) => {
        const index = parseInt(e.target.value, 10); // ✅ fix here
        setSelectedUserIndex(index);

        const res = await fetch(`http://localhost:3001/api/recommendations/${index}`);
        const data = await res.json();
        setRecommendations(data);
    };


    const selectedUser = Number.isInteger(selectedUserIndex) ? users[selectedUserIndex] : null;


    return (
        <div className="recommendation-box">
            <h2>📖 Book Recommendations</h2>

            <select onChange={handleUserChange} defaultValue="">
                <option value="" disabled>Select a user</option>
                {users.map((u, i) => (
                    <option key={i} value={i}>
                        {u.name[0]} {u.surname[0]}
                    </option>
                ))}
            </select>

            {/* 🧠 Display user info */}
            {selectedUser && (
                <div className="user-info">
                    <p><strong>Reading Level:</strong> {selectedUser.readingLevel[0]}</p>
                    <p><strong>Preferred Theme:</strong> {selectedUser.preferredTheme[0]}</p>
                </div>
            )}

            {selectedUserIndex !== null && (
                <>
                    <h3>Based on Reading Level</h3>
                    <ul>
                        {recommendations.level.map((book, i) => (
                            <li key={i}>{book.title[0]}</li>
                        ))}
                    </ul>

                    <h3>Based on Reading Level & Preferred Theme</h3>
                    <ul>
                        {recommendations.both.map((book, i) => (
                            <li key={i}>{book.title[0]}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default BookRecommendations;
