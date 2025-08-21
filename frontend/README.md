# The Floor 
A game inspired by the popular TV show "The Floor".\
Hosted locally, played on single screen by many people like in TV show.

## Description
After creating a game room, players must be added and assigned categories to start the game.

### 🚔 Game Rules
At the start of the game, a player is randomly selected as the one "chosen by the floor." The selected player can challenge an adjacent player to a duel in the latter's category. If the challenger wins, they keep their category; if the challenged player wins, they take the challenger's category. The winner occupies the opponent's tile.

### 🤺 Duel
During a duel, two players stand on opposite sides of the screen and, based on an image, must identify what it depicts according to the category of the duel. The prompter, using a separate device, evaluates the response as "OK." A player may choose the "PASS" option, which, upon the prompter's confirmation, deducts 3 seconds from the player's time and changes the image to be identified.

### 📖 Terms
- **Floor**: The floor is represented as tiles marked with the player's name and their assigned category.
- **Sufler**: A person responsible for verifying players' responses and recording them on a separate game screen.

## ⚙️ Technical details
- **Frontend**: React
- **Backend**: FastAPI

### Adding New Categories
To add a new category, create a folder named after the category, containing images with names corresponding to the answers. Then, click the category reload button to load the data into the database.
For example, an image depicting a cat in the "Animals" category should be named, e.g., `kot.jpg`.

