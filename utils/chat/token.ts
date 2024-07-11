import { GenericMutationCtx } from 'convex/server';
import { Doc, Id } from '../../_generated/dataModel';

export const calculatorChaTFee = (texts: string[]) => {
    const token: number = tokenCalculator(texts);

    return tokenFeeCalculator(token);
};

export const tokenCalculator = (text: string | string[]): number => {
    if (typeof text === 'string') {
        return calculator(text);
    }

    let token: number = 0;
    text.forEach((str) => {
        token += calculator(str);
    });

    return token;
};

const calculator = (text: string): number => {
    // 正则表达式用于匹配可能的令牌，包括单词、数字和标点符号
    const tokenRegex = /\w+|[^\w\s]/g;

    // 使用正则表达式匹配文本中的令牌
    const tokens = text.match(tokenRegex);

    // 返回匹配到的令牌数量
    return tokens ? tokens.length : 0;
};

export const tokenFeeCalculator = (token: number): number => {
    const price = 0.03;

    return price * (token / 1000);
};

export const tokenGasSave = async ({
    ctx,
    detail,
    robot,
}: {
    ctx: GenericMutationCtx<any>;
    detail: Doc<'chat_detail'>;
    robot?: string;
}) => {
    const text: string[] = [detail.humans];
    if (robot && robot !== '') {
        text.push(robot);
    } else if (detail.robot !== '') {
        text.push(detail.robot);
    }
    const gas = tokenCalculator(text);
    return ctx.db.patch(detail._id, {
        robot: robot ?? detail.robot,
        gas,
    });
};
