export interface BotMsgType {
    /**
     * Get the preview string of the message
     */
    toPreviewString(): string;
}

export * from './BotMsgBubble';
export * from './BotMsgForwardBubble';
export * from './BotMsgForwardPack';
export * from './BotMsgImage';
export * from './BotMsgLightApp';
export * from './BotMsgRecord';
export * from './BotMsgVideo';