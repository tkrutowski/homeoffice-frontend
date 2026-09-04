import type { Device } from '@/features/device/devices/types';
import type { Computer, DesktopComputer } from '@/features/device/computers/types';
import { isDesktop } from '@/features/device/computers/types';

export function cloneDevice(device: Device): Device {
  const details =
    device.details instanceof Map
      ? new Map(device.details)
      : new Map<string, string>(Object.entries((device.details as unknown as Record<string, string>) ?? {}));

  return {
    ...device,
    details,
    purchaseDate: device.purchaseDate ? new Date(device.purchaseDate) : null,
    sellDate: device.sellDate ? new Date(device.sellDate) : null,
    warrantyEndDate: device.warrantyEndDate ? new Date(device.warrantyEndDate) : null,
    insuranceEndDate: device.insuranceEndDate ? new Date(device.insuranceEndDate) : null,
    files: [...(device.files ?? [])],
    deviceType: device.deviceType ? { ...device.deviceType } : null,
    firm: device.firm
      ? { ...device.firm, address: device.firm.address ? { ...device.firm.address } : device.firm.address }
      : null,
  };
}

function cloneDeviceOrNull(device: Device | null): Device | null {
  return device ? cloneDevice(device) : null;
}

export function cloneComputer(computer: Computer): Computer {
  if (isDesktop(computer)) {
    const desktop = computer as DesktopComputer;
    return {
      ...desktop,
      processor: cloneDeviceOrNull(desktop.processor),
      motherboard: cloneDeviceOrNull(desktop.motherboard),
      ram: desktop.ram.map(cloneDevice),
      disk: desktop.disk.map(cloneDevice),
      power: cloneDeviceOrNull(desktop.power),
      cooling: desktop.cooling.map(cloneDevice),
      display: desktop.display.map(cloneDevice),
      keyboard: cloneDeviceOrNull(desktop.keyboard),
      mouse: cloneDeviceOrNull(desktop.mouse),
      computerCase: cloneDeviceOrNull(desktop.computerCase),
      soundCard: cloneDeviceOrNull(desktop.soundCard),
      graphicCard: desktop.graphicCard.map(cloneDevice),
      usb: desktop.usb.map(cloneDevice),
    };
  } else {
    // Laptop — po prostu clone bez zmian
    return {
      ...computer,
    };
  }
}
