import Request from './request';

export type CreateRequest = {
    thread_id: string,
    role: string,
    content: string,
    file_ids?: any[],
    metadata?: object
}

export type MessageResult = {
    id: string,
    object: string,
    created_at: number,
    thread_id: string,
    role: string,
    content: {
        type: string,
        text: {
            value: string,
            annotations: any[]
        }
    }[],
    assistant_id: string | null,
    run_id: string | null,
    file_ids: string[],
    metadata: object,
}

export type ListRequest = {
    thread_id: string,
    limit?: number,
    order?: string,
    after?: number,
    before?: string,
}

export type GetParams = {
    thread_id: string,
    message_id: string,
}

export default class Message extends Request {
    protected headers = () => ({
        'Authorization': this.apiKey(),
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
    });

    public getList = async ( params : ListRequest): Promise<MessageResult[]> => {
        const {thread_id} = params;
        params.thread_id = '';
        const data = await this.request(
            `${this.apiUrl()}/threads/${thread_id}/messages?${this.toUrlEncoded(params)}`,
            {
                method: 'GET',
                headers: this.headers(),
            }
        )

        return data.data;
    };

    public get = async (params: GetParams) => this.request(
        `${this.apiUrl()}/threads/${params.thread_id}/messages/${params.message_id}`,
        {
            method: 'GET',
            headers: this.headers(),
        }
    )

    public create = async (params: CreateRequest): Promise<MessageResult> => this.request(
        `${this.apiUrl()}/threads/${params.thread_id}/messages`,
        {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({
                role: params.role,
                content: params.content,
            })
        }
    );
}

export class MessageV2 extends Message {
    protected headers = () => ({
        'Authorization': this.apiKey(),
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
    });
}