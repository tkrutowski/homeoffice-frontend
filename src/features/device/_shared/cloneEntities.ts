import type { Device } from '@/features/device/devices/types';
import type { Computer } from '@/features/device/computers/types';

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
    firm: device.firm ? { ...device.firm, address: device.firm.address ? { ...device.firm.address } : device.firm.address } : null,
  };
}

function cloneDeviceOrNull(device: Device | null): Device | null {
  return device ? cloneDevice(device) : null;
}

export function cloneComputer(computer: Computer): Computer {
  return {
    ...computer,
    processor: cloneDeviceOrNull(computer.processor),
    motherboard: cloneDeviceOrNull(computer.motherboard),
    ram: computer.ram.map(cloneDevice),
    disk: computer.disk.map(cloneDevice),
    power: cloneDeviceOrNull(computer.power),
    cooling: computer.cooling.map(cloneDevice),
    display: computer.display.map(cloneDevice),
    keyboard: cloneDeviceOrNull(computer.keyboard),
    mouse: cloneDeviceOrNull(computer.mouse),
    computerCase: cloneDeviceOrNull(computer.computerCase),
    soundCard: cloneDeviceOrNull(computer.soundCard),
    graphicCard: computer.graphicCard.map(cloneDevice),
    usb: computer.usb.map(cloneDevice),
  };
}
