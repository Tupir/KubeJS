StartupEvents.registry('entity_type', event => {
    event.create('nebuland:spawner', 'entityjs:mob')
      .setRenderType("cutout")
      .sized(2, 2)
      .modelSize(8, 8)
      .updateInterval(3)
      .defaultDeathPose(true)
      .repositionEntityAfterLoad(true)
      .isPushable(false)
      .fireImmune(false)
      .setSoundVolume(0.5)
      .setSummonable(true)
      .defaultDeathPose(false)
      .addAnimationController('spawnerController', 0, event => {
        event.addTriggerableAnimation('death', 'death', 'HOLD_ON_LAST_FRAME')
        event.thenLoop('idle')
        return true
      })
      .onAddedToWorld(entity => {
        entity.setGlowing(true)
      })
      .onDeath(ctx => {
        ctx.entity.triggerAnimation('spawnerController', 'death')
      })
})
  
StartupEvents.registry('item', (event) => {
    //.texture('kubejs:item/tickets/common_ticket')

    event.create('nebuland:raid_entrance_1')
      .displayName('Raid Entrance')
      .unstackable()
    event.create('nebuland:raid_entrance_2')
      .displayName('Raid Entrance')
      .unstackable()
    event.create('nebuland:raid_entrance_3')
      .displayName('Raid Entrance')
      .unstackable()
    event.create('nebuland:raid_entrance_4')
      .displayName('Raid Entrance')
      .unstackable()
    event.create('nebuland:raid_entrance_5')
      .displayName('Raid Entrance')
      .unstackable()
    event.create('nebuland:raid_entrance_6')
      .displayName('Raid Ticket')
      .unstackable()
      
    event.create('nebuland:soda', 'basic')
      .rarity("rare")
      .displayName("Soda")
      .useAnimation('drink')
      .useDuration(itemstack => 36)
      .use(() => true)
      .finishUsing((itemstack, level, entity) => {
        let effects = entity.potionEffects
        effects.add('minecraft:regeneration', 10 * 20)
        effects.add('minecraft:absorption', 60 * 20, 1)
        effects.add('minecraft:strength', 10 * 20)
        entity.addItemCooldown(itemstack, 10)
        itemstack.shrink(1)
        return itemstack
      })

    event.create('nebuland:soda_2', 'basic')
      .rarity("epic")
      .displayName("DrPepper")
      .useAnimation('drink')
      .useDuration(itemstack => 36)
      .use(() => true)
      .finishUsing((itemstack, level, entity) => {
        let effects = entity.potionEffects
        effects.add('minecraft:regeneration', 5 * 20, 1)
        effects.add('minecraft:absorption', 60 * 20)
        effects.add('minecraft:resistance', 25 * 20)
        effects.add('minecraft:strength', 25 * 20, 1)
        entity.addItemCooldown(itemstack, 60)
        itemstack.shrink(1)
        return itemstack
      })
})

StartupEvents.modifyCreativeTab("kubejs:tab", event => {
  event.icon = 'nebuland:soda'
  event.displayName = Text.darkPurple("Nebuland")
})
