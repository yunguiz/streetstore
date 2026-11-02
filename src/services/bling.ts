export interface BlingStatus {
  connected: boolean;
  clientId?: string;
  scope?: string;
  hasRefreshToken?: boolean;
  isExpired?: boolean;
  expiresAt?: string;
  obtainedAt?: string;
  authorizeUrl?: string;
}

export interface BlingProduct {
  id: string;
  blingId: number;
  name: string;
  code: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  format?: string;
  type?: string;
  shortDescription?: string;
  imageUrl?: string;
}

export interface BlingOrder {
  id: number;
  numero: number;
  data: string;
  total: number;
  situacao: string | number;
  cliente: string;
  documento?: string;
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valor: number;
  }>;
}

export async function getBlingStatus(): Promise<BlingStatus> {
  const res = await fetch('/api/bling/status');
  if (!res.ok) {
    throw new Error('Falha ao obter status do Bling');
  }
  return res.json();
}

export async function getBlingAuthUrl(): Promise<{ url: string; redirectUri: string; clientId: string; state: string }> {
  const res = await fetch('/api/bling/auth-url');
  if (!res.ok) {
    throw new Error('Falha ao gerar URL de autorização do Bling');
  }
  return res.json();
}

export async function exchangeBlingCode(code: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/bling/exchange-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Falha ao autorizar código no Bling');
  }
  return data;
}

export async function setBlingToken(accessToken: string, refreshToken?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/bling/set-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Falha ao configurar token do Bling');
  }
  return data;
}

export async function getBlingProducts(): Promise<{ success: boolean; count: number; products: BlingProduct[] }> {
  const res = await fetch('/api/bling/products');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Falha ao buscar produtos no Bling');
  }
  return data;
}

export async function getBlingOrders(): Promise<{ success: boolean; count: number; orders: BlingOrder[] }> {
  const res = await fetch('/api/bling/orders');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Falha ao buscar pedidos no Bling');
  }
  return data;
}

export async function disconnectBling(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/bling/disconnect', { method: 'POST' });
  return res.json();
}
