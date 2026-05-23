/*:
 * @target MZ
 * @author Freef
 * @help Version 1.0.0.
 * Adds custom plugin command for requesting (more) images before they are used.
 *
 * USE WITH CARE:
 * Image downloads will slow down other downloads, such as sounds or music.
 *
 * @plugindesc Preload specified images into local device cache for later use
 * @command preload_images
 * @text Preload Images
 * @desc Preload a comma separated list of bitmaps
 *
 * @arg folderSelect
 * @text Folder
 * @type select
 * @option pictures
 * @option parallaxes
 * @option battlebacks1
 * @option battlebacks2
 * @option characters
 * @option enemies
 * @option faces
 * @option sv_actors
 * @option sv_enemies
 * @option system
 * @option tilesets
 * @option titles1
 * @option titles2
 * @desc Folder under img/ from which to load
 * @default pictures
 *
 * @arg names
 * @text Image Names
 * @type string
 * @default myimage1,myimage2,myimage3
 * @desc Comma separated list of image filenames, no extension. Example: myimg1,myimg2,myimg3
 */

(() => {
    const PLUGIN_NAME = "ImagePreloadFreefMZ";

    PluginManager.registerCommand(PLUGIN_NAME, "preload_images", args => {
        const folder = String(args.folderSelect || "pictures");
        const basePath = "img/" + folder + "/";
        const names = String(args.names || "")
            .split(",")
            .map(name => name.trim())
            .filter(Boolean);

        for (const name of names) {
            ImageManager.loadBitmap(basePath, name, 0, true);
        }
    });
})();
