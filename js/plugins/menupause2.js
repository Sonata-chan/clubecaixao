/*:
 * @target MZ
 * @plugindesc Menu de Pause VN Custom
 *
 * @param pauseBackground
 * @text Fundo do Menu
 * @type file
 * @dir img/pictures/
 * @default pause_bg
 *
 * @param buttonImage
 * @text Fundo dos Botões
 * @type file
 * @dir img/pictures/
 * @default pause_button
 *
 * @param buttonHoverImage
 * @text Hover dos Botões
 * @type file
 * @dir img/pictures/
 * @default pause_button_hover
 *
 * @param fontFace
 * @text Fonte
 * @type string
 * @default rmmz-mainfont
 *
 * @param fontSize
 * @text Tamanho da Fonte
 * @type number
 * @default 28
 *
 * @param buttonSpacing
 * @text Distância Entre Botões
 * @type number
 * @default 18
 *
 * @param pauseText
 * @text Texto de Pause
 * @type string
 * @default PAUSADO
 */

(() => {

    //==================================================
    // PARAMS
    //==================================================

    const pluginName =
        document.currentScript.src
        .match(/([^\/]+)\.js$/)[1];

    const params =
        PluginManager.parameters(pluginName);

    const BG_IMAGE =
        String(params.pauseBackground);

    const BUTTON_IMAGE =
        String(params.buttonImage);

    const BUTTON_HOVER =
        String(params.buttonHoverImage);

    const FONT_FACE =
        String(params.fontFace);

    const FONT_SIZE =
        Number(params.fontSize);

    const BUTTON_SPACING =
        Number(params.buttonSpacing);

    const PAUSE_TEXT =
        String(params.pauseText);

    //==================================================
    // SCREENSHOT STORAGE
    //==================================================

    window.vnPauseScreenshot = null;

    //==================================================
    // OPEN MENU
    //==================================================

    window.openCustomPauseMenu =
        function() {

        // CAPTURA A TELA REAL DO JOGO
        // ANTES DO MENU ABRIR
        window.vnPauseScreenshot =
            SceneManager.snap();

        SceneManager.push(
            Scene_CustomPause
        );
    };

    //==================================================
    // SCENE
    //==================================================

    class Scene_CustomPause
        extends Scene_MenuBase {

        create() {

            super.create();

            this.createBackground();
            this.createPauseText();
            this.createButtons();

            // ESCONDE TEXTO/JANELAS
            this.hideMapWindows();
        }

        //==============================================
        // ESCONDE JANELAS
        //==============================================

        hideMapWindows() {

            if (
                SceneManager._scene &&
                SceneManager._scene._messageWindow
            ) {

                SceneManager._scene
                    ._messageWindow
                    .opacity = 0;

                SceneManager._scene
                    ._messageWindow
                    .contentsOpacity = 0;
            }

            if ($gameScreen) {

                $gameScreen
                    .picture(20);

                const pic =
                    $gameScreen.picture(20);

                if (pic) {

                    pic._opacity = 0;
                }
            }
        }

        //==============================================
        // BACKGROUND
        //==============================================

        createBackground() {

            this._background =
                new Sprite(
                    ImageManager.loadPicture(
                        BG_IMAGE
                    )
                );

            this.addChild(
                this._background
            );
        }

        //==============================================
        // PAUSE TEXT
        //==============================================

        createPauseText() {

            const bitmap =
                new Bitmap(600, 80);

            bitmap.fontFace =
                FONT_FACE;

            bitmap.fontSize =
                FONT_SIZE + 8;

            bitmap.drawText(
                PAUSE_TEXT,
                0,
                0,
                600,
                80,
                "center"
            );

            const sprite =
                new Sprite(bitmap);

            sprite.x =
                (Graphics.boxWidth / 2)
                - 300;

            sprite.y = 70;

            this.addChild(sprite);
        }

        //==============================================
        // BUTTONS
        //==============================================

        createButtons() {

            this._buttons = [];

            const commands = [
                {
                    text: "Salvar",
                    action: () => {

                        openVNSave();
                    }
                },
                {
                    text: "Carregar",
                    action: () => {

                        openVNLoad();
                    }
                },
                {
                    text: "Sair",
                    action: () => {

                        SceneManager.goto(
                            Scene_Title
                        );
                    }
                },
                {
                    text: "Voltar",
                    action: () => {

                        SceneManager.pop();
                    }
                }
            ];

            const startY = 180;

            for (
                let i = 0;
                i < commands.length;
                i++
            ) {

                this.createButton(
                    commands[i],
                    i,
                    startY
                );
            }
        }

        createButton(
            command,
            index,
            startY
        ) {

            const container =
                new Sprite();

            const bg =
                new Sprite(
                    ImageManager.loadPicture(
                        BUTTON_IMAGE
                    )
                );

            container.addChild(bg);

            const hover =
                new Sprite(
                    ImageManager.loadPicture(
                        BUTTON_HOVER
                    )
                );

            hover.opacity = 0;

            container.addChild(
                hover
            );

            const textBitmap =
                new Bitmap(400, 80);

            textBitmap.fontFace =
                FONT_FACE;

            textBitmap.fontSize =
                FONT_SIZE;

            textBitmap.drawText(
                command.text,
                0,
                0,
                400,
                80,
                "center"
            );

            const text =
                new Sprite(textBitmap);

            text.x = 0;
            text.y = 0;

            container.addChild(text);

            container.x =
                (Graphics.boxWidth / 2)
                - 200;

            container.y =
                startY +
                (index * (
                    80 +
                    BUTTON_SPACING
                ));

            container.update = () => {

                const mx =
                    TouchInput.x;

                const my =
                    TouchInput.y;

                const hovered =
                    mx >= container.x &&
                    mx <= container.x + 400 &&
                    my >= container.y &&
                    my <= container.y + 80;

                hover.opacity =
                    hovered ? 255 : 0;

                container.scale.x =
                    hovered ? 1.02 : 1;

                container.scale.y =
                    hovered ? 1.02 : 1;

                if (
                    hovered &&
                    TouchInput.isTriggered()
                ) {

                    SoundManager.playOk();

                    command.action();
                }
            };

            this.addChild(container);

            this._buttons.push(container);
        }

        //==============================================
        // UPDATE
        //==============================================

        update() {

            super.update();

            if (
                Input.isTriggered("cancel")
            ) {

                SceneManager.pop();
            }
        }
    }

})();