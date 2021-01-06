import {BaseReport} from "./BaseReport";
import {Review} from "../Review/Review";
import {Entity, ManyToOne} from "typeorm";

@Entity()
export class ReviewReport extends BaseReport {
    @ManyToOne(type => Review, {onUpdate: "CASCADE", onDelete: "CASCADE"})
    review: Review
}