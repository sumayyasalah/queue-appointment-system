import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctor from './pages/Doctor';
import Admin from './pages/Admin';
import Patient from './pages/Patient';

const pageFor = (role) => ({ admin: 'admin', staff: 'admin', doctor: 'doctor', patient: 'patient' }[role] || 'home');

export default function App() {
  const [page, setPage] = useState('home');
  const [token, setToken] = useState(() => localStorage.getItem('queuecare_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async (activeToken, user) => {
    if (!activeToken || !user) return;
    try {
      setError('');
      const [appointmentData, doctorData, userData] = await Promise.all([
        api('/api/appointments', { token: activeToken }),
        user.role === 'patient' ? api('/api/users/doctors', { token: activeToken }) : Promise.resolve([]),
        user.role === 'admin' ? api('/api/users', { token: activeToken }) : Promise.resolve([]),
      ]);
      setAppointments(appointmentData); setDoctors(doctorData); setUsers(userData);
    } catch (requestError) { setError(requestError.message); }
  }, []);

  useEffect(() => {
    if (!token) return;
    api('/api/users/profile', { token }).then((user) => { setCurrentUser(user); setPage(pageFor(user.role)); return refresh(token, user); }).catch(() => { localStorage.removeItem('queuecare_token'); setToken(null); });
  }, [token, refresh]);

  const authenticated = async (result) => { localStorage.setItem('queuecare_token', result.token); setToken(result.token); setCurrentUser(result.user); setPage(pageFor(result.user.role)); await refresh(result.token, result.user); };
  const logout = () => { localStorage.removeItem('queuecare_token'); setToken(null); setCurrentUser(null); setAppointments([]); setUsers([]); setDoctors([]); setPage('home'); };
  const props = { token, currentUser, appointments, users, doctors, refresh: () => refresh(token, currentUser), onLogout: logout };
  return <div>{error && <p className="error-message">{error}</p>}{page === 'home' && <Home setPage={setPage} />}{page === 'login' && <Login setPage={setPage} onAuthenticated={authenticated} />}{page === 'register' && <Register setPage={setPage} onAuthenticated={authenticated} />}{page === 'patient' && <Patient {...props} />}{page === 'doctor' && <Doctor {...props} />}{page === 'admin' && <Admin {...props} />}</div>;
}
