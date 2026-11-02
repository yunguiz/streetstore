import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft,
  Truck, 
  Check, 
  Tag, 
  MessageCircle,
  Copy,
  CreditCard,
  QrCode,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Lock,
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { CartItem } from '../types';
import { 
  createDirectPix, 
  getPaymentStatus, 
  confirmPixPayment,
  processTransparentCardPayment, 
  MercadoPagoPixResponse
} from '../services/mercadopago';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  initialStep?: 'cart' | 'checkout';
  onOpenTracking?: (orderNumber?: string) => void;
}

// Formatters and Brand Detector
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiration(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length > 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  if (digits.length > 3) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  return digits;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length > 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length > 2) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return digits;
}

function detectCardBrand(cardNumber: string): 'visa' | 'master' | 'elo' | 'amex' | 'hipercard' | 'unknown' {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'master';
  if (/^(4011|4389|4514|4576|5041|5066|5090|6277|6362|6363|650|651|655)/.test(clean)) return 'elo';
  if (/^(34|37)/.test(clean)) return 'amex';
  if (/^(606282|3841)/.test(clean)) return 'hipercard';
  return 'unknown';
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  initialStep = 'cart',
  onOpenTracking
}: CartDrawerProps) {
  // Step state: 'cart' (Review items) or 'checkout' (Transparent Payment)
  const [step, setStep] = useState<'cart' | 'checkout'>(initialStep);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  
  // Payment Method: 'card' (Transparent Card) or 'pix' (Transparent Pix)
  const [activePaymentMethod, setActivePaymentMethod] = useState<'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pixPendingNotice, setPixPendingNotice] = useState<string | null>(null);

  // Customer contact info (persisted in localStorage for convenience)
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem('street_customer_name') || '';
    } catch {
      return '';
    }
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    try {
      return localStorage.getItem('street_customer_email') || '';
    } catch {
      return '';
    }
  });
  const [customerCpf, setCustomerCpf] = useState(() => {
    try {
      return localStorage.getItem('street_customer_cpf') || '';
    } catch {
      return '';
    }
  });
  const [customerPhone, setCustomerPhone] = useState(() => {
    try {
      return localStorage.getItem('street_customer_phone') || '';
    } catch {
      return '';
    }
  });

  // Credit Card Form Fields (Checkout Transparente)
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardExpiration, setCardExpiration] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState<number>(1);

  // Pix state (Checkout Transparente)
  const [pixData, setPixData] = useState<MercadoPagoPixResponse | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);
  const [approvedPaymentDetails, setApprovedPaymentDetails] = useState<{
    id?: string | number;
    amount?: number;
    method?: string;
    nuvemOrderNumber?: string;
    customerEmail?: string;
  } | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Mercado Pago SDK from @mercadopago/sdk-js initialized with .env key
  const MP_PUBLIC_KEY = (import.meta as any).env?.VITE_MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-b72ab0f6-ad03-4238-9070-602d5bfd942a';
  const [mpInstance, setMpInstance] = useState<any>(null);
  const [isMpLoaded, setIsMpLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function initSdk() {
      try {
        await loadMercadoPago();
        if ((window as any).MercadoPago && active) {
          const mp = new (window as any).MercadoPago(MP_PUBLIC_KEY, {
            locale: 'pt-BR',
            advancedFraudPrevention: false,
          });
          setMpInstance(mp);
          setIsMpLoaded(true);
        }
      } catch (err) {
        // Safe warning
      }
    }
    initSdk();
    return () => {
      active = false;
    };
  }, [MP_PUBLIC_KEY]);

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 299.0;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // 5% discount when paying with Pix
  const pixSpecialDiscountPercent = activePaymentMethod === 'pix' ? 5 : 0;
  const totalDiscountPercent = appliedDiscount + pixSpecialDiscountPercent;
  const discountValue = (subtotal * totalDiscountPercent) / 100;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 18.90;
  const total = Math.max(0.01, subtotal - discountValue + shippingFee);

  // Save customer info
  const saveCustomerInfo = () => {
    try {
      if (customerName) localStorage.setItem('street_customer_name', customerName);
      if (customerEmail) localStorage.setItem('street_customer_email', customerEmail);
      if (customerCpf) localStorage.setItem('street_customer_cpf', customerCpf);
      if (customerPhone) localStorage.setItem('street_customer_phone', customerPhone);
    } catch {
      // ignore
    }
  };

  // Poll Pix payment status in background (strict real bank accreditation)
  useEffect(() => {
    if (pixData?.paymentId && !paymentApproved) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await getPaymentStatus(pixData.paymentId!);
          if (res.approved === true && res.status === 'approved') {
            clearInterval(pollIntervalRef.current);
            setPaymentApproved(true);
            setApprovedPaymentDetails({
              id: res.nuvemOrderNumber || pixData.paymentId,
              amount: total,
              method: 'Pix Instantâneo (Aprovado)',
              nuvemOrderNumber: res.nuvemOrderNumber,
              customerEmail: customerEmail
            });
            confetti({
              particleCount: 120,
              spread: 110,
              origin: { y: 0.6 },
              colors: ['#009EE3', '#E50914', '#00FF66', '#FFFFFF']
            });
          }
        } catch (e) {
          console.error('Error polling pix status:', e);
        }
      }, 3500);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [pixData, paymentApproved, total, customerEmail]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'STREETVIP') {
      setAppliedDiscount(15);
      setCouponMessage('Cupom VIP aplicado! 15% de desconto!');
    } else if (code === 'PRIMEIRACOMPRA') {
      setAppliedDiscount(10);
      setCouponMessage('Cupom de primeira compra aplicado! 10% de desconto!');
    } else {
      setCouponMessage('Cupom inválido. Tente STREETVIP ou PRIMEIRACOMPRA.');
    }
  };

  // Process Transparent Credit Card Payment (directly in website with @mercadopago/sdk-js)
  const handleProcessCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (cleanNum.length < 13) {
      setErrorMessage('Informe o número completo do seu cartão de crédito.');
      return;
    }
    if (!cardholderName.trim()) {
      setErrorMessage('Informe o nome do titular como está impresso no cartão.');
      return;
    }
    const expParts = cardExpiration.split('/');
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
      setErrorMessage('Informe a validade do cartão no formato MM/AA.');
      return;
    }
    if (cardCvv.length < 3) {
      setErrorMessage('Informe o código de segurança (CVV) do cartão.');
      return;
    }
    const cleanCpf = customerCpf.replace(/\D/g, '');
    if (cleanCpf.length < 11) {
      setErrorMessage('Informe um CPF válido para identificação do pagamento.');
      return;
    }
    if (!customerEmail.includes('@')) {
      setErrorMessage('Informe um e-mail válido para envio do comprovante.');
      return;
    }

    setIsProcessing(true);
    saveCustomerInfo();

    try {
      const brand = detectCardBrand(cardNumber);
      let cardTokenId: string | undefined = undefined;

      // 1. Tokenize natively using SDK in-browser
      if (mpInstance && typeof mpInstance.createCardToken === 'function') {
        try {
          const expYearFull = expParts[1].length === 2 ? `20${expParts[1]}` : expParts[1];
          const tokenRes = await mpInstance.createCardToken({
            cardNumber: cleanNum,
            cardholderName: cardholderName.trim().toUpperCase(),
            cardExpirationMonth: expParts[0],
            cardExpirationYear: expYearFull,
            securityCode: cardCvv,
            identificationType: 'CPF',
            identificationNumber: cleanCpf
          });
          if (tokenRes && tokenRes.id) {
            cardTokenId = tokenRes.id;
            console.log('[SDK] Card token created successfully:', tokenRes.id);
          }
        } catch (sdkTokenErr) {
          console.warn('[SDK] Notice during client tokenization:', sdkTokenErr);
        }
      }

      // 2. Process transparent payment on backend with store sync
      const res = await processTransparentCardPayment({
        token: cardTokenId,
        cardData: !cardTokenId ? {
          cardNumber: cleanNum,
          cardholderName: cardholderName.toUpperCase().trim(),
          expirationMonth: expParts[0],
          expirationYear: expParts[1],
          securityCode: cardCvv,
          cpf: cleanCpf
        } : undefined,
        transactionAmount: total,
        installments,
        paymentMethodId: brand !== 'unknown' ? brand : 'visa',
        description: `Street Store (${items.length} peças) - Pedido Oficial`,
        payer: {
          name: customerName || cardholderName,
          email: customerEmail,
          cpf: cleanCpf,
          phone: customerPhone
        },
        items: items.map((it) => ({
          id: it.product.id,
          name: `${it.product.name} (${it.selectedSize})`,
          price: it.product.price,
          quantity: it.quantity,
          selectedSize: it.selectedSize,
          variantId: it.product.variantsList?.[0]?.id
        }))
      });

      if (res.success && (res.status === 'approved' || res.statusDetail === 'accredited')) {
        setPaymentApproved(true);
        setApprovedPaymentDetails({
          id: res.nuvemOrderNumber || res.paymentId,
          amount: total,
          method: `Cartão de Crédito ${installments}x sem juros`,
          nuvemOrderNumber: res.nuvemOrderNumber,
          customerEmail: customerEmail
        });
        confetti({
          particleCount: 130,
          spread: 110,
          origin: { y: 0.6 },
          colors: ['#009EE3', '#E50914', '#00FF66', '#FFFFFF']
        });
      } else if (res.status === 'in_process' || res.status === 'pending') {
        setPaymentApproved(true);
        setApprovedPaymentDetails({
          id: res.paymentId,
          amount: total,
          method: 'Cartão em Análise de Segurança',
          customerEmail: customerEmail
        });
      } else {
        // Human-friendly error translation
        let msg = res.error || 'Não foi possível processar o cartão no momento.';
        if (res.statusDetail === 'cc_rejected_bad_filled_security_code') {
          msg = 'Código de segurança (CVV) inválido. Verifique os 3 dígitos no verso.';
        } else if (res.statusDetail === 'cc_rejected_bad_filled_date') {
          msg = 'Data de validade incorreta ou cartão vencido.';
        } else if (res.statusDetail === 'cc_rejected_insufficient_amount') {
          msg = 'Limite insuficiente no cartão para esta compra.';
        } else if (res.statusDetail === 'cc_rejected_call_for_authorize') {
          msg = 'Ligue para a operadora do seu cartão para autorizar a transação.';
        } else if (res.statusDetail === 'cc_rejected_high_risk') {
          msg = 'Transação recusada pelo sistema antifraude do emissor. Experimente pagar via Pix com 5% de desconto imediato!';
        }
        setErrorMessage(msg);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão com o gateway de pagamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Transparent Pix directly in drawer (100% in-app, ZERO redirects)
  const handleGeneratePix = async () => {
    setErrorMessage(null);
    setPixPendingNotice(null);

    const cleanCpf = customerCpf.replace(/\D/g, '');
    if (!customerEmail.includes('@')) {
      setErrorMessage('Informe seu e-mail para emissão do Pix e envio do comprovante.');
      return;
    }

    setIsProcessing(true);
    saveCustomerInfo();

    try {
      const res = await createDirectPix({
        amount: total,
        description: `Street Store (${items.length} itens)`,
        payer: {
          name: customerName || 'Cliente Street Store',
          email: customerEmail,
          cpf: cleanCpf.length === 11 ? cleanCpf : undefined,
          phone: customerPhone
        },
        items: items.map((it) => ({
          id: it.product.id,
          name: `${it.product.name} (${it.selectedSize})`,
          price: it.product.price,
          quantity: it.quantity,
          selectedSize: it.selectedSize,
          variantId: it.product.variantsList?.[0]?.id
        }))
      });

      if (res.success && res.qrCode) {
        setPixData(res);
      } else {
        setErrorMessage(res.error || 'Erro ao gerar Pix. Você também pode pagar no cartão até 6x sem juros!');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao gerar Pix');
    } finally {
      setIsProcessing(false);
    }
  };

  // Strict Real In-App Pix verification (NEVER confirms without real bank accreditation)
  const handleConfirmPixPayment = async () => {
    if (!pixData?.paymentId) return;
    setIsProcessing(true);
    setPixPendingNotice(null);

    try {
      const res = await confirmPixPayment(pixData.paymentId);
      if (res.approved === true && res.status === 'approved') {
        setPaymentApproved(true);
        setApprovedPaymentDetails({
          id: res.nuvemOrderNumber || pixData.paymentId,
          amount: total,
          method: 'Pix Instantâneo (Aprovado)',
          nuvemOrderNumber: res.nuvemOrderNumber,
          customerEmail: customerEmail
        });
        confetti({
          particleCount: 130,
          spread: 110,
          origin: { y: 0.6 },
          colors: ['#009EE3', '#E50914', '#00FF66', '#FFFFFF']
        });
      } else {
        // Did not confirm in bank yet! Inform user clearly and DO NOT approve!
        setPixPendingNotice(
          res.message ||
            'Aguardando compensação do banco: O pagamento ainda não foi identificado. Faça a transferência via Pix no app do seu banco e clique em verificar novamente.'
        );
      }
    } catch (e: any) {
      setPixPendingNotice('Erro ao consultar compensação do Pix. Tente novamente em instantes.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy Pix Copia e Cola
  const handleCopyPix = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    }
  };

  const handleWhatsAppHelp = () => {
    const lines = items.map(
      (item) => `• ${item.quantity}x ${item.product.name} (Tam: ${item.selectedSize}) - R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}`
    );
    const message = `Salve equipe Street Store! Estou finalizando meu pedido no site:\n\n${lines.join('\n')}\n\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n\nPoderiam me tirar uma dúvida rápida?`;
    window.open(`https://wa.me/5531999999999?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  const cardBrand = detectCardBrand(cardNumber);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-8">
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-full sm:max-w-md bg-[#0F0F0F] border-l border-zinc-800 flex flex-col shadow-2xl h-full"
        >
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/80 shrink-0">
            <div className="flex items-center gap-2">
              {step === 'checkout' && !paymentApproved && (
                <button
                  onClick={() => setStep('cart')}
                  className="p-1 -ml-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer mr-1"
                  title="Voltar para a Sacola"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <ShoppingBag className="w-5 h-5 text-[#E50914]" />
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-oswald">
                {step === 'cart' ? 'SEU CARRINHO' : 'CHECKOUT TRANSPARENTE'}
              </h2>
              
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar carrinho"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter (Visible on step === 'cart') */}
          {step === 'cart' && (
            <div className="px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <Truck className="w-3.5 h-3.5 text-[#E50914]" />
                  {missingForFreeShipping === 0 ? (
                    <span className="text-emerald-400 font-bold">Você ganhou FRETE GRÁTIS! 🚀</span>
                  ) : (
                    <span>
                      Faltam <strong className="text-white">R$ {missingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para Frete Grátis
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">
                  {Math.round(freeShippingProgress)}%
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* MAIN DRAWER CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* 1. SUCCESS CONFIRMATION RECEIPT */}
            {paymentApproved ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-2">
                    PAGAMENTO CONFIRMADO COM SUCESSO
                  </span>
                  <h3 className="text-xl font-black text-white uppercase font-oswald tracking-wide">
                    Pedido {approvedPaymentDetails?.nuvemOrderNumber || `#${approvedPaymentDetails?.id || 'CONFIRMADO'}`} Aprovado!
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Agradecemos pela preferência! O comprovante e detalhes da compra foram enviados para o e-mail:{' '}
                    <strong className="text-white underline">{customerEmail || approvedPaymentDetails?.customerEmail || 'seu e-mail'}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-left space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Status do Pedido:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pago com Sucesso
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Valor Total:</span>
                    <span className="text-white font-bold font-oswald text-sm">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Forma de Pagamento:</span>
                    <span className="text-zinc-200 font-semibold">{approvedPaymentDetails?.method || 'Pagamento Seguro'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Envio & Expedição:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Envio Expresso (Preparando Pacote)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Código de Rastreio:</span>
                    <span className="text-zinc-300 font-medium">Será enviado por e-mail assim que postado</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      const orderNum = approvedPaymentDetails?.nuvemOrderNumber || String(approvedPaymentDetails?.id || '');
                      setPaymentApproved(false);
                      setPixData(null);
                      setApprovedPaymentDetails(null);
                      setStep('cart');
                      onClearCart();
                      onClose();
                      if (onOpenTracking) {
                        onOpenTracking(orderNum);
                      }
                    }}
                    className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-950/60 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>ACOMPANHAR MEU PEDIDO AGORA</span>
                  </button>

                  <button
                    onClick={() => {
                      setPaymentApproved(false);
                      setPixData(null);
                      setApprovedPaymentDetails(null);
                      setStep('cart');
                      onClearCart();
                      onClose();
                    }}
                    className="w-full px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </div>

            // 2. PIX DISPLAY STATE (Dentro do site)
            ) : pixData ? (
              <div className="space-y-4 py-1">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#009EE3]" />
                    <span className="text-sm font-bold text-white">Pix Instantâneo (5% OFF)</span>
                  </div>
                  <button
                    onClick={() => {
                      setPixData(null);
                      setPixPendingNotice(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Trocar Forma
                  </button>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pagamento Seguro no Site · Sem Redirecionamento</span>
                  </div>

                  <p className="text-xs text-zinc-300">
                    Abra o app do seu banco, escolha <strong>Pagar com Pix</strong> e escaneie o QR Code abaixo:
                  </p>

                  {/* QR Code Image */}
                  <div className="w-52 h-52 bg-white rounded-2xl p-3 mx-auto flex items-center justify-center shadow-2xl border-2 border-zinc-700">
                    {pixData.qrCodeBase64 ? (
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code Pix Oficial"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-44 h-44 text-black" />
                    )}
                  </div>

                  {/* Amount Badge */}
                  <div className="text-xl font-black text-white font-oswald">
                    R$ {total.toFixed(2).replace('.', ',')}
                    <span className="text-[11px] text-emerald-400 ml-2 font-normal font-sans">
                      (5% OFF Pix aplicado)
                    </span>
                  </div>

                  {/* Copy Pix Copia e Cola */}
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-left">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1">
                        Código Pix Copia e Cola:
                      </span>
                      <p className="font-mono text-[10px] text-zinc-300 break-all select-all line-clamp-2">
                        {pixData.qrCode}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-3 bg-[#009EE3] hover:bg-[#0089c7] text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-950/50 active:scale-95"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{pixCopied ? 'Código Copiado com Sucesso!' : 'Copiar Código Pix'}</span>
                    </button>

                    {/* Pending bank notice if clicked without paying */}
                    {pixPendingNotice && (
                      <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200 text-left flex items-start gap-2 animate-pulse">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-amber-300">Pagamento não identificado ainda:</strong>
                          <span>{pixPendingNotice}</span>
                        </div>
                      </div>
                    )}

                    {/* Manual In-App Confirmation Button */}
                    <button
                      type="button"
                      onClick={handleConfirmPixPayment}
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/60 active:scale-95 disabled:opacity-70 mt-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Consultando compensação no banco...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>JÁ REALIZEI O PAGAMENTO PIX</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Status Polling Indicator */}
                  <div className="pt-2 flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Aguardando confirmação bancária (reconhecimento automático)...</span>
                  </div>
                </div>
              </div>

            // 3. EMPTY CART
            ) : items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
                <p className="text-base font-bold text-white">Seu carrinho está vazio.</p>
                <p className="text-xs text-zinc-400">
                  Adicione moletons, calças cargo, sneakers ou bonés para continuar.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2 bg-[#E50914] text-white text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>

            // 4. STEP 1: REVIEW CART ITEMS
            ) : step === 'cart' ? (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80"
                  >
                    <div className="w-16 h-16 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-500 hover:text-[#E50914] p-1 cursor-pointer"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>Tam: <strong className="text-zinc-200">{item.selectedSize}</strong></span>
                        <span>·</span>
                        <span className="truncate">{item.selectedColor}</span>
                      </div>

                      {(item.product.stockCount ?? 0) <= 0 && (
                        <div className="mt-1 text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded">
                          Sem estoque no momento (Aguardando reposição na Nuvemshop/Bling)
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-zinc-950 border border-zinc-700/80 rounded-md">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="px-2 py-0.5 text-zinc-400 hover:text-white cursor-pointer"
                            aria-label="Diminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            disabled={(item.product.stockCount ?? 0) <= 0}
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="px-2 py-0.5 text-zinc-400 hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-white tabular-nums">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            // 5. STEP 2: CHECKOUT TRANSPARENTE MERCADO PAGO FORM
            ) : (
              <div className="space-y-4">
                
                {/* Order Summary Strip */}
                <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-zinc-400 block">{items.reduce((s, i) => s + i.quantity, 0)} itens no carrinho</span>
                    <strong className="text-white font-oswald text-base">Total: R$ {total.toFixed(2).replace('.', ',')}</strong>
                  </div>
                  <button
                    onClick={() => setStep('cart')}
                    className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Ver detalhes
                  </button>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePaymentMethod('card');
                      setErrorMessage(null);
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activePaymentMethod === 'card'
                        ? 'bg-[#009EE3] text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cartão de Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePaymentMethod('pix');
                      setErrorMessage(null);
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activePaymentMethod === 'pix'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pix (-5% OFF)</span>
                  </button>
                </div>

                {/* CREDIT CARD TRANSPARENT CHECKOUT */}
                {activePaymentMethod === 'card' && (
                  <div className="space-y-3">
                    
                    {/* Visual Card Preview */}
                    <div className="relative h-44 rounded-2xl p-4 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black border border-zinc-700/80 shadow-xl overflow-hidden flex flex-col justify-between text-white">
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-red-600/10 blur-xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#E50914] font-oswald">
                          STREET STORE OFFICIAL
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          {cardBrand !== 'unknown' ? cardBrand.toUpperCase() : 'CARTÃO'}
                        </span>
                      </div>

                      {/* Chip & Contactless */}
                      <div className="w-9 h-7 rounded bg-amber-400/80 border border-amber-300/60 shadow-inner flex items-center justify-center">
                        <div className="w-6 h-4 border border-amber-600/50 rounded-sm" />
                      </div>

                      {/* Card Number */}
                      <div className="font-mono text-base tracking-widest font-semibold">
                        {cardNumber ? cardNumber : '•••• •••• •••• ••••'}
                      </div>

                      <div className="flex items-end justify-between text-xs">
                        <div>
                          <span className="text-[9px] text-zinc-400 block uppercase">Titular</span>
                          <span className="font-bold tracking-wider truncate max-w-[180px] block">
                            {cardholderName ? cardholderName : 'SEU NOME AQUI'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 block uppercase">Validade</span>
                          <span className="font-mono font-bold">
                            {cardExpiration ? cardExpiration : 'MM/AA'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <form onSubmit={handleProcessCardPayment} className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          Número do Cartão de Crédito
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="0000 0000 0000 0000"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#009EE3]"
                          />
                          <CreditCard className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          Nome Impresso no Cartão
                        </label>
                        <input
                          type="text"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                          placeholder="EX: JOÃO DA SILVA"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-[#009EE3]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                            Validade (MM/AA)
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiration}
                            onChange={(e) => setCardExpiration(formatExpiration(e.target.value))}
                            placeholder="12/28"
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 font-mono text-center focus:outline-none focus:border-[#009EE3]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                            CVV (Segurança)
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 font-mono text-center focus:outline-none focus:border-[#009EE3]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          Número de Parcelas
                        </label>
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#009EE3] cursor-pointer"
                        >
                          <option value={1}>1x de R$ {total.toFixed(2).replace('.', ',')} à vista (Sem juros)</option>
                          <option value={2}>2x de R$ {(total / 2).toFixed(2).replace('.', ',')} sem juros</option>
                          <option value={3}>3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros</option>
                          <option value={4}>4x de R$ {(total / 4).toFixed(2).replace('.', ',')} sem juros</option>
                          <option value={5}>5x de R$ {(total / 5).toFixed(2).replace('.', ',')} sem juros</option>
                          <option value={6}>6x de R$ {(total / 6).toFixed(2).replace('.', ',')} sem juros</option>
                        </select>
                      </div>

                      {/* Customer Info */}
                      <div className="pt-2 border-t border-zinc-800 space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Dados do Titular para Emissão do Comprovante
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              maxLength={14}
                              value={customerCpf}
                              onChange={(e) => setCustomerCpf(formatCpf(e.target.value))}
                              placeholder="CPF: 000.000.000-00"
                              className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#009EE3]"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              maxLength={15}
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                              placeholder="WhatsApp: (31) 99999-9999"
                              className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#009EE3]"
                            />
                          </div>
                        </div>

                        <div>
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="Seu melhor e-mail para confirmação"
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#009EE3]"
                          />
                        </div>
                      </div>

                      {/* Error Message */}
                      {errorMessage && (
                        <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl bg-[#009EE3] hover:bg-[#0089c7] text-white font-black text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-lg shadow-sky-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processando pagamento seguro...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>FINALIZAR PAGAMENTO · R$ {total.toFixed(2).replace('.', ',')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* PIX TRANSPARENT CHECKOUT */}
                {activePaymentMethod === 'pix' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>5% de Desconto Imediato com Pix!</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        O código QR Code oficial é gerado diretamente aqui na tela para você pagar e ter aprovação instantânea.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          Seu Nome Completo
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ex: João da Silva"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          CPF do Titular da Compra
                        </label>
                        <input
                          type="text"
                          maxLength={14}
                          value={customerCpf}
                          onChange={(e) => setCustomerCpf(formatCpf(e.target.value))}
                          placeholder="000.000.000-00"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          E-mail para Envio do Comprovante
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleGeneratePix}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Gerando Pix Seguro...</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4" />
                          <span>GERAR PIX DIRETO · R$ {total.toFixed(2).replace('.', ',')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Trust Footer */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pt-2 border-t border-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#009EE3]" />
                  <span>Ambiente 100% Seguro & Criptografia SSL 256-bit</span>
                </div>

              </div>
            )}

          </div>

          {/* FOOTER FOR STEP 1: CART REVIEW */}
          {items.length > 0 && step === 'cart' && !paymentApproved && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 space-y-3 shrink-0">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Cupom (ex: STREETVIP)"
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Aplicar
                </button>
              </form>

              {couponMessage && (
                <p className={`text-[11px] ${appliedDiscount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {couponMessage}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400 border-t border-zinc-800/80 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white tabular-nums">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Cupom ({appliedDiscount}%):</span>
                    <span className="tabular-nums">- R$ {((subtotal * appliedDiscount) / 100).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span className="tabular-nums">
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-400 font-bold">Grátis</strong>
                    ) : (
                      `R$ ${shippingFee.toFixed(2).replace('.', ',')}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Estimado:</span>
                  <div className="text-right">
                    <span className="text-lg text-white font-black tabular-nums font-oswald">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-normal">
                      em até 6x de R$ ${(total / 6).toFixed(2).replace('.', ',')} sem juros
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Step CTA */}
              <div className="space-y-2 pt-1">
                {items.some(it => (it.product.stockCount ?? 0) <= 0) ? (
                  <div className="space-y-1">
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed opacity-75 flex items-center justify-center gap-2"
                    >
                      <span>REMOVA ITENS SEM ESTOQUE PARA CONTINUAR</span>
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center">
                      Itens com 0 estoque aguardam reposição automática na Nuvemshop / Bling.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white font-black text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>IR PARA O PAGAMENTO DIRETO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-400 py-0.5">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-[#009EE3]" /> Até 6x sem juros
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <QrCode className="w-3 h-3" /> Pix -5% OFF
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-zinc-400" /> Checkout Seguro
                  </span>
                </div>

                {/* WhatsApp Quick Help */}
                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dúvidas? Falar com consultor no WhatsApp</span>
                </button>
              </div>

            </div>
          )}

        </motion.div>

      </div>
    </div>
  );
}
