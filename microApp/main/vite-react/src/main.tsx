import App from "./App.tsx";
import ReactDOM from "react-dom/client";
import microApp from "@micro-zoe/micro-app";

microApp.start({});

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
