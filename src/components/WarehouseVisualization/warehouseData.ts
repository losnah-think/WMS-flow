import { Warehouse } from './types';

export const warehouseData: Warehouse = {
  id: 'wh-001',
  name: 'Warehouse A',
  zones: [
    {
      id: 'zone-a',
      name: 'Zone A',
      emoji: '',
      type: 'inbound',
      totalLocations: 31,
      capacity: 1240,
      current: 845,
      areas: [
        {
          id: 'area-a1',
          name: 'Area A-1',
          x: 50,
          y: 50,
          width: 400,
          height: 150,
          color: '#1890ff',
          locations: Array.from({ length: 16 }, (_, i) => ({
            id: `loc-a1-${i + 1}`,
            name: `A1-${String(i + 1).padStart(2, '0')}`,
            x: 60 + (i % 4) * 85,
            y: 60 + Math.floor(i / 4) * 35,
            width: 75,
            height: 30,
            capacity: 100,
            current: 45 + Math.random() * 50
          }))
        },
        {
          id: 'area-a2',
          name: 'Area A-2',
          x: 50,
          y: 220,
          width: 400,
          height: 150,
          color: '#1890ff',
          locations: Array.from({ length: 15 }, (_, i) => ({
            id: `loc-a2-${i + 1}`,
            name: `A2-${String(i + 1).padStart(2, '0')}`,
            x: 60 + (i % 3) * 110,
            y: 230 + Math.floor(i / 3) * 35,
            width: 100,
            height: 30,
            capacity: 100,
            current: 30 + Math.random() * 60
          }))
        }
      ]
    },
    {
      id: 'zone-b',
      name: 'Zone B',
      emoji: '',
      type: 'storage',
      totalLocations: 92,
      capacity: 3680,
      current: 2150,
      areas: [
        {
          id: 'area-b1',
          name: 'Area B-1',
          x: 500,
          y: 50,
          width: 400,
          height: 150,
          color: '#13c2c2',
          locations: Array.from({ length: 48 }, (_, i) => ({
            id: `loc-b1-${i + 1}`,
            name: `B1-${String(i + 1).padStart(2, '0')}`,
            x: 510 + (i % 6) * 63,
            y: 60 + Math.floor(i / 6) * 25,
            width: 58,
            height: 20,
            capacity: 80,
            current: 20 + Math.random() * 60
          }))
        },
        {
          id: 'area-b2',
          name: 'Area B-2',
          x: 500,
          y: 220,
          width: 400,
          height: 150,
          color: '#13c2c2',
          locations: Array.from({ length: 44 }, (_, i) => ({
            id: `loc-b2-${i + 1}`,
            name: `B2-${String(i + 1).padStart(2, '0')}`,
            x: 510 + (i % 6) * 63,
            y: 230 + Math.floor(i / 6) * 25,
            width: 58,
            height: 20,
            capacity: 80,
            current: 15 + Math.random() * 65
          }))
        }
      ]
    },
    {
      id: 'zone-c',
      name: 'Zone C',
      emoji: '',
      type: 'outbound',
      totalLocations: 12,
      capacity: 480,
      current: 280,
      areas: [
        {
          id: 'area-c1',
          name: 'Area C-1',
          x: 950,
          y: 50,
          width: 350,
          height: 320,
          color: '#f5222d',
          locations: Array.from({ length: 12 }, (_, i) => ({
            id: `loc-c1-${i + 1}`,
            name: `C1-${String(i + 1).padStart(2, '0')}`,
            x: 960 + (i % 4) * 80,
            y: 60 + Math.floor(i / 4) * 80,
            width: 70,
            height: 70,
            capacity: 40,
            current: 15 + Math.random() * 25
          }))
        }
      ]
    }
  ]
};
