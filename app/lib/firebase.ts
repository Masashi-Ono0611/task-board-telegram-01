'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Firestore } from 'firebase/firestore';

// バージョン識別子（キャッシュバスト用）
const FB_VERSION = '1.0.1';

// デバッグログをDOMに直接表示する関数
const logToDOM = (message: string, type: 'info' | 'error' | 'warn' = 'info') => {
  if (typeof document !== 'undefined') {
    // ログコンテナを作成または取得
    let logContainer = document.getElementById('firebase-debug-logs');
    if (!logContainer) {
      logContainer = document.createElement('div');
      logContainer.id = 'firebase-debug-logs';
      logContainer.style.position = 'fixed';
      logContainer.style.bottom = '0';
      logContainer.style.left = '0';
      logContainer.style.width = '100%';
      logContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      logContainer.style.color = 'white';
      logContainer.style.padding = '5px';
      logContainer.style.zIndex = '9999';
      logContainer.style.fontSize = '12px';
      logContainer.style.maxHeight = '150px';
      logContainer.style.overflow = 'auto';
      document.body.appendChild(logContainer);
    }

    // ログ項目を追加
    const logItem = document.createElement('div');
    logItem.style.margin = '2px 0';
    logItem.style.color = type === 'error' ? 'red' : type === 'warn' ? 'orange' : 'white';
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    logItem.textContent = `[${time}] [Firebase v${FB_VERSION}] ${message}`;
    logContainer.appendChild(logItem);
    
    // スクロールを最下部に
    logContainer.scrollTop = logContainer.scrollHeight;
  }
};

// 環境変数をデバッグするためのヘルパー関数
const maskValue = (value: string | undefined): string => {
  if (!value) return '未設定';
  if (value.length > 8) {
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
  return '設定済み（短すぎる値）';
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 環境変数のチェック - より詳細なログ
logToDOM(`環境: ${process.env.NODE_ENV || '不明'}, ブラウザ環境: ${typeof window !== 'undefined'}`);
logToDOM(`ProjectID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '未設定'}`);
console.log('環境情報:', {
  環境: process.env.NODE_ENV || '不明',
  ブラウザ環境: typeof window !== 'undefined',
  VercelURL: process.env.NEXT_PUBLIC_VERCEL_URL || '不明',
});

console.log('Firebase Config 詳細:', {
  apiKey: maskValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: maskValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '未設定',
  storageBucket: maskValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: maskValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: maskValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
});

let db: Firestore;

try {
  logToDOM('Firebaseアプリを初期化中...');
  console.log('Firebaseアプリを初期化中...');
  const app = initializeApp(firebaseConfig);
  logToDOM('Firebaseアプリの初期化成功');
  console.log('Firebaseアプリの初期化成功');

  logToDOM('Firestoreを初期化中...');
  console.log('Firestoreを初期化中...');
  db = getFirestore(app);
  logToDOM('Firestoreの初期化成功');
  console.log('Firestoreの初期化成功');
  
  // デバッグコード: Firebaseが正しく設定されているかさらに詳細な情報を表示
  logToDOM(`Firestore DB情報: ${db ? '初期化成功' : '未初期化'}`);
  if (db) {
    logToDOM(`Firestore設定: ${JSON.stringify({
      projectId: db.app.options.projectId,
      apiKey: maskValue(db.app.options.apiKey),
    })}`);
  }
} catch (error) {
  console.error('Firebaseの初期化エラー:', error);
  logToDOM(`Firebaseの初期化エラー: ${error}`, 'error');
  
  // エラーを直接表示
  if (typeof document !== 'undefined') {
    const errorDiv = document.createElement('div');
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.right = '0';
    errorDiv.style.zIndex = '9999';
    errorDiv.textContent = `Firebase初期化エラー: ${error}`;
    document.body.appendChild(errorDiv);
  }
  throw error;
}

interface NewTask {
  title: string;
  completed: boolean;
  groupId: string;
  createdAt: string;
}

export const addTask = async (task: NewTask) => {
  console.log('タスク追加リクエスト:', { ...task, title: task.title.substring(0, 10) + '...' });
  logToDOM(`タスク追加: GroupID=${task.groupId}, Title=${task.title.substring(0, 10)}...`);
  
  if (!db) {
    console.error('Firestoreが初期化されていません');
    logToDOM('Firestoreが初期化されていません', 'error');
    throw new Error('Firestoreが初期化されていません');
  }
  
  try {
    const result = await addDoc(collection(db, 'tasks'), task);
    console.log('タスク追加成功:', result.id);
    logToDOM(`タスク追加成功: ID=${result.id}`);
    return result;
  } catch (error) {
    console.error('タスク追加エラー:', error);
    logToDOM(`タスク追加エラー: ${error}`, 'error');
    throw error;
  }
};

export { db }; 