import Request from './request';

export type CreateRequest = {
    messages?: any[],
    metadata?: object,
}

export type CreateResult = {
    id: string,
    object: string,
    created_at: number,
    metadata: object,
}

export type RunRequest = {
    thread_id: string
    assistant_id: string,
}

export type RunResult = {
    id: string,
    object: string,
    created_at: number,
    thread_id: string,
    assistant_id: string,
    status: string,
    required_action: string,
    last_error: string,
    expires_at: number,
    started_at: number | null,
    cancelled_at: number | null,
    failed_at: number | null,
    completed_at: number | null,
    model: string,
    instructions: string,
    tools: any[],
    file_ids: string[],
    metadata: any,
}

export type CreateAndRunParams = {
    assistant_id: string,
    thread: {
        messages: {
            role: string,
            content: string,
            file_ids?: string[],
            metadata?: object
        }[],
        metadata?: object
    },
    model?: string,
    instructions?: string,
    tools?: string[],
    metadata?: object
}

export default class Thread extends Request {
    protected headers = () => ({
        'Authorization': this.apiKey(),
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
    });

    public create = async (data?: CreateRequest): Promise<CreateResult> => this.request(
        `${this.apiUrl()}/threads`,
        {
            method: 'POST',
            headers: this.headers(),
            body: data ? JSON.stringify(data) : null
        }
    )

    public get = async (thread: string): Promise<CreateResult> => this.request(
        `${this.apiUrl()}/threads/${thread}`,
        {
            method: 'GET',
            headers: this.headers()
        }
    );

    public delete = async (thread: string) => this.request(
        `${this.apiUrl()}/threads/${thread}`,
        {
            method: 'DELETE',
            Headers: this.headers()
        }
    );

    public createAndRun = async (data: CreateAndRunParams): Promise<RunResult> => this.request(
        `${this.apiUrl()}/threads/runs`,
        {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(data),
        }
    )

    public onlyRun = async (params: RunRequest): Promise<RunResult> => this.request(
        `${this.apiUrl()}/threads/${params.thread_id}/runs`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({
                assistant_id: params.assistant_id
            })
        }
    )
}

export class ThreadV2 extends Thread {
    protected headers = () => ({
        'Authorization': this.apiKey(),
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
    });
}
