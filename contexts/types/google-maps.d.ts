declare namespace google {
  export namespace maps {
    export interface LatLngLiteral {
      lat: number
      lng: number
    }
    export class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
      equals(other: LatLng): boolean
      toUrlValue(precision?: number): string
      toString(): string
    }
    export class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions)
    }
    export interface MapOptions {
      center?: LatLngLiteral
      zoom?: number
    }
  }
}

declare global {
  interface Window {
    google: typeof google
  }
}

