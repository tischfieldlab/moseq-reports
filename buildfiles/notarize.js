import fs from 'fs';
import path from 'path';
import {notarize} from '@electron/notarize';

export default async function(params) {
    if (process.platform !== 'darwin') {
        console.log(`skipping notarizing becuase operating system ${process.platform} is not macOS`)
        return;
    }

    console.log('afterSign hook triggered', params);

    let appId = 'edu.rutgers.tischfieldlab.moseq-reports'

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    if (!fs.existsSync(appPath)) {
        console.log(`skipping notarizing ${appPath} because it does not exist...`);
        return;
    }

    console.log(`Notarizing ${appId} found at ${appPath}`);

    try {
        await notarize({
            appBundleId: appId,
            appPath: appPath,
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_ID_PSWD_MOSEQ_REPORTS,
            teamId: process.env.APPLE_TEAM_ID,
        });
    } catch (error) {
        console.error(error);
    }

    console.log(`Done notarizing ${appId}`);
};