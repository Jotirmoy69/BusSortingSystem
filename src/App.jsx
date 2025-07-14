// src/App.jsx
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Settings from './pages/Settings.jsx';
import Automation from './pages/Automation.jsx';
import Selection from './pages/Selection.jsx';
import Morning from './pages/Morning.jsx';
import Print from './pages/Print.jsx';
import Day from './pages/Day.jsx';
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/selection" element={<Selection />} />
        <Route path="/morning" element={<Morning />} />
        <Route path="/day" element={<Day />} />

        
        <Route path="/new" element={<Print />} />

        
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
