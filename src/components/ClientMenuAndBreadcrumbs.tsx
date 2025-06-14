"use client";
import { usePathname } from "next/navigation";
import MenuAndBreadcrumbs from "./MenuAndBreadcrumbs";

export default function ClientMenuAndBreadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <MenuAndBreadcrumbs />;
} 