import { Session, User } from "better-auth/types";

declare module "better-auth/types" {
    interface User {
        role: "USER" | "ADMIN";
    }

    interface Session {
        user: User;
    }
}
