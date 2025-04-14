'use client';
import { useState, useEffect } from 'react';
import { getProducts } from '@/services/products/productService';
import { getCategories } from '@/services/categories/categoryService';
import { showErrorAlert } from '@/utils/swalConfig';
import { useSession } from 'next-auth/react';

export default function ProductSelectionStep({ onAddProduct, onUpdateTotal }) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);


  useEffect(() => {
    const loadCategories = async () => {
      const response = await getCategories(session?.user.accessToken);
      if (response.success) {
        setCategories(response.categories);
      } else {
        showErrorAlert(session?.user.theme,response.message);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (selectedCategory) {
        const response = await getProducts(selectedCategory,"active",session.user.accessToken);
        console.log(response.products);
        if (response.success) {
          setProducts(response.products);
        } else {
          showErrorAlert(session?.user.theme,response.message);
        }
      }
    };
    loadProducts();
  }, [selectedCategory]);

      // Fix the product selection handler
      const handleAdd = () => {
        if (!selectedProduct || quantity < 1) return;
        
        // Convert selectedProduct to number for comparison
        const productId = Number(selectedProduct);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
          showErrorAlert(session.user.theme, "Le produit sélectionné n'est pas trouvé");
          return;
        }

        if (quantity > product.stock_quantity) {
          showErrorAlert(session.user.theme, 'La quantité dépasse le stock disponible');
          return;
        }

        onAddProduct({
          ...product,
          quantity,
          totalCost: product.current_cost_price * quantity,
          totalPrice: product.selling_price * quantity
        });
        
        setQuantity(1);
        setSelectedProduct(null);
      };


      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
        <select
          className="select select-bordered"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <select
          className="select select-bordered"
          value={selectedProduct || ''}
          onChange={(e) => setSelectedProduct(Number(e.target.value))} // Convert to number
          disabled={!selectedCategory}
        >
          <option value="">Sélectionner un produit</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} (Stock: {product.stock_quantity})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="number"
          className="input input-bordered"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, e.target.value))}
          min="1"
        />
        <button className="btn btn-primary" onClick={handleAdd}>
        Ajouter un produit
        </button>
      </div>
    </div>
  );
}