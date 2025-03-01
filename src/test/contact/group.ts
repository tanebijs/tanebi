import bot from '@/test/login/fast';

const groups = await bot.getGroups();

for (const group of groups) {
    console.log(`Group ${group.name} (Uin: ${group.uin})`);

    if (group.uin === 0) {
        // Substitute with your group's Uin
        // Be sure that all members in the group are aware of this test / know you well
        // or they will be mad at you
        const sendMsgResult = await group.sendMsg(async b => {
            b.text('Hello, this is a test message.');
            b.mention((await group.getMember(0))!); // Substitute with your Uin
        });
        console.log(`Message sent, sequence: ${sendMsgResult.sequence}, timestamp: ${sendMsgResult.timestamp}`);

        const members = await group.getMembers();
        for (const member of members) {
            console.log(`  Member ${member.card || member.nickname}[${member.specialTitle}] (Uin: ${member.uin})`);
        }

        group.onMessage(msg => {
            if (msg.type === 'bubble' && msg.content.segments[0].type === 'text') {
                const content = msg.content.segments[0].content;
                if (content.startsWith('/title')) {
                    const title = content.slice(6).trim();
                    if (title.length !== 0)
                        msg.sender.setSpecialTitle(title);
                }
            }
        });
    }
}