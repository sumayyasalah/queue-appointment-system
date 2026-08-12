import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctor from "./pages/Doctor";
import Admin from "./pages/Admin";
import Patient from "./pages/Patient";

const normalizeUser = (user) => ({
  ...user,
  id: user._id || user.id,
  username: user.email || user.username,
  fullName: user.name || user.fullName,
  role: user.role?.toLowerCase(),
  department:
    user.department ||
    (user.role === "doctor"
      ? "General Medicine"
      : user.role === "admin"
      ? "Operations"
      : user.role === "staff"
      ? "Staff"
      : "Patient"),
});

const normalizeAppointment = (appointment) => {
  const patient = appointment.patientId || {};
  const doctor = appointment.doctorId || {};
  const date = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toISOString().slice(0, 10)
    : appointment.date || "";
  const token =
    appointment.token ||
    (appointment.tokenNumber ? `A${String(appointment.tokenNumber).padStart(3, "0")}` : "");

  return {
    id: appointment._id || appointment.id,
    patientName: patient.name || appointment.patientName || "Unknown",
    doctorName: doctor.name || appointment.doctorName || "Unknown",
    department:
      appointment.department || doctor.role === "doctor"
        ? "General Medicine"
        : appointment.department || "General Medicine",
    date,
    time: appointment.slot || appointment.time || "",
    reason: appointment.reason || "",
    aiNote: appointment.aiNote || "Not analyzed",
    status: appointment.status || "Waiting",
    token,
  };
};

function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("queuecare_token"));
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(
    async (activeToken, user) => {
      setLoading(true);
      setError("");
      try {
        const [appointmentsData, doctorsData, usersData] = await Promise.all([
          api("/api/appointments", { token: activeToken }),
          api("/api/users/doctors", { token: activeToken }),
          user.role === "admin" ? api("/api/users", { token: activeToken }) : Promise.resolve([]),
        ]);

        setAppointments(appointmentsData.map(normalizeAppointment));
        setDoctors(doctorsData.map((doctor) => normalizeUser(doctor)));
        setUsers(usersData.map(normalizeUser));
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      setLoading(true);
      setError("");
      try {
        const profile = await api("/api/users/profile", { token });
        const user = normalizeUser(profile);
        setCurrentUser(user);
        setPage(user.role === "doctor" ? "doctor" : user.role === "admin" ? "admin" : "patient");
        await loadData(token, user);
      } catch (err) {
        setError(err.message);
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem("queuecare_token");
        setPage("login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token, loadData]);

  const handleAuthenticated = async (endpoint, payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await api(endpoint, { method: "POST", body: payload });
      const user = normalizeUser(data.user);
      const newToken = data.token;
      setToken(newToken);
      localStorage.setItem("queuecare_token", newToken);
      setCurrentUser(user);
      setPage(user.role === "doctor" ? "doctor" : user.role === "admin" ? "admin" : "patient");
      await loadData(newToken, user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async ({ email, password }) => {
    await handleAuthenticated("/api/auth/login", { email, password });
  };

  const handleRegister = async ({ name, email, password }) => {
    await handleAuthenticated("/api/auth/register", { name, email, password, role: "patient" });
  };

  const handleCreateUser = async (user) => {
    const newUser = {
      name: user.fullName,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase(),
    };
    const created = await api("/api/users", { method: "POST", token, body: newUser });
    setUsers((prev) => [...prev, normalizeUser(created)]);
  };

  const handleBookAppointment = async (appointment) => {
    const doctor = doctors.find((doc) => doc.id === appointment.doctorId || doc.fullName === appointment.doctorName);
    if (!doctor) {
      throw new Error("Selected doctor not found");
    }

    const created = await api("/api/appointments", {
      method: "POST",
      token,
      body: {
        doctorId: doctor.id,
        appointmentDate: appointment.date,
        slot: appointment.time,
        reason: appointment.reason,
      },
    });

    setAppointments((prev) => [...prev, normalizeAppointment(created)]);
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    const normalizedStatus = status === "No Show" ? "cancelled" : status;
    const updated = await api(`/api/appointments/${id}`, {
      method: "PUT",
      token,
      body: { status: normalizedStatus },
    });
    setAppointments((prev) => prev.map((appointment) => (appointment.id === (updated._id || updated.id) ? normalizeAppointment(updated) : appointment)));
  };

  const handleLogout = () => {
    localStorage.removeItem("queuecare_token");
    setToken(null);
    setCurrentUser(null);
    setAppointments([]);
    setDoctors([]);
    setUsers([]);
    setPage("home");
  };

  return (
    <div>
      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-message">Loading...</p>}
      {page === "home" && <Home setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} onLogin={handleLogin} />}
      {page === "register" && <Register setPage={setPage} onRegister={handleRegister} />}
      {page === "patient" && (
        <Patient
          currentUser={currentUser}
          doctors={doctors}
          appointments={appointments}
          addAppointment={handleBookAppointment}
          onLogout={handleLogout}
        />
      )}
      {page === "doctor" && (
        <Doctor currentUser={currentUser} appointments={appointments} updateAppointmentStatus={handleUpdateAppointmentStatus} onLogout={handleLogout} />
      )}
      {page === "admin" && (
        <Admin
          users={users}
          addUser={handleCreateUser}
          appointments={appointments}
          updateAppointmentStatus={handleUpdateAppointmentStatus}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
