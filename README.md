<div align="center">

![tanebi](https://socialify.git.ci/tanebijs/tanebi/image?description=1&font=Bitter&forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Light)

> It’s the blazing our sound
>
> We all sing out with the same heat
>
> We will go with our song
>
> Yet still tomorrow is unknown

</div>

NTQQ Protocol Implementation with Pure TypeScript.

The word "tanebi" is from Japanese and means "tinder" in English or "火种" in Chinese. The name is in respect of previous and contemporary QQ protocol implementation projects. No matter they are alive or not, they are the "tanebi" of today's QQ bot development.

## Packages

- [`core`](packages/core) ([npm](https://www.npmjs.com/package/tanebi)): Core library of the project, which provides the basic functions and stable runtime API of the QQ protocol.
- [`protobuf`](packages/protobuf): Protobuf infrastructure for the project, which provides efficient serialization and deserialization of protocol packets.
- [`examples`](packages/examples): Examples of using various APIs provided by the core library.
- [`app`](packages/app): Standalone QQ bot application with [OneBot 11](https://github.com/botuniverse/onebot-11) support.
- [`koishi-plugin-adapter-tanebi`](https://github.com/tanebijs/koishi-plugin-adapter-tanebi): [Koishi](https://koishi.chat/) ([GitHub homepage](https://github.com/koishijs/koishi)) plugin to use tanebi as a QQ bot backend.
- `karin-plugin-adapter-tanebi` (planned): [Karin](https://karin.fun/) ([mirror site](https://docs.karin.fun/) | [GitHub homepage](https://github.com/KarinJS/Karin)) plugin to use tanebi as a QQ bot backend.

## Special Thanks

This project could not exist without the following projects and their contributors:
- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core), providing basic project structure and most protocol packets.
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs), providing JavaScript implementation of NTQQ protocol crypto and authentication.
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq), the initial QQ protocol implementation in JavaScript, and of course, the parent project of lagrangejs.
- [NapNeko/NapCatQQ](https://github.com/NapNeko/NapCatQQ), providing JavaScript implementation of Highway logic, which is essential to uploading media.