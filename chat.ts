import { v } from 'convex/values';
import { action, internalAction, internalMutation } from './_generated/server';
import { Chat } from './utils/openai';
import { recordUsage } from './utils/chat/chat_collect';
import { internal } from './_generated/api';

const chat = new Chat();

// 用户可以使用的聊天方法
export const chatToAssistant = action({
    args: {
        model_id: v.id('openai_model'),
        send_message: v.string(),
        thread: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<any> => {
        const user = await ctx.runQuery(
            internal.users.internalGetUserByIdentity,
        );
        return ctx.runAction(internal.chat.chatToAssistantInternal, {
            model_id: args.model_id,
            user: user._id,
            send_message: args.send_message,
            thread: args.thread,
        });
    },
});

export const chatToAssistantInternal = internalAction({
    args: {
        user: v.id('users'),
        model_id: v.id('openai_model'),
        send_message: v.string(),
        thread: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<any> =>
        chat.chatToAssistant({
            ctx,
            args: {
                user: (await ctx.runQuery(internal.users.internalGetUserByID, {
                    user: args.user,
                }))!,
                model_id: args.model_id,
                send_message: args.send_message,
                thread: args.thread,
            },
        }),
});

// 内部调用的 保存与 AI 的聊天
export const internalSaveChatToAI = internalMutation({
    args: {
        user: v.id('users'),
        model_id: v.id('openai_model'),
        thread: v.string(),
        send_message: v.string(),
        run: v.string(),
        assistant: v.optional(
            v.object({
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
            }),
        ),
    },
    handler: async (ctx, args): Promise<boolean> => {
        if (args.assistant) {
            await ctx.db.insert('openai_assistant', args.assistant);
        }

        const current = new Date();

        const history = await ctx.db
            .query('chat_history')
            .filter((q) =>
                q.and(
                    q.eq(q.field('thread'), args.thread),
                    q.eq(q.field('user'), args.user),
                    q.eq(q.field('model_id'), args.model_id),
                ),
            )
            .unique();

        // 根据历史聊天来判断是否是同一个线程
        if (history) {
            await ctx.db.patch(history._id, {
                update_time: current.getTime(),
            });
        } else {
            await ctx.db.insert('chat_history', {
                user: args.user,
                model_id: args.model_id,
                title: args.send_message,
                thread: args.thread,
                update_time: current.getTime(),
            });
        }

        await ctx.db.insert('chat_detail', {
            user: args.user,
            thread: args.thread,
            model_id: args.model_id,
            humans: args.send_message,
            robot: '',
            run: args.run,
        });

        await recordUsage({
            ctx,
            args: {
                // currentDate: current,
                user: args.user,
                model_id: args.model_id,
            },
        });

        return true;
    },
});
