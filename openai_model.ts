import { v } from 'convex/values';
import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { Chat } from './utils/openai';
import { internal } from './_generated/api';

export const getModelList = query({
    handler: async (ctx) => ctx.db.query('openai_model').collect(),
});

export const saveModel = internalMutation({
    args: { id: v.string(), created: v.number(), object: v.string(), owned_by: v.string() },
    handler: async (ctx, args) => {
        const data = await ctx.db.query('openai_model').filter(
            (q) => q.eq(q.field('id'), args.id)
        ).unique();

        return data?._id ?? ctx.db.insert('openai_model', args);
    }
});

export const syncModel = internalAction({
    handler: async (ctx) => {
        const chat = new Chat();

        const data = await chat.getModelList();

        const reData: any[] | PromiseLike<any[]> = [];
        await Promise.all(data.map(async (item) => {
            if (item.id.includes('gpt-')) {
                reData.push(item);
                await ctx.runMutation(internal.openai_model.saveModel, item);
            }
        }));

        return reData;
    }
})

export const getModelById = internalQuery({
    args: { model: v.id('openai_model') },
    handler: async (ctx, args) => ctx.db.get(args.model),
});