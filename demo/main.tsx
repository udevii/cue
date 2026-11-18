import { createRoot } from "react-dom/client";
import { App } from "../src/components/App";
import { createLocalApi } from "../src/lib/api";
import "../src/styles/cue.css";

// single file build, uses the browser api instead of the server
createRoot(document.getElementById("root")!).render(<App api={createLocalApi()} />);
