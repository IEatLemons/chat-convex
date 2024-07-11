import { v } from 'convex/values';
import { internalQuery } from './_generated/server';

// -------------------------------------------- internalQuery
export const getAssistantByID = internalQuery({
    args: { assistantID: v.id('openai_assistant') },
    handler: async (ctx, args) => ctx.db.get(args.assistantID),
});

export const getAssistantByModel = internalQuery({
    args: { model: v.id('openai_model') },
    handler: async (ctx, args) =>
        ctx.db
            .query('openai_assistant')
            .filter((q) => q.and(q.eq(q.field('model'), args.model)))
            .unique(),
});
