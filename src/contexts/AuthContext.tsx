import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  return useContext(AuthContext);
}