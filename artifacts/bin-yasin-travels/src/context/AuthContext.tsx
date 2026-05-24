import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, AuthResponse } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Restore session from localStorage
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setState({
          user: parsedUser,
          token: storedToken,
          isLoading: false,
        });
        
        // Register token getter for api client
        setAuthTokenGetter(() => localStorage.getItem("auth_token"));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setState({ user: null, token: null, isLoading: false });
      }
    } else {
      setState({ user: null, token: null, isLoading: false });
    }
  }, []);

  const login = (data: AuthResponse) => {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    setAuthTokenGetter(() => data.token);
    
    setState({
      user: data.user,
      token: data.token,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthTokenGetter(null);
    
    setState({
      user: null,
      token: null,
      isLoading: false,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem("auth_user", JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
