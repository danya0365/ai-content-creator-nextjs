import { ForgotPasswordView } from '@/src/presentation/components/auth/ForgotPasswordView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ลืมรหัสผ่าน | AI Content Creator',
  description: 'รีเซ็ตรหัสผ่านสำหรับบัญชี AI Content Creator',
};

/**
 * Forgot Password Page - Server Component for SEO optimization
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
