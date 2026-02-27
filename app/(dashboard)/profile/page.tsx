import { ProfileView } from "@/src/presentation/components/profile/ProfileView";
import type { Metadata } from "next";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'โปรไฟล์ | AI Content Creator',
  description: 'จัดการข้อมูลโปรไฟล์ของคุณ',
};

export default function ProfilePage() {
  return <ProfileView />;
}
