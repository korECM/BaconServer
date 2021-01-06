import {BaseReport} from "./BaseReport";
import {Entity, ManyToOne} from "typeorm";
import {Image} from "../Image/Image";

@Entity()
export class ImageReport extends BaseReport {
    @ManyToOne(type => Image, {onUpdate: "CASCADE", onDelete: "CASCADE"})
    image: Image
}