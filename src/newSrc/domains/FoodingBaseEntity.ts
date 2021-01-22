import {BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {validateOrReject} from "class-validator";

export abstract class FoodingBaseEntity {

    @CreateDateColumn()
    createdTime: Date

    @UpdateDateColumn()
    updatedTime: Date

    @BeforeInsert()
    @BeforeUpdate()
    async validate(): Promise<void> {
        await validateOrReject(this);
    }
}