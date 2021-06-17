# Kards Discord Bot

## Adding to server

[Invite Link](https://discord.com/oauth2/authorize?client_id=851402593598832640&scope=bot&permissions=52224)

This bot is currently hosted on my private servers until i find a reasonably priced option, this means if i lose power, the bot goes down. Although the uptime of my servers for the past year has been ~98%.

## Roadmap

1. Add stats command using kards-public-stats

## Known Issues

These issues are known and unlikely to get solved either due to their complexity to implement or that they are not a real world scenario anyway.

- You cannot search for a card by using `[[` at the start of your message. This does NOT apply if you have changed the prefix from the default `[`.
- You can query a maximum of 15 cards at a time. The number of cards returned may be less if two or more queries return the same card.

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

For the examples it is assumed you are replacing the default prefix and suffix `[]` with your set one.

Simlpy type the prefix followed by the text you wish to search, if you wish to type after the search, use the suffix.

Examples:
```
[eva
[Evasive Action]
[eva] [bloody] look two
you can even type before you search for [eva
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

- All parameters are case insensitive
- Nation names can be partly filled as it is a search not a match
- Kredit value 7 includes cards with a cost of 7 or more, this is just how the kards api works
- Providing anything other than `true|yes|y` for spawnable will just result in false

### Admin commands

prefix `[[[`

The following commands can only be run by users with the administrator permission in a server. They can always be used in any channel

**[[[list**

Lists all settings currently set for the server

**[[[prefix (prefix)**

Changes the prefix to the one specified, max length of 5

**[[[suffix (prefix)**

Changes the suffix to the one specified, max length of 5

**[[[search (true|yes|y|false|no|n)**

Enables or disables the use of the search function `[[`

**[[[language (language)**

Sets the preferred language output, options are en, de, fr, pl, pt, ru, zh

**[[[page_size (page_size)**

Sets the preferred page size for List Cards, options are 5, 10, 15

**[[[channels (add|remove) (channels)**

Adds or removes channels in which the list and search commands can be used. If no channels are added then it is usable in all channels.

**[[[fix**

In the case where a deleted channel is in the settings, running fix will look at the channels in the server and remove any errors for you.
