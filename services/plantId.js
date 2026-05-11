const SERVER_URL = 'https://plant-id-proxy.onrender.com';

let cachedToken = null;

async function ensureToken() {
  if (cachedToken) return;

  const response = await fetch(`${SERVER_URL}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to obtain session token: ${text}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
}

export async function identifyPlant(base64Image) {
  await ensureToken();

  const response = await fetch(`${SERVER_URL}/identify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cachedToken}`,
    },
    body: JSON.stringify({ image_base64: base64Image }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error: ${errorText}`);
  }

  const data = await response.json();
  return data.result ?? null;
}
