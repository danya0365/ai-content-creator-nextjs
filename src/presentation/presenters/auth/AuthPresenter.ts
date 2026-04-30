/**
 * AuthPresenter
 * Handles business logic for authentication
 * Receives repository via dependency injection
 */

import type {
    AuthProfile,
    AuthResult,
    AuthSession,
    AuthUser,
    IAuthRepository,
    OTPSignInData,
    ResetPasswordData,
    SignInData,
    SignUpData,
    UpdatePasswordData,
    UpdateProfileData,
    VerifyOTPData,
} from '@/src/application/repositories/IAuthRepository';
import { Metadata } from 'next';

export interface AuthViewModel {
  user: AuthUser | null;
  profile: AuthProfile | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthPage = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'profile';

/**
 * Presenter for Authentication
 * ✅ Receives repository via constructor injection
 */
export class AuthPresenter {
  constructor(private readonly repository: IAuthRepository) {}

  /**
   * Helper to wrap promise with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Connection timed out (${ms}ms)`)), ms)
      )
    ]);
  }

  /**
   * Get initial view model for auth pages
   */
  async getViewModel(): Promise<AuthViewModel> {
    try {
      const session = await this.withTimeout(this.repository.getSession());

      if (session) {
        return {
          user: session.user,
          profile: session.profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        };
      }

      return {
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      };
    } catch (error) {
      console.error('[AuthPresenter] Error getting auth view model:', error);
      return {
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }
  }

  /**
   * Generate metadata for auth pages
   */
  generateMetadata(page: AuthPage): Metadata {
    const metadataMap: Record<AuthPage, Metadata> = {
      login: {
        title: 'เข้าสู่ระบบ | AI Content Creator',
        description: 'เข้าสู่ระบบเพื่อใช้งาน AI Content Creator',
      },
      register: {
        title: 'สมัครสมาชิก | AI Content Creator',
        description: 'สมัครสมาชิกเพื่อใช้งาน AI Content Creator ได้ง่ายขึ้น',
      },
      'forgot-password': {
        title: 'ลืมรหัสผ่าน | AI Content Creator',
        description: 'รีเซ็ตรหัสผ่านสำหรับบัญชี AI Content Creator',
      },
      'reset-password': {
        title: 'ตั้งรหัสผ่านใหม่ | AI Content Creator',
        description: 'ตั้งรหัสผ่านใหม่สำหรับบัญชี AI Content Creator',
      },
      'verify-email': {
        title: 'ยืนยันอีเมล | AI Content Creator',
        description: 'ยืนยันอีเมลสำหรับบัญชี AI Content Creator',
      },
      profile: {
        title: 'โปรไฟล์ | AI Content Creator',
        description: 'จัดการข้อมูลโปรไฟล์ของคุณ',
      },
    };

    return metadataMap[page];
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      return await this.withTimeout(this.repository.signUp(data));
    } catch (error) {
      console.error('[AuthPresenter] Sign up error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      return await this.repository.signIn(data);
    } catch (error) {
      console.error('[AuthPresenter] Sign in error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      };
    }
  }

  /**
   * Sign in with OTP (phone)
   */
  async signInWithOTP(data: OTPSignInData): Promise<AuthResult> {
    try {
      return await this.repository.signInWithOTP(data);
    } catch (error) {
      console.error('[AuthPresenter] OTP sign in error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการส่ง OTP',
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: VerifyOTPData): Promise<AuthResult> {
    try {
      return await this.repository.verifyOTP(data);
    } catch (error) {
      console.error('[AuthPresenter] Verify OTP error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการยืนยัน OTP',
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'facebook' | 'github' | 'line'): Promise<AuthResult> {
    try {
      return await this.repository.signInWithOAuth(provider);
    } catch (error) {
      console.error('[AuthPresenter] OAuth sign in error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย OAuth',
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<AuthResult> {
    try {
      return await this.repository.signOut();
    } catch (error) {
      console.error('[AuthPresenter] Sign out error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการออกจากระบบ',
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      return await this.repository.getCurrentUser();
    } catch (error) {
      console.error('[AuthPresenter] Get current user error:', error);
      return null;
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      return await this.repository.getSession();
    } catch (error) {
      console.error('[AuthPresenter] Get session error:', error);
      return null;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<AuthProfile | null> {
    try {
      return await this.repository.getProfile();
    } catch (error) {
      console.error('[AuthPresenter] Get profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<AuthProfile> {
    try {
      return await this.repository.updateProfile(data);
    } catch (error) {
      console.error('[AuthPresenter] Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get all profiles
   */
  async getProfiles(): Promise<AuthProfile[]> {
    try {
      return await this.repository.getProfiles();
    } catch (error) {
      console.error('[AuthPresenter] Get profiles error:', error);
      return [];
    }
  }

  /**
   * Switch the active profile
   */
  async switchProfile(profileId: string): Promise<boolean> {
    try {
      return await this.repository.switchProfile(profileId);
    } catch (error) {
      console.error('[AuthPresenter] Switch profile error:', error);
      return false;
    }
  }

  /**
   * Create a new profile
   */
  async createProfile(data: { username: string; fullName?: string; avatarUrl?: string }): Promise<AuthProfile | null> {
    try {
      return await this.repository.createProfile(data);
    } catch (error) {
      console.error('[AuthPresenter] Create profile error:', error);
      return null;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(data: ResetPasswordData): Promise<AuthResult> {
    try {
      return await this.repository.resetPassword(data);
    } catch (error) {
      console.error('[AuthPresenter] Reset password error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน',
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(data: UpdatePasswordData): Promise<AuthResult> {
    try {
      return await this.repository.updatePassword(data);
    } catch (error) {
      console.error('[AuthPresenter] Update password error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
      };
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<AuthResult> {
    try {
      return await this.repository.resendEmailVerification(email);
    } catch (error) {
      console.error('[AuthPresenter] Resend email verification error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน',
      };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      return await this.repository.verifyEmail(token);
    } catch (error) {
      console.error('[AuthPresenter] Verify email error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการยืนยันอีเมล',
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      return await this.repository.refreshSession();
    } catch (error) {
      console.error('[AuthPresenter] Refresh session error:', error);
      return null;
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    return this.repository.onAuthStateChange(callback);
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { valid: false, error: 'กรุณากรอกอีเมล' };
    }
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' };
    }
    
    return { valid: true };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
    if (!password) {
      return { valid: false, error: 'กรุณากรอกรหัสผ่าน', strength: 'weak' };
    }
    
    if (password.length < 6) {
      return { valid: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', strength: 'weak' };
    }
    
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    
    if (strengthScore <= 1) {
      return { valid: true, strength: 'weak' };
    }
    
    if (strengthScore <= 2) {
      return { valid: true, strength: 'medium' };
    }
    
    return { valid: true, strength: 'strong' };
  }

  /**
   * Validate phone number format (Thai)
   */
  validatePhone(phone: string): { valid: boolean; error?: string } {
    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[-\s]/g, '');
    
    // Thai phone number format: starts with 0 and has 10 digits
    const phoneRegex = /^0\d{9}$/;
    
    if (!phone) {
      return { valid: false, error: 'กรุณากรอกหมายเลขโทรศัพท์' };
    }
    
    if (!phoneRegex.test(cleanPhone)) {
      return { valid: false, error: 'หมายเลขโทรศัพท์ไม่ถูกต้อง (เช่น 0812345678)' };
    }
    
    return { valid: true };
  }
}
