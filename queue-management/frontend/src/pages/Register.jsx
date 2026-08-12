import { useState } from "react";

export default function Register({ setPage, onRegister }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateAccount = async () => {
    if (!fullName || !email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      await onRegister({ name: fullName, email, password });
      alert("Account created successfully");
      setPage("login");
    } catch (error) {
      alert(error.message || "Unable to create account");
    }
  };

  return (
    <div className="login-page">
      <nav className="navbar">
        <h2>QueueCare</h2>
        <button className="login-btn" onClick={() => setPage("login")}>Go Back</button>
      </nav>

      <div className="login-container">
        <h1>Create Account</h1>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleCreateAccount}>Create Account</button>
      </div>
    </div>
  );
}
