import { ApkResolver } from "./apk.resolver";

export const apk_parser = async (file_path: string) => {
  const info = await new ApkResolver().parse(file_path);
  if (!info.package || !info.versionCode) {
    throw Error("Invalid file");
  }

  return info;
};
