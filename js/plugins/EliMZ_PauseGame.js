//============================================================================
// EliMZ_PauseGame.js
//============================================================================

/*:
@target MZ
@base EliMZ_Book

@plugindesc ♦3.1.0♦ Adds a Pause Scene like retro games!
@author Hakuen Studio
@url https://hakuenstudio.itch.io/eli-pause-game-for-rpg-maker-mv/rate?source=game

@help
★★★★★ Rate the plugin! Please, is very important to me ^^
● Terms of Use
https://www.hakuenstudio.com/terms-of-use-5-0-0

============================================================================
Features
============================================================================

• Pause the game by pressing a button when you are at the scene map 
• Choose if you want to stop the game time ($gameSystem.playTime()).
• Choose an image to show when the game is paused.
• Choose if you want to show the Scene Map as a background.
• Adds a screen button to be able to pause the game.
• Play a common event when leaving the pause scene and return to the map.

============================================================================
How to use
============================================================================

https://docs.google.com/document/d/18wP7LSFTmndEeFjYlTz9cKDngafGdUXOTxkPJ7qXInA/edit?usp=sharing

============================================================================

@param commonEvent
@text Common event
@type common_event
@desc Select a common event to play when leave the pause scene.
@default 0

@param switch
@text Disable Switch
@type switch
@desc If this switch is on, the pause access will be disabled.(Also hides the pause screen button)
@default 0

@param separator1
@text Keyboard / Gamepad

    @param overwrite
    @text Overwrite keys
    @type boolean
    @desc Set to true if you want to overwrite the default keys.
    @default true
    @parent separator1

    @param keyboardButton
    @text Keyboard Button
    @type select
    @option none @option a @option b @option c @option d @option e @option f @option g @option h @option i @option j @option k @option l @option m @option n @option o @option p @option q @option r @option s @option t @option u @option v @option w @option x @option y @option z @option 0 @option 1 @option 2 @option 3 @option 4 @option 5 @option 6 @option 7 @option 8 @option 9 @option backspace @option tab @option enter @option shift @option ctrl @option alt @option pausebreak @option capslock @option esc @option space @option pageup @option pagedown @option end @option home @option leftarrow @option uparrow @option rightarrow @option downarrow @option insert @option delete @option leftwindowkey @option rightwindowkey @option selectkey @option numpad0 @option numpad1 @option numpad2 @option numpad3 @option numpad4 @option numpad5 @option numpad6 @option numpad7 @option numpad8 @option numpad9 @option multiply @option add @option subtract @option decimalpoint @option divide @option f1 @option f2 @option f3 @option f4 @option f5 @option f6 @option f7 @option f8 @option f9 @option f10 @option f11 @option f12 @option numlock @option scrolllock @option semicolon @option equalsign @option comma @option dash @option period @option forwardslash @option graveaccent @option openbracket @option backslash @option closebracket @option singlequote
    @desc Choose the keyboard button.
    @default none
    @parent separator1

    @param gamepadButton
    @text Game pad button
    @type select
    @option none @option a @option b @option x @option y @option lb @option rb @option lt @option rt @option select @option start @option l3 @option r3 @option up @option down @option left @option right 
    @desc Choose the gamepad button. Put none to not use.
    Default is none.
    @default none
    @parent separator1

@param separator2
@text Screen Button

    @param enableScreenButton
    @text Enable 
    @type boolean
    @desc Set true to use a on screen button.
    @default true
    @parent separator2

    @param buttonImage
    @text Image
    @type file
    @dir img/system/
    @desc Choose the image for the on screen button.
    @default
    @require 1
    @parent separator2

    @param position
    @text Position
    @type struct<positionSt>
    @desc The position of the press start.
    @default {"alignX":"center","offsetX":"0","alignY":"center","offsetY":"0"}
    @parent separator2

@param separator3
@text Sound

    @param pauseSe
    @text Filename SE
    @type file
    @dir audio/se/
    @desc Set here the sound to play when pause/resume the game.
    @default
    @parent separator3

    @param pauseSeConfig
    @text Pan, Pitch, Volume
    @type text
    @desc Pan(-100, 100), Pitch(-50, 150), Volume(0, 100)
    @default 0, 100, 60
    @parent separator3

@param separator4
@text Scene Pause

    @param stopGameTime
    @text Stop Game Time
    @type boolean
    @desc If true, the game time will be stopped while on the pause scene.
    @default true
    @parent separator4

    @param pauseImage
    @text Custom Pause Image
    @type file
    @dir img/system/
    @desc Choose the file you want for the pause image.
    @default
    @require 1
    @parent separator4

    @param pauseAnime
    @text Pause Image Position
    @type struct<animeSt>
    @desc The position of the pause image.
    @default
    @parent separator4

    @param sceneMapBackground
    @text Scene Map as Background
    @type boolean
    @desc If true, the pause scene will use the scene map as background image.
    @default false
    @parent separator4

        @param blur
        @text Blur background
        @type boolean
        @desc Choose if you want to blur the map background.
        @default false
        @parent sceneMapBackground

        @param backgroundOpacity
        @text Background Opacity
        @type number
        @min 0
        @max 255
        @desc The background opacity.
        @default 192
        @parent sceneMapBackground

@command changeImage
@text Change Pause Image
@desc Change the image for the scene pause.

    @arg image
    @text Pause Image
    @type file
    @dir img/system/
    @desc Choose the file you want for the pause image.

@command pauseGame
@text Pause Game
@desc Pause the game.

*/

/* -------------------------------- POSITION -------------------------------- */
{
/*~struct~positionSt:

@param alignX
@text Align X
@type select
@option none
@option left
@option center
@option right
@desc Select none to only use offset value.
@default left
        
    @param offsetX
    @text Position X
    @type text
    @desc The Offset X position.
    @default 10
    @parent alignX

@param alignY
@text Align Y
@type select
@option none
@option top
@option center
@option bottom
@desc Select none to only use offset value.
@default top

    @param offsetY
    @text Position Y
    @type text
    @desc The offset Y position.
    @default 10
    @parent alignY

*/
}

/* ---------------------------- MESSAGE POSITION ---------------------------- */
{
/*~struct~animeSt:

@param duration
@text Move Duration
@type text
@desc The duration for the window to move from Initial to Target Position.
@default 1

@param easing
@text Easing
@type combo
@option linear @option --- In --- @option easeInQuad @option easeInCubic @option easeInQuart @option easeInQuint @option easeInSine @option easeInExpo @option easeInCirc @option easeInBack @option easeInBounce @option easeInElastic @option --- Out --- @option easeOutQuad @option easeOutCubic @option easeOutQuart @option easeOutQuint @option easeOutSine @option easeOutExpo @option easeOutCirc @option easeOutBack @option easeOutBounce @option easeOutElastic @option --- In / Out --- @option easeInOutQuad @option easeInOutCubic @option easeInOutQuart @option easeInOutQuint @option easeInOutSine @option easeInOutExpo @option easeInOutCirc @option easeInOutBack @option easeInOutBounce @option easeInOutElastic @option --- Out / In --- @option easeOutInQuad @option easeOutInCubic @option easeOutInQuart @option easeOutInQuint @option easeOutInSine @option easeOutInCirc @option easeOutInExpo @option easeOutInBack @option easeOutInBounce @option easeOutInElastic 
@desc Choose the easing type. Can use \v[id].
@default linear

@param separator1
@text Initial

@param initialAlignX
@text Align X
@type select
@option left
@option center
@option right
@option left_offScreen
@option right_offScreen
@desc Select left to only use offset value.
@default left
@parent separator1

@param initialOffsetX
@text Offset X
@type text
@desc The Offset X position.
@default 0
@parent separator1

@param initialAlignY
@text Align Y
@type select
@option top
@option center
@option bottom
@option top_offScreen
@option bottom_offScreen
@desc Select top to only use offset value.
@default top
@parent separator1

@param initialOffsetY
@text Offset Y
@type text
@desc The offset Y position.
@default 0
@parent separator1

@param initialAlpha
@text Alpha (Opacity)
@type text
@desc The alpha value. From 0 to 1. Can use decimals.
@default 0
@parent separator1

@param separator2
@text Target

@param targetAlignX
@text Align X
@type select
@option left
@option center
@option right
@desc Select left to only use offset value.
@default left
@parent separator2

@param targetOffsetX
@text Offset X
@type text
@desc The Offset X position.
@default 0
@parent separator2

@param targetAlignY
@text Align Y
@type select
@option top
@option center
@option bottom
@desc Select top to only use offset value.
@default top
@parent separator2

@param targetOffsetY
@text Offset Y
@type text
@desc The offset Y position.
@default 0
@parent separator2

@param targetAlpha
@text Alpha (Opacity)
@type text
@desc The alpha value. From 0 to 1. Can use decimals.
@default 1
@parent separator2

*/
}

"use strict"

var Eli = Eli || {}
var Imported = Imported || {}
Imported.Eli_PauseGame = true

/* ========================================================================== */
/*                                   PLUGIN                                   */
/* ========================================================================== */
Eli.PauseGame = {

    Parameters: class {
        constructor(parameters){
            const [pan, pitch, volume] = parameters.pauseSeConfig.split(",")

            this.commonEvent = Number(parameters.commonEvent)
            this.disableSwitch = Number(parameters.switch)
            this.overwriteKeys = parameters.overwrite === "true"
            this.keyboardButton = parameters.keyboardButton
            this.gamepadButton = parameters.gamepadButton
            this.se = {
                name: parameters.pauseSe,
                pitch: Number(pitch),
                pan: Number(pan),
                volume: Number(volume),
            }
            this.scene = {
                blurBackground: parameters.blur === "true",
                pauseImage: parameters.pauseImage,
                pauseAnime: this.parseAnime(JSON.parse(parameters.pauseAnime)),
                backgroundOpacity: Number(parameters.backgroundOpacity) || 192,
                mapBackground: parameters.sceneMapBackground === "true",
                stopGameTime: parameters.stopGameTime === "true",
            }
            this.screenButton = {
                enable: parameters.enableScreenButton === "true",
                image: parameters.buttonImage,
                position: this.parsePosition(JSON.parse(parameters.position)),
            }
        }

        parsePosition(parameters){
            return {
                alignX: parameters.alignX,
                alignY: parameters.alignY,
                offsetX: Number(parameters.offsetX),
                offsetY: Number(parameters.offsetY),
            }
        }

        parseAnime(parameters){
            return {
                duration: parameters.duration,
                easing: parameters.easing,
                initial:{
                    alignX: parameters.initialAlignX,
                    alignY: parameters.initialAlignY,
                    offsetX: Number(parameters.initialOffsetX),
                    offsetY: Number(parameters.initialOffsetY),
                    alpha: Number(parameters.initialAlpha),
                },
                target:{
                    alignX: parameters.targetAlignX,
                    alignY: parameters.targetAlignY,
                    offsetX: Number(parameters.targetOffsetX),
                    offsetY: Number(parameters.targetOffsetY),
                    alpha: Number(parameters.targetAlpha),
                },
            }
        }
    },

    Scene_Pause: class extends Scene_Base{
    
        initialize(){
            super.initialize()
            this.saveFrameCount()
        }

        prepare(parameters){
            this.parameters = parameters
        }

        saveFrameCount(){
            this.frameCountOnPause = Graphics.frameCount
        }

        restoreFrameCount(){
            Graphics.frameCount = this.frameCountOnPause
        }

        create(){
            if(this.parameters.mapBackground){
                this.createBackground()
            }
            super.create()
            this.createPauseSprite()
        }
    
        createBackground(){
            this.background = new Sprite(SceneManager.backgroundBitmap())
            this.background.opacity = this.parameters.backgroundOpacity

            if(this.parameters.blurBackground){
                this.background.filters = [new PIXI.filters.BlurFilter()]
            }

            this.addChild(this.background)
        }
    
        createPauseSprite(){
            const bitmap = ImageManager.loadSystem($eliData?.PauseGame?.pauseImage || this.parameters.pauseImage)
            this.pauseSprite = new Eli.PauseGame.Sprite_PauseImage(bitmap, this.parameters.pauseAnime)
            this.addChild(this.pauseSprite)
        }
    
        update(){
            this.pauseSprite.update()

            if(!this.pauseSprite.animeGroup.isRunning()){

                if(Eli.PauseGame.isPauseKeyTriggered() || TouchInput.isTriggered()){
                    SceneManager.pop()
                }
            }
        }
    
        terminate(){
            super.terminate()

            if(this.parameters.stopGameTime){
                this.restoreFrameCount()
            }
            
            SoundManager.playPause()
            $gameTemp.reserveCommonEvent(Eli.PauseGame.getParam().commonEvent)
        }
    },

    Sprite_PauseImage: class extends Sprite{

        initialize(bitmap, anime){
            super.initialize(bitmap)
            this.bitmap.addLoadListener(this.createAnime.bind(this, anime))
        }
    
        createAnime(anime){
            const defaultData = this.createAnimeDefaultData(anime)
            const animeProps = this.createAnimeProps(anime)
            const animations = Eli.AnimeManager.createAnimations(this, animeProps, defaultData)
            this.animeGroup = new Eli.AnimeGroup(animations, defaultData)
            this.animeGroup.play()
        }

        createAnimeDefaultData(anime){
            const defaultData = Eli.AnimeManager.createDefaultData()
            defaultData.duration = Number(Eli.PluginManager.parseVariables(anime.duration))
            defaultData.easing = anime.easing

            return defaultData
        }

        createAnimeProps(anime){
            const [initialX, initialY] = this.createAnimePosition(anime.initial, anime.target.offsetX, anime.target.offsetY)
            const [targetX, targetY] = this.createAnimePosition(anime.target)

            return {
                x: {value: [initialX, targetX]},
                y: {value: [initialY, targetY]},
                alpha: {value: [anime.initial.alpha, anime.target.alpha]},
            }
        }

        createAnimePosition(position, targetOffsetX = 0, targetOffsetY = 0){
            const {alignX, alignY, offsetX, offsetY} = position
        
            const x = {
                left: offsetX,
                center: (Graphics.width/2 - this.bitmap.width/2) + offsetX,
                right: (Graphics.width - this.bitmap.width) + offsetX,
                left_offScreen: 0 - (Math.abs(targetOffsetX) + this.bitmap.width),
                right_offScreen: Graphics.width + this.bitmap.width + Math.abs(targetOffsetX),
            }[alignX]
        
            const y = {
                top: offsetY,
                center: (Graphics.height/2 - this.bitmap.height/2) + offsetY,
                bottom: (Graphics.height - this.bitmap.height) + offsetY,
                top_offScreen: 0 - (Math.abs(targetOffsetY) + this.bitmap.height),
                bottom_offScreen: Graphics.height + this.bitmap.height + Math.abs(targetOffsetY),
            }[alignY]
            
            return [Math.round(x), Math.round(y)]
        }
    
        update(){
            this.animeGroup.update()
        }
    },

    Sprite_PauseButton: class extends Sprite_Clickable{

        initialize(bitmap, position){
            Sprite.prototype.initialize.call(this, bitmap)
            this._pressed = false
            this._hovered = false
            this.bitmap.addLoadListener(() => {
                this.setColdFrame()
                this.initPosition(position)
            })
        }
    
        initPosition(position){  
            const {alignX, offsetX, alignY, offsetY} = position
            const x = Eli.Utils.calculateScreenPosition(alignX, offsetX, this.bitmap.width, "x")
            const y = Eli.Utils.calculateScreenPosition(alignY, offsetY, this.bitmap.height/2, "y")

            this.move(x, y)
        }

        setColdFrame(){
            this.setFrame(0, 0, this.bitmap.width, this.bitmap.height/2)
        }
        
        setHotFrame(){
            this.setFrame(0, this.bitmap.height/2, this.bitmap.width, this.bitmap.height/2)
        }

        onPress(){
            this.setHotFrame()
        }

        onMouseExit(){
            this.setColdFrame()
        }

        onClick() {
            this.setColdFrame()
            Eli.PauseGame.callScenePause()
        }

        isVisible(){
            return ConfigManager.touchUI && !Eli.PauseGame.isPauseDisabled() && !$gameMessage.isBusy()
        }

        update(){
            super.update()
            this.visible = this.isVisible()
        }
    
    },

    keyboardButton: 'pause',
    gamepadButton: 'pause',

    initialize(){
        this.initParameters()
        this.initPluginCommands()
        this.initButtons()
    },

    initParameters(){
        const parameters = PluginManager.parameters(Eli.PluginManager.getPluginName())
        this.parameters = new this.Parameters(parameters)
    },

    initPluginCommands(){
        const commands = ['pauseGame', 'changeImage']
        Eli.PluginManager.registerCommands(this, commands)
    },

    initButtons(){
        if(this.parameters.keyboardButton !== "none"){
            this.setKeyboardButton()
        }

        if(this.parameters.gamepadButton !== "none"){
            this.setGamePadButton()
        }
    },

    setKeyboardButton(){
        const keyName = this.parameters.keyboardButton.toLowerCase()
        const keyCode = Eli.KeyCodes.keyboard[keyName]

        if(this.parameters.overwriteKeys){
            Input.keyMapper[keyCode] = this.keyboardButton

        }else if(!Eli.KeyCodes.isDefaultKeyboard(keyCode)){
            Input.keyMapper[keyCode] = this.keyboardButton

        }else{
            this.keyboardButton = Input.keyMapper[keyCode]
        }
    },

    setGamePadButton(){
        const keyName = this.parameters.gamepadButton.toLowerCase()
        const keyCode = Eli.KeyCodes.gamepad[keyName]

        if(this.parameters.overwriteKeys){
            Input.gamepadMapper[keyCode] = this.gamepadButton

        }else if(!Eli.KeyCodes.isDefaultGamepad(keyCode)){
            Input.gamepadMapper[keyCode] = this.gamepadButton

        }else{
            this.gamepadButton = Input.gamepadMapper[keyCode]
        }
    },

    getParam(){
        return this.parameters
    },

    isPauseDisabled(){
        return $gameSwitches.value(this.getParam().disableSwitch)
    },

    callScenePause(){
        if(!this.isPauseDisabled()){
            SoundManager.playPause()
            SceneManager.push(this.Scene_Pause)
            SceneManager.prepareNextScene(this.getParam().scene)
        }
    },

    isPauseKeyTriggered(){
        return Input.isTriggered(this.keyboardButton) || Input.isTriggered(this.gamepadButton)
    },

/* ----------------------------- PLUGIN COMMAND ----------------------------- */

    pauseGame(){
        this.callScenePause()
    },

    changeImage(args){
        $eliData.PauseGame.pauseImage = args.image
    },

}

{

const Plugin = Eli.PauseGame
const Alias = {}

Plugin.initialize()

Alias.Eli_SavedContents_initialize = Eli_SavedContents.prototype.initialize
Eli_SavedContents.prototype.initialize = function(){
    Alias.Eli_SavedContents_initialize.call(this)
    this.contents.PauseGame = {
        pauseImage: Plugin.getParam().scene.pauseImage
    }
}

/* ------------------------------ SOUND MANAGER ----------------------------- */
SoundManager.playPause = function(){
    const {name, volume, pitch, pan} = Plugin.getParam().se
    const se = {
        name: name,
        pan: pan || 0,
        pitch: pitch || 100,
        volume: volume || ConfigManager.seVolume
    }
    AudioManager.playSe(se)
}

/* -------------------------------- SCENE MAP ------------------------------- */
Alias.SceneMap_createButtons = Scene_Map.prototype.createButtons;
Scene_Map.prototype.createButtons = function() {
    Alias.SceneMap_createButtons.call(this)

    if(Plugin.getParam().screenButton.enable){
        this.createPauseGameButton()
    }
}

Scene_Map.prototype.createPauseGameButton = function() {
    const bitmap = ImageManager.loadSystem(Plugin.getParam().screenButton.image)
    this.pauseGameButton = new Plugin.Sprite_PauseButton(bitmap, Plugin.getParam().screenButton.position)
    this.addChild(this.pauseGameButton)
}

Alias.SceneMap_update = Scene_Map.prototype.update
Scene_Map.prototype.update = function() {
    Alias.SceneMap_update.call(this)

    if(this.canUpdatePauseGameKeyButton()){
        this.updatePauseGameKeyButton()
    }
}

Scene_Map.prototype.canUpdatePauseGameKeyButton = function(){
    return !$gameMap.isEventRunning() && Plugin.isPauseKeyTriggered() 
}

Scene_Map.prototype.updatePauseGameKeyButton = function(){
    Plugin.callScenePause()
}

Alias.SceneMap_isAnyButtonPressed = Scene_Map.prototype.isAnyButtonPressed;
Scene_Map.prototype.isAnyButtonPressed = function() {
    const alias = Alias.SceneMap_isAnyButtonPressed.call(this)
    return alias || this.isPauseButtonPressed()
}

Scene_Map.prototype.isPauseButtonPressed = function(){
    return this.pauseGameButton && this.pauseGameButton.isPressed()
}

Alias.SceneMap_terminate = Scene_Map.prototype.terminate
Scene_Map.prototype.terminate = function(){
    this.hidePauseButton()
    Alias.SceneMap_terminate.call(this)
}

Scene_Map.prototype.hidePauseButton = function(){
    if(this.pauseGameButton){
        this.pauseGameButton.hide()
        this.pauseGameButton.visible = false
    }
}

}