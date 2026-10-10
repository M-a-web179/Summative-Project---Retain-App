import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getMeRequest, loginRequest, signupRequest } from '../api/auth';
import { tokenStorage } from '../api/client';
import type { User } from '../types';
import { AuthContext } from './authContextValue';
import type { AuthContextValue } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => tokenStorage.get() !== null);


  useEffect(() => {
    if (!tokenStorage.get()) return;

    let cancelled = false;
    getMeRequest()
      .then(({ user: me }) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        tokenStorage.clear(); 
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: created } = await signupRequest(name, email, password);
    tokenStorage.set(token);
    setUser(created);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: loggedIn } = await loginRequest(email, password);
    tokenStorage.set(token);
    setUser(loggedIn);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, signUp, signIn, signOut }),
    [user, isLoading, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}