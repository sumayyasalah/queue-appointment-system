import { useState } from 'react';
import { api } from '../api';
export default function Login({ setPage, onAuthenticated }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const login = async (event) => { event.preventDefault(); try { setError(''); await onAuthenticated(await api('/api/auth/login', { method: 'POST', body: { email, password } })); } catch (requestError) { setError(requestError.message); } };
  return <div className="login-page"><nav className="navbar"><h2>QueueCare</h2><button className="login-btn" onClick={() => setPage('home')}>Go Back</button></nav><div className="login-container"><form onSubmit={login}><h1>Login</h1>{error && <p className="error-message">{error}</p>}<input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="8" required /><button>Login</button><p className="new-user">New patient? <button type="button" className="create-account-btn" onClick={() => setPage('register')}>Create Account</button></p></form></div></div>;
}
