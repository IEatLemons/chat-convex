import { v } from 'convex/values';
import { action, internalMutation } from './_generated/server';
import { accountGet } from './utils/account';
import { internal } from './_generated/api';
import { Doc } from './_generated/dataModel';

export const getAccount = action({
    handler: async (ctx): Promise<Doc<'user_account'>> => {
        const user = await ctx.runQuery(
            internal.users.internalGetUserByIdentity,
        );

        return ctx.runMutation(internal.user_account.getAccountInternal, {
            user: user._id,
        });
    },
});

export const getAccountInternal = internalMutation({
    args: { user: v.id('users') },
    handler: async (ctx, args): Promise<Doc<'user_account'>> =>
        accountGet({ ctx, user: args.user }),
});
