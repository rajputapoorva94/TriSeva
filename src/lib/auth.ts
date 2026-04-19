// Authentication and Authorization utilities

import { User, UserRole } from '../types';
import { mockUsers } from './mockData';

// Mock authentication - In production, this would connect to your Spring Boot backend
export class AuthService {
  private static readonly STORAGE_KEY = 'grievance_auth_user';
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  private static mapApiUserToClient(payload: any): User {
    return {
      id: String(payload.id),
      name: payload.name,
      email: payload.email,
      nationalId: payload.national_id,
      role: payload.role,
      createdAt: new Date(payload.created_at),
    };
  }

  // Login with email/national ID and password
  static async login(identifier: string, password: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = this.mapApiUserToClient(data);
        this.setCurrentUser(user);
        return user;
      }
    } catch {
      // fall back to demo data
    }

    const user = mockUsers.find(
      u => u.email === identifier || u.nationalId === identifier
    );

    if (user) {
      this.setCurrentUser(user);
      return user;
    }

    return null;
  }

  // Register new citizen
  static async register(data: {
    name: string;
    email: string;
    nationalIdType: string;
    nationalId: string;
    password: string;
  }): Promise<User | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          national_id_type: data.nationalIdType,
          national_id: data.nationalId,
          password: data.password,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        const user = this.mapApiUserToClient(payload);
        this.setCurrentUser(user);
        return user;
      }
    } catch {
      // fall back to demo registration
    }

    const newUser: User = {
      id: `C${Date.now()}`,
      name: data.name,
      email: data.email,
      nationalId: data.nationalId,
      role: 'CITIZEN',
      createdAt: new Date(),
    };

    mockUsers.push(newUser);
    this.setCurrentUser(newUser);
    return newUser;
  }

  // Get current logged-in user
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      // Restore Date objects
      user.createdAt = new Date(user.createdAt);
      return user;
    }
    return null;
  }

  // Set current user
  static setCurrentUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
  }

  // Logout
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Check if user has role
  static hasRole(user: User | null, role: UserRole | UserRole[]): boolean {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }

  // Check if user can access official portal
  static canAccessOfficialPortal(user: User | null): boolean {
    return this.hasRole(user, ['OFFICER', 'SENIOR_OFFICER', 'DEPT_HEAD', 'ADMIN']);
  }

  // Get role hierarchy level (for escalation)
  static getRoleLevel(role: UserRole): number {
    const levels: Record<UserRole, number> = {
      CITIZEN: 0,
      OFFICER: 1,
      SENIOR_OFFICER: 2,
      DEPT_HEAD: 3,
      ADMIN: 4,
    };
    return levels[role];
  }
}
