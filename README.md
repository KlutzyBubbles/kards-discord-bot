# Kards Discord Bot

## Adding to server

[Invite Link](https://discord.com/oauth2/authorize?client_id=851402593598832640&scope=bot&permissions=52224)

## Self hosting

Simply clone the repo, set the following environment variables

```
discord_token=
mdb_cluster_url=
mdb_username=
mdb_password=
mdb_database=
```

Or for debugging purposes add this variable

```
log_level=trace
```

Then simply run `npm start` for production.


`npm run debug` will pick up variables in the .env file of the root directory as well as expose other debugging methods.

## Commands

### Search Card

prefix `[`

Simlpy type the prefix followed by the text you wish to search, this will also trim trailing ]

Examples:
```
[eva
[Evasive Action]
```

### List Cards

Work in Progress

### Admin commands

prefix `[[[`

The following commands can only be run by users with the administrator permission in a server. They can always be used in any channel

**[[[list**

Lists all settings currently set for the server

**[[[language (language)**

Sets the preferred language output, options are en, de, fr, pl, pt, ru, zh

**[[[page_size (page_size)**

Sets the preferred page size for List Cards, options are 5, 10, 15

**[[[channels (add|remove) (channels)***

Adds or removes channels in which the list and search commands can be used. If no channels are added thn it is usable in all channels.

**[[[fix**

In the case where a deleted channel is in the settings, running fix will look at the channels in the server and remove any errors for you.