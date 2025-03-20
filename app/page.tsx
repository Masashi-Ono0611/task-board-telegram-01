"use client";

import { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import dynamic from 'next/dynamic';

/* デバッグ関連の型定義とコード - 必要に応じてコメントを外して使用可能
interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warn';
}

const APP_VERSION = '1.0.1';
*/

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
        console.log('initializeComponent started');
        
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const startapp = params.get('startapp');
          console.log("startapp parameter:", startapp);
          
          if (startapp) {
            try {
              console.log("Attempting to decode:", startapp);
              const decodedGroupId = atob(startapp);
              console.log("Decoded Group ID:", decodedGroupId);
              setGroupId(decodedGroupId);
            } catch (error) {
              console.error("Error decoding group ID:", error);
              setError("Invalid group ID format");
              
              if (process.env.NODE_ENV === 'development') {
                console.log("Using test group ID for development");
                setGroupId('test-group-1');
              }
            }
          } else {
            console.log("No startapp parameter available");
            
            if (process.env.NODE_ENV === 'development') {
              console.log("Using test group ID for development");
              setGroupId('test-group-1');
            } else {
              setError("No group ID provided");
            }
          }
        } else {
          console.log("Window is not defined (SSR context)");
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
    return (
      <div className="p-8">
        <div>Loading...</div>
      </div>
    );
  }

  if (error && !groupId) {
    return (
      <div className="p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="p-8">
        <div>Please provide a valid group ID</div>
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
        <h1 className="text-2xl font-bold">Task Board - Group {groupId}</h1>
      </header>

      <main className="flex flex-col gap-8">
        <TaskForm groupId={groupId} />
        <TaskList groupId={groupId} />
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
