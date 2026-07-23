import { httpService } from '../http/HttpService';
import { API_URLS } from '../urls';
import { Profile } from '../../types';

export const profileService = {
  get: async (userId: string) => {
    const { data } = await httpService.get<Profile[]>(
      `${API_URLS.PROFILES}?id=eq.${userId}`,
    );
    return data?.[0] ?? null;
  },

  update: async (userId: string, updates: Partial<Profile>) => {
    const res = await httpService.put<Profile | Profile[]>(
      `${API_URLS.PROFILES}?id=eq.${userId}`, updates,
    );
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as Profile);
  },
};