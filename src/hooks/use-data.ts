'use client';

import { useEffect } from 'react';
import { useDataStore } from '@/store/data-store';

/**
 * Hook to initialize data from API on component mount.
 * Call this in your root layout or main pages to load data.
 */
export function useInitializeData() {
  const { fetchUsers, fetchLetters, fetchEvents, fetchLogs } = useDataStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchLetters(),
          fetchEvents(),
          fetchLogs(),
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    loadData();
  }, [fetchUsers, fetchLetters, fetchEvents, fetchLogs]);
}

/**
 * Hook to fetch users data
 */
export function useFetchUsers() {
  const { users, fetchUsers, isLoading, error } = useDataStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}

/**
 * Hook to fetch letters data
 */
export function useFetchLetters() {
  const { letters, fetchLetters, isLoading, error } = useDataStore();

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  return { letters, isLoading, error, refetch: fetchLetters };
}

/**
 * Hook to fetch events data
 */
export function useFetchEvents() {
  const { events, fetchEvents, isLoading, error } = useDataStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}

/**
 * Hook to fetch activity logs
 */
export function useFetchLogs() {
  const { activityLogs, fetchLogs, isLoading, error } = useDataStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs: activityLogs, isLoading, error, refetch: fetchLogs };
}

/**
 * Hook to fetch dashboard stats
 */
export function useDashboardStats() {
  const { fetchStats, getStats } = useDataStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return getStats();
}
