'use client';

import { useState, useEffect } from 'react';
import { TelegramUser } from '../types/telegram';
import { signInWithTelegram, getCurrentUser } from '../lib/auth';
import { addDebugMessage } from '../lib/firebase';

// WebAppをクライアントサイドでのみインポート
let WebApp: any;
if (typeof window !== 'undefined') {
  WebApp = require('@twa-dev/sdk').default;
}

export const useTelegramUser = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // WebAppが利用可能かどうかをチェック
        const isWebAppAvailable = typeof window !== 'undefined' && WebApp;
        
        if (isWebAppAvailable) {
          // WebAppから初期データを取得
          const initDataUnsafe = WebApp.initDataUnsafe;
          
          if (initDataUnsafe.user) {
            // Telegramユーザーオブジェクトを作成
            const telegramUser: TelegramUser = {
              id: initDataUnsafe.user.id,
              first_name: initDataUnsafe.user.first_name,
              last_name: initDataUnsafe.user.last_name,
              username: initDataUnsafe.user.username,
              language_code: initDataUnsafe.user.language_code,
              is_premium: initDataUnsafe.user.is_premium
            };
            
            // Firebase認証を試行
            await signInWithTelegram(telegramUser);
            
            // ユーザー情報を設定
            setUser(telegramUser);
            addDebugMessage('User initialized from WebApp');
            setLoading(false);
            return;
          }
        }
        
        // WebAppが利用できない場合や、ユーザー情報がない場合
        if (process.env.NODE_ENV === 'development') {
          // 開発環境用のモックユーザー
          const mockUser: TelegramUser = {
            id: 12345,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en'
          };
          
          try {
            await signInWithTelegram(mockUser);
          } catch (authError) {
            addDebugMessage('Non-critical authentication error in development: ' + authError, 'warn');
          }
          
          setUser(mockUser);
          addDebugMessage('Using mock user for development');
        } else {
          throw new Error('Telegram WebApp is not available in production');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        addDebugMessage('Error initializing user: ' + errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // 認証状態の監視
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser && user) {
      addDebugMessage('User is not authenticated', 'warn');
    }
  }, [user]);

  return { user, loading, error };
}; 