import { AuthCallbackView } from '@/src/presentation/components/auth/AuthCallbackView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'กำลังเข้าสู่ระบบ... | AI Content Creator',
  description: 'กำลังดำเนินการเข้าสู่ระบบ',
};

/**
 * Auth Callback Page - Handles OAuth redirects
 */
export default function AuthCallbackPage() {
  return <AuthCallbackView />;
}
