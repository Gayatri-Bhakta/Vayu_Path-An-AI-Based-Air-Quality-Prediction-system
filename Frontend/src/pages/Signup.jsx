import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check passwords before sending to backend
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to create account.");
        setLoading(false);
        return;
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );

      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Air Quality Prediction</h1>

        <p className="auth-subtitle">
          Create your account to get personalized air quality insights.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="name-row">

            <div className="form-group">
              <label htmlFor="first_name">
                First Name
              </label>

              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">
                Last Name
              </label>

              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="signup-email">
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">
              Confirm Password
            </label>

            <input
              id="confirm_password"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {success && (
            <p className="success-message">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="switch-auth">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;