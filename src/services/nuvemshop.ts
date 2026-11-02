import { Product } from '../types';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { cleanDescription } from '../lib/cleanHtml';

export interface NuvemshopStatus {
  connected: boolean;
  storeName?: string;
  storeUrl?: string;
  count?: number;
  lastSync?: string;
}

export interface TrackedOrderProduct {
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image?: string;
}

export interface TrackedOrder {
  orderNumber: string;
  orderId: number;
  status: 'open' | 'closed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'voided' | 'refunded';
  shippingStatus: 'unshipped' | 'shipped' | 'delivered' | 'unpacked';
  shippingCarrier: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress?: {
    name?: string;
    address: string;
    number: string;
    locality: string;
    city: string;
    province: string;
    zipcode: string;
    country?: string;
  };
  products: TrackedOrderProduct[];
  total: number;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
}

export interface ReturnRequestResult {
  success: boolean;
  protocol?: string;
  message?: string;
  error?: string;
}

/**
 * Fetch live products from Nuvemshop via backend proxy
 */
export async function getLiveCatalog(): Promise<{
  products: Product[];
  isLive: boolean;
  statusText: string;
}> {
  try {
    const res = await fetch('/api/nuvemshop/products', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Servidor respondeu com status ${res.status}`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      const sanitizedProducts = data.products.map((p: Product) => ({
        ...p,
        description: cleanDescription(p.description),
      }));
      return {
        products: sanitizedProducts,
        isLive: true,
        statusText: `Catálogo Oficial Ativo (${sanitizedProducts.length} peças em estoque)`,
      };
    }

    // If empty list, use fallback products
    return {
      products: FALLBACK_PRODUCTS,
      isLive: false,
      statusText: 'Catálogo de Drops Street Store Oficial',
    };
  } catch (error) {
    console.warn('Usando catálogo local de reserva:', error);
    return {
      products: FALLBACK_PRODUCTS,
      isLive: false,
      statusText: 'Catálogo de Drops Street Store Oficial',
    };
  }
}

/**
 * Check Nuvemshop store status
 */
export async function checkNuvemshopStatus(): Promise<NuvemshopStatus> {
  try {
    const res = await fetch('/api/nuvemshop/status');
    if (!res.ok) throw new Error('Status failed');
    const data = await res.json();
    return {
      connected: data.connected ?? true,
      storeName: data.name || 'Street Store',
      storeUrl: data.url || 'https://www.streetstore.com.br',
      lastSync: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch {
    return {
      connected: false
    };
  }
}

/**
 * Track an order via Nuvemshop & Melhor Envio
 */
export async function trackOrder(query: string): Promise<{
  success: boolean;
  orders: TrackedOrder[];
  message?: string;
  error?: string;
}> {
  try {
    const cleanQuery = encodeURIComponent(query.trim().replace(/^#/, ''));
    const res = await fetch(`/api/nuvemshop/orders/track?q=${cleanQuery}`);
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      orders: [],
      error: error.message || 'Falha ao buscar pedido no sistema Nuvemshop / Melhor Envio'
    };
  }
}

/**
 * Request exchange or return for an order (Melhor Envio Logística Reversa)
 */
export async function requestOrderReturn(params: {
  orderId: number;
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  reason: string;
  actionRequested: string;
  selectedItems: string[];
  details: string;
}): Promise<ReturnRequestResult> {
  try {
    const res = await fetch(`/api/nuvemshop/orders/${params.orderId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao registrar solicitação de devolução'
    };
  }
}
