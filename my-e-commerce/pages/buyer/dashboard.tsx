import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  discount: number;
}

const BuyerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/prisma/productss'); // Ensure this is correct
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      }
    };

    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get('/api/prisma/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data.map((item: { productId: number }) => item.productId));
      } catch (err) {
        setError('Failed to fetch cart items');
        console.error(err);
      }
    };

    fetchProducts();
    fetchCart();
  }, [router]);

  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await axios.post('/api/prisma/carts', { productId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(prevCart => [...prevCart, productId]);
    } catch (err) {
      setError('Failed to add to cart');
      console.error(err);
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await axios.delete(`/api/prisma/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(prevCart => prevCart.filter(id => id !== productId));
    } catch (err) {
      setError('Failed to remove from cart');
      console.error(err);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-stone-950">Buyer Dashboard</h1>
        {error && <div className="p-4 bg-red-200 text-red-700 rounded">{error}</div>}
        <input
          type="text"
          placeholder="Search by name or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 mt-4 w-full text-black"
        />
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-stone-950">Products</h2>
          <ul>
            {filteredProducts.map((product) => (
              <li key={product.id} className="border p-4 mb-2">
                <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                <p className="text-black">Category: {product.category}</p>
                <p className="text-black">Description: {product.description}</p>
                <p className="text-black">Price: ${product.price}</p>
                <p className="text-black">Discount: {product.discount}%</p>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 mr-2 ${cart.includes(product.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={cart.includes(product.id)}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemoveFromCart(product.id)}
                  className={`bg-red-500 text-white px-4 py-2 rounded mt-2 ${!cart.includes(product.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!cart.includes(product.id)}
                >
                  Remove from Cart
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;
