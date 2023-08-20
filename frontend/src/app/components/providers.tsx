"use client";

import { PrimeReactProvider } from "primereact/api";
import { LayoutProps } from "types";
import { AuthProvider, Restricted } from "./auth";
import { PrivateProvider } from "./private";

export function Providers({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <Restricted>
        <PrivateProvider>
          <PrimeReactProvider>{children}</PrimeReactProvider>
        </PrivateProvider>
      </Restricted>
    </AuthProvider>
  );
}
