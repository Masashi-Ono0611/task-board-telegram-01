"use client";

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';
import TaskItem from './TaskItem';
import { 
  Box, 
  Text, 
  Stack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue
} from '@chakra-ui/react';

interface TaskListProps {
  groupId: string;
}

/* デバッグ関連のインターフェース - 必要に応じてコメントを外して使用可能
interface QueryDebugInfo {
  collection: string;
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  orderBy: Array<{
    field: string;
    direction: string;
  }>;
}

interface DebugQueryResult {
  timestamp: string;
  query: QueryDebugInfo;
  resultCount: number;
  results: Task[];
}
*/

export default function TaskList({ groupId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ダークモード対応の色を設定
  const loadingTextColor = useColorModeValue('gray.600', 'gray.400');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

  /* デバッグ関連のstate - 必要に応じてコメントを外して使用可能
  const [debugQueries, setDebugQueries] = useState<DebugQueryResult[]>([]);
  */

  useEffect(() => {
    if (!db) {
      console.error('Firestore is not initialized or null');
      setError('データベースの初期化に失敗しました');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const tasksCollection = collection(db, 'tasks');
      
      const q = query(
        tasksCollection,
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      /* デバッグ情報 - 必要に応じてコメントを外して使用可能
      const queryDebugInfo = {
        collection: 'tasks',
        filters: [
          { field: 'groupId', operator: '==', value: groupId }
        ],
        orderBy: [
          { field: 'createdAt', direction: 'desc' }
        ]
      };
      */
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const taskList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data
            } as Task;
          });
          
          setTasks(taskList);
          /* デバッグ情報の更新 - 必要に応じてコメントを外して使用可能
          setDebugQueries(prev => [...prev, {
            timestamp: new Date().toISOString(),
            query: queryDebugInfo,
            resultCount: taskList.length,
            results: taskList
          }]);
          */
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching tasks:', err);
          setError(`タスクの取得に失敗しました: ${err.message}`);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error setting up query:', err);
      setError(`クエリの設定に失敗しました: ${err}`);
      setLoading(false);
    }
  }, [groupId]);

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} color={loadingTextColor}>読み込み中...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" variant="subtle" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>エラーが発生しました</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Text color={emptyTextColor} fontSize="lg">タスクはありません</Text>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Stack spacing={4}>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </Stack>
    </Box>
  );
} 