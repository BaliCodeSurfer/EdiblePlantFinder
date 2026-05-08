// API key can be stolen from the client easily.
// TODO: move this behind your own server so the secret never ships to the device.
// Your mobile/web app should send the photo to your server, the server adds the
// API key and forwards the request to Kindwise, then returns the result.
const API_KEY = 'rjgibOFK8LZgUbeVOqbabGfFxKOjnDRrYqo371YiRGnrJX2zkT';

const ENDPOINT =
  'https://api.plant.id/v3/identification?details=common_names,edible_parts,toxicity,description,url';

export function hasApiKey() {
  return Boolean(API_KEY);
}

export async function identifyPlant(base64Image) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Api-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: [`data:image/jpeg;base64,${base64Image}`],
      classification_level: 'all',
    }),
  });

  const responseText = await response.text();
  console.log('Status:', response.status);
  console.log('Raw response from Plant.id:', responseText);

  if (!response.ok) {
    throw new Error(`Plant.id API error ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return data.result ?? null;
}
