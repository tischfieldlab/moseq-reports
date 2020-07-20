import openAboutWindow from 'about-window';
import path from 'path';
declare const __static: any;

export default function showAboutWindow() {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const packageJsonDir = isDevelopment ? path.dirname(__static) : __static;
    // uses https://github.com/rhysd/electron-about-window
    openAboutWindow({
        icon_path: path.join(__static, 'img', 'mouse.png'),
        package_json_dir: packageJsonDir,
        copyright: `© 2019-${new Date().getFullYear()} Jay A. Tischfield Lab`,
        open_devtools: isDevelopment,
    });
}
