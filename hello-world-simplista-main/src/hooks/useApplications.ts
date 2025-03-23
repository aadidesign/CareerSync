
import { useQuery } from '@tanstack/react-query';
import { getApplications } from '@/services/applicationService';

export function useApplications(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => getApplications(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
