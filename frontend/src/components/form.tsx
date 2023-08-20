import type {
  ChangeEvent,
  FormEventHandler,
  HTMLInputTypeAttribute,
  MouseEventHandler,
  RefObject
} from "react";
import { LayoutProps } from "types";

export function FormInput({
  type,
  label,
  placeholder,
  validations,
  onChange,
  inputRef,
  autocomplete,
  required = true,
  minLength,
}: {
  type: HTMLInputTypeAttribute;
  label: string;
  placeholder?: string;
  validations?: ((e: ChangeEvent<HTMLInputElement>) => void)[];
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  inputRef?: RefObject<HTMLInputElement>;
  autocomplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  const onChangeWithVal = (e: ChangeEvent<HTMLInputElement>) => {
    const fail = validations?.find((val) => val(e));
    if (!fail) e.target.setCustomValidity("");
    e.target.reportValidity();
    if (onChange) onChange(e);
  };
  return (
    <div className="mt-3">
      <label>{label}</label>
      <input
        required={required}
        ref={inputRef}
        type={type}
        minLength={minLength}
        autoComplete={autocomplete}
        className="mt-1"
        placeholder={placeholder}
        onChange={onChangeWithVal}
      ></input>
    </div>
  );
}

export function FormButton({
  label,
  onClick,
  disabled,
  ref,
}: {
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  ref?: RefObject<HTMLButtonElement>;
}) {
  return (
    <div className="mt-5 grid justify-center">
      <button
        type="submit"
        className="btn min-w-[5rem]"
        onClick={onClick}
        disabled={disabled}
        ref={ref}
      >
        {label}
      </button>
    </div>
  );
}

export function FormFooter({ children }: LayoutProps) {
  return <div className="mt-3">{children}</div>;
}

export function Form({
  title,
  onSubmit,
  children,
}: {
  title: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
} & LayoutProps) {
  return (
    <form onSubmit={onSubmit} className="form-control">
      <h3 className="text-center">{title}</h3>
      {children}
    </form>
  );
}

export function lengthCheck(length: number, t: any) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const fail = input.value.length < length;
    if (fail) input.setCustomValidity(t("password-length-err"));
    return fail;
  };
}

export function valueCheck(value: any, t: any, field?: string) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const target = field ? value[field] : value;
    const fail = input.value !== target;
    if (fail) input.setCustomValidity(t("pass-not-equal-err"));
    return fail;
  };
}

export function linkedCheck(target: RefObject<HTMLInputElement>, t: any) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    if (!target.current) return false;
    const input = e.target;
    const fail = input.value !== target.current.value;
    if (fail) target.current.setCustomValidity(t("pass-not-equal-err"));
    else target.current.setCustomValidity("");
    target.current.checkValidity();

    return false;
  };
}
