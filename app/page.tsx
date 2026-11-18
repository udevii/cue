"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { createHttpApi } from "../src/lib/api";

// client only, since it reads window size and localStorage on first render
const App = dynamic(() => import("../src/components/App").then((m) => m.App), { ssr: false });

export default function Page() {
  const api = useMemo(() => createHttpApi(), []);
  return <App api={api} />;
}
