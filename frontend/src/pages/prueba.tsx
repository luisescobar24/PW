import { useState } from 'react';
import axios from 'axios';

const SendEmailTest = () => {
  const [correoDestino, setCorreoDestino] = useState<string>('');
  const [asunto, setAsunto] = useState<string>('');
  const [contenido, setContenido] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!correoDestino || !asunto || !contenido) {
      setError('Correo destino, asunto y contenido son requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:3000/api/test-send-email', {
        correoDestino,
        asunto,
        contenido,
      });

      setSuccess(response.data.message);
      console.log('Correo enviado:', response.data.message); // <-- Agregado
    } catch (err) {
      setError('Error al enviar el correo');
      console.error('Error al enviar el correo:', err); // <-- Opcional: muestra el error en consola
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Prueba de Envío de Correo</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Correo destino"
            value={correoDestino}
            onChange={(e) => setCorreoDestino(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Asunto"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
          />
        </div>
        <div>
          <textarea
            placeholder="Contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Correo'}
        </button>
      </form>

      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SendEmailTest;
