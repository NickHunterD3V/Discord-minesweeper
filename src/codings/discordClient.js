const djs = require("discord.js");
const eventReader = require("./../events/eventReader.js");
const reader = require("./reader.js");
const conditionParser = require("./conditionParser.js");
const throwError = require("./error.js");
const Database = require("./database.js")
const properties = require('./properties.js')
const commandTypes = require('./commandTypes.js')
const fs = require('fs');
const PATH = require('path');
const { loadedFunctions } = require("../functions/functionLoader.js");
const AsciiTable = require('ascii-table');

class Client {
    constructor (data) {

        /*  console.log("++++++++       -::::::::       ::::")
            console.log("++++++++       =::::::::      :::::")
            console.log("++++++++       +=::::::::     :::: ")
            console.log("++++++++       ++-:::::::    ::::: ")
            console.log("++++++++       ++=:::::::    ::::  ")
            console.log("++++++++       +++-:::::::  :::::  ")
            console.log("++++++++++++++++++=:::::::  ::::   ")
            console.log("+++++++++++++++++++=::::::::::::   ")
            console.log("++++++++++++++++++++-::::::::::    ")
            console.log("++++++++++++++++++++=:::::::::     ")
            console.log("++++++++       ++++++-::::::::     ")
            console.log("++++++++       ++++++=:::::::      ")
            console.log("++++++++       +++++++-::::::      ")
            console.log("++++++++       =======-:::::       ")
            console.log("++++++++       :::::::::::::       ")
            console.log("++++++++       ::::::::::::        ")
            console.log("++++++++       ::::::::::        \n")  */

        let {token, intents = "all", prefix, debug = false, respondBots = false, logErrors = false, funcSep = 1} = data; 

        const allIntents = Object.keys(djs.Intents.FLAGS);

        if (intents === "all") intents = allIntents;
        
        const client = new djs.Client({
            intents,
            partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]
        });

        client.once("ready", () => {
            client.user.setPresence(this.data.status);

            let version = require("./../../package.json").version;

            console.log(`\x1b[32mHYTE\x1b[32;1mSCRIPT\x1b[0m | \x1b[35;1m${loadedFunctions.size || 0} functions \x1b[0mloaded.`);
            console.log(`\x1b[32mHYTE\x1b[32;1mSCRIPT\x1b[0m | \x1b[0mClient Initialized on \x1b[36;1mv${version}\x1b[0m.`);
            console.log("HyTera Development - \x1b[34;1mhttps://discord.gg/9DPmE8azm2\x1b[0m");

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

                this.data.reader.default(data, commandData.code)
                
            })
        });

        if (isNaN(funcSep) || Number(funcSep) < 1) throw new TypeError('Invalid funcSep in "' + funcSep + '"')

        const funcSeps = ['=>', '=', ':', ' ']
        let sep = funcSeps[Number(funcSep) - 1]
        if (!sep) throw new TypeError('Invalid funcSep in "' + funcSep + '"')

        this.data = {
            options: {
                token,
                prefix,
                intents,
                respondBots,
                debug,
                logErrors,
                funcSep: sep
            },
            client,
            djs,
            commandManager: commandTypes,
            loadedFunctions,
            throwError: new throwError(),
            reader: new reader(),
            conditionParser: new conditionParser(),
            status: {},
            databases: {},
            properties
        };

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
                errorData: {},
                callbacks: this.data.commandManager.callback
            }
        }

        client.login(token);

        setTimeout(() => {
            if (!client.isReady()) {
                console.log("Client took 15 seconds and didn't initialized yet.\nIf you need help with that, please come to our support: \x1b[34;1mhttps://discord.gg/wx9kMjgcur\x1b[0m")
            }
        }, 15000);
    };

    addCommands(...commandsData) {
        const table = new AsciiTable("COMMANDS (main file)");
        table.setHeading('name', 'type', 'status', 'problems')

        let tableErr = false;

        for (const commandData of commandsData) {
            let {name, aliases, type = "default", code, ignorePrefix = false, executeOnDM = false, enableComments = true} = commandData;
            
            if (typeof name !== 'string' && name != undefined) {
                table.addRow(
                    typeof name === 'string' ? name : 'unknown', 
                    type || "unknown", 
                    `ERROR`,
                    'invalid name'
                )

                if(commandsData.indexOf(commandData) === commandsData.length - 1) {
                    console.log(table.render())
                    tableErr = true
                }
            } else if (typeof code !== "string") {
                table.addRow(
                    typeof name === 'string' ? name : 'unknown', 
                    type || "unknown", 
                    `ERROR`,
                    'invalid code'
                )

                if(commandsData.indexOf(commandData) === commandsData.length - 1) {
                    console.log(table.render())
                    tableErr = true
                }
            } else if (!this.data.commandManager[type]) {
                table.addRow(
                    typeof name === 'string' ? name : 'unknown', 
                    type || "unknown", 
                    `ERROR`,
                    'invalid type'
                )

                if(commandsData.indexOf(commandData) === commandsData.length - 1) {
                    console.log(table.render())
                    tableErr = true
                }
            } else {
                let ID = 1;

                while (this.data.commandManager[type].get(ID) !== undefined) {
                    ID++
                }

                this.data.commandManager[type].set(name?.toLowerCase?.() ?? ID, {...commandData, type, ignorePrefix, executeOnDM, enableComments});

                if (aliases) {
                    if (!Array.isArray(aliases)) return;

                    aliases.map(alias => {
                        if (typeof alias !== "string") return;

                        this.data.commandManager[type].set(alias.toLowerCase(), {...commandData, type, ignorePrefix, executeOnDM, enableComments});
                    })
                }
                
                table.addRow(
                    typeof name === 'string' ? name : 'unknown', 
                    type || "unknown", 
                    `OK`,
                    'no problems found'
                )
            }
        };

        if (!tableErr) console.log(table.render())
    };

    addEvents(...events) {
        for (const event of events) {
            let runEvent = eventReader.loadedEvents.get(event.toLowerCase());
            if (!runEvent) {
                if (this.data.options.debug === true) console.log("\u001b[31mDEBUG\u001b[0m | Invalid Event: " + event || "unknown");
                return;
            };

            runEvent(this.data);

            if (this.data.options.debug === true) console.log("\u001b[31mDEBUG\u001b[0m | Event Added: " + event || "unknown");
        }
    };

    async readFolder(path) {
        async function getFiles(path) {
            fs.access(path, fs.constants.F_OK, (err) => {
                if (err) console.error(`\x1b[Cannot read ${path}: directory does not exists.`);
                return;
            });

            let files = await fs.promises
            .readdir(path, {withFileTypes: true})
            .then((f) => {
                return f.map((d) => {
                    d.name = `${path}${PATH.sep}${d.name}`;

                    return d;
                });
            });

            let types = {
                files: files.filter(file => file.isFile()),
                dirs: files.filter(file => file.isDirectory())
            };

            for (let dir of types.dirs) {
                let dirFiles = await getFiles(dir.name);

                types.files.push(...dirFiles);
            };

            return types.files;
        };

        let files = await getFiles(path);

        const table = new AsciiTable(`COMMANDS (folder reader)`);
        table.setHeading('name', 'type', ' status ', 'problems')
        .setAlign(1, AsciiTable.CENTER)
        .setAlign(2, AsciiTable.CENTER)
        .setAlign(3, AsciiTable.RIGHT)
        .setBorder('|', '=', '.', "'")

        for (let file of files) {

            fs.realpath(path, (err, dir) => {
                let tableErr = false;
                if (err) {
                    table.addRow(
                        file.name.replace(path + '\\', ''), 
                        "unknown",
                        `ERROR`,
                        err
                    )

                    if(files.indexOf(file) === files.length - 1) console.log(table.render())
                    
                    return;
                }

                let cmdData;

                try {
                    cmdData = require(dir + file.name.replace(path, ''));
                    
                    let optionsArr = [];

                    if (Array.isArray(cmdData)) {
                        optionsArr.push(...cmdData);
                    } else {
                        optionsArr.push(cmdData);
                    };

                    for (const options of optionsArr) {
                        let {name, type = "default", code, ignorePrefix = false, executeOnDM = false, enableComments = true} = options;  

                        if (typeof name !== 'string' && name != undefined) {
                            table.addRow(
                                typeof name === 'string' ? name : 'unknown', 
                                type || "unknown", 
                                `ERROR`,
                                'invalid name'
                            )

                            if(files.indexOf(file) === files.length - 1) {
                                console.log(table.render())
                                tableErr = true
                            }
                        } else if (typeof code !== "string") {
                            table.addRow(
                                typeof name === 'string' ? name : 'unknown', 
                                type || "unknown", 
                                `ERROR`,
                                'invalid code'
                            )

                            if(files.indexOf(file) === files.length - 1) {
                                console.log(table.render())
                                tableErr = true
                            }
                        } else if (!this.data.commandManager[type]) {
                            table.addRow(
                                typeof name === 'string' ? name : 'unknown', 
                                type || "unknown", 
                                `ERROR`,
                                'invalid type'
                            )

                            if(files.indexOf(file) === files.length - 1) {
                                console.log(table.render())
                                tableErr = true
                            }
                        } else {
                            let ID = 1;

                            while (this.data.commandManager[type].get(ID) !== undefined) {
                                ID++
                            }

                            this.data.commandManager[type].set(name?.toLowerCase?.() ?? ID, {...options, type, ignorePrefix, executeOnDM, enableComments});
                            
                            table.addRow(
                                typeof name === 'string' ? name : 'unknown', 
                                type || "unknown", 
                                `OK`,
                                'no problems found'
                            )
                        }
                    };
                } catch (err) {
                    table.addRow(
                        file.name.replace(path + '\\', ''), 
                        "unknown",
                        `ERROR`,
                        err
                    );
                };
                if (files.indexOf(file) === files.length - 1 && !tableErr) console.log(table.render())
            });
        };
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
    newDatabase(name, entries, options = {}) {
        if (typeof name !== 'string') throw new TypeError(`name must be a string.`)
        if (!JSON.stringify(entries).startsWith("{") || typeof entries !== "object") throw new TypeError(`entries must be an object.`)
        if (this.data.databases.hasOwnProperty(name)) throw new TypeError(`database with name "${name}" already exists.`)

        const newDb = new Database(name, entries, options)

        this.data.databases[name] = newDb;
    }
};

module.exports = Client;