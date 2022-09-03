const fs = require("fs");
const path = require("path");
var electron_notarize = require("electron-notarize");

module.exports = async function (params) {
  if (process.platform !== "darwin") {
    console.log(`skipping notarizing becuase operating system ${process.platform} is not macOS`);
    return;
  }

  console.log("afterSign hook triggered", params);

  let appId = "edu.rutgers.tischfieldlab.moseq-reports";

  let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    console.log(`skipping notarizing ${appPath} because it does not exist...`);
    return;
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PSWD_MOSEQ_REPORTS,
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};
