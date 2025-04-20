import React, { useEffect, useState } from 'react';
import './XslBookViewerMerged.css';

const XslBookViewer = () => {
    const [selectedTitle, setSelectedTitle] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [users, setUsers] = useState([]);
    const [allTitles, setAllTitles] = useState([]);
    const [allThemes, setAllThemes] = useState([]);

    useEffect(() => {
        const loadUsers = async () => {
            const res = await fetch('http://localhost:3001/api/users');
            const data = await res.json();
            setUsers(data);
            setSelectedLevel(data[0]?.readingLevel[0] || 'Intermediate');
        };
        loadUsers();
    }, []);

    useEffect(() => {
        const loadBooksWithXSL = async () => {
            try {
                const [xmlRes, xslRes] = await Promise.all([
                    fetch('http://localhost:3001/books.xml'),
                    fetch('http://localhost:3001/books.xsl')
                ]);

                const xmlText = await xmlRes.text();
                const xslText = await xslRes.text();

                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlText, 'application/xml');
                const xsl = parser.parseFromString(xslText, 'application/xml');

                const processor = new XSLTProcessor();
                processor.importStylesheet(xsl);

                processor.setParameter(null, 'userLevel', selectedLevel);
                processor.setParameter(null, 'selectedTitle', selectedTitle);
                processor.setParameter(null, 'selectedTheme', selectedTheme);

                const fragment = processor.transformToFragment(xml, document);
                const container = document.getElementById('xsl-book-output');
                container.innerHTML = '';
                container.appendChild(fragment);

                // Extract titles and themes once
                if (allTitles.length === 0 || allThemes.length === 0) {
                    const titles = Array.from(xml.getElementsByTagName('title')).map(el => el.textContent);
                    const themes = Array.from(xml.getElementsByTagName('theme')).map(el => el.textContent);
                    setAllTitles([...new Set(titles)]);
                    setAllThemes([...new Set(themes)]);
                }

            } catch (err) {
                console.error('❌ Error rendering XML with XSL:', err);
            }
        };

        if (selectedLevel !== '') {
            loadBooksWithXSL();
        }
    }, [selectedTitle, selectedLevel, selectedTheme]);

    return (
        <div className="xsl-viewer">
            <h2>📚 XSL Book Viewer (Highlight + Filter + Detail)</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {/* Reading level (user) */}
                <select className="xsl-dropdown" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
                    {users.map((user, i) => (
                        <option key={i} value={user.readingLevel[0]}>
                            {user.name[0]} {user.surname[0]} ({user.readingLevel[0]})
                        </option>
                    ))}
                </select>

                {/* Title selection */}
                <select className="xsl-dropdown" value={selectedTitle} onChange={e => setSelectedTitle(e.target.value)}>
                    <option value="">-- Select title --</option>
                    {allTitles.map((title, i) => (
                        <option key={i} value={title}>{title}</option>
                    ))}
                </select>

                {/* Theme selection */}
                <select className="xsl-dropdown" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}>
                    <option value="">-- Filter by theme --</option>
                    {allThemes.map((theme, i) => (
                        <option key={i} value={theme}>{theme}</option>
                    ))}
                </select>
            </div>

            <div id="xsl-book-output">Loading...</div>
        </div>
    );
};

export default XslBookViewer;
