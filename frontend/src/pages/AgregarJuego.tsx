import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

interface Imagen {
  url: string;
  descripcion: string;
}

interface Game {
  nombre: string;
  precio: number;
  estaOferta: boolean;
  estado: boolean;
  categoriaId: number;
  imagenes: Imagen[];
  videoUrl: string;
  plataformas: number[];
}

export interface AgregarJuegoProps {
  onClose: () => void;
}

const AgregarJuego = ({ onClose }: AgregarJuegoProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Game>({
    nombre: "",
    precio: 0,
    estaOferta: false,
    estado: true,
    categoriaId: 1,
    imagenes: [],
    videoUrl: "",
    plataformas: [],
  });

  const [imagenUrl, setImagenUrl] = useState("");
  const [imagenDescripcion, setImagenDescripcion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [plataformasDisponibles, setPlataformasDisponibles] = useState<{
    id: number;
    nombre: string;
  }[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data));
    fetch("http://localhost:3000/api/plataformas")
      .then((res) => res.json())
      .then((data) => setPlataformasDisponibles(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target instanceof HTMLInputElement ? e.target.checked : false)
          : name === "precio" || name === "categoriaId"
          ? Number(value)
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePlataformaChange = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      plataformas: prev.plataformas.includes(id)
        ? prev.plataformas.filter((pid) => pid !== id)
        : [...prev.plataformas, id],
    }));
  };

  const handleAgregarImagen = () => {
    if (!imagenUrl.trim()) {
      setErrors((prev) => ({ ...prev, imagenUrl: "La URL de la imagen es requerida" }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, { url: imagenUrl, descripcion: imagenDescripcion }],
    }));
    setImagenUrl("");
    setImagenDescripcion("");
    setErrors((prev) => ({ ...prev, imagenUrl: "" }));
  };

  const handleRemoveImagen = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, idx) => idx !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (formData.precio <= 0) newErrors.precio = "El precio debe ser mayor a 0";
    if (!formData.categoriaId) newErrors.categoriaId = "La categoría es requerida";
    if (formData.imagenes.length === 0) newErrors.imagenes = "Agrega al menos una imagen";
    if (formData.plataformas.length === 0) newErrors.plataformas = "Selecciona al menos una plataforma";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:3000/api/juegos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          navigate("/adminjuegos");
        } else {
          const errorData = await response.json();
          alert("Error al agregar el juego: " + (errorData.message || "Error desconocido"));
        }
      } catch (error) {
        alert("Error de conexión con el servidor");
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Agregar Nuevo Juego</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa el nombre del juego"
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label>Precio ($) *</label>
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              placeholder="0.00"
            />
            {errors.precio && <span className="error-message">{errors.precio}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                name="estaOferta"
                type="checkbox"
                checked={formData.estaOferta}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              ¿Está en oferta?
            </label>
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estado: e.target.value === "true",
                }))
              }
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Categoría *</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId && <span className="error-message">{errors.categoriaId}</span>}
          </div>

          <div className="form-group">
            <label>Imágenes *</label>
            <div className="image-input-group">
              <input
                type="url"
                placeholder="URL de la imagen"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Descripción"
                value={imagenDescripcion}
                onChange={(e) => setImagenDescripcion(e.target.value)}
              />
              <button type="button" onClick={handleAgregarImagen} className="add-btn">
                Agregar Imagen
              </button>
            </div>
            {errors.imagenUrl && <span className="error-message">{errors.imagenUrl}</span>}
            
            {formData.imagenes.length > 0 && (
              <div className="images-list">
                {formData.imagenes.map((img, idx) => (
                  <div key={idx} className="image-item">
                    <span>{img.descripcion || 'Sin descripción'}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImagen(idx)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.imagenes && <span className="error-message">{errors.imagenes}</span>}
          </div>

          <div className="form-group">
            <label>Plataformas *</label>
            <div className="platforms-grid">
              {plataformasDisponibles.map((plat) => (
                <label key={plat.id} className="platform-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.plataformas.includes(plat.id)}
                    onChange={() => handlePlataformaChange(plat.id)}
                  />
                  <span className="checkmark"></span>
                  {plat.nombre}
                </label>
              ))}
            </div>
            {errors.plataformas && <span className="error-message">{errors.plataformas}</span>}
          </div>

          <div className="form-group">
            <label>URL del Video (YouTube)</label>
            <input
              name="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">
              Agregar Juego
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarJuego;