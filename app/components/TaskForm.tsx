"use client";

import { useState } from 'react';
import { addTask } from '../lib/firebase';
import { 
  Box, 
  Input, 
  Button,
  FormControl,
  FormLabel,
  Flex,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';

interface TaskFormProps {
  groupId: string;
}

/* デバッグ関連のインターフェース - 必要に応じてコメントを外して使用可能
interface SubmissionData {
  timestamp: string;
  task: {
    title: string;
    completed: boolean;
    groupId: string;
    createdAt: string;
  };
  result: {
    id: string;
  };
}

interface DebugState {
  groupId: string;
  submissions: SubmissionData[];
}
*/

export default function TaskForm({ groupId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  // ダークモード対応の色を設定
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  /* デバッグ関連のstate - 必要に応じてコメントを外して使用可能
  const [debug, setDebug] = useState<DebugState>({ groupId, submissions: [] });

  useEffect(() => {
    console.log('TaskForm received groupId:', groupId);
    setDebug(prev => ({ ...prev, groupId }));
  }, [groupId]);
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    
    try {
      const newTask = {
        title,
        completed: false,
        groupId,
        createdAt: new Date().toISOString()
      };
      
      await addTask(newTask);
      
      /* デバッグ情報の更新 - 必要に応じてコメントを外して使用可能
      setDebug(prev => ({
        ...prev,
        submissions: [
          ...prev.submissions,
          {
            timestamp: new Date().toISOString(),
            task: newTask,
            result: { id: result.id }
          }
        ]
      }));
      */
      
      toast({
        title: "タスクを追加しました",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      setTitle('');
      
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの追加に失敗しました。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      mb={6} 
      p={4} 
      bg={bgColor}
      borderWidth="1px" 
      borderColor={borderColor}
      borderRadius="lg"
    >
      <form onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel fontWeight="bold">新しいタスク</FormLabel>
          <Flex gap={2}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="新しいタスクを入力..."
              disabled={loading}
              variant="filled"
            />
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="追加中"
              isDisabled={!title.trim()}
              px={8}
            >
              追加
            </Button>
          </Flex>
        </FormControl>
      </form>
    </Box>
  );
} 