import { LoginView } from '@/src/presentation/components/auth/LoginView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | AI Content Creator',
  description: 'เข้าสู่ระบบเพื่อใช้งาน AI Content Creator',
};

/**
 * Login Page - Server Component for SEO optimization
 */
export default function LoginPage() {
  return <LoginView />;
}
