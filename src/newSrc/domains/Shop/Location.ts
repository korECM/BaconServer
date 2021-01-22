import {Column} from "typeorm";
import {IsLatitude, IsLongitude} from "class-validator";

export enum LocationCategory {
    front = "front", back = "back", hs_station = "hs_station", front_far = "front_far"
}

export class Location {
    @Column({nullable: false})
    address: string;
    @Column('varchar', {length: 15, nullable: false})
    locationCategory: LocationCategory;
    @Column({nullable: false})
    @IsLatitude()
    latitude: string;
    @Column({nullable: false})
    @IsLongitude()
    longitude: string;

    constructor(address: string, locationCategory: LocationCategory, latitude: string, longitude: string) {
        this.address = address;
        this.locationCategory = locationCategory;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
