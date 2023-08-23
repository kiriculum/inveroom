"use client";

import { MenuItem } from "primereact/menuitem";
import { Sidebar } from "primereact/sidebar";
import { SpeedDial } from "primereact/speeddial";
import {
  Tree,
  TreeDragDropEvent,
  TreeExpandedKeysType,
  TreeNodeDoubleClickEvent,
  TreeNodeTemplateOptions,
} from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { classNames } from "primereact/utils";
import { useState } from "react";
import useSWRImmutabled from "swr/immutable";
import { Device, Location, Room, ViewSet } from "types";
import { useAuth } from "./auth";
import { NodeDeleteBtn, NodeEditBtn, TreeInput } from "./input";
import { useClient } from "./private";
import { SidebarDeviceContent } from "./sidebar";
import "./table.css";

function createNode(
  value: Location | Device | Room,
  icon: string,
  prefix: string
) {
  return {
    id: String(value.id),
    data: value,
    label: value.name,
    icon,
    key: `${prefix}#${value.id}`,
    children: [],
  };
}

function createLocationNode(value: Location) {
  return createNode(value, "pi pi-building", "location");
}

function createRoomNode(value: Room) {
  return createNode(value, "pi pi pi-mobile", "room");
}

function createDeviceNode(value: Device) {
  return createNode(value, "pi pi pi-desktop", "device");
}

async function populate(
  viewset: ViewSet<Location> | ViewSet<Room> | ViewSet<Device>,
  factory: (value: any) => TreeNode
) {
  const list = await viewset.list();
  const map: TreeNode[] = [];

  list.forEach((value) => {
    map[value.id] = factory(value);
  });
  return map;
}

export function Table() {
  const [_, setRerender] = useState({});
  const [sidebarNode, setSidebar] = useState<TreeNode | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({});
  const [edit, setEdit] = useState<string | number | undefined>(undefined);
  const { location, room, device } = useClient();
  const { logout } = useAuth();

  const { data, isLoading, error, mutate } = useSWRImmutabled(
    "initData",
    async () => {
      const loc_map = await populate(location, createLocationNode);

      loc_map.forEach((value) =>
        loc_map[value.data?.up_loc]?.children?.push(value)
      );

      const room_map = await populate(room, createRoomNode);
      room_map.forEach((value) =>
        loc_map[value.data?.location]?.children?.push(value)
      );

      const device_map = await populate(device, createDeviceNode);
      device_map.forEach((value) =>
        room_map[value.data.room]?.children?.push(value)
      );

      return loc_map.filter((value) => value.data.up_loc === null);
    }
  );

  const getViewSet = (node: TreeNode) => {
    switch (getNodeType(node)) {
      case "location":
        return location;
      case "room":
        return room;
      case "device":
        return device;
    }
  };

  const newTopLocation = async () => {
    const res = await location.create({
      address: "",
      name: "",
      up_loc: null,
    });
    const newNode = createLocationNode(res);
    data?.push(newNode);
    setEdit(newNode.key);
  };

  const newLocation = (node?: TreeNode): MenuItem => {
    return {
      label: "Location",
      icon: "pi pi-building",
      command: async () => {
        const res = await location.create({
          address: "",
          name: "",
          up_loc: node?.data?.id || null,
        });
        const newNode = createLocationNode(res);
        node?.children?.push(newNode);
        if (node?.key) expandedKeys[node.key] = true;
        setExpandedKeys(expandedKeys);
        setEdit(newNode.key);
      },
    };
  };

  const newRoom = (node: TreeNode): MenuItem => {
    return {
      label: "Room",
      icon: "pi pi-mobile",
      command: async () => {
        const res = await room.create({ name: "", location: node.data.id });
        const newNode = createRoomNode(res);
        node?.children?.push(newNode);
        if (node.key) expandedKeys[node.key] = true;
        setExpandedKeys(expandedKeys);
        setEdit(newNode.key);
      },
    };
  };

  const newDevice = (node: TreeNode): MenuItem => {
    return {
      label: "Device",
      icon: "pi pi-desktop",

      command: async () => {
        const res = await device.create({
          name: "",
          room: node.data.id,
          sn: "",
          inv: "",
          expendables: [],
        });
        const newNode = createDeviceNode(res);
        node?.children?.push(newNode);
        if (node.key) expandedKeys[node.key] = true;
        setExpandedKeys(expandedKeys);
        setEdit(newNode.key);
      },
    };
  };

  function findParent(node: TreeNode) {
    if (!data) return;
    if (data.includes(node)) return data;
    const queue: TreeNode[] = [...data];

    for (const parent of queue) {
      if (!parent.children) continue;
      if (parent.children.includes(node)) return parent.children;
      queue.push(...parent.children);
    }
  }

  const getNodeType = (node: TreeNode): string | undefined => {
    const types = ["location", "room", "device"];
    const key = node.key?.toString();
    return key && types.find((value) => key.startsWith(value));
  };

  const getModels = (node: TreeNode) => {
    const type = getNodeType(node);
    if (type === "location") return [newLocation(node), newRoom(node)];
    else if (type === "room") return [newDevice(node)];
  };

  const onDelete = (node: TreeNode) => {
    return async () => {
      if (!data) return;
      const viewSet = getViewSet(node);
      await viewSet?.delete(undefined, node.data.id);

      const parent = findParent(node);
      if (!parent) {
        console.error("Parent not found");
        return;
      }
      const index = parent.indexOf(node);
      if (index === -1) {
        console.error("Index not found");
        return;
      }
      parent.splice(index, 1);
      setRerender({});
    };
  };

  const nodeTemplate = (node: TreeNode, options: TreeNodeTemplateOptions) => {
    const model: MenuItem[] | undefined = getModels(node);
    const labelLeaf = (
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] content-end items-center">
        <div>
          <div className="inline">{node.label}</div>
          <NodeEditBtn
            className="ms-2"
            onClick={() => setEdit(node.key)}
          ></NodeEditBtn>
          <NodeDeleteBtn
            className="ms-2"
            onClick={onDelete(node)}
          ></NodeDeleteBtn>
        </div>
        <div className="hidden lg:block md:min-w-[11rem] self-center">
          {node.data.sn && `SN: ${node.data.sn}`}
        </div>
        <div className="hidden lg:block md:min-w-[11rem] self-center">
          {node.data.inv && `INV: ${node.data.inv}`}
        </div>
      </div>
    );

    const labelRoot = (
      <div className="grid grid-flow-col items-center justify-between font-bold">
        <div className="grid grid-flow-col items-center justify-start gap-2">
          <div>{node.label}</div>
          <NodeEditBtn onClick={() => setEdit(node.key)}></NodeEditBtn>
          <NodeDeleteBtn onClick={onDelete(node)}></NodeDeleteBtn>
          {model && <SpeedDial model={model} direction="right" />}
        </div>
        <div className="hidden lg:block">
          {getNodeType(node) === "location" && <div>{node.data.address}</div>}
        </div>
      </div>
    );

    const labelEdit = (
      <TreeInput
        text={node.label}
        onSubmit={async (text: string = "") => {
          const viewSet = getViewSet(node);
          if (viewSet) {
            await viewSet.patch({ name: text }, node.data.id);
            node.label = text;
          }
          setEdit(undefined);
        }}
        onCancel={() => {
          setEdit(undefined);
        }}
      ></TreeInput>
    );

    return (
      <div className={classNames(options.className, "min-w-[30rem] flex-grow")}>
        {node.key === edit
          ? labelEdit
          : getNodeType(node) === "device"
          ? labelLeaf
          : labelRoot}
      </div>
    );
  };

  const onDragDrop = async (e: TreeDragDropEvent) => {
    if (!data) return;
    const dragNode = e.dragNode as TreeNode;
    const dropNode = e.dropNode as TreeNode;

    const dragKey = dragNode.key?.toString();

    if (!dropNode) {
      if (dragKey?.startsWith("location#")) {
        await location.patch({ up_loc: null }, dragNode.data.id);
        dragNode.data.up_loc = null;
        mutate(e.value, { revalidate: false });
      }
      return;
    }

    const dropKey = dropNode.key?.toString();

    if (dragKey?.startsWith("device#") && dropKey?.startsWith("room#")) {
      await device.patch({ room: dropNode.data.id }, dragNode.data.id);
      dragNode.data.room = dragNode.data.id;
    } else if (
      dragKey?.startsWith("room#") &&
      dropKey?.startsWith("location#")
    ) {
      await room.patch({ location: dropNode.data.id }, dragNode.data.id);
      dragNode.data.location = dragNode.data.id;
    } else if (
      dragKey?.startsWith("location#") &&
      dropKey?.startsWith("location#")
    ) {
      await location.patch({ up_loc: dropNode.data.id }, dragNode.data.id);
      dragNode.data.up_loc = dragNode.data.id;
    } else return;
    await mutate(e.value, { revalidate: false });
  };

  const expandAll = () => {
    if (!data) return;
    let _expandedKeys = {};

    for (let node of data) {
      expandNode(node, _expandedKeys);
    }

    setExpandedKeys(_expandedKeys);
  };

  const expandNode = (node: TreeNode, _expandedKeys: TreeExpandedKeysType) => {
    if (node.children && node.children.length) {
      if (node.key === undefined) return;
      _expandedKeys[node.key] = true;

      for (let child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };

  const onNodeDoubleClick = (e: TreeNodeDoubleClickEvent) =>
    getNodeType(e.node) === "device" && setSidebar(e.node);

  if (error) return <div>Error</div>;

  return (
    <>
      <div className="grid justify-center">
        <div className="grid grid-flow-col gap-3">
          <button className="btn" onClick={() => expandAll()}>
            Развернуть
          </button>
          <button className="btn" onClick={() => setExpandedKeys({})}>
            Свернуть
          </button>
          <button className="btn" onClick={newTopLocation}>
            Добавить место
          </button>
          <button className="btn" onClick={logout}>
            Выйти
          </button>
        </div>
      </div>
      <Tree
        filter
        className="dark:bg-slate-800 dark:text-slate-100 overflow-auto w-"
        value={data}
        loading={isLoading}
        filterBy="label,data.sn,data.inv"
        nodeTemplate={nodeTemplate}
        dragdropScope="schools"
        onDragDrop={onDragDrop}
        expandedKeys={expandedKeys}
        onToggle={(e) => setExpandedKeys(e.value)}
        onNodeDoubleClick={onNodeDoubleClick}
      ></Tree>
      <Sidebar
        visible={Boolean(sidebarNode)}
        onHide={async () => {
          if (sidebarNode?.data) {
            await device.patch(
              {
                name: sidebarNode.data.name,
                inv: sidebarNode.data.inv,
                sn: sidebarNode.data.sn,
                expendables: sidebarNode.data.expendables,
              },
              sidebarNode.data.id
            );
          }
          setSidebar(null);
        }}
        position="right"
      >
        <SidebarDeviceContent node={sidebarNode}></SidebarDeviceContent>
      </Sidebar>
    </>
  );
}
