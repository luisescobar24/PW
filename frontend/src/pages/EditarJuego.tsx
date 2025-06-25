import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../estilos/EditarJuego.css';

interface Imagen {
  url: string;
  descripcion: string;
}

interface Plataforma {
  id: number;
  nombre: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Game {
  id?: number;
  nombre: string;
  precio: number;
  estaOferta: boolean;
  estado: boolean;
  categoriaId: number;
  imagenes: Imagen[];
  videoUrl: string;
  plataformas: Plataforma[];
}

export interface EditarJuegoProps {
  juego: Game;
  onSave: (juegoEditado: Game) => void;
}

const EditarJuego = ({ juego, onSave }: EditarJuegoProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Game>(juego);
  const [todasPlataformas, setTodasPlataformas] = useState<Plataforma[]>([]);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`http://localhost:3000/api/juegos/${id}`)
        .then(res => res.json())
        .then(data => {
          const plataformas = Array.isArray(data.plataformas)
            ? data.plataformas.map((p: any) => ({
                id: p.id ?? p,
                nombre: p.nombre ?? ''
              }))
            : [];
          const imagenes = Array.isArray(data.imagenes) && data.imagenes.length > 0
            ? data.imagenes
            : [{ url: '', descripcion: '' }];
          setFormData({ ...data, plataformas, imagenes });
        })
        .catch(() => setError('No se pudo cargar el juego'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    fetch('http://localhost:3000/api/plataformas')
      .then(res => res.json())
      .then(data => setTodasPlataformas(data))
      .catch(() => setTodasPlataformas([]));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/api/categorias')
      .then(res => res.json())
      .then(data => setTodasCategorias(data))
      .catch(() => setTodasCategorias([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    setFormData(prev => prev && ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'precio' || name === 'categoriaId'
          ? Number(value)
          : value,
    }));
  };

  const handlePlataformaCheckbox = (plataforma: Plataforma) => {
    if (!formData) return;
    const yaSeleccionada = formData.plataformas.some(p => p.id === plataforma.id);
    let nuevasPlataformas;
    if (yaSeleccionada) {
      nuevasPlataformas = formData.plataformas.filter(p => p.id !== plataforma.id);
    } else {
      nuevasPlataformas = [...formData.plataformas, plataforma];
    }
    setFormData(prev => prev && ({
      ...prev,
      plataformas: nuevasPlataformas,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const plataformasIds = formData.plataformas.map(p => p.id);

      await fetch(`http://localhost:3000/api/juegos/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plataformas: plataformasIds
        }),
      });
      setSuccess('Juego actualizado correctamente');
      onSave(formData);
      setTimeout(() => {
        setSuccess('');
        navigate('/adminjuegos');
      }, 1000);
    } catch (err) {
      setError('No se pudo actualizar el juego');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/adminjuegos');
  };

  if (loading || !formData) {
    return (
      <div className="modal">
        <div className="modal-content">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>✏️ Editar Juego: {formData.nombre}</h3>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre *</label>
            <input
              name="nombre"
              type="text"
              required
              value={formData.nombre || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Precio *</label>
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.precio ?? ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>¿Está en oferta?</label>
            <input
              name="estaOferta"
              type="checkbox"
              checked={!!formData.estaOferta}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado ? 'activo' : 'inactivo'}
              onChange={e =>
                setFormData(prev => prev && ({
                  ...prev,
                  estado: e.target.value === 'activo',
                }))
              }
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label>Categoría *</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {todasCategorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          {formData.imagenes.map((img, idx) => (
            <div className="img-block" key={idx}>
              <label>URL de la imagen #{idx + 1}</label>
              <input
                type="url"
                required
                value={img.url || ''}
                onChange={e => {
                  const newImgs = [...formData.imagenes];
                  newImgs[idx].url = e.target.value;
                  setFormData(prev => prev && ({ ...prev, imagenes: newImgs }));
                }}
              />
              <label>Descripción de la imagen #{idx + 1}</label>
              <input
                type="text"
                value={img.descripcion || ''}
                onChange={e => {
                  const newImgs = [...formData.imagenes];
                  newImgs[idx].descripcion = e.target.value;
                  setFormData(prev => prev && ({ ...prev, imagenes: newImgs }));
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const newImgs = formData.imagenes.filter((_, i) => i !== idx);
                  setFormData(prev => prev && ({ ...prev, imagenes: newImgs }));
                }}
                disabled={formData.imagenes.length === 1}
              >
                Eliminar imagen
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-img-btn"
            onClick={() =>
              setFormData(prev => prev && ({
                ...prev,
                imagenes: [...prev.imagenes, { url: '', descripcion: '' }]
              }))
            }
          >
            + Agregar otra imagen
          </button>
          <div>
            <label>Video URL</label>
            <input
              name="videoUrl"
              type="url"
              value={formData.videoUrl || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Plataformas</label>
            <div className="plataformas-list">
              {todasPlataformas.map(plataforma => (
                <label key={plataforma.id}>
                  <input
                    type="checkbox"
                    checked={formData.plataformas.some(p => p.id === plataforma.id)}
                    onChange={() => handlePlataformaCheckbox(plataforma)}
                  />
                  {plataforma.nombre}
                </label>
              ))}
            </div>
          </div>
          <div className="modal-buttons">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarJuego;