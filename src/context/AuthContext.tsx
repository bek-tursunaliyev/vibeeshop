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
  authError: string | null;
  debugInfo: string;
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
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const authenticate = async () => {
      try {
        WebApp.ready();
        const initData = WebApp.initData;
        
        setDebugInfo(`InitData mavjudligi: ${initData ? 'HA (uzunligi: ' + initData.length + ')' : 'YOQ'}`);

        // Agar Telegram ichida bo'lmasak, lokal test uchun admin sifatida kirish imkonini beramiz
        const isDev = import.meta.env.DEV;
        let body = { initData };
        if (!initData && isDev) {
           console.log("Local development mode detected. Logging in as admin...");
           body = { initData: '', devModeId: 8594155055 } as any;
        } else if (!initData) {
           setAuthError("Telegram muhiti aniqlanmadi (initData bo'sh). Iltimos, ilovani Telegram ichida oching.");
           setIsLoading(false);
           return;
        }

        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const textResponse = await res.text();
          try {
            const data = JSON.parse(textResponse);
            setToken(data.token);
            setUser(data.user);
            setAuthError(null);
            localStorage.setItem('token', data.token);
          } catch (e) {
            setAuthError("Server noto'g'ri javob qaytardi (HTML). Server xatosi yoki manzil xato.");
            setDebugInfo(`Status: ${res.status}. Javob xatosi: HTML qaytdi.`);
            console.error("Auth JSON parse error. Response was:", textResponse.substring(0, 100));
          }
        } else if (res.status === 503) {
          setDbError(true);
        } else {
          const textResponse = await res.text();
          let errData;
          try {
            errData = JSON.parse(textResponse);
          } catch(e) {
            errData = { error: `Serverdan xato javob (${res.status}): ${textResponse.substring(0, 50)}` };
          }
          setAuthError(errData.error || "Server xatosi (Autentifikatsiya muvaffaqiyatsiz)");
          console.error("Auth failed:", errData);
        }
      } catch (err) {
        console.error("Auth process error", err);
        setAuthError("Internet yoki server bilan ulanishda xatolik.");
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
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, previewMode, dbError, authError, debugInfo, togglePreviewMode, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
