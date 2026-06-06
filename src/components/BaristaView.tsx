import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Clock, CheckCircle2, Check, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface BaristaViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function BaristaView({
  orders,
  onUpdateOrderStatus
}: BaristaViewProps) {
  // Filter only active orders (Preparing or Ready)
  const activeOrders = orders.filter(o => o.status !== 'Entregado');
  
  // Stats
  const preparingOrders = activeOrders.filter(o => o.status === 'Preparando');
  const readyOrders = activeOrders.filter(o => o.status === 'Listo');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Kitchen status row */}
      <div className="bg-cafe-dark border-4 border-oliva rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-oliva-light rounded-xl flex items-center justify-center text-white">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-oliva-light tracking-widest block">MONITOR DE DESPACHO</span>
            <h2 className="text-xl font-bold tracking-tight">☕ Barra de Baristas de Café Conexión</h2>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-orange-800/65 border border-orange-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>EN PREPARACIÓN: {preparingOrders.length}</span>
          </div>
          <div className="bg-emerald-800/65 border border-emerald-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>LISTOS PARA RETIRO: {readyOrders.length}</span>
          </div>
        </div>
      </div>

      {/* COLA DE PEDIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {activeOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full bg-white border border-crema-dark rounded-2xl p-10 text-center text-cafe-medium"
            >
              <span className="text-5xl block animate-bounce mb-2">🎉</span>
              <h3 className="font-bold text-lg text-cafe-dark">¡Barra limpia hoy!</h3>
              <p className="text-xs text-cafe-light max-w-sm mx-auto mt-1">No hay ningún pedido activo en este momento. Las solicitudes hechas desde el Kiosk llegarán aquí solos.</p>
            </motion.div>
          ) : (
            activeOrders.map((order) => {
              const isReady = order.status === 'Listo';
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`bg-white border-2 rounded-2xl shadow-md overflow-hidden flex flex-col justify-between ${
                    isReady ? 'border-emerald-500 bg-emerald-50/10' : 'border-cafe-medium'
                  }`}
                >
                  {/* Card head: order no and elapsed count */}
                  <div className={`px-4 py-3 border-b flex justify-between items-center ${
                    isReady ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-crema-dark/40 text-cafe-dark border-crema-light'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-2xl font-bold tracking-tight">#{order.id}</span>
                      {order.customerName && (
                        <span className="text-xxs font-semibold bg-white/20 px-1.5 py-0.5 rounded-md truncate max-w-[110px]">
                          {order.customerName.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-xxs font-bold px-2 py-1 rounded-md uppercase ${
                      isReady ? 'bg-white text-emerald-700' : 'bg-orange-150 text-orange-850'
                    }`}>
                      {order.status === 'Preparando' ? '⏳ Preparando' : '✅ Listo'}
                    </span>
                  </div>

                  {/* Order items content */}
                  <div className="p-4 flex-1 space-y-4">
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="border-b border-dashed border-crema-light last:border-b-0 pb-2.5 last:pb-0">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-cafe-dark">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="text-lg">{item.product.icon}</span>
                          </div>

                          {/* Detail of customizable options */}
                          {item.customization && (
                            <div className="mt-1 flex flex-wrap gap-1 text-[10px] pl-2 border-l-2 border-oliva">
                              <span className="bg-crema-dark/40 text-cafe-medium font-semibold px-1.5 py-0.5 rounded">
                                📐 {item.customization.size}
                              </span>
                              {item.customization.milk !== 'Ninguna' && (
                                <span className="bg-amber-50 text-cafe-medium font-semibold px-1.5 py-0.5 rounded border border-amber-100">
                                  🥛 {item.customization.milk}
                                </span>
                              )}
                              <span className="bg-emerald-50 text-oliva font-semibold px-1.5 py-0.5 rounded border border-emerald-100">
                                🍬 {item.customization.sweetness}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-cafe-light font-mono pt-2 border-t border-crema-light mt-2">
                      <span>RUT: {order.customerId}</span>
                      <span>Ingreso: {order.timestamp.substring(11, 19)}</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-3 bg-crema-light/20 border-t border-crema-light">
                    {!isReady ? (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Listo')}
                        className="w-full bg-oliva hover:bg-oliva-light text-white font-bold text-xs py-2.5 rounded-xl transition flex justify-center items-center gap-1.5"
                        style={{ minHeight: '44px' }}
                      >
                        <Check className="w-4 h-4" />
                        <span>Marcar como Listo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Entregado')}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl transition flex justify-center items-center gap-1.5"
                        style={{ minHeight: '44px' }}
                      >
                        <span>Entregar al Cliente</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
