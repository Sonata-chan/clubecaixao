/*:
 * @target MZ
 * @plugindesc Harness opcional de automacao para testes end-to-end.
 */

(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const active =
        searchParams.get("testMode") === "1" ||
        searchParams.get("rmmzTest") === "1";

    const harness = {
        active,
        currentTestCase: searchParams.get("testCase") || "",
        ready: false,
        sceneName: "",
        sceneBusy: false,
        stackSize: 0,
        marks: [],
        transitions: [],
        saveCalls: [],
        loadCalls: [],
        failures: [],
        snapshot() {
            return {
                active: this.active,
                currentTestCase: this.currentTestCase,
                ready: this.ready,
                sceneName: this.sceneName,
                sceneBusy: this.sceneBusy,
                stackSize: this.stackSize,
                marks: this.marks.slice(),
                transitions: this.transitions.slice(),
                saveCalls: this.saveCalls.slice(),
                loadCalls: this.loadCalls.slice(),
                failures: this.failures.slice()
            };
        },
        mark(name, data = {}) {
            this.marks.push({
                name,
                data,
                at: Date.now()
            });
        },
        fail(message, data = {}) {
            this.failures.push({
                message,
                data,
                at: Date.now()
            });
        }
    };

    window.__CLUBECAIXAO_TEST__ = harness;
    window.__clubeTest = harness;

    if (!active) {
        return;
    }

    const originalGoto = SceneManager.goto;
    const originalPush = SceneManager.push;
    const originalPop = SceneManager.pop;
    const originalClearStack = SceneManager.clearStack;
    const originalSaveGame = DataManager.saveGame;
    const originalLoadGame = DataManager.loadGame;
    const originalCreatePixiApp = Graphics._createPixiApp;
    const originalCreateEffekseerContext = Graphics._createEffekseerContext;

    SceneManager.goto = function(sceneClass) {
        harness.transitions.push({
            type: "goto",
            sceneName: sceneClass ? sceneClass.name || "" : "",
            at: Date.now()
        });
        return originalGoto.call(this, sceneClass);
    };

    SceneManager.push = function(sceneClass) {
        harness.transitions.push({
            type: "push",
            sceneName: sceneClass ? sceneClass.name || "" : "",
            at: Date.now()
        });
        return originalPush.call(this, sceneClass);
    };

    SceneManager.pop = function() {
        harness.transitions.push({
            type: "pop",
            at: Date.now()
        });
        return originalPop.call(this);
    };

    SceneManager.clearStack = function() {
        harness.transitions.push({
            type: "clearStack",
            at: Date.now()
        });
        return originalClearStack.call(this);
    };

    DataManager.saveGame = async function(savefileId) {
        harness.saveCalls.push({
            savefileId,
            at: Date.now()
        });
        return originalSaveGame.call(this, savefileId);
    };

    DataManager.loadGame = async function(savefileId) {
        harness.loadCalls.push({
            savefileId,
            at: Date.now()
        });
        return originalLoadGame.call(this, savefileId);
    };

    Graphics._createPixiApp = function() {
        try {
            this._setupPixi();
            const renderer = new PIXI.CanvasRenderer({
                view: this._canvas,
                width: this._width,
                height: this._height,
                transparent: false,
                preserveDrawingBuffer: true
            });
            const stage = new PIXI.Container();
            let running = false;
            let rafId = 0;

            this._app = {
                renderer,
                stage,
                ticker: {
                    add() {},
                    remove() {}
                },
                start: () => {
                    if (running) {
                        return;
                    }

                    running = true;

                    const step = () => {
                        if (!running) {
                            return;
                        }

                        this._onTick(1);
                        rafId = requestAnimationFrame(step);
                    };

                    rafId = requestAnimationFrame(step);
                },
                stop: () => {
                    running = false;
                    if (rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = 0;
                    }
                },
                render: () => {
                    renderer.render(stage);
                }
            };
        } catch (error) {
            harness.fail("graphics-app-init", {
                message: error.message
            });
            this._app = null;
        }
    };

    Graphics._createEffekseerContext = function() {
        if (this._app && this._app.renderer && this._app.renderer.gl && window.effekseer) {
            try {
                this._effekseer = effekseer.createContext();
                if (this._effekseer) {
                    this._effekseer.init(this._app.renderer.gl);
                    this._effekseer.setRestorationOfStatesFlag(false);
                }
            } catch (error) {
                harness.fail("graphics-effekseer-init", {
                    message: error.message
                });
                this._effekseer = null;
            }
            return;
        }

        this._effekseer = null;
    };

    harness.mark("graphics-fallback-enabled", {
        originalCreatePixiApp: typeof originalCreatePixiApp === "function",
        originalCreateEffekseerContext: typeof originalCreateEffekseerContext === "function"
    });

    function syncState() {
        const scene = SceneManager._scene;

        harness.sceneName = scene ? scene.constructor.name : "";
        harness.sceneBusy = !!(scene && scene.isBusy && scene.isBusy());
        harness.stackSize = Array.isArray(SceneManager._stack) ? SceneManager._stack.length : 0;

        if (!harness.ready && harness.sceneName === "Scene_Title") {
            harness.ready = true;
            harness.mark("title-ready", {
                stackSize: harness.stackSize
            });
        }

        requestAnimationFrame(syncState);
    }

    requestAnimationFrame(syncState);
})();