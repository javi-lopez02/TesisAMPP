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
    | "DELEGADO"
    | "PRESIDENTE_CONSEJO"
    | "CHOFER"
    | "SUPERVISOR";
  delegancia?: string;
  activo: boolean;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  me: () => Promise<void>;
  clearError: () => void;
}
