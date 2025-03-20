"use client";

import { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import dynamic from 'next/dynamic';

// クライアントサイドのみのコンポーネント
const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [launchParams, setLaunchParams] = useState<{startParam?: string | null}>({});

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // URLパラメータから直接startappを取得
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('startapp');
        
        setLaunchParams({ startParam });
        console.log("Launch params:", { startParam });
        
        if (startParam) {
          try {
            const decodedGroupId = atob(startParam);
            console.log("Decoded Group ID:", decodedGroupId);
            setGroupId(decodedGroupId);
          } catch (error) {
            console.error("Error decoding group ID:", error);
            setError("Invalid group ID format");
          }
        } else {
          console.log("No startapp parameter available");
          // 開発用のデフォルトグループID
          if (process.env.NODE_ENV === 'development') {
            console.log("Using test group ID for development");
            setGroupId('test-group-1');
          } else {
            setError("No group ID provided");
          }
        }
      } catch (error) {
        console.error("Error in initializeComponent:", error);
        setError("An error occurred while initializing the component");
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">{error}</div>
        <div className="mt-4 text-sm">
          Launch Params: {JSON.stringify(launchParams)}
        </div>
      </div>
    );
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
        <div className="bg-gray-100 p-3 rounded text-xs mb-4">
          <div><strong>デバッグ情報</strong></div>
          <div>グループID: {groupId}</div>
          <div>起動パラメータ: {launchParams?.startParam}</div>
        </div>
        
        <TaskForm groupId={groupId} />
        <TaskList groupId={groupId} />
      </main>

      <footer className="flex justify-center text-sm text-gray-500">
        <div>Powered by Next.js</div>
        <div className="ml-4 text-xs">Group ID: {groupId}</div>
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