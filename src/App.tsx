import { Routes, Route } from "react-router-dom";
import PlayPage from "./pages/PlayPage";
import AISolvePage from "./pages/AISolvePage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PlayPage />} />
      <Route path="/ai" element={<AISolvePage />} />
      <Route path="/compare" element={<ComparePage />} />
    </Routes>
  );
}