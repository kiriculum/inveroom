import { LayoutProps } from "types";
import { SubsProvider } from "./context";

export default function SubsLayout({ children }: LayoutProps) {
  return <SubsProvider>{children}</SubsProvider>;
}
