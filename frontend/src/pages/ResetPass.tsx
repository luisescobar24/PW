import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // <-- Agrega esto
import '../estilos/ResetPass.css';

const ResetPass = () => {
  // Estados para los inputs
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // Código de verificación
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Paso 1: Solicitar código, Paso 2: Validar código, Paso 3: Cambiar contraseña
  const navigate = useNavigate(); // <-- Agrega esto

  // Función para manejar el submit del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (step === 1) {
      // Validar que el input sea un correo electrónico válido
      const isEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
      if (!isEmail) {
        setMessage('Por favor, ingrese un correo electrónico válido.');
        return;
      }

      setLoading(true);
      setMessage('');
      try {
        const response = await axios.post('http://localhost:3000/api/auth/forgot-password', { 
          correo: email
        });

        setMessage(response.data.message);
        setStep(2); // Ir al paso 2 después de enviar el código
      } catch (error: any) {
        console.error('Error al solicitar el código de verificación:', error);
        setMessage(error.response?.data.message || 'Error al solicitar el código de verificación');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      // Paso 2: Validar el código de verificación
      setLoading(true);
      setMessage('');
      try {
        // Enviar solo el correo y el código de verificación para validarlo
        console.log('Enviando datos al backend para validación del código:', { correo: email, verificationCode });

        const response = await axios.post('http://localhost:3000/api/auth/verify-code', {
          correo: email,
          verificationCode,
        });
        
        setMessage(response.data.message); // Mostrar el mensaje del backend
        setStep(3); // Ir al paso 3 si el código es válido
      } catch (error: any) {
        console.error('Error al validar el código de verificación:', error);
        setMessage(error.response?.data.message || 'Error al validar el código');
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Paso 3: Cambiar la contraseña
      if (newPass !== confirmNewPass) {
        setMessage('Las contraseñas no coinciden');
        return;
      }

      setLoading(true);
      setMessage('');

      try {
        const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
          correo: email,
          verificationCode,
          newPassword: newPass,
          confirmNewPassword: confirmNewPass,
        });
        setMessage(response.data.message);
      } catch (error: any) {
        console.error('Error al restablecer la contraseña:', error);
        setMessage(error.response?.data.message || 'Error al restablecer la contraseña');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="reset-pass-wrapper">
      <div className="containerreset">
        {/* Botón X para cerrar */}
        <button
          className="close-reset"
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: 20,
            right: 30,
            background: 'transparent',
            border: 'none',
            fontSize: '2rem',
            cursor: 'pointer',
            color: '#888'
          }}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="logo">Nivel 100</div>
        <h2 className="reset-title">Restablece tu contraseña</h2>
        <div className="form-box">
          {step === 1 && (
            <>
              <p>
                Ingrese la dirección de correo electrónico de su cuenta de usuario y le enviaremos un mensaje de confirmación de restablecimiento de contraseña.
              </p>

              <input
                type="text"
                placeholder="Ingrese su correo electrónico"
                className="reset-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button className="reset-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Cargando...' : 'Enviar código'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label className="reset-label">Código de verificación:</label>
              <input
                type="text"
                placeholder="Ingrese el código de verificación"
                className="reset-input"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />

              <button className="reset-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Cargando...' : 'Validar código'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <label className="reset-label">Nueva contraseña:</label>
              <input
                type="password"
                placeholder="Nueva contraseña"
                className="reset-input"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />

              <label className="reset-label">Confirmar contraseña:</label>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                className="reset-input"
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
              />

              <button className="reset-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Cargando...' : 'Confirmar cambio'}
              </button>
            </>
          )}

          {message && <p className="reset-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
