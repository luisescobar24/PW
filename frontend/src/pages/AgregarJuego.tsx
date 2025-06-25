import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- Agrega esta línea

interface Imagen {
  url: string;
  descripcion: string;
}

interface Game {
  nombre: string;
  precio: number;
  estaOferta: boolean;
  estado: boolean; // <-- booleano
  categoriaId: number;
  imagenes: Imagen[];
  videoUrl: string;
  plataformas: number[];
}

export interface AgregarJuegoProps {
  onClose: () => void;
}

const AgregarJuego = ({ onClose }: AgregarJuegoProps) => {
  const navigate = useNavigate(); // <-- Inicializa navigate
  const [formData, setFormData] = useState<Game>({
    nombre: "",
    precio: 0,
    estaOferta: false,
    estado: true, // <-- booleano, no string
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
    // Fetch categorias y plataformas
    fetch("http://localhost:3000/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data));
    fetch("http://localhost:3000/api/plataformas")
      .then((res) => res.json())
      .then((data) => setPlataformasDisponibles(data));
  }, []);

  // Actualización de campos del formulario
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

  // Manejo de selección de plataformas
  const handlePlataformaChange = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      plataformas: prev.plataformas.includes(id)
        ? prev.plataformas.filter((pid) => pid !== id)
        : [...prev.plataformas, id],
    }));
  };

  // Manejo de imágenes
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

  // Validación del formulario
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

  // Enviar los datos del formulario
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
          navigate("/adminjuegos"); // <-- Redirige después de agregar
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
    <div
      className="modal"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <h3 style={{ marginBottom: "20px", textAlign: "center" }}>➕ Agregar Nuevo Juego</h3>
        <form onSubmit={handleSubmit}>
          {/* Campo para nombre */}
          <div style={{ marginBottom: "15px" }}>
            <label>Nombre *</label>
            <input
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
            {errors.nombre && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.nombre}</span>
            )}
          </div>

          {/* Campo para precio */}
          <div style={{ marginBottom: "15px" }}>
            <label>Precio ($) *</label>
            <input
              name="precio"
              type="number"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
            {errors.precio && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.precio}</span>
            )}
          </div>

          {/* Checkbox de oferta */}
          <div style={{ marginBottom: "15px" }}>
            <label>Oferta</label>
            <input
              name="estaOferta"
              type="checkbox"
              checked={formData.estaOferta}
              onChange={handleChange}
              style={{ marginLeft: "10px" }}
            />
          </div>

          {/* Campo para estado */}
          <div style={{ marginBottom: "15px" }}>
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
              style={{ width: "100%" }}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          {/* Selección de categoría */}
          <div style={{ marginBottom: "15px" }}>
            <label>Categoría *</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              style={{ width: "100%" }}
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.categoriaId}</span>
            )}
          </div>

          {/* Manejo de imágenes */}
          <div style={{ marginBottom: "15px" }}>
            <label>Imágenes *</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
              <input
                type="url"
                placeholder="URL de la imagen"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                style={{ flex: 2 }}
              />
              <input
                type="text"
                placeholder="Descripción"
                value={imagenDescripcion}
                onChange={(e) => setImagenDescripcion(e.target.value)}
                style={{ flex: 2 }}
              />
              <button type="button" onClick={handleAgregarImagen}>
                Agregar
              </button>
            </div>
            {formData.imagenes.length > 0 && (
              <ul>
                {formData.imagenes.map((img, idx) => (
                  <li key={idx}>
                    {img.url} - {img.descripcion}
                  </li>
                ))}
              </ul>
            )}
            {errors.imagenes && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.imagenes}</span>
            )}
          </div>

          {/* Selección de plataformas */}
          <div style={{ marginBottom: "15px" }}>
            <label>Plataformas *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {plataformasDisponibles.map((plat) => (
                <label key={plat.id} style={{ fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    checked={formData.plataformas.includes(plat.id)}
                    onChange={() => handlePlataformaChange(plat.id)}
                  />{" "}
                  {plat.nombre}
                </label>
              ))}
            </div>
            {errors.plataformas && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.plataformas}</span>
            )}
          </div>

          {/* Campo para video URL */}
          <div style={{ marginBottom: "15px" }}>
            <label>URL del Video (YouTube)</label>
            <input
              name="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </div>

          {/* Botones de acción */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "20px", borderTop: "1px solid #eee" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              ✅ Agregar Juego
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarJuego;
