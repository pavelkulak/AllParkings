export interface IUser {
  id: number;
  email: string;
  username: string;
}

export interface AuthState {
  user: IUser | null;
  accessToken: string;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
} 