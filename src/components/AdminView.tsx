import React, { useState } from 'react';
import { 
  TrendingUp, DollarSign, Package, Award, 
  Trash2, Plus, Sliders, RefreshCw, Layers, Search, CheckCircle, XCircle 
} from 'lucide-react';
import { Product, Order, LoyaltyMember } from '../types';

interface AdminViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  onClearOrders: () => void;
  loyaltyMembers: LoyaltyMember[];
}

export default function AdminView({
  products,
  setProducts,
  orders,
  onClearOrders,
  loyaltyMembers
}: AdminViewProps) {
  // Tabs: 'products' | 'loyalty' | 'orders-history'
  const [activeTab, setActiveTab] = useState<'products' | 'loyalty' | 'orders-history'>('products');
  
  // Product search
  const [productSearch, setProductSearch] = useState('');
  
  // Loyalty search
  const [loyaltySearch, setLoyaltySearch] = useState('');

  // Add product form modal/state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(3000);
  const [newProdCat, setNewProdCat] = useState<'cafes' | 'frias' | 'snacks' | 'combos'>('cafes');
  const [newProdIcon, setNewProdIcon] = useState('☕');

  const handleToggleStock = (prodId: string) => {
    setProducts(prev => 
      prev.map(p => p.id === prodId ? { ...p, stock: !p.stock } : p)
    );
  };

  const handleUpdatePrice = (prodId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    setProducts(prev => 
      prev.map(p => p.id === prodId ? { ...p, price: newPrice } : p)
    );
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdDesc.trim()) return;

    const newProd: Product = {
      id: `custom-${Date.now()}`,
      name: newProdName.trim(),
      desc: newProdDesc.trim(),
      price: newProdPrice,
      cat: newProdCat,
      stock: true,
      icon: newProdIcon,
      customizable: newProdCat === 'cafes' || newProdCat === 'frias'
    };

    setProducts(prev => [newProd, ...prev]);
    
    // Reset form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice(3000);
    setNewProdCat('cafes');
    setNewProdIcon('☕');
    setShowAddForm(false);
  };

  // Metrics computation
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const avgTicket = totalOrdersCount > 0 ? Math.floor(totalSales / totalOrdersCount) : 0;
  const busyHour = "10:00 - 12:00";

  return (
    <div className="bg-white border-2 border-cafe-medium rounded-3xl p-6 shadow-xl max-w-5xl mx-auto space-y-6">
      {/* Admin header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-crema-dark gap-4">
        <div>
          <span className="text-xxs font-bold tracking-widest text-oliva uppercase">ADMINISTRACIÓN CENTRAL</span>
          <h2 className="text-2xl font-bold text-cafe-dark flex items-center gap-2 mt-0.5">
            <span>💻 Panel de Control de Café Conexión</span>
          </h2>
          <p className="text-xs text-cafe-light">Monitorea ventas, controla inventario y gestiona clientes en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              // Simulated reload confirmation
              alert('Datos de conexión actualizados en tiempo real.');
            }}
            className="p-2.5 hover:bg-crema-light text-cafe-medium rounded-xl border border-crema-dark flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sincronizar</span>
          </button>
          <button
            onClick={onClearOrders}
            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 text-xs font-semibold"
          >
            Reiniciar Ventas
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-crema-light/50 border border-crema-dark rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-cafe-dark flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-cafe-light">Ventas Totales</p>
            <h4 className="font-mono font-bold text-lg text-cafe-dark">${totalSales.toLocaleString('es-CL')} CLP</h4>
          </div>
        </div>

        <div className="bg-crema-light/50 border border-crema-dark rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-cafe-light">Pedidos Totales</p>
            <h4 className="font-mono font-bold text-lg text-cafe-dark">{totalOrdersCount} órdenes</h4>
          </div>
        </div>

        <div className="bg-crema-light/50 border border-crema-dark rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-cafe-light">Ticket Promedio</p>
            <h4 className="font-mono font-bold text-lg text-cafe-dark">${avgTicket.toLocaleString('es-CL')} CLP</h4>
          </div>
        </div>

        <div className="bg-crema-light/50 border border-crema-dark rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-cafe-light">Hora De Congestión</p>
            <h4 className="font-bold text-sm text-cafe-dark">{busyHour} hrs</h4>
          </div>
        </div>
      </div>

      {/* TABS ROW */}
      <div className="flex border-b border-crema-dark">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 font-semibold text-xs transition border-b-2 uppercase tracking-wider ${
            activeTab === 'products'
              ? 'border-cafe-dark text-cafe-dark'
              : 'border-transparent text-cafe-light hover:text-cafe-medium'
          }`}
        >
          🥐 Inventario & Precios
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-4 py-3 font-semibold text-xs transition border-b-2 uppercase tracking-wider ${
            activeTab === 'loyalty'
              ? 'border-cafe-dark text-cafe-dark'
              : 'border-transparent text-cafe-light hover:text-cafe-medium'
          }`}
        >
          👑 Club Clientes Vip {loyaltyMembers.length > 0 && `(${loyaltyMembers.length})`}
        </button>
        <button
          onClick={() => setActiveTab('orders-history')}
          className={`px-4 py-3 font-semibold text-xs transition border-b-2 uppercase tracking-wider ${
            activeTab === 'orders-history'
              ? 'border-cafe-dark text-cafe-dark'
              : 'border-transparent text-cafe-light hover:text-cafe-medium'
          }`}
        >
          📜 Historial de Ventas
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="pt-2">
        {/* TABS 1: PRODUCTS INVENTORY */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-crema-light/20 p-3 rounded-2xl border border-crema-dark">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-cafe-light" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-white text-cafe-dark text-xs py-2 pl-9 pr-4 rounded-xl border border-crema-dark focus:outline-none focus:border-cafe-light"
                />
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-oliva hover:bg-oliva-light text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
                style={{ minHeight: '44px' }}
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Producto</span>
              </button>
            </div>

            {/* EXPANDABLE NEW PRODUCT FORM */}
            {showAddForm && (
              <form onSubmit={handleCreateProduct} className="bg-crema-light p-5 rounded-2xl border border-cafe-light/30 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-crema-dark">
                  <h4 className="font-bold text-cafe-dark text-sm">Nuevo Item en Carta Café Conexión</h4>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-red-500 hover:underline">Cerrar</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-medium">NOMBRE DEL PRODUCTO</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Latte Vainilla"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-white text-cafe-dark border border-crema-dark rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-medium">PRECIO EN CLP ($)</label>
                    <input
                      type="number"
                      required
                      min="500"
                      step="100"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white text-cafe-dark border border-crema-dark rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-medium">CATEGORÍA</label>
                    <select
                      value={newProdCat}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        setNewProdCat(cat);
                        // Auto icons
                        if (cat === 'cafes') setNewProdIcon('☕');
                        if (cat === 'frias') setNewProdIcon('🥤');
                        if (cat === 'snacks') setNewProdIcon('🍰');
                        if (cat === 'combos') setNewProdIcon('🥪');
                      }}
                      className="w-full bg-white text-cafe-dark border border-crema-dark rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="cafes">☕ Cafés Calientes</option>
                      <option value="frias">🥤 Bebidas Frías</option>
                      <option value="snacks">🍪 Snacks y Dulces</option>
                      <option value="combos">🥪 Combos Familiares</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-cafe-medium">DESCRIPCIÓN COMERCIAL</label>
                    <input
                      type="text"
                      required
                      placeholder="Añade ingredientes claves u origen del grano..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full bg-white text-cafe-dark border border-crema-dark rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-medium">EMOJI / IKONO</label>
                    <input
                      type="text"
                      required
                      placeholder="Icono"
                      value={newProdIcon}
                      onChange={(e) => setNewProdIcon(e.target.value)}
                      className="w-full bg-white text-center text-cafe-dark border border-crema-dark rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-oliva hover:bg-oliva-light text-white font-bold text-xs py-2 px-5 rounded-xl border border-transparent shadow"
                    style={{ minHeight: '44px' }}
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            )}

            {/* INVENTORY TABLE */}
            <div className="overflow-x-auto rounded-xl border border-crema-dark bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-cafe-dark text-white font-semibold text-left">
                    <th className="p-3">Icono</th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Precio Unitario</th>
                    <th className="p-3">Disponibilidad (Stock)</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crema-light">
                  {products
                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((product) => (
                      <tr 
                        key={product.id}
                        className={`hover:bg-crema-light/15 transition ${!product.stock ? 'bg-red-50/10' : ''}`}
                      >
                        <td className="p-3 font-bold text-lg text-center" style={{ width: '60px' }}>
                          {product.icon}
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-bold text-cafe-dark text-sm">{product.name}</p>
                            <p className="text-[10px] text-cafe-light mt-0.5 line-clamp-1">{product.desc}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-amber-50 text-cafe-medium font-mono border border-amber-100">
                            {product.cat}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-cafe-light">$</span>
                            <input
                              type="number"
                              value={product.price}
                              onChange={(e) => handleUpdatePrice(product.id, parseInt(e.target.value) || 0)}
                              className="w-18 bg-crema-light/30 border border-transparent h-7 hover:border-crema-dark focus:border-cafe-light focus:outline-none focus:bg-white text-right px-1.5 rounded-lg font-bold text-cafe-dark"
                            />
                            <span className="text-xxs text-cafe-light">CLP</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(product.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase border transition ${
                              product.stock
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {product.stock ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>Activo (En Stock)</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>Agotado</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              // Delete product
                              if (confirm(`¿Estás seguro de quitar "${product.name}" de la carta?`)) {
                                setProducts(prev => prev.filter(p => p.id !== product.id));
                              }
                            }}
                            className="p-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg hover:text-red-700 inline-flex items-center gap-1"
                            title="Remover de la carta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS 2: LOYALTY CLUB DIRECTORY */}
        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-3 bg-crema-light/20 p-3 rounded-2xl border border-crema-dark">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-cafe-light" />
                <input
                  type="text"
                  placeholder="Buscar socio por RUT o por Nombre..."
                  value={loyaltySearch}
                  onChange={(e) => setLoyaltySearch(e.target.value)}
                  className="w-full bg-white text-cafe-dark text-xs py-2 pl-9 pr-4 rounded-xl border border-crema-dark focus:outline-none"
                />
              </div>
              <span className="text-xs text-cafe-medium font-semibold hidden sm:inline">
                Valoración: 1 punto = $1 CLP canjeable
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-crema-dark bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-cafe-dark text-white font-semibold text-left">
                    <th className="p-3">Socio ID / RUT</th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Puntos Acumulados</th>
                    <th className="p-3">Equivalente Canje</th>
                    <th className="p-3">Estatus de Fidelidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crema-light">
                  {loyaltyMembers
                    .filter(m => 
                      m.name.toLowerCase().includes(loyaltySearch.toLowerCase()) || 
                      m.rut.toLowerCase().includes(loyaltySearch.toLowerCase())
                    )
                    .map((member) => {
                      const tier = member.points >= 4000 ? 'ORO CLIENTE ULTRA' : member.points >= 2000 ? 'PLATA FIEL' : 'BRONCE BÁSICO';
                      return (
                        <tr key={member.rut} className="hover:bg-crema-light/15 transition">
                          <td className="p-3 font-mono font-bold text-cafe-medium">{member.rut}</td>
                          <td className="p-3 font-semibold text-cafe-dark text-sm">{member.name}</td>
                          <td className="p-3 font-bold font-mono text-emerald-700 text-sm">
                            {member.points.toLocaleString()} pts
                          </td>
                          <td className="p-3 font-mono text-cafe-light">
                            ${Math.floor(member.points * 10).toLocaleString('es-CL')} CLP
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                              tier.includes('ORO') ? 'bg-amber-100 text-amber-800' : tier.includes('PLATA') ? 'bg-gray-100 text-gray-800' : 'bg-orange-50 text-orange-800'
                            }`}>
                              {tier}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS 3: HISTORIC DIRECTORY */}
        {activeTab === 'orders-history' && (
          <div className="space-y-4">
            <div className="p-4 bg-crema-light/50 border border-crema-dark rounded-xl">
              <h4 className="font-bold text-cafe-dark text-sm">Resumen de Actividad Financiera</h4>
              <p className="text-[11px] text-cafe-light">Ordenes cursadas a través de la terminal táctil durante esta sesión de navegación.</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 bg-white border border-crema-dark rounded-xl">
                <span className="text-3xl mb-1 block">🍂</span>
                <p className="text-xs font-semibold text-cafe-medium">No se han registrado transacciones aún</p>
                <p className="text-[10px] text-cafe-light max-w-xs mx-auto mt-0.5">Visita el rol "Tótem" en la parte superior para hacer pedidos simulados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-crema-dark bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-cafe-dark text-white font-semibold text-left">
                      <th className="p-3">Orden ID</th>
                      <th className="p-3">Hora</th>
                      <th className="p-3">Asociada a RUT</th>
                      <th className="p-3">Detalle de Productos</th>
                      <th className="p-3">Monto Neto</th>
                      <th className="p-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-crema-light">
                    {orders.slice().reverse().map((order) => (
                      <tr key={order.id} className="hover:bg-crema-light/15 transition">
                        <td className="p-3 font-bold font-mono text-cafe-dark">#{order.id}</td>
                        <td className="p-3 text-cafe-light font-mono text-xxs">
                          {order.timestamp.substring(11, 19)}
                        </td>
                        <td className="p-3 font-mono font-medium text-cafe-medium">{order.customerId}</td>
                        <td className="p-3 max-w-[280px]">
                          <div className="space-y-0.5">
                            {order.items.map((it, i) => (
                              <p key={i} className="truncate text-xxs font-medium text-cafe-dark">
                                {it.quantity}x {it.product.name} 
                                {it.customization && ` (${it.customization.size}, ${it.customization.milk !== 'Ninguna' ? it.customization.milk : 'NoLeche'})`}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-bold font-mono text-cafe-dark">${order.total.toLocaleString('es-CL')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            order.status === 'Entregado' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : order.status === 'Listo' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-orange-100 text-orange-850'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
