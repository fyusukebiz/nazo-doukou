import type { DefaultUser } from "next-auth";
import { Role } from "@prisma/client";
import { User as UserAtDd } from "@prisma/client";

export interface SessionUser extends DefaultUser {
  id: string;
  role?: Role;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User extends UserAtDd {}
}
