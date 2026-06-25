import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const NotFound = () => {
  const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-6xl font-bold text-slate-800">404</h1>
            <p className="text-xl text-slate-500 mt-4">Page Not Found</p>
            <button 
                onClick={() => navigate('/')}
                className="mt-6 px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Go to Home
            </button>
        </div>
    );
};

export default NotFound;