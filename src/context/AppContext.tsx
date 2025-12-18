import { create } from 'zustand';
import type { Product, Notification } from '../types';
import { mockProducts } from '../data/mockData';

// Database cluster type
export interface DatabaseCluster {
  id: string;
  name: string;
  engine: string;
  region: string;
  status: 'creating' | 'active' | 'stopped' | 'error';
  endpoint?: string;
  createdAt: Date;
  lastActivity?: Date;
  storage?: string;
  connections?: number;
  tags?: Record<string, string>;
}

// Activity event type
export interface ActivityEvent {
  id: string;
  type: 'database_created' | 'data_imported' | 'connection_made' | 'query_executed' | 'error';
  title: string;
  description: string;
  timestamp: Date;
  resourceId?: string;
  resourceName?: string;
}

interface AppState {
  // Existing
  products: Product[];
  notifications: Notification[];
  theme: 'light' | 'dark';
  loading: boolean;

  // Database management
  databases: DatabaseCluster[];
  activities: ActivityEvent[];

  // Existing actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;

  // Database actions
  addDatabase: (database: DatabaseCluster) => void;
  updateDatabase: (id: string, updates: Partial<DatabaseCluster>) => void;
  removeDatabase: (id: string) => void;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  products: mockProducts,
  notifications: [],
  theme: 'light',
  loading: false,
  databases: [],
  activities: [],

  // Product actions
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Theme actions
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setLoading: (loading) => set({ loading }),

  // Database actions
  addDatabase: (database) =>
    set((state) => ({ databases: [...state.databases, database] })),
  updateDatabase: (id, updates) =>
    set((state) => ({
      databases: state.databases.map((db) =>
        db.id === id ? { ...db, ...updates } : db
      ),
    })),
  removeDatabase: (id) =>
    set((state) => ({
      databases: state.databases.filter((db) => db.id !== id),
    })),

  // Activity actions
  addActivity: (activity) =>
    set((state) => ({
      activities: [
        {
          ...activity,
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        },
        ...state.activities,
      ].slice(0, 50), // Keep last 50 activities
    })),
  clearActivities: () => set({ activities: [] }),
}));
