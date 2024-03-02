export interface ListAccommodationQuery {
    district?: string
    mostRecentDays?: number
    minPrice?: number
    maxPrice?: number
    location?: string
    maxDistance?: number
}

export interface Accom {
    id: string
    source: string
    propUrl: string
    propertyName: string
    price: number
    area: number
    numberOfBedRooms: number
    numberOfWCs: number
    publishedDate: string
    locationType: string
    locationValue: {
        longitude: number
        latitude: number
    }
    phoneNumber: string
    address: string
    description: string
}

export interface ListAccommodationsResponse {
    status: string
    items: Accom[]
}

export interface AccomGroupedByLocation {
    locationValue: {
        longitude: number
        latitude: number
    }
    items: Accom[]
}

const API_URL = import.meta.env.VITE_ACCOMMODATION_API_BASE_URL

export class AccomService {
    constructor() {}

    public async listAccommodations(q: ListAccommodationQuery): Promise<AccomGroupedByLocation[]> {
        const url = new URL(`${API_URL}/accommodations`)
        q.district && url.searchParams.append('district', q.district)
        q.mostRecentDays && url.searchParams.append('most_recent_days', q.mostRecentDays.toString())
        q.minPrice && url.searchParams.append('min_price', q.minPrice.toString())
        q.maxPrice && url.searchParams.append('max_price', q.maxPrice.toString())
        q.location && url.searchParams.append('location', q.location)
        q.maxDistance && url.searchParams.append('max_distance', q.maxDistance.toString())

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (data.status === 'OK') {
            // group data.items by locationValue and return list of items with updated locationValue
            const result = data.items.reduce((acc, item) => {
                const key = `${item.locationValue.longitude}-${item.locationValue.latitude}`
                const existingItem = acc[key]

                if (existingItem) {
                    existingItem.items.push(item)
                } else {
                    acc[key] = {
                        locationValue: item.locationValue,
                        items: [item]
                    }
                }

                return acc
            }, {})

            return Object.values(result)
        }

        throw new Error('Error when fetching accommodations')
    }
}
