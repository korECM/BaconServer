import {UserForSignInResponse} from "../Dtos/User";
import {Role, User} from "../domains/User/User";
import env from "../env";
import jwt from "jsonwebtoken"
import express from "express";
import {Action} from "routing-controllers";
import {Container} from "typedi";
import {UserAuthService} from "../Services/UserAuthService";

export class AuthMiddleware {

    static ONE_DAY = 70 * 60 * 24;

    static async authorization(action: Action, roles: string[]) {
        const token = action.request.cookies.access_token;
        if (!token) return false

        try {
            const decoded = jwt.verify(token, env.secret.jwt) as Record<string, any>

            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp - now < AuthMiddleware.ONE_DAY * 3.5) {
                const userAuthService = Container.get(UserAuthService)
                let user = await userAuthService.findUserById(decoded.id)
                if (!user) return false

                action.response.cookie('access_token', AuthMiddleware.generateToken(user), {
                    maxAge: AuthMiddleware.ONE_DAY * 7,
                    httpOnly: true,
                });
            }

            return true
        } catch (e) {
            return false;
        }
    }

    static async currentUser(action: Action) {
        const token = action.request.cookies.access_token;
        if (!token) return false

        try {
            const decoded = jwt.verify(token, env.secret.jwt) as Record<string, any>

            const userAuthService = Container.get(UserAuthService)
            return await userAuthService.findUserById(decoded.id);

        } catch (e) {
            return null;
        }
    }

    static generateToken(user: UserForSignInResponse | User) {
        const userToken = {
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.role === Role.admin
        }
        return jwt.sign(userToken, env.secret.jwt, {
            expiresIn: '7d'
        })
    }

    static userToToken(res: express.Response, user: UserForSignInResponse | null) {
        if (!user) return
        let token = AuthMiddleware.generateToken(user);

        res.cookie('access_token', token, {
            maxAge: AuthMiddleware.ONE_DAY * 7,
            httpOnly: true,
        });
    };
}