"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Crear una instancia de la aplicación Express
const app = (0, express_1.default)();
const port = 3000;
// Middleware para procesar solicitudes JSON
app.use(express_1.default.json());
// Ruta de ejemplo
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map