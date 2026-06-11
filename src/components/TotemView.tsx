import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, CupSoda, Cookie, Utensils, 
  ShoppingCart, ChevronRight, ArrowLeft, Trash2, 
  Plus, Minus, Check, Sparkles, Award, User, RefreshCw,
  Clock, Camera, Scan, Smile, Video, VideoOff, ShieldCheck,
  Gift, Tag, X, ShoppingBag
} from 'lucide-react';
import { Product, CartItem, Order, LoyaltyMember, CustCustomization, RedemptionReward } from '../types';

interface TotemViewProps {
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onPlaceOrder: (order: Order) => void;
  loyaltyMembers: LoyaltyMember[];
  onRegisterLoyalty: (member: LoyaltyMember) => void;
}

export default function TotemView({
  products,
  cart,
  setCart,
  onPlaceOrder,
  loyaltyMembers,
  onRegisterLoyalty
}: TotemViewProps) {
  // Navigation states: 'categories' | 'catalog' | 'checkout' | 'success'
  const [step, setStep] = useState<'categories' | 'catalog' | 'checkout' | 'success'>('categories');
  const [selectedCat, setSelectedCat] = useState<'cafes' | 'frias' | 'snacks' | 'combos' | null>(null);
  
  // Customization modal state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [customChoices, setCustomChoices] = useState<CustCustomization>({
    size: 'Regular',
    milk: 'Ninguna',
    sweetness: 'Normal'
  });

  // Loyalty states
  const [rutInput, setRutInput] = useState('');
  const [verifiedMember, setVerifiedMember] = useState<LoyaltyMember | null>(null);
  const [isNewMemberPrompt, setIsNewMemberPrompt] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Camera & Face-recognition states
  const [authMethod, setAuthMethod] = useState<'rut' | 'face'>('rut');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [faceScanStatus, setFaceScanStatus] = useState<'idle' | 'scanning' | 'matched' | 'no-match' | 'error'>('idle');
  const [tempFaceData, setTempFaceData] = useState<string | null>(null);
  const [scannedFacePreview, setScannedFacePreview] = useState<string | null>(null);
  const [faceScanMessage, setFaceScanMessage] = useState('Alinea tu rostro dentro del marco verde');

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Stop camera stream upon changing steps or unmounting
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  // Start webcam for authentication or registration
  const startCamera = async () => {
    setIsCameraLoading(true);
    setFaceScanStatus('idle');
    setScannedFacePreview(null);
    setFaceScanMessage('Iniciando cámara de reconocimiento...');
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      }, 100);
      setFaceScanMessage('Alinea tu rostro dentro del marco del escáner');
    } catch (err) {
      console.error("Camera access failed:", err);
      setFaceScanStatus('error');
      setFaceScanMessage('No se pudo acceder a la cámara. Otorga permisos en el navegador.');
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Perform simulated face scan to authenticate
  const handleFaceAuthenticate = () => {
    if (!videoRef.current) return;
    
    // Capture snapshot from video using canvas
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Horizontally mirrored image
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setScannedFacePreview(dataUrl);
      }
    } catch (e) {
      console.error("Failed to capture snapshot:", e);
    }

    setFaceScanStatus('scanning');
    setFaceScanMessage('Analizando biometría facial...');

    // Simulate recognition processing delay
    setTimeout(() => {
      // Find members with facial data
      const membersWithFace = loyaltyMembers.filter(m => !!m.faceData);
      
      if (membersWithFace.length > 0) {
        // Authenticate the first matched member with face registered
        const matched = membersWithFace[0];
        setVerifiedMember(matched);
        setFaceScanStatus('matched');
        setFaceScanMessage(`¡Bienvenido de vuelta, ${matched.name}!`);
        stopCamera();
      } else {
        // No faces registered yet
        setFaceScanStatus('no-match');
        setFaceScanMessage('No se encontraron rostros asociados en el Club.');
      }
    }, 2000);
  };

  // Force Demo Recognition easily
  const handleForceDemoRecognition = () => {
    setFaceScanStatus('scanning');
    setFaceScanMessage('Analizando sensores faciales de demostración...');
    setTimeout(() => {
      // Pick Carlos González or Daniela Silva as demo member
      let demoMember = loyaltyMembers.find(m => m.rut === '20.123.456-7');
      if (!demoMember && loyaltyMembers.length > 0) {
        demoMember = loyaltyMembers[0];
      }
      if (demoMember) {
        setVerifiedMember(demoMember);
        setFaceScanStatus('matched');
        setFaceScanMessage(`¡Bienvenido VIP, ${demoMember.name}!`);
        stopCamera();
      }
    }, 1800);
  };

  // Register face capture during sign-up
  const handleCaptureFaceForRegistration = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setTempFaceData(dataUrl);
        setFaceScanMessage('Rostro capturado con éxito.');
        stopCamera();
      }
    } catch (e) {
      console.error("Failed to capture registration shot:", e);
    }
  };

  // Last order state for success screen
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Cart helper functions
  const calculateItemPrice = (product: Product, custom?: CustCustomization) => {
    let base = product.price;
    if (custom) {
      if (custom.size === 'Grande') base += 500;
      if (custom.milk === 'Almendra') base += 300;
    }
    return base;
  };

  const getCustomizationKey = (product: Product, custom?: CustCustomization) => {
    if (!custom) return product.id;
    return `${product.id}-${custom.size}-${custom.milk}-${custom.sweetness}`;
  };

  const addToCart = (product: Product, custom?: CustCustomization) => {
    const itemPrice = calculateItemPrice(product, custom);
    const cartItemId = getCustomizationKey(product, custom);
    
    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, {
          id: cartItemId,
          product,
          quantity: 1,
          customization: custom ? { ...custom } : undefined
        }];
      }
    });

    // Close customization
    setCustomizingProduct(null);
  };

  const updateQuantity = (itemId: string, amount: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleProductClick = (product: Product) => {
    if (product.customizable) {
      setCustomChoices({
        size: 'Regular',
        milk: product.cat === 'cafes' || product.id === 'cold-1' ? 'Entera' : 'Ninguna',
        sweetness: 'Normal'
      });
      setCustomizingProduct(product);
    } else {
      addToCart(product);
    }
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'cafes': return <Coffee className="w-8 h-8 text-cafe-light" />;
      case 'frias': return <CupSoda className="w-8 h-8 text-oliva-light" />;
      case 'snacks': return <Cookie className="w-8 h-8 text-gold" />;
      case 'combos': return <Utensils className="w-8 h-8 text-cafe-dark" />;
      default: return <Coffee className="w-8 h-8" />;
    }
  };

  // Points redemption states
  const [appliedRedemption, setAppliedRedemption] = useState<RedemptionReward | null>(null);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);

  const AVAILABLE_REWARDS: RedemptionReward[] = [
    { id: 'desc1000', name: 'Descuento $1.000 CLP', type: 'discount', pointsCost: 100, discountValue: 1000, icon: '💵' },
    { id: 'desc3000', name: 'Descuento $3.000 CLP', type: 'discount', pointsCost: 250, discountValue: 3000, icon: '💸' },
    { id: 'desc_half', name: '50% Descuento Total', type: 'discount', pointsCost: 500, discountValue: 0, icon: '🔥' },
    { id: 'free_espresso', name: 'Espresso Gratis', type: 'free_product', pointsCost: 120, itemLabel: 'Espresso Gratis (Club)', icon: '☕' },
    { id: 'free_medialuna', name: 'Medialuna Gratis', type: 'free_product', pointsCost: 150, itemLabel: 'Medialuna Gratis (Club)', icon: '🥐' },
    { id: 'free_capuchino', name: 'Capuchino Grande Gratis', type: 'free_product', pointsCost: 200, itemLabel: 'Capuchino Grande Gratis (Club)', icon: '🥤' },
    { id: 'merch_taza', name: 'Taza Exclusiva de Cerámica', type: 'merch', pointsCost: 400, itemLabel: 'Taza Exclusiva (Club)', icon: '🍵' },
    { id: 'merch_bag', name: 'Bolsa Eco "Keep Coffee Local"', type: 'merch', pointsCost: 300, itemLabel: 'Bolsa Ecológica Club', icon: '🛍️' },
    { id: 'merch_jarra', name: 'Jarra Acero Negro Barista', type: 'merch', pointsCost: 600, itemLabel: 'Jarra Acero Negro Barista', icon: '🏺' }
  ];

  // Cart numbers
  const cartSubtotal = cart.reduce((sum, item) => sum + (calculateItemPrice(item.product, item.customization) * item.quantity), 0);
  
  const getDiscountValue = (): number => {
    if (!appliedRedemption) return 0;
    if (appliedRedemption.type !== 'discount') return 0;
    if (appliedRedemption.id === 'desc_half') {
      return Math.floor(cartSubtotal * 0.5);
    }
    return appliedRedemption.discountValue || 0;
  };

  const discountCLP = getDiscountValue();
  const cartTotal = Math.max(0, cartSubtotal - discountCLP);
  const totalPointsEarned = Math.floor(cartTotal / 100);

  // Loyalty verification
  const handleVerifyLoyalty = () => {
    if (!rutInput.trim()) return;
    const formattedRut = rutInput.trim().toLowerCase();
    const found = loyaltyMembers.find(m => m.rut.toLowerCase() === formattedRut || m.rut.replace(/\./g, '').replace(/-/g, '').toLowerCase() === formattedRut.replace(/\./g, '').replace(/-/g, ''));
    if (found) {
      setVerifiedMember(found);
      setIsNewMemberPrompt(false);
    } else {
      setVerifiedMember(null);
      setIsNewMemberPrompt(true);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rutInput.trim() || !newMemberName.trim()) return;
    const newMember: LoyaltyMember = {
      rut: rutInput.trim(),
      name: newMemberName.trim(),
      points: 100 // Welcome points!
    };
    onRegisterLoyalty(newMember);
    setVerifiedMember(newMember);
    setIsNewMemberPrompt(false);
    setNewMemberName('');
  };

  // Place order
  const handleCheckoutConfirm = () => {
    if (cart.length === 0) return;
    const orderId = `N-${Math.floor(100 + Math.random() * 900)}`;
    const waitTime = Math.floor(Math.random() * 6) + 3; // 3 to 8 minutes

    // If they have redeemed a free product or a merch, add it as a $0 CartItem
    const finalItems = [...cart];
    if (appliedRedemption && (appliedRedemption.type === 'free_product' || appliedRedemption.type === 'merch')) {
      const freeRewardProduct: Product = {
        id: `reward-${appliedRedemption.id}`,
        name: appliedRedemption.itemLabel || appliedRedemption.name,
        desc: '🎁 Premio Canjeado con Puntos Club',
        price: 0,
        cat: 'combos',
        stock: true,
        icon: appliedRedemption.icon || '🎁'
      };
      const rewardCartItem: CartItem = {
        id: `reward-item-${appliedRedemption.id}`,
        product: freeRewardProduct,
        quantity: 1
      };
      finalItems.push(rewardCartItem);
    }

    const order: Order = {
      id: orderId,
      items: finalItems,
      total: cartTotal,
      pointsEarned: totalPointsEarned,
      customerId: verifiedMember ? verifiedMember.rut : rutInput.trim() || 'Anónimo',
      customerName: verifiedMember?.name || undefined,
      status: 'Preparando',
      timestamp: new Date().toISOString(),
      waitTime
    };

    onPlaceOrder(order);
    setLastOrder(order);
    
    // Auto add points and subtract points cost if loyalty member is registered 
    if (verifiedMember) {
      const pointsCost = appliedRedemption ? appliedRedemption.pointsCost : 0;
      const updatedMember = { 
        ...verifiedMember, 
        points: Math.max(0, verifiedMember.points - pointsCost) + totalPointsEarned 
      };
      onRegisterLoyalty(updatedMember);
    }

    // Reset Totem customer state
    setCart([]);
    setStep('success');
    setRutInput('');
    setVerifiedMember(null);
    setAppliedRedemption(null);
    setIsNewMemberPrompt(false);
  };

  const handleResetKiosk = () => {
    setLastOrder(null);
    setStep('categories');
    setSelectedCat(null);
    setAppliedRedemption(null);
  };

  return (
    <div className="relative max-w-4xl mx-auto bg-crema-light rounded-3xl overflow-hidden border-4 border-cafe-medium shadow-2xl min-h-[720px] flex flex-col">
      {/* Kiosk status bar */}
      <div className="bg-cafe-dark px-6 py-2.5 flex justify-between items-center text-xs text-crema-dark font-mono tracking-wide border-b border-cafe-medium">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>TÓTEM #01 AUTÓNOMO</span>
        </div>
        <div className="flex items-center gap-4">
          <span>IDIOMA: ESPAÑOL</span>
          <span>1 CLP = 1 PUNTO POR CADA $100</span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="text-center mb-8">
                <span className="text-xs font-semibold tracking-widest text-oliva uppercase">Pide y Acumula Puntos</span>
                <h2 className="text-3xl font-bold text-cafe-dark mt-1">¿Qué se te antoja hoy?</h2>
                <p className="text-sm text-cafe-light mt-2 max-w-md mx-auto">Selecciona una categoría táctil para comenzar tu experiencia en Café Conexión.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                <button
                  onClick={() => { setSelectedCat('cafes'); setStep('catalog'); }}
                  className="card-interactive bg-white border border-crema-dark p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg hover:border-cafe-light"
                  style={{ minHeight: '130px' }}
                >
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-cafe-dark" />
                  </div>
                  <span className="font-semibold text-cafe-dark text-lg">Cafés Calientes</span>
                </button>

                <button
                  onClick={() => { setSelectedCat('frias'); setStep('catalog'); }}
                  className="card-interactive bg-white border border-crema-dark p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg hover:border-oliva"
                  style={{ minHeight: '130px' }}
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CupSoda className="w-8 h-8 text-oliva" />
                  </div>
                  <span className="font-semibold text-cafe-dark text-lg">Bebidas Frías</span>
                </button>

                <button
                  onClick={() => { setSelectedCat('snacks'); setStep('catalog'); }}
                  className="card-interactive bg-white border border-crema-dark p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg hover:border-gold"
                  style={{ minHeight: '130px' }}
                >
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                    <Cookie className="w-8 h-8 text-gold" />
                  </div>
                  <span className="font-semibold text-cafe-dark text-lg">Snacks y Dulces</span>
                </button>

                <button
                  onClick={() => { setSelectedCat('combos'); setStep('catalog'); }}
                  className="card-interactive bg-white border border-crema-dark p-6 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg hover:border-cafe-dark"
                  style={{ minHeight: '130px' }}
                >
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-orange-600" />
                  </div>
                  <span className="font-semibold text-cafe-dark text-lg">Combos del Día</span>
                </button>
              </div>

              {/* Quick Loyalty Lookup helper on home */}
              <div className="mt-8 max-w-md mx-auto w-full bg-crema-dark p-4 rounded-xl text-center">
                <p className="text-xs text-cafe-medium font-medium mb-1">💼 CLUB DE FIDELIDAD</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Consulta tus puntos por RUT..." 
                    value={rutInput}
                    onChange={(e) => setRutInput(e.target.value)}
                    className="flex-1 bg-white border border-cafe-light px-3 py-1.5 rounded-lg text-sm"
                  />
                  <button 
                    onClick={() => {
                      handleVerifyLoyalty();
                      setStep('checkout');
                    }}
                    className="bg-cafe-dark text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-cafe-medium"
                  >
                    Consultar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PRODUCT CATALOG */}
          {step === 'catalog' && selectedCat && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-crema-dark">
                <button
                  onClick={() => setStep('categories')}
                  className="flex items-center gap-2 text-cafe-medium font-semibold text-sm py-2 px-3 hover:bg-crema-dark rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a las Categorías</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cafe-medium flex items-center justify-center text-white font-bold">
                    {getCategoryIcon(selectedCat)}
                  </div>
                  <span className="font-bold text-cafe-dark capitalize text-lg">
                    {selectedCat === 'frias' ? 'Bebidas Frías' : selectedCat}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 flex-1 overflow-y-auto max-h-[480px] pr-2">
                {products
                  .filter(p => p.cat === selectedCat)
                  .map(product => (
                    <div 
                      key={product.id}
                      className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between relative ${
                        product.stock ? 'border-crema-dark hover:border-cafe-light' : 'border-red-100 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-3xl">{product.icon}</span>
                          {!product.stock && (
                            <span className="bg-red-100 text-red-600 text-xxs font-bold px-2 py-0.5 rounded-lg uppercase">
                              Agotado
                            </span>
                          )}
                          {product.customizable && product.stock && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                              A Gusto
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-cafe-dark text-base">{product.name}</h3>
                        <p className="text-xs text-cafe-light line-clamp-2 mt-1 leading-relaxed">
                          {product.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-crema-light">
                        <span className="font-mono font-bold text-cafe-dark text-lg">
                          ${product.price.toLocaleString('es-CL')}
                        </span>
                        
                        {product.stock ? (
                          <button
                            onClick={() => handleProductClick(product)}
                            className="bg-oliva hover:bg-oliva-light text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 focus:ring-2 focus:ring-oliva-light"
                            style={{ minHeight: '44px' }}
                          >
                            <span>Pedir</span>
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-red-400 font-semibold italic py-2">
                            No disponible
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Floating footer preview of cart in Kiosk catalog */}
              {cart.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-amber-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-800 rounded-xl relative">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="absolute -top-1.5 -right-1.5 bg-gold text-cafe-dark w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-200">PEDIDO EN CURSO</p>
                      <h4 className="font-bold font-mono text-lg">${cartSubtotal.toLocaleString('es-CL')} CLP</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('checkout')}
                    className="bg-gold hover:bg-gold-light text-cafe-dark font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition"
                  >
                    <span>Ver Pedido</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: CHECKOUT & CART & LOYALTY */}
          {step === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col md:grid md:grid-cols-5 md:gap-6"
            >
              {/* Back btn */}
              <div className="col-span-5 mb-2">
                <button
                  onClick={() => setStep(selectedCat ? 'catalog' : 'categories')}
                  className="flex items-center gap-2 text-cafe-medium font-semibold text-sm hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al menú</span>
                </button>
              </div>

              {/* Cart contents (Left 3 cols) */}
              <div className="col-span-3 flex flex-col bg-white border border-crema-dark rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-cafe-dark text-lg flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-cafe-light" />
                  <span>Tu Bandeja</span>
                </h3>

                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <span className="text-4xl mb-2">☕</span>
                    <p className="font-semibold text-cafe-medium">La bandeja está vacía</p>
                    <p className="text-xs text-cafe-light max-w-xs mt-1">Regresa al menú para agregar deliciosos cafés y repostería artesanal.</p>
                    <button
                      onClick={() => setStep('categories')}
                      className="mt-4 bg-cafe-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl"
                    >
                      Ver Categorías
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[380px]">
                    {cart.map((item) => {
                      const computedPrice = calculateItemPrice(item.product, item.customization);
                      return (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between gap-3 border-b border-crema-light pb-3 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{item.product.icon}</span>
                              <span className="font-bold text-sm text-cafe-dark">{item.product.name}</span>
                            </div>

                            {/* Show customization details */}
                            {item.customization && (
                              <div className="text-[10px] text-oliva font-medium pl-6 leading-normal mt-0.5 space-x-2">
                                <span>📐 {item.customization.size}</span>
                                <span>🥛 {item.customization.milk !== 'Ninguna' ? item.customization.milk : 'Sin leche'}</span>
                                <span>🍬 {item.customization.sweetness}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Counter buttons */}
                            <div className="flex items-center border border-crema-dark rounded-xl bg-crema-light overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 hover:bg-crema-dark text-cafe-dark"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 font-bold font-mono text-xs">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 hover:bg-crema-dark text-cafe-dark"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right min-w-[70px]">
                              <p className="font-bold font-mono text-sm text-cafe-medium">
                                ${(computedPrice * item.quantity).toLocaleString('es-CL')}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-[10px] text-cafe-light font-mono">
                                  (${computedPrice.toLocaleString('es-CL')} c/u)
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Subtotal metrics inside left panel */}
                {cart.length > 0 && (
                  <div className="border-t border-crema-dark pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-cafe-medium font-medium">
                      <span>Subtotal de items</span>
                      <span className="font-mono">${cartSubtotal.toLocaleString('es-CL')} CLP</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>Puntos a Acumular</span>
                      </span>
                      <span className="font-mono">+{totalPointsEarned} pts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Loyalty & Payment panel (Right 2 cols) */}
              <div className="col-span-2 flex flex-col gap-4 mt-4 md:mt-0">
                {/* LOYALTY CARD CHNL */}
                <div className="bg-white border border-crema-dark rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-2 border-b border-crema-light">
                    <h4 className="font-bold text-cafe-dark text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-gold" />
                      <span>Club Conexión</span>
                    </h4>
                    {!verifiedMember && !isNewMemberPrompt && (
                      <div className="flex bg-crema-dark rounded-lg p-0.5 text-xxs font-semibold">
                        <button
                          onClick={() => { setAuthMethod('rut'); stopCamera(); }}
                          className={`px-2 py-1 rounded-md transition-all ${authMethod === 'rut' ? 'bg-cafe-dark text-white shadow-sm' : 'text-cafe-medium'}`}
                        >
                          RUT
                        </button>
                        <button
                          onClick={() => { setAuthMethod('face'); startCamera(); }}
                          className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${authMethod === 'face' ? 'bg-cafe-dark text-white shadow-sm' : 'text-cafe-medium'}`}
                        >
                          <Camera className="w-3 h-3" />
                          <span>Face ID</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!verifiedMember && !isNewMemberPrompt ? (
                    authMethod === 'rut' ? (
                      <div className="space-y-2">
                        <p className="text-[11px] text-cafe-light">
                          Digita tu RUT de cliente para acumular 10% de tu compra en puntos canjeables.
                        </p>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Ex: 12.345.678-9"
                            value={rutInput}
                            onChange={(e) => setRutInput(e.target.value)}
                            className="flex-1 min-h-[44px] bg-crema-light text-cafe-dark border border-crema-dark rounded-xl px-3 text-xs font-mono font-bold placeholder:text-cafe-light placeholder:font-sans focus:outline-none focus:border-cafe-light"
                          />
                          <button
                            onClick={handleVerifyLoyalty}
                            className="bg-cafe-medium text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-cafe-dark"
                          >
                            Verificar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Face ID Auth Mode
                      <div className="space-y-3">
                        {cameraStream ? (
                          <div className="relative overflow-hidden rounded-xl bg-black border border-cafe-medium">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-44 object-cover scale-x-[-1]"
                            />
                            
                            {/* Scanning Overlays */}
                            {faceScanStatus === 'scanning' ? (
                              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4">
                                <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mb-2" />
                                <span className="bg-emerald-500 text-white text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                  Escaneando biométrico...
                                </span>
                                {/* Pulsing scanning line */}
                                <div className="absolute left-0 right-0 h-1 bg-emerald-400 opacity-90 shadow-[0_0_8px_#34d399] animate-[bounce_1.5s_infinite] top-0" />
                              </div>
                            ) : faceScanStatus === 'matched' ? (
                              <div className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center text-center p-3 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2">
                                  <ShieldCheck className="w-6 h-6" />
                                </div>
                                <span className="text-white font-bold text-xs">Rostro Coincide</span>
                                <span className="text-emerald-200 text-xxs">{faceScanMessage}</span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
                                {/* Reticle Target Overlay */}
                                <div className="absolute inset-6 border border-dashed border-emerald-400/60 rounded-full flex items-center justify-center">
                                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                                  <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                                  <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                                  <Scan className="w-8 h-8 text-emerald-400/50 animate-pulse" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="border border-dashed border-crema-dark rounded-xl p-4 text-center bg-crema-light flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-cafe-medium">
                              <Camera className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-cafe-dark">Acceso biométrico instantáneo</p>
                              <p className="text-[10px] text-cafe-light">Inicia sesión mirando la cámara del tótem para cargar tus puntos al instante.</p>
                            </div>
                            <button
                              onClick={startCamera}
                              disabled={isCameraLoading}
                              className="bg-cafe-dark hover:bg-cafe-medium text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition mt-1"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>{isCameraLoading ? 'Cargando cámara...' : 'Encender Cámara'}</span>
                            </button>
                          </div>
                        )}

                        {cameraStream && (
                          <div className="space-y-2">
                            <p className="text-[11px] text-cafe-medium text-center font-medium bg-crema-light py-1 px-2 rounded-lg">
                              {faceScanMessage}
                            </p>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={handleFaceAuthenticate}
                                disabled={faceScanStatus === 'scanning'}
                                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xxs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition"
                                style={{ minHeight: '36px' }}
                              >
                                <Scan className="w-3.5 h-3.5" />
                                <span>{faceScanStatus === 'scanning' ? 'Analizando...' : 'Escanear Rostro'}</span>
                              </button>

                              {/* Force Demo Login for premium ease of demonstration */}
                              <button
                                onClick={handleForceDemoRecognition}
                                disabled={faceScanStatus === 'scanning'}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] py-1 px-2.5 rounded-xl transition"
                                title="Fuerza un inicio simulado para demostraciones"
                              >
                                Simular VIP
                              </button>

                              <button
                                onClick={stopCamera}
                                className="bg-gray-100 hover:bg-gray-200 text-cafe-medium rounded-xl p-2 transition"
                              >
                                <VideoOff className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ) : verifiedMember ? (
                    <div className="bg-amber-50 border border-gold/30 rounded-xl p-3 flex flex-col gap-2 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-105 text-yellow-850 text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm animate-bounce">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        <span>CLUB VIP ({verifiedMember.points} PTS)</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {verifiedMember.faceData ? (
                          <div className="relative">
                            <img
                              src={verifiedMember.faceData}
                              alt="Rostro registrado"
                              className="w-11 h-11 rounded-full object-cover border-2 border-gold shadow-sm"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white">
                              <ShieldCheck className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-amber-100 text-cafe-dark border-2 border-dashed border-cafe-light flex items-center justify-center font-bold text-sm">
                            {verifiedMember.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-cafe-light uppercase leading-tight">Socio del Club</p>
                          <h4 className="font-bold text-cafe-dark text-sm leading-tight">{verifiedMember.name}</h4>
                          <p className="text-[10px] text-cafe-light font-mono mt-0.5">RUT: {verifiedMember.rut}</p>
                        </div>
                      </div>

                      {/* Points status and catalog opening */}
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 mt-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-cafe-medium">Tus Puntos Club:</span>
                          <span className="text-sm font-extrabold text-amber-800 font-mono flex items-center gap-1">
                            <Award className="w-4 h-4 text-gold" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }} />
                            {verifiedMember.points} PTS
                          </span>
                        </div>

                        {appliedRedemption ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">{appliedRedemption.icon || '🎁'}</span>
                              <div className="text-[11px] leading-tight">
                                <p className="font-bold text-emerald-800">Canjeado: {appliedRedemption.name}</p>
                                <p className="text-[9px] text-emerald-600 font-medium">-{appliedRedemption.pointsCost} puntos</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAppliedRedemption(null)}
                              className="text-red-500 hover:text-red-700 text-xxs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-red-50"
                            >
                              Quitar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsRedemptionModalOpen(true)}
                            className="w-full bg-cafe-dark hover:bg-cafe-medium text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition"
                          >
                            <Gift className="w-3.5 h-3.5 text-gold" />
                            <span>Canjear Puntos por Premios</span>
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-dashed border-amber-200 pt-2 mt-3">
                        <p className="text-[10px] text-oliva font-medium flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Sumarás <strong>{totalPointsEarned} pts</strong> con esta compra</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => { setVerifiedMember(null); setRutInput(''); setAppliedRedemption(null); stopCamera(); }}
                          className="text-[10px] text-red-500 hover:underline font-bold"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Member NOT registered: Prompt registration */
                    <form onSubmit={handleRegister} className="bg-amber-50/50 border border-dashed border-cafe-light rounded-xl p-3 space-y-2">
                       <p className="text-[11px] text-amber-800 font-medium">
                        RUT no registrado. ¡Regístrate gratis y obtén 100 puntos de bienvenida!
                      </p>
                      
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-cafe-light block">RUT</span>
                        <input
                          type="text"
                          disabled
                          value={rutInput}
                          className="w-full bg-crema-dark/50 text-cafe-dark border border-crema-dark rounded-lg py-1.5 px-2.5 text-xs font-mono font-bold"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-cafe-light block">NOMBRE COMPLETO</span>
                        <input
                          type="text"
                          required
                          placeholder="Tu Nombre..."
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full bg-white text-cafe-dark border border-crema-dark rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-cafe-light"
                        />
                      </div>

                      {/* Face capture attachment for New Member Registration */}
                      <div className="bg-white/75 p-2.5 rounded-lg border border-crema-dark/60 space-y-1.5">
                        <span className="text-[9px] font-bold text-cafe-medium flex items-center gap-1">
                          <Camera className="w-3 h-3 text-gold" />
                          <span>¿VINCULAR ROSTRO (FACE ID)?</span>
                        </span>
                        
                        {tempFaceData ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={tempFaceData}
                              alt="Foto Face ID"
                              className="w-10 h-10 rounded-lg object-cover border border-cafe-medium"
                            />
                            <div className="flex-1">
                              <p className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>Rostro Vinculado</span>
                              </p>
                              <p className="text-[8px] text-cafe-light leading-none">Listo para reconocer en futuros pedidos.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setTempFaceData(null)}
                              className="text-red-500 hover:text-red-600 text-xxs underline font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : cameraStream ? (
                          <div className="space-y-2">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-28 object-cover rounded-md scale-x-[-1] bg-black border border-crema-dark"
                            />
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={handleCaptureFaceForRegistration}
                                className="flex-1 bg-cafe-dark hover:bg-cafe-medium text-white text-xxs py-1.5 rounded-lg font-bold"
                              >
                                Capturar Foto
                              </button>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="bg-gray-100 text-cafe-medium text-xxs px-2.5 py-1.5 rounded-lg"
                              >
                                Apagar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={startCamera}
                            className="w-full bg-crema-light hover:bg-crema-dark text-cafe-medium text-xxs font-semibold py-1.5 px-2 rounded-lg border border-dashed border-cafe-light flex items-center justify-center gap-1.5 transition"
                          >
                            <Smile className="w-3.5 h-3.5 text-cafe-light" />
                            <span>Abrir cámara para asociar rostro</span>
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 bg-oliva text-white font-bold text-xxs py-2 rounded-lg hover:bg-oliva-light"
                        >
                          Unirse al Club
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsNewMemberPrompt(false); setRutInput(''); setTempFaceData(null); stopCamera(); }}
                          className="bg-gray-100 text-cafe-medium border border-gray-200 font-bold text-xxs py-2 px-3 rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* PAYMENT METHOD DETIAL */}
                <div className="bg-cafe-dark text-crema-light rounded-2xl p-4 shadow-sm space-y-3">
                  <span className="text-[10px] font-bold tracking-widest text-gold-light uppercase block">PAGO SIMULADO</span>
                  
                  <div className="space-y-2 border-b border-cafe-light/30 pb-3 text-left">
                    <div className="flex justify-between items-center text-xs text-crema-dark">
                      <span>Subtotal de items:</span>
                      <span className="font-mono">${cartSubtotal.toLocaleString('es-CL')} CLP</span>
                    </div>

                    {appliedRedemption && getDiscountValue() > 0 && (
                      <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold bg-emerald-950/20 px-2 py-1 rounded">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-450 shrink-0" />
                          <span>Descuento Club ({appliedRedemption.name}):</span>
                        </span>
                        <span className="font-mono">-${getDiscountValue().toLocaleString('es-CL')} CLP</span>
                      </div>
                    )}

                    {appliedRedemption && (appliedRedemption.type === 'free_product' || appliedRedemption.type === 'merch') && (
                      <div className="flex justify-between items-center text-xs text-emerald-400 font-semibold bg-emerald-950/20 px-2' py-1 rounded">
                        <span className="flex items-center gap-1 shrink-0">
                          <Gift className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Canje Gratis:</span>
                        </span>
                        <span className="max-w-[150px] truncate">{appliedRedemption.name}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-end pt-1">
                      <span className="text-xs text-crema-dark font-bold">Total a pagar:</span>
                      <span className="text-xl font-bold font-mono text-white">${cartTotal.toLocaleString('es-CL')} CLP</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-semibold text-crema-dark block">MEDIO DE PAGO DISPONIBLE</span>
                    <div className="bg-cafe-medium rounded-xl p-3 flex items-center justify-between border border-cafe-light/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💳</span>
                        <div>
                          <p className="text-xs font-bold text-white">Transbank / CuentaCafé</p>
                          <p className="text-[9px] text-crema-dark">Listo para procesar crédito o débito</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutConfirm}
                    disabled={cart.length === 0}
                    className="w-full bg-gold hover:bg-gold-light text-cafe-dark font-bold py-3 px-4 rounded-xl shadow-lg border border-gold-light transition flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:border-transparent disabled:text-gray-500"
                    style={{ minHeight: '48px' }}
                  >
                    <span>Confirmar Pedido</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-[9px] text-center text-crema-dark/70">
                    Al confirmar, el pedido ingresará en la pantalla de la cocina instantáneamente.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRMATION / SUCCESS */}
          {step === 'success' && lastOrder && (
            <motion.div
              key="success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <span className="text-xs font-semibold tracking-widest text-emerald-600 uppercase">¡Transacción Exitosa!</span>
              <h2 className="text-3xl font-bold text-cafe-dark mt-1">Pedido Enviado a Cocina</h2>
              <p className="text-xs text-cafe-light max-w-sm mt-1.5">Conserva tu número de orden. Recibirás tu café preparado al instante.</p>

              {/* Mock ticket layout */}
              <div className="bg-white border-2 border-dashed border-crema-dark rounded-xl p-6 shadow-md my-6 max-w-sm w-full text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-800" />
                <div className="text-center pb-4 border-b border-crema-light">
                  <h4 className="font-bold text-cafe-dark text-lg">☕ CAFÉ CONEXIÓN</h4>
                  <p className="text-[10px] text-cafe-light italic font-mono">{lastOrder.timestamp.substring(11, 19)} - Parque Forestal</p>
                </div>

                <div className="py-4 text-center">
                  <span className="text-[10px] font-bold text-cafe-light tracking-wide uppercase block">NÚMERO DE ORDEN TÁCTIL</span>
                  <p className="text-5xl font-mono font-bold text-cafe-dark tracking-tighter my-1">
                    {lastOrder.id}
                  </p>
                  <div className="inline-flex items-center gap-1 bg-amber-50 text-cafe-medium text-[11px] px-2.5 py-0.5 rounded-lg border border-cafe-light/10 mt-1">
                    <Clock className="w-3.5 h-3.5 text-cafe-light" />
                    <span>Espera estimada: <strong>{lastOrder.waitTime} min</strong></span>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t border-b border-crema-light py-3 my-1 font-mono">
                  {lastOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{item.quantity}x {item.product.name}</span>
                      <span>${(calculateItemPrice(item.product, item.customization) * item.quantity).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 font-mono text-xs space-y-1">
                  <div className="flex justify-between font-bold text-sm text-cafe-dark">
                    <span>Total Pagado:</span>
                    <span>${lastOrder.total.toLocaleString('es-CL')} CLP</span>
                  </div>
                  {lastOrder.pointsEarned > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold text-xxs">
                      <span>Puntos Acumulados:</span>
                      <span>+{lastOrder.pointsEarned} pts</span>
                    </div>
                  )}
                  {lastOrder.customerName && (
                    <div className="text-[10px] text-cafe-medium pt-2 text-center border-t border-dashed border-crema-light mt-2 font-sans font-medium">
                      Cliente: {lastOrder.customerName}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={handleResetKiosk}
                  className="bg-cafe-dark hover:bg-cafe-medium text-white font-bold py-3 rounded-xl shadow transition"
                  style={{ minHeight: '48px' }}
                >
                  Regresar al Menú de Categorías
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CUSTOMIZATION DIALOG / MODAL (AnimatePresence) */}
      <AnimatePresence>
        {customizingProduct && (
          <div className="fixed inset-0 z-150 flex items-end justify-center bg-black/60 p-4">
            {/* Click-outside backdrop */}
            <div className="absolute inset-0" onClick={() => setCustomizingProduct(null)} />

            {/* Modal panel */}
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl z-10 space-y-5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-oliva" />
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-3xl">{customizingProduct.icon}</span>
                  <h3 className="text-lg font-bold text-cafe-dark mt-1">{customizingProduct.name}</h3>
                  <p className="text-xs text-cafe-light">{customizingProduct.desc}</p>
                </div>
                <span className="font-mono font-bold text-lg text-oliva bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                  ${calculateItemPrice(customizingProduct, customChoices).toLocaleString('es-CL')}
                </span>
              </div>

              {/* OPTIONS SELECTION */}
              <div className="space-y-4 pt-2">
                {/* 1. Size Selection */}
                <div className="space-y-1.5">
                  <span className="text-xxs font-bold text-cafe-light tracking-wide uppercase block">1. Selecciona Tamaño</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomChoices(prev => ({ ...prev, size: 'Regular' }))}
                      className={`py-2 px-3 rounded-xl font-semibold text-xs border text-center ${
                        customChoices.size === 'Regular'
                          ? 'bg-cafe-dark text-white border-cafe-dark'
                          : 'bg-crema-light text-cafe-medium border-crema-dark'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      <p>Regular</p>
                      <p className="font-normal font-mono text-[9px] opacity-85">Incluido</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomChoices(prev => ({ ...prev, size: 'Grande' }))}
                      className={`py-2 px-3 rounded-xl font-semibold text-xs border text-center ${
                        customChoices.size === 'Grande'
                          ? 'bg-cafe-dark text-white border-cafe-dark'
                          : 'bg-crema-light text-cafe-medium border-crema-dark'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      <p>Grande</p>
                      <p className="font-normal font-mono text-[9px] opacity-85">+ $500 CLP</p>
                    </button>
                  </div>
                </div>

                {/* 2. Milk Selection (only for coffee cat or cold brew lattes) */}
                {(customizingProduct.cat === 'cafes' || customizingProduct.id === 'cold-1') && (
                  <div className="space-y-1.5">
                    <span className="text-xxs font-bold text-cafe-light tracking-wide uppercase block">2. Tipo de Leche</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['Entera', 'Sin Lactosa', 'Almendra', 'Ninguna'].map((milkType) => (
                        <button
                          key={milkType}
                          type="button"
                          onClick={() => setCustomChoices(prev => ({ ...prev, milk: milkType as any }))}
                          className={`py-2.5 px-3 rounded-xl font-semibold text-xs border text-center ${
                            customChoices.milk === milkType
                              ? 'bg-oliva text-white border-oliva'
                              : 'bg-crema-light text-cafe-medium border-crema-dark'
                          }`}
                          style={{ minHeight: '44px' }}
                        >
                          <p>{milkType}</p>
                          <span className="font-normal font-mono text-[9px] opacity-85">
                            {milkType === 'Almendra' ? '+ $300' : 'Gratis'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Sweetness */}
                <div className="space-y-1.5">
                  <span className="text-xxs font-bold text-cafe-light tracking-wide uppercase block">3. Endulzante</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['Normal', 'Menos Dulce', 'Sin Azúcar'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCustomChoices(prev => ({ ...prev, sweetness: opt as any }))}
                        className={`py-2.5 px-2 rounded-xl font-semibold text-[11px] border text-center ${
                          customChoices.sweetness === opt
                            ? 'bg-cafe-medium text-white border-cafe-medium'
                            : 'bg-crema-light text-cafe-medium border-crema-dark'
                        }`}
                        style={{ minHeight: '44px' }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm customization and add to cart */}
              <div className="flex gap-2 pt-2 border-t border-crema-light">
                <button
                  onClick={() => setCustomizingProduct(null)}
                  className="flex-1 bg-crema-dark hover:bg-gray-200 text-cafe-dark font-bold text-sm py-3 rounded-xl"
                  style={{ minHeight: '48px' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => addToCart(customizingProduct, customChoices)}
                  className="flex-1 bg-oliva hover:bg-oliva-light text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  style={{ minHeight: '48px' }}
                >
                  <span>Agregar al Pedido</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* POINTS REDEMPTION CATALOG MODAL */}
        {isRedemptionModalOpen && verifiedMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={() => setIsRedemptionModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border-2 border-cafe-medium rounded-3xl p-6 shadow-2xl max-w-2xl w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent design */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-gold to-oliva" />

              {/* Close Button */}
              <button
                onClick={() => setIsRedemptionModalOpen(false)}
                className="absolute top-4 right-4 text-cafe-light hover:text-cafe-dark p-2 rounded-xl hover:bg-crema-light transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-gold/40 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-bold mb-2 shadow-xs">
                  <Gift className="w-4 h-4 text-gold animate-pulse" />
                  <span>PREMIOS Y RECOMPENSAS CLUB</span>
                </div>
                <h3 className="text-xl font-extrabold text-cafe-dark">Catálogo de Canje</h3>
                <p className="text-xs text-cafe-light mt-1">
                  Canjea tus puntos acumulados por promociones exclusivas, café gratis o merchandising oficial.
                </p>

                {/* Point count indicator */}
                <div className="bg-amber-50 border border-gold/20 rounded-2xl p-3 max-w-sm mx-auto mt-3 flex justify-between items-center px-5">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-cafe-light uppercase">Puntos Disponibles</p>
                    <p className="text-xs text-cafe-medium font-semibold">{verifiedMember.name}</p>
                  </div>
                  <div className="text-2xl font-black text-amber-800 font-mono flex items-center gap-1">
                    <Award className="w-6 h-6 text-gold" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }} />
                    <span>{verifiedMember.points}</span>
                    <span className="text-xs text-cafe-medium font-bold ml-1">PTS</span>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="max-h-[350px] overflow-y-auto pr-1 space-y-4 text-left">
                {/* Descuentos */}
                <div>
                  <h4 className="text-xs font-bold text-cafe-medium uppercase tracking-wider mb-2 flex items-center gap-1 text-left border-b border-crema-dark pb-1.5">
                    <Tag className="w-3.5 h-3.5 text-gold" />
                    <span>Descuentos en Boleta</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_REWARDS.filter(r => r.type === 'discount').map(reward => {
                      const canAfford = verifiedMember.points >= reward.pointsCost;
                      const isSelected = appliedRedemption?.id === reward.id;
                      return (
                        <div
                          key={reward.id}
                          className={`border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                              : 'bg-white border-crema-dark hover:border-cafe-light/40'
                          }`}
                        >
                          <div className="text-center pb-2">
                            <span className="text-2xl block mb-1">{reward.icon}</span>
                            <span className="text-xs font-bold text-cafe-dark block leading-tight">{reward.name}</span>
                            <span className="text-[10px] text-amber-800 font-bold font-mono mt-1 block bg-amber-50 rounded-md py-0.5 max-w-[90px] mx-auto border border-amber-200/50">
                              {reward.pointsCost} PTS
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={!canAfford && !isSelected}
                            onClick={() => {
                              if (isSelected) {
                                setAppliedRedemption(null);
                              } else {
                                setAppliedRedemption(reward);
                                setIsRedemptionModalOpen(false);
                              }
                            }}
                            className={`w-full py-1.5 rounded-lg text-xxs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : canAfford
                                ? 'bg-cafe-dark hover:bg-cafe-medium text-white shadow-xs'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isSelected ? 'Desestimar' : canAfford ? 'Canjear' : 'Faltan Puntos'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bebidas y Alimentos */}
                <div>
                  <h4 className="text-xs font-bold text-cafe-medium uppercase tracking-wider mb-2 flex items-center gap-1 text-left border-b border-crema-dark pb-1.5 pt-2">
                    <Coffee className="w-3.5 h-3.5 text-cafe-light" />
                    <span>Bebidas y Alimentos Gratis</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_REWARDS.filter(r => r.type === 'free_product').map(reward => {
                      const canAfford = verifiedMember.points >= reward.pointsCost;
                      const isSelected = appliedRedemption?.id === reward.id;
                      return (
                        <div
                          key={reward.id}
                          className={`border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                              : 'bg-white border-crema-dark hover:border-cafe-light/40'
                          }`}
                        >
                          <div className="text-center pb-2">
                            <span className="text-2xl block mb-1">{reward.icon}</span>
                            <span className="text-xs font-bold text-cafe-dark block leading-tight">{reward.name}</span>
                            <span className="text-[10px] text-amber-800 font-bold font-mono mt-1 block bg-amber-50 rounded-md py-0.5 max-w-[90px] mx-auto border border-amber-200/50">
                              {reward.pointsCost} PTS
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={!canAfford && !isSelected}
                            onClick={() => {
                              if (isSelected) {
                                setAppliedRedemption(null);
                              } else {
                                setAppliedRedemption(reward);
                                setIsRedemptionModalOpen(false);
                              }
                            }}
                            className={`w-full py-1.5 rounded-lg text-xxs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : canAfford
                                ? 'bg-cafe-dark hover:bg-cafe-medium text-white shadow-xs'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isSelected ? 'Desestimar' : canAfford ? 'Canjear' : 'Faltan Puntos'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Merchandising */}
                <div>
                  <h4 className="text-xs font-bold text-cafe-medium uppercase tracking-wider mb-2 flex items-center gap-1 text-left border-b border-crema-dark pb-1.5 pt-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-oliva" />
                    <span>Coleccionables y Accesorios (Merch)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_REWARDS.filter(r => r.type === 'merch').map(reward => {
                      const canAfford = verifiedMember.points >= reward.pointsCost;
                      const isSelected = appliedRedemption?.id === reward.id;
                      return (
                        <div
                          key={reward.id}
                          className={`border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                              : 'bg-white border-crema-dark hover:border-cafe-light/40'
                          }`}
                        >
                          <div className="text-center pb-2">
                            <span className="text-2xl block mb-1">{reward.icon}</span>
                            <span className="text-xs font-bold text-cafe-dark block leading-tight">{reward.name}</span>
                            <span className="text-[10px] text-amber-800 font-bold font-mono mt-1 block bg-amber-50 rounded-md py-0.5 max-w-[90px] mx-auto border border-amber-200/50">
                              {reward.pointsCost} PTS
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={!canAfford && !isSelected}
                            onClick={() => {
                              if (isSelected) {
                                setAppliedRedemption(null);
                              } else {
                                setAppliedRedemption(reward);
                                setIsRedemptionModalOpen(false);
                              }
                            }}
                            className={`w-full py-1.5 rounded-lg text-xxs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : canAfford
                                ? 'bg-cafe-dark hover:bg-cafe-medium text-white shadow-xs'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isSelected ? 'Desestimar' : canAfford ? 'Canjear' : 'Faltan Puntos'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom footer note */}
              <div className="border-t border-crema-light pt-4 mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRedemptionModalOpen(false)}
                  className="bg-cafe-dark hover:bg-cafe-medium text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-200"
                >
                  Cerrar Catálogo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
