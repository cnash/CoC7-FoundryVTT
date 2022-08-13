# System documentation v0.7.12

This document is a work in progress overview of the CoC7 system it is not a tutorial for how to use FoundryVTT.

You will need one of the following to play the game

- Chaosium's Call of Cthulhu 7th Edition - Keeper's Rulebook
- Chaosium's Call of Cthulhu 7th Edition - Call of Cthulhu Starter Set
- Chaosium's Call of Cthulhu 7th Edition - Quick-Start Rules

The system automates most of the regular tasks and rules involved with running a game.

Several parts of the actor sheets have pop up tooltips that trigger after two seconds, this delay can be changed in the settings
.

This documentation can be reopened under  Compendiums -> JournalEntry -> System manual -> Call of Cthulhu 7th Edition (Unofficial) [en]

.

# Recent changes

For a full list of changes checkout the [changelog](https://github.com/Miskatonic-Investigative-Society/CoC7-FoundryVTT/blob/develop/.github/CHANGELOG.md) on GitHub

.

- [Chases](chases.md)
- [Actor importer](actor_importer.md) - added The Dhole's House JSON support
- [Active effects](effects.md) - implementation of active effects
- Active effects added to [links](links.md) and [Link creation tool](link_creation_window.md)

.

# Overview sections below

If this is your first time it is recommends you also read the following sections.

- Actor overview
- Items overview
- Settings overview
- Scene menu overview
- [Creating your first investigator](first_investigator.md)

.

# How to use the system

- [Actor importer](actor_importer.md)
- Actor Type: Character
- Actor Type: Container
- Actor Type: Creature
- Actor Type: NPC
- Character creation mode
- Development phase
- Item Type: Archetype
- Item Type: Book
- [Item Type: Chases](chases.md)
- Item Type: Item
- [Item Type: Occupation](item_occupation.md)
- [Item Type: Setup](item_setup.md)
- Item Type: Skill
- Item Type: Spell
- Item Type: Status
- Item Type: Talent
- Item Type: Weapon
- Macros
- Rolls
- Start Rest
- XP Gain
- [links](links.md)
- [Link creation tool](link_creation_window.md)
- [Active effects](effects.md)

.

# Actor overview

- _Character_ - A complete character, usually an investigator. 
- _Container_ - An inventory container. 
- _Creature_ - A more simple character, suitable for creatures. 
- _NPC_ - A more simple character, suitable for NPCs. 

.

# Items overview

- _Archetype_ - A set of skills and other stats that implement a Pulp Cthulhu archetype. These do not trigger automation in the system. 
- _Book_ - An arcane tome that can hold spells and character improvements.
- _Item_ - A piece of equipment.
- _Occupation_ - A set of skills and other stats that implement a CoC occupation. 
- _Setup_ - A set of default configurations for character, creature, or NPC creation. 
- _Skill_ - A skill with a base percentage and some tags. 
- _Spell_ - A magic spell.
- _Status_ - An phobia or mania condition. 
- _Talent_ -A special power for Pulp Cthulhu. These do not trigger automation in the system. 
- _Weapon_ - An item with weapon statistics (this includes unarmed attacks). 

.

# Settings overview

Click on the Game Settings tab then under the Game Settings heading click on Configure Settings.

Click on System Settings

- _Variant/Optional Rules_ - Here you can turn on individual Pulp Cthulhu rules and other optional rules
- _Initiative Settings_ - Additional settings for optional initiative rule
- _Roll Settings_ - Default options for rolls
- _Chat Cards Settings_ - Configure chat messages
- _Scene Settings_ - Scene Settings
- _Game Artwork Settings_ - This allows you to set a custom pause icon and message
- _Sheet Settings_ - This allows you to change character sheet settings and optional CSS
- _Weapon Settings_ - Weapon Settings
- _Developer And Debug Settings_ - These settings can break your world when new updates are released so only use them on test worlds
- _Roll Table Settings_ - When sanity rolls are made the system can automatically roll for a bout of madness. You can see example roll tables in the Sanity Roll Table compendiums

.

# Call of Cthulhu Scene Menu

To access this menu you will need to have an active scene which can be created in the Scenes Directory.

- _Keeper's tools_ - Here you can toggle character creation mode, character development phase, actor importer, toggle automatic XP gain on a success, and start a rest
- _Roll !_ - Create a roll in chat
- _Create link_ - Create a roll link for players to click