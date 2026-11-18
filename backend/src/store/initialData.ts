/**
 * CampusKart Seed Evaluation Data
 */

import { hashSecret } from '../security/crypto.js';
import type { BackendStore } from '../types.js';

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
