import {
  BadRegister,
  JWT,
  Login,
  Method,
  Refresh,
  Register,
  Username,
} from "types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getAPI<IN extends Record<string, any> | void, OUT, OPT = void>(
  endpoint: string,
  method: Method,
  headers?: HeadersInit
) {
  return async (data: IN, pk: number | void) => {
    try {
      const lookup = pk ? `${pk}/` : "";
      const response = await fetch(`${API_URL}${endpoint}${lookup}`, {
        method,
        body: data ? JSON.stringify({ ...data }) : null,
        headers: headers || { "Content-type": "application/json" },
      });
      const result = response.status === 204 ? "" : await response.json();

      return { data: result, status: response.status } as {
        data: OPT extends void ? OUT : OUT | OPT;
        status: number;
      };
    } catch (err) {
      console.log("Got system or network error", err);
    }
  };
}

export function getClientAPI<
  IN extends Record<string, any> | void,
  OUT,
  OPT = void
>(
  path: string,
  method: Method,
  unAuthHandler: () => void,
  headers?: HeadersInit
) {
  const worker = getAPI<IN, OUT, OPT>(path, method, headers);

  return async (input: IN, lookup: number | void) => {
    const error = new Error();
    const res = await worker(input, lookup);
    if (!res) throw error;
    if (res.status === 401) {
      unAuthHandler();
      throw error;
    }
    if (200 <= res.status && res.status < 300) return res.data;
    console.log("Bad or unrecognized response error, code", res.status);
    throw error;
  };
}

export const AuthAPI = {
  login: getAPI<Login, JWT>("auth/jwt/create/", "POST"),
  register: getAPI<Register, Username, BadRegister>("auth/users/", "POST"),
  refresh: getAPI<Refresh, JWT>("auth/jwt/refresh/", "POST"),
};
