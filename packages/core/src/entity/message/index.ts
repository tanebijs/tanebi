export interface BotMsgType {
    /**
     * Get the preview string of the message
     */
    toPreviewString(): string;
}

export * from './BotMsgBubble';
export * from './BotMsgImage';
export * from './BotMsgLightApp';