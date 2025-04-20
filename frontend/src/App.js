import React from 'react';
import './App.css';
import BookList from './components/BookList';
import AddBookForm from './components/AddBookForm';
import AddUserForm from './components/AddUserForm';
import BookRecommendations from "./components/BookRecommendations";
import XslBookViewerMerged from "./components/XslBookViewerMerged";

function App() {
    return (
        <div className="book-ui-container">
            <div className="book-left-panel">
                <BookList />
                <XslBookViewerMerged/>
            </div>

            <div className="book-right-panel">
                <AddBookForm onBookAdded={() => {}} />
                <AddUserForm />
                <BookRecommendations />
            </div>
        </div>
    );
}

export default App;
