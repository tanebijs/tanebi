<div align="center">

![tanebi](https://socialify.git.ci/tanebijs/tanebi/image?description=1&font=Bitter&forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Light)

[GitHub Homepage](https://github.com/tanebijs/tanebi)

</div>

This is a standalone QQ bot application with [OneBot 11](https://github.com/botuniverse/onebot-11) support. It exposes API through HTTP and WebSocket, and can be used as a backend for various chatbot frameworks.

## Features

| Emoji | Status                                 |
| ----- | -------------------------------------- |
| 🟢    | Already implemented                    |
| 🟡    | Implemented in `core` but not in `app` |
| 🔴    | Not implemented                        |
| 🟠    | Implemented with issues / limitations  |
| ❌    | Deprecated / Not planned               |

### OneBot 11 Standard APIs

These APIs are defined in the [OneBot 11 standard](https://github.com/botuniverse/onebot-11/blob/master/api/public.md).

<details>
<summary> Click to expand </summary>

| API                       | Status |
| ------------------------- | ------ |
| `send_private_msg`        | 🟢     |
| `send_group_msg`          | 🟢     |
| `send_msg`                | 🟢     |
| `delete_msg`              | 🟢     |
| `get_msg`                 | 🟢     |
| `get_forward_msg`         | 🟢     |
| `send_like`               | 🔴     |
| `set_group_kick`          | 🟢     |
| `set_group_ban`           | 🟢     |
| `set_group_anonymous_ban` | ❌     |
| `set_group_whole_ban`     | 🟢     |
| `set_group_admin`         | 🟢     |
| `set_group_anonymous`     | ❌     |
| `set_group_card`          | 🟢     |
| `set_group_name`          | 🔴     |
| `set_group_leave`         | 🟠[^1] |
| `set_group_special_title` | 🟢     |
| `set_friend_add_request`  | 🟡     |
| `set_group_add_request`   | 🟡     |
| `get_login_info`          | 🟢     |
| `get_stranger_info`       | 🟢     |
| `get_friend_list`         | 🟢     |
| `get_group_info`          | 🟡     |
| `get_group_list`          | 🟡     |
| `get_group_member_info`   | 🟡     |
| `get_group_member_list`   | 🟡     |
| `get_group_honor_info`    | 🔴     |
| `get_cookies`             | 🔴     |
| `get_csrf_token`          | 🔴     |
| `get_credentials`         | 🔴     |
| `get_record`              | 🟡     |
| `get_image`               | 🟡     |
| `can_send_image`          | 🟢     |
| `can_send_record`         | 🟢     |
| `get_status`              | 🔴     |
| `get_version_info`        | 🔴     |
| `set_restart`             | ❌     |
| `clean_cache`             | 🔴     |
| `.handle_quick_operation` | 🟡     |

[^1]: `is_dismiss` not implemented

</details>

### go-cqhttp APIs

These APIs are not defined in the OneBot 11 standard, but are supported by [go-cqhttp](https://docs.go-cqhttp.org/), which stands for the "good old days" of QQ bot development. These APIs are widely used and are considered as a de facto standard.

<details>
<summary> Click to expand </summary>

| API                          | Status |
| ---------------------------- | ------ |
| `set_qq_profile`             | 🔴     |
| `get_online_clients`         | 🔴     |
| `delete_friend`              | 🔴     |
| `mark_msg_as_read`           | 🔴     |
| `send_group_forward_msg`     | 🟢     |
| `send_private_forward_msg`   | 🟢     |
| `get_group_msg_history`      | 🔴     |
| `ocr_image`                  | 🔴     |
| `get_group_system_msg`       | 🔴     |
| `get_essence_msg_list`       | 🔴     |
| `get_group_at_all_remain`    | 🔴     |
| `set_group_portrait`         | 🔴     |
| `set_essence_msg`            | 🔴     |
| `delete_essence_msg`         | 🔴     |
| `send_group_notice`          | 🔴     |
| `get_group_notice`           | 🔴     |
| `upload_group_file`          | 🔴     |
| `delete_group_file`          | 🔴     |
| `create_group_file_folder`   | 🔴     |
| `delete_group_folder`        | 🔴     |
| `get_group_file_system_info` | 🔴     |
| `get_group_root_files`       | 🔴     |
| `get_group_files_by_folder`  | 🔴     |
| `get_group_file_url`         | 🔴     |
| `upload_private_file`        | 🔴     |
| `download_file`              | 🔴     |
| `check_url_safely` [sic]     | 🔴     |

</details>

### Extended APIs

These APIs represent features that were not taken into consideration when OneBot 11 was designed, or just did not exist in the old QQ protocol. Definitions for these APIs are not standardized, but will follow the definitions in [Lagrange.OneBot](https://lagrange-onebot.apifox.cn/) or [NapCatQQ](https://napcat.apifox.cn/) as much as possible.

<details>
<summary> Click to expand </summary>

| API                        | Status |
| -------------------------- | ------ |
| `set_msg_emoji_like`       | 🟡     |
| `send_forward_msg`         | 🟢     |
| `mark_private_msg_as_read` | 🔴     |
| `mark_group_msg_as_read`   | 🔴     |
| `get_friend_msg_history`   | 🔴     |
| `send_poke`                | 🟢     |
| `friend_poke`              | 🟢     |
| `group_poke`               | 🟢     |
| `get_ai_record`            | 🔴     |
| `get_ai_characters`        | 🔴     |
| `send_group_ai_record`     | 🔴     |
| `get_clientkey`            | 🔴     |
| `translate_en2zh`          | 🔴     |

</details>

### Events

In OneBot 11 standard, events are posted with different `post_type`s. The possible `post_type`s are `message`, `notice`, `request` and `meta_event`.

<details>
<summary> Click to expand </summary>

| Message Type | Status |
| ------------ | ------ |
| `private`    | 🟢     |
| `group`      | 🟢     |

| Notice Type              | Status |
| ------------------------ | ------ |
| `group_upload`           | 🔴     |
| `group_admin`            | 🟡     |
| `group_decrease`         | 🟡     |
| `group_increase`         | 🟡     |
| `group_ban`              | 🟡     |
| `friend_add`             | 🔴     |
| `group_recall`           | 🟡     |
| `friend_recall`          | 🟡     |
| `notify` -> `poke`       | 🟡     |
| `notify` -> `lucky_king` | 🔴     |
| `notify` -> `honor`      | 🔴     |

| Request Type        | Status |
| ------------------- | ------ |
| `friend`            | 🟡     |
| `group` -> `add`    | 🟡     |
| `group` -> `invite` | 🟡     |

| Meta Event Type | Status |
| --------------- | ------ |
| `lifecycle`     | 🔴     |
| `heartbeat`     | 🔴     |

</details>
