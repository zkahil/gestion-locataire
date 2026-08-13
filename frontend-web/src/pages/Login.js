// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();
    const [email, setEmail] = useState('admin@loc.fr');
    const [password, setPassword] = useState('admin123');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            toast.success('Connexion réussie');
            navigate('/');
        } else {
            toast.error(result.error || 'Erreur de connexion');
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <i className="fas fa-building" style={{ fontSize: '2.5rem', color: '#1a5f7a' }}></i>
                    <h2 style={{ marginTop: '0.5rem' }}>Gestion Locative</h2>
                    <p className="text-muted text-sm" style={{ color: '#64748b', fontSize: '0.875rem' }}>Connectez-vous</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '500', color: '#475569', marginBottom: '2px' }}>Email</label>
                        <input 
                            id="loginEmail" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '500', color: '#475569', marginBottom: '2px' }}>Mot de passe</label>
                        <input 
                            id="loginPassword" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
                        />
                    </div>
                    <button 
                        className="btn btn-primary w-full" 
                        type="submit"
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '6px', 
                            padding: '0.4rem 1rem', 
                            borderRadius: '8px', 
                            fontWeight: '500', 
                            fontSize: '0.78rem', 
                            border: 'none', 
                            cursor: 'pointer',
                            background: loading ? '#94a3b8' : '#1a5f7a',
                            color: '#fff'
                        }}
                    >
                        <i className="fas fa-sign-in-alt"></i> {loading ? 'Connexion...' : 'Connexion'}
                    </button>
                </form>
                <div className="text-muted text-sm" style={{ marginTop: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>
                    admin@loc.fr / admin123 · gest@loc.fr / gest123 · compta@loc.fr / compta123
                </div>
            </div>
        </div>
    );
};
export default Login;