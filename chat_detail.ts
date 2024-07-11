import { ConvexError, v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { internalMutation, mutation, query } from './_generated/server';
import { authUser, queryUser } from './utils/auth';
import { tokenGasSave } from './utils/chat';

export const getChatDetailList = query({
    args: {
        paginationOpts: paginationOptsValidator,
        thread: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await queryUser(ctx);
        const data = await ctx.db
            .query('chat_detail')
            .filter((q) =>
                q.and(
                    q.eq(q.field('thread'), args.thread),
                    q.eq(q.field('user'), user._id),
                ),
            )
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

export const saveRobot = mutation({
    args: { robot: v.string(), detail: v.id('chat_detail') },
    handler: async (ctx, args) => {
        await authUser(ctx);
        const detail = await ctx.db.get(args.detail);
        if (detail) {
            if (detail.robot !== '') {
                throw new ConvexError(`Do not repeat operation`);
            }

            await tokenGasSave({
                ctx,
                detail,
                robot: args.robot,
            });
            return true;
        }
        throw new ConvexError(`detail error`);
    },
});

export const scriptToComputeGas = internalMutation({
    handler: async (ctx) => {
        const list = await ctx.db
            .query('chat_detail')
            .filter((q) =>
                q.and(
                    q.neq(q.field('humans'), ''),
                    q.neq(q.field('robot'), ''),
                    q.eq(q.field('gas'), undefined),
                ),
            )
            .collect();

        list.forEach(async (detail) => {
            await tokenGasSave({ ctx, detail });
        });
    },
});
