import { Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ResetPass from './pages/ResetPass';
import Prueba from './pages/prueba';
import PaginaPrincipal from './pages/PaginaPrincipal';
import Detalle from './pages/Detalle';
import ConfirmarOrden from './pages/Confirmarorden'; // Asegúrate de importar ConfirmarOrden
import AdminJuegos from './pages/AdminJuegos';
import AgregarJuego from './pages/AgregarJuego';
import EditarJuegos from './pages/EditarJuego';  
import EliminarJuego from './pages/EliminarJuego';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SignIn
          />
        }
      />
      <Route path="/paginaprincipal" element={<PaginaPrincipal />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/resetpass" element={<ResetPass />} />
      <Route path="/detalle/:id" element={<Detalle />} />
      <Route path="/confirmarorden" element={<ConfirmarOrden />} /> {/* Ruta para confirmar la compra */}
      <Route path="/adminjuegos" element={<AdminJuegos />} /> {/* Ruta para el panel de administración de juegos */}
      <Route path="/agregarjuego" element={<AgregarJuego onClose={() => {}} />} /> {/* Ruta para agregar un nuevo juego */}
      <Route
        path="/editarjuego/:id"
        element={
          <EditarJuegos
            juego={{
              id: 0,
              nombre: '',
              precio: 0,
              imagenes: [],
              estaOferta: false,
              estado: false,
              categoriaId: 0,
              videoUrl: '',
              plataformas: [],
              // agrega aquí cualquier otro campo requerido por Game
            }}
            onClose={() => {}}
            onSave={() => {}}
          />
        }
      /> {/* Ruta para editar un juego existente */}
      <Route
        path="/eliminarjuego/:id"
        element={
          <EliminarJuego
            id={0} // Este valor se actualizará dinámicamente
            juego="" // Este valor se actualizará dinámicamente
            onClose={() => {}}
            onDeleted={() => {}}
          />
        }
      />
    </Routes>
  );
}

export default App;
