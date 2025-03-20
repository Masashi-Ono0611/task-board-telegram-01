'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 環境変数のチェック
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '設定済み' : '未設定',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '設定済み' : '未設定',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '設定済み' : '未設定',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '設定済み' : '未設定',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '設定済み' : '未設定',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '設定済み' : '未設定',
});

let db: Firestore;

try {
  console.log('Initializing Firebase app...');
  const app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  console.log('Initializing Firestore...');
  db = getFirestore(app);
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

interface NewTask {
  title: string;
  completed: boolean;
  groupId: string;
  createdAt: string;
}

export const addTask = async (task: NewTask) => {
  if (!db) throw new Error('Firestore is not initialized');
  return await addDoc(collection(db, 'tasks'), task);
};

export { db }; 