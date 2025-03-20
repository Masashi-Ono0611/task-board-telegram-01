/**
 * Telegram WebApp に関する型定義
 */

import WebApp from '@twa-dev/sdk';

// TelegramUserの型定義
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

// TelegramWebAppInitDataの型定義
export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date?: string;
  hash?: string;
}

// グローバルWindow型の拡張
declare global {
  interface Window {
    Telegram: {
      WebApp: typeof WebApp;
    };
    // TelegramGameProxyの型定義を追加
    TelegramGameProxy?: {
      receiveEvent: (eventName: string, eventData?: string) => void;
      postEvent: (eventName: string, eventData?: string) => void;
    };
  }
}

export {}; 