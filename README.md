# telegram-bot

# **Table of Contents**

- [**Table of Contents**](#table-of-contents)
- [Overview](#overview)
- [Installation and Execution](#installation-and-execution)
- [Documentation](#documentation)
- [Authors](#authors)

# Overview
This projects contains a Telegram bot to serve as home server for basic automation and script executions. Was based on [@thiagosanches](https://github.com/thiagosanches) project on [GitHub](https://github.com/thiagosanches/arisco).

# Installation and Execution

Node 14 or greater

This project has an integration with [NGROK](https://ngrok.com/) to serve localhost URLs. You can use it (go to [tunnel method](./methodFactory/tunnel.js)), on not. If not, you can skip the NGROK config

1. Install NGROK
```bash
  sudo snap install ngrok
```

2. Clone the project
```bash
  git clone https://github.com/VitaoCs/telegram-bot.git
```

3. Go to the project directory
```bash
  cd telegram-bot
```

4. Install project dependencies
```bash
  npm install
```

5. Config your server creating a **key.json** file outside this repo so you can keep your secrets without committing them. Use the format below:

```javascript
{
    "AUTH_TOKEN": "<your_telegram_auth_token>",
    "NGROK_TOKEN": "<your_ngrok_auth_token>T",
    "ALLOWED_CHAT_ID": 123,
    "ADMIN_USERS": [123],
    "ESP32_CAM_IP": "http://<your_local_ip_adress>",
    "BANK_NAMES": ["<names_used_by_bank>"],
    "BANK_INITIAL_VALUE_PER_USER": 123,
    "DAILY_EXPECTED_COSTS": 123
}
```

6. Start the server
```bash
  node bot.js
```

# Documentation

- [Telegram Bot Reference Project](https://github.com/thiagosanches/arisco) [@thiagosanches](https://github.com/thiagosanches)
- [Telegram Bot Node Module](https://www.npmjs.com/package/node-telegram-bot-api)
- [NGROK](https://ngrok.com/)
- [Bunyan](https://www.npmjs.com/package/bunyan)
- [Factory Design Pattern](https://medium.com/@thebabscraig/javascript-design-patterns-part-1-the-factory-pattern-5f135e881192)


# Authors
* **Victor Cintra Santos** - *VitaoCs* - [GitHub](https://github.com/VitaoCs)

