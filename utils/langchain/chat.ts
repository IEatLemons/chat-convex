import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { PromptTemplate } from 'langchain/prompts';
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationChain } from "langchain/chains";

export interface Memory {
    human: string,
    robot: string
}

export class Chat {
    testChat = async () => {
        const chatModel = new ChatOpenAI({
            modelName: "gpt-4",
            callbacks: [
                {
                    handleLLMEnd(output) {
                    console.log(JSON.stringify(output, null, 2));
                    },
                },
            ],
        });
    }
}
