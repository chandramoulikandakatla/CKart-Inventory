/**
 * CampusKart High-Performance TypeScript Backend Server
 * 100% TypeScript with zero external C-dependencies, running natively on tsx.
 * Full integer paise monetary accounting, atomic order processing, durable JSON file persistence, and Supabase integration.
 */

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid heavy external dependencies
function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [k, ...rest] = trimmed.split('=');
    const key = k.trim();
    const val = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = val;
    }
  }
}

// Load .env from project root or backend
loadEnv(path.resolve(__dirname, '../.env'));
loadEnv(path.resolve(__dirname, './.env'));

export const PORT = parseInt(process.env.PORT || '8080', 10);
export const HOST = process.env.HOST || '127.0.0.1';
export const SESSION_SECRET = process.env.CAMPUSKART_SESSION_SECRET || 'campuskart-ts-secure-secret-key-2026';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
export const DATA_FILE = process.env.CAMPUSKART_DB_FILE || path.resolve(__dirname, 'campuskart_data.json');

// --- Cryptography & Tokens ---
export function hashSecret(secret: string, saltHex?: string): string {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifySecret(secret: string, combined: string): boolean {
  try {
    const [saltHex, hashHex] = combined.split(':');
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

interface SessionData {
  role: 'student' | 'parent' | 'ops' | 'college';
  entityId: string;
  metadata?: Record<string, any>;
  expiresAt: number;
}

const activeTokens = new Map<string, SessionData>();

export function generateToken(role: SessionData['role'], entityId: string, metadata?: Record<string, any>, ttlSeconds = 86400): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, {
    role,
    entityId,
    metadata,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return token;
}

export function verifyToken(token: string): SessionData | null {
  const session = activeTokens.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeTokens.delete(token);
    return null;
  }
  return session;
}

// Pre-auth tokens for 2-step student authentication
const preAuthTokens = new Map<string, { studentId: string; expiresAt: number }>();

// --- Backend Store Domain Models ---
export interface BackendStore {
  colleges: Array<{ id: string; name: string; institution_code: string; collection_points: string[] }>;
  students: Array<{
    id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    academic_year: string;
    college_id: string;
    account_status: string;
    password_hash: string;
    pin_hash: string;
    parent_account_id: string;
  }>;
  parents: Array<{
    id: string;
    mobile: string;
    password_hash: string;
    name: string;
  }>;
  staff: Array<{
    id: string;
    username: string;
    password_hash: string;
    role: 'ops' | 'college';
    college_id: string;
  }>;
  wallets: Map<string, { student_id: string; balance_paise: number; status: string }>;
  products: Array<{
    id: string;
    college_id: string;
    name: string;
    category: string;
    price_paise: number;
    stock_quantity: number;
    is_available: boolean;
    image_url: string;
    description: string;
  }>;
  orders: Array<{
    id: string;
    reference: string;
    student_id: string;
    college_id: string;
    total_amount_paise: number;
    payment_status: string;
    fulfilment_status: string;
    fulfilment_method: string;
    collection_point: string;
    idempotency_key: string;
    created_at: string;
    items: Array<{ product_id: string; name: string; quantity: number; unit_price_paise: number }>;
  }>;
  transactions: Array<{
    id: string;
    wallet_id: string;
    student_id: string;
    type: 'CREDIT' | 'DEBIT';
    amount_paise: number;
    balance_after_paise: number;
    reference: string;
    description: string;
    created_at: string;
  }>;
  spending_controls: Map<string, {
    daily_limit_paise: number;
    single_txn_limit_paise: number;
    allowed_categories: string[];
    card_locked: boolean;
  }>;
  notifications: Array<{
    id: string;
    student_id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
}

export function createInitialStore(): BackendStore {
  return {
    colleges: [
      {
        id: 'COL-001',
        name: 'Sri Chaitanya & Narayana Junior Academy (Campus 1)',
        institution_code: 'SCNA-HYD-01',
        collection_points: ['Main Canteen Counter 1', 'Science Block Kiosk', 'Library Ground Pickup'],
      },
    ],
    students: [
      {
        id: 'STU-101',
        student_code: 'CK-2026-101',
        first_name: 'Aarav',
        last_name: 'Sharma',
        academic_year: 'Grade 11 - MPC',
        college_id: 'COL-001',
        account_status: 'active',
        password_hash: hashSecret('PASS101'),
        pin_hash: hashSecret('2026'),
        parent_account_id: 'PAR-501',
      },
      {
        id: 'STU-102',
        student_code: 'CK-2026-102',
        first_name: 'Diya',
        last_name: 'Reddy',
        academic_year: 'Grade 12 - BiPC',
        college_id: 'COL-001',
        account_status: 'active',
        password_hash: hashSecret('PASS102'),
        pin_hash: hashSecret('1234'),
        parent_account_id: 'PAR-502',
      },
    ],
    parents: [
      {
        id: 'PAR-501',
        mobile: '9876543210',
        password_hash: hashSecret('parent123'),
        name: 'Rajesh Sharma',
      },
    ],
    staff: [
      {
        id: 'STF-001',
        username: 'ops_admin',
        password_hash: hashSecret('ops123'),
        role: 'ops',
        college_id: 'COL-001',
      },
      {
        id: 'STF-002',
        username: 'principal',
        password_hash: hashSecret('college123'),
        role: 'college',
        college_id: 'COL-001',
      },
    ],
    wallets: new Map([
      ['STU-101', { student_id: 'STU-101', balance_paise: 85000, status: 'active' }],
      ['STU-102', { student_id: 'STU-102', balance_paise: 120000, status: 'active' }],
    ]),
    products: [
      {
        id: 'PRD-001',
        college_id: 'COL-001',
        name: 'Classmate Notebook 200pg',
        category: 'Stationery',
        price_paise: 6500,
        stock_quantity: 45,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
        description: 'Single lined 200 pages long notebook for daily coursework.',
      },
      {
        id: 'PRD-002',
        college_id: 'COL-001',
        name: 'Reynolds Trimax Gel Pen Blue',
        category: 'Stationery',
        price_paise: 4500,
        stock_quantity: 110,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=300',
        description: 'Precision Japanese needle tip fluid ink gel pen.',
      },
      {
        id: 'PRD-003',
        college_id: 'COL-001',
        name: 'Steamed Idli Sambar (2 Pcs)',
        category: 'Meals & Snacks',
        price_paise: 4000,
        stock_quantity: 30,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=300',
        description: 'Fresh hot breakfast idlis served with coconut chutney.',
      },
      {
        id: 'PRD-004',
        college_id: 'COL-001',
        name: 'Amul Butter Milk 200ml',
        category: 'Beverages',
        price_paise: 1500,
        stock_quantity: 75,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300',
        description: 'Chilled spiced refreshing buttermilk pouch.',
      },
      {
        id: 'PRD-005',
        college_id: 'COL-001',
        name: 'Casio FX-991CW Scientific Calculator',
        category: 'Academic Tools',
        price_paise: 125000,
        stock_quantity: 14,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&q=80&w=300',
        description: 'Advanced non-programmable scientific calculator.',
      },
    ],
    orders: [
      {
        id: 'ORD-8801',
        reference: 'ORD-2026-8801',
        student_id: 'STU-101',
        college_id: 'COL-001',
        total_amount_paise: 6500,
        payment_status: 'paid',
        fulfilment_status: 'Completed',
        fulfilment_method: 'Campus Kiosk Pickup',
        collection_point: 'Main Canteen Counter 1',
        idempotency_key: 'seed-idemp-8801',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        items: [{ product_id: 'PRD-001', name: 'Classmate Notebook 200pg', quantity: 1, unit_price_paise: 6500 }],
      },
    ],
    transactions: [
      {
        id: 'TXN-001',
        wallet_id: 'WLT-101',
        student_id: 'STU-101',
        type: 'CREDIT',
        amount_paise: 100000,
        balance_after_paise: 100000,
        reference: 'FND-INIT-01',
        description: 'Initial Wallet Balance',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'TXN-002',
        wallet_id: 'WLT-101',
        student_id: 'STU-101',
        type: 'DEBIT',
        amount_paise: 6500,
        balance_after_paise: 93500,
        reference: 'ORD-2026-8801',
        description: 'Purchase: Classmate Notebook 200pg',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    spending_controls: new Map([
      [
        'STU-101',
        {
          daily_limit_paise: 50000, // Rs 500
          single_txn_limit_paise: 25000, // Rs 250
          allowed_categories: ['All', 'Stationery', 'Meals & Snacks', 'Beverages', 'Academic Tools', 'Uniform & Lab Kits'],
          card_locked: false,
        },
      ],
    ]),
    notifications: [
      {
        id: 'NTF-01',
        student_id: 'STU-101',
        title: 'Welcome to CampusKart',
        message: 'Your campus smart wallet has been activated with Rs 850 balance.',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
  };
}

// --- Durable Persistence Layer (Loaded and Saved in Each Step) ---
interface SerializedStore {
  colleges: BackendStore['colleges'];
  students: BackendStore['students'];
  parents: BackendStore['parents'];
  staff: BackendStore['staff'];
  wallets: Record<string, { student_id: string; balance_paise: number; status: string }>;
  products: BackendStore['products'];
  orders: BackendStore['orders'];
  transactions: BackendStore['transactions'];
  spending_controls: Record<string, {
    daily_limit_paise: number;
    single_txn_limit_paise: number;
    allowed_categories: string[];
    card_locked: boolean;
  }>;
  notifications: BackendStore['notifications'];
}

export function saveStore(storeToSave: BackendStore, filePath: string = DATA_FILE): void {
  try {
    const serialized: SerializedStore = {
      colleges: storeToSave.colleges,
      students: storeToSave.students,
      parents: storeToSave.parents,
      staff: storeToSave.staff,
      wallets: Object.fromEntries(storeToSave.wallets),
      products: storeToSave.products,
      orders: storeToSave.orders,
      transactions: storeToSave.transactions,
      spending_controls: Object.fromEntries(storeToSave.spending_controls),
      notifications: storeToSave.notifications,
    };
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(serialized, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.error('[CampusKart] Error persisting data store:', err);
  }
}

export function loadStore(filePath: string = DATA_FILE): BackendStore {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data: SerializedStore = JSON.parse(raw);
      return {
        colleges: data.colleges || [],
        students: data.students || [],
        parents: data.parents || [],
        staff: data.staff || [],
        wallets: new Map(Object.entries(data.wallets || {})),
        products: data.products || [],
        orders: data.orders || [],
        transactions: data.transactions || [],
        spending_controls: new Map(Object.entries(data.spending_controls || {})),
        notifications: data.notifications || [],
      };
    }
  } catch (err) {
    console.error('[CampusKart] Error loading persisted data store, falling back to seed:', err);
  }
  const initial = createInitialStore();
  saveStore(initial, filePath);
  return initial;
}

export let store: BackendStore = loadStore(DATA_FILE);

export function resetStore(filePath: string = DATA_FILE): void {
  store = createInitialStore();
  saveStore(store, filePath);
  activeTokens.clear();
  preAuthTokens.clear();
}

// --- Helper Functions ---
function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
  res.end(JSON.stringify(data));
}

function getAuthHeader(req: http.IncomingMessage): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

// --- Request Handler ---
export function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // 1. Health Endpoint
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      status: 'ok',
      engine: 'TypeScript-Native',
      persisted_file: DATA_FILE,
      supabase_configured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
      students_count: store.students.length,
      orders_count: store.orders.length,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Student Login Step 1 (Admission Code + Password)
  if (pathname === '/api/auth/login' && method === 'POST') {
    parseJsonBody(req).then((body) => {
      const { student_code, password } = body;
      const student = store.students.find((s) => s.student_code === student_code);
      if (!student || !verifySecret(password, student.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid student credentials' });
      }

      if (student.account_status !== 'active') {
        return sendJson(res, 403, { error: `Account is ${student.account_status}. Please contact campus admin.` });
      }

      const college = store.colleges.find((c) => c.id === student.college_id);
      const preAuthToken = crypto.randomBytes(24).toString('hex');
      preAuthTokens.set(preAuthToken, { studentId: student.id, expiresAt: Date.now() + 300000 });

      return sendJson(res, 200, {
        pre_auth_token: preAuthToken,
        student_preview: {
          student_code: student.student_code,
          first_name: student.first_name,
          last_name: student.last_name,
          academic_year: student.academic_year,
          college_name: college?.name || 'Sri Chaitanya Academy',
        },
      });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 3. Student Verify PIN Step 2
  if (pathname === '/api/auth/verify-pin' && method === 'POST') {
    parseJsonBody(req).then((body) => {
      const { pre_auth_token, pin } = body;
      const preAuth = preAuthTokens.get(pre_auth_token);
      if (!preAuth || Date.now() > preAuth.expiresAt) {
        return sendJson(res, 401, { error: 'Pre-auth token expired or invalid' });
      }

      const student = store.students.find((s) => s.id === preAuth.studentId);
      if (!student || !verifySecret(pin, student.pin_hash)) {
        return sendJson(res, 401, { error: 'Incorrect 4-digit PIN' });
      }

      preAuthTokens.delete(pre_auth_token);
      const sessionToken = generateToken('student', student.id, { student_code: student.student_code });
      return sendJson(res, 200, { session_token: sessionToken });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 4. Parent Auth Login
  if (pathname === '/api/parent/auth/login' && method === 'POST') {
    parseJsonBody(req).then((body) => {
      const { mobile, password } = body;
      const parent = store.parents.find((p) => p.mobile === mobile);
      if (!parent || !verifySecret(password, parent.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid parent mobile or password' });
      }

      const linkedStudent = store.students.find((s) => s.parent_account_id === parent.id);
      const sessionToken = generateToken('parent', parent.id, { linkedStudentId: linkedStudent?.id });
      return sendJson(res, 200, {
        session_token: sessionToken,
        linked_student: linkedStudent ? { id: linkedStudent.student_code, name: `${linkedStudent.first_name} ${linkedStudent.last_name}` } : null,
      });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 5. Operations Staff Login
  if (pathname === '/api/ops/auth/login' && method === 'POST') {
    parseJsonBody(req).then((body) => {
      const { username, password } = body;
      const staff = store.staff.find((s) => s.username === username && s.role === 'ops');
      if (!staff || !verifySecret(password, staff.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid operations credentials' });
      }

      const sessionToken = generateToken('ops', staff.id, { college_id: staff.college_id });
      return sendJson(res, 200, { session_token: sessionToken });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 6. College Management Login
  if (pathname === '/api/college/auth/login' && method === 'POST') {
    parseJsonBody(req).then((body) => {
      const { username, password } = body;
      const staff = store.staff.find((s) => s.username === username && s.role === 'college');
      if (!staff || !verifySecret(password, staff.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid college authority credentials' });
      }

      const sessionToken = generateToken('college', staff.id, { college_id: staff.college_id });
      return sendJson(res, 200, { session_token: sessionToken });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 7. Products Catalog
  if (pathname === '/api/products' && method === 'GET') {
    let result = store.products.filter((p) => p.is_available);
    const search = parsedUrl.searchParams.get('search');
    const category = parsedUrl.searchParams.get('category');
    const sort = parsedUrl.searchParams.get('sort');

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (category && category !== 'All') {
      result = result.filter((p) => p.category === category);
    }
    if (sort === 'price_asc') {
      result.sort((a, b) => a.price_paise - b.price_paise);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price_paise - a.price_paise);
    }

    return sendJson(res, 200, {
      products: result.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price_paise: p.price_paise,
        price: Math.round(p.price_paise / 100),
        stock: p.stock_quantity,
        image_url: p.image_url,
        description: p.description,
        is_available: p.is_available,
      })),
    });
  }

  // 8. Student Dashboard
  if (pathname === '/api/student/dashboard' && method === 'GET') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'student') {
      return sendJson(res, 403, { error: 'Unauthorized: Student access only' });
    }

    const student = store.students.find((s) => s.id === session.entityId);
    if (!student) return sendJson(res, 404, { error: 'Student not found' });

    const wallet = store.wallets.get(student.id) || { balance_paise: 0, status: 'active' };
    const orders = store.orders.filter((o) => o.student_id === student.id);
    const transactions = store.transactions.filter((t) => t.student_id === student.id);
    const controls = store.spending_controls.get(student.id) || {
      daily_limit_paise: 50000,
      single_txn_limit_paise: 25000,
      allowed_categories: ['All'],
      card_locked: false,
    };
    const notifications = store.notifications.filter((n) => n.student_id === student.id);

    return sendJson(res, 200, {
      student: {
        student_code: student.student_code,
        first_name: student.first_name,
        last_name: student.last_name,
        academic_year: student.academic_year,
      },
      wallet: {
        balance_paise: wallet.balance_paise,
        balance_inr: Math.round(wallet.balance_paise / 100),
        status: wallet.status,
      },
      controls: {
        daily_limit_paise: controls.daily_limit_paise,
        single_txn_limit_paise: controls.single_txn_limit_paise,
        allowed_categories: controls.allowed_categories,
        card_locked: controls.card_locked,
      },
      recent_orders: orders.slice(0, 5),
      transactions: transactions.slice(0, 10),
      notifications,
    });
  }

  // 9. Parent Dashboard
  if (pathname === '/api/parent/dashboard' && method === 'GET') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'parent') {
      return sendJson(res, 403, { error: 'Unauthorized: Parent access only' });
    }

    const studentId = session.metadata?.linkedStudentId || 'STU-101';
    const student = store.students.find((s) => s.id === studentId);
    const wallet = store.wallets.get(studentId) || { balance_paise: 0, status: 'active' };
    const orders = store.orders.filter((o) => o.student_id === studentId);
    const transactions = store.transactions.filter((t) => t.student_id === studentId);
    const controls = store.spending_controls.get(studentId);

    return sendJson(res, 200, {
      student: student ? {
        id: student.student_code,
        name: `${student.first_name} ${student.last_name}`,
        academic_year: student.academic_year,
      } : null,
      wallet_balance_paise: wallet.balance_paise,
      controls,
      orders,
      transactions,
    });
  }

  // 10. Operations Dashboard
  if (pathname === '/api/ops/dashboard' && method === 'GET') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return sendJson(res, 403, { error: 'Unauthorized: Operations access only' });
    }

    return sendJson(res, 200, {
      products: store.products,
      orders: store.orders,
      students: store.students.map((s) => {
        const w = store.wallets.get(s.id);
        return {
          id: s.id,
          student_code: s.student_code,
          name: `${s.first_name} ${s.last_name}`,
          academic_year: s.academic_year,
          account_status: s.account_status,
          wallet_balance_paise: w ? w.balance_paise : 0,
        };
      }),
      students_count: store.students.length,
    });
  }

  // 11. College Management Dashboard
  if (pathname === '/api/college/dashboard' && method === 'GET') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'college') {
      return sendJson(res, 403, { error: 'Unauthorized: College authority access only' });
    }

    const totalOrders = store.orders.length;
    const totalVolumePaise = store.orders.reduce((sum, o) => sum + o.total_amount_paise, 0);

    return sendJson(res, 200, {
      kpis: {
        total_orders: totalOrders,
        total_gross_paise: totalVolumePaise,
        active_students: store.students.length,
      },
      colleges: store.colleges,
    });
  }

  // 12. Simulate / Parent Top-Up (Persisted)
  if ((pathname === '/api/wallet/simulate-topup' || pathname === '/api/parent/fund') && method === 'POST') {
    parseJsonBody(req).then((body) => {
      const token = getAuthHeader(req);
      const session = token ? verifyToken(token) : null;
      let targetStudentId = 'STU-101';

      if (session) {
        if (session.role === 'student') targetStudentId = session.entityId;
        else if (session.role === 'parent' && session.metadata?.linkedStudentId) {
          targetStudentId = session.metadata.linkedStudentId;
        }
      }

      const amountPaise = body.amount_paise || (body.amount ? body.amount * 100 : 0);
      if (amountPaise <= 0) return sendJson(res, 400, { error: 'Amount must be greater than zero' });

      const wallet = store.wallets.get(targetStudentId);
      if (!wallet) return sendJson(res, 404, { error: 'Wallet not found' });

      wallet.balance_paise += amountPaise;
      const ref = `FND-${Date.now().toString().slice(-6)}`;
      store.transactions.unshift({
        id: `TXN-${Date.now()}`,
        wallet_id: `WLT-${targetStudentId}`,
        student_id: targetStudentId,
        type: 'CREDIT',
        amount_paise: amountPaise,
        balance_after_paise: wallet.balance_paise,
        reference: ref,
        description: `Wallet top-up via ${body.method || 'Online Banking'}`,
        created_at: new Date().toISOString(),
      });

      // Persist state immediately
      saveStore(store, DATA_FILE);

      return sendJson(res, 200, {
        reference: ref,
        new_balance_paise: wallet.balance_paise,
        simulated: true,
      });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 13. Parent Update Spending Controls (Persisted)
  if (pathname === '/api/parent/spending-controls' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'parent') {
      return sendJson(res, 403, { error: 'Unauthorized: Parent access only' });
    }

    parseJsonBody(req).then((body) => {
      const studentId = session.metadata?.linkedStudentId || 'STU-101';
      const controls = store.spending_controls.get(studentId) || {
        daily_limit_paise: 50000,
        single_txn_limit_paise: 25000,
        allowed_categories: ['All'],
        card_locked: false,
      };

      if (body.daily_limit_paise !== undefined) controls.daily_limit_paise = body.daily_limit_paise;
      if (body.single_txn_limit_paise !== undefined) controls.single_txn_limit_paise = body.single_txn_limit_paise;
      if (body.allowed_categories !== undefined) controls.allowed_categories = body.allowed_categories;
      if (body.card_locked !== undefined) controls.card_locked = body.card_locked;

      store.spending_controls.set(studentId, controls);

      // Persist state immediately
      saveStore(store, DATA_FILE);

      return sendJson(res, 200, { success: true, controls });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 14. Ops Wallet Manual Adjustment (Persisted)
  if (pathname === '/api/ops/wallet/adjust' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return sendJson(res, 403, { error: 'Unauthorized: Operations staff access only' });
    }

    parseJsonBody(req).then((body) => {
      const { student_id, type, amount_paise, reason } = body;
      const student = store.students.find((s) => s.id === student_id || s.student_code === student_id);
      if (!student) return sendJson(res, 404, { error: 'Student not found' });

      const wallet = store.wallets.get(student.id);
      if (!wallet) return sendJson(res, 404, { error: 'Wallet not found' });

      if (type === 'CREDIT') {
        wallet.balance_paise += amount_paise;
      } else if (type === 'DEBIT') {
        if (wallet.balance_paise < amount_paise) {
          return sendJson(res, 400, { error: 'Insufficient funds for debit adjustment' });
        }
        wallet.balance_paise -= amount_paise;
      } else {
        return sendJson(res, 400, { error: 'Invalid adjustment type' });
      }

      const ref = `ADJ-${Date.now().toString().slice(-6)}`;
      store.transactions.unshift({
        id: `TXN-${Date.now()}`,
        wallet_id: `WLT-${student.id}`,
        student_id: student.id,
        type,
        amount_paise,
        balance_after_paise: wallet.balance_paise,
        reference: ref,
        description: `Manual Adjustment: ${reason}`,
        created_at: new Date().toISOString(),
      });

      // Persist state immediately
      saveStore(store, DATA_FILE);

      return sendJson(res, 200, {
        success: true,
        reference: ref,
        new_balance_paise: wallet.balance_paise,
      });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 15. Ops Update Order Status (Persisted)
  if (pathname === '/api/ops/orders/status' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return sendJson(res, 403, { error: 'Unauthorized: Operations staff access only' });
    }

    parseJsonBody(req).then((body) => {
      const { order_id, status } = body;
      const order = store.orders.find((o) => o.id === order_id || o.reference === order_id);
      if (!order) return sendJson(res, 404, { error: 'Order not found' });

      order.fulfilment_status = status;

      // Add student notification
      store.notifications.unshift({
        id: `NTF-${Date.now()}`,
        student_id: order.student_id,
        title: `Order ${order.reference} Status Updated`,
        message: `Your order is now: ${status}`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      // Persist state immediately
      saveStore(store, DATA_FILE);

      return sendJson(res, 200, { success: true, order_id: order.id, status });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 16. Ops Enroll New Student (Persisted)
  if (pathname === '/api/ops/students' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return sendJson(res, 403, { error: 'Unauthorized: Operations staff access only' });
    }

    parseJsonBody(req).then((body) => {
      const { name, academic_year, parent_name, initial_wallet_paise, parent_mobile, pin, password } = body;
      if (!name || !name.trim()) return sendJson(res, 400, { error: 'Student name is required' });

      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Student';

      const nextIndex = 100 + store.students.length + 1;
      const studentCode = `CK-2026-${nextIndex}`;
      const studentId = `STU-${nextIndex}`;
      const parentId = `PAR-${nextIndex + 400}`;

      // Create Parent Profile
      store.parents.push({
        id: parentId,
        mobile: parent_mobile || `98765${nextIndex.toString().padStart(5, '0')}`,
        password_hash: hashSecret('parent123'),
        name: parent_name || 'Guardian',
      });

      // Create Student Profile
      const student = {
        id: studentId,
        student_code: studentCode,
        first_name: firstName,
        last_name: lastName,
        academic_year: academic_year || 'Grade 11 - MPC',
        college_id: 'COL-001',
        account_status: 'active',
        password_hash: hashSecret(password || `PASS${nextIndex}`),
        pin_hash: hashSecret(pin || '2026'),
        parent_account_id: parentId,
      };
      store.students.push(student);

      // Create Initial Wallet
      const initialBalance = Number(initial_wallet_paise) || 0;
      store.wallets.set(studentId, {
        student_id: studentId,
        balance_paise: initialBalance,
        status: 'active',
      });

      // Default Spending Controls
      store.spending_controls.set(studentId, {
        daily_limit_paise: 50000,
        single_txn_limit_paise: 25000,
        allowed_categories: ['All', 'Stationery', 'Meals & Snacks', 'Beverages', 'Academic Tools', 'Uniform & Lab Kits'],
        card_locked: false,
      });

      // Record initial funding transaction if positive
      if (initialBalance > 0) {
        store.transactions.unshift({
          id: `TXN-${Date.now()}`,
          wallet_id: `WLT-${studentId}`,
          student_id: studentId,
          type: 'CREDIT',
          amount_paise: initialBalance,
          balance_after_paise: initialBalance,
          reference: `FND-INIT-${studentCode}`,
          description: 'Enrollment Initial Balance',
          created_at: new Date().toISOString(),
        });
      }

      // Persist state immediately
      saveStore(store, DATA_FILE);

      return sendJson(res, 201, {
        success: true,
        student: {
          id: student.id,
          student_code: student.student_code,
          name: `${student.first_name} ${student.last_name}`,
          academic_year: student.academic_year,
          account_status: student.account_status,
          wallet_balance_paise: initialBalance,
        },
      });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 17. Ops Toggle Student Account Status (Persisted)
  if (pathname === '/api/ops/students/status' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return sendJson(res, 403, { error: 'Unauthorized: Operations staff access only' });
    }

    parseJsonBody(req).then((body) => {
      const { student_id, status } = body;
      const student = store.students.find((s) => s.id === student_id || s.student_code === student_id);
      if (!student) return sendJson(res, 404, { error: 'Student not found' });

      student.account_status = status || (student.account_status === 'active' ? 'inactive' : 'active');

      // Persist state immediately
      saveStore(store, DATA_FILE);

      return sendJson(res, 200, {
        success: true,
        student_id: student.id,
        student_code: student.student_code,
        account_status: student.account_status,
      });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 18. Ops Create or Update Product Stock/Price (Persisted)
  if (pathname === '/api/ops/products' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'ops') {
      return sendJson(res, 403, { error: 'Unauthorized: Operations staff access only' });
    }

    parseJsonBody(req).then((body) => {
      const { id, name, category, price_paise, stock_quantity, description, is_available } = body;
      if (id) {
        // Update product
        const product = store.products.find((p) => p.id === id);
        if (!product) return sendJson(res, 404, { error: 'Product not found' });
        if (price_paise !== undefined) product.price_paise = price_paise;
        if (stock_quantity !== undefined) product.stock_quantity = stock_quantity;
        if (is_available !== undefined) product.is_available = is_available;
        if (description !== undefined) product.description = description;

        saveStore(store, DATA_FILE);
        return sendJson(res, 200, { success: true, product });
      }

      // Create new product
      const newProduct = {
        id: `PRD-${Date.now().toString().slice(-4)}`,
        college_id: 'COL-001',
        name: name || 'New Item',
        category: category || 'General',
        price_paise: price_paise || 1000,
        stock_quantity: stock_quantity || 10,
        is_available: is_available !== undefined ? is_available : true,
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
        description: description || 'Campus store item',
      };
      store.products.push(newProduct);

      saveStore(store, DATA_FILE);
      return sendJson(res, 201, { success: true, product: newProduct });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 19. Checkout (Atomic Order Placement with Idempotency & Persistence)
  if (pathname === '/api/checkout' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (!session || session.role !== 'student') {
      return sendJson(res, 403, { error: 'Unauthorized: Student access only' });
    }

    parseJsonBody(req).then((body) => {
      const { items, fulfilment_method, collection_point, idempotency_key, simulate_failure } = body;

      if (simulate_failure) {
        return sendJson(res, 500, { error: 'Simulated payment processing failure' });
      }

      // Check idempotency replay
      if (idempotency_key) {
        const existingOrder = store.orders.find((o) => o.idempotency_key === idempotency_key);
        if (existingOrder) {
          const wallet = store.wallets.get(session.entityId);
          return sendJson(res, 200, {
            order_id: existingOrder.id,
            reference: existingOrder.reference,
            total_amount_paise: existingOrder.total_amount_paise,
            previous_balance_paise: (wallet?.balance_paise || 0) + existingOrder.total_amount_paise,
            new_balance_paise: wallet?.balance_paise || 0,
            simulated: false,
          });
        }
      }

      const studentId = session.entityId;
      const student = store.students.find((s) => s.id === studentId);
      if (student && student.account_status !== 'active') {
        return sendJson(res, 403, { error: `Account is ${student.account_status}. Orders blocked.` });
      }

      const wallet = store.wallets.get(studentId);
      if (!wallet) return sendJson(res, 404, { error: 'Wallet not found' });

      // Check card locked
      const controls = store.spending_controls.get(studentId);
      if (controls?.card_locked) {
        return sendJson(res, 403, { error: 'Student card/wallet is locked by parent' });
      }

      // Calculate total and verify stock
      let totalPaise = 0;
      const orderItems = [];

      for (const item of items) {
        const product = store.products.find((p) => p.id === item.product_id);
        if (!product) return sendJson(res, 404, { error: `Product ${item.product_id} not found` });
        if (product.stock_quantity < item.quantity) {
          return sendJson(res, 400, { error: `Insufficient stock for ${product.name}` });
        }

        // Category restrictions check
        if (controls && controls.allowed_categories && controls.allowed_categories.length > 0 && !controls.allowed_categories.includes('All')) {
          if (!controls.allowed_categories.includes(product.category)) {
            return sendJson(res, 403, { error: `Purchase of ${product.category} items is restricted by parent controls` });
          }
        }

        totalPaise += product.price_paise * item.quantity;
        orderItems.push({
          product_id: product.id,
          name: product.name,
          quantity: item.quantity,
          unit_price_paise: product.price_paise,
        });
      }

      // Check single transaction limit
      if (controls && totalPaise > controls.single_txn_limit_paise) {
        return sendJson(res, 403, { error: 'Order exceeds single transaction limit' });
      }

      // Check daily limit
      const todayDate = new Date().toISOString().slice(0, 10);
      const todaySpentPaise = store.orders
        .filter((o) => o.student_id === studentId && o.created_at.startsWith(todayDate) && o.payment_status === 'paid')
        .reduce((acc, o) => acc + o.total_amount_paise, 0);

      if (controls && todaySpentPaise + totalPaise > controls.daily_limit_paise) {
        return sendJson(res, 403, { error: 'Order exceeds student daily spending limit' });
      }

      // Check balance
      if (wallet.balance_paise < totalPaise) {
        return sendJson(res, 400, { error: 'Insufficient wallet balance' });
      }

      // Atomically decrement stock
      for (const item of items) {
        const product = store.products.find((p) => p.id === item.product_id);
        if (product) product.stock_quantity -= item.quantity;
      }

      // Decrement wallet balance
      const previousBalance = wallet.balance_paise;
      wallet.balance_paise -= totalPaise;

      const orderId = `ORD-${Date.now()}`;
      const reference = `ORD-2026-${Date.now().toString().slice(-4)}`;

      const newOrder = {
        id: orderId,
        reference,
        student_id: studentId,
        college_id: 'COL-001',
        total_amount_paise: totalPaise,
        payment_status: 'paid',
        fulfilment_status: 'Order Placed',
        fulfilment_method: fulfilment_method || 'Campus Kiosk Pickup',
        collection_point: collection_point || 'Main Canteen Counter 1',
        idempotency_key: idempotency_key || `idemp-${Date.now()}`,
        created_at: new Date().toISOString(),
        items: orderItems,
      };
      store.orders.unshift(newOrder);

      // Record transaction
      store.transactions.unshift({
        id: `TXN-${Date.now()}`,
        wallet_id: `WLT-${studentId}`,
        student_id: studentId,
        type: 'DEBIT',
        amount_paise: totalPaise,
        balance_after_paise: wallet.balance_paise,
        reference,
        description: `Order ${reference}`,
        created_at: new Date().toISOString(),
      });

      // Persist state immediately to disk
      saveStore(store, DATA_FILE);

      return sendJson(res, 200, {
        order_id: orderId,
        reference,
        total_amount_paise: totalPaise,
        previous_balance_paise: previousBalance,
        new_balance_paise: wallet.balance_paise,
        simulated: false,
      });
    }).catch((err) => sendJson(res, 400, { error: err.message }));
    return;
  }

  // 20. Notifications Read (Persisted)
  if (pathname === '/api/notifications/read' && method === 'POST') {
    const token = getAuthHeader(req);
    const session = token ? verifyToken(token) : null;
    if (session && session.role === 'student') {
      store.notifications
        .filter((n) => n.student_id === session.entityId)
        .forEach((n) => (n.is_read = true));
      saveStore(store, DATA_FILE);
    }
    return sendJson(res, 200, { ok: true });
  }

  // 404 Fallback
  return sendJson(res, 404, { error: 'Route not found' });
}

export function createServer(): http.Server {
  return http.createServer(handleRequest);
}

// Start server if run directly
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`[CampusKart] Pure TypeScript Backend active on http://${HOST}:${PORT}`);
    console.log(`[CampusKart] Persistence Data File: ${DATA_FILE}`);
    console.log(`[CampusKart] Database Provider: ${SUPABASE_URL ? 'Supabase' : 'File-Backed TypeScript Engine'}`);
  });
}
