import type { ComponentType } from '@/features/device/computers/types';

/** Sloty komponentów PC (wcześniej getter Pinia). */
export const COMPONENT_TYPES: ComponentType[] = [
  { name: 'COMPUTER_CASE', max: 1, viewName: 'Obudowa', column: 'computerCase' },
  { name: 'PROCESSOR', max: 1, viewName: 'Procesor', column: 'processor' },
  { name: 'MOTHERBOARD', max: 1, viewName: 'Płyta główna', column: 'motherboard' },
  { name: 'RAM', max: 4, viewName: 'Pamięć RAM', column: 'ram' },
  { name: 'GRAPHICS_CARD', max: 2, viewName: 'Karta graficzna', column: 'graphicCard' },
  { name: 'POWER', max: 1, viewName: 'Zasilacz', column: 'power' },
  { name: 'DISK', max: 10, viewName: 'Dysk', column: 'disk' },
  { name: 'COOLER', max: 10, viewName: 'Chłodzenie', column: 'cooling' },
  { name: 'SOUND_CARD', max: 1, viewName: 'Karta muzyczna', column: 'soundCard' },
  { name: 'KEYBOARD', max: 1, viewName: 'Klawiatura', column: 'keyboard' },
  { name: 'MOUSE', max: 1, viewName: 'Mysz', column: 'mouse' },
  { name: 'USB', max: 20, viewName: 'Urządzenia USB', column: 'usb' },
  { name: 'DISPLAY', max: 4, viewName: 'Monitor', column: 'display' },
];
