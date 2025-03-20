"use client";

import { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import dynamic from 'next/dynamic';
import { getDebugMessages, clearDebugMessages, addDebugMessage } from './lib/firebase';

/* デバッグ関連の型定義とコード - 必要に応じてコメントを外して使用可能
interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warn';
}

const APP_VERSION = '1.0.1';
*/

const APP_VERSION = '1.0.3';

// カスタムフックの作成（最新バージョンの対応）
function useLaunchParams() {
  // サーバーサイドでの実行時に問題が発生しないようにする
  if (typeof window === 'undefined') {
    return { startParam: null };
  }

  try {
    // retrieveLaunchParamsの結果を直接返す
    const params = retrieveLaunchParams();
    return {
      startParam: params.tgWebAppStartParam || null
    };
  } catch (error) {
    // エラーをキャッチし、ローカル開発環境用のデフォルト値を返す
    console.warn('Telegramパラメータの取得に失敗しました:', error);
    console.info('ローカル環境では、URLパラメータまたはデフォルト値を使用します');
    
    // URLパラメータから取得を試みる
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const startapp = urlParams.get('startapp');
      if (startapp) {
        return { startParam: startapp };
      }
    } catch (urlError) {
      console.warn('URLパラメータの取得に失敗しました:', urlError);
    }
    
    // デフォルト値を返す
    return { startParam: null };
  }
}

const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);
  
  // Telegram MiniApp SDKからパラメータを取得
  const { startParam } = useLaunchParams();

  // デバッグメッセージを定期的に更新
  useEffect(() => {
    const updateDebugMessages = () => {
      setDebugMessages(getDebugMessages());
    };

    // 初回実行
    updateDebugMessages();

    // 1秒ごとに更新
    const interval = setInterval(updateDebugMessages, 1000);

    return () => {
      clearInterval(interval);
      clearDebugMessages();
    };
  }, []);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Telegram MiniApp SDKのパラメータを使用
        if (startParam) {
          addDebugMessage(`Telegram SDK startParam: ${startParam}`);
          
          try {
            const decodedGroupId = atob(startParam);
            addDebugMessage(`Decoded Group ID: ${decodedGroupId}`);
            setGroupId(decodedGroupId);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addDebugMessage(`Error decoding group ID: ${errorMessage}`, 'error');
            setError("Invalid group ID format");
            
            // 開発環境ではテスト用のグループIDを使用
            if (process.env.NODE_ENV === 'development') {
              setGroupId('test-group-1');
            }
          }
        } else {
          // URLパラメータからのフォールバック（従来の方法）
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const startapp = params.get('startapp');
            
            // デバッグ情報
            addDebugMessage(`No Telegram startParam, using URL: ${startapp || 'none'}`);
            
            if (startapp) {
              try {
                const decodedGroupId = atob(startapp);
                addDebugMessage(`Decoded URL Group ID: ${decodedGroupId}`);
                setGroupId(decodedGroupId);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addDebugMessage(`Error decoding URL group ID: ${errorMessage}`, 'error');
                setError("Invalid group ID format");
                
                if (process.env.NODE_ENV === 'development') {
                  setGroupId('test-group-1');
                }
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                addDebugMessage('Using test group ID for development');
                setGroupId('test-group-1');
              } else {
                addDebugMessage('No group ID provided', 'error');
                setError("No group ID provided");
              }
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addDebugMessage(`Error in initializeComponent: ${errorMessage}`, 'error');
        setError("An error occurred while initializing the component");
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [startParam]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error && !groupId) {
    return (
      <div className="p-8 text-red-500 text-center">
        <h2 className="text-lg font-bold mb-2">エラーが発生しました</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="p-8 text-center">
        <p>有効なグループIDを提供してください</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between mb-8">
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="text-xl font-bold text-blue-600">
            Task Board - Group {groupId}
          </h1>
        </header>

        <main className="flex-1">
          <TaskForm groupId={groupId} />
          <hr className="my-6 border-gray-300" />
          <TaskList groupId={groupId} />
          
          {/* デバッグ情報 */}
          <div className="mt-10">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="mb-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              {showDebug ? 'デバッグ情報を隠す' : 'デバッグ情報を表示'}
            </button>
            {showDebug && (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <h2 className="text-lg font-bold mb-3">デバッグ情報 (v{APP_VERSION})</h2>
                <div className="space-y-1">
                  {debugMessages.map((message, index) => (
                    <code key={index} className="block text-xs p-1 bg-gray-100 rounded">
                      {message}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="flex justify-center mt-8 py-4 text-gray-500 text-sm">
          <p>Powered by Next.js</p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen flex-col">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">アプリを読み込み中...</p>
      </div>
    }>
      <TaskBoardClient />
    </Suspense>
  );
}
