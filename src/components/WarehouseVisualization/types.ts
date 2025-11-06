export interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  current: number;
}

export interface Area {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  locations: Location[];
}

export interface Zone {
  id: string;
  name: string;
  emoji: string;
  type: 'inbound' | 'storage' | 'outbound';
  areas: Area[];
  totalLocations: number;
  capacity: number;
  current: number;
}

export interface Warehouse {
  id: string;
  name: string;
  zones: Zone[];
}

export interface TreeNode {
  name: string;
  emoji: string;
  value?: number;
  children?: TreeNode[];
  info?: string;
  locations?: Location[];
}
