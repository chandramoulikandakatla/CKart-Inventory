/**
 * CampusKart Supabase Unified Service Facade
 * Delegates to modular domain services in ./supabase/
 */

import { isSupabaseConfigured } from './supabaseClient';
import {
  productService,
  studentService,
  walletService,
  controlService,
  orderService,
  parentService,
  notificationService,
  ecosystemService,
} from './supabase';

import type { Product, Student, SpendingControls, EcosystemState } from '../types/ecosystem';

export const supabaseService = {
  isAvailable(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Fetch complete live ecosystem from Supabase
   */
  async fetchFullEcosystem(): Promise<Partial<EcosystemState> | null> {
    return ecosystemService.fetchFullEcosystem();
  },

  /**
   * Product operations
   */
  async getProducts(): Promise<Product[] | null> {
    return productService.getProducts();
  },

  async createProduct(product: Product): Promise<boolean> {
    return productService.createProduct(product);
  },

  async updateProductStock(
    productId: string,
    productName: string,
    newStock?: number,
    newPrice?: number,
    toggleActive?: boolean
  ): Promise<boolean> {
    return productService.updateProductStock(productId, productName, newStock, newPrice, toggleActive);
  },

  /**
   * Student operations
   */
  async getStudents(): Promise<{ students: Student[] } | null> {
    return studentService.getStudents();
  },

  async updateStudentStatus(studentCode: string, nextStatus: 'Active' | 'Inactive'): Promise<boolean> {
    return studentService.updateStudentStatus(studentCode, nextStatus);
  },

  async enrollStudent(student: Student, initialBalanceRupees: number): Promise<boolean> {
    return studentService.enrollStudent(student, initialBalanceRupees);
  },

  /**
   * Wallet operations
   */
  async topUpWallet(studentCode: string, amountRupees: number, method: string): Promise<number | null> {
    return walletService.topUpWallet(studentCode, amountRupees, method);
  },

  async recordManualAdjustment(params: {
    studentCode: string;
    amountRupees: number;
    type: string;
    reason: string;
    operator: string;
  }): Promise<number | null> {
    return walletService.recordManualAdjustment(params);
  },

  /**
   * Order operations
   */
  async submitOrder(orderData: {
    studentCode: string;
    items: Array<{ productId: string; name: string; category: string; price: number; qty: number; subtotal: number }>;
    totalAmount: number;
    fulfilmentMethod: string;
    collectionPoint: string;
    idempotencyKey?: string;
  }): Promise<{ orderId: string; reference: string; newBalance: number } | null> {
    return orderService.submitOrder(orderData);
  },

  async updateOrderStatus(orderId: string, nextStatus: string): Promise<boolean> {
    return orderService.updateOrderStatus(orderId, nextStatus);
  },

  /**
   * Guardian operations
   */
  async authenticateParent(identifier: string, passwordOrPin: string) {
    return parentService.authenticateParent(identifier, passwordOrPin);
  },

  /**
   * Spending controls
   */
  async updateSpendingControls(studentCode: string, controls: SpendingControls): Promise<boolean> {
    return controlService.updateSpendingControls(studentCode, controls);
  },

  /**
   * Notification operations
   */
  async createNotification(params: {
    studentCode: string;
    title: string;
    message: string;
    type: string;
  }): Promise<boolean> {
    return notificationService.createNotification(params);
  },

  async fetchNotifications(): Promise<any[]> {
    return notificationService.fetchNotifications();
  },
};

export default supabaseService;
