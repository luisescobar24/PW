import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../estilos/AdminJuegos.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Juego {
  id: number;
  nombre: string;
  precio: number;
  estaOferta: boolean;
  estado: boolean;
  descripcion?: string | null;
  categoria?: { nombre: string };
  imagenes?: { url: string }[];
}

const AdminJuegos = () => {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const navigate = useNavigate();

  const fetchJuegos = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}api/juegos`);
      if (!response.ok) throw new Error('Error al obtener juegos');
      const data = await response.json();
      setJuegos(data);
    } catch {
      setJuegos([]);
    }
  };

  useEffect(() => {
    fetchJuegos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Sesión cerrada.');
    window.location.href = '/paginaprincipal';
  };

  return (
    <>
      <aside className="sidebar">
        <p>Admin Panel</p>
        <button
          className="volver-principal-btn"
          onClick={() => navigate('/paginaprincipal')}
        >
          Volver a la página principal
        </button>
        <nav>
          <button>Users</button>
          <button className="active" onClick={() => navigate('/adminjuegos')}>Games</button>
          <button onClick={() => navigate('/adminnoticias')}>News</button>
          <button>Statistics</button>
          <button onClick={handleLogout}>Log out</button>
        </nav>
      </aside>

      <main className="admin-panel">
        <h2>Gestión de Juegos</h2>
        <div className="actions">
          <button onClick={() => navigate('/adminjuegos/agregar')}>+ Agregar Juego</button>
        </div>

        {juegos.length === 0 ? (
          <p className="info">No hay juegos registrados.</p>
        ) : (
          <table className="game-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Oferta</th>
                <th>Estado</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {juegos.map((juego) => (
                <tr key={juego.id}>
                  <td>{juego.id}</td>
                  <td>{juego.nombre}</td>
                  <td>{juego.precio}</td>
                  <td>{juego.estaOferta ? 'Sí' : 'No'}</td>
                  <td>{juego.estado ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    {juego.descripcion && juego.descripcion.length > 60
                      ? juego.descripcion.slice(0, 60) + '...'
                      : juego.descripcion}
                  </td>
                  <td>{juego.categoria?.nombre ?? ''}</td>
                  <td>
                    {juego.imagenes && juego.imagenes.length > 0
                      ? <img src={juego.imagenes[0].url} alt={juego.nombre} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                      : '❌'}
                  </td>
                  <td>
                    <button onClick={() => navigate(`/adminjuegos/editar/${juego.id}`)}>
                      Editar
                    </button>
                    <button onClick={() => navigate(`/adminjuegos/eliminar/${juego.id}`)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
};

export default AdminJuegos;