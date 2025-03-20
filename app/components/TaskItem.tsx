"use client";

import { useState } from 'react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/task';
import { 
  Box, 
  Flex, 
  Text, 
  IconButton,
  Checkbox,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // ダークモード対応の色を設定
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const completedTextColor = useColorModeValue('gray.500', 'gray.400');

  const toggleComplete = async () => {
    try {
      setIsCompleted(!isCompleted);
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !isCompleted,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      setIsCompleted(isCompleted); // 元に戻す
      toast({
        title: "更新に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteTask = async () => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'tasks', task.id));
      toast({
        title: "タスクを削除しました",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsDeleting(false);
      toast({
        title: "削除に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      p={4} 
      bg={bgColor}
      borderRadius="md" 
      boxShadow="sm"
      opacity={isDeleting ? 0.5 : 1}
      transition="opacity 0.2s"
      borderWidth="1px"
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={3}>
          <Checkbox
            isChecked={isCompleted}
            onChange={toggleComplete}
            colorScheme="blue"
            size="lg"
          />
          <Text
            fontSize="md"
            textDecoration={isCompleted ? 'line-through' : 'none'}
            color={isCompleted ? completedTextColor : textColor}
          >
            {task.title}
          </Text>
        </Flex>
        <IconButton
          aria-label="タスクを削除"
          icon={<DeleteIcon />}
          onClick={deleteTask}
          isDisabled={isDeleting}
          colorScheme="red"
          variant="ghost"
          size="sm"
        />
      </Flex>
    </Box>
  );
} 