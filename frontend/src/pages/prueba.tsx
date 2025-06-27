import React, { useState } from 'react';
import axios from 'axios'; // Importa Axios para hacer solicitudes HTTP

const Prueba = () => {
  // Estados para los inputs
  const [emailDestino, setEmailDestino] = useState(''); // Correo de destino
  const [asunto, setAsunto] = useState(''); // Asunto del correo
  const [contenido, setContenido] = useState(''); // Contenido del correo

  // Función para manejar el submit del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevenir la recarga de la página en el submit

    // Crear el objeto con los datos del formulario
    const formData = {
      correoDestino: emailDestino,  // Correo destino
      asunto,
      contenido,
    };

    console.log('Datos a enviar:', formData);  // Verifica los datos que se están enviando

    try {
      // Enviar datos al backend utilizando Axios
      const response = await axios.post('http://localhost:3000/api/test-send-email', formData);

      // Si la respuesta es exitosa, puedes hacer algo con los datos recibidos
      if (response.data.message) {
        alert(response.data.message);  // Mostrar el mensaje de éxito
      }
    } catch (error) {
      console.error('Error al enviar los datos al backend:', error);
      alert('Ocurrió un error al enviar el correo');
    }
  };

  return (
    <div className="prueba-container">
      <h2>Prueba de Envío de Correo</h2>
      <form onSubmit={handleSubmit}>
        {/* Campo de Correo de destino */}
        <div>
          <label htmlFor="emailDestino">Correo de Destino</label>
          <input
            id="emailDestino"
            type="email"
            value={emailDestino}
            onChange={(e) => setEmailDestino(e.target.value)}
            placeholder="Ingresa el correo de destino"
            required
          />
        </div>

        {/* Campo de Asunto */}
        <div>
          <label htmlFor="asunto">Asunto</label>
          <input
            id="asunto"
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ingresa el asunto del correo"
            required
          />
        </div>

        {/* Campo de Contenido */}
        <div>
          <label htmlFor="contenido">Contenido</label>
          <textarea
            id="contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Ingresa el contenido del correo"
            required
          />
        </div>

        {/* Botón para enviar el formulario */}
        <div>
          <button type="submit">Enviar Correo</button>
        </div>
      </form>
    </div>
  );
};

export default Prueba;
