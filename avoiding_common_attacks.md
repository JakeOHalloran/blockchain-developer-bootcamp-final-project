# Security measures
The following Security measures, that were listed in the Final Project Design Patterns and Security Measures document, are used:

## Using specific compiler pragma (SWC-103 (Floating pragma))
- Project uses compiler version 0.8.7 to avoid bugs due to outdated compilers.

## Use Modifiers only for validation
- All of the modifiers used by the project only validate data and actions, they do not modify any data or handle any extensive logic.

## Checks-Effects-Interactions (SWC-107 (Reentrancy))
- Project avoids state changes after external calls. For example, the pickWinner function closes the draw before transfering the prize fund tokens.