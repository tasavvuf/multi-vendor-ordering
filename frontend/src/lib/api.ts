import axios, { AxiosError } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
export const PRODUCT_IMAGE_URL = 'https://placehold.co/600x400';
export const api = axios.create({ baseURL: API_BASE_URL });

export function formatError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
  }
  return fallback;
}

export function money(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
    : `₹${value}`;
}

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBackendProduct(product: { id: string; vendor?: { id: string } }) {
  return uuidPattern.test(product.id) && uuidPattern.test(product.vendor?.id ?? '');
}
