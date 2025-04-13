export interface OneBotFriend {
    user_id: number;
    qid?: string;
    nickname: string;
    remark: string;
}

export interface OneBotGroupMember {
    group_id: number;
    user_id: number;
    qid?: string;
    nickname: string;
    card: string;
    sex: OneBotGender;
    age: number;
    join_time: number;
    last_sent_time: number;
    level: string;
    role: OneBotGroupMemberRole;
    unfriendly: boolean;
    title: string;
    title_expire_time: number;
    card_changeable: boolean;
}

export interface OneBotStranger {
    user_id: number;
    qid?: string;
    nickname: string;
    sex: OneBotGender;
    age: number;
    level: number;
    sign: string;
}

export enum OneBotGender {
    Male = 'male',
    Female = 'female',
    Unknown = 'unknown',
}

export enum OneBotGroupMemberRole {
    Owner = 'owner',
    Admin = 'admin',
    Member = 'member',
}
