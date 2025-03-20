'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import { useEffect } from 'react'
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
  useEffect(() => {
    // Telegram WebAppの初期化
    if (typeof window !== 'undefined') {
      try {
        WebApp.ready();
        // 背景色をTelegramのテーマに合わせる（直接HEX値を使用）
        const bgColor = theme.styles.global({ colorMode: 'light' }).body.bg;
        WebApp.setBackgroundColor(bgColor);
        // プラットフォームに合わせてヘッダーの色も設定
        WebApp.setHeaderColor(bgColor);
      } catch (error) {
        console.warn('Telegram WebApp initialization error:', error);
      }
    }
  }, []);

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