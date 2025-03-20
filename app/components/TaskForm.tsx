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
  useColorModeValue,
} from '@chakra-ui/react';

interface TaskFormProps {
  groupId: string;
}

export default function TaskForm({ groupId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // ダークモード対応の色を設定
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
      
      toast({
        title: "Task added successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      setTitle('');
      
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error occurred",
        description: "Failed to add the task.",
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
      p={4} 
      bg={bgColor}
      borderWidth="1px" 
      borderColor={borderColor}
      borderRadius="lg"
      w="100%"
    >
      <form onSubmit={handleSubmit}>
        <FormControl>
          <FormLabel fontWeight="bold">New Task</FormLabel>
          <Flex gap={2}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a new task..."
              disabled={loading}
              variant="filled"
              flex="1"
            />
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Adding"
              isDisabled={!title.trim()}
              minW="100px"
            >
              Add
            </Button>
          </Flex>
        </FormControl>
      </form>
    </Box>
  );
} 