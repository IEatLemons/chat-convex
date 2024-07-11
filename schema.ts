import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        name: v.string(),
        tokenIdentifier: v.string(),
    }).index('by_token', ['tokenIdentifier']),
    user_account: defineTable({
        user: v.id('users'),
        top_up: v.number(), // 充值
        consumption: v.number(), // 消费
        gift: v.number(), // 赠送金额
        gift_consumption: v.number(), // 消费赠送金额
        current: v.number(), // 活期余额
        frozen: v.number(), // 冻结余额
    }),
    user_account_log: defineTable({
        user: v.id('users'),
        user_account: v.id('user_account'),
        type: v.union(
            v.literal('TopUp'),
            v.literal('Consumption'),
            v.literal('Gift'),
            v.literal('Frozen'),
            v.literal('Thaw'),
        ),
        amount: v.number(),
        punctuation: v.union(v.literal('Add'), v.literal('Sub')),
    }),

    // OPEN AI
    openai_model: defineTable({
        created: v.number(),
        id: v.string(),
        object: v.string(),
        owned_by: v.string(),
    }),
    openai_assistant: defineTable({
        model_id: v.id('openai_model'),
        model: v.string(),
        name: v.union(v.string(), v.null()),
        description: v.union(v.string(), v.null()),
        instructions: v.union(v.string(), v.null()),
        tools: v.array(v.any()),
        file_ids: v.array(v.any()),
        metadata: v.any(),
        object: v.string(),
        id: v.string(),
        created_at: v.number(),
    }).index('by_openai_id', ['id']),

    // CHAT
    chat_history: defineTable({
        user: v.id('users'),
        model_id: v.id('openai_model'),
        title: v.string(),
        thread: v.string(),
        update_time: v.number(),
    })
        .index('by_update_time', ['update_time'])
        .index('by_update_user', ['update_time', 'user']),
    chat_detail: defineTable({
        user: v.id('users'),
        model_id: v.id('openai_model'),
        thread: v.string(),
        run: v.string(),
        humans: v.string(),
        robot: v.string(),
        gas: v.optional(v.number()),
    }),
    chat_collect: defineTable({
        user: v.id('users'),
        model_id: v.id('openai_model'),
        year: v.number(),
        month: v.number(),
        day: v.number(),
        hour: v.number(),
        number: v.number(),
    }),
    recycle_bin: defineTable({
        type: v.string(),
        value: v.any(),
    }),

    // v2 version
    v2_chat_detail: defineTable({
        user: v.id('users'),
        model: v.string(),
        humans: v.string(),
        robot: v.string(),
        gas: v.optional(v.number()),
    }),
    v2_chat_collect: defineTable({
        user: v.id('users'),
        year: v.number(),
        month: v.number(),
        day: v.number(),
        hour: v.number(),
        number: v.number(),
        gas: v.number(),
    }),
});
