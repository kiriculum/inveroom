"use client";

import { Form, FormButton, FormInput } from "components/form";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AuthAPI } from "service/api";
import type { GeneralForm } from "types";
import { useAuth } from "./auth";

export function Login() {
  const { auth } = useAuth();

  return (
    <div className="grid h-full content-center justify-center">
      <div className="sm:w-96 ">
        <LoginForm auth={auth}></LoginForm>
      </div>
    </div>
  );
}

// Move Form as a separate component for less rerendering
function LoginForm({ auth }: GeneralForm) {
  const [cred, setCred] = useState({ username: "", password: "" }),
    [error, setError] = useState(""),
    disabled = !(cred.username && cred.password),
    usernameField = useRef<HTMLInputElement>(null),
    passField = useRef<HTMLInputElement>(null);

  // This shit is a workaround to browsers' initial autofill inconsistency
  // It polls email and pass fields for 5 secs
  useEffect(() => {
    const interval = setInterval(() => {
      if (usernameField.current) {
        const email = usernameField.current.value;
        setCred((s) => {
          return { ...s, username: email };
        });
        clearInterval(interval);
      }
      if (passField.current) {
        const password = passField.current.value;
        setCred((s) => {
          return { ...s, password };
        });
        clearInterval(interval);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [setCred]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;

    const res = await AuthAPI.login(cred);
    if (!res) return setError("системная ошибка");
    const { data, status } = res;

    if (status == 200) {
      if (data?.access && data.refresh) auth(data);
      else {
        console.log("Received invalid JWT token:", data);
        setError("системная ошибка");
      }
    } else if (res.status === 401) setError("неверный логин и/или пароль");
    else {
      console.log("Unrecognized response error, code", status, "data:", data);
      setError("системная ошибка");
    }
  }

  return (
    <Form title={""} onSubmit={handleSubmit}>
      <FormInput
        type="text"
        label={"Логин"}
        placeholder={""}
        onChange={(e) => {
          setCred({ ...cred, username: e.currentTarget.value });
        }}
        inputRef={usernameField}
      ></FormInput>
      <FormInput
        type="password"
        label={"Пароль"}
        placeholder={""}
        onChange={(e) => {
          setCred({ ...cred, password: e.currentTarget.value });
        }}
        inputRef={passField}
      ></FormInput>
      <FormButton label={"OK"} disabled={disabled}></FormButton>
      {error && <div className={"mb-1 mt-2 text-red-500"}>{error}</div>}
    </Form>
  );
}
