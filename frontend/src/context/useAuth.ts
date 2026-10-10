import { useContext } from 'react';
import { AuthContext } from './authContextValue';
import type { AuthContextValue } from './authContextValue';


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}