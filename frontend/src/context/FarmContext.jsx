import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [loadingFarms, setLoadingFarms] = useState(false);

  const fetchFarms = async () => {
    if (!isAuthenticated) return;
    setLoadingFarms(true);
    try {
      const res = await api.get('/farms/');
      setFarms(res.data);
      if (res.data.length > 0) {
        // If current selection is invalid or null, select first farm
        setSelectedFarmId(prev => {
          if (prev && res.data.some(f => f.id === prev)) return prev;
          return res.data[0].id;
        });
      } else {
        setSelectedFarmId(null);
      }
    } catch (err) {
      console.error("Error fetching farms:", err);
    } finally {
      setLoadingFarms(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFarms();
    } else {
      setFarms([]);
      setSelectedFarmId(null);
    }
  }, [isAuthenticated]);

  const selectedFarm = farms.find(f => f.id === selectedFarmId) || null;

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarmId,
        setSelectedFarmId,
        selectedFarm,
        loadingFarms,
        refreshFarms: fetchFarms,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarms = () => useContext(FarmContext);
