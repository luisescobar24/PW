import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../estilos/EditarJuego.css';

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
}

interface AgregarNoticiaProps {
  onClose: () => void;
}

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const AgregarNoticia: React.FC<AgregarNoticiaProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Noticia>({
    id: 0,
    titulo: '',
    contenido: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Solo enviamos título y contenido, sin imágenes
    try {
      const res = await fetch(`${URL_BACKEND}api/noticias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          contenido: formData.contenido,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al guardar la noticia');
      }
      setSuccess('Noticia guardada correctamente');
      setTimeout(() => navigate('/adminnoticias'), 1000);
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar la noticia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Agregar Noticia</h3>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Título *</label>
            <input
              name="titulo"
              type="text"
              required
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Contenido *</label>
            <textarea
              name="contenido"
              required
              value={formData.contenido}
              onChange={handleChange}
              className="descripcion-input"
              placeholder="Contenido de la noticia"
            />
          </div>
          <div className="modal-buttons">
            <button type="button" onClick={() => navigate('/adminnoticias')}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarNoticia;