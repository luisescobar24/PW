import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../estilos/SignUp.css'; // Asegúrate de tener el archivo de estilo correspondiente

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [name, setName] = useState(''); // Estado para almacenar el nombre
  const [modal, setModal] = useState({ show: false, message: '', type: '' });
  const [userCount, setUserCount] = useState<number | null>(null); // Estado para almacenar el número de usuarios
  const [step, setStep] = useState(1); // 1: registro, 2: verificación
  const [verificationCode, setVerificationCode] = useState('');

  const navigate = useNavigate();

  // Mostrar el modal con un mensaje específico
  const showModal = (message: string, type: string = 'error') => {
    setModal({ show: true, message, type });
  };

  const closeModal = () => {
    setModal({ show: false, message: '', type: '' });
    if (modal.type === 'success') {
      navigate('/'); // Redirigir a la página de inicio de sesión
    }
  };

  const handleContinue = async () => {
    if (!email || !password || !username || !country) {
      showModal('Please fill in all the fields.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      showModal('Please enter a valid email address.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/signup', {
        correo: email,
        password,
        nombre: username,
        estado: false, // Estado en false hasta que verifique el código
      });

      if (response.data.success) {
        // Ya se envió el correo de verificación desde el backend
        setStep(2); // Ir al paso de verificación
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        showModal(error.response?.data.message || 'Error creating account');
      } else {
        showModal('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      showModal('Please enter the verification code sent to your email.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/api/auth/verify-code', {
        correo: email,
        verificationCode,
      });
      if (response.status === 200) {
        showModal('Your account has been verified! You can now sign in.', 'success');
        // Aquí podrías limpiar los campos si lo deseas
      }
    } catch (error: any) {
      showModal(error.response?.data.message || 'Invalid or expired code.');
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        {step === 1 && (
          <>
            <div className="signup-left-side">
              <div className="signup-logo-bar">
                <div className="signup-logo">Logo</div>
                <div className="signup-name">GameStore</div>
              </div>
              <h2 className="signup-left-title">Create your free account</h2>
              <p className="signup-description">
                Explore your favorite games and play without restrictions
              </p>
            </div>

            <div className="signup-right-side">
              <h2 className="signup-title">Sign up to GameStore</h2>

              {/* Mostrar el número total de usuarios debajo del título */}
              {userCount !== null && (
                <p className="user-count">
                  Total users: {userCount}
                </p>
              )}

              <label className="signup-label">Email address:</label>
              <input
                className="signup-input"
                type="text"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="signup-label">Password:</label>
              <input
                className="signup-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <small className="signup-hint">
                Password must be at least 8 characters, including a number and a lowercase letter.
              </small>

              <label className="signup-label">Username:</label>
              <input
                className="signup-input"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <small className="signup-hint">
                Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.
              </small>

              <label className="signup-label">Your Country/Region:</label>
              <select
                className="signup-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select your country</option>
                <option>United States</option>
                <option>Peru</option>
                <option>Argentina</option>
                <option>Mexico</option>
              </select>
              <small className="signup-hint">
                For compliance reasons, we're required to collect country information to send you occasional updates and announcements.
              </small>

              <button className="signup-btn" onClick={handleContinue}>Continue →</button>

              {/* Cuadro para mostrar el nombre después de la creación de la cuenta */}
              {name && (
                <div className="name-display">
                  <p>Welcome, {name}!</p>
                </div>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="verify-section">
            <h2>Verify your email</h2>
            <p>Enter the code sent to <b>{email}</b></p>
            <input
              className="signup-input"
              type="text"
              placeholder="Verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button className="signup-btn" onClick={handleVerifyCode}>
              Verify Code
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="modal-signup-overlay">
          <div className="modal-signup">
            <button className="close-btn" onClick={closeModal}>×</button>
            <div className="modal-icon">
              {modal.type === 'success' ? '✅' : '⚠️'}
            </div>
            <h3>{modal.type === 'success' ? 'Success!' : 'Error'}</h3>
            <p className={`modal-signup-message ${modal.type}`}>
              {modal.message}
            </p>
            <div className="modal-signup-actions">
              <button onClick={closeModal}>
                {modal.type === 'success' ? 'Go to Sign In' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
