"use client";

import { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import WebApp from "@twa-dev/sdk";
import dynamic from 'next/dynamic';

// クライアントサイドのみのレンダリングのためのコンポーネント
const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // ローカル開発用のデフォルトグループID
        const defaultGroupId = 'test-group-1';
        
        // URLからstartappパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('startapp');

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
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!groupId) {
    return <div className="p-8">有効なグループIDを提供してください</div>;
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