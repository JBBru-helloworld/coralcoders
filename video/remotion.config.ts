import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

// PNG frames keep the encode in limited-range yuv420p (JPEG frames give yuvj420p).
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);

// Remotion's downloaded chrome-headless-shell crashes on start on macOS 26
// (its GPU and utility processes cannot load icudtl.dat), so use the
// installed Google Chrome when there is one.
const systemChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (existsSync(systemChrome)) Config.setBrowserExecutable(systemChrome);
