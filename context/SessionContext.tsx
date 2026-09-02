'use client';

import { createContext, useContext } from 'react';

export interface ClientSession {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

const SessionContext = createContext<ClientSession | null>(null);

export function SessionProvider({ session, children }: { session: ClientSession | null; children: React.ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useClientSession(): ClientSession | null {
  return useContext(SessionContext);
}
