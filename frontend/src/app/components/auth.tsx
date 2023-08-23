"use client";

import { useRouter } from "next/navigation";
import { ReactNode, createContext, useContext, useState } from "react";
import { decodeToken } from "react-jwt";
import { AuthAPI } from "service/api";
import useSWR from "swr";
import { AuthContextType, DecodedJWT, JWT, LayoutProps, Session } from "types";
import { Login } from "./login";

const AuthContext = createContext<AuthContextType | null>(null);

const emptySession: Session = {
  jwt: { access: "", refresh: "" },
  decodedToken: null,
  isAuth: false,
  stale: true,
};

function checkToken(token: string) {
  const decodedToken = decodeToken<DecodedJWT>(token);
  if (!decodedToken?.exp) return;
  const isAuth = decodedToken.exp * 1000 - Date.now() > 0;
  return { decodedToken, isAuth };
}

function checkJWT(jwt: JWT) {
  const access = checkToken(jwt.access);
  if (access) return { ...access };
}

async function refreshJWT(token: string) {
  const res = await AuthAPI.refresh({ refresh: token });
  if (res && res.status === 200 && res.data) return res.data;
}

export function AuthProvider({ children }: LayoutProps) {
  const [session, setSession] = useState<Session>(() => {
    const item =
      typeof window === "undefined" ? null : localStorage.getItem("user");
    if (item) {
      const jwt = JSON.parse(item) as JWT;
      const res = checkJWT(jwt);
      if (res) return { ...emptySession, jwt, ...res };
    }
    return emptySession;
  });

  const logout = () => {
    localStorage.removeItem("user");
    setSession({ ...emptySession });
  };

  const auth = (jwt: JWT) => {
    localStorage.setItem("user", JSON.stringify(jwt));
    const res = checkJWT(jwt);
    if (!res || !res.isAuth) return logout();
    setSession((s) => {
      return {
        ...s,
        jwt,
        ...res,
        stale: false,
      };
    });
    return res.isAuth;
  };

  const refresh = async (token: string) => {
    const res = await refreshJWT(token);
    if (res) return auth(res);
    logout();
  };

  const headers = session.isAuth
    ? {
        Authorization: "Bearer " + session.jwt.access,
        Accept: "application/json",
        "Content-type": "application/json",
      }
    : undefined;

  return (
    <AuthContext.Provider
      value={{ session, setSession, auth, refresh, logout, headers }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const { session, setSession, auth, refresh, logout, headers } = useContext(
    AuthContext
  ) as AuthContextType;

  async function postInit([exp, ref]: [number, string]) {
    if (exp) {
      const timer = exp * 1000 - Date.now();
      if (timer < 10000) return await refresh(ref);
    }
    if (session.stale) setSession({ ...session, stale: false });
  }

  useSWR([session.decodedToken?.exp, session.jwt.refresh], postInit, {
    refreshInterval: 10000,
  });

  return {
    session,
    auth,
    headers,
    logout,
    refresh,
  };
}

export function Restricted({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    session: { isAuth, stale },
  } = useAuth();

  if (stale) return <div></div>;

  return !stale && isAuth ? <>{children}</> : <Login />;
}
