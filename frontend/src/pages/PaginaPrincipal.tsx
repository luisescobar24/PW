import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../estilos/PaginaPrincipal.css';  // Importa el archivo de estilos

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Juego {
  id: number;
  nombre: string;
  descripcion: string;
  imagenes: { id: number; juegoId: number; url: string; descripcion?: string }[];
  videoUrl: string;
  precio: number;
  categoriaId: number;
  plataformas: number[];  // Lista de plataformas asociadas al juego
}

interface Noticia {
  id: number;
  titulo: string;
  texto: string;
  imagenes: { url: string; descripcion?: string }[];
}

export interface ItemCarrito extends Juego {
  cantidad: number;
}

const PaginaPrincipal: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    const guardado = localStorage.getItem('carrito');
    return guardado ? JSON.parse(guardado) : [];
  });
  const [index, setIndex] = useState(0);
  const [menuCategoriasVisible, setMenuCategoriasVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number>(0);  // 0 = todas
  const [plataformaFiltro, setPlataformaFiltro] = useState<number>(0); // 0 = todas
  const [ordenamiento, setOrdenamiento] = useState('nombre');
  const [mensaje, setMensaje] = useState('');
  const [categorias, setCategorias] = useState<{ id: number, nombre: string }[]>([]);
  const [plataformas, setPlataformas] = useState<{ id: number, nombre: string }[]>([]);

  // Filtros adicionales restaurados
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  // const [cargando, setCargando] = useState(false);

  // Estado para los valores del carrito
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  // Estado para mostrar el modal de edición de usuario
  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);

  // Estado para el carrusel de productos similares
  const [indexSimilares, setIndexSimilares] = useState(0);

  // Cargar juegos desde el backend
  useEffect(() => {
    const fetchJuegos = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/juegos`, {
          params: {
            plataformaId: plataformaFiltro,
            categoriaId: categoriaFiltro,
          }
        });
        console.log('Juegos obtenidos:', response.data); // <-- Agrega esto
        setJuegos(response.data);
      } catch (error) {
        console.error('Error al obtener juegos', error);
      }
    };
    fetchJuegos();
  }, [plataformaFiltro, categoriaFiltro]);

  // Cargar categorías desde el backend
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/categorias`);
        setCategorias([{ id: 0, nombre: 'todas' }, ...response.data]); // Agregar 'todas' como opción
      } catch (error) {
        console.error('Error al obtener categorías', error);
      }
    };
    fetchCategorias();
  }, []);

  // Cargar plataformas desde el backend
  useEffect(() => {
    const fetchPlataformas = async () => {
      try {
        const response = await axios.get(`${URL_BACKEND}api/plataformas`);
        setPlataformas([{ id: 0, nombre: 'todas' }, ...response.data]); // Agregar 'todas' como opción
      } catch (error) {
        console.error('Error al obtener plataformas', error);
      }
    };
    fetchPlataformas();
  }, []);

  // Cargar noticias automáticamente - SIEMPRE MOSTRAR NOTICIAS
  useEffect(() => {
    const noticiasEjemplo: Noticia[] = [
      {
        id: 1,
        titulo: "Nueva actualización de Cyberpunk 2077",
        texto: "CD Projekt Red ha lanzado una nueva actualización que mejora significativamente el rendimiento del juego y añade nuevas características. Los jugadores pueden esperar una experiencia más fluida y nuevas misiones secundarias.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop", descripcion: "Cyberpunk 2077" }]
      },
      {
        id: 2,
        titulo: "Steam presenta las ofertas de verano 2025",
        texto: "Steam ha anunciado sus ofertas de verano con descuentos de hasta el 90% en miles de juegos. La promoción incluye títulos AAA y indies populares que no te puedes perder.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop", descripcion: "Steam Sale" }]
      },
      {
        id: 3,
        titulo: "Nuevo trailer de Elden Ring: Shadow of the Erdtree",
        texto: "FromSoftware revela más detalles sobre la expansión más esperada del año. El DLC promete nuevas áreas, jefes desafiantes y una historia que expandirá el universo de Elden Ring.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop", descripcion: "Elden Ring" }]
      },
      {
        id: 4,
        titulo: "PlayStation 6: Primeros rumores y especificaciones",
        texto: "Se filtran las primeras especificaciones técnicas de la próxima consola de Sony. Los rumores apuntan a un hardware revolucionario que promete cambiar la industria de los videojuegos.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=200&fit=crop", descripcion: "PlayStation" }]
      },
      {
        id: 5,
        titulo: "Nintendo Direct: Anuncios sorprendentes",
        texto: "Nintendo sorprende a los fans con anuncios inesperados en su último Direct. Nuevos juegos de franquicias queridas y colaboraciones inéditas que emocionan a la comunidad.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop", descripcion: "Nintendo" }]
      },
      {
        id: 6,
        titulo: "E-Sports: Championship Mundial 2025",
        texto: "Se acerca el torneo más importante del año con una bolsa de premios récord. Los mejores equipos del mundo competirán por el título y millones de dólares en premios.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop", descripcion: "E-Sports" }]
      },
      {
        id: 7,
        titulo: "Realidad Virtual: Los juegos del futuro",
        texto: "La tecnología VR alcanza nuevos niveles de inmersión. Los desarrolladores están creando experiencias que difuminan la línea entre la realidad y el mundo virtual.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=200&fit=crop", descripcion: "VR Gaming" }]
      },
      {
        id: 8,
        titulo: "Indie Games: Los títulos independientes que debes jugar",
        texto: "Una selección de los mejores juegos independientes que han conquistado a críticos y jugadores. Creatividad sin límites y experiencias únicas te esperan.",
        imagenes: [{ url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=200&fit=crop", descripcion: "Indie Games" }]
      }
    ];
    
    // Cargar noticias inmediatamente sin esperar backend
    setNoticias(noticiasEjemplo);
    console.log('Noticias cargadas automáticamente:', noticiasEjemplo.length);
  }, []);

  // Funciones de carrusel
  const handlePrev = useCallback(() => {
    if (juegos.length === 0) return;
    setIndex(prevIndex => (prevIndex === 0 ? juegos.length - 1 : prevIndex - 1));
  }, [juegos.length]);

  const handleNext = useCallback(() => {
    if (juegos.length === 0) return;
    setIndex(prevIndex => (prevIndex === juegos.length - 1 ? 0 : prevIndex + 1));
  }, [juegos.length]);

  // Función para mostrar mensajes temporales
  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  // Función para agregar al carrito
  const agregarAlCarrito = useCallback((juego: Juego) => {
    const cantidad = cantidades[juego.id] || 1;

    if (cantidad <= 0) {
      mostrarMensaje('La cantidad debe ser al menos 1');
      return;
    }

    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => item.id === juego.id);
      if (itemExistente) {
        return prevCarrito.map(item => 
          item.id === juego.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      } else {
        return [...prevCarrito, { ...juego, cantidad }];
      }
    });
    setCantidades(prev => ({ ...prev, [juego.id]: 1 }));
    mostrarMensaje(`${juego.nombre} agregado al carrito`);
  }, [cantidades]);

  // Función para eliminar del carrito
  const eliminarDelCarrito = useCallback((id: number) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
    mostrarMensaje('Producto eliminado del carrito');
  }, []);

  // Función para actualizar las cantidades en el carrito
  const actualizarCantidadCarrito = useCallback((id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito(prev =>
      prev.map(item => 
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  }, [eliminarDelCarrito]);

  // Filtros optimizados
  const juegosFiltrados = useMemo(() => {
    if (!Array.isArray(juegos) || juegos.length === 0) return [];

    let resultado = [...juegos];

    // Si hay búsqueda, filtra los juegos por nombre, descripción o categoría
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(juego => {
        const nombre = (juego.nombre ?? '').toLowerCase();
        const descripcion = (juego.descripcion ?? '').toLowerCase();
        const categoria = (categorias.find(cat => cat.id === juego.categoriaId)?.nombre ?? '').toLowerCase();

        return nombre.includes(busquedaLower) || descripcion.includes(busquedaLower) || categoria.includes(busquedaLower);
      });
    }

    // Filtrar por categoría seleccionada
    if (categoriaFiltro && categoriaFiltro !== 0) {
      resultado = resultado.filter(juego => juego.categoriaId === categoriaFiltro);
    }

    // Filtrar por plataforma seleccionada
    if (plataformaFiltro && plataformaFiltro !== 0) {
      resultado = resultado.filter(juego =>
        Array.isArray(juego.plataformas) &&
        juego.plataformas.some(
          plat =>
            typeof plat === 'number'
              ? plat === plataformaFiltro
              : typeof plat === 'object' && plat !== null && 'id' in plat && (plat as { id: number }).id === plataformaFiltro
        )
      );
    }

    // Ordenar los juegos
    if (resultado.length > 0) {
      resultado.sort((a, b) => {
        switch (ordenamiento) {
          case 'precio-asc':
            return a.precio - b.precio;
          case 'precio-desc':
            return b.precio - a.precio;
          case 'nombre':
          default:
            return (a.nombre ?? '').localeCompare(b.nombre ?? '');
        }
      });
    }

    return resultado;
  }, [busqueda, categoriaFiltro, plataformaFiltro, ordenamiento, juegos, categorias]);

  // Verifica si no hay juegos filtrados
  const mostrarMensajeNoJuegos = juegosFiltrados.length === 0 && categoriaFiltro !== 0;

  // Calcular totales del carrito
  const totalCarrito = useMemo(() => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }, [carrito]);

  const totalItems = useMemo(() => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  }, [carrito]);

  function cancelarCarrito(): void {
    setCarrito([]);
    mostrarMensaje('Carrito vaciado');
  }

  return (
    <div className="pagina-principal">
      {mensaje && <div className={`mensaje-temporal ${mensaje.includes('error') ? 'error' : 'success'}`}>{mensaje}</div>}

      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }} >
          <h1>🎮 Catálogo de Juegos</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
            <span style={{ fontSize: '14px', color: '#fff' }} >
              📊 {juegos.length} juegos disponibles
            </span>
          </div>
        </div>

        <nav className="navbar">
          <button>Explorar</button>
          <div style={{ position: 'relative', display: 'inline-block' }} >
            <button onClick={() => setMenuCategoriasVisible((v) => !v)} className="dropdown-btn">
              Categorías
            </button>
            {menuCategoriasVisible && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#222', border: '1px solid #444', zIndex: 10, minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} >
                <button onClick={() => navigate('/masvendidos')}>
                  🔥 Juegos más vendidos
                </button>
                <button onClick={() => navigate('/mejorvalorados')}>
                  ⭐ Juegos mejor valorados
                </button>
                <hr style={{ border: '1px solid #444', margin: '4px 0' }} />
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    style={{ width: '100%', color: '#fff', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => {
                      setCategoriaFiltro(cat.id);  // Filtra por ID de categoría
                      setMenuCategoriasVisible(false);
                    }}
                  >
                    {cat.nombre === 'todas' ? 'Todas las Categorías' : cat.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => navigate('/paginaprincipal')} className="active">Inicio</button>
          <button>Plataformas</button>
          <button>Ofertas Especiales</button>
          <button id="boton-editar-usuario" title="Editar perfil" onClick={() => setModalEditarUsuario(true)}>
            <span role="img" aria-label="editar usuario">🛠️</span>
          </button>
          <div className="nav-icons" onClick={() => navigate('/adminjuegos')} title="Panel de Administración" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/adminjuegos')} >
            <span role="img" aria-label="usuario">👤</span>
          </div>
        </nav>

        {/* Barra de búsqueda y filtros mejorada */}
        <div className="search-filters">
          <input type="text" placeholder="Buscar juegos por nombre, descripción o categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="search-input" />
          <select value={categoriaFiltro ?? 0} onChange={e => setCategoriaFiltro(Number(e.target.value))} className="filter-select">
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre === 'todas' ? 'Todas las Categorías' : cat.nombre}
              </option>
            ))}
          </select>
          <select
            value={plataformaFiltro ?? 0}
            onChange={e => setPlataformaFiltro(Number(e.target.value))}
            className="filter-select"
          >
            {plataformas.map(plat => (
              <option key={plat.id} value={plat.id}>
                {plat.nombre === 'todas' ? 'Todas las Plataformas' : plat.nombre}
              </option>
            ))}
          </select>
          {/* Filtros restaurados de fecha de lanzamiento */}
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="filter-select" placeholder="Fecha inicio" />
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="filter-select" placeholder="Fecha fin" />
          {/* Filtros restaurados de precio */}
          <input type="number" min="0" value={precioMin} onChange={e => setPrecioMin(e.target.value)} className="filter-select" placeholder="Precio mínimo" />
          <input type="number" min="0" value={precioMax} onChange={e => setPrecioMax(e.target.value)} className="filter-select" placeholder="Precio máximo" />
          <select value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value)} className="sort-select">
            <option value="nombre">Ordenar por Nombre</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </header>

      {/* Carrusel de Productos Similares */}
      {juegos.length > 0 && (
        <section className="productos-similares">
          <div className="productos-similares-header">
            <h2>NOTICIAS RECIENTES</h2>
          </div>
          
          <div className="productos-similares-carousel">
            <button className="carousel-nav-btn prev" onClick={() => setIndexSimilares(Math.max(0, indexSimilares - 1))}>
              ‹
            </button>
            
            <div className="productos-similares-container">
              <div 
                className="productos-similares-track" 
                style={{ transform: `translateX(-${indexSimilares * 25}%)` }}
              >
                {noticias.slice(0, 8).map((noticia) => (
                  <div key={noticia.id} className="producto-similar-card">
                    <div className="producto-imagen">
                      <img 
                        src={noticia.imagenes[0]?.url || '/default-news.jpg'} 
                        alt={noticia.titulo}
                        onError={(e) => {
                          e.currentTarget.src = '/default-news.jpg';
                        }}
                      />
                    </div>
                    <div className="producto-info">
                      <h4>{noticia.titulo}</h4>
                      <p className="noticia-preview">
                        {noticia.texto.length > 100 
                          ? `${noticia.texto.substring(0, 100)}...` 
                          : noticia.texto
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="carousel-nav-btn next" onClick={() => setIndexSimilares(Math.min(noticias.length - 4, indexSimilares + 1))}>
              ›
            </button>
          </div>
        </section>
      )}

      {/* ...existing code... */}

      {/* Carrusel de juegos */}
      {juegos.length > 0 && (
        <section className="carousel">
          <button
            className="carousel-btn prev"
            onClick={handlePrev}
            aria-label="Juego anterior"
          >
            ⬅
          </button>

          <div className="carousel-container">
            <div className="carousel-image">
              <img
                src={juegos[index]?.imagenes[0]?.url}
                alt={juegos[index]?.nombre}
                loading="lazy"
              />
            </div>
          </div>

          <button
            className="carousel-btn next"
            onClick={handleNext}
            aria-label="Siguiente juego"
          >
            ➡
          </button>
        </section>
      )}

      {/* Lista de juegos filtrados */}
      <div className="games-grid">
        {mostrarMensajeNoJuegos ? (
          <div className="no-results">
            <p>No hay juegos en esta categoría.</p>
          </div>
        ) : juegosFiltrados.length === 0 ? (
          <div className="no-results">
            <p>No se han encontrado juegos que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          juegosFiltrados.slice(0, 10).map(juego => (
            <div key={juego.id} className="game-card">
              <div className="card-image">
                <img
                  src={juego.imagenes[0]?.url}
                  alt={juego.nombre}
                  loading="lazy"
                />
              </div>
              <div className="card-content">
                <h3>{juego.nombre}</h3>
                <p className="categoria">{categorias.find(cat => cat.id === juego.categoriaId)?.nombre}</p>
                <p className="precio">${juego.precio}</p>
                <button onClick={() => agregarAlCarrito(juego)} className="boton-agregar">
                  🛒 Agregar al carrito
                </button>
                <button onClick={() => navigate(`/detalle/${juego.id}`)} className="boton-detalle">
                  🔍 Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Carrito de compras */}
      <section className="cart">
        <div className="cart-header">
          <h3>🛒 Carrito de Compras <span className="cart-count">({totalItems})</span></h3>
          <p className="cart-total">Total: ${totalCarrito.toFixed(2)}</p>
        </div>

        {carrito.length === 0 ? (
          <div className="cart-empty">
            <p>🛒 Tu carrito está vacío</p>
            <p>¡Explora nuestro catálogo y encuentra juegos increíbles!</p>
          </div>
        ) : (
          <div className="cart-items">
            {carrito.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.imagenes[0]?.url} alt={item.nombre} />
                <div className="item-details">
                  <h4>{item.nombre}</h4>
                  <p className="item-precio">${item.precio}</p>
                </div>
                <div className="item-quantity">
                  <button onClick={() => actualizarCantidadCarrito(item.id, item.cantidad - 1)} disabled={item.cantidad <= 1}>-</button>
                  <span className="item-cantidad">{item.cantidad}</span>
                  <button onClick={() => actualizarCantidadCarrito(item.id, item.cantidad + 1)} disabled={item.cantidad >= 10}>+</button>
                </div>
                <div className="item-total">${(item.precio * item.cantidad).toFixed(2)}</div>
                <button onClick={() => eliminarDelCarrito(item.id)} className="boton-eliminar">🗑️</button>
              </div>
            ))}
          </div>
        )}

        {carrito.length > 0 && (
          <div className="cart-actions">
            <button
              className="boton-confirmar"
              onClick={() => navigate('/confirmarorden', { state: { carrito, total: totalCarrito } })}
            >
              ✔ Confirmar Orden
            </button>
            <button className="boton-cancelar" onClick={cancelarCarrito}>🗑️ Vaciar Carrito</button>
          </div>
        )}
      </section>

      {/* Modal emergente para editar usuario */}
      {modalEditarUsuario && (
        <EditarUsuarioModal onClose={() => setModalEditarUsuario(false)} correo={localStorage.getItem('correo') || ''} />
      )}
    </div>
  );
};
export default PaginaPrincipal;

// Modal separado para lógica y conexión
function EditarUsuarioModal({ onClose, correo }: { onClose: () => void; correo: string }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleGuardar = async () => {
    setError('');
    if (!usuario || !password || !password2) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      // Actualizar usuario y contraseña en el backend
      const res = await axios.put(`${URL_BACKEND}api/usuarios/actualizar`, {
        correo,
        nuevoUsuario: usuario,
        nuevaContrasena: password
      });
      setMensaje('¡Datos actualizados correctamente!');
      setTimeout(() => {
        setMensaje('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className="modal" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: 400, textAlign: 'center' }}>
        <button className="close-btn" onClick={onClose} style={{ float: 'right', fontSize: 24 }}>×</button>
        <h2 style={{ marginBottom: 24, color: '#111' }}>Editar Usuario</h2>
        <label style={{ display: 'block', textAlign: 'left', marginBottom: 8, fontWeight: 600 }}>Nuevo Usuario</label>
        <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Nuevo usuario" style={{ width: '100%', marginBottom: 16, textAlign: 'center', padding: '10px' }} />
        <label style={{ display: 'block', textAlign: 'left', marginBottom: 8, fontWeight: 600 }}>Nueva Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nueva contraseña" style={{ width: '100%', marginBottom: 16, textAlign: 'center', padding: '10px' }} />
        <label style={{ display: 'block', textAlign: 'left', marginBottom: 8, fontWeight: 600 }}>Reingrese Nueva Contraseña</label>
        <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="Reingrese nueva contraseña" style={{ width: '100%', marginBottom: 24, textAlign: 'center', padding: '10px' }} />
        {error && <div className="mensaje-temporal error" style={{ marginBottom: 12 }}>{error}</div>}
        {mensaje && <div className="mensaje-temporal success" style={{ marginBottom: 12 }}>{mensaje}</div>}
        <button className="boton-confirmar" style={{ marginTop: 8, width: '100%' }} onClick={handleGuardar}>Guardar Cambios</button>
      </div>
    </div>
  );
}

// Carrusel de productos similares
function CarruselSimilares({ juegos }: { juegos: any[] }) {
  const [index, setIndex] = useState(0);
  const visible = 5; // Mostrar 5 juegos a la vez
  const total = juegos.length;
  const mostrar = juegos.slice(index, index + visible);

  const handlePrev = () => {
    setIndex(i => Math.max(i - visible, 0));
  };
  const handleNext = () => {
    setIndex(i => Math.min(i + visible, total - visible));
  };

  return (
    <div style={{ background: 'rgba(30,30,30,0.95)', borderRadius: '18px', padding: '32px', margin: '32px 0', boxShadow: '0 4px 24px #0006', color: '#fff', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: 1, color: '#ff6600' }}>Noticias Recientes</h2>
        {/* Eliminado el botón "Ver todo" */}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button onClick={handlePrev} disabled={index === 0} style={{ background: 'none', border: 'none', color: '#ff6600', fontSize: 32, cursor: 'pointer' }}>&lt;</button>
        {mostrar.map(j => (
          <div key={j.id} style={{ background: '#232323', borderRadius: 12, overflow: 'hidden', width: 200, boxShadow: '0 2px 12px #0004', position: 'relative' }}>
            <img src={j.imagen} alt={j.nombre} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
            <div style={{ padding: '8px 12px', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: 4 }}>{j.nombre}</div>
              {j.descuento && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#7bbf32', color: '#fff', fontWeight: 700, borderRadius: 4, padding: '2px 8px', fontSize: 14 }}>-{j.descuento}%</span>
                  <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 13 }}>S/. {j.precioOriginal}</span>
                </div>
              )}
              <div style={{ color: '#7bbf32', fontWeight: 700, fontSize: 18 }}>S/. {j.precio}</div>
            </div>
          </div>
        ))}
        <button onClick={handleNext} disabled={index + visible >= total} style={{ background: 'none', border: 'none', color: '#ff6600', fontSize: 32, cursor: 'pointer' }}>&gt;</button>
      </div>
    </div>
  );
}

