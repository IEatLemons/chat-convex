import { ConvexError } from 'convex/values';

export default class Request {
    private key: string;

    constructor(apikey?: string | undefined) {
        if (apikey) {
            this.key = apikey;
        } else {
            if (!process.env.OPENAI_API_KEY) {
                throw new ConvexError(
                    'You need to provide OPENAI_API_KEY env variable',
                );
            }
            this.key = process.env.OPENAI_API_KEY as string;
        }
    }

    // eslint-disable-next-line class-methods-use-this
    protected toUrlEncoded(obj: any): string {
        return Object.keys(obj)
            .filter((key) => obj[key as keyof any] !== undefined) // 使用类型断言确保键的类型安全
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(obj[key as keyof any]!)}`,
            )
            .join('&');
    }

    // eslint-disable-next-line class-methods-use-this
    protected request = async (url: string, params: object) =>
        fetch(url, params)
            .then((response) => {
                if (!response.ok) {
                    console.log(`[Request] ${url}`);
                    // console.log(`[Params]`, params);
                    console.log(`[response]`, response);
                    throw new ConvexError('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw new ConvexError(error);
            });

    // eslint-disable-next-line class-methods-use-this
    protected apiUrl = (): string => 'https://api.openai.com/v1';

    protected apiKey = (): string => `Bearer ${this.key}`;
}
