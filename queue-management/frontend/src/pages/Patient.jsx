import { useEffect, useState } from "react";

const analyzeReason = (reason) => {
  const text = reason.toLowerCase();
  const emergencyWords = ["chest pain", "breathing", "unconscious", "stroke", "severe bleeding"];
  const urgentWords = ["fever", "vomiting", "dizziness", "infection", "high bp", "blood pressure"];
  const followUpWords = ["follow", "routine", "checkup", "report", "review"];

  if (emergencyWords.some((word) => text.includes(word))) {
    return {
      urgency: "Emergency",
      department: "Emergency Care",
      waitTime: "Immediate attention recommended",
      advice: "Please contact emergency services or visit emergency care now.",
    };
  }
  if (urgentWords.some((word) => text.includes(word))) {
    return {
      urgency: "Urgent",
      department: "General Medicine",
      waitTime: "Estimated 10-20 minutes",
      advice: "Keep previous reports ready and drink water unless advised otherwise.",
    };
  }
  if (followUpWords.some((word) => text.includes(word))) {
    return {
      urgency: "Normal",
      department: "General Medicine",
      waitTime: "Estimated 20-40 minutes",
      advice: "Bring your earlier prescription, reports, and medicine list.",
    };
  }

  return {
    urgency: "Normal",
    department: "General Medicine",
    waitTime: "Estimated 20-45 minutes",
    advice: "Share clear symptoms, duration, allergies, and current medicines with the doctor.",
  };
};

export default function Patient({ currentUser, doctors, appointments, addAppointment, onLogout }) {
  const patientName = currentUser?.fullName || currentUser?.username || "Patient";
  const [form, setForm] = useState({
    doctorId: doctors[0]?.id || "",
    department: doctors[0]?.department || "General Medicine",
    date: "2026-05-20",
    time: "12:00",
    reason: "",
  });
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    if (doctors.length && !form.doctorId) {
      setForm((current) => ({
        ...current,
        doctorId: doctors[0].id,
        department: doctors[0].department || current.department,
      }));
    }
  }, [doctors, form.doctorId]);

  const myAppointments = appointments.filter((appointment) => appointment.patientName === patientName);
  const currentToken = myAppointments.find(
    (appointment) => appointment.status === "Waiting" || appointment.status === "In Consultation"
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "doctorId") {
      const selectedDoctor = doctors.find((doctor) => doctor.id === value);
      setForm({
        ...form,
        doctorId: value,
        department: selectedDoctor?.department || form.department,
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleAiAnalyze = () => {
    if (!form.reason.trim()) {
      alert("Enter symptoms or reason first");
      return;
    }

    const suggestion = analyzeReason(form.reason);
    setAiSuggestion(suggestion);
    setForm({ ...form, department: suggestion.department });
  };

  const handleBookAppointment = (event) => {
    event.preventDefault();

    if (!form.doctorId || !form.date || !form.time || !form.reason) {
      alert("Fill all appointment details");
      return;
    }

    const selectedDoctor = doctors.find((doctor) => doctor.id === form.doctorId);
    addAppointment({
      doctorId: form.doctorId,
      doctorName: selectedDoctor?.fullName || "",
      department: form.department,
      date: form.date,
      time: form.time,
      reason: form.reason,
      aiNote: aiSuggestion
        ? `${aiSuggestion.urgency} | ${aiSuggestion.waitTime} | ${aiSuggestion.advice}`
        : "Not analyzed",
    });

    setForm({ ...form, reason: "" });
    setAiSuggestion(null);
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">Patient Panel</p>
          <h1>Welcome, {patientName}</h1>
        </div>
        <button className="outline-btn" onClick={onLogout}>Logout</button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Your Token</span>
          <strong>{currentToken ? currentToken.token : "-"}</strong>
        </article>
        <article className="stat-card">
          <span>Status</span>
          <strong>{currentToken ? currentToken.status : "None"}</strong>
        </article>
        <article className="stat-card">
          <span>Total Visits</span>
          <strong>{myAppointments.length}</strong>
        </article>
        <article className="stat-card">
          <span>Doctors</span>
          <strong>{doctors.length}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Book Appointment</h2>
            <p>Select doctor, time, and reason for visit.</p>
          </div>

          <form className="stacked-form" onSubmit={handleBookAppointment}>
            <select name="doctorId" value={form.doctorId} onChange={handleChange}>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
            <input name="date" type="date" value={form.date} onChange={handleChange} />
            <input name="time" type="time" value={form.time} onChange={handleChange} />
            <textarea name="reason" placeholder="Reason for appointment" value={form.reason} onChange={handleChange} />
            <button className="secondary-action" type="button" onClick={handleAiAnalyze}>
              AI Analyze Symptoms
            </button>
            {aiSuggestion && (
              <div className="ai-box">
                <div className="ai-box-title">
                  <span>AI Visit Assistant</span>
                  <strong>{aiSuggestion.urgency}</strong>
                </div>
                <p>{aiSuggestion.waitTime}</p>
                <p>{aiSuggestion.advice}</p>
              </div>
            )}
            <button type="submit">Book Appointment</button>
          </form>
        </div>

        <div className="panel wide-panel">
          <div className="panel-heading">
            <h2>My Appointments</h2>
            <p>Track queue number and appointment status.</p>
          </div>

          {myAppointments.length === 0 ? (
            <div className="empty-state">No appointments booked yet.</div>
          ) : (
            <div className="queue-list">
              {myAppointments.map((appointment) => (
                <div className="queue-item" key={appointment.id}>
                  <div className="token-box">{appointment.token}</div>
                  <div className="queue-details">
                    <strong>{appointment.doctorName}</strong>
                    <span>{appointment.date} at {appointment.time}</span>
                    <span>{appointment.reason}</span>
                  </div>
                  <span className={`status-pill ${appointment.status.toLowerCase().replace(" ", "-")}`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
