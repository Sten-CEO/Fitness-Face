import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  firstName: string;
  setFirstName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [firstName, setFirstName] = useState('');

  return (
    <UserContext.Provider value={{ firstName, setFirstName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
