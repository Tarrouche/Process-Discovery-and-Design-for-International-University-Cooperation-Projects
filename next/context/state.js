import { createContext, useContext } from 'react';

const AppContext = createContext();

export function AppWrapper({ children }) {
  let sharedState = {/* whatever you want */
    value : 42
   
}
  

  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
}
export function useAppContext() {
  return useContext(AppContext);
}
