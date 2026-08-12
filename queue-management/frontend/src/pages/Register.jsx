import { useState } from 'react';
import { api } from '../api';
export default function Register({ setPage, onAuthenticated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState('');
  const register = async (event) => { event.preventDefault(); try { setError(''); await onAuthenticated(await api('/api/auth/register', { method: 'POST', body: form })); } catch (requestError) { setError(requestError.message); } };
  return <div className="login-page"><nav className="navbar"><h2>QueueCare</h2><button className="login-btn" onClick={() => setPage('login')}>Go Back</button></nav><div className="login-container"><form onSubmit={register}><h1>Create Patient Account</h1>{error && <p className="error-message">{error}</p>}<input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><input type="password" placeholder="Password (8+ characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength="8" required /><button>Create Account</button></form></div></div>;
}
