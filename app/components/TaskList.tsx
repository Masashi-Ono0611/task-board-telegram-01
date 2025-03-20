"use client";

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  groupId: string;
}

export default function TaskList({ groupId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      console.error('Firestore is not initialized');
      setError('データベースの初期化に失敗しました');
      setLoading(false);
      return;
    }

    console.log('Fetching tasks for groupId:', groupId);
    setLoading(true);
    
    try {
      const q = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('Snapshot received:', snapshot.size, 'documents');
          const taskList = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('Document data:', data);
            return {
              id: doc.id,
              ...data
            } as Task;
          });
          setTasks(taskList);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching tasks:', err);
          setError(`タスクの取得に失敗しました: ${err.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up query:', err);
      setError(`クエリの設定に失敗しました: ${err}`);
      setLoading(false);
    }
  }, [groupId]);

  if (loading) {
    return <div className="text-center">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <div className="text-center text-gray-500">タスクはありません</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
} 