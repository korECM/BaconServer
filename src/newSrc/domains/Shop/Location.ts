import {Column} from "typeorm";

export enum LocationCategory {
    front = "front", back = "back", hs_station = "hs_station", front_far = "front_far"
}

export class Location {
    @Column({nullable: false})
    address: string;
    @Column('varchar', {length: 15, nullable: false})
    locationCategory: LocationCategory;
    @Column({nullable: false})
    latitude: string;
    @Column({nullable: false})
    longitude: string;
}
