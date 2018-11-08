"use strict";
//Credit to Microsoft for this code, copied from: https://github.com/Microsoft/azure-pipelines-tasks/blob/master/Tasks/CopyFilesV2/copyfiles.ts
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");
tl.setResourcePath(path.join(__dirname, 'task.json'));
// contents is a multiline input containing glob patterns
let contents = tl.getDelimitedInput('Contents', '\n', true);
let sourceFolder = tl.getPathInput('SourceFolder', true, true);
let targetFolder = tl.getPathInput('TargetFolder', true);
let cleanTargetFolder = tl.getBoolInput('CleanTargetFolder', false);
let overWrite = tl.getBoolInput('OverWrite', false);
let flattenFolders = tl.getBoolInput('flattenFolders', false);
// normalize the source folder path. this is important for later in order to accurately
// determine the relative path of each found file (substring using sourceFolder.length).
sourceFolder = path.normalize(sourceFolder);
console.log(tl.loc('LookingIn', sourceFolder));
let allPaths = tl.find(sourceFolder); // default find options (follow sym links)
let matchedPaths = tl.match(allPaths, contents, sourceFolder); // default match options
let matchedFiles = matchedPaths.filter((itemPath) => !tl.stats(itemPath).isDirectory()); // filter-out directories
// copy the files to the target folder
console.log(tl.loc('FoundNFiles', matchedFiles.length));
console.log(tl.loc('MatchPattern', contents));
if (matchedFiles.length > 0) {
    // clean target folder if required
    if (cleanTargetFolder) {
        console.log(tl.loc('CleaningTargetFolder', targetFolder));
        // stat the targetFolder path
        let targetFolderStats;
        try {
            targetFolderStats = tl.stats(targetFolder);
        }
        catch (err) {
            if (err.code != 'ENOENT') {
                throw err;
            }
        }
        if (targetFolderStats) {
            if (targetFolderStats.isDirectory()) {
                // delete the child items
                fs.readdirSync(targetFolder)
                    .forEach((item) => {
                    let itemPath = path.join(targetFolder, item);
                    tl.rmRF(itemPath);
                });
            }
            else {
                // targetFolder is not a directory. delete it.
                tl.rmRF(targetFolder);
            }
        }
    }
    // make sure the target folder exists
    tl.mkdirP(targetFolder);
    try {
        let createdFolders = {};
        matchedFiles.forEach((file) => {
            let relativePath;
            if (flattenFolders) {
                relativePath = path.basename(file);
            }
            else {
                relativePath = file.substring(sourceFolder.length);
                // trim leading path separator
                // note, assumes normalized above
                if (relativePath.startsWith(path.sep)) {
                    relativePath = relativePath.substr(1);
                }
            }
            let targetPath = path.join(targetFolder, relativePath);
            let targetDir = path.dirname(targetPath);
            if (!createdFolders[targetDir]) {
                tl.mkdirP(targetDir);
                createdFolders[targetDir] = true;
            }
            // stat the target
            let targetStats;
            if (!cleanTargetFolder) { // optimization - no need to check if relative target exists when CleanTargetFolder=true
                try {
                    targetStats = tl.stats(targetPath);
                }
                catch (err) {
                    if (err.code != 'ENOENT') {
                        throw err;
                    }
                }
            }
            // validate the target is not a directory
            if (targetStats && targetStats.isDirectory()) {
                throw new Error(tl.loc('TargetIsDir', file, targetPath));
            }
            if (!overWrite) {
                if (targetStats) { // exists, skip
                    console.log(tl.loc('FileAlreadyExistAt', file, targetPath));
                }
                else { // copy
                    console.log(tl.loc('CopyingTo', file, targetPath));
                    tl.cp(file, targetPath);
                }
            }
            else {
                console.log(tl.loc('CopyingTo', file, targetPath));
                if (process.platform == 'win32' && targetStats && (targetStats.mode & 146) != 146) {
                    // The readonly attribute can be interpreted by performing a bitwise-AND operation on
                    // "fs.Stats.mode" and the integer 146. The integer 146 represents "-w--w--w-" or (128 + 16 + 2),
                    // see following chart:
                    //     R   W  X  R  W X R W X
                    //   256 128 64 32 16 8 4 2 1
                    //
                    // "fs.Stats.mode" on Windows is based on whether the readonly attribute is set.
                    // If the readonly attribute is set, then the mode is set to "r--r--r--".
                    // If the readonly attribute is not set, then the mode is set to "rw-rw-rw-".
                    //
                    // Note, additional bits may also be set (e.g. if directory). Therefore, a bitwise
                    // comparison is appropriate.
                    //
                    // For additional information, refer to the fs source code and ctrl+f "st_mode":
                    //   https://github.com/nodejs/node/blob/v5.x/deps/uv/src/win/fs.c#L1064
                    tl.debug(`removing readonly attribute on '${targetPath}'`);
                    fs.chmodSync(targetPath, targetStats.mode | 146);
                }
                tl.cp(file, targetPath, "-f");
            }
        });
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}
else {
    //Failure if we don't have anything
    tl.setResult(tl.TaskResult.Failed, tl.loc("NoFilesFound"));
}
