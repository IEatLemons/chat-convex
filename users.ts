import { v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { authUser, queryUser } from "./utils/auth";
import { Doc } from "./_generated/dataModel";

export const internalGetUserByID = internalQuery({
    args: {user: v.id('users')},
    handler: async (ctx, args) => ctx.db.get(args.user),
});

export const internalGetUserByIdentity = internalQuery({
    handler: async (ctx) => queryUser(ctx)
});

export const login = mutation({
    handler: async (ctx):Promise<Doc<'users'>> => authUser(ctx)
});