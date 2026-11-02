export interface MercadoPagoPreferenceResponse {
  success: boolean;
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  error?: string;
}

export interface MercadoPagoPixResponse {
  success: boolean;
  paymentId?: number | string;
  status?: string;
  statusDetail?: string;
  amount?: number;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  expiresAt?: string;
  fallbackToPreference?: boolean;
  initPoint?: string;
  error?: string;
}

export interface MercadoPagoStatusResponse {
  connected: boolean;
  publicKey?: string;
  clientId?: string;
  siteId?: string;
  nickname?: string;
  error?: string;
}

// Check Mercado Pago connectivity
export async function checkMercadoPagoStatus(): Promise<MercadoPagoStatusResponse> {
  try {
    const res = await fetch('/api/mercadopago/status');
    return await res.json();
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Erro de conexão com Mercado Pago'
    };
  }
}

// Create Mercado Pago Checkout Pro Preference (Cards, Boleto, MP Balance)
export async function createCheckoutPreference(params: {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    image?: string;
  }>;
  payer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  discountAmount?: number;
}): Promise<MercadoPagoPreferenceResponse> {
  try {
    const res = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Falha ao iniciar checkout Mercado Pago'
    };
  }
}

// Generate direct Mercado Pago Pix with real QR code
export async function createDirectPix(params: {
  amount: number;
  description?: string;
  payer?: {
    name?: string;
    email?: string;
    cpf?: string;
    phone?: string;
  };
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    variantId?: number;
  }>;
  shippingAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}): Promise<MercadoPagoPixResponse> {
  try {
    const res = await fetch('/api/mercadopago/create-pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Falha ao gerar Pix no Mercado Pago'
    };
  }
}

// Check payment status by ID (Strict real status query)
export async function getPaymentStatus(paymentId: string | number): Promise<{
  success: boolean;
  approved: boolean;
  status?: string;
  statusDetail?: string;
  dateApproved?: string;
  nuvemOrderNumber?: string;
  nuvemOrderId?: number;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/mercadopago/payment-status/${paymentId}`);
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      approved: false,
      error: error.message || 'Falha ao consultar status de pagamento'
    };
  }
}

// Confirm Pix payment (Strict validation with Mercado Pago API)
export async function confirmPixPayment(paymentId: string | number): Promise<{
  success: boolean;
  approved: boolean;
  status?: string;
  statusDetail?: string;
  message?: string;
  nuvemOrderNumber?: string;
  nuvemOrderId?: number;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/mercadopago/confirm-pix/${paymentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true })
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      approved: false,
      error: error.message || 'Falha ao validar pagamento no Mercado Pago'
    };
  }
}

export interface TransparentCardPaymentParams {
  cardData?: {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: string;
    expirationYear: string;
    securityCode: string;
    cpf?: string;
  };
  token?: string;
  transactionAmount: number;
  installments?: number;
  paymentMethodId?: string;
  description?: string;
  payer: {
    name?: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    variantId?: number;
  }>;
  shippingAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface TransparentCardPaymentResponse {
  success: boolean;
  paymentId?: number | string;
  status?: 'approved' | 'in_process' | 'rejected' | 'pending' | string;
  statusDetail?: string;
  amount?: number;
  installments?: number;
  paymentMethodId?: string;
  dateApproved?: string;
  nuvemOrderNumber?: string;
  nuvemOrderId?: number;
  error?: string;
}

// Process Transparent Credit Card Payment (Checkout Transparente)
export async function processTransparentCardPayment(
  params: TransparentCardPaymentParams
): Promise<TransparentCardPaymentResponse> {
  try {
    const res = await fetch('/api/mercadopago/process-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Falha de comunicação ao processar cartão'
    };
  }
}
