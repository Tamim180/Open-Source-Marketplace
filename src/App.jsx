import { Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog.jsx";
import Submit from "./pages/Submit.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/submit" element={<Submit />} />
    </Routes>
  );
}
