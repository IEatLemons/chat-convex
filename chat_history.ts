import { paginationOptsValidator } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import {
    action,
    internalMutation,
    internalQuery,
    mutation,
    query,
} from './_generated/server';
import { authUser, queryUser } from './utils/auth';
import { internal } from './_generated/api';

export const getChatHistory = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        const user = await queryUser(ctx);
        return ctx.db
            .query('chat_history')
            .filter((q) => q.eq(q.field('user'), user._id))
            .paginate(args.paginationOpts);
    },
});

export const internalGetChatHistoryByID = internalQuery({
    args: { history: v.id('chat_history') },
    handler: async (ctx, args) => ctx.db.get(args.history),
});

export const getListAccordingToTimePeriod = query({
    args: {
        paginationOpts: paginationOptsValidator,
        time_period: v.object({
            start: v.number(),
            end: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        const user = await queryUser(ctx);
        const data = await ctx.db
            .query('chat_history')
            .withIndex('by_update_time', (q) =>
                q
                    .gte('update_time', args.time_period.start)
                    .lte('update_time', args.time_period.end),
            )
            .filter((q) => q.eq(q.field('user'), user._id))
            .order('desc')
            .paginate(args.paginationOpts);

        const page = await Promise.all(
            data.page.map(async (item) => ({
                ...item,
                ...{
                    model_info: await ctx.db.get(item.model_id),
                },
            })),
        );
        return { ...data, page };
    },
});

export const deleteHistory = action({
    args: { history: v.id('chat_history'), thread: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(
            internal.users.internalGetUserByIdentity,
        );

        const history = await ctx.runQuery(
            internal.chat_history.internalGetChatHistoryByID,
            { history: args.history },
        );
        if (!history) {
            throw new ConvexError('The history value does not exist');
        }
        if (history.user !== user._id) {
            throw new ConvexError(`That history doesn't belong to you`);
        }

        try {
            // 暂时不删除 寻找办法解决
            // await chat.deleteThread(args.thread);
            await ctx.runMutation(
                internal.chat_history.internalDeleteHistory,
                args,
            );
        } catch (error: any) {
            throw new ConvexError(error);
        }
        return true;
    },
});

export const internalDeleteHistory = internalMutation({
    args: { history: v.id('chat_history'), thread: v.string() },
    handler: async (ctx, args) => {
        const details = await ctx.db
            .query('chat_detail')
            .filter((q) => q.eq(q.field('thread'), args.thread))
            .collect();
        await Promise.all(
            details.map(async (item) => {
                await ctx.db.delete(item._id);
            }),
        );
        await ctx.db.delete(args.history);
        await ctx.db.insert('recycle_bin', {
            type: 'delete thread',
            value: args.thread,
        });
    },
});

export const updateHistoryName = mutation({
    args: { title: v.string(), history: v.id('chat_history') },
    handler: async (ctx, args) => {
        await authUser(ctx);
        await ctx.db.patch(args.history, {
            title: args.title,
        });
    },
});
