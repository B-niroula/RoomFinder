export interface RoomEntry {
    id: string,
    address: string,
    title: string,
    description: string,
    rent: number,
    bedrooms: number,
    bathrooms: number,
    squareFeet?: number,
    amenities: string[],
    availableDate: string,
    contactEmail: string,
    contactPhone?: string,
    photoUrl?: string,
    isAvailable: boolean,
    ownerId?: string,
    ownerName?: string
}
