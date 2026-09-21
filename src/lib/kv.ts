/**
 * Vercel KV & Upstash Redis REST Adapter
 * Allows persistent cloud storage on Vercel without a database or heavy npm packages.
 */

export function isCloudKvEnabled(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return !!(url && token);
}

function getKvEndpoint(): { url: string; token: string } {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  return { url, token };
}

export async function kvGet(key: string): Promise<string | null> {
  const { url, token } = getKvEndpoint();
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['GET', key]),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`KV GET ${key} returned status ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.result ?? null;
  } catch (err) {
    console.error(`KV GET ${key} error:`, err);
    return null;
  }
}

export async function kvSet(key: string, value: string): Promise<boolean> {
  const { url, token } = getKvEndpoint();
  if (!url || !token) return false;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SET', key, value]),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`KV SET ${key} returned status ${res.status}`);
      return false;
    }

    const json = await res.json();
    return json.result === 'OK';
  } catch (err) {
    console.error(`KV SET ${key} error:`, err);
    return false;
  }
}

export async function kvDel(key: string): Promise<boolean> {
  const { url, token } = getKvEndpoint();
  if (!url || !token) return false;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['DEL', key]),
      cache: 'no-store',
    });

    if (!res.ok) return false;
    const json = await res.json();
    return json.result > 0;
  } catch (err) {
    console.error(`KV DEL ${key} error:`, err);
    return false;
  }
}

