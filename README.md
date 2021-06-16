# Kards Discord Bot

## Adding to server

[Invite Link](https://discord.com/oauth2/authorize?client_id=851402593598832640&scope=bot&permissions=52224)

This bot is currently hosted on my private servers until i find a reasonably priced option, this means if i lose power, the bot goes down. Although the uptime of my servers for the past year has been ~98%.

## Roadmap

1. Add languages
2. Add card searching through the `[[` command prefix
3. Add configurable prefix
4. Add open to tag multiple cards using `[]`
5. Add stats command using kards-public-stats

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

prefix `[[`

Lists cards matching the supplied parameters, in the format `[[name=value name=value,value2`

Spaces are used to seperate the parameters and therefor cannot exist in the value itself, cases where a space exists, can be replaced with a `-` or `_`.

**Parameters**

nation=germany,britain,france,italy,japan,united-states,united_states,usa,poland,soviet-union,soviet_union,soviet

kredits=0,1,2,3,4,5,6,7

rarity=limited,standard,special,elite

page=`Number`

set=base,allegiance

type=infantry,artillery,tank,bomber,fighter,order,countermeasure

spawnable=`true|yes|y` (Default false)

**Notes**

- All parameters are case insensative
- Nation names can be partly filled as it is a search not a match
- Kredit value 7 includes cards with a cost of 7 or more, this is just how the kards api works
- Providing anything other than `true|yes|y` for spawnable will just result in false

### Admin commands

prefix `[[[`

The following commands can only be run by users with the administrator permission in a server. They can always be used in any channel

**[[[list**

Lists all settings currently set for the server

**[[[language (language)**

Sets the preferred language output, options are en, de, fr, pl, pt, ru, zh

**[[[page_size (page_size)**

Sets the preferred page size for List Cards, options are 5, 10, 15

**[[[channels (add|remove) (channels)**

Adds or removes channels in which the list and search commands can be used. If no channels are added thn it is usable in all channels.

**[[[fix**

In the case where a deleted channel is in the settings, running fix will look at the channels in the server and remove any errors for you.
