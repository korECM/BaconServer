import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {FoodingBaseEntity} from "../FoodingBaseEntity";
import {Shop} from "../Shop/Shop";
import {Review} from "../Review/Review";
import {Score} from "../Score/Score";
import {Image} from "../Image/Image";
import bcrypt from "bcrypt"
import {IsEmail, IsOptional, Length, MaxLength} from "class-validator";

export enum AuthProvider {
    local = "local",
    kakao = "kakao"
}

export enum Gender {
    m = 'm',
    f = 'f'
}

export enum Role {
    user = 'user',
    admin = 'admin',
}

@Entity()
export class User extends FoodingBaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column('varchar', {length: 21, nullable: false})
    @Length(2, 10)
    name: string;
    @Column("varchar", {nullable: true})
    @IsOptional()
    @IsEmail()
    @MaxLength(50)
    email: string | null;

    @Column('varchar', {length: 10, nullable: false})
    provider: AuthProvider;
    @Column()
    kakaoNameSet: boolean = false;
    @Column('varchar', {length: 1, nullable: false})
    gender: Gender;
    @Column('varchar', {nullable: true, length: 30})
    snsId: string | null;
    @Column('varchar', {nullable: true, length: 70, select: false})
    password: string | null;
    @Column('varchar', {length: 10, nullable: false})
    role: Role;

    @ManyToMany(type => Shop, shop => shop.likers, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinTable()
    likeShops: Shop[]

    @OneToMany(type => Review, review => review.shop)
    reviews: Review[]

    @OneToMany(type => Image, image => image.by)
    images: Image[]

    @ManyToMany(type => Review, review => review.likers, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    likeReviews: Review[]

    @OneToMany(type => Score, score => score.by)
    scores: Score[]

    @BeforeUpdate()
    @BeforeInsert()
    async hashPassword() {
        if (this.password !== null) {
            this.password = await bcrypt.hash(this.password, 8);
        }
    }

    async hasPassword(unencryptedPassword: string): Promise<boolean> {
        if (!this.password) return false;
        return bcrypt.compare(unencryptedPassword, this.password);
    }

}