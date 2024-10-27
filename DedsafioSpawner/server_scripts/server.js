let BossBarUpdate = null
let Spawners = {}

const Difficulties = {
    type1: {
        Mob0: {
            Mob: "minecraft:zombie",
            Attributes: `{ArmorDropChances:[0F,0F,0F,0F],Attributes:[{Name:"generic.max_health",Base:50}],Health:50,IsBaby:0,HandItems:[{id:"minecraft:diamond_axe",tag:{Enchantments:[{id:sharpness,lvl:2}]},Count:1},{}],ArmorItems:[{},{},{tag:{Enchantments:[{id:protection,lvl:1}]},id:"minecraft:diamond_chestplate",Count:1},{id:"minecraft:diamond_helmet",Count:1,tag:{Enchantments:[{id:thorns,lvl:1}]}}]}`,
            Probability: 0.1
        },
        Mob1: {
            Mob: "minecraft:zombie",
            Attributes: `{ArmorDropChances:[0F,0F,0F,0F],Attributes:[{Name:"generic.max_health",Base:30}],Health:30,IsBaby:0,ArmorItems:[{},{},{},{id:"minecraft:iron_helmet",Count:1}]}`,
            Probability: null
        }
    }
}

const DataPath = "Data.json"
let Data = JsonIO.read(DataPath)

function GenerateOrder() {
    if (Object.keys(Spawners).length == 0) {
        return 0
    } else {
        for (let i = 0; i <= Object.keys(Spawners).length; i++) {
            if (Spawners[`Spawner${i}`] == undefined) {
                return i
            }
        }
    }
}

function GetDistance(pos1, pos2) {
    let dx = pos2.x - pos1.x;
    let dy = pos2.y - pos1.y;
    let dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

ServerEvents.commandRegistry(e => {
    const { commands: Commands, arguments: Arguments } = e
    e.register(Commands.literal('anim')
      .then(Commands.argument('target', Arguments.ENTITY.create(e))
        .then(Commands.argument('anim_name', Arguments.STRING.create(e))
            .executes(ctx => {
                const arg1 = Arguments.ENTITY.getResult(ctx, "target")
                const arg2 = Arguments.STRING.getResult(ctx, "anim_name")
                arg1.triggerAnimation('spawnerController', arg2);
            })
        )
      )
    )
})

const slimeBossBarId = "spawner_health"
const bossBarTitle = "Spawner"
ServerEvents.commandRegistry(event => {
    const {commands: Commands, arguments: Arguments} = event;
    event.register(
        Commands.literal('generatespawner')
            .requires(s => s.hasPermission(2))
            .then(
                Commands.argument('x', Arguments.FLOAT.create(event))
                .then(
                    Commands.argument('y', Arguments.FLOAT.create(event))
                    .then(
                        Commands.argument('z', Arguments.FLOAT.create(event))
                        .then(
                            Commands.argument('type', Arguments.STRING.create(event))
                            .executes(ctx => {
                                let x = Arguments.FLOAT.getResult(ctx, 'x')
                                let y = Arguments.FLOAT.getResult(ctx, 'y')
                                let z = Arguments.FLOAT.getResult(ctx, 'z')
                                let Deff = Arguments.STRING.getResult(ctx, 'type')
                                let SpawnPosition = {x: x, y: y, z: z}
                                const Index = GenerateOrder()
                                //ctx.source.server.runCommandSilent(`bossbar add ${slimeBossBarId} {"text":"${bossBarTitle}","color":"dark_green","bold":true,"underlined":false}`);
                                //ctx.source.server.runCommandSilent(`bossbar set ${slimeBossBarId} max 200`);
                                //ctx.source.server.runCommandSilent(`bossbar set ${slimeBossBarId} visible true`)
                                //ctx.source.server.runCommandSilent(`bossbar set ${slimeBossBarId} color green`)
                                //ctx.source.server.runCommandSilent(`bossbar set ${slimeBossBarId} style notched_20`)

                                //BossBarUpdate = ctx.source.server.scheduleRepeatingInTicks(5, () =>{
                                //    ctx.source.server.runCommandSilent(`execute if entity @e[tag=Spawner,limit=1] run bossbar set ${slimeBossBarId} players @a`)
                                //    ctx.source.server.runCommandSilent(`execute store result bossbar ${slimeBossBarId} value run data get entity @e[limit=1,tag=Spawner] Health`)
                                //    ctx.source.server.runCommandSilent(`execute unless entity @e[tag=Spawner,limit=1] run bossbar set ${slimeBossBarId} players xmlplayernoexisttest`)
                                //})
                                //ctx.source.server.runCommandSilent(`bossbar set ${slimeBossBarId} value 200`);
                                if (!Spawners[`Spawner${Index}`]) {
                                    Spawners[`Spawner${Index}`] = {
                                        Index: Index,
                                        Name: "Spawner",
                                        Position: SpawnPosition,
                                        SpawnMobsSchedule: null,
                                        SpawnInterval: 20 * 8
                                    }
                                    ctx.source.server.runCommandSilent(`summon nebuland:spawner ${SpawnPosition.x} ${SpawnPosition.y + 2} ${SpawnPosition.z} {NoAI:1b,PersistenceRequired:1b,Tags:["Spawner${Index}"],Attributes:[{Name:"generic.max_health",Base:200}],Health:200}`)
                                    let FirstSpawn = false
                                    Spawners[`Spawner${Index}`].SpawnMobsSchedule = ctx.source.server.scheduleRepeatingInTicks(20, () => {
                                        let Players = ctx.source.server.getPlayers()
                                        for (let Player of Players) {
                                            if (GetDistance(Spawners[`Spawner${Index}`].Position, Player) <= 15) {
                                                if (FirstSpawn == false) {
                                                    Spawners[`Spawner${Index}`].SpawnMobsSchedule.reschedule(Spawners[`Spawner${Index}`].SpawnInterval)
                                                    FirstSpawn = true
                                                }
                                                const numberOfZombies = 3
                                                //ctx.source.player.tell(`Spawning mobs at Spawner${Index}, Postion: ${Spawners[`Spawner${Index}`].Position.x}, ${Spawners[`Spawner${Index}`].Position.z}`)
                                                for (let i = 0; i < numberOfZombies; i++) {
                                                    let offsetX = Math.floor(Math.random() * 21) - 10 // Random value between -10 and +10
                                                    let offsetZ = Math.floor(Math.random() * 21) - 10 // Random value between -10 and +10
                                                    for (let i = 0; i <= Object.keys(Difficulties[Deff]).length; i++) {
                                                        if (Difficulties[Deff]["Mob"+i]) {
                                                            if (!Difficulties[Deff]["Mob"+i].Probability) {
                                                                ctx.source.server.runCommandSilent(`summon ${Difficulties[Deff]["Mob"+i].Mob} ${Spawners[`Spawner${Index}`].Position.x-offsetX} ${Spawners[`Spawner${Index}`].Position.y} ${Spawners[`Spawner${Index}`].Position.z-offsetZ} `+Difficulties[Deff]["Mob"+i].Attributes)
                                                            } else if (Math.random() < Difficulties[Deff]["Mob"+i].Probability) {
                                                                ctx.source.server.runCommandSilent(`summon ${Difficulties[Deff]["Mob"+i].Mob} ${Spawners[`Spawner${Index}`].Position.x-offsetX} ${Spawners[`Spawner${Index}`].Position.y} ${Spawners[`Spawner${Index}`].Position.z-offsetZ} `+Difficulties[Deff]["Mob"+i].Attributes)
                                                                break
                                                            }
                                                        }
                                                    }
                                                }
                                                break
                                            }
                                        }
                                    })
                                }
                            })
                        )
                    )
                )
            )
    )
})

EntityEvents.spawned('nebuland:spawner', event => {
    const entity = event.entity;
    for (let Spawner in Spawners) {
        if (entity.getTags().contains(Spawner)) { //CHECK TAGS
            //entity.setCustomName(Spawners[Spawner].Name)
            break
        }
    }
})

EntityEvents.death('nebuland:spawner', event => {
    const entity = event.entity;
    for (let Spawner in Spawners) {
        if (entity.getTags().contains(Spawner)) { //CHECK TAGS
            if (Spawners[Spawner]) {
                Spawners[Spawner].SpawnMobsSchedule.reschedule(0)
                Spawners[Spawner].SpawnMobsSchedule.clear()
                Spawners[Spawner] = null
                entity.level.server.runCommandSilent(`playsound minecraft:entity.warden.death player @p ${entity.x} ${entity.y} ${entity.z}`)
                event.server.tell(`The Spawner${Spawner} has been destroyed!`)
                delete Spawners[Spawner]
                break
            }
        }
    }
    //if (BossBarUpdate) {
    //    BossBarUpdate.clear()
    //    BossBarUpdate = null
    //    event.server.runCommandSilent(`bossbar remove ${slimeBossBarId}`)
    //}
})

const PI = 3.141592653589793

ServerEvents.commandRegistry(event => {
    const {commands: Commands, arguments: Arguments} = event;
    event.register(
        Commands.literal('AddSpawner')
        .requires(s => s.hasPermission(2))
        .then(
            Commands.argument('raid', Arguments.STRING.create(event))
            .then(
                Commands.argument('spawnertype', Arguments.STRING.create(event))
                .executes(ctx => {
                    let Player = ctx.source.player
                    let ticket = Arguments.STRING.getResult(ctx, 'raid');
                    let type = Arguments.STRING.getResult(ctx, 'spawnertype');
                    if (ticket in Data.TicketsData || !Data.TicketsData[ticket].Spawners) {
                        if (type in Difficulties) {
                            Data.TicketsData[ticket].Spawners.push({
                                Type: type,
                                Position: {x: Player.x, y: Player.y, z: Player.z}
                            })
                            Player.tell(`Spanwer Added`)
                        } else {
                            Player.tell(`Couldnt find Spawner type "${type}" in data`)
                        }
                    } else {
                        Player.tell(`Couldnt find ticket "${ticket}" in data`)
                    }
                })
            )   
        )
    )
})

ServerEvents.commandRegistry(event => {
    const {commands: Commands, arguments: Arguments} = event;
    event.register(
        Commands.literal('AddRaidTicket')
        .requires(s => s.hasPermission(2))
        .then(
            Commands.argument('ticket', Arguments.STRING.create(event))
            .then(
                Commands.argument('dugenonname', Arguments.STRING.create(event))
                .then(
                    Commands.argument('difficulty', Arguments.STRING.create(event))
                    .then(
                        Commands.argument('dimension', Arguments.DIMENSION.create(event))
                        .executes(ctx => {
                            let Player = ctx.source.player
                            let ticket = Arguments.STRING.getResult(ctx, 'ticket');
                            let DungeonName = Arguments.STRING.getResult(ctx, 'dugenonname');
                            let difficulty = Arguments.STRING.getResult(ctx, 'difficulty');
                            let dimension = Arguments.DIMENSION.getResult(ctx, 'dimension');
                            if (!ticket in Data.TicketsData) {
                                if (!DungeonName in Data.Dungeons) {
                                    Data.TicketsData[ticket] = {
                                        Difficulty: difficulty,
                                        Dimension: dimension,
                                        Dungeon: DungeonName,
                                        Spawners: []
                                    }
                                    Data.Dungeons[DungeonName] = {x: Player.x, y: Player.y, z: Player.z}
                                    Player.tell(`Dugenon Added, use /AddSpawner to add spawners to this dungeon`)
                                } else {
                                    Player.tell(`Dungeon "${DungeonName}" alredy exist in data`)
                                }
                            } else {
                                Player.tell(`Raid "${ticket}" alredy exist in data`)
                            }
                        })
                    )
                )
            )   
        )
    )
})

ServerEvents.commandRegistry(event => {
    const {commands: Commands, arguments: Arguments} = event;
    event.register(
        Commands.literal('SaveData')
        .requires(s => s.hasPermission(2))
        .executes(ctx => {
            JsonIO.write(DataPath, Data)
            Data = JsonIO.read(DataPath)
            ctx.source.player.tell("Data saved.")
        })
    )
})

const RaidSize = 3
ItemEvents.rightClicked(event => {
    let ticket = event.item.id.split(":")[1]
    if (event.entity.isPlayer()) {
        let Player = event.player
        if (ticket in Data["TicketsData"]) {
            if (!Data["TicketsData"][ticket].Dungeon) {
                Player.tell("Esta entrada esta vacia...")
                return
            }
            if (Player.stages.has("UsingScroll"))
                return
            let Players = event.server.getLevel(Player.level.dimension).getPlayers()
            for (let PlayerExtra of Players) {
                if (GetDistance(Player, PlayerExtra) <= RaidSize+5) {
                    if (PlayerExtra.stages.has("UsingScroll")) {
                        Player.tell("Otro jugador cercano esta iniciando una raid...")
                        return
                    }
                }
            }
            Player.stages.add("UsingScroll")
            event.item.setCount(0)
            let world = Player.level
            let radius = 3
            let Counter = 0
            let Effects = Player.potionEffects
            let PlayerOldX = Player.x
            let PlayerOldZ = Player.z
            let MaxPlayers = 5
            event.server.runCommandSilent(`title ${Player.name.getString()} actionbar "§4§l[Raids]§r§l Iniciando Raid, Muevete para cancelarla."`)
            //Effects.add('minecraft:slowness', 160, 99) // 160 = 8 seconds (ticks) Slowness
            let CancelRaid = false
            let ParticleSchedule = event.player.server.scheduleRepeatingInTicks(10, () => {
                if (Player.x != PlayerOldX || Player.z != PlayerOldZ) {
                    CancelRaid = true
                }
                for (let angle = 0; angle < 360; angle +=8) { // Adjust step for more/less particles
                    let radians = angle * (PI / 180)
                    let xOffset = Math.cos(radians) * radius
                    let zOffset = Math.sin(radians) * radius
                    event.server.getLevel(Player.level.dimension).spawnParticles("minecraft:dust 1 0 0 1", true, Player.x+xOffset, Player.y+0.5, Player.z+zOffset, 0, 0, 0, RaidSize, 0.1)
                }
            })
            let Schedule = event.player.server.scheduleRepeatingInTicks(20, () => {
                Counter += 1
                if (Counter <= 5 && !CancelRaid) {
                    let Players = event.server.getLevel(Player.level.dimension).getPlayers()
                    let Secs = 6 - Counter
                    let PlayersToRaid = 0
                    for (let PlayerExtra of Players) {
                        if (GetDistance(Player, PlayerExtra) <= RaidSize) {
                            PlayersToRaid += 1
                            event.server.runCommandSilent(`playsound minecraft:entity.experience_orb.pickup player ${PlayerExtra.name.getString()} ${Player.x} ${Player.y} ${Player.z}`)
                            event.server.runCommandSilent(`title ${PlayerExtra.name.getString()} actionbar "§4§l[Raids]§r§l Teletransportando en ${Secs} Segundos... [${PlayersToRaid}/${MaxPlayers}]"`)
                        }
                    }
                } else {
                    ParticleSchedule.reschedule(0)
                    ParticleSchedule.clear()
                    ParticleSchedule = null
                    Schedule.reschedule(0)
                    Schedule.clear()
                    Schedule = null
                    if (!CancelRaid){
                        let Players = event.server.getLevel(Player.level.dimension).getPlayers()
                        let Raid = Data.TicketsData[ticket]
                        let PlayersToRaid = 0
                        for (let PlayerExtra of Players) {
                            if (GetDistance(Player, PlayerExtra) <= RaidSize) {
                                event.server.runCommandSilent(`title ${PlayerExtra.name.getString()} actionbar "§4§l[Raids]§r§l Teletransportando..."`)
                                PlayerExtra.teleportTo(Raid.Dimension, Data.Dungeons[Raid.Dungeon].x, Data.Dungeons[Raid.Dungeon].y, Data.Dungeons[Raid.Dungeon].z, 1, 1)
                                event.server.runCommandSilent(`playsound minecraft:entity.experience_orb.pickup player ${PlayerExtra.name.getString()} ${Data.Dungeons[Raid.Dungeon].x} ${Data.Dungeons[Raid.Dungeon].y} ${Data.Dungeons[Raid.Dungeon].z}`)
                                PlayersToRaid += 1
                                if (PlayersToRaid >= MaxPlayers)
                                    break
                            }
                        }
                        Player.stages.remove("UsingScroll")
                        for (let Spawner of Raid.Spawners) {
                            event.server.runCommandSilent(`generatespawner ${Spawner.Position.x} ${Spawner.Position.y} ${Spawner.Position.z} ${Spawner.Type}`)
                        }

                    } else {
                        event.server.runCommand(`title ${Player.name.getString()} actionbar "§4§l[Raids]§r§l Raid cancelada."`)
                        event.item.setCount(1)
                        Player.stages.remove("UsingScroll")
                    }
                }
            })
        }
    }
})
