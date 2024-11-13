interface MapPosition {
  latitude: number;
  longitude: number;
}

interface ParkingMarker extends MapPosition {
  id: string;
  name: string;
  freeSpaces: number;
  totalSpaces: string;
  pricePerHour: string;
}

export type { MapPosition, ParkingMarker }; 