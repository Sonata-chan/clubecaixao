/*:
 * @target MZ
 * @plugindesc Sistema Save/Load VN Visual Custom
 *
 * @param saveBackground
 * @text Fundo
 * @type file
 * @dir img/pictures/
 * @default save_bg
 *
 * @param slotImage
 * @text Imagem do Slot
 * @type file
 * @dir img/pictures/
 * @default save_slot
 *
 * @param slotHoverImage
 * @text Imagem Hover do Slot
 * @type file
 * @dir img/pictures/
 * @default save_slot_hover
 *
 * @param closeButtonImage
 * @text Botão Fechar
 * @type file
 * @dir img/pictures/
 * @default save_close
 *
 * @param closeButtonHoverImage
 * @text Hover Botão Fechar
 * @type file
 * @dir img/pictures/
 * @default save_close_hover
 * 
 * @param nextButtonImage
 * @text Próxima Página
 * @type file
 * @dir img/pictures/
 * @default save_next
 *
 * @param prevButtonImage
 * @text Página Anterior
 * @type file
 * @dir img/pictures/
 * @default save_prev
 *
 * @param fontFace
 * @text Fonte
 * @type string
 * @default rmmz-mainfont
 *
 * @param fontSize
 * @text Tamanho da Fonte
 * @type number
 * @default 24
 *
 * @param dayVariableId
 * @text Variável do Dia
 * @type variable
 * @default 1
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

    const SAVE_BG =
        String(params.saveBackground);

    const SLOT_IMAGE =
        String(params.slotImage);

    const SLOT_HOVER =
        String(params.slotHoverImage);

    const CLOSE_IMAGE =
        String(params.closeButtonImage);

    const CLOSE_HOVER_IMAGE =
        String(params.closeButtonHoverImage);

    const NEXT_IMAGE =
        String(params.nextButtonImage);

    const PREV_IMAGE =
        String(params.prevButtonImage);

    const FONT_FACE =
        String(params.fontFace);

    const FONT_SIZE =
        Number(params.fontSize);

    const DAY_VARIABLE_ID =
        Number(params.dayVariableId);
    
    //==================================================
    // CONFIG
    //==================================================

    const MAX_PAGES = 3;
    const SLOTS_PER_PAGE = 4;

    const SLOT_WIDTH = 340;
    const SLOT_HEIGHT = 200;

    //==================================================
    // SCREENSHOT
    //==================================================

    function makeScreenshotData() {

        if (!window.vnPauseScreenshot) {
            return null;
        }

        return window.vnPauseScreenshot
            .canvas
            .toDataURL("image/jpeg", 0.6);
    }

    //==================================================
    // SAVE INFO
    //==================================================

    const _makeSavefileInfo =
        DataManager.makeSavefileInfo;

    DataManager.makeSavefileInfo =
        function() {

        const info =
            _makeSavefileInfo.call(this);

        info.vnDay =
            $gameVariables.value(
                DAY_VARIABLE_ID
            );

        info.vnScreenshot =
            makeScreenshotData();

        return info;
    };


    //==================================================
    // OPEN ORIGIN
    //==================================================

    window._vnFileOpenOrigin = null;
    window._vnPendingRestore = null;

    function returnToOriginScene() {

        if (SceneManager._stack.length > 0) {
            SceneManager.pop();
            return;
        }

        if (window._vnFileOpenOrigin === "pause") {
            SceneManager.goto(Scene_Map);
        } else {
            SceneManager.goto(Scene_Title);
        }
    }

    function reloadMapIfUpdated() {

        if ($gameSystem.versionId() !== $dataSystem.versionId) {

            const mapId =
                $gameMap.mapId();

            const x =
                $gamePlayer.x;

            const y =
                $gamePlayer.y;

            const d =
                $gamePlayer.direction();

            $gamePlayer.reserveTransfer(
                mapId,
                x,
                y,
                d,
                0
            );

            $gamePlayer.requestMapReload();
        }
    }

    function findMessageWaitingInterpreter(
        interpreter,
        expectedEventId = null
    ) {

        if (!interpreter) {
            return null;
        }

        let fallback = null;

        const visit = current => {

            if (!current) {
                return null;
            }

            if (current._waitMode === "message") {

                if (
                    expectedEventId == null ||
                    current._eventId === expectedEventId
                ) {
                    return current;
                }

                fallback = fallback || current;
            }

            return visit(current._childInterpreter);
        };

        return visit(interpreter) || fallback;
    }

    function captureChoiceRestoreState() {

        if (!$gameMessage || !$gameMessage.isChoice()) {
            return null;
        }

        const interpreter =
            findMessageWaitingInterpreter(
                $gameMap && $gameMap._interpreter
            );

        if (!interpreter) {
            return { valid: false };
        }

        return {
            valid: true,
            mapId: $gameMap ? $gameMap.mapId() : 0,
            eventId: interpreter._eventId || 0,
            indent: interpreter._indent
        };
    }

    function captureMessageRestoreState() {

        if (!$gameMessage || !$gameMessage.isBusy()) {
            return null;
        }

        return {
            texts: ($gameMessage._texts || []).slice(),
            speakerName: $gameMessage.speakerName(),
            faceName: $gameMessage.faceName(),
            faceIndex: $gameMessage.faceIndex(),
            background: $gameMessage.background(),
            positionType: $gameMessage.positionType(),
            choices: ($gameMessage.choices() || []).slice(),
            choiceDefaultType: $gameMessage.choiceDefaultType(),
            choiceCancelType: $gameMessage.choiceCancelType(),
            choiceBackground: $gameMessage.choiceBackground(),
            choicePositionType: $gameMessage.choicePositionType(),
            numInputVariableId: $gameMessage.numInputVariableId(),
            numInputMaxDigits: $gameMessage.numInputMaxDigits(),
            itemChoiceVariableId: $gameMessage.itemChoiceVariableId(),
            itemChoiceItypeId: $gameMessage.itemChoiceItypeId(),
            scrollMode: $gameMessage.scrollMode(),
            scrollSpeed: $gameMessage.scrollSpeed(),
            scrollNoFast: $gameMessage.scrollNoFast()
        };
    }

    function restoreMessageState(state) {

        if (!$gameMessage || !state) {
            return;
        }

        $gameMessage.clear();

        const texts = state.texts || [];
        for (const text of texts) {
            $gameMessage.add(text);
        }

        $gameMessage.setSpeakerName(state.speakerName || "");
        $gameMessage.setFaceImage(state.faceName || "", Number(state.faceIndex || 0));
        $gameMessage.setBackground(Number(state.background || 0));
        $gameMessage.setPositionType(Number(state.positionType || 2));

        const choices = state.choices || [];
        if (choices.length > 0) {
            // Prevent ChoiceShuffle from re-randomising restored options.
            const choiceShuffle =
                window.CAE &&
                window.CAE.ChoiceShuffle &&
                typeof window.CAE.ChoiceShuffle.setShuffle === "function"
                    ? window.CAE.ChoiceShuffle
                    : null;

            const prevShuffle =
                choiceShuffle ? !!choiceShuffle.shuffle : null;

            if (choiceShuffle) {
                choiceShuffle.setShuffle(false);
            }

            $gameMessage.setChoices(
                choices,
                Number(state.choiceDefaultType ?? 0),
                Number(state.choiceCancelType ?? 0)
            );

            if (choiceShuffle) {
                choiceShuffle.setShuffle(prevShuffle);
            }
            $gameMessage.setChoiceBackground(Number(state.choiceBackground || 0));
            $gameMessage.setChoicePositionType(Number(state.choicePositionType || 2));
        }

        if (Number(state.numInputVariableId || 0) > 0) {
            $gameMessage.setNumberInput(
                Number(state.numInputVariableId),
                Number(state.numInputMaxDigits || 1)
            );
        }

        if (Number(state.itemChoiceVariableId || 0) > 0) {
            $gameMessage.setItemChoice(
                Number(state.itemChoiceVariableId),
                Number(state.itemChoiceItypeId || 1)
            );
        }

        if (state.scrollMode) {
            $gameMessage.setScroll(
                Number(state.scrollSpeed || 2),
                !!state.scrollNoFast
            );
        }

        return true;
    }

    function buildChoiceBranchMap(interpreter, indent, displayedChoices) {

        if (!interpreter || !interpreter._list || !Array.isArray(displayedChoices)) {
            return null;
        }

        const original = [];
        for (let i = interpreter._index; i < interpreter._list.length; i++) {

            const cmd = interpreter._list[i];
            if (!cmd) {
                break;
            }

            if (cmd.indent < indent) {
                break;
            }

            if (cmd.code === 404 && cmd.indent === indent) {
                break;
            }

            if (cmd.code === 402 && cmd.indent === indent) {
                original.push({
                    index: Number(cmd.parameters && cmd.parameters[0]),
                    text: String((cmd.parameters && cmd.parameters[1]) || "")
                });
            }
        }

        if (!original.length) {
            return null;
        }

        const used = new Set();
        const map = displayedChoices.map((choiceText, displayedIndex) => {

            const text = String(choiceText || "");

            let pick = original.findIndex(entry =>
                !used.has(entry.index) && entry.text === text
            );

            if (pick < 0) {
                pick = original.findIndex(entry =>
                    !used.has(entry.index)
                );
            }

            if (pick < 0) {
                return displayedIndex;
            }

            used.add(original[pick].index);
            return original[pick].index;
        });

        return map;
    }

    function restoreChoiceCallback(state) {

        if (!$gameMessage || !$gameMessage.isChoice()) {
            return false;
        }

        if (typeof $gameMessage._choiceCallback === "function") {
            return true;
        }

        if (!state || state.valid === false) {
            return false;
        }

        if (
            state.mapId &&
            $gameMap &&
            $gameMap.mapId() !== state.mapId
        ) {
            return false;
        }

        const interpreter =
            findMessageWaitingInterpreter(
                $gameMap && $gameMap._interpreter,
                state.eventId
            );

        if (!interpreter) {
            return false;
        }

        const indent =
            Number.isFinite(state.indent)
                ? state.indent
                : interpreter._indent;

        const branchMap =
            buildChoiceBranchMap(
                interpreter,
                indent,
                $gameMessage.choices()
            );

        interpreter.setWaitMode("message");

        $gameMessage.setChoiceCallback(n => {
            if (branchMap && branchMap[n] != null) {
                interpreter._branch[indent] = branchMap[n];
            } else {
                interpreter._branch[indent] = n;
            }
        });

        return true;
    }

    function applyPendingRestoreIfPossible() {

        const pending = window._vnPendingRestore;
        if (!pending) {
            return;
        }

        if (pending.message && !pending.messageApplied) {
            restoreMessageState(pending.message);
            pending.messageApplied = true;
        }

        const done = !pending.choice || restoreChoiceCallback(pending.choice);

        if (done) {
            window._vnPendingRestore = null;
        }
    }

    const _VN_DataManager_makeSaveContents =
        DataManager.makeSaveContents;

    DataManager.makeSaveContents = function() {

        const contents =
            _VN_DataManager_makeSaveContents.call(this);

        const choiceState =
            captureChoiceRestoreState();

        const messageState =
            captureMessageRestoreState();

        if (choiceState) {
            contents._vnChoiceRestore = choiceState;
        }

        if (messageState) {
            contents._vnMessageRestore = messageState;
        }

        return contents;
    };

    const _VN_DataManager_extractSaveContents =
        DataManager.extractSaveContents;

    DataManager.extractSaveContents =
        function(contents) {

        _VN_DataManager_extractSaveContents.call(
            this,
            contents
        );

        const restorePayload = {
            message: contents && contents._vnMessageRestore,
            choice: contents && contents._vnChoiceRestore,
            messageApplied: false
        };

        window._vnPendingRestore = restorePayload;
    };

    const _VN_Scene_Map_start =
        Scene_Map.prototype.start;

    Scene_Map.prototype.start = function() {

        _VN_Scene_Map_start.call(this);

        applyPendingRestoreIfPossible();
    };

    const _VN_Scene_Map_update =
        Scene_Map.prototype.update;

    Scene_Map.prototype.update = function() {

        applyPendingRestoreIfPossible();

        _VN_Scene_Map_update.call(this);
    };

    
    //==================================================
    // BASE
    //==================================================

    class Scene_VNFile
        extends Scene_Base {

        create() {

            super.create();

            this._page = 0;

            this.createBackground();
            this.createTitle();
            this.createSlots();
            this.createBottomUI();
            this.createCloseButton();
        }

        start() {

            super.start();

            window._vnInputBlockTimer = 10;

            TouchInput.clear();
            Input.clear();
        }

        //==============================================
        // BACKGROUND
        //==============================================

        createBackground() {

            this._background =
                new Sprite(
                    ImageManager.loadPicture(
                        SAVE_BG
                    )
                );

            this.addChild(
                this._background
            );
        }

        //==============================================
        // TITLE
        //==============================================

        createTitle() {

            const bitmap =
                new Bitmap(1000, 80);

            bitmap.fontFace =
                FONT_FACE;

            bitmap.fontSize =
                FONT_SIZE + 8;

            bitmap.drawText(
                this.sceneTitle(),
                0,
                0,
                1000,
                80,
                "center"
            );

            this._title =
                new Sprite(bitmap);

            this._title.x =
                (Graphics.boxWidth / 2)
                - 500;

            this._title.y = 18;

            this.addChild(
                this._title
            );
        }

        //==============================================
        // SLOTS
        //==============================================

        createSlots() {

            this._slots = [];

            const startX = 58;
            const startY = 95;

            const spacingX = 360;
            const spacingY = 210;

            for (
                let i = 0;
                i < SLOTS_PER_PAGE;
                i++
            ) {

                const column =
                    i % 2;

                const row =
                    Math.floor(i / 2);

                const x =
                    startX +
                    (column * spacingX);

                const y =
                    startY +
                    (row * spacingY);

                const slotId =
                    (this._page * 4)
                    + i + 1;

                this.createSlot(
                    slotId,
                    x,
                    y
                );
            }
        }

        refreshSlots() {

            for (const slot of this._slots) {

                this.removeChild(slot);
            }

            this._slots = [];

            this.createSlots();

            this.refreshPageText();
        }

        //==============================================
        // SLOT
        //==============================================

        createSlot(slotId, x, y) {

            const container =
                new Sprite();

            container.x = x;
            container.y = y;

            //==========================================
            // BG
            //==========================================

            const bg =
                new Sprite(
                    ImageManager.loadPicture(
                        SLOT_IMAGE
                    )
                );

            container.addChild(bg);

            //==========================================
            // HOVER
            //==========================================

            const hover =
                new Sprite(
                    ImageManager.loadPicture(
                        SLOT_HOVER
                    )
                );

            hover.opacity = 0;

            container.addChild(
                hover
            );

            //==========================================
            // SCREENSHOT
            //==========================================

            const screenshot =
                new Sprite();

            screenshot.x = 18;
            screenshot.y = 46;

            container.addChild(
                screenshot
            );

            const info =
                DataManager.savefileInfo(
                    slotId
                );

            if (
                info &&
                info.vnScreenshot
            ) {

                const bmp =
                    Bitmap.load(
                        info.vnScreenshot
                    );

                bmp.addLoadListener(() => {

                    screenshot.bitmap =
                        new Bitmap(
                            190,
                            108
                        );

                    screenshot.bitmap.blt(
                        bmp,
                        0,
                        0,
                        bmp.width,
                        bmp.height,
                        0,
                        0,
                        190,
                        108
                    );
                });
            }

            //==========================================
            // TEXT
            //==========================================

            const textBitmap =
                new Bitmap(200, 160);

            textBitmap.fontFace =
                FONT_FACE;

            textBitmap.fontSize =
                FONT_SIZE;

            if (info) {

                textBitmap.drawText(
                    "Save " + slotId,
                    0,
                    0,
                    200,
                    40,
                    "left"
                );

                textBitmap.drawText(
                    "Dia "
                    + (info.vnDay || 1),
                    0,
                    52,
                    200,
                    40,
                    "left"
                );

                textBitmap.drawText(
                    info.playtime,
                    0,
                    104,
                    200,
                    40,
                    "left"
                );

            } else {

                textBitmap.drawText(
                    "Slot vazio",
                    0,
                    52,
                    200,
                    40,
                    "left"
                );
            }

            const text =
                new Sprite(textBitmap);

            text.x = 220;
            text.y = 34;

            container.addChild(text);

            //==========================================
            // UPDATE
            //==========================================

            container.update = () => {

                const mx =
                    TouchInput.x;

                const my =
                    TouchInput.y;

                const hovered =
                    mx >= container.x &&
                    mx <= container.x + SLOT_WIDTH &&
                    my >= container.y &&
                    my <= container.y + SLOT_HEIGHT;

                hover.opacity =
                    hovered ? 255 : 0;

                container.scale.x =
                    hovered ? 1.01 : 1;

                container.scale.y =
                    hovered ? 1.01 : 1;

                if (
                    hovered &&
                    TouchInput.isTriggered()
                ) {

                    this.onSlotClick(
                        slotId
                    );
                }
            };

            this.addChild(container);

            this._slots.push(container);
        }

        //==============================================
        // BOTTOM UI
        //==============================================

        createBottomUI() {

            const bitmap =
                new Bitmap(240, 60);

            bitmap.fontFace =
                FONT_FACE;

            bitmap.fontSize =
                FONT_SIZE;

            this._pageBitmap =
                bitmap;

            this._pageText =
                new Sprite(bitmap);

            this._pageText.x =
                (Graphics.boxWidth / 2)
                - 120;

            this._pageText.y =
                Graphics.boxHeight - 68;

            this.addChild(
                this._pageText
            );

            //==========================================
            // PREV
            //==========================================

            this._prevButton =
                new Sprite(
                    ImageManager.loadPicture(
                        PREV_IMAGE
                    )
                );

            this._prevButton.x =
                (Graphics.boxWidth / 2)
                - 170;

            this._prevButton.y =
                Graphics.boxHeight - 72;

            this.addChild(
                this._prevButton
            );

            //==========================================
            // NEXT
            //==========================================

            this._nextButton =
                new Sprite(
                    ImageManager.loadPicture(
                        NEXT_IMAGE
                    )
                );

            this._nextButton.x =
                (Graphics.boxWidth / 2)
                + 122;

            this._nextButton.y =
                Graphics.boxHeight - 72;

            this.addChild(
                this._nextButton
            );

            this.refreshPageText();
        }

        refreshPageText() {

            this._pageBitmap.clear();

            this._pageBitmap.drawText(
                "Página "
                + (this._page + 1)
                + " / "
                + MAX_PAGES,
                0,
                0,
                240,
                60,
                "center"
            );
        }

        //==============================================
        // CLOSE BUTTON
        //==============================================

        createCloseButton() {

    //==========================================
    // NORMAL
    //==========================================

    this._closeButton =
        new Sprite(
            ImageManager.loadPicture(
                CLOSE_IMAGE
            )
        );

    this._closeButton.x =
        Graphics.boxWidth - 72;

    this._closeButton.y = 18;

    this.addChild(
        this._closeButton
    );

    //==========================================
    // HOVER
    //==========================================

    this._closeButtonHover =
        new Sprite(
            ImageManager.loadPicture(
                CLOSE_HOVER_IMAGE
            )
        );

    this._closeButtonHover.x =
        this._closeButton.x;

    this._closeButtonHover.y =
        this._closeButton.y;

    this._closeButtonHover.opacity = 0;

    this.addChild(
        this._closeButtonHover
    );
}

        //==============================================
        // UPDATE
        //==============================================

        update() {

            super.update();

            this.updateButtons();
        }

        //==============================================
        // BUTTONS
        //==============================================

        updateButtons() {

            this.updateCloseButton();

            this.updateButton(
                this._nextButton,
                () => {

                    this._page++;

                    if (
                        this._page >=
                        MAX_PAGES
                    ) {

                        this._page = 0;
                    }

                    this.refreshSlots();
                }
            );

            this.updateButton(
                this._prevButton,
                () => {

                    this._page--;

                    if (
                        this._page < 0
                    ) {

                        this._page =
                            MAX_PAGES - 1;
                    }

                    this.refreshSlots();
                }
            );
        }

        updateButton(sprite, callback) {

            const hovered =
                TouchInput.x >= sprite.x &&
                TouchInput.x <=
                sprite.x + sprite.width &&
                TouchInput.y >= sprite.y &&
                TouchInput.y <=
                sprite.y + sprite.height;

            sprite.scale.x =
                hovered ? 1.05 : 1;

            sprite.scale.y =
                hovered ? 1.05 : 1;

            if (
                hovered &&
                TouchInput.isTriggered()
            ) {

                callback();
            }
        }

        updateCloseButton() {

    const sprite =
        this._closeButton;

    const hover =
        this._closeButtonHover;

    const hovered =
        TouchInput.x >= sprite.x &&
        TouchInput.x <=
        sprite.x + sprite.width &&
        TouchInput.y >= sprite.y &&
        TouchInput.y <=
        sprite.y + sprite.height;

    //==========================================
    // HOVER
    //==========================================

    hover.opacity =
        hovered ? 255 : 0;

    //==========================================
    // SCALE
    //==========================================

    sprite.scale.x =
        hovered ? 1.05 : 1;

    sprite.scale.y =
        hovered ? 1.05 : 1;

    hover.scale.x =
        sprite.scale.x;

    hover.scale.y =
        sprite.scale.y;

    //==========================================
    // CLICK
    //==========================================

        if (
        hovered &&
        TouchInput.isTriggered()
        ) {

        TouchInput.clear();
        Input.clear();

        sprite.visible = false;
        hover.visible = false;

        Graphics.app.render();

        this.onClose();
    }
    
    }
    }

    //==================================================
    // SAVE
    //==================================================

class Scene_VNSave
    extends Scene_VNFile {

    sceneTitle() {

        return "Onde deseja salvar?";
    }

    onClose() {

        TouchInput.clear();
        Input.clear();

        returnToOriginScene();
    }

    onSlotClick(slotId) {

        const choiceState =
            captureChoiceRestoreState();

        if (choiceState && choiceState.valid === false) {

            SoundManager.playBuzzer();

            return;
        }

        $gameSystem.setSavefileId(slotId);
        $gameSystem.onBeforeSave();

        DataManager.saveGame(slotId)
        .then(() => {

        SoundManager.playSave();

        returnToOriginScene();
        })
        .catch(() => {

        SoundManager.playBuzzer();
        });
    }
}

//==================================================
// LOAD
//==================================================

class Scene_VNLoad
    extends Scene_VNFile {

    sceneTitle() {

        return "Qual save deseja carregar?";
    }

    onClose() {

        TouchInput.clear();
        Input.clear();

        returnToOriginScene();
    }

    onSlotClick(slotId) {

        if (
            !DataManager.savefileExists(slotId)
        ) {
            return;
        }

        SoundManager.playLoad();

        window._vnFileOpenOrigin = null;

        TouchInput.clear();
        Input.clear();

        DataManager.loadGame(slotId)
        .then(() => {

            $gameSystem.onAfterLoad();

            reloadMapIfUpdated();

            // Evita restos de Scene_Title/Scene_CustomPause na pilha.
            SceneManager.clearStack();

            SceneManager.goto(Scene_Map);
        })
        .catch(() => {

            SoundManager.playBuzzer();
        });
    }
}

    //==================================================
    // GLOBAL
    //==================================================

    self.openVNSave = function() {

    if (!window._vnPauseMenuActive) {

        SoundManager.playBuzzer();

        return;
    }

    window._vnFileOpenOrigin = "pause";

    SceneManager.push(Scene_VNSave);
    };

    self.openVNLoad = function(fromTitle = false) {

    window._vnFileOpenOrigin =
        fromTitle
            ? "title"
            : (window._vnPauseMenuActive
                ? "pause"
                : "title");

    SceneManager.push(Scene_VNLoad);
    };


    
})();