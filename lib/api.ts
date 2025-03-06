// lib/api.ts
export const apiFetch = async (
    endpoint: string,
    method: string,
    body?: Record<string, any>
  ) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  };