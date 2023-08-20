import { Dispatch, SetStateAction } from "react";

export type LayoutProps = {
  children?: React.ReactNode;
};

export type LocaleParam = { params: { locale: string } };

export type IdParam = LocaleParam & { params: { id: string } };

export type JWT = {
  access: string;
  refresh: string;
};

export type DecodedJWT = {
  exp?: number;
};

export type Session = {
  jwt: JWT;
  decodedToken: DecodedJWT | null;
  isAuth: boolean;
  stale: boolean;
};

export type AuthContextType = {
  session: Session;
  setSession: Dispatch<SetStateAction<Session>>;
  auth: (jwt: JWT) => boolean | void;
  refresh: (token: string) => Promise<boolean | void>;
  logout: () => void;
  headers: { Authorization: string; Accept: string } | undefined;
};

export type GeneralForm = {
  auth: (jwt: JWT) => boolean | void;
};

export interface Username {
  username: string;
}

export interface BadRegister {
  email?: string[];
  password?: string[];
}

export interface Refresh {
  refresh: string;
}

export interface Login extends Username {
  password: string;
}

export interface Register extends Login {
  re_password: string;
}

export type Method =
  | "POST"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PUT"
  | "DELETE"
  | "PATCH";

export type SubsTask = {
  index: number;
  total: number;
  up_sub: string;
  main_sub: string;
  down_sub: string;
  definition: string;
  options: string[];
  answer: number | null;
  submitted: number | null;
};

export type ClientAPIRequest<IN extends Record<string, any> | void, OUT> = (
  input: IN
) => Promise<OUT>;

export type ClientContextType = {
  location: ViewSet<Location>;
  room: ViewSet<Room>;
  device: ViewSet<Device>;
};

export interface Named {
  id: number;
  name: string;
}

export interface Location extends Named {
  address: string;
  up_loc: number | null;
}

export interface Room extends Named {
  location: number;
}

export interface Device extends Named {
  sn: string;
  inv: string;
  room: number;
  expendables: number[];
}

export interface Component {
  id: number;
  device: number;
  sn: string;
}

export interface ComponentVarian extends Named {
  image?: string;
}

export interface Expendable extends Named {}

export interface DeviceTemplate extends Named {
  expendables: number[];
  components: number[];
}

type RestAPI<IN, OUT, LOOKUP extends number | void = void> = (
  input: IN,
  lookup: LOOKUP
) => Promise<OUT>;

export type ViewSet<T> = {
  list: RestAPI<void, T[]>;
  create: RestAPI<Omit<T, "id">, T>;
  retrieve: RestAPI<void, T, number>;
  update: RestAPI<Omit<T, "id">, T, number>;
  patch: RestAPI<Omit<Partial<T>, "id">, T, number>;
  delete: RestAPI<void, void, number>;
};
