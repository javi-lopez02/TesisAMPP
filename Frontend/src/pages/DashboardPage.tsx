import { useAuthStore } from '../store/authStore';

export const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p>Usuario: {user?.nombre || 'Invitado'}</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Cerrar sesión (simulado)
      </button>
    </div>
  );
};