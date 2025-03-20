import { Box, Text, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useTelegramUser } from '../hooks/useTelegramUser';

export function UserProfile() {
  const { user, loading, error } = useTelegramUser();

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
        <Text mt={2}>Loading user profile...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading profile</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>No user data</AlertTitle>
        <AlertDescription>Please make sure you're accessing this app through Telegram.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box p={4}>
      <Text fontSize="lg" fontWeight="bold">User Profile</Text>
      <Box mt={2}>
        <Text>Name: {user.first_name} {user.last_name || ''}</Text>
        {user.username && <Text>Username: @{user.username}</Text>}
        <Text>Member since: {new Date(user.createdAt).toLocaleDateString()}</Text>
        <Text>Last login: {new Date(user.lastLogin).toLocaleDateString()}</Text>
        <Text>Groups: {user.groups.length}</Text>
      </Box>
    </Box>
  );
} 