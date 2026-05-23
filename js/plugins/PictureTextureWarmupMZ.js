/*:
 * @target MZ
 * @author Copilot
 * @help Version 1.0.0.
 *
 * Preloads picture bitmaps and warms up PIXI/GPU textures before Show Picture,
 * reducing the chance of first-frame blank sprites in web builds.
 *
 * Plugin Commands:
 * 1) warmup_pictures
 *    - Preloads a comma-separated list of pictures and requests texture upload.
 *
 * 2) show_picture_after_warmup
 *    - Waits for picture warmup (optional), then calls Game_Screen.showPicture.
 *
 * @plugindesc Warm up picture textures on GPU before Show Picture
 *
 * @command warmup_pictures
 * @text Warmup Pictures
 * @desc Preload and warmup a comma-separated list of pictures (img/pictures)
 *
 * @arg names
 * @type string
 * @text Picture Names
 * @default picture_a,picture_b
 * @desc Comma-separated picture filenames without extension
 *
 * @command show_picture_after_warmup
 * @text Show Picture After Warmup
 * @desc Warmup one picture and only then execute Show Picture
 *
 * @arg pictureId
 * @type number
 * @min 1
 * @default 1
 *
 * @arg name
 * @type string
 * @default my_picture
 *
 * @arg origin
 * @type select
 * @option Upper Left
 * @value 0
 * @option Center
 * @value 1
 * @default 0
 *
 * @arg x
 * @type number
 * @min -99999
 * @max 99999
 * @default 0
 *
 * @arg y
 * @type number
 * @min -99999
 * @max 99999
 * @default 0
 *
 * @arg scaleX
 * @type number
 * @min 0
 * @max 2000
 * @default 100
 *
 * @arg scaleY
 * @type number
 * @min 0
 * @max 2000
 * @default 100
 *
 * @arg opacity
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @arg blendMode
 * @type select
 * @option Normal
 * @value 0
 * @option Additive
 * @value 1
 * @option Multiply
 * @value 2
 * @option Screen
 * @value 3
 * @default 0
 *
 * @arg waitForWarmup
 * @type boolean
 * @on Wait
 * @off Do Not Wait
 * @default true
 */

(() => {
    const PLUGIN_NAME = "PictureTextureWarmupMZ";
    const warmupCache = new Map();

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === "pictureTextureWarmup") {
            return !!this._pictureTextureWarmupPending;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    function parseNames(csv) {
        return String(csv || "")
            .split(",")
            .map(name => name.trim())
            .filter(Boolean);
    }

    function waitBitmapReady(bitmap) {
        return new Promise(resolve => {
            if (!bitmap) {
                resolve(false);
                return;
            }
            if (bitmap.isReady()) {
                resolve(true);
                return;
            }
            bitmap.addLoadListener(() => resolve(bitmap.isReady()));
        });
    }

    function uploadBaseTexture(baseTexture) {
        return new Promise(resolve => {
            const renderer = Graphics.app && Graphics.app.renderer;
            if (!renderer || !baseTexture) {
                resolve(false);
                return;
            }

            try {
                baseTexture.update();

                const prepare = renderer.plugins && renderer.plugins.prepare;
                if (prepare && prepare.upload) {
                    prepare.upload(baseTexture, () => resolve(true));
                    return;
                }

                if (renderer.texture && renderer.texture.bind) {
                    renderer.texture.bind(baseTexture, 0);
                    resolve(true);
                    return;
                }
            } catch (e) {
                console.warn("PictureTextureWarmupMZ upload error:", e);
            }

            resolve(false);
        });
    }

    async function warmupPicture(name) {
        const key = String(name || "").trim();
        if (!key) {
            return false;
        }

        if (warmupCache.has(key)) {
            return warmupCache.get(key);
        }

        const promise = (async () => {
            const bitmap = ImageManager.loadPicture(key);
            const ready = await waitBitmapReady(bitmap);
            if (!ready) {
                return false;
            }
            return uploadBaseTexture(bitmap.baseTexture);
        })();

        warmupCache.set(key, promise);
        return promise;
    }

    PluginManager.registerCommand(PLUGIN_NAME, "warmup_pictures", args => {
        const names = parseNames(args.names);
        for (const name of names) {
            warmupPicture(name);
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "show_picture_after_warmup", function(args) {
        const pictureId = Number(args.pictureId || 1);
        const name = String(args.name || "").trim();
        const origin = Number(args.origin || 0);
        const x = Number(args.x || 0);
        const y = Number(args.y || 0);
        const scaleX = Number(args.scaleX || 100);
        const scaleY = Number(args.scaleY || 100);
        const opacity = Number(args.opacity || 255);
        const blendMode = Number(args.blendMode || 0);
        const waitForWarmup = String(args.waitForWarmup || "true") === "true";

        const interpreter = this;
        const showPicture = () => {
            $gameScreen.showPicture(
                pictureId,
                name,
                origin,
                x,
                y,
                scaleX,
                scaleY,
                opacity,
                blendMode
            );
        };

        if (waitForWarmup && interpreter && interpreter.setWaitMode) {
            interpreter._pictureTextureWarmupPending = true;
            interpreter.setWaitMode("pictureTextureWarmup");
        }

        warmupPicture(name)
            .catch(e => console.warn("PictureTextureWarmupMZ warmup error:", name, e))
            .finally(() => {
                showPicture();
                if (waitForWarmup && interpreter) {
                    interpreter._pictureTextureWarmupPending = false;
                }
            });
    });
})();
