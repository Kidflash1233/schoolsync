import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { MOCK_ROLE_CODES } from '../constants';
import { fetchUserById, setUserPassword } from '../services/apiService'; // Mock API service

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  loginWithCodeAndPassword: (code: string, passwordInput: string) => Promise<boolean>;
  startPasswordSetupFlow: (code: string) => Promise<{ success: boolean; userId?: string; error?: string }>;
  completePasswordSetupAndLogin: (userId: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentUserData: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('loggedInUserId');
    if (storedUserId) {
      setIsLoading(true); 
      fetchUserById(storedUserId).then(user => {
        if (user) {
          setCurrentUser(user);
        } else {
          localStorage.removeItem('loggedInUserId');
        }
        setIsLoading(false);
      }).catch(() => {
        localStorage.removeItem('loggedInUserId'); 
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const startPasswordSetupFlow = async (code: string): Promise<{ success: boolean; userId?: string; error?: string }> => {
    setIsLoading(true);
    const roleCodeDetails = MOCK_ROLE_CODES[code.toUpperCase()];

    if (!roleCodeDetails) {
      setIsLoading(false);
      return { success: false, error: "Invalid invitation code." };
    }

    try {
      const user = await fetchUserById(roleCodeDetails.userId);
      if (!user || user.role !== roleCodeDetails.role) {
        setIsLoading(false);
        return { success: false, error: "Invalid invitation code or user data mismatch." };
      }

      if (user.hasSetPassword) {
        setIsLoading(false);
        return { success: false, error: "You've already set a password. Please uncheck the 'first time' box and enter your password." };
      }
      
      setIsLoading(false);
      return { success: true, userId: user.id };

    } catch (error) {
      console.error("Password setup start error:", error);
      setIsLoading(false);
      return { success: false, error: "An error occurred. Please try again." };
    }
  };

  const completePasswordSetupAndLogin = async (userId: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updatedUserWithPassword = await setUserPassword(userId, newPassword);
      if (!updatedUserWithPassword) {
        setIsLoading(false);
        return false; // Failed to set password
      }

      // Password set, now log in
      setCurrentUser(updatedUserWithPassword);
      localStorage.setItem('loggedInUserId', updatedUserWithPassword.id);
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error("Password setup completion error:", error);
      setIsLoading(false);
      return false;
    }
  };


  const loginWithCodeAndPassword = async (code: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    const roleCodeDetails = MOCK_ROLE_CODES[code.toUpperCase()];

    if (!roleCodeDetails) {
      setCurrentUser(null);
      localStorage.removeItem('loggedInUserId');
      setIsLoading(false);
      return false; 
    }

    try {
      let user = await fetchUserById(roleCodeDetails.userId);

      if (!user || user.role !== roleCodeDetails.role) {
        setCurrentUser(null);
        localStorage.removeItem('loggedInUserId');
        setIsLoading(false);
        return false; 
      }

      if (!user.hasSetPassword) {
        const updatedUser = await setUserPassword(user.id, passwordInput);
        if (updatedUser) {
          user = updatedUser; 
        } else {
          setIsLoading(false);
          return false; 
        }
      } else {
        if (user.password !== passwordInput) {
          setCurrentUser(null);
          localStorage.removeItem('loggedInUserId');
          setIsLoading(false);
          return false; 
        }
      }
      
      setCurrentUser(user);
      localStorage.setItem('loggedInUserId', user.id);
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error("Login error:", error);
      setCurrentUser(null);
      localStorage.removeItem('loggedInUserId');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('loggedInUserId');
    setIsLoading(false);
  };

  const updateCurrentUserData = (updatedUser: User) => {
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, loginWithCodeAndPassword, startPasswordSetupFlow, completePasswordSetupAndLogin, logout, updateCurrentUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
