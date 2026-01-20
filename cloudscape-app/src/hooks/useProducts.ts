import { useAppStore } from '../context/AppContext';

/**
 * Custom hook for product operations
 * Provides easy access to product CRUD operations
 */
export const useProducts = () => {
  const products = useAppStore((state) => state.products);
  const addProduct = useAppStore((state) => state.addProduct);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
