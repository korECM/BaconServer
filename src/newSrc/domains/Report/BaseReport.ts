import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {Column, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../User/User";
import {MaxLength} from "class-validator";

export enum ReportState {
    issued = 'issued',
    rejected = 'rejected',
    done = 'done',
}

export abstract class BaseReport extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column('varchar', {length: 400, nullable: false})
    @MaxLength(400)
    comment: string;
    @Column('varchar', {length: 15, default: ReportState.issued, nullable: false})
    reportState: ReportState;

    @ManyToOne(type => User, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    issuedBy: User;
}