/*
 * @Author: Francis Akpan
 * @Date: 2023-03-23
 * @Description:
 */

import { chmodSync, accessSync, existsSync, constants } from "fs";
import { resolve } from "path";
import { promisify } from "util";
import { execFile } from "child_process";

export class ApkResolver {
  private bin_path: string;
  private buffersize: number = 1024 * 1000 * 2;
  private exec = promisify(execFile);

  constructor() {
    this.bin_path = resolve(".bin", process.arch, process.platform, "aapt");

    if (process.platform === "win32") this.bin_path = `${this.bin_path}.exe`;
    else chmodSync(this.bin_path, "755"); //Assign read, write and exec permission to the aapt file path.

    accessSync(this.bin_path, constants.F_OK);
  }

  private async aapt(args: any) {
    return await this.exec(this.bin_path, args, {
      maxBuffer: this.buffersize,
    });
  }

  private aapt_dump(file_path: string) {
    return this.aapt(["d", "badging", file_path]);
  }

  async parse(file_path: string) {
    if (!existsSync(file_path)) {
      throw new Error(`File does not exist: ${file_path}`);
    }

    const { stderr, stdout } = await this.aapt_dump(file_path);
    if (stderr) {
      throw new Error(`Failed to parse file: ${stderr}`);
    }

    const match = stdout.match(
      /name='([^']+)'[\s]*versionCode='(\d+)'[\s]*versionName='([^']+)/
    );

    const seed_match = stdout.match(
      /application: label='([^']+)'[\s]*icon='([^']+)/
    );

    return {
      name: seed_match?.at(1),
      package: match?.at(1),
      versionCode: match?.at(2),
      version: match?.at(3),
    } as ApplicationInfo;
  }
}
