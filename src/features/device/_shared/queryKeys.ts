export const deviceKeys = {
  all: ['device'] as const,
  devices: {
    all: () => [...deviceKeys.all, 'devices'] as const,
    list: () => [...deviceKeys.devices.all(), 'list'] as const,
    detail: (id: number) => [...deviceKeys.devices.all(), 'detail', id] as const,
    types: () => [...deviceKeys.devices.all(), 'types'] as const,
  },
  computers: {
    all: () => [...deviceKeys.all, 'computers'] as const,
    list: () => [...deviceKeys.computers.all(), 'list'] as const,
    detail: (id: number) => [...deviceKeys.computers.all(), 'detail', id] as const,
  },
};
