import { Routes, Route } from "react-router-dom";
import HomePage    from "./pages/HomePage";
import PlayPage from "./pages/PlayPage";
import AISolvePage from "./pages/AISolvePage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<HomePage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/ai" element={<AISolvePage />} />
      <Route path="/compare" element={<ComparePage />} />
    </Routes>
  );
}