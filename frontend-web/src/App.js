// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Espaces from './pages/Espaces';
import Locataires from './pages/Locataires';
import Contrats from './pages/Contrats';
import Factures from './pages/Factures';
import Paiements from './pages/Paiements';
import Cautions from './pages/Cautions';
import Alertes from './pages/Alertes';
import Reglement from './pages/Reglement';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
    const { user } = useAuthStore();
    return user ? children : <Navigate to="/login" />;
};

const App = () => (
    <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/espaces" element={<PrivateRoute><Layout><Espaces /></Layout></PrivateRoute>} />
            <Route path="/locataires" element={<PrivateRoute><Layout><Locataires /></Layout></PrivateRoute>} />
            <Route path="/contrats" element={<PrivateRoute><Layout><Contrats /></Layout></PrivateRoute>} />
            <Route path="/factures" element={<PrivateRoute><Layout><Factures /></Layout></PrivateRoute>} />
            <Route path="/paiements" element={<PrivateRoute><Layout><Paiements /></Layout></PrivateRoute>} />
            <Route path="/cautions" element={<PrivateRoute><Layout><Cautions /></Layout></PrivateRoute>} />
            <Route path="/alertes" element={<PrivateRoute><Layout><Alertes /></Layout></PrivateRoute>} />
            <Route path="/reglement" element={<PrivateRoute><Layout><Reglement /></Layout></PrivateRoute>} />
        </Routes>
    </BrowserRouter>
);
export default App;