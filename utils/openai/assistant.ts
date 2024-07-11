import Request from './request';

export type CreateRequest = {
    model: string;
    name?: string;
    description?: string;
    tools?: string;
    file_ids?: string[];
    metadata?: string;
};

export type CreateResult = {
    id: string;
    object: string;
    created_at: number;
    name: string | null;
    description: string | null;
    model: string;
    instructions: string | null;
    tools: any[];
    file_ids: any[];
    metadata: any;
};

export type ListRequest = {
    limit?: string;
    order?: string;
    after?: string;
    before?: string;
};

export default class Assistant extends Request {
    protected headers = () => ({
        Authorization: this.apiKey(),
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
    });

    public getList = async (params: ListRequest): Promise<CreateResult[]> => {
        const data = await this.request(
            `${this.apiUrl()}/assistants?${this.toUrlEncoded(params)}`,
            {
                method: 'GET',
                headers: this.headers(),
            },
        );

        return data.data;
    };

    public create = async (data: CreateRequest): Promise<CreateResult> =>
        this.request(`${this.apiUrl()}/assistants`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(data),
        });

    public delete = async (assistant_id: string) =>
        this.request(`${this.apiUrl()}/assistants/${assistant_id}`, {
            method: 'DELETE',
            headers: this.headers(),
        });

    public file_list = async (id: string) =>
        this.request(`${this.apiUrl()}/assistants/${id}/files`, {
            method: 'GET',
            headers: this.headers(),
        });
}

export class AssistantV2 extends Assistant {
    protected headers = () => ({
        Authorization: this.apiKey(),
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
    });
}
