/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, ChefHat, LayoutDashboard, Sparkles, Award, ShoppingCart, Cpu 
} from 'lucide-react';

import { Product, CartItem, Order, LoyaltyMember, OrderStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_LOYALTY } from './data';

// Component imports
import TotemView from './components/TotemView';
import BaristaView from './components/BaristaView';
import AdminView from './components/AdminView';

export default function App() {
  // Global Active Role: 'totem' | 'barista' | 'admin'
  const [role, setRole] = useState<'totem' | 'barista' | 'admin'>('totem');

  // Products state (synchronized with localStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('cafe_products');
    return local ? JSON.parse(local) : INITIAL_PRODUCTS;
  });

  // Orders state (synchronized with localStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('cafe_orders');
    return local ? JSON.parse(local) : [];
  });

  // Loyalty members state (synchronized with localStorage)
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>(() => {
    const local = localStorage.getItem('cafe_loyalty');
    return local ? JSON.parse(local) : INITIAL_LOYALTY;
  });

  // Cart state specific to Totem session
  const [cart, setCart] = useState<CartItem[]>([]);

  // Effect to persist products changed in Admin
  useEffect(() => {
    localStorage.setItem('cafe_products', JSON.stringify(products));
  }, [products]);

  // Effect to persist orders generated in Totem / handled by Barista
  useEffect(() => {
    localStorage.setItem('cafe_orders', JSON.stringify(orders));
  }, [orders]);

  // Effect to persist loyalty points / registrations
  useEffect(() => {
    localStorage.setItem('cafe_loyalty', JSON.stringify(loyaltyMembers));
  }, [loyaltyMembers]);

  // real-time synchronization between separate tabs/windows using Storage API!
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'cafe_orders') {
          setOrders(e.newValue ? JSON.parse(e.newValue) : []);
        } else if (e.key === 'cafe_products') {
          setProducts(e.newValue ? JSON.parse(e.newValue) : INITIAL_PRODUCTS);
        } else if (e.key === 'cafe_loyalty') {
          setLoyaltyMembers(e.newValue ? JSON.parse(e.newValue) : INITIAL_LOYALTY);
        }
      } catch (err) {
        console.error("Storage sync failed", err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Shared state handlers
  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [...prev, newOrder]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => 
      prev.map(ord => ord.id === orderId ? { ...ord, status } : ord)
    );
  };

  const handleRegisterLoyalty = (member: LoyaltyMember) => {
    setLoyaltyMembers(prev => {
      // If already exists, update (e.g. adding points)
      const exists = prev.some(m => m.rut.toLowerCase() === member.rut.toLowerCase());
      if (exists) {
        return prev.map(m => m.rut.toLowerCase() === member.rut.toLowerCase() ? member : m);
      }
      return [...prev, member];
    });
  };

  const handleClearOrders = () => {
    if (confirm("¿Estás seguro de reiniciar el historial financiero? Esto limpiará los marcadores de ventas del día.")) {
      setOrders([]);
    }
  };

  // Computations for active badge indicators in role bar
  const activeKitchenCount = orders.filter(o => o.status === 'Preparando').length;
  const readyCollectionCount = orders.filter(o => o.status === 'Listo').length;

  return (
    <div className="min-h-screen bg-crema-light flex flex-col text-cafe-dark antialiased">
      {/* GLOBAL HEADER BAR */}
      <header className="bg-gradient-to-r from-cafe-dark to-cafe-medium text-white shadow-xl z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setRole('totem')}>
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20 hover:scale-105 transition-transform duration-300">
              <span className="text-3xl">☕</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Café Conexión</h1>
              <span className="text-[10px] text-gold-light tracking-widest font-mono font-medium block">SISTEMA DIGITAL INTEGRADO</span>
            </div>
          </div>

          {/* SIMULATED ROLE SELECTOR - TO WORK AS THE SPECIFIED 3 NAVEGABLE INTERFACES */}
          <nav className="flex items-center bg-black/25 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => setRole('totem')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-200 ${
                role === 'totem'
                  ? 'bg-gold text-cafe-dark shadow-md font-bold'
                  : 'text-crema-dark hover:text-white hover:bg-white/5'
              }`}
              style={{ minHeight: '44px' }}
            >
              <Store className="w-4 h-4" />
              <span>Tótem Autoservicio</span>
            </button>

            <button
              onClick={() => setRole('barista')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 relative transition duration-200 ${
                role === 'barista'
                  ? 'bg-oliva text-white shadow-md font-bold'
                  : 'text-crema-dark hover:text-white hover:bg-white/5'
              }`}
              style={{ minHeight: '44px' }}
            >
              <ChefHat className="w-4 h-4" />
              <span>Cocinero / Barista</span>
              {activeKitchenCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono tracking-tight animate-pulse border-2 border-cafe-medium">
                  {activeKitchenCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setRole('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-200 ${
                role === 'admin'
                  ? 'bg-cafe-light text-white shadow-md font-bold'
                  : 'text-crema-dark hover:text-white hover:bg-white/5'
              }`}
              style={{ minHeight: '44px' }}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Panel de Control</span>
            </button>
          </nav>
        </div>
      </header>

      {/* QUICK SYSTEM GUIDE */}
      <div className="bg-amber-500/10 border-b border-amber-500/10 py-1.5 text-center text-xxs font-mono text-cafe-medium/90 px-4">
        💡 <strong className="text-cafe-dark">Pista de Revisión UX:</strong> Puedes abrir este sitio en múltiples pestañas del navegador. Al hacer un pedido en la vista de <strong className="text-oliva-dark">Tótem</strong>, este aparecerá inmediatamente en la vista de <strong className="text-oliva-dark">Barista</strong> o sumará en las métricas de <strong className="text-oliva-dark">Administración</strong> sin necesidad de refrescar la página.
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {role === 'totem' && (
            <motion.section
              key="totem"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Totem View Component */}
              <TotemView
                products={products}
                cart={cart}
                setCart={setCart}
                onPlaceOrder={handlePlaceOrder}
                loyaltyMembers={loyaltyMembers}
                onRegisterLoyalty={handleRegisterLoyalty}
              />
            </motion.section>
          )}

          {role === 'barista' && (
            <motion.section
              key="barista"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {/* Barista View Component */}
              <BaristaView
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            </motion.section>
          )}

          {role === 'admin' && (
            <motion.section
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {/* Admin Panel Component */}
              <AdminView
                products={products}
                setProducts={setProducts}
                orders={orders}
                onClearOrders={handleClearOrders}
                loyaltyMembers={loyaltyMembers}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-crema-dark/30 border-t border-crema-dark py-4 text-center text-xs text-cafe-light">
        <p>© 2026 Café Conexión SpA. Desarrollado de acuerdo al estándar de experiencia de usuario (IEEE 830 / Heurísticas UX).</p>
      </footer>
    </div>
  );
}
