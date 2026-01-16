import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useAuthInit } from "./hooks/useAuthInit";
import "./App.css";

function App() {
  useAuthInit();
  return <RouterProvider router={router} />;
}

export default App;
