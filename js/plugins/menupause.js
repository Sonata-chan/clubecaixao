/*:
 * @target MZ
 * @plugindesc Adiciona um menu de pausa customizável.
 *
 * @param menuBackground
 * @text Fundo do Menu
 * @type file
 * @dir img/pictures/
 * @default pause_bg
 *
 * @param buttonBackground
 * @text Fundo dos Botões
 * @type file
 * @dir img/pictures/
 * @default btn_bg
 *
 * @param fontSize
 * @text Tamanho da Fonte
 * @type number
 * @default 26
 *
 * @param fontFace
 * @text Fonte
 * @type string
 * @default rmmz-mainfont
 *
 * @param buttonSpacing
 * @text Espaçamento dos Botões
 * @type number
 * @default 70
 *
 * @param pauseTitle
 * @text Texto do Título
 * @type string
 * @default PAUSADO
 *
 * @param titleFontSize
 * @text Tamanho da Fonte do Título
 * @type number
 * @default 48
 *
 * @param titleOffsetY
 * @text Offset Vertical do Título
 * @type number
 * @default -260
 *
 * @param titleMapId
 * @text ID do Mapa do Título
 * @type number
 * @default 1
 *
 * @param titleMapX
 * @text X do Mapa do Título
 * @type number
 * @default 10
 *
 * @param titleMapY
 * @text Y do Mapa do Título
 * @type number
 * @default 10
 * 
 * @param pauseButtonImage
 * @text Imagem do Botão Pause
 * @type file
 * @dir img/pictures/
 * @default botao_menu
 *
 * @param pauseButtonHoverImage
 * @text Hover do Botão Pause
 * @type file
 * @dir img/pictures/
 * @default botao_menu_hover
 *
 * @param pauseButtonX
 * @text Botão X
 * @type number
 * @default 744
 *
 * @param pauseButtonY
 * @text Botão Y
 * @type number
 * @default 24
 * 
 * @param pauseButtonSwitch
 * @text Switch do Botão
 * @type switch
 * @default 1
 */

(() => {

    //==================================================
    // PARÂMETROS
    //==================================================

    const pluginName =
        document.currentScript.src
        .match(/([^\/]+)\.js$/)[1];

    const params =
        PluginManager.parameters(pluginName);

    const MENU_BACKGROUND =
        String(params.menuBackground || "pause_bg");

    const BUTTON_BACKGROUND =
        String(params.buttonBackground || "btn_bg");

    const FONT_SIZE =
        Number(params.fontSize || 26);

    const FONT_FACE =
        String(params.fontFace || "rmmz-mainfont");

    const BUTTON_SPACING =
        Number(params.buttonSpacing || 70);

    const PAUSE_TITLE =
        String(params.pauseTitle || "PAUSADO");

    const TITLE_FONT_SIZE =
        Number(params.titleFontSize || 48);

    const TITLE_OFFSET_Y =
        Number(params.titleOffsetY || -260);

    const TITLE_MAP_ID =
        Number(params.titleMapId || 1);

    const TITLE_MAP_X =
        Number(params.titleMapX || 10);

    const TITLE_MAP_Y =
        Number(params.titleMapY || 10);
    
    const PAUSE_BUTTON_IMAGE =
        String(params.pauseButtonImage);

    const PAUSE_BUTTON_HOVER =
        String(params.pauseButtonHoverImage);

    const PAUSE_BUTTON_X =
        Number(params.pauseButtonX);

    const PAUSE_BUTTON_Y =
        Number(params.pauseButtonY);    

    const PAUSE_BUTTON_SWITCH =
        Number(params.pauseButtonSwitch);

    //==================================================
    // REQUEST
    //==================================================

    window._pauseMenuRequested = false;

    window.openCustomPauseMenu = function() {

        window._pauseMenuRequested = true;
    };

    //==================================================
    // SCENE
    //==================================================

    function Scene_CustomPause() {
        this.initialize(...arguments);
    }

    Scene_CustomPause.prototype =
        Object.create(Scene_MenuBase.prototype);

    Scene_CustomPause.prototype.constructor =
        Scene_CustomPause;

    //==================================================
    // CREATE
    //==================================================

    Scene_CustomPause.prototype.create =
        function() {

        Scene_MenuBase.prototype.create.call(this);

        this.createBackground();
        this.createTitle();
        this.createButtons();
    };

    //==================================================
    // BACKGROUND
    //==================================================

    Scene_CustomPause.prototype.createBackground =
        function() {

        this._backgroundSprite = new Sprite(
            ImageManager.loadPicture(MENU_BACKGROUND)
        );

        this.addChild(this._backgroundSprite);
    };

    //==================================================
    // TITLE
    //==================================================

    Scene_CustomPause.prototype.createTitle =
        function() {

        const bitmap =
            new Bitmap(800, 100);

        bitmap.fontFace = FONT_FACE;
        bitmap.fontSize = TITLE_FONT_SIZE;

        bitmap.drawText(
            PAUSE_TITLE,
            0,
            0,
            800,
            100,
            "center"
        );

        const sprite =
            new Sprite(bitmap);

        sprite.x =
            (Graphics.boxWidth / 2) - 400;

        sprite.y =
            (Graphics.boxHeight / 2)
            + TITLE_OFFSET_Y;

        this.addChild(sprite);
    };


    //==================================================
    // BOTÕES
    //==================================================

    Scene_CustomPause.prototype.createButtons =
        function() {

        this._buttons = [];

        const centerX =
            Graphics.boxWidth / 2;

        const centerY =
            Graphics.boxHeight / 2;

        const startY =
            centerY - (BUTTON_SPACING * 1.5);

        const buttons = [

            {
                text: "Salvar Jogo",
                callback:
                    this.commandSave.bind(this)
            },

            {
                text: "Carregar Jogo",
                callback:
                    this.commandLoad.bind(this)
            },

            {
                text:
                    AudioManager._muted
                        ? "Ativar Sons"
                        : "Desativar Sons",

                callback:
                    this.commandSound.bind(this)
            },

            {
                text: "Voltar ao Jogo",
                callback:
                    this.commandResume.bind(this)
            },

            {
                text: "Sair",
                callback:
                    this.commandTitle.bind(this)
            }
        ];

        for (let i = 0; i < buttons.length; i++) {

            const data = buttons[i];

            this.createButton(
                data.text,
                centerX,
                startY + (i * BUTTON_SPACING),
                data.callback
            );
        }
    };

    //==================================================
    // CREATE BUTTON
    //==================================================

    Scene_CustomPause.prototype.createButton =
        function(text, x, y, callback) {

        const container =
            new Sprite();

        const bg =
            new Sprite(
                ImageManager.loadPicture(
                    BUTTON_BACKGROUND
                )
            );

        bg.anchor.x = 0.5;
        bg.anchor.y = 0.5;

        container.addChild(bg);

        const bitmap =
            new Bitmap(500, 80);

        bitmap.fontFace = FONT_FACE;
        bitmap.fontSize = FONT_SIZE;

        bitmap.drawText(
            text,
            0,
            0,
            500,
            80,
            "center"
        );

        const label =
            new Sprite(bitmap);

        label.anchor.x = 0.5;
        label.anchor.y = 0.5;

        container.addChild(label);

        container.x = x;
        container.y = y;

        container._callback = callback;
        container._bg = bg;

        this.addChild(container);

        this._buttons.push(container);
    };

    //==================================================
    // UPDATE
    //==================================================

    Scene_CustomPause.prototype.update =
        function() {

        Scene_MenuBase.prototype.update.call(this);

        this.updateButtons();
    };

    //==================================================
    // BUTTON INPUT
    //==================================================

    Scene_CustomPause.prototype.updateButtons =
        function() {

        const mx = TouchInput.x;
        const my = TouchInput.y;

        for (const button of this._buttons) {

            const bg = button._bg;

            const left =
                button.x - bg.width / 2;

            const right =
                button.x + bg.width / 2;

            const top =
                button.y - bg.height / 2;

            const bottom =
                button.y + bg.height / 2;

            const hovered =
                mx >= left &&
                mx <= right &&
                my >= top &&
                my <= bottom;

            button.scale.x =
                hovered ? 1.05 : 1;

            button.scale.y =
                hovered ? 1.05 : 1;

            if (
                hovered &&
                TouchInput.isTriggered()
            ) {

                button._callback();

                return;
            }
        }
    };

    //==================================================
    // SAVE
    //==================================================

    Scene_CustomPause.prototype.commandSave =
        function() {
        
        openedFromTitle = false;
        openVNSave();
    };

    //==================================================
    // LOAD
    //==================================================

    Scene_CustomPause.prototype.commandLoad =
        function() {
            
        openedFromTitle = false;
        openVNLoad();
    };

    //==================================================
    // SOUND
    //==================================================

    Scene_CustomPause.prototype.commandSound =
        function() {

        if (!AudioManager._muted) {

            AudioManager._savedBgmVolume =
                AudioManager.bgmVolume;

            AudioManager._savedBgsVolume =
                AudioManager.bgsVolume;

            AudioManager._savedMeVolume =
                AudioManager.meVolume;

            AudioManager._savedSeVolume =
                AudioManager.seVolume;

            AudioManager.bgmVolume = 0;
            AudioManager.bgsVolume = 0;
            AudioManager.meVolume = 0;
            AudioManager.seVolume = 0;

            AudioManager._muted = true;

        } else {

            AudioManager.bgmVolume =
                AudioManager._savedBgmVolume ?? 100;

            AudioManager.bgsVolume =
                AudioManager._savedBgsVolume ?? 100;

            AudioManager.meVolume =
                AudioManager._savedMeVolume ?? 100;

            AudioManager.seVolume =
                AudioManager._savedSeVolume ?? 100;

            AudioManager._muted = false;
        }

        SceneManager.goto(
            Scene_CustomPause
        );
    };

    //==================================================
    // TITLE
    //==================================================

    Scene_CustomPause.prototype.commandTitle =
    function() {

    // Limpa imagens da tela
    $gameScreen.clearPictures();

    // Reinicia o jogo corretamente
    DataManager.setupNewGame();

    // Teleporta para o mapa da tela inicial
    $gamePlayer.reserveTransfer(
        TITLE_MAP_ID,
        TITLE_MAP_X,
        TITLE_MAP_Y,
        2,
        0
    );

    // Vai para o mapa
    SceneManager.goto(Scene_Map);
};

    //==================================================
    // RESUME
    //==================================================

    Scene_CustomPause.prototype.commandResume =
        function() {

        SceneManager.pop();
    };

    //==================================================
    // ABERTURA
    //==================================================

    const _Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update =
        function() {

        _Scene_Map_update.call(this);

        if (window._pauseMenuRequested) {

            window._pauseMenuRequested =
                false;

            window.vnPauseScreenshot =
                SceneManager.snap(); 

            SceneManager.push(
                Scene_CustomPause
            );
        }
    };

    //==================================================
    // PAUSAR EVENTOS
    //==================================================

    const _Game_Map_updateInterpreter =
        Game_Map.prototype.updateInterpreter;

    Game_Map.prototype.updateInterpreter =
        function() {

        if (
            SceneManager._scene instanceof
            Scene_CustomPause
        ) {
            return;
        }

        _Game_Map_updateInterpreter.call(this);
    };

//==================================================
// MAP PAUSE BUTTON
//==================================================

const _VNPause_CreateAllWindows =
    Scene_Map.prototype.createAllWindows;

Scene_Map.prototype.createAllWindows =
    function() {

    _VNPause_CreateAllWindows.call(this);

    this.createPauseMenuButton();
};

Scene_Map.prototype.createPauseMenuButton =
    function() {

    this._pauseButtonContainer =
        new Sprite();

    this._pauseButtonContainer.x =
        PAUSE_BUTTON_X;

    this._pauseButtonContainer.y =
        PAUSE_BUTTON_Y;

    //==============================================
    // NORMAL
    //==============================================

    const normal =
        new Sprite(
            ImageManager.loadPicture(
                PAUSE_BUTTON_IMAGE
            )
        );

    this._pauseButtonContainer
        .addChild(normal);

    //==============================================
    // HOVER
    //==============================================

    const hover =
        new Sprite(
            ImageManager.loadPicture(
                PAUSE_BUTTON_HOVER
            )
        );

    hover.opacity = 0;

    this._pauseButtonContainer
        .addChild(hover);

    this._pauseHoverSprite =
        hover;

    this.addChild(
        this._pauseButtonContainer
    );
};

//==================================================
// UPDATE
//==================================================

const _VNPause_SceneMap_Update =
    Scene_Map.prototype.update;

Scene_Map.prototype.update =
    function() {

    _VNPause_SceneMap_Update.call(this);

    this.updatePauseMenuButton();
};

Scene_Map.prototype.updatePauseMenuButton =
    function() {

    if (!this._pauseButtonContainer) {
        return;
    }

    //==============================================
    // VISIBILIDADE
    //==============================================

    const enabled =
    $gameSwitches.value(
        PAUSE_BUTTON_SWITCH
    );

    if (enabled) {

    this._pauseButtonContainer.opacity += 20;

    } else {

    this._pauseButtonContainer.opacity -= 20;
    }

    this._pauseButtonContainer.opacity =
    this._pauseButtonContainer.opacity
    .clamp(0, 255);

// Não deixa clicar invisível
    if (
    this._pauseButtonContainer.opacity <= 0
    ) {
    return;
    }

    const sprite =
        this._pauseButtonContainer;

    const width =
        sprite.getBounds().width;

    const height =
        sprite.getBounds().height;

    const hovered =
        TouchInput.x >= sprite.x &&
        TouchInput.x <= sprite.x + width &&
        TouchInput.y >= sprite.y &&
        TouchInput.y <= sprite.y + height;

    this._pauseHoverSprite.opacity =
        hovered ? 255 : 0;

    sprite.scale.x =
        hovered ? 1.03 : 1;

    sprite.scale.y =
        hovered ? 1.03 : 1;

    if (
        hovered &&
        TouchInput.isTriggered()
    ) {

        openCustomPauseMenu();
    }
};
    
})();