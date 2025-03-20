import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TelegramUser, UserData } from '../types/telegram';

export async function initUser(user: TelegramUser): Promise<UserData> {
  const userIdStr = String(user.id);
  const userRef = doc(db, 'users', userIdStr);
  const now = new Date();
  
  const userData: UserData = {
    ...user,
    createdAt: now,
    lastLogin: now,
    groups: []
  };

  await setDoc(userRef, userData);
  return userData;
}

export async function updateUserLastLogin(userId: number | string): Promise<void> {
  const userIdStr = String(userId);
  const userRef = doc(db, 'users', userIdStr);
  await updateDoc(userRef, {
    lastLogin: new Date()
  });
}

export async function getUserData(userId: number | string): Promise<UserData | null> {
  const userIdStr = String(userId);
  const userRef = doc(db, 'users', userIdStr);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserData;
}

export async function handleUserAuth(user: TelegramUser): Promise<UserData> {
  const userIdStr = String(user.id);
  const userRef = doc(db, 'users', userIdStr);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    return await initUser(user);
  } else {
    await updateUserLastLogin(user.id);
    return snapshot.data() as UserData;
  }
} 