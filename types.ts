
export interface User {
  id: string;
  username: string;
  hrmsId: string;
  password?: string;
  role: 'admin' | 'supervisor' | 'officer' | 'technician';
}

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface Inspection {
  id: string;
  locoNumber: string;
  baseShed: string;
  schedule: string;
  pantographNumber: string;
  photoUrl: string;
  timestamp: string;
  userId: string;
  syncStatus: SyncStatus;
  lastModified: number;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  NEW_INSPECTION = 'NEW_INSPECTION',
  HISTORY = 'HISTORY',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  PROFILE = 'PROFILE'
}
