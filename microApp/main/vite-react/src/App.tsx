import Home from './Home';
import MicroAppList from './MicroAppList';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/micro-app-list" element={<MicroAppList />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
