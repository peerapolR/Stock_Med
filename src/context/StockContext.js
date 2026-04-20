"use client";
import { createContext, useContext, useState } from "react";

const StockContext = createContext();

export function StockProvider({ children }) {
  const [scanCart, setScanCart] = useState([]); // เก็บรายการที่สแกนรอตัดสต๊อก

  const addToCart = (product) => {
    setScanCart((prev) => [...prev, product]);
  };

  const clearCart = () => setScanCart([]);

  return (
    <StockContext.Provider value={{ scanCart, addToCart, clearCart }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStockContext() {
  return useContext(StockContext);
}
