'use client';

import { useState, useEffect, useRef } from 'react';
import { TelegramUser } from '../types/telegram';
import { signInWithTelegram, getCurrentUser } from '../lib/auth';
import { addDebugMessage, saveUserToFirestore } from '../lib/firebase';

// WebAppをクライアントサイドでのみインポート
let WebApp: any;
if (typeof window !== 'undefined') {
  WebApp = require('@twa-dev/sdk').default;
}

export const useTelegramUser = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializationInProgress = useRef(false);

  // ユーザー初期化
  useEffect(() => {
    // 初期化が進行中の場合はスキップ
    if (initializationInProgress.current) return;
    
    const initializeUser = async () => {
      // 初期化フラグを設定
      initializationInProgress.current = true;
      
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
            
            try {
              addDebugMessage(`Initializing user: ${telegramUser.id}`);
              // Firebase認証を試行
              await signInWithTelegram(telegramUser);
              
              // Firestoreにユーザー情報を保存
              await saveUserToFirestore(telegramUser);
              
              // ユーザー情報を設定
              setUser(telegramUser);
              addDebugMessage('✅ User initialized and saved to Firestore');
              return;
            } catch (authError: any) {
              addDebugMessage(`❌ Authentication or Firestore error: ${authError?.message || 'Unknown error'}`);
              throw authError;
            }
          }
        }
        
        // WebAppが利用できない場合や、ユーザー情報がない場合
        if (process.env.NODE_ENV === 'development') {
          // 開発環境用のモックユーザー
          const mockUser: TelegramUser = {
            id: 5460512637, // 開発用の固定ID
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en'
          };
          
          try {
            addDebugMessage('Using mock user for development');
            await signInWithTelegram(mockUser);
            await saveUserToFirestore(mockUser);
            setUser(mockUser);
          } catch (authError: any) {
            addDebugMessage(`❌ Non-critical authentication error in development: ${authError?.message || 'Unknown error'}`);
          }
        } else {
          throw new Error('Telegram WebApp is not available in production');
        }

      } catch (err: any) {
        const errorMessage = err?.message || 'Unknown error occurred';
        setError(errorMessage);
        addDebugMessage(`❌ Error initializing user: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []); // 依存配列を空に

  // 認証状態の監視
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser && user) {
      addDebugMessage(`⚠️ User ${user.id} is not authenticated`);
    }
  }, [user]);

  return { user, loading, error };
}; 