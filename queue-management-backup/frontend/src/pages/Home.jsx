export default function Home({ setPage }) {

  return (
    <div className="home-container">

      <nav className="navbar">

        <h2>QueueCare</h2>

        <button
          className="login-btn"
          onClick={() => setPage("login")}
        >
          Login
        </button>

      </nav>

      <div className="hero-section">

        <img
          src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
          alt="Hospital"
          className="hospital-img"
        />

        <div className="overlay">

          <h1>Welcome to QueueCare</h1>

          <p>
            Saving time, improving care, and managing appointments easily.
          </p>

        </div>

      </div>

    </div>
  );
}