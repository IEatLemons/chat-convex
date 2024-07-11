import { GenericMutationCtx } from 'convex/server';
import { Id } from '../../_generated/dataModel';

// 记录使用情况
export const recordUsage = async ({
    ctx,
    args,
}: {
    ctx: GenericMutationCtx<any>;
    args: {
        user: Id<'users'>;
        model_id: Id<'openai_model'>;
        // currentDate: Date
    };
}): Promise<any> => {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const hour = currentDate.getHours();

    const collect = await ctx.db
        .query('chat_collect')
        .filter((q) =>
            q.and(
                q.eq(q.field('user'), args.user),
                q.eq(q.field('model_id'), args.model_id),
                q.eq(q.field('year'), year),
                q.eq(q.field('month'), month),
                q.eq(q.field('day'), day),
                q.eq(q.field('hour'), hour),
            ),
        )
        .unique();

    if (collect) {
        await ctx.db.patch(collect._id, {
            number: collect.number + 1,
        });
    } else {
        await ctx.db.insert('chat_collect', {
            user: args.user,
            model_id: args.model_id,
            year: year,
            month: month,
            day: day,
            hour: hour,
            number: 1,
        });
    }
};
