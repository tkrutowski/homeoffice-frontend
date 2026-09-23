export const accountKeys = {
  all: ['account'] as const,

  profile: () => [...accountKeys.all, 'profile'] as const,

  activity: (limit: number) => [...accountKeys.all, 'activity', limit] as const,

  passkeys: () => [...accountKeys.all, 'passkeys'] as const,
};
