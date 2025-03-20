import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { TelegramUser } from '../types/telegram';
import { addDebugMessage } from './firebase';

/**
 * Telegramユーザー情報を検証するための関数
 */
export const validateTelegramUser = (user: TelegramUser): boolean => {
  if (!user.id || !user.first_name) {
    addDebugMessage(`❌ Invalid Telegram user data`);
    return false;
  }
  return true;
};

/**
 * Firebase認証を行う関数
 */
export const signInWithTelegram = async (user: TelegramUser) => {
  try {
    addDebugMessage(`Attempting to sign in with Telegram user: ${user.id}`);
    
    // ユーザー情報の検証
    if (!validateTelegramUser(user)) {
      throw new Error('Invalid user data');
    }

    if (process.env.NODE_ENV === 'development') {
      // 開発環境では認証処理をスキップ
      addDebugMessage('Skipping Firebase authentication in development mode');
      // モックユーザー情報を返す
      return {
        uid: 'dev-' + user.id,
        displayName: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
        isAnonymous: true
      };
    } else {
      // 本番環境ではカスタムトークンを使用
      // TODO: サーバーサイドでカスタムトークンを生成する処理を実装
      throw new Error('Custom token authentication not implemented for production');
    }

  } catch (error: any) {
    addDebugMessage(`❌ Error signing in with Telegram: ${error?.message || 'Unknown error'}`);
    throw error;
  }
};

/**
 * ユーザーのサインアウト処理
 */
export const signOut = async () => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const auth = getAuth();
      await auth.signOut();
    }
    addDebugMessage('✅ Successfully signed out');
  } catch (error: any) {
    addDebugMessage(`❌ Error signing out: ${error?.message || 'Unknown error'}`);
    throw error;
  }
};

/**
 * 現在のユーザーの認証状態を取得
 */
export const getCurrentUser = () => {
  if (process.env.NODE_ENV === 'development') {
    // 開発環境ではモックユーザーを返す
    return {
      uid: 'dev-user',
      isAnonymous: true
    };
  }
  const auth = getAuth();
  return auth.currentUser;
}; 