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
  useColorModeValue,
  Tooltip
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
  const creatorTextColor = useColorModeValue('gray.600', 'gray.400');

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
        title: "Failed to update task",
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
        title: "Task deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsDeleting(false);
      toast({
        title: "Failed to delete task",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      p={3} 
      bg={bgColor}
      borderRadius="md" 
      boxShadow="sm"
      opacity={isDeleting ? 0.5 : 1}
      transition="opacity 0.2s"
      borderWidth="1px"
      w="100%"
    >
      <Flex justify="space-between" align="center" w="100%">
        <Flex align="center" gap={2} flex="1" minW="0">
          <Checkbox
            isChecked={isCompleted}
            onChange={toggleComplete}
            size="md"
          />
          <Flex direction="column" flex="1" minW="0" gap={0}>
            <Text
              fontSize="md"
              textDecoration={isCompleted ? 'line-through' : 'none'}
              color={isCompleted ? completedTextColor : textColor}
              isTruncated
              lineHeight="1.2"
              mb={0.5}
            >
              {task.title}
            </Text>
            {task.createdBy && (
              <Tooltip label={`User ID: ${task.createdBy.id}`}>
                <Text
                  fontSize="xs"
                  color={creatorTextColor}
                  isTruncated
                  lineHeight="1.2"
                >
                  Created by: {task.createdBy.username}
                </Text>
              </Tooltip>
            )}
          </Flex>
        </Flex>
        <IconButton
          aria-label="Delete task"
          icon={<DeleteIcon />}
          onClick={deleteTask}
          isDisabled={isDeleting}
          colorScheme="red"
          variant="ghost"
          size="sm"
          ml={2}
        />
      </Flex>
    </Box>
  );
} 