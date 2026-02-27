import { RegisterView } from '@/src/presentation/components/auth/RegisterView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'สมัครสมาชิก | AI Content Creator',
  description: 'สมัครสมาชิกเพื่อใช้งาน AI Content Creator ได้ง่ายขึ้น',
};

/**
 * Register Page - Server Component for SEO optimization
 */
export default function RegisterPage() {
  return <RegisterView />;
}
