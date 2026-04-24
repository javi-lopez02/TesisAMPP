import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="text-center p-12">
    <h1 className="text-6xl font-bold text-slate-400">404</h1>
    <p className="mt-4 text-xl">Página no encontrada</p>
    <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">
      ← Volver al inicio
    </Link>
  </div>
);