"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const path = require("path");
const fs = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sourceDirectory = tl.getInput('sourceDirectory', true);
            let manifestVersion = tl.getInput('moduleVersion', true);
            //Cleanup our source directory
            sourceDirectory = path.normalize(sourceDirectory);
            //Validate manifestVersion
            var versionNumberExpression = new RegExp('[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}$');
            if (!versionNumberExpression.test(manifestVersion)) {
                tl.setResult(tl.TaskResult.Failed, 'Module Version Must be ##.##.## or #.#.#');
                return;
            }
            console.log('Looking in ', sourceDirectory);
            console.log('Setting version ', manifestVersion);
            let allPaths = tl.find(sourceDirectory); // default find options (follow sym links)
            let matchedPaths = tl.match(allPaths, '**/*.dnn', sourceDirectory); // default match options
            if (matchedPaths.length == 0) {
                tl.warning('No DNN manifest files found');
                tl.setResult(tl.TaskResult.SucceededWithIssues, "Job completed but no work found");
                return;
            }
            matchedPaths.forEach((file) => {
                fs.readFile(file, "utf8", function (err, data) {
                    //Perform replacements
                    var updatedData = data.replace('version="xx\.xx\.xx"', 'version="' + manifestVersion + '"');
                    updatedData = updatedData.replace('version=\"00\.00\.00\"', 'version="' + manifestVersion + '"');
                    //validate that we found it to replace
                    if (updatedData == data) {
                        tl.warning('Unable to find version for replacement in file: ' + file);
                    }
                    else {
                        fs.writeFile(file, updatedData, function (err) {
                            if (err) {
                                tl.setResult(tl.TaskResult.Failed, err.message);
                                return;
                            }
                            //Notify 
                            console.log('    ' + file + ' updated successfully');
                        });
                    }
                });
            });
            tl.setResult(tl.TaskResult.Succeeded, "success");
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
