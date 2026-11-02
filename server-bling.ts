import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Bling API v3 Constants
const BLING_AUTH_BASE = 'https://www.bling.com.br/Api/v3/oauth/authorize';
const BLING_TOKEN_URL = 'https://api.bling.com.br/v3/oauth/token';
const BLING_API_BASE = 'https://api.bling.com.br/v3';

const TOKENS_FILE = path.resolve(process.cwd(), '.bling_tokens.json');

export interface BlingTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  obtained_at: number; // timestamp in ms
}

// In-memory cache
let cachedTokens: BlingTokens | null = null;

// Read tokens from disk
export function loadBlingTokens(): BlingTokens | null {
  if (cachedTokens) return cachedTokens;
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, 'utf-8');
      cachedTokens = JSON.parse(raw);
      return cachedTokens;
    }
  } catch (err) {
    console.warn('[Bling] Could not read token file:', err);
  }
  return null;
}

// Save tokens to disk & cache
export function saveBlingTokens(tokens: BlingTokens): void {
  cachedTokens = tokens;
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log('[Bling] Tokens saved successfully.');
  } catch (err) {
    console.error('[Bling] Could not save tokens to disk:', err);
  }
}

// Clear tokens
export function clearBlingTokens(): void {
  cachedTokens = null;
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      fs.unlinkSync(TOKENS_FILE);
    }
  } catch (err) {
    console.warn('[Bling] Could not delete token file:', err);
  }
}

function getClientCredentials() {
  const clientId = process.env.BLING_CLIENT_ID || '66ada183edd39b7215178f3d05bbb4b13c013fdd';
  const clientSecret = process.env.BLING_CLIENT_SECRET || '92efd4ff0b3ca6219adf7ecdc2df633bece0925c4f4c888f071065eaa046';
  const state = process.env.BLING_STATE || '2b41de06512249e4b701e9c4fcdcef0e';
  return { clientId, clientSecret, state };
}

/**
 * Exchange Authorization Code for Access & Refresh Tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri?: string): Promise<BlingTokens> {
  const { clientId, clientSecret } = getClientCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'authorization_code');
  bodyParams.append('code', code.trim());
  if (redirectUri) {
    bodyParams.append('redirect_uri', redirectUri);
  }

  console.log(`[Bling] Exchanging code for token with client_id: ${clientId}`);

  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '1.0'
    },
    body: bodyParams.toString()
  });

  const responseText = await res.text();
  let json: any;
  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(`Bling token endpoint returned non-JSON [${res.status}]: ${responseText}`);
  }

  if (!res.ok || json.error) {
    console.error('[Bling Token Error]:', json);
    const errDesc = json.error?.message || json.error_description || json.error || responseText;
    throw new Error(`Erro Bling OAuth: ${errDesc}`);
  }

  const tokenData: BlingTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_in: json.expires_in || 21600,
    token_type: json.token_type || 'Bearer',
    scope: json.scope || '',
    obtained_at: Date.now()
  };

  saveBlingTokens(tokenData);
  return tokenData;
}

/**
 * Refresh expired access token
 */
export async function refreshBlingToken(): Promise<BlingTokens> {
  const tokens = loadBlingTokens();
  if (!tokens?.refresh_token) {
    throw new Error('Nenhum refresh_token disponível para renovar sessão do Bling.');
  }

  const { clientId, clientSecret } = getClientCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'refresh_token');
  bodyParams.append('refresh_token', tokens.refresh_token);

  console.log('[Bling] Refreshing token...');

  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '1.0'
    },
    body: bodyParams.toString()
  });

  const responseText = await res.text();
  let json: any;
  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(`Bling refresh endpoint returned non-JSON [${res.status}]: ${responseText}`);
  }

  if (!res.ok || json.error) {
    const errorMsg = json.error?.message || json.error_description || json.error || responseText;
    const isInvalidGrant = String(errorMsg).includes('invalid_grant') || String(responseText).includes('invalid_grant');
    
    if (isInvalidGrant) {
      console.warn('[Bling] Refresh token inválido ou expirado (invalid_grant). Limpando tokens locais.');
      clearBlingTokens();
    }
    throw new Error(`Erro ao renovar token Bling: ${errorMsg}`);
  }

  const newTokens: BlingTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token || tokens.refresh_token,
    expires_in: json.expires_in || 21600,
    token_type: json.token_type || 'Bearer',
    scope: json.scope || tokens.scope,
    obtained_at: Date.now()
  };

  saveBlingTokens(newTokens);
  return newTokens;
}

/**
 * Get a valid access token (refreshes automatically if expired)
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = loadBlingTokens();
  if (!tokens?.access_token) {
    throw new Error('Bling ERP não conectado. Por favor, autorize a conexão via OAuth.');
  }

  const expiresInMs = (tokens.expires_in || 21600) * 1000;
  const isExpired = Date.now() - tokens.obtained_at >= expiresInMs - 120000; // 2 min safety margin

  if (isExpired) {
    if (tokens.refresh_token) {
      try {
        const refreshed = await refreshBlingToken();
        return refreshed.access_token;
      } catch (err: any) {
        const isInvalidGrant = String(err?.message || '').includes('invalid_grant');
        if (isInvalidGrant) {
          throw new Error('Sessão do Bling expirada (invalid_grant). Por favor, reconecte via OAuth.');
        }
        console.warn('[Bling] Falha ao renovar token:', err?.message || err);
        return tokens.access_token;
      }
    } else {
      clearBlingTokens();
      throw new Error('Sessão do Bling expirada sem refresh token. Por favor, reconecte via OAuth.');
    }
  }

  return tokens.access_token;
}

/**
 * Fetch authenticated resource from Bling v3 API
 */
export async function fetchFromBling(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getValidAccessToken();
  const url = endpoint.startsWith('http') ? endpoint : `${BLING_API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    // If 401 unauthorized, try one refresh only if tokens exist and refresh hasn't cleared them
    if (res.status === 401) {
      const currentTokens = loadBlingTokens();
      if (currentTokens?.refresh_token) {
        console.log('[Bling] 401 recebido. Tentando renovação de token...');
        try {
          const refreshed = await refreshBlingToken();
          const retryRes = await fetch(url, {
            ...options,
            headers: {
              'Authorization': `Bearer ${refreshed.access_token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              ...(options.headers || {})
            }
          });
          if (retryRes.ok) return retryRes.json();
        } catch (refreshErr: any) {
          console.warn('[Bling] Tentativa de renovação pós-401 cancelada:', refreshErr?.message || refreshErr);
        }
      }
    }
    throw new Error(`Bling API [${res.status}]: ${errorText}`);
  }

  return res.json();
}

/**
 * Register all Bling ERP routes on the Express app
 */
export function registerBlingRoutes(app: express.Express) {
  const { clientId, state } = getClientCredentials();

  // 1. Get OAuth Authorization URL
  app.get('/api/bling/auth-url', (req: Request, res: Response) => {
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/auth/callback`;

    // Construct authorization URL
    const authUrl = `${BLING_AUTH_BASE}?response_type=code&client_id=${clientId}&state=${state}`;

    res.json({
      url: authUrl,
      redirectUri,
      clientId,
      state
    });
  });

  // 2. OAuth Callback Route (popup sends postMessage to opener and closes)
  app.get(['/auth/callback', '/auth/callback/'], async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const reqState = req.query.state as string;
    const error = req.query.error as string;

    console.log(`[Bling Callback] Received code: ${code ? code.slice(0, 8) + '...' : 'none'}, state: ${reqState}, error: ${error}`);

    if (error) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Erro de Autenticação Bling</title>
            <style>
              body { background: #0E0E0E; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #181818; border: 1px solid #333; border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; }
              h2 { color: #E50914; margin-top: 0; }
              p { color: #888; font-size: 14px; }
              button { background: #E50914; color: #fff; border: 0; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Falha na Autorização</h2>
              <p>O Bling retornou o seguinte erro: ${error}</p>
              <button onclick="window.close()">Fechar Janela</button>
            </div>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><title>Código não informado</title></head>
          <body style="background:#0E0E0E;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="background:#181818;border:1px solid #333;border-radius:16px;padding:32px;text-align:center;">
              <h3 style="color:#E50914;">Nenhum código de autorização recebido</h3>
              <p style="color:#888;">Por favor, tente autorizar novamente pela Street Store.</p>
              <button onclick="window.close()" style="background:#333;color:#fff;border:0;padding:8px 16px;border-radius:8px;cursor:pointer;">Fechar</button>
            </div>
          </body>
        </html>
      `);
    }

    try {
      // Exchange authorization code for token
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${appUrl}/auth/callback`;
      
      const tokens = await exchangeCodeForTokens(code, redirectUri);

      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Bling ERP Conectado com Sucesso</title>
            <style>
              body {
                background: #0E0E0E;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .card {
                background: #141414;
                border: 1px solid #282828;
                border-radius: 16px;
                padding: 40px;
                max-width: 440px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
              }
              .badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 60px;
                height: 60px;
                background: #166534;
                color: #4ade80;
                border-radius: 50%;
                font-size: 28px;
                margin-bottom: 20px;
              }
              h2 {
                font-size: 20px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 0 0 8px 0;
                color: #fff;
              }
              p {
                color: #9ca3af;
                font-size: 13px;
                line-height: 1.5;
                margin: 0 0 20px 0;
              }
              .status {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #22c55e;
                font-weight: 700;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="badge">✓</div>
              <h2>Bling ERP Conectado!</h2>
              <p>Sua conta da Street Store agora está autorizada e sincronizada com o Bling ERP v3.</p>
              <div class="status">Sincronizando dados com o site...</div>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'bling' }, '*');
                  setTimeout(function() {
                    window.close();
                  }, 1200);
                } else {
                  setTimeout(function() {
                    window.location.href = '/';
                  }, 1500);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('[Bling Callback Exchange Error]:', err);
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><title>Erro na troca do token Bling</title></head>
          <body style="background:#0E0E0E;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="background:#181818;border:1px solid #441111;border-radius:16px;padding:32px;max-width:500px;text-align:center;">
              <h3 style="color:#E50914;">Erro ao trocar código por token no Bling</h3>
              <p style="color:#bbb;font-size:13px;">${err.message || String(err)}</p>
              <p style="color:#888;font-size:12px;">Dica: Verifique se a URL de redirecionamento está configurada no app do Bling ou cole o token manualmente no painel.</p>
              <button onclick="window.close()" style="background:#E50914;color:#fff;border:0;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">Fechar</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  // 3. Manual exchange of code via API
  app.post('/api/bling/exchange-code', async (req: Request, res: Response) => {
    try {
      const { code, redirectUri } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Parâmetro code é obrigatório' });
      }
      const tokens = await exchangeCodeForTokens(code, redirectUri);
      res.json({
        success: true,
        message: 'Conectado com sucesso ao Bling ERP!',
        tokens: {
          scope: tokens.scope,
          expires_in: tokens.expires_in,
          obtained_at: tokens.obtained_at
        }
      });
    } catch (err: any) {
      console.error('[API Exchange Error]:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Falha ao trocar código do Bling'
      });
    }
  });

  // 4. Manual set token (direct paste for instant connection)
  app.post('/api/bling/set-token', async (req: Request, res: Response) => {
    try {
      const { access_token, refresh_token, expires_in, scope } = req.body;
      if (!access_token) {
        return res.status(400).json({ error: 'access_token é obrigatório' });
      }

      const tokenData: BlingTokens = {
        access_token: access_token.trim(),
        refresh_token: refresh_token ? refresh_token.trim() : undefined,
        expires_in: Number(expires_in) || 21600,
        token_type: 'Bearer',
        scope: scope || '',
        obtained_at: Date.now()
      };

      saveBlingTokens(tokenData);

      res.json({
        success: true,
        message: 'Token do Bling configurado com sucesso!',
        status: {
          connected: true,
          expires_in: tokenData.expires_in
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Connection Status
  app.get('/api/bling/status', async (_req: Request, res: Response) => {
    const tokens = loadBlingTokens();
    if (!tokens || !tokens.access_token) {
      return res.json({
        connected: false,
        clientId,
        authorizeUrl: `${BLING_AUTH_BASE}?response_type=code&client_id=${clientId}&state=${state}`
      });
    }

    const expiresInMs = (tokens.expires_in || 21600) * 1000;
    const expiresAt = tokens.obtained_at + expiresInMs;
    const isExpired = Date.now() >= expiresAt;

    res.json({
      connected: true,
      clientId,
      scope: tokens.scope,
      hasRefreshToken: Boolean(tokens.refresh_token),
      isExpired,
      expiresAt: new Date(expiresAt).toISOString(),
      obtainedAt: new Date(tokens.obtained_at).toISOString()
    });
  });

  // 6. Fetch Products from Bling API v3 (Supports pulling up to 300 products)
  app.get('/api/bling/products', async (req: Request, res: Response) => {
    try {
      const pagina = req.query.pagina ? String(req.query.pagina) : '1';
      const limiteParam = parseInt(String(req.query.limite || '100'), 10);
      const fetchAll = req.query.all === 'true' || req.query.todos === 'true' || limiteParam > 100 || (!req.query.pagina && !req.query.limite);

      let rawProducts: any[] = [];
      if (fetchAll) {
        // Fetch up to 3 pages (300 items max from Bling ERP inventory)
        for (let p = 1; p <= 3; p++) {
          try {
            const pageData = await fetchFromBling(`/produtos?pagina=${p}&limite=100`);
            const items = pageData?.data || [];
            if (items.length > 0) rawProducts.push(...items);
            if (items.length < 100) break;
          } catch {
            break;
          }
        }
      } else {
        const data = await fetchFromBling(`/produtos?pagina=${pagina}&limite=${limiteParam}`);
        rawProducts = data?.data || [];
      }

      // Try to fetch stock balances if available
      let stockMap: Record<number, number> = {};
      try {
        const productIds = rawProducts.map((p: any) => p.id).filter(Boolean).slice(0, 50);
        if (productIds.length > 0) {
          const qs = productIds.map((id: number) => `idsProdutos[]=${id}`).join('&');
          const stockData = await fetchFromBling(`/estoques/saldos?${qs}`);
          (stockData.data || []).forEach((item: any) => {
            const pId = item.produto?.id;
            const balance = item.saldoFisicoTotal ?? item.saldoFisico ?? 0;
            if (pId) stockMap[pId] = balance;
          });
        }
      } catch (stockErr) {
        console.warn('[Bling] Could not fetch stock balances:', stockErr);
      }

      // Map to consistent format
      const formatted = rawProducts.map((p: any) => ({
        id: `bling-${p.id}`,
        blingId: p.id,
        name: p.nome,
        code: p.codigo,
        sku: p.codigo,
        price: p.preco || 0,
        stock: stockMap[p.id] ?? (p.estoque?.saldoFisico ?? 10),
        status: p.situacao,
        format: p.formato,
        type: p.tipo,
        shortDescription: p.descricaoCurta || '',
        imageUrl: p.imagemURL || p.anexos?.[0]?.url || '',
      }));

      res.json({
        success: true,
        count: formatted.length,
        products: formatted,
        rawCount: rawProducts.length
      });
    } catch (err: any) {
      console.error('[Bling Products Error]:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Falha ao buscar produtos do Bling ERP',
        connected: Boolean(loadBlingTokens())
      });
    }
  });

  // 7. Fetch Sales Orders from Bling API v3
  app.get('/api/bling/orders', async (req: Request, res: Response) => {
    try {
      const pagina = req.query.pagina || '1';
      const limite = req.query.limite || '50';

      const data = await fetchFromBling(`/pedidos/vendas?pagina=${pagina}&limite=${limite}`);
      const rawOrders = data.data || [];

      const formatted = rawOrders.map((o: any) => ({
        id: o.id,
        numero: o.numero,
        data: o.data,
        total: o.total,
        situacao: o.situacao?.valor || o.situacao?.id || 'Pendente',
        cliente: o.contato?.nome || 'Cliente Street Store',
        documento: o.contato?.numeroDocumento || '',
        itens: (o.itens || []).map((it: any) => ({
          codigo: it.codigo,
          descricao: it.descricao,
          quantidade: it.quantidade,
          valor: it.valor
        }))
      }));

      res.json({
        success: true,
        count: formatted.length,
        orders: formatted
      });
    } catch (err: any) {
      console.error('[Bling Orders Error]:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Falha ao buscar pedidos do Bling ERP'
      });
    }
  });

  // 8. Fetch Stock Balances
  app.get('/api/bling/stock', async (_req: Request, res: Response) => {
    try {
      const data = await fetchFromBling('/estoques/saldos?pagina=1&limite=100');
      res.json({
        success: true,
        stock: data.data || []
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Falha ao buscar estoque do Bling'
      });
    }
  });

  // 9. Disconnect / Logout Bling
  app.post('/api/bling/disconnect', (_req: Request, res: Response) => {
    clearBlingTokens();
    res.json({ success: true, message: 'Bling desconectado com sucesso.' });
  });
}
