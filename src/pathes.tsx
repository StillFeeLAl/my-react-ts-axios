import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App'; 
import FilmDetails from './FilmDetails';

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/film" element={<FilmDetails />} />
      </Routes>
    </Router>
  );
}

export default Main;