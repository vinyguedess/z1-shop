import User from "#models/user";
import { inject } from "@adonisjs/core";


@inject()
export default class UsersRepository {

    async create(data: Record<string, any>): Promise<User> {
        return User.create(data);
    }

}
