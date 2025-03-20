"use client";

import { Suspense, useEffect, useState } from 'react';
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import dynamic from 'next/dynamic';
import { Box, Heading, Text, Flex, Container, Divider, Center, VStack } from '@chakra-ui/react';
import { UserProfile } from './components/UserProfile';

function useLaunchParams() {
  const [startParam, setStartParam] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = retrieveLaunchParams();
      setStartParam(params.tgWebAppStartParam || null);
    } catch (error) {
      console.warn('Telegramパラメータの取得に失敗しました:', error);
      console.info('ローカル環境では、URLパラメータまたはデフォルト値を使用します');
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const startapp = urlParams.get('startapp');
        if (startapp) {
          setStartParam(startapp);
        }
      } catch (urlError) {
        console.warn('URLパラメータの取得に失敗しました:', urlError);
      }
    }
  }, []);

  return { startParam };
}

const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), {
  ssr: false
});

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { startParam } = useLaunchParams();

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        if (startParam) {
          try {
            const decodedGroupId = atob(startParam);
            setGroupId(decodedGroupId);
          } catch {
            setError("Invalid group ID format");
            
            if (process.env.NODE_ENV === 'development') {
              setGroupId('test-group-1');
            }
          }
        } else {
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const startapp = params.get('startapp');
            
            if (startapp) {
              try {
                const decodedGroupId = atob(startapp);
                setGroupId(decodedGroupId);
              } catch {
                setError("Invalid group ID format");
                
                if (process.env.NODE_ENV === 'development') {
                  setGroupId('test-group-1');
                }
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                setGroupId('test-group-1');
              } else {
                setError("No group ID provided");
              }
            }
          }
        }
      } catch {
        setError("An error occurred while initializing the component");
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [startParam]);

  if (isLoading) {
    return (
      <Center minH="100vh" flexDirection="column">
        <Box className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></Box>
        <Text color="gray.600">読み込み中...</Text>
      </Center>
    );
  }

  if (error && !groupId) {
    return (
      <Center p={8} color="red.500" textAlign="center">
        <VStack>
          <Heading size="md" mb={2}>エラーが発生しました</Heading>
          <Text>{error}</Text>
        </VStack>
      </Center>
    );
  }

  if (!groupId) {
    return (
      <Center p={8} textAlign="center">
        <Text>有効なグループIDを提供してください</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" px={4} centerContent>
      <Flex direction="column" w="100%" maxW="800px" align="center">
        <VStack as="header" w="100%" textAlign="center" mb={8} spacing={1}>
          <Heading as="h1" size="2xl" color="brand.600" fontWeight="extrabold">
            Task Board
          </Heading>
          <Text fontSize="lg" fontWeight="semibold" color="gray.600">
            Group {groupId}
          </Text>
        </VStack>

        <Box as="main" w="100%">
          <UserProfile />
          <TaskForm groupId={groupId} />
          <Divider my={6} />
          <TaskList groupId={groupId} />
        </Box>

        <Center as="footer" w="100%" mt={8} py={4} color="gray.500" fontSize="sm">
          <Text>Powered by Next.js</Text>
        </Center>
      </Flex>
    </Container>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <Center minH="100vh" flexDirection="column">
        <Box className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></Box>
        <Text color="gray.600">アプリを読み込み中...</Text>
      </Center>
    }>
      <TaskBoardClient />
    </Suspense>
  );
}
