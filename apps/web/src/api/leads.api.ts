import { http } from './client';
import type { Lead, CreateLeadPayload } from './types';

export const leadsApi = {
  create: (payload: CreateLeadPayload) =>
    http.post<Lead>('/leads', payload),

  list: () => http.get<Lead[]>('/leads'),

  get: (id: string) => http.get<Lead>(`/leads/${id}`),

  retry: (id: string) => http.post<Lead>(`/leads/${id}/retry`, {}),
};
