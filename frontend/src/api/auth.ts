import { request } from './client';
import type { AuthResponse, User } from '../types';

export function signupRequest(name: string, email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', { method: 'POST', body: { name, email, password } });
}

export function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export function getMeRequest(): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me');
}