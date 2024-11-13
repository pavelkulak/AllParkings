export interface IUser { 
  isAdmin: any;
  id: number;
  name: string;
  surname: string;
  patronymic?: string;
  phone: number;
  email: string;
  role: "user" | "owner" | "admin";
  avatar?: string;
}

export interface AuthState {
  user: IUser | null;
  accessToken: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  surname: string;
  patronymic?: string;
  phone: number;
  email: string;
  password: string;
  role: "user" | "owner";
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
}
