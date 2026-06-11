/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, ChefHat, LayoutDashboard, Sparkles, Award, ShoppingCart, Cpu, 
  Lock, Unlock, Key
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

  // Staff authentication states for Cocinero/Barista and Panel de Control (Separate)
  const [isBaristaAuth, setIsBaristaAuth] = useState(() => {
    return localStorage.getItem('cafe_barista_auth') === 'true';
  });
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return localStorage.getItem('cafe_admin_auth') === 'true';
  });
  const [pendingRoleToAccess, setPendingRoleToAccess] = useState<'barista' | 'admin' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRoleChangeAttempt = (targetRole: 'totem' | 'barista' | 'admin') => {
    if (targetRole === 'totem') {
      setRole('totem');
      return;
    }

    if (targetRole === 'barista' && isBaristaAuth) {
      setRole('barista');
    } else if (targetRole === 'admin' && isAdminAuth) {
      setRole('admin');
    } else {
      setPendingRoleToAccess(targetRole);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handleVerifyPassword = (e: FormEvent) => {
    e.preventDefault();
    if (pendingRoleToAccess === 'barista') {
      if (passwordInput === 'barista123') {
        setIsBaristaAuth(true);
        localStorage.setItem('cafe_barista_auth', 'true');
        setRole('barista');
        setPendingRoleToAccess(null);
        setPasswordError('');
      } else {
        setPasswordError('Contraseña incorrecta para Cocinero / Barista. Inténtalo de nuevo.');
      }
    } else if (pendingRoleToAccess === 'admin') {
      if (passwordInput === 'admin123') {
        setIsAdminAuth(true);
        localStorage.setItem('cafe_admin_auth', 'true');
        setRole('admin');
        setPendingRoleToAccess(null);
        setPasswordError('');
      } else {
        setPasswordError('Contraseña incorrecta para Panel de Control. Inténtalo de nuevo.');
      }
    }
  };

  const handleLogoutActiveRole = () => {
    if (role === 'barista') {
      setIsBaristaAuth(false);
      localStorage.removeItem('cafe_barista_auth');
    } else if (role === 'admin') {
      setIsAdminAuth(false);
      localStorage.removeItem('cafe_admin_auth');
    }
    setRole('totem');
  };

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
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2.5 cursor-pointer select-none justify-center hover:scale-102 transition-transform duration-300" onClick={() => setRole('totem')}>
            <span className="text-3xl md:text-4xl animate-[pulse_3s_infinite]">☕</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">Café Conexión</h1>
          </div>

          {/* SIMULATED ROLE SELECTOR - TO WORK AS THE SPECIFIED 3 NAVEGABLE INTERFACES */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <nav className="flex items-center bg-black/25 p-1.5 rounded-2xl border border-white/5 shadow-inner">
              <button
                onClick={() => handleRoleChangeAttempt('totem')}
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
                onClick={() => handleRoleChangeAttempt('barista')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 relative transition duration-200 ${
                  role === 'barista'
                    ? 'bg-oliva text-white shadow-md font-bold'
                    : 'text-crema-dark hover:text-white hover:bg-white/5'
                }`}
                style={{ minHeight: '44px' }}
              >
                <ChefHat className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  <span>Cocinero / Barista</span>
                  {!isBaristaAuth && <Lock className="w-3 h-3 text-white/50 shrink-0" />}
                </span>
                {activeKitchenCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono tracking-tight animate-pulse border-2 border-cafe-medium">
                    {activeKitchenCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleRoleChangeAttempt('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-200 ${
                  role === 'admin'
                    ? 'bg-cafe-light text-white shadow-md font-bold'
                    : 'text-crema-dark hover:text-white hover:bg-white/5'
                }`}
                style={{ minHeight: '44px' }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  <span>Panel de Control</span>
                  {!isAdminAuth && <Lock className="w-3 h-3 text-white/50 shrink-0" />}
                </span>
              </button>
            </nav>

            {((role === 'barista' && isBaristaAuth) || (role === 'admin' && isAdminAuth)) && (
              <button
                onClick={handleLogoutActiveRole}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-red-500/20 shadow-sm"
                style={{ minHeight: '44px' }}
                title="Cerrar sesión de personal"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

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

      {/* PASSWORD PROTECTION MODAL */}
      <AnimatePresence>
        {pendingRoleToAccess !== null && (
          <motion.div
            key="password-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-crema-dark rounded-2xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden text-cafe-dark"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Coffee and secure locks themed aesthetics */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cafe-medium via-gold to-oliva" />
              
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-cafe-medium flex items-center justify-center border border-crema-dark shadow-sm">
                  <Lock className="w-6 h-6 text-cafe-medium" />
                </div>
                
                <h3 className="font-extrabold text-cafe-dark text-lg">
                  Área Protegida
                </h3>
                <p className="text-xs text-cafe-light">
                  Estás intentando ingresar a <strong className="text-cafe-dark uppercase font-mono tracking-wider">
                    {pendingRoleToAccess === 'barista' ? 'Cocinero / Barista' : 'Panel de Control'}
                  </strong>.
                  Este apartado requiere credenciales de acceso del personal.
                </p>

                {/* DEMO PASSWORD BANNER - AS REQUESTED */}
                <div className="w-full bg-amber-50 border border-gold/30 rounded-xl p-3 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-amber-800 tracking-wider uppercase flex items-center gap-1">
                    <Key className="w-3 h-3 text-gold animate-bounce" />
                    <span>Contraseña para pruebas ({pendingRoleToAccess === 'barista' ? 'Barista' : 'Control'})</span>
                  </span>
                  <p className="text-base font-extrabold font-mono text-cafe-medium select-all bg-white px-3 py-1 rounded-lg border border-crema-dark shadow-xs tracking-wider">
                    {pendingRoleToAccess === 'barista' ? 'barista123' : 'admin123'}
                  </p>
                </div>

                <form onSubmit={handleVerifyPassword} className="w-full space-y-3 mt-2">
                  <div className="text-left space-y-1">
                    <label className="text-[11px] font-bold text-cafe-medium uppercase">Contraseña</label>
                    <input
                      type="password"
                      required
                      autoFocus
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full min-h-[44px] bg-crema-light text-cafe-dark border border-crema-dark rounded-xl px-4 text-sm font-bold tracking-widest focus:outline-none focus:border-cafe-light"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-xs text-red-500 font-semibold bg-red-50 py-1.5 rounded-lg">
                      {passwordError}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPendingRoleToAccess(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-cafe-medium font-bold text-xs py-3 rounded-xl transition duration-200 shadow-xs"
                      style={{ minHeight: '44px' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-cafe-dark hover:bg-cafe-medium text-white font-bold text-xs py-3 rounded-xl shadow-md transition duration-200"
                      style={{ minHeight: '44px' }}
                    >
                      Ingresar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER BAR */}
      <footer className="bg-crema-dark/30 border-t border-crema-dark py-4 text-center text-xs text-cafe-light">
        <p>© 2026 Café Conexión SpA. Desarrollado de acuerdo al estándar de experiencia de usuario (IEEE 830 / Heurísticas UX).</p>
      </footer>
    </div>
  );
}
