// =============================================
// Plan+B API Client
// يتواصل مع الـ Backend PHP على XAMPP / Coolify
// =============================================
// Improvements:
// ✅ Request timeout (30 seconds)
// ✅ Better error handling with specific messages
// ✅ Response size awareness

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost/myapp/api/index.php';

// Request timeout in milliseconds
const REQUEST_TIMEOUT_MS = 30000;

// -----------------------------------------------
// Helper: fetch with timeout
// -----------------------------------------------
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('انتهت مهلة الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// -----------------------------------------------
// دالة مساعدة للطلبات
// -----------------------------------------------
async function apiFetch(route: string, options: RequestInit = {}, params: Record<string, string> = {}): Promise<any> {
  const token = localStorage.getItem('flowlite_token');
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set('route', route);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(url.toString(), { ...options, headers }, REQUEST_TIMEOUT_MS);
  } catch (err: any) {
    // Network error (no internet, server down, etc.)
    if (err.message.includes('مهلة')) throw err;
    throw new Error('فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
  }

  let data: any;
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (err) {
      throw new Error('فشل في قراءة بيانات الاستجابة من الخادم.');
    }
  } else {
    // الاستجابة ليست JSON (ربما صفحة خطأ HTML أو خطأ من السيرفر)
    const text = await res.text();
    console.error('Non-JSON response from server:', text);

    if (text.includes('mysqli_real_connect') || text.includes('database') || text.includes('قاعدة البيانات') || text.includes('Access denied')) {
      throw new Error('فشل الخادم في الاتصال بقاعدة البيانات. يرجى التحقق من متغيرات البيئة (DB_HOST, DB_USER, DB_PASS, DB_NAME) في لوحة تحكم Coolify.');
    }

    throw new Error(`استجابة غير صالحة من الخادم (Error ${res.status}). قد يكون ذلك بسبب عدم اكتمال عملية البناء (Deployment) أو عطل مؤقت.`);
  }

  if (!data.success && res.status !== 200) {
    throw new Error(data.error || 'حدث خطأ في الطلب');
  }

  return data.data ?? data;
}

// =============================================
// المصادقة (Auth)
// =============================================
export const auth = {
  async register(name: string, email: string, password: string) {
    const data = await apiFetch('auth', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }, { action: 'register' });
    localStorage.setItem('flowlite_token', data.token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiFetch('auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, { action: 'login' });
    localStorage.setItem('flowlite_token', data.token);
    return data;
  },

  async logout() {
    await apiFetch('auth', { method: 'POST' }, { action: 'logout' });
    localStorage.removeItem('flowlite_token');
  },

  async me() {
    return await apiFetch('auth', {}, { action: 'me' });
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('flowlite_token');
  },
};

// =============================================
// المشاريع (Projects)
// =============================================
export const projects = {
  async list() {
    return await apiFetch('projects');
  },

  async get(id: number) {
    return await apiFetch('projects', {}, { id: String(id) });
  },

  async create(name: string, nodes: any[] = [], edges: any[] = []) {
    return await apiFetch('projects', {
      method: 'POST',
      body: JSON.stringify({ name, nodes, edges }),
    });
  },

  async save(id: number, name: string, nodes: any[], edges: any[]) {
    return await apiFetch('projects', {
      method: 'PUT',
      body: JSON.stringify({ name, nodes, edges }),
    }, { id: String(id) });
  },

  async delete(id: number) {
    return await apiFetch('projects', { method: 'DELETE' }, { id: String(id) });
  },
};

// =============================================
// الإعدادات (Settings)
// =============================================
export const settings = {
  async get() {
    return await apiFetch('settings');
  },

  async save(data: { api_key?: string; theme?: 'light' | 'dark'; language?: string }) {
    return await apiFetch('settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export default { auth, projects, settings };
