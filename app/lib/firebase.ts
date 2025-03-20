'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Firestore } from 'firebase/firestore';

/* デバッグ関連の定数と関数 - 必要に応じてコメントを外して使用可能
const FB_VERSION = '1.0.1';

const logToDOM = (message: string, type: 'info' | 'error' | 'warn' = 'info') => {
  if (typeof document !== 'undefined') {
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

    const logItem = document.createElement('div');
    logItem.style.margin = '2px 0';
    logItem.style.color = type === 'error' ? 'red' : type === 'warn' ? 'orange' : 'white';
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    logItem.textContent = `[${time}] [Firebase v${FB_VERSION}] ${message}`;
    logContainer.appendChild(logItem);
    
    logContainer.scrollTop = logContainer.scrollHeight;
  }
};

const maskValue = (value: string | undefined): string => {
  if (!value) return '未設定';
  if (value.length > 8) {
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
  return '設定済み（短すぎる値）';
};
*/

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore;

try {
  console.log('Firebaseアプリを初期化中...');
  const app = initializeApp(firebaseConfig);
  console.log('Firebaseアプリの初期化成功');

  console.log('Firestoreを初期化中...');
  db = getFirestore(app);
  console.log('Firestoreの初期化成功');
} catch (error) {
  console.error('Firebaseの初期化エラー:', error);
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
  
  if (!db) {
    console.error('Firestoreが初期化されていません');
    throw new Error('Firestoreが初期化されていません');
  }
  
  try {
    const result = await addDoc(collection(db, 'tasks'), task);
    console.log('タスク追加成功:', result.id);
    return result;
  } catch (error) {
    console.error('タスク追加エラー:', error);
    throw error;
  }
};

export { db }; 