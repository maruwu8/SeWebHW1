// src/components/AddBookForm.js
import React, { useState } from 'react';
import './AddBookForm.css';

const THEMES = ['Fantasy', 'Mystery', 'Science Fiction', 'Romance', 'Thriller',
    'Adventure', 'Drama', 'Historical Fiction', 'Non-Fiction', 'Self-Help',
    'Biography', 'Poetry', 'Graphic Novel', 'Young Adult', 'Children Literature',
    'Classic Literature', 'Dystopian Fiction', 'Horror', 'Contemporary Fiction'];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const AddBookForm = ({ onBookAdded }) => {
    const [newBook, setNewBook] = useState({ title: '', themes: ['', ''], levels: ['', '', ''] });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e, i, field) => {
        const value = e.target.value;
        if (field === 'themes' || field === 'levels') {
            const copy = [...newBook[field]];
            copy[i] = value;
            setNewBook(prev => ({ ...prev, [field]: copy }));
        } else {
            setNewBook(prev => ({ ...prev, title: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newBook.title || newBook.themes.includes('') || newBook.levels.includes('')) {
            return setError('Please complete all fields.');
        }

        const res = await fetch('http://localhost:3001/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBook),
        });

        if (res.ok) {
            const data = await res.json();
            onBookAdded(data.book);
            setNewBook({ title: '', themes: ['', ''], levels: ['', '', ''] });
            setError('');
            setMessage('✅ Book added successfully!');
            setTimeout(() => setMessage(''), 4000); // Auto-dismiss after 4s
        } else {
            setMessage('');
            setError('❌ Error saving book.');
        }
    };

    return (
        <div className="book-form">
            <h2>➕ Add a Book</h2>
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
                <input value={newBook.title} onChange={e => handleChange(e, null, 'title')} placeholder="Book Title" />

                {[0, 1].map(i => (
                    <select key={i} value={newBook.themes[i]} onChange={e => handleChange(e, i, 'themes')}>
                        <option value="">Select Theme {i + 1}</option>
                        {THEMES.map((t, j) => <option key={j} value={t}>{t}</option>)}
                    </select>
                ))}

                {[0, 1, 2].map(i => (
                    <select key={i} value={newBook.levels[i]} onChange={e => handleChange(e, i, 'levels')}>
                        <option value="">Select Level {i + 1}</option>
                        {LEVELS.map((l, j) => <option key={j} value={l}>{l}</option>)}
                    </select>
                ))}

                <button type="submit">Save Book</button>
            </form>
        </div>
    );
};

export default AddBookForm;
