export interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name: string } | null;
  login: (user: { id: string; name: string }) => void;
  logout: () => void;
}