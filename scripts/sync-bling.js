import dotenv from 'dotenv';
dotenv.config();

const code = process.argv[2];

if (!code) {
  console.log('Uso: node scripts/sync-bling.js <CODIGO_AUTORIZACAO_OU_TOKEN>');
  process.exit(1);
}

const clientId = process.env.BLING_CLIENT_ID || '66ada183edd39b7215178f3d05bbb4b13c013fdd';
const clientSecret = process.env.BLING_CLIENT_SECRET || '92efd4ff0b3ca6219adf7ecdc2df633bece0925c4f4c888f071065eaa046';
const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

async function run() {
  let cleanCode = code.trim();
  if (cleanCode.includes('code=')) {
    const params = new URLSearchParams(cleanCode.split('?')[1] || cleanCode);
    cleanCode = params.get('code') || cleanCode;
  }

  console.log('Trocando código no Bling:', cleanCode);

  try {
    const res = await fetch('https://api.bling.com.br/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '1.0'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: cleanCode
      }).toString()
    });

    const json = await res.json();
    console.log('Resposta do Bling:', json);

    if (json.access_token) {
      const fs = await import('fs');
      const tokenData = {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_in: json.expires_in || 21600,
        token_type: json.token_type || 'Bearer',
        scope: json.scope || '',
        obtained_at: Date.now()
      };
      fs.writeFileSync('.bling_tokens.json', JSON.stringify(tokenData, null, 2));
      console.log('✅ Tokens salvos em .bling_tokens.json!');

      // Test product fetch
      const prodRes = await fetch('https://api.bling.com.br/v3/produtos?pagina=1&limite=100', {
        headers: {
          'Authorization': `Bearer ${json.access_token}`,
          'Accept': 'application/json'
        }
      });
      const prodJson = await prodRes.json();
      console.log(`📦 Produtos encontrados no Bling: ${prodJson.data?.length || 0}`);
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

run();
