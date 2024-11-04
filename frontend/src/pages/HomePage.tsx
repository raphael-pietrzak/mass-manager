// src/HomePage.tsx
import React from 'react';
// import Navbar from '../components/Navbar';

const HomePage: React.FC = () => {
    return (

        <div>
            {/* <Navbar /> */}
            <h1>Home Page</h1>
            <ul>
                <li>
                    <a href="/about">About</a>
                </li>
                <li>
                    <a href="/intention">Intention</a>
                </li>
                <li>
                    <a href="/regularity">Regularity</a>
                </li>
                <li>
                    <a href="/calendar">Calendar</a>
                </li>
                <li>
                    <a href="/admin">Admin</a>
                </li>
            </ul>
        </div>
    );
}

export default HomePage;