# Telegram-downloader

Telegram-downloader is a small Node.js Telegram bot project created by IliyaBadri. It allows users to download files from Telegram by providing a file ID using the `/download` command.

## Features

-   Users can download files from Telegram using a file ID using one command.
-   Bot owner can update the bot's download repository using a pre-shared secret key with one command.
-   Bot owner is also able to delete files from the bot's repository using a pre-shared secret key and file ID with one command.
-   Bot owner can list all files in the bot's repository using a pre-shared secret key with one command.

## Installation

1.  **Clone the repository.**
2.  Install dependencies using `npm install` in the terminal.

3.  Edit the `config.json` file in the root directory and replace the `TOKEN` with your telegram bot token and replace the `UPDATE_KEY` with a secure pass key.
    
5.  Start the bot using `node .`  in the terminal.
    

## Usage

- Start by adding files to the `/new-files` directory. These files will then be added to your telegram bot repository.

- Start your telegram bot if you haven't already.

- In your bot dm send: `/update-files (UPDATE_KEY)`
	**NOTE:** Remember  to replace the `(UPDATE_KEY)` with the actual pre-shared key you are using in the bots `config.json`.
	 - If successful bot will send you a list of files that have been added to the bots repository followed by their IDs.

- To check all of the files present in the bots repository use: `/list-files (UPDATE_KEY)`.

- To delete a file from your bots repository use: `/delete-file (UPDATE_KEY) (FILE ID)`
	**NOTE:** Remember to replace `(FILE ID)` with the actual file ID you want to delete.

-   To download a file, use the following command in Telegram: `/download (FILE ID)` 
