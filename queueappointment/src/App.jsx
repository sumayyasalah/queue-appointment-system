import "./App.css";
import { useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Doctor from "./pages/Doctor";
import Admin from "./pages/Admin";
import Patient from "./pages/Patient";

function App() {

  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);

  
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "doctor",
      password: "123",
      role: "Doctor",
      fullName: "Dr. SURUMI",
      department: "General Medicine",
    },

    {
      id: 2,
      username: "admin",
      password: "123",
      role: "Admin",
      fullName: "Hospital Admin",
      department: "Operations",
    },

    {
      id: 3,
      username: "patient",
      password: "123",
      role: "Patient",
      fullName: "SHERIN",
      department: "Patient",
    },
  ]);

  const [appointments, setAppointments] = useState([
    {
      id: 101,
      patientName: "SHERIN",
      doctorName: "Dr. SURUMI",
      department: "General Medicine",
      date: "2026-05-20",
      time: "10:00",
      reason: "Fever and weakness",
      aiNote: "Urgent | Estimated 10-20 minutes | Keep previous reports ready and drink water unless advised otherwise.",
      status: "Waiting",
      token: "A001",
    },
    {
      id: 102,
      patientName: "ANITA",
      doctorName: "Dr. SURUMI",
      department: "General Medicine",
      date: "2026-05-20",
      time: "10:30",
      reason: "Follow-up visit",
      aiNote: "Normal | Estimated 20-40 minutes | Bring your earlier prescription, reports, and medicine list.",
      status: "In Consultation",
      token: "A002",
    },
    {
      id: 103,
      patientName: "SAFIYA",
      doctorName: "Dr. SURUMI",
      department: "General Medicine",
      date: "2026-05-20",
      time: "11:00",
      reason: "Blood pressure check",
      aiNote: "Urgent | Estimated 10-20 minutes | Keep previous reports ready and drink water unless advised otherwise.",
      status: "Completed",
      token: "A003",
    },
  ]);

  const addAppointment = (appointment) => {
    const nextNumber = appointments.length + 1;

    setAppointments([
      ...appointments,
      {
        ...appointment,
        id: Date.now(),
        token: `A${String(nextNumber).padStart(3, "0")}`,
        status: "Waiting",
      },
    ]);
  };

  const updateAppointmentStatus = (id, status) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment
      )
    );
  };

  const addUser = (user) => {
    setUsers([
      ...users,
      {
        ...user,
        id: Date.now(),
      },
    ]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("home");
  };

  return (
    <div>

      
      {page === "home" && (
        <Home setPage={setPage} />
      )}

      
      {page === "login" && (
        <Login
          setPage={setPage}
          users={users}
          setCurrentUser={setCurrentUser}
        />
      )}

      
      {page === "register" && (
        <Register
          setPage={setPage}
          users={users}
          addUser={addUser}
        />
      )}

    
      {page === "doctor" && (
        <Doctor
          currentUser={currentUser}
          appointments={appointments}
          updateAppointmentStatus={updateAppointmentStatus}
          onLogout={handleLogout}
        />
      )}

      
      {page === "admin" && (
        <Admin
          users={users}
          addUser={addUser}
          appointments={appointments}
          updateAppointmentStatus={updateAppointmentStatus}
          onLogout={handleLogout}
        />
      )}

    
      {page === "patient" && (
        <Patient
          currentUser={currentUser}
          doctors={users.filter((user) => user.role === "Doctor")}
          appointments={appointments}
          addAppointment={addAppointment}
          onLogout={handleLogout}
        />
      )}

    </div>
  );
}

export default App;