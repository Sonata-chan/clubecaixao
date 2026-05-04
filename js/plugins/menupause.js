/*:
 * @target MZ
 *
 * @param textboxPictureId
 * @text ID da Picture da Caixa de Texto
 * @type number
 * @default 20
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
 * @default 34
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

    const TEXTBOX_PICTURE_ID =
        Number(params.textboxPictureId || 20);

    const MENU_BACKGROUND =
        String(params.menuBackground || "pause_bg");

    const BUTTON_BACKGROUND =
        String(params.buttonBackground || "btn_bg");

    const FONT_SIZE =
        Number(params.fontSize || 34);

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
        this.hideVNText();
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
    // ESCONDER TEXTO
    //==================================================

    Scene_CustomPause.prototype.hideVNText =
        function() {

        const scene =
            SceneManager._previousScene;

        if (scene && scene._messageWindow) {

            scene._messageWindow.contentsOpacity = 0;

            if (
                scene._messageWindow._nameBoxWindow
            ) {

                scene._messageWindow
                    ._nameBoxWindow
                    .contentsOpacity = 0;
            }
        }

        const picture =
            $gameScreen.picture(
                TEXTBOX_PICTURE_ID
            );

        if (picture) {

            picture._pauseOpacityBackup =
                picture.opacity();

            picture._opacity = 0;
        }
    };

    //==================================================
    // RESTAURAR TEXTO
    //==================================================

    Scene_CustomPause.prototype.restoreVNText =
        function() {

        const scene =
            SceneManager._previousScene;

        if (scene && scene._messageWindow) {

            scene._messageWindow.contentsOpacity = 255;

            if (
                scene._messageWindow._nameBoxWindow
            ) {

                scene._messageWindow
                    ._nameBoxWindow
                    .contentsOpacity = 255;
            }
        }

        const picture =
            $gameScreen.picture(
                TEXTBOX_PICTURE_ID
            );

        if (
            picture &&
            picture._pauseOpacityBackup !== undefined
        ) {

            picture._opacity =
                picture._pauseOpacityBackup;
        }
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

        openVNSave();
    };

    //==================================================
    // LOAD
    //==================================================

    Scene_CustomPause.prototype.commandLoad =
        function() {

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

        this.restoreVNText();

        $gameScreen.clearPictures();

        $gamePlayer.reserveTransfer(
            TITLE_MAP_ID,
            TITLE_MAP_X,
            TITLE_MAP_Y,
            2,
            0
        );

        SceneManager.goto(Scene_Map);
    };

    //==================================================
    // RESUME
    //==================================================

    Scene_CustomPause.prototype.commandResume =
        function() {

        this.restoreVNText();

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

})();