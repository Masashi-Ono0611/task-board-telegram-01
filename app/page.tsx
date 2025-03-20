"use client";

import { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import dynamic from 'next/dynamic';

// クライアントサイドのみのレンダリングのためのコンポーネント
const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // ローカル開発用のデフォルトグループID
        const defaultGroupId = 'test-group-1';
        
        // URLからstartappパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('startapp');
        
        // デバッグ情報の収集
        const debug: {
          fullUrl: string;
          search: string;
          startParam: string | null;
          allParams: Record<string, string>;
        } = {
          fullUrl: window.location.href,
          search: window.location.search,
          startParam: startParam,
          allParams: {}
        };
        
        // すべてのURLパラメータを収集
        urlParams.forEach((value, key) => {
          debug.allParams[key] = value;
        });
        
        setDebugInfo(debug);
        console.log('Debug Info:', debug);

        if (startParam) {
          try {
            const decodedGroupId = atob(startParam);
            console.log("Decoded Group ID:", decodedGroupId);
            setGroupId(decodedGroupId);
          } catch (error) {
            console.error("Error decoding group ID:", error);
            setError("グループIDの形式が無効です");
          }
        } else {
          console.log("Using default group ID for development");
          setGroupId(defaultGroupId);
        }
      } catch (error) {
        console.error("Error in initializeComponent:", error);
        setError("コンポーネントの初期化中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">{error}</div>
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="p-8">
        <div className="mb-4">有効なグループIDを提供してください</div>
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
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
        <h1 className="text-2xl font-bold">タスクボード - グループ {groupId}</h1>
      </header>

      <main className="flex flex-col gap-8">
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded text-xs overflow-auto mb-4">
            <h3 className="font-bold mb-2">デバッグ情報:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        <TaskForm groupId={groupId} />
        <TaskList groupId={groupId} />
      </main>

      <footer className="flex justify-center text-sm text-gray-500">
        Powered by Next.js
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <TaskBoardClient />
    </Suspense>
  );
} 