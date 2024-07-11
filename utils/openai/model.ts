import Request from './request';

export type OpenaiModel = {
    created: number;
    id: string;
    object: string;
    owned_by: string;
};

export default class Model extends Request {
    public getList = async (): Promise<OpenaiModel[]> => {
        const data = await this.request(`${this.apiUrl()}/models`, {
            method: 'GET',
            headers: {
                Authorization: this.apiKey(),
            },
        });

        return data.data;
    };
}
