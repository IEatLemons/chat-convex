import { GenericMutationCtx, GenericQueryCtx, UserIdentity } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export const authUser = async (ctx: GenericMutationCtx<any>):Promise<Doc<'users'>> => {
    const identity = await getIdentity(ctx);
    const user = await ctx.db.query('users').filter(
        (q:any) => q.eq(q.field('tokenIdentifier'), identity.subject)
    ).unique();
    if (!user) {
        return ctx.db.get(await ctx.db.insert('users', {
            name: identity.name ?? identity.nickname ?? '您还没留下姓名' as string,
            tokenIdentifier: identity.subject
        }));
    }

    return user;
}

export const queryUser = async (ctx: GenericQueryCtx<any>): Promise<Doc<'users'>> => {
    const identity = await getIdentity(ctx);
    const user = await ctx.db.query('users').filter(
        (q:any) => q.eq(q.field('tokenIdentifier'), identity.subject)
    ).unique();
    if (!user) {
        throw new ConvexError(`Account does not exist`);
    }
    return user;
}


const getIdentity = async (ctx: GenericMutationCtx<any> | GenericQueryCtx<any>): Promise<UserIdentity> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        throw new ConvexError("Unauthenticated request");
    }
    return identity;
}
