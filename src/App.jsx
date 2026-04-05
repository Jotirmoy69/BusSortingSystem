import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home.jsx";
import Settings from "./pages/Settings.jsx";
import Automation from "./pages/Automation.jsx";
import Selection from "./pages/Selection.jsx";
import Morning from "./pages/Morning.jsx";
import Print from "./pages/Print.jsx";
import Day from "./pages/Day.jsx";
import LocomotiveScroll from "locomotive-scroll";
import College from "./pages/College.jsx";
import Manual from "./pages/Manual.jsx";
import PageTransition from "./components/PageTransition";

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/automation" element={<PageTransition><Automation /></PageTransition>} />
        <Route path="/selection" element={<PageTransition><Selection /></PageTransition>} />
        <Route path="/manual" element={<PageTransition><Manual /></PageTransition>} />
        <Route path="/morning" element={<PageTransition><Morning /></PageTransition>} />
        <Route path="/college" element={<PageTransition><College /></PageTransition>} />
        <Route path="/day" element={<PageTransition><Day /></PageTransition>} />
        <Route path="/new" element={<PageTransition><Print /></PageTransition>} />
        <Route path="*" element={<PageTransition><h1>404 Not Found</h1></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HashRouter>
      <Toaster position="top-center" />
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
