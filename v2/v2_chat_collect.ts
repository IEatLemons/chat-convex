import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { authUser } from '../utils/auth';
import { saveMessageV2 } from '../utils/chat';

export const collectV2 = mutation({
    args: { robot: v.boolean(), message: v.string(), model: v.string() },
    handler: async (ctx, args) =>
        saveMessageV2({
            ctx,
            message: args.message,
            robot: args.robot,
            model: args.model,
        }),
});
