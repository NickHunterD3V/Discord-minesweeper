const djs = require("discord.js")
const eventReader = require("./../events/eventReader.js")
const conditionParser = require("./conditionParser.js")
const throwError = require("./error.js")
const utils = require('./utils')
const commandTypes = require('./commandTypes')
const Database = require("./database.js")
const InternalDatabase = require("./internalDatabase.js")
const { loadedFunctions } = require("../functions/functionLoader.js")
const AsciiTable = require('ascii-table')
const axios = require('axios')
const Compiler = require("./compiler.js")

class Client {
    constructor (data) {

        /*     ++++++++       -::::::::       ::::
               ++++++++       =::::::::      :::::
               ++++++++       +=::::::::     :::: 
               ++++++++       ++-:::::::    ::::: 
               ++++++++       ++=:::::::    ::::  
               ++++++++       +++-:::::::  :::::  
               ++++++++++++++++++=:::::::  ::::   
               +++++++++++++++++++=::::::::::::   
               ++++++++++++++++++++-::::::::::    
               ++++++++++++++++++++=:::::::::     
               ++++++++       ++++++-::::::::     
               ++++++++       ++++++=:::::::      
               ++++++++       +++++++-::::::      
               ++++++++       =======-:::::       
               ++++++++       :::::::::::::       
               ++++++++       ::::::::::::        
               ++++++++       ::::::::::          */

        let {token, intents = "all", prefix, debug = false, respondBots = false, logErrors = false} = data; 

        const allIntents = Object.keys(djs.Intents.FLAGS);

        if (intents === "all") intents = allIntents;
        
        const client = new djs.Client({
            intents,
            partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]
        });

        client.once("ready", async () => {
            console.log(_this.data.table.toString())

            client.user.setPresence(this.data.status);

            let version = require("./../../package.json").version;
        
            // contacting API

            console.log('\x1b[36mGetting contact with API...\x1b[0m')

            let res = await axios.get("https://paebukoaapi.paebukoa.repl.co");
            
            if (res.status !== 200 || typeof res.data !== 'object') {
                console.log('\u001b[31mFailed to contact API!\x1b[0m')
                res.data = {
                    hytera: {invite: `https://discord.gg/wx9kMjgcur`},
                    hytescript: {version, ownerMessage: ''}
                }
            } else {
                console.log('\u001b[32mSuccessfully contacted API!\x1b[0m')
            } 
    
            let invite = res.data.hytera.invite
            let latestVersion = res.data.hytescript.version
            let ownerMessage = res.data.hytescript.ownerMessage

            _this.data.invite = invite

            console.log(`\x1b[32mHYTE\x1b[32;1mSCRIPT\x1b[0m | \x1b[35;1m${loadedFunctions.size || 0} functions \x1b[0mloaded.`);
            if (version !== latestVersion) console.log(`\x1b[32mHYTE\x1b[32;1mSCRIPT\x1b[0m | \x1b[31mYOU'RE NOT USING THE LATEST VERSION OF HYTESCRIPT (v${latestVersion})!\x1b[0m`)
            console.log(`\x1b[32mHYTE\x1b[32;1mSCRIPT\x1b[0m | \x1b[0mClient Initialized on \x1b[36;1mv${version}\x1b[0m.`);
            if (typeof ownerMessage === 'string' && ownerMessage !== '') console.log(`\x1b[32mHYTE\x1b[32;1mSCRIPT\x1b[0m | \x1b[36m"${ownerMessage}"\x1b[0m`)
            console.log(`HyTera Development - \x1b[34;1m${invite}\x1b[0m`);

            this.data.commandManager.ready.forEach(commandData => {
                
                let data = {};
        
                for (const key in this.data) {
                    if (Object.hasOwnProperty.call(this.data, key)) {
                        const element = this.data[key];
                        
                        data[key] = element;
                    }
                }

                data.command = commandData
                data.eventType = 'ready'
                data.error = false
                data.data = this.data.getData()

                commandData.code.parse(data)
                
            })
        });

        this.data = {
            clientOptions: {
                token, prefix, intents, respondBots, debug, logErrors
            },
            client, throwError, utils,
            status: {},
            databases: {},
            commandManager: commandTypes,
            functions: loadedFunctions,
            conditionParser: new conditionParser(),
            internalDb: new InternalDatabase()
        }

        this.data.table = new AsciiTable('COMMANDS')
        this.data.table.setHeading('name', 'type', 'status', 'problems')
                       .setAlign(1, AsciiTable.CENTER)
                       .setAlign(2, AsciiTable.CENTER)
                       .setAlign(3, AsciiTable.RIGHT)
                       .setBorder('|', '=', '.', "'")

        this.data.clientOptions.prefix = Array.isArray(this.data.clientOptions.prefix) ?
            this.data.clientOptions.prefix.map(x => Compiler.compile(this.data, x))
            : Compiler.compile(this.data, this.data.clientOptions.prefix)

        this.data.getData = () => {
            return {
                vars: new Map(),
                arrays: {
                    default: []
                },
                objects: {
                    default: new Map()
                },
                components: [],
                embeds: [],
                error: {},
                callbacks: this.data.commandManager.callback,
                messageToReply: undefined
            }
        }

        let _this = this

        client.login(token);

        setTimeout(() => {
            if (!client.isReady()) {
                console.log(`Client took 15 seconds and didn't initialized yet.\nIf you need help with that, please come to our support: \x1b[34;1m${this.data.invite}\x1b[0m`)
            }
        }, 15000);
    };

    addCommands(...commands) {
        for (const command of commands) {
            let parseData = utils.parseCommand(this.data, command)
            for (let row of parseData.table.__rows) {
                this.data.table.addRow(...row)
            }
        }
    }
    
    readFolder(path) {
        let files = utils.getDirFiles(path)

        for (let file of files) {
            let command = require(file.path)
            let parseData = utils.parseCommand(this.data, command)
            for (let row of parseData.table.__rows) {
                this.data.table.addRow(...row)
            }
        };
    };

    addEvents(...events) {
        for (const event of events) {
            let runEvent = eventReader.loadedEvents.get(event.toLowerCase());
            if (!runEvent) return;

            runEvent(this.data);
        }
    };

    setStatus(options) {
        let {text: name, type = 'PLAYING', status = 'online'} = options;
        this.data.status = {
            activities: [{
                name,
                type
            }],
            status
        };
    };

    addDatabase(name, entries, options = {}) {
        if (typeof name !== 'string') throw new TypeError(`name must be a string.`)
        if (typeof entries !== "object" || !JSON.stringify(entries).startsWith("{")) throw new TypeError(`entries must be an object.`)
        if (this.data.databases.hasOwnProperty(name)) throw new TypeError(`database with name "${name}" already exists.`)

        const newDb = new Database(name, entries, options)

        this.data.databases[name] = newDb;
    }

    addFunctions(...functions) {
        for (const func of functions) {
            const {name, code: run} = func

            this.data.loadedFunctions.set(name.toLowerCase(), { run })
        }
    }
};

module.exports = Client;