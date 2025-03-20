'use client';

import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  DocumentReference,
  Timestamp,
  FieldValue,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { TelegramUser } from '../types/telegram';

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

const FB_VERSION = '1.0.3';

// デバッグメッセージを格納する配列
export const debugMessages: string[] = [];

// デバッグメッセージを追加する関数
export function addDebugMessage(message: string) {
  const formattedMessage = `${new Date().toISOString()} - ${message}`;
  debugMessages.push(formattedMessage);
  // 最新の100メッセージのみを保持
  if (debugMessages.length > 100) {
    debugMessages.shift();
  }
  // コンソールにも出力
  console.log(formattedMessage);
}

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
  addDebugMessage('Firebaseアプリを初期化中...');
  const app = initializeApp(firebaseConfig);
  addDebugMessage('Firebaseアプリの初期化成功');

  addDebugMessage('Firestoreを初期化中...');
  db = getFirestore(app);
  addDebugMessage('Firestoreの初期化成功');
} catch (error: any) {
  addDebugMessage(`Firebaseの初期化エラー: ${error?.message || 'Unknown error'}`);
  throw error;
}

// ユーザー関連の型定義
interface FirestoreUser extends Omit<TelegramUser, 'id'> {
  telegramId: number;
  lastSeen: FieldValue | Timestamp;
  createdAt: FieldValue | Timestamp;
  updatedAt: FieldValue | Timestamp;
  groups: string[];
}

// ユーザー管理関連の関数
export async function saveUserToFirestore(user: TelegramUser): Promise<void> {
  if (!db) {
    addDebugMessage('❌ Failed to save user: Firestore not initialized');
    throw new Error('Firestore not initialized');
  }

  try {
    const userRef = doc(db, 'users', user.id.toString());
    const userDoc = await getDoc(userRef);
    
    // 新しいフィールド名のみを使用
    const userData = {
      telegramId: user.id,
      firstName: user.first_name,
      lastName: user.last_name || undefined,
      username: user.username || undefined,
      languageCode: user.language_code || undefined,
      isPremium: user.is_premium || false,
      lastSeen: serverTimestamp(),
      groups: [],
      ...(userDoc.exists() ? {} : {
        createdAt: serverTimestamp(),
      }),
      updatedAt: serverTimestamp(),
    };

    if (userDoc.exists()) {
      // 既存のドキュメントを更新する前に、古いフィールドを削除
      const oldFields = [
        'first_name',
        'last_name',
        'language_code',
        'is_premium'
      ];
      
      const batch = writeBatch(db);
      batch.update(userRef, userData);
      // 古いフィールドを削除
      oldFields.forEach(field => {
        batch.update(userRef, { [field]: deleteField() });
      });
      
      await batch.commit();
      addDebugMessage(`✅ Updated user ${user.id} in Firestore`);
    } else {
      await setDoc(userRef, userData);
      addDebugMessage(`✅ Created new user ${user.id} in Firestore`);
    }
    addDebugMessage('User data successfully saved to Firestore');
  } catch (error: any) {
    addDebugMessage(`❌ Error saving user ${user.id}: ${error?.message || 'Unknown error'}`);
    throw error;
  }
}

// タスク関連の型定義と関数
interface NewTask {
  title: string;
  completed: boolean;
  groupId: string;
  createdAt: string;
  userId?: string;  // タスクの作成者ID
}

export const addTask = async (task: NewTask) => {
  addDebugMessage(`タスク追加リクエスト: ${task.title.substring(0, 10)}...`);
  
  if (!db) {
    const errorMsg = 'Firestoreが初期化されていません';
    addDebugMessage(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  try {
    const result = await addDoc(collection(db, 'tasks'), {
      ...task,
      createdAt: serverTimestamp()
    });
    addDebugMessage(`✅ タスク追加成功: ${result.id}`);
    return result;
  } catch (error: any) {
    addDebugMessage(`❌ タスク追加エラー: ${error?.message || 'Unknown error'}`);
    throw error;
  }
};

export { db }; 