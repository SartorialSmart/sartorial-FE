import React, { createContext, useContext, useState, useCallback } from "react";

const ClientContext = createContext();

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return context;
};

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Use useCallback to memoize the functions
  const refreshClients = useCallback(() => {
    setNeedsRefresh(true);
  }, []);

  const clearRefreshFlag = useCallback(() => {
    setNeedsRefresh(false);
  }, []);

  return (
    <ClientContext.Provider
      value={{
        clients,
        setClients,
        needsRefresh,
        refreshClients,
        clearRefreshFlag,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
