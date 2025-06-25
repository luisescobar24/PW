import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importa Axios para hacer solicitudes HTTP

const Prueba = () => {
  // Estados para los inputs
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState(false); // Estado booleano
  const [extraField, setExtraField] = useState(''); // Campo adicional si es necesario

  // Estado para almacenar la lista de usuarios
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);  // Para mostrar un mensaje de carga mientras obtenemos los datos

  // Función para obtener los usuarios
  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/usuarios');  // Solicitud GET al backend
      console.log('Usuarios recibidos:', response.data);  // Verifica los datos que recibimos
      setUsuarios(response.data);  // Guardamos los usuarios en el estado
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    } finally {
      setLoading(false);  // Terminamos la carga
    }
  };

  // Ejecutar la solicitud GET al cargar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para manejar el submit del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevenir la recarga de la página en el submit

    // Crear el objeto con los datos del formulario
    const formData = {
      nombre: user,  // Cambié 'user' a 'nombre'
      password,
      email,
      estado,
      extraField,
    };

    console.log('Datos a enviar:', formData);  // Verifica los datos que se están enviando

    try {
      // Enviar datos al backend utilizando Axios
      const response = await axios.post('http://localhost:3000/api/auth/signup', formData);

      // Si la respuesta es exitosa, puedes hacer algo con los datos recibidos
      if (response.data.success) {
        // Crear un objeto para el nuevo usuario a partir de la respuesta del backend
        const newUser = response.data.user;

        // Actualizar el estado de usuarios con el nuevo usuario agregado
        setUsuarios((prevUsuarios) => [...prevUsuarios, newUser]);

        alert('Usuario registrado exitosamente');
      }
    } catch (error) {
      console.error('Error al enviar los datos al backend:', error);
      alert('Ocurrió un error al enviar los datos');
    }
  };

  // Función para mostrar los usuarios en una tabla
  const renderUsuarios = () => {
    if (loading) {
      return <p>Cargando usuarios...</p>;  // Mostrar mensaje mientras cargan los usuarios
    }

    if (usuarios.length === 0) {
      return <p>No hay usuarios disponibles.</p>;  // Mensaje si no hay usuarios
    }

    return (
      <table className="usuarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Correo</th>
            <th>Nombre</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.correo}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.estado ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="prueba-container">
      <h2>Formulario de Prueba</h2>
      <form onSubmit={handleSubmit}>
        {/* Campo de Usuario */}
        <div>
          <label htmlFor="user">Usuario</label>
          <input
            id="user"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Ingresa tu usuario"
            required
          />
        </div>

        {/* Campo de Contraseña */}
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        {/* Campo de Correo */}
        <div>
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
          />
        </div>

        {/* Campo de Estado (booleano) */}
        <div>
          <label htmlFor="estado">Estado (activo/inactivo)</label>
          <input
            id="estado"
            type="checkbox"
            checked={estado}
            onChange={(e) => setEstado(e.target.checked)}
          />
        </div>

        {/* Campo adicional (puedes agregar más campos si es necesario) */}
        <div>
          <label htmlFor="extraField">Campo Adicional</label>
          <input
            id="extraField"
            type="text"
            value={extraField}
            onChange={(e) => setExtraField(e.target.value)}
            placeholder="Campo adicional"
          />
        </div>

        {/* Botón para enviar el formulario */}
        <div>
          <button type="submit">Enviar</button>
        </div>
      </form>

      {/* Mostrar la tabla de usuarios */}
      <h2>Usuarios Registrados</h2>
      {renderUsuarios()}
    </div>
  );
};

export default Prueba;
