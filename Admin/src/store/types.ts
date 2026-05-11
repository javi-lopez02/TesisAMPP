export interface AppState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface User {
  id: string;
  correo: string;
  nombre: string;
  apellidos: string;
  rol:
    | "ADMINISTRADOR"
    | "PRESIDENTE_CONSEJO"
    | "SUPERVISOR";
  activo: boolean;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  me: () => Promise<void>;
  clearError: () => void;
}
