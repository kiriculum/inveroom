"use client";
import { createContext, useContext } from "react";
import { getClientAPI } from "service/api";
import type { Device, Location, Room } from "types";
import { ClientContextType, LayoutProps, Method } from "types";
import { useAuth } from "./auth";

const PrivateContext = createContext<ClientContextType | null>(null);

export function PrivateProvider({ children }: LayoutProps) {
  const { headers, logout } = useAuth();

  const useClientAPI = <IN extends Record<string, any> | void, OUT, OPT = void>(
    path: string,
    method: Method = "GET"
  ) => getClientAPI<IN, OUT, OPT>(path, method, logout, headers);

  const useViewSet = <T extends Record<string, any>>(path: string) => {
    return {
      list: useClientAPI<void, T[]>(path),
      create: useClientAPI<Omit<T, "id">, T>(path, "POST"),
      retrieve: useClientAPI<void, T>(path),
      update: useClientAPI<Omit<T, "id">, T>(path, "PUT"),
      patch: useClientAPI<Omit<Partial<T>, "id">, T>(path, "PATCH"),
      delete: useClientAPI<void, void>(path, "DELETE"),
    };
  };

  const location = useViewSet<Location>("locations/");
  const room = useViewSet<Room>("rooms/");
  const device = useViewSet<Device>("devices/");

  return (
    <PrivateContext.Provider value={{ location, room, device }}>
      {children}
    </PrivateContext.Provider>
  );
}

export function useClient() {
  return useContext(PrivateContext) as ClientContextType;
}
