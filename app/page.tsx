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
    return <div className="p-8">Loading...</div>;
  }

  if (error && !groupId) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!groupId) {
    return <div className="p-8">Please provide a valid group ID</div>;
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8">
      <header className="flex items-center justify-between">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h1 className="text-2xl font-bold">Task Board - Group {groupId}</h1>
      </header>

      <main className="flex flex-col gap-8">
        <TaskForm groupId={groupId} />
        <TaskList groupId={groupId} />
        
        {/* デバッグ情報 */}
        <div className="mt-8">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="mb-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            {showDebug ? 'デバッグ情報を隠す' : 'デバッグ情報を表示'}
          </button>
          {showDebug && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h2 className="text-lg font-bold mb-2">デバッグ情報 (v{APP_VERSION})</h2>
              <div className="space-y-2">
                {debugMessages.map((message, index) => (
                  <div key={index} className="font-mono text-sm">
                    {message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="flex justify-center text-sm text-gray-500">
        <div>Powered by Next.js</div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <TaskBoardClient />
    </Suspense>
  );
}
