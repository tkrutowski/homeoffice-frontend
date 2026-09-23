import httpCommon from '@/config/http-common';
import type { AccountProfile, UpdateProfilePayload } from '@/features/account/profile/types';

interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  enabled: boolean;
  joinDate: string;
  lastLoginDate: string | null;
  lastLoginDateDisplay: string;
  notLocked: boolean;
  idEmployee: number | null;
  avatarUrl: string | null;
}

function normalizeProfile(dto: UserDto): AccountProfile {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    username: dto.username,
    email: dto.email,
    enabled: dto.enabled,
    notLocked: dto.notLocked,
    joinDate: new Date(dto.joinDate),
    lastLoginDate: dto.lastLoginDate ? new Date(dto.lastLoginDate) : null,
    lastLoginDateDisplay: new Date(dto.lastLoginDateDisplay),
    idEmployee: dto.idEmployee,
    avatarUrl: dto.avatarUrl,
  };
}

export async function fetchMyProfile(): Promise<AccountProfile> {
  const response = await httpCommon.get<UserDto>('/v1/user/me');
  return normalizeProfile(response.data);
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<AccountProfile> {
  const response = await httpCommon.put<UserDto>('/v1/user/me', payload);
  return normalizeProfile(response.data);
}
