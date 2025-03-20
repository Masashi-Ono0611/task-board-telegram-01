"use client";

import { Suspense, useEffect, useState, useRef } from 'react';
import Image from "next/image";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import dynamic from 'next/dynamic';

// ログの型定義
interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warn';
}

// バージョン識別用のコンスタント
const APP_VERSION = '1.0.1'; // キャッシュをバイパスするためのバージョン変数

// クライアントサイドのみのコンポーネント
const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [urlParams, setUrlParams] = useState<{[key: string]: string | null}>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const mountedRef = useRef(false);

  // デバッグモードを確認
  const isDebugMode = typeof window !== 'undefined' && 
    (window.location.search.includes('debug=true') || process.env.NODE_ENV === 'development');

  // ログ関数をオーバーライドして、ステートに保存する
  useEffect(() => {
    if (typeof window !== 'undefined' && !mountedRef.current) {
      mountedRef.current = true;
      
      // ログ追加関数
      const addLog = (message: string, type: 'info' | 'error' | 'warn' = 'info') => {
        const entry = {
          timestamp: new Date().toISOString(),
          message: typeof message === 'object' ? JSON.stringify(message) : String(message),
          type
        };
        
        setLogs(prev => [...prev, entry]);
        return entry;
      };
      
      // コンソールログをオーバーライド
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.log = function(...args) {
        originalLog.apply(console, args);
        addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
      };
      
      console.error = function(...args) {
        originalError.apply(console, args);
        addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '), 'error');
      };
      
      console.warn = function(...args) {
        originalWarn.apply(console, args);
        addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '), 'warn');
      };
      
      // 必ず表示されるようにHTMLに直接書き込む
      const debugDiv = document.createElement('div');
      debugDiv.style.position = 'fixed';
      debugDiv.style.top = '0';
      debugDiv.style.left = '0';
      debugDiv.style.width = '100%';
      debugDiv.style.backgroundColor = 'rgba(255, 255, 0, 0.8)';
      debugDiv.style.color = 'black';
      debugDiv.style.padding = '5px';
      debugDiv.style.zIndex = '9999';
      debugDiv.style.fontSize = '12px';
      debugDiv.innerHTML = `
        <strong>デバッグモード: v${APP_VERSION}</strong> - 
        URL: ${window.location.href} - 
        時刻: ${new Date().toISOString()}
      `;
      document.body.appendChild(debugDiv);
      
      // マウント時に初期ログ
      addLog(`Component mounted - v${APP_VERSION}`);
      addLog(`URL: ${window.location.href}`);
    }
  }, []);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        console.log('initializeComponent started');
        
        // URLからパラメータを取得
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const paramsObj: {[key: string]: string | null} = {};
          
          // すべてのURLパラメータを取得
          params.forEach((value, key) => {
            paramsObj[key] = value;
          });
          
          setUrlParams(paramsObj);
          console.log("URL parameters:", paramsObj);
          
          // startappパラメータを確認
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
              
              // 開発用フォールバック
              if (process.env.NODE_ENV === 'development') {
                console.log("Using test group ID for development");
                setGroupId('test-group-1');
              }
            }
          } else {
            console.log("No startapp parameter available");
            
            // 開発環境では、デフォルトグループIDを使用
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
        console.log("Setting loading to false");
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // 常にデバッグ情報を表示するヘルパー関数
  const renderDebugLogs = () => (
    <div className="mt-4 p-2 bg-yellow-100 text-xs overflow-auto max-h-60">
      <div className="font-bold">デバッグログ (v{APP_VERSION}):</div>
      {logs.map((log, i) => (
        <div key={i} className={`${log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-orange-500' : 'text-gray-700'}`}>
          [{log.timestamp.split('T')[1].split('.')[0]}] {log.message}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <div>Loading...</div>
        {renderDebugLogs()}
      </div>
    );
  }

  if (error && !groupId) {
    return (
      <div className="p-8">
        <div className="text-red-500">{error}</div>
        <div className="mt-4 text-sm">
          URL Parameters: {JSON.stringify(urlParams)}
        </div>
        {renderDebugLogs()}
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="p-8">
        <div>Please provide a valid group ID</div>
        {renderDebugLogs()}
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
        <div className="bg-gray-100 p-3 rounded text-xs mb-4">
          <div><strong>デバッグ情報 (v{APP_VERSION})</strong></div>
          <div>グループID: {groupId}</div>
          <div>起動パラメータ: {urlParams['startapp'] || "なし"}</div>
          <div>すべてのパラメータ: {JSON.stringify(urlParams)}</div>
          <div>URL: {typeof window !== 'undefined' ? window.location.href : ''}</div>
          
          <div className="mt-2">
            <div className="font-bold">デバッグログ:</div>
            <div className="max-h-40 overflow-auto">
              {logs.map((log, i) => (
                <div key={i} className={`${log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-orange-500' : 'text-gray-700'}`}>
                  [{log.timestamp.split('T')[1].split('.')[0]}] {log.message}
                </div>
              ))}
            </div>
          </div>
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
