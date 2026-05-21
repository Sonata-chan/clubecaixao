const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests/e2e",
    timeout: 60000,
    expect: {
        timeout: 10000
    },
    use: {
        headless: true,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        baseURL: "http://127.0.0.1:8000",
        launchOptions: {
            args: [
                "--enable-webgl",
                "--ignore-gpu-blocklist",
                "--use-gl=swiftshader",
                "--enable-unsafe-swiftshader",
                "--disable-dev-shm-usage"
            ]
        },
        viewport: {
            width: 816,
            height: 624
        }
    },
    webServer: {
        command: "python3 -m http.server 8000 --bind 127.0.0.1 --directory .",
        url: "http://127.0.0.1:8000/index.html",
        reuseExistingServer: true,
        timeout: 120000
    }
});