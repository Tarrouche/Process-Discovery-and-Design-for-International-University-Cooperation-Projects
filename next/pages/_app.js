import { ComponentType } from 'react'
import { AppPropsType } from 'next/dist/shared/lib/utils'
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from '../components/home/Nav';
import '../styles/globals.css'

import { createContext, useState } from 'react';

export const UserContext = createContext(null);

function App({ Component, pageProps }) {
  const [user, setUser] = useState({ email: null, name: null });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Nav />
      <Component {...pageProps} />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-kQtW33rZJAHjgefvhyyzcGF3C5TFyBQBA13V1RKPf4uH+bwyzQxZ6CmMZHmNBEfJ" crossOrigin="anonymous"></script>
    </UserContext.Provider>

  );
}

export default App;