import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';

// DEMO MODE — restore for production:
// import { supabase, authHelpers } from '../lib/supabase';
// (re-add the useEffect that calls getSession + onAuthStateChange)

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: unknown; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user] = useState<User | null>(null);
  const [session] = useState<Session | null>(null);
  const [loading] = useState(false);

  // DEMO MODE — all auth functions are no-ops
  const signUp   = async (_email: string, _password: string, _fullName?: string) => ({ data: null, error: null });
  const signIn   = async (_email: string, _password: string) => ({ data: null, error: null });
  const signOut  = async () => ({ error: null });
  const resetPassword = async (_email: string) => ({ error: null });

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
