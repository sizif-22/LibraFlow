const BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError extends Error {
  response?: ApiResponse;
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const isFormData = options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;
  
  const isAuthPath = path.startsWith('/auth/');
  
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token && !isAuthPath ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  } as Record<string, string>;


  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data: T;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      data = (await response.text()) as unknown as T;
    }
  } else {
    data = (await response.text()) as unknown as T;
  }


  if (!response.ok) {
    // If unauthorized and we were sending a token, clear it to prevent infinite loops
    if (response.status === 401 && token && !isAuthPath && typeof window !== 'undefined') {
      console.log('401 Unauthorized detected on:', path, 'Triggering global logout.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth-error', { detail: { token } }));
    }






    let message = response.statusText || 'Request failed';
    if (data && typeof data === 'object' && 'message' in data && typeof (data as Record<string, unknown>).message === 'string') {
      message = (data as { message: string }).message;
    }
    const error = new Error(message) as ApiError;

    error.response = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
    throw error;
  }


  return { 
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
}



const api = {
  get: (path: string, options?: RequestInit) => 
    request(path, { ...options, method: 'GET' }),
  
  post: <T = unknown>(path: string, body?: unknown, options?: RequestInit) => 
    request<T>(path, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),

  
  put: <T = unknown>(path: string, body?: unknown, options?: RequestInit) => 
    request<T>(path, { 
      ...options, 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),

  
  delete: (path: string, options?: RequestInit) => 
    request(path, { ...options, method: 'DELETE' }),

  patch: <T = unknown>(path: string, body?: unknown, options?: RequestInit) => 
    request<T>(path, { 
      ...options, 
      method: 'PATCH', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),

};

export default api;

