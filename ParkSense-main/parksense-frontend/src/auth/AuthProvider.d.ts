// AuthProvider.d.ts
import { ReactNode } from 'react';
import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider(props: AuthProviderProps): JSX.Element;
export function useAuth(): AuthContextType;