import { Route, Routes } from "react-router-dom";
import Banner from "./components/Banner";
import Home from "./pages/Home";
import Poll from "./pages/Poll";
import About from "./pages/About";

export default function App() {
  return (
    <>
      <Banner />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/p/:id" element={<Poll />} />
          <Route path="/acerca" element={<About />} />
        </Routes>
      </main>
    </>
  );
}
