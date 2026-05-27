export default function Doctor({
  currentUser,
  appointments,
  updateAppointmentStatus,
  onLogout,
}) {
  const doctorName = currentUser?.fullName || "Dr. SURUMI";
  const doctorAppointments = appointments.filter(
    (appointment) => appointment.doctorName === doctorName
  );
  const waitingAppointments = doctorAppointments.filter(
    (appointment) => appointment.status === "Waiting"
  );
  const activeAppointment = doctorAppointments.find(
    (appointment) => appointment.status === "In Consultation"
  );

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">Doctor Panel</p>
          <h1>{doctorName}</h1>
        </div>

        <button className="outline-btn" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Today Appointments</span>
          <strong>{doctorAppointments.length}</strong>
        </article>
        <article className="stat-card">
          <span>Waiting</span>
          <strong>{waitingAppointments.length}</strong>
        </article>
        <article className="stat-card">
          <span>In Consultation</span>
          <strong>{activeAppointment ? activeAppointment.token : "0"}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>
            {doctorAppointments.filter((item) => item.status === "Completed").length}
          </strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Current Patient</h2>
            <p>Consultation in progress.</p>
          </div>

          {activeAppointment ? (
            <div className="current-token">
              <span>{activeAppointment.token}</span>
              <h3>{activeAppointment.patientName}</h3>
              <p>{activeAppointment.reason}</p>
              <button
                onClick={() =>
                  updateAppointmentStatus(activeAppointment.id, "Completed")
                }
              >
                Mark Completed
              </button>
            </div>
          ) : (
            <div className="empty-state">No active consultation.</div>
          )}
        </div>

        <div className="panel wide-panel">
          <div className="panel-heading">
            <h2>Patient Queue</h2>
            <p>Call the next patient and update appointment progress.</p>
          </div>

          <div className="queue-list">
            {doctorAppointments.map((appointment) => (
              <div className="queue-item" key={appointment.id}>
                <div className="token-box">{appointment.token}</div>
                <div className="queue-details">
                  <strong>{appointment.patientName}</strong>
                  <span>{appointment.time} | {appointment.reason}</span>
                  {appointment.aiNote && <span>AI note: {appointment.aiNote}</span>}
                  <span className={`status-pill ${appointment.status.toLowerCase().replace(" ", "-")}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="action-row">
                  <button
                    onClick={() =>
                      updateAppointmentStatus(appointment.id, "In Consultation")
                    }
                  >
                    Call
                  </button>
                  <button
                    className="ghost-btn"
                    onClick={() =>
                      updateAppointmentStatus(appointment.id, "No Show")
                    }
                  >
                    No Show
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}