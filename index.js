const TelegramBot = require('node-telegram-bot-api');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('crypto');
const databaseManager = require('./modules/databaseManager');
const config = require('./config.json');

const newFilesDirectory = './new-files';
const uploadsDirectory = './uploads';

databaseManager.setupDatabase();

if(config.UPDATE_KEY.split(' ').length > 1) {
    console.error('You cannot use an UPDATE_KEY in config.json with spaces in it!');
    process.exit();
}

const bot = new TelegramBot(config.TOKEN, {polling: true});

bot.on('message', async (message) => {
    const chatID = message.chat.id;
    const text = message.text;

    if(!text) return;

    const args = text.split(' ');

    if (args[0] === '/start') {
        bot.sendMessage(chatID, 'Hi there\\!\nYou can start using me by: \n\n*`/download \\(FILE ID\\)`*', { parse_mode: 'MarkdownV2' });
    }

    if (args[0] === '/download') {
        if(args.length < 2) {
            bot.sendMessage(chatID, '**Missing argument\\!**\nYou need to specify your file ID: \n\n*`/download \\(FILE ID\\)`*', { parse_mode: 'MarkdownV2' });
        };

        const searchQuery = 'SELECT id, token, name FROM files WHERE token = ?';
        const searchValues = [args[1]];

        const databaseFiles = await databaseManager.getSQLSelectorPromise(searchQuery, searchValues);

        if(databaseFiles.length == 0) {
            bot.sendMessage(chatID, '*Invalid file ID\\!*\nPlease enter a *valid* file ID\\.', { parse_mode: 'MarkdownV2' });
            return;
        }
        const stream = fs.createReadStream(path.join(uploadsDirectory, databaseFiles[0].name));
        bot.sendDocument(chatID, stream);
    }

    if(args[0] === '/update-files'){
        if(args.length < 2) return;
        if(args[1] !== config.UPDATE_KEY) return;

        const newFiles = fs.readdirSync(newFilesDirectory);

        let fileListString = "";

        for(const newFile of newFiles){
            const currentTimestamp = new Date().getTime() + crypto.randomBytes(3).toString('hex');
            const newFileName = currentTimestamp + path.extname(newFile);

            const originalFileName = path.basename(newFile);
            const fileID = crypto.randomBytes(8).toString('hex');

            fileListString += `_ _ _ _\n\nNAME: ${originalFileName}\nNAME IN DATABASE: ${newFileName}\nID: ${fileID}\n\n`;

            fs.renameSync(path.join(newFilesDirectory, newFile), path.join(uploadsDirectory, newFileName));

            const insertQuery = 'INSERT INTO files (token, name) VALUES (?, ?)';

            await databaseManager.getSQLStatementPromise(insertQuery, fileID, newFileName);
        }

        
        bot.sendMessage(chatID, `Added ${newFiles.length} file(s) to the database: \n${fileListString}`);
    }

    if(args[0] == '/delete-file'){
        if(args.length < 3) return;
        if(args[1] !== config.UPDATE_KEY) return;

        const searchQuery = 'SELECT id, token, name FROM files WHERE token = ?';
        const searchValues = [args[2]];

        const databaseFiles = await databaseManager.getSQLSelectorPromise(searchQuery, searchValues);

        if(databaseFiles.length == 0) {
            bot.sendMessage(chatID, `File not found!`);
            return;
        }

        const deleteQuery = 'DELETE FROM files WHERE token = ?';

        await databaseManager.getSQLStatementPromise(deleteQuery, args[2]);

        fs.unlinkSync(path.join(uploadsDirectory, databaseFiles[0].name));

        bot.sendMessage(chatID, `Deleted file:\n\nNAME: ${databaseFiles[0].name}\nID: ${databaseFiles[0].token}`);
    }

    if(args[0] == '/list-files'){
        if(args.length < 2) return;
        if(args[1] !== config.UPDATE_KEY) return;

        const searchQuery = 'SELECT id, token, name FROM files';
        const searchValues = [];

        const databaseFiles = await databaseManager.getSQLSelectorPromise(searchQuery, searchValues);

        if(databaseFiles.length == 0) {
            bot.sendMessage(chatID, `No files available`);
            return;
        }

        let filesString = "";

        for(const databaseFile of databaseFiles){
            filesString += `_ _ _ _\n\nNAME: ${databaseFile.name}\nID: ${databaseFile.token}\n\n`;
        }

        bot.sendMessage(chatID, `Loaded ${databaseFiles.length} file(s) from the database: \n${filesString}`);
    }
    
});