/* eslint-disable */
import type { unsetMarker, AnyRouter, AnyRootConfig, CreateRouterInner, Procedure, ProcedureBuilder, ProcedureParams, ProcedureRouterRecord, ProcedureType } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import createUserRouter from "./User.router";
import createSubscriptionRouter from "./Subscription.router";
import createCourseRouter from "./Course.router";
import createWalletRouter from "./Wallet.router";
import createReferralRouter from "./Referral.router";
import createTransactionRouter from "./Transaction.router";
import createSocialAccountRouter from "./SocialAccount.router";
import createSkillFeedVideoRouter from "./SkillFeedVideo.router";
import { ClientType as UserClientType } from "./User.router";
import { ClientType as SubscriptionClientType } from "./Subscription.router";
import { ClientType as CourseClientType } from "./Course.router";
import { ClientType as WalletClientType } from "./Wallet.router";
import { ClientType as ReferralClientType } from "./Referral.router";
import { ClientType as TransactionClientType } from "./Transaction.router";
import { ClientType as SocialAccountClientType } from "./SocialAccount.router";
import { ClientType as SkillFeedVideoClientType } from "./SkillFeedVideo.router";

export type BaseConfig = AnyRootConfig;

export type RouterFactory<Config extends BaseConfig> = <
    ProcRouterRecord extends ProcedureRouterRecord
>(
    procedures: ProcRouterRecord
) => CreateRouterInner<Config, ProcRouterRecord>;

export type UnsetMarker = typeof unsetMarker;

export type ProcBuilder<Config extends BaseConfig> = ProcedureBuilder<
    ProcedureParams<Config, any, any, any, UnsetMarker, UnsetMarker, any>
>;

export function db(ctx: any) {
    if (!ctx.prisma) {
        throw new Error('Missing "prisma" field in trpc context');
    }
    return ctx.prisma as PrismaClient;
}

export function createRouter<Config extends BaseConfig>(router: RouterFactory<Config>, procedure: ProcBuilder<Config>) {
    return router({
        user: createUserRouter(router, procedure),
        subscription: createSubscriptionRouter(router, procedure),
        course: createCourseRouter(router, procedure),
        wallet: createWalletRouter(router, procedure),
        referral: createReferralRouter(router, procedure),
        transaction: createTransactionRouter(router, procedure),
        socialAccount: createSocialAccountRouter(router, procedure),
        skillFeedVideo: createSkillFeedVideoRouter(router, procedure),
    }
    );
}

export interface ClientType<AppRouter extends AnyRouter> {
    user: UserClientType<AppRouter>;
    subscription: SubscriptionClientType<AppRouter>;
    course: CourseClientType<AppRouter>;
    wallet: WalletClientType<AppRouter>;
    referral: ReferralClientType<AppRouter>;
    transaction: TransactionClientType<AppRouter>;
    socialAccount: SocialAccountClientType<AppRouter>;
    skillFeedVideo: SkillFeedVideoClientType<AppRouter>;
}
