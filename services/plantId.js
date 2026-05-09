const SERVER_URL = 'https://plant-id-proxy.onrender.com';

export async function identifyPlant(base64Image) {
  const response = await fetch(`${SERVER_URL}/identify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_base64: base64Image,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error: ${errorText}`);
  }

  const data = await response.json();
  return data.result ?? null;
}
