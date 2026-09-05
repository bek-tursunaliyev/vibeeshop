import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

interface User {
  id: number;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  previewMode: boolean;
  dbError: boolean;
  togglePreviewMode: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      try {
        WebApp.ready();
        const initData = WebApp.initData;
        
        // Agar Telegram ichida bo'lmasak, lokal test uchun admin sifatida kirish imkonini beramiz
        const isDev = import.meta.env.DEV;
        let body = { initData };
        if (!initData && isDev) {
           console.log("Local development mode detected. Logging in as admin...");
           body = { initData: '', devModeId: 8594155055 } as any;
        } else if (!initData) {
           setIsLoading(false);
           return;
        }

        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('token', data.token);
        } else if (res.status === 503) {
          setDbError(true);
        } else {
          console.error("Auth failed:", await res.text());
        }
      } catch (err) {
        console.error("Auth process error", err);
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, []);

  const togglePreviewMode = () => setPreviewMode(!previewMode);
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAdmin = user?.role === 'admin' && !previewMode;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, previewMode, dbError, togglePreviewMode, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
