import {CreateDateColumn, UpdateDateColumn} from "typeorm";

export abstract class FoodingBaseEntity {

    @CreateDateColumn()
    createdTime: Date

    @UpdateDateColumn()
    updatedTime: Date
}