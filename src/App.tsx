
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PostListing from './pages/PostListing';
import Contact from './pages/Contact';

import ListingDetails from './pages/ListingDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="listings" element={<Listings />} />
          <Route path="listings/:id" element={<ListingDetails />} />
          <Route path="post" element={<PostListing />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
