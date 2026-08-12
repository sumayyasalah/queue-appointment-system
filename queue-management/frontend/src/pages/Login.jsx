import { useState } from "react";

export default function Login({ setPage, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter your email and password");
      return;
    }

    try {
      await onLogin({ email, password });
    } catch (error) {
      alert(error.message || "Invalid login");
    }
  };

  return (
    <div className="login-page">
      <nav className="navbar">
        <h2>QueueCare</h2>
        <button className="login-btn" onClick={() => setPage("home")}>Go Back</button>
      </nav>

      <div className="login-container">
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <p className="new-user">
          New User?
          <button className="create-account-btn" onClick={() => setPage("register")}>Create Account</button>
        </p>
      </div>
    </div>
  );
}
