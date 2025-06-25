import React, { useState } from 'react';
import axios from 'axios';
import '../estilos/ResetPass.css';

const ResetPass = () => {
  // Estados para los inputs
  const [email, setEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para manejar el submit del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevenir recarga de la página en el submit

    // Validar que la nueva contraseña y confirmación coincidan
    if (newPass !== confirmNewPass) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Enviar solicitud POST al backend para restablecer la contraseña
      const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
        correo: email,       // Usamos correo o nombre
        newPassword: newPass,
        confirmNewPassword: confirmNewPass,
      });

      // Si la respuesta es exitosa, mostrar mensaje de éxito
      setMessage(response.data.message);
    } catch (error: any) {
      console.error('Error al restablecer la contraseña:', error);
      setMessage(error.response?.data.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-pass-wrapper">
      <div className="containerreset">
        <div className="logo">Nivel 100</div>
        <h2 className="reset-title">Restablece tu contraseña</h2>
        <div className="form-box">
          <p>
            Ingrese la dirección de correo electrónico de su cuenta de usuario y le enviaremos un mensaje de confirmación de restablecimiento de contraseña.
          </p>

          <input
            type="text"
            placeholder="Ingrese su usuario o email"
            className="reset-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

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
            {loading ? 'Cargando...' : 'Confirmar'}
          </button>

          {message && <p className="reset-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
