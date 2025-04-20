import React, { useEffect, useState } from 'react';
import './BookList.css';

const BookList = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/books')
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error('Error loading books:', err));
    }, []);

    const handleRedirect = () => {
        // Change this to the actual selected user's level if needed
        const userLevel = 'Intermediate';
        window.open(`http://localhost:3001/xsl-view`, '_blank');
    };

    return (
        <div className="book-list-scroll">
            <h2>📚 Books</h2>
            <p style={{ fontStyle: 'italic', marginBottom: '0.5rem', color: '#555', fontSize: '20px'}}>
                Currently rendered with React & JSX (not XSL)
            </p>
            <div className="book-list">
                {books.map((book, i) => (
                    <div key={i} className="book-card">
                        <h3>{book.title[0]}</h3>
                        <p><strong>Themes:</strong> {book.themes[0].theme.join(', ')}</p>
                        <p><strong>Levels:</strong> {book.levels[0].level.join(', ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookList;
