"use client";

import { addLocale } from "primereact/api";
import locale from "ru.json";
import { Table } from "./components/table";
import { ConfirmDialog } from "primereact/confirmdialog";

export default function Home() {
  addLocale("ru", locale.ru);

  return (
    <div className="h-screen grid p-2 grid-rows-[auto_1fr] gap-2">
      <ConfirmDialog />
      <Table />
    </div>
  );
}
