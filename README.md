# tf2-metalbot
Automatically craft/smelt metal to keep currencies on a threshold, using [node-tf2](https://github.com/DoctorMcKay/node-tf2) to interact with the Game Coordinator.

## Installation
You will need [node.js](https://nodejs.org/).

### Windows
Open `build.bat`, it will download the dependencies with `npm` and compile the TypeScript files.

### Linux
Same as Windows, but with `build.sh`.

## Running
### Windows
Open `run.bat`, or run in the cmd `node src/main.js`.

### Linux
Open `run.sh`, or run in the shell `node src/main.js`.

## Configuration
The file `config.json` has a few options you can configure: 
- **neverLetScrapsFallBelow**: The minimum number of scraps the bot will attempt to keep in your backpack. Default is 3.
- **neverLetScrapsGoOver**: The maximum number of scraps the bot will attempt to keep, before crafting them into reclaimed. Default is 6.
- **neverLetReclaimedFallBelow**: Same as scraps, but for reclaimed. Default is 3.
- **neverLetReclaimedGoOver**: Same as scraps, but will craft into refined. Default is 6.
- **avoidMetalInActiveTradeOffers**: Won't use metal that are in active trade offers on crafts/smelts. Default is true.
- **oneShot**: If true, will only load your backpack and balance your metal once, and will exit. Otherwise, will actively monitor your backpack for changes. Default is false.
- **accountName**: Stores your account name. Shouldn't be modified manually.
- **loginKey**: Stores your login key, if you opted to remember the login. *Keep this secret*.
- **sharedSecret**: Stores your shared secret, which, when set, can be used to avoid prompting for Steam Guard codes. Like loginKey, *keep this secret*.

## TODOs/Remarks
- Right now, as it needs to interact with the GC to both monitor your backpack and craft metal, while the bot is running, your account will seem to be playing TF2.
- Consequently, opening TF2 while the bot is open will kill the bot, as you can't play the same game in two different instances.
