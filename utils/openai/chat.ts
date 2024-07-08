// convex
import { GenericActionCtx } from 'convex/server';
import { Doc, Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';

// local
import type { ListRequest, MessageResult } from './message';
import Model from './model';
import Assistant, { AssistantV2 } from './assistant';
import Thread, { RunResult, ThreadV2 } from './thread';
import Message, { MessageV2 } from './message';

type chatParams = {
    user: Doc<'users'>,
    model_id: Id<'openai_model'>,
    send_message: string,
    thread: string | undefined,
}

type chatAssistant = {
    isNew: boolean,
    data?: Doc<'openai_assistant'>
}

export default class Chat {
    private modelsService = new Model();
    private assistantService = new AssistantV2();
    private threadService = new ThreadV2();
    private messageService = new MessageV2();

    public getModelList = async () => this.modelsService.getList();

    public getMessageList = async (params : ListRequest): Promise<MessageResult[]> => this.messageService.getList(params);

    public chatToAssistant = async ({ ctx, args }:{
        ctx: GenericActionCtx<any>,
        args: chatParams
    }): Promise<{thread: string}> => {
        const model = await ctx.runQuery(internal.openai_model.getModelById, {model: args.model_id});

        // 第一步：确认是否存在助理
        const chatAssistant: chatAssistant = {
            isNew: false,
        }
        const assistant = await ctx.runQuery(internal.openai_assistant.getAssistantByModel, {model: args.model_id});
        if (!assistant) {
            const new_assistant = await this.assistantService.create({model: model!.id});
            chatAssistant.isNew = true;
            chatAssistant.data = new_assistant as unknown as Doc<'openai_assistant'>;
            chatAssistant.data.model_id = args.model_id;
        } else {
            chatAssistant.data = assistant;
        }


        // 第三步开始创建消息并运行
        return this.createRun({
            ctx,
            args,
            assistant: chatAssistant.data!,
            thread: args.thread
        });
    }

    // 删除线程
    public deleteThread = async (thread: string) => this.threadService.delete(thread);

    // 创建聊天 并 Run
    private createRun = async ({ ctx, args, thread, assistant } : {
        ctx: GenericActionCtx<any>,
        args: chatParams,
        thread: string | undefined,
        assistant: Doc<'openai_assistant'>
    }): Promise<{thread: string}> => {
        let run: RunResult;
        const send_message = args.send_message;
        if (!thread) {
            run = await this.threadService.createAndRun({
                assistant_id: assistant.id,
                thread: {
                    messages: [{
                        role: 'user',
                        content: send_message
                    }],
                }
            })
        } else {
            await this.messageService.create({
                thread_id: thread,
                role: 'user',
                content: send_message
            });
    
            run = await this.threadService.onlyRun({
                thread_id: thread,
                assistant_id: assistant.id
            });
        }

        await ctx.runMutation(internal.chat.internalSaveChatToAI, {
            run: run.id,
            thread: run.thread_id,
            model_id: args.model_id,
            user: args.user._id,
            send_message: args.send_message
        });

        return {
            thread: run.thread_id
        };
    }
}