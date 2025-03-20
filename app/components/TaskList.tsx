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
  useColorModeValue,
  Container,
  Collapse,
  IconButton,
  VStack,
  Code,
  Flex
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

interface TaskListProps {
  groupId: string;
}

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

export default function TaskList({ groupId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugQueries, setDebugQueries] = useState<DebugQueryResult[]>([]);
  
  // ダークモード対応の色を設定
  const loadingTextColor = useColorModeValue('gray.600', 'gray.400');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
  const debugBgColor = useColorModeValue('gray.50', 'gray.800');
  const debugCodeBgColor = useColorModeValue('gray.100', 'gray.900');

  useEffect(() => {
    if (!db) {
      console.error('Firestore is not initialized or null');
      setError('Database initialization failed');
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

      const queryDebugInfo = {
        collection: 'tasks',
        filters: [
          { field: 'groupId', operator: '==', value: groupId }
        ],
        orderBy: [
          { field: 'createdAt', direction: 'desc' }
        ]
      };
      
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
          setDebugQueries(prev => [...prev, {
            timestamp: new Date().toISOString(),
            query: queryDebugInfo,
            resultCount: taskList.length,
            results: taskList
          }]);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching tasks:', err);
          setError(`Failed to fetch tasks: ${err.message}`);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error setting up query:', err);
      setError(`Failed to set up query: ${err}`);
      setLoading(false);
    }
  }, [groupId]);

  return (
    <Box w="100%">
      {loading ? (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" color="brand.500" />
          <Text mt={4} color={loadingTextColor}>Loading tasks...</Text>
        </Box>
      ) : error ? (
        <Alert status="error" variant="subtle" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error Occurred</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      ) : tasks.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Text color={emptyTextColor} fontSize="lg">No tasks available</Text>
        </Box>
      ) : (
        <Stack spacing={4} w="100%">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </Stack>
      )}

      {/* デバッグ情報 */}
      <Box mt={4}>
        <Flex justify="center" mb={2}>
          <IconButton
            aria-label="Toggle debug info"
            icon={showDebug ? <ChevronUpIcon /> : <ChevronDownIcon />}
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          />
        </Flex>
        <Collapse in={showDebug}>
          <Box 
            p={4} 
            bg={debugBgColor} 
            borderRadius="md" 
            fontSize="sm"
            w="100%"
          >
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">Debug Information:</Text>
              <Text>Group ID: <Code>{groupId}</Code></Text>
              {debugQueries.length > 0 && (
                <Box w="100%">
                  <Text fontWeight="semibold">Recent Query:</Text>
                  <Box 
                    as="pre" 
                    mt={1} 
                    p={2} 
                    bg={debugCodeBgColor}
                    borderRadius="md"
                    overflow="auto"
                    maxH="200px"
                    fontSize="xs"
                  >
                    {JSON.stringify(debugQueries[debugQueries.length - 1], null, 2)}
                  </Box>
                </Box>
              )}
            </VStack>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
} 