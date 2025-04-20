// src/components/AddUserForm.js
import React, { useState } from 'react';
import './AddUserForm.css';


const THEMES = ['Fantasy', 'Mystery', 'Science Fiction', 'Romance', 'Thriller',
    'Adventure', 'Drama', 'Historical Fiction', 'Non-Fiction', 'Self-Help',
    'Biography', 'Poetry', 'Graphic Novel', 'Young Adult', 'Children Literature',
    'Classic Literature', 'Dystopian Fiction', 'Horror', 'Contemporary Fiction'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const AddUserForm = () => {
    const [user, setUser] = useState({
        name: '', surname: '', preferredTheme: '', readingLevel: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });

        if (res.ok) {
            setMessage('✅ User saved!');
            setUser({ name: '', surname: '', preferredTheme: '', readingLevel: '' });
        } else {
            setMessage('❌ Error saving user.');
        }
    };

    return (
        <div className="book-form">
            <h2>👤 Add User</h2>
            {message && <div className="error-msg">{message}</div>}
            <form onSubmit={handleSubmit}>
                <input name="name" value={user.name} onChange={handleChange} placeholder="Name" />
                <input name="surname" value={user.surname} onChange={handleChange} placeholder="Surname" />

                <select name="preferredTheme" value={user.preferredTheme} onChange={handleChange}>
                    <option value="">Preferred Theme</option>
                    {THEMES.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>

                <select name="readingLevel" value={user.readingLevel} onChange={handleChange}>
                    <option value="">Reading Level</option>
                    {LEVELS.map((l, i) => <option key={i} value={l}>{l}</option>)}
                </select>

                <button type="submit">Save User</button>
            </form>
        </div>
    );
};

export default AddUserForm;
