<div align="center">

![tanebi](https://socialify.git.ci/LagrangeDev/tanebi/image?description=1&font=Bitter&forks=1&issues=1&language=1&logo=https%3A%2F%2Fstatic.live.moe%2Flagrange.jpg&name=1&pattern=Brick+Wall&pulls=1&stargazers=1&theme=Light)

[GitHub Homepage](https://github.com/LagrangeDev/tanebi)

</div>

This is the core library of the project. It provides the basic functions of the QQ protocol, such as login, message sending, and so on.

Here are the features that have been implemented or planned:

<details>
<summary> Protocol </summary>

- [x] Windows[^1]
- [x] macOS[^1]
- [x] Linux

[^1]: Theoretically. You need to find a sign server yourself.
</details>

<details>
<summary> Login </summary>

- [x] QRCode
- [x] NTEasyLogin
- [ ] Password[^2]

[^2]: Deprecated and not planned.
</details>

<details>
<summary> Message </summary>

- [x] Text
- [ ] Face
- [x] Mention (At)
- [x] Image
- [x] Reply
- [x] Record[^3]
- [x] Video[^3]
- [ ] Market Face
- [ ] Long Message
- [ ] Multi Forwarded Message
- [ ] XML
- [x] Light App[^3]
- [ ] Markdown

[^3]: Only implemented receiving.
</details>

<details>
<summary> Operation </summary>

- [x] Fetch friends
- [x] Fetch groups
- [x] Fetch group members
- [x] Send poke
- [x] Send face reaction
- [x] Recall message
- [x] Leave group
- [x] Set member card
- [ ] Ban (mute) member
- [ ] Kick member
- [ ] Set member to admin
- [x] Set special title
- [ ] Handle friend request
- [ ] Handle group request
- [ ] Handle group invitation
- [ ] Get client key
- [ ] Get cookies
</details>

<details>
<summary> Event </summary>

- [ ] Bot offline
- [x] Friend poke
- [x] Friend message recall
- [x] Friend request
- [x] Group poke
- [x] Group message recall
- [x] Group mute
- [x] Group join request
- [x] Group invited join request
- [x] Group member increase
- [x] Group member decrease
- [x] Group invitation
- [x] Group admin change
- [x] Group essence message
- [x] Group face reaction
- [ ] Group to do
</details>

## Contribution

> [!TIP]
> If you want to contribute to this project, please consider using **Visual Studio Code** instead of JetBrains IDEs to improve type inferring performance and enhance coding experience.