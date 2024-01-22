import { GenericMutationCtx } from "convex/server"
import { Doc, Id } from "../../_generated/dataModel"
import { authUser } from "../auth"
import { tokenCalculator } from "./token"

export const saveMessageV2 = async ({
    ctx, message, model, robot, id
} : {
    ctx: GenericMutationCtx<any>,
    message: string,
    model: string,
    robot: boolean,
    id? : Id<'v2_chat_detail'>
}): Promise<Id<'v2_chat_detail'> | null> => {
    const user = await authUser(ctx);

    if (!robot) {
        return ctx.db.insert('v2_chat_detail', {
            user: user._id,
            model,
            humans: message,
            robot: '',
            gas: tokenCalculator(message),
        });
    }
    if (robot && id) {
        const detail = await ctx.db.get(id);
        if (id) {
            await ctx.db.patch(id, {
                robot: message,
                gas: detail.gas + tokenCalculator(message),
            });
            return id;
        }
    }

    return null;
}