import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { TelegramUser, UserData } from '../types/telegram';
import { handleUserAuth } from '../lib/auth';

export function useTelegramUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initUser() {
      try {
        // Telegram WebAppからユーザー情報を取得
        const tgUser = WebApp.initDataUnsafe.user as TelegramUser;
        
        if (!tgUser) {
          throw new Error('Telegram user data not found');
        }

        // ユーザー認証とデータ取得
        const userData = await handleUserAuth(tgUser);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize user'));
      } finally {
        setLoading(false);
      }
    }

    initUser();
  }, []);

  return { user, loading, error };
} 