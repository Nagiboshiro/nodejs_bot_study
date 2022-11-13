const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options.js')
const sequelize = require('./db.js')
const UserModel = require('./models.js')

const token = '5637780995:AAEoVwrykoU-Xj1dhhEf9URHdJ3mi4EjyM8'
const bot = new TelegramApi(token, {polling: true})

const chats = {}



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber

    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log("Подключение к БД сломалость", e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра угадай цифру'},
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id
        
        try {
            if (text === '/game') {
                return startGame(chatId)
            }

            if (text === '/start') {
                const user = await UserModel.findOne({chatId})
                if (!user) {
                    await UserModel.create({chatId})
                }
                await bot.sendAnimation(chatId, 'https://tlgrm.eu/_/stickers/b0d/85f/b0d85fbf-de1b-4aaf-836c-1cddaa16e002/1.webp')
                return  bot.sendMessage(chatId, 'Добро пожаловать в сообщество программистов!')
            }

            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return  bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`)
            }

            return bot.sendMessage(chatId, 'Я тебя не понимаю!')
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибка')
        }



    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})

        if (data == chats[chatId]) {
            user.right += 1
             await bot.sendMessage(chatId, `Поздравляю, ты угадал цифру ${chats[chatId]}`, againOptions)
        } else {
            user.wrong += 1
             await bot.sendMessage(chatId, `К сожалению ты даун, я загадал цифру ${chats[chatId]}`, againOptions)
        }

        await user.save()

    })
}

start()