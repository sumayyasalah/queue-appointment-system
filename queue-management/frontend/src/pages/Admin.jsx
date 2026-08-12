import { useState } from "react";

export default function Admin({ users, addUser, appointments, updateAppointmentStatus, onLogout }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Doctor",
    department: "General Medicine",
  });

  const doctors = users.filter((user) => user.role === "doctor");
  const patients = users.filter((user) => user.role === "patient");
  const waiting = appointments.filter((item) => item.status === "Waiting");
  const completed = appointments.filter((item) => item.status === "Completed");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleAddUser = async (event) => {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.password) {
      alert("Fill all user fields");
      return;
    }

    try {
      await addUser(form);
      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "Doctor",
        department: "General Medicine",
      });
    } catch (error) {
      alert(error.message || "Unable to add user");
    }
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>QueueCare Dashboard</h1>
        </div>
        <button className="outline-btn" onClick={onLogout}>Logout</button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total Doctors</span>
          <strong>{doctors.length}</strong>
        </article>
        <article className="stat-card">
          <span>Total Patients</span>
          <strong>{patients.length}</strong>
        </article>
        <article className="stat-card">
          <span>Waiting Queue</span>
          <strong>{waiting.length}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completed.length}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Add User</h2>
            <p>Create doctor, patient, or admin accounts.</p>
          </div>

          <form className="stacked-form" onSubmit={handleAddUser}>
            <input name="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange} />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <select name="role" value={form.role} onChange={handleChange}>
              <option>Doctor</option>
              <option>Patient</option>
              <option>Admin</option>
            </select>
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
            <button type="submit">Add User</button>
          </form>
        </div>

        <div className="panel wide-panel">
          <div className="panel-heading">
            <h2>Appointments</h2>
            <p>Monitor queue tokens and update visit status.</p>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.token}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.doctorName}</td>
                    <td>{appointment.date} {appointment.time}</td>
                    <td>
                      <span className={`status-pill ${appointment.status.toLowerCase().replace(" ", "-")}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={appointment.status}
                        onChange={(event) => updateAppointmentStatus(appointment.id, event.target.value)}
                      >
                        <option>Waiting</option>
                        <option>In Consultation</option>
                        <option>Completed</option>
                        <option>No Show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel wide-panel">
          <div className="panel-heading">
            <h2>Registered Users</h2>
            <p>Current users available for login.</p>
          </div>

          <div className="user-list">
            {users.map((user) => (
              <div className="user-row" key={user.id}>
                <div>
                  <strong>{user.fullName || user.username}</strong>
                  <span>{user.username} | {user.department}</span>
                </div>
                <span className="role-badge">{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
