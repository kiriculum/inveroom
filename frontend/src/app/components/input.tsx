import { confirmDialog } from "primereact/confirmdialog";
import { useClickOutside, useEventListener } from "primereact/hooks";
import { InputText } from "primereact/inputtext";
import { MouseEventHandler, useEffect, useRef, useState } from "react";

export function TreeInput({
  text,
  onSubmit,
  onCancel,
}: {
  text?: string;
  onSubmit: (text?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(text);
  const ref = useRef<HTMLInputElement | null>(null);

  useClickOutside(ref, () => onSubmit(value));

  const [bindKeyDown, unbindKeyDown] = useEventListener({
    type: "keydown",
    listener: async (e: KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
          await onSubmit(value);
          return;
        case "Escape":
          onCancel();
          return;
      }
    },
  });

  useEffect(() => {
    ref.current?.focus();
    bindKeyDown();

    return () => {
      unbindKeyDown();
    };
  }, [bindKeyDown, unbindKeyDown]);

  return (
    <InputText
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    ></InputText>
  );
}

export const NodeEditBtn = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => (
  <button
    className={`pi pi-pencil + ${className || ""}`}
    onClick={onClick}
  ></button>
);

export const NodeDeleteBtn = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => {
  const confirm: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    confirmDialog({
      message: "Действительно удалить?",
      header: "Требуется подтверждение",
      icon: "pi pi-exclamation-triangle",
      accept: onClick,
      acceptLabel: "Да",
      rejectLabel: "Нет",
    });
  };
  return (
    <>
      <button
        className={`pi pi-trash + ${className || ""}`}
        onClick={confirm}
      ></button>
    </>
  );
};
