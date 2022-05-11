import openAboutWindow from "about-window";
import packageJson from "../../../../package.json";
import path from "path";

export default function showAboutWindow() {
    const isDevelopment = process.env.NODE_ENV !== "production";
    // uses https://github.com/rhysd/electron-about-window
    openAboutWindow({
        icon_path: path.join(
            path.dirname(__dirname),
            "..",
            "src",
            "renderer",
            "public",
            "img",
            "mouse.png"
        ),
        copyright: `© 2019-${new Date().getFullYear()} Jay A. Tischfield Lab`,
        homepage: packageJson.homepage,
        bug_report_url: packageJson.bugs.url,
        description: packageJson.description,
        product_name: packageJson.name,
        license: packageJson.license,
        use_version_info: true,
        open_devtools: isDevelopment,
        adjust_window_size: false,
        win_options: {
            resizable: false,
            minimizable: false,
        },
    });
}
