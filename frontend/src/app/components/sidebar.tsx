"use client";

import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from "primereact/autocomplete";
import { ListBox } from "primereact/listbox";
import { TreeNode } from "primereact/treenode";
import { useState } from "react";
import useSWRImmutabled from "swr/immutable";
import { useClient } from "./private";
import "./table.css";

type NewComponent = {
  id?: number;
  name: string;
  newName?: string;
};

export function SidebarDeviceContent({ node }: { node: TreeNode | null }) {
  if (!node) return <div></div>;

  const { device, component, variant } = useClient();
  const [searchValue, setSearchValue] = useState<NewComponent | string | null>(
    null
  );
  const [searchSuggestions, setSearchSuggestions] = useState<NewComponent[]>(
    []
  );
  const [_, setRerender] = useState({});
  const { data, mutate } = useSWRImmutabled(
    ["components", node.data.id],
    async ([_, id]) => {
      const res = await device.components(undefined, id);
      res?.push({ id: 0, sn: "", device: 0, variant: { id: 0, name: "" } }); // Search field for new components
      return res;
    }
  );

  const variants = useSWRImmutabled(["variants"], async () => {
    return (await variant.list()) as NewComponent[];
  });

  const onChange = async (e: AutoCompleteChangeEvent) => {
    if (e.value === null || typeof e.value === "string")
      setSearchValue(e.value);
    else if (e.value.name) {
      const compVariant = e.value?.id
        ? { id: e.value.id, name: e.value.label }
        : await variant.create({
            name: e.value.newName,
          });
      if (!e.value.id) variants.mutate(variants.data?.push(compVariant));
      const res = await component.create({
        device: node.data.id,
        sn: "",
        variant: compVariant,
      });
      data?.push(res);
      setSearchValue(null);
      mutate(data);
    }
  };

  const onSearch = (e: AutoCompleteCompleteEvent) => {
    const res =
      variants.data?.filter((value) =>
        value.name.toLowerCase().includes(e.query.trim().toLowerCase())
      ) || [];
    res.push({ name: `Новый вариант: ${e.query}`, newName: e.query });
    setSearchSuggestions(res);
  };

  const deleteComponent = async (option: NewComponent) => {
    if (!option.id) return;
    await component.delete(undefined, option.id);
    data?.splice(
      data.findIndex((value) => value.id === option.id),
      1
    );
    mutate(data);
  };

  const componentTemplate = (option: any) => {
    if (!option?.id)
      return (
        <AutoComplete
          field="name"
          value={searchValue}
          suggestions={searchSuggestions}
          completeMethod={onSearch}
          onChange={onChange}
          placeholder="Добавить компонент"
          forceSelection
        ></AutoComplete>
      );
    return (
      <div className="px-2 pt-1 grid grid-cols-[1fr_auto] content-center">
        <div>{option?.variant?.name}</div>
        <div
          className="pi pi-times"
          onClick={() => deleteComponent(option)}
        ></div>
      </div>
    );
  };

  return (
    <div>
      <div>Название:</div>
      <input
        className="p-inputtext"
        value={node.label}
        onChange={(e) => {
          node.label = node.data.name = e.target.value;
          setRerender({});
        }}
      ></input>
      <div>SN:</div>
      <input
        className="p-inputtext"
        value={node.data.inv}
        onChange={(e) => {
          node.data.inv = e.target.value;
          setRerender({});
        }}
      ></input>
      <div>INV:</div>
      <input
        className="p-inputtext"
        value={node.data.sn}
        onChange={(e) => {
          node.data.sn = e.target.value;
          setRerender({});
        }}
      ></input>

      <div>Компоненты:</div>
      <ListBox
        options={data}
        className="p-listbox"
        itemTemplate={componentTemplate}
      ></ListBox>
    </div>
  );
}
