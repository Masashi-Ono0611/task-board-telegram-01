'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// カスタムテーマの設定
const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3', // メインカラー
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#1A202C' : '#EBF8FF',  // 直接的なHEX値を使用
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    Checkbox: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
})

function TelegramWebAppProvider({ children }: { children: React.ReactNode }) {
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Telegram WebAppの初期化
    if (typeof window !== 'undefined') {
      try {
        // WebAppの初期化
        WebApp.ready();
        // 背景色をTelegramのテーマに合わせる（直接HEX値を使用）
        const bgColor = theme.styles.global({ colorMode: 'light' }).body.bg;
        WebApp.setBackgroundColor(bgColor);
        // プラットフォームに合わせてヘッダーの色も設定
        WebApp.setHeaderColor(bgColor);

        // TelegramGameProxyの初期化
        if (window.TelegramGameProxy) {
          console.log('TelegramGameProxy is available');
          // メソッド存在チェックを追加
          if (typeof window.TelegramGameProxy.postEvent === 'function') {
            // 初期化イベントを送信
            window.TelegramGameProxy.postEvent('web_app_ready', '');
          } else {
            console.warn('TelegramGameProxy.postEvent is not a function, skipping event posting');
            // 利用可能なメソッドの確認
            console.log('Available TelegramGameProxy methods:', Object.keys(window.TelegramGameProxy));
          }
        } else {
          console.warn('TelegramGameProxy is not available, falling back to WebApp only mode');
        }
      } catch (error) {
        console.error('Telegram WebApp initialization error:', error);
        setInitError(error instanceof Error ? error.message : String(error));
      }
    }
  }, []);

  // エラー表示コンポーネントをここに追加することも可能
  // if (initError) {
  //   return <div>Initialization Error: {initError}</div>;
  // }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme} resetCSS={false}>
        <TelegramWebAppProvider>
          {children}
        </TelegramWebAppProvider>
      </ChakraProvider>
    </CacheProvider>
  )
} 