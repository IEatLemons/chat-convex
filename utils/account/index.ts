import { GenericMutationCtx } from "convex/server";
import { Doc, Id } from '../../_generated/dataModel';
import { ConvexError } from "convex/values";

enum AccountLogType {
    TopUp = "TopUp",
    Consumption = "Consumption",
    GiftConsumption = "GiftConsumption",
    Gift = "Gift",
    Frozen = "Frozen",
    Thaw = "Thaw",
}

enum AccountLogPunctuation {
    Add = "Add",
    Sub = "Sub"
}

// 获取 account 数据  若没有则创建
export const accountGet = async ({
    ctx, user
}: {
    ctx: GenericMutationCtx<any>,
    user: Id<'users'>
}): Promise<Doc<'user_account'>> => {
    const data = await ctx.db.query('user_account').filter(
        (q) => q.eq(q.field('user'), user)
    ).unique();

    if (!data) {
        return ctx.db.get(await ctx.db.insert('user_account', {
            user,
            top_up: 0,
            consumption: 0,
            gift: 0,
            gift_consumption: 0,
            current: 0,
            frozen: 0,
        }));
    }

    return data;
}

// 更新 account 数据
export const accountUpdate = async ({
    ctx, user, user_account, type, amount, punctuation
}:{
    ctx: GenericMutationCtx<any>,
    user: Id<'users'>,
    user_account: Id<'user_account'>,
    type: AccountLogType,
    amount: number,
    punctuation: AccountLogPunctuation
}): Promise<boolean> => {
    const account = await accountGet({ ctx, user });
    switch (type) {
        case AccountLogType.TopUp:
            await ctx.db.patch(account._id, {
                top_up: account.top_up + amount,
                current: account.current + amount
            });
            break;
        case AccountLogType.Consumption:
            if (account.current < amount) {
                throw new ConvexError(`Insufficient balance`);
            }
            await ctx.db.patch(account._id, {
                consumption: account.consumption + amount,
                current: account.current - amount
            });
            break;
        case AccountLogType.Gift:
            await ctx.db.patch(account._id, {
                gift: account.gift + amount
            });
            break;
        case AccountLogType.GiftConsumption:
            if (account.gift < amount) {
                throw new ConvexError(`Insufficient bonus balance`);
            }
            await ctx.db.patch(account._id, {
                gift_consumption: account.gift_consumption + amount,
                gift: account.gift - amount
            });
            break;
        case AccountLogType.Frozen:   // 冻结直接从余额划转过去
            if (account.current < amount) {
                throw new ConvexError(`Insufficient balance`);
            }
            await ctx.db.patch(account._id, {
                current: account.current - amount,
                frozen: account.frozen + amount
            });
            break;
        case AccountLogType.Thaw:   // 解冻从冻结划转到余额
            if (account.frozen < amount) {
                throw new ConvexError(`The unfrozen amount is greater than the frozen amount`);
            }
            await ctx.db.patch(account._id, {
                current: account.current + amount,
                frozen: account.frozen - amount
            });
            break;
    }

    await ctx.db.insert('user_account', {
        user,
        user_account,
        type,
        amount,
        punctuation
    });

    return true;
}
