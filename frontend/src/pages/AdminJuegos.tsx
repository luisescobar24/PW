import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EliminarJuego from './EliminarJuego';
import '../estilos/AdminJuegos.css';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Categoria {
  id: number;
  nombre: string;
}

interface Imagen {
  url: string;
  descripcion: string;
}

interface Game {
  id: number;
  nombre: string;
  precio: number;
  estaOferta: boolean;
  estado: string;
  categoriaId: number;
  imagenes: Imagen[];
  videoUrl: string;
  plataformas: number[];
  fechaLanzamiento?: string;
  rating?: number;
  discount?: number;
}

const AdminJuegos = () => {
  const [juegos, setJuegos] = useState<Game[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [juegoAEliminar, setJuegoAEliminar] = useState<Game | null>(null);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [precioMin, setPrecioMin] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");
  const navigate = useNavigate();

  // Cargar juegos desde el backend
  const fetchJuegos = async () => {
    const res = await fetch(`${URL_BACKEND}api/juegos`);
    const data = await res.json();
    const juegosNormalizados = data.map((juego: any) => ({
      ...juego,
      precio: Number(juego.precio),
      estado: juego.estado ? 'Activo' : 'Inactivo',
    }));
    setJuegos(juegosNormalizados);
  };

  // Cargar categorías desde el backend
  const fetchCategorias = async () => {
    const res = await fetch(`${URL_BACKEND}api/categorias`);
    const data = await res.json();
    setCategorias(data);
  };

  useEffect(() => {
    fetchJuegos();
    fetchCategorias();
  }, []);

  // Filtrar juegos por categoría seleccionada
  const juegosFiltrados = juegos.filter(j => {
    let ok = true;
    if (categoriaSeleccionada) ok = ok && j.categoriaId === categoriaSeleccionada;
    if (fechaInicio) ok = ok && typeof j.fechaLanzamiento === 'string' && j.fechaLanzamiento >= fechaInicio;
    if (fechaFin) ok = ok && typeof j.fechaLanzamiento === 'string' && j.fechaLanzamiento <= fechaFin;
    if (precioMin) ok = ok && j.precio >= Number(precioMin);
    if (precioMax) ok = ok && j.precio <= Number(precioMax);
    return ok;
  });

  // Eliminar juego
  const eliminarJuego = async () => {
    if (juegoAEliminar) {
      await fetch(`${URL_BACKEND}api/juegos/${juegoAEliminar.id}`, {
        method: 'DELETE',
      });
      setMostrarEliminar(false);
      setJuegoAEliminar(null);
      fetchJuegos();
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remover el token al hacer logout
    alert('Sesión cerrada.');
    window.location.href = '/'; // Redirigir al inicio
  };

  return (
    <>
      <aside className="sidebar">
        <p>Admin Panel</p>
        <nav>
          <button>Users</button>
          <button
          className={window.location.pathname.includes('juegos') ? 'active' : ''}
          onClick={() => navigate('/adminjuegos')}>
            Games</button>
          <button
          className={window.location.pathname.includes('noticias') ? 'active' : ''}
          onClick={() => navigate('/adminnoticias')}
          >News</button>

          <button>Statistics</button>
          <button onClick={handleLogout}>Log out</button>
        </nav>
      </aside>

      <main className="admin-panel">
        {/* Filtro por categoría (diseño original) */}
        <div className="categorias-filter" style={{ marginBottom: 24 }}>
          <button
            className={!categoriaSeleccionada ? "active" : ""}
            onClick={() => setCategoriaSeleccionada(null)}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              className={categoriaSeleccionada === cat.id ? "active" : ""}
              onClick={() => setCategoriaSeleccionada(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Filtros por fecha de lanzamiento y precio, con diseño similar y debajo de categorías */}
        <div className="extra-filtros-admin" style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filtro-fecha" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ marginRight: 8, fontWeight: 600, color: '#ff6600' }}>Fecha lanzamiento:</label>
            <input className="filter-select" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ marginRight: 8 }} />
            <span style={{ marginRight: 8, color: '#fff' }}>a</span>
            <input className="filter-select" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
          </div>
          <div className="filtro-precio" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ marginRight: 8, fontWeight: 600, color: '#ff6600' }}>Precio:</label>
            <input className="filter-select" type="number" min="0" placeholder="Mín" value={precioMin} onChange={e => setPrecioMin(e.target.value)} style={{ width: 80, marginRight: 8 }} />
            <span style={{ marginRight: 8, color: '#fff' }}>a</span>
            <input className="filter-select" type="number" min="0" placeholder="Máx" value={precioMax} onChange={e => setPrecioMax(e.target.value)} style={{ width: 80 }} />
          </div>
        </div>

        <h2>Gestión de Juegos</h2>
        <div className="actions">
          <button onClick={() => navigate('/agregarjuego')}>+ Agregar Juego</button>
        </div>
        {juegosFiltrados.length === 0 ? (
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
                <th>Categoría</th>
                <th>Fecha Lanzamiento</th>
                <th>Video</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {juegosFiltrados.map((juego) => (
                <tr key={juego.id}>
                  <td>{juego.id}</td>
                  <td>{juego.nombre}</td>
                  <td>${juego.precio.toFixed(2)}</td>
                  <td>{juego.estaOferta ? 'Sí' : 'No'}</td>
                  <td>{juego.estado}</td>
                  <td>
                    {categorias.find(cat => cat.id === juego.categoriaId)?.nombre || juego.categoriaId}
                  </td>
                  <td>{juego.fechaLanzamiento ? new Date(juego.fechaLanzamiento).toLocaleDateString() : '-'}</td>
                  <td>{juego.videoUrl ? '✅' : '❌'}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/editarjuego/${juego.id}`)}
                    >
                      Editar
                    </button>
                    <button onClick={() => { setJuegoAEliminar(juego); setMostrarEliminar(true); }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* MODALES */}
      {mostrarEliminar && juegoAEliminar && (
        <EliminarJuego
          id={juegoAEliminar.id}
          juego={juegoAEliminar.nombre}
          onClose={() => setMostrarEliminar(false)}
          onDeleted={eliminarJuego} // Usamos la función aquí
        />
      )}
    </>
  );
};

export default AdminJuegos;
