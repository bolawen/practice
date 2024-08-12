import Home from './Home';
import MicroAppList from './MicroAppList';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/micro-app-list/*" element={<MicroAppList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
