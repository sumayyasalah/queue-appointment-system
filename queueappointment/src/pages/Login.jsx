import { useState } from "react";

export default function Login({ setPage, users, setCurrentUser }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = () => {

    const foundUser = users.find(
      (user) =>
        user.username === username &&
        user.password === password &&
        user.role === role
    );

    if (foundUser) {
      setCurrentUser(foundUser);

      if (role === "Doctor") {
        setPage("doctor");
      }

      else if (role === "Admin") {
        setPage("admin");
      }

      else {
        setPage("patient");
      }

    } else {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="login-page">

      <nav className="navbar">

        <h2>QueueCare</h2>

        <button
          className="login-btn"
          onClick={() => setPage("home")}
        >
          Go Back
        </button>

      </nav>

      <div className="login-container">

        <h1>Login</h1>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option>Doctor</option>
          <option>Admin</option>
          <option>Patient</option>
        </select>

        <button onClick={handleLogin}>
          Login
        </button>

        <p className="new-user">
          New User?

          <button
            className="create-account-btn"
            onClick={() => setPage("register")}
          >
            Create Account
          </button>

        </p>

      </div>

    </div>
  );
}