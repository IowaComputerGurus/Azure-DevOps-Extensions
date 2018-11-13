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
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            let sourceDirectory = tl.getInput('sourceDirectory', true);
            let assemblyVersion = tl.getInput('assemblyVersion', true);
            //Cleanup our source directory
            sourceDirectory = path.normalize(sourceDirectory);
            //Validate manifestVersion
            var versionNumberExpression = new RegExp('^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}(\.[0-9]{1,2}){0,1}$');
            if (!versionNumberExpression.test(assemblyVersion)) {
                tl.setResult(tl.TaskResult.Failed, tl.loc("InvalidVersion", assemblyVersion));
                return;
            }
            //Display progress
            console.log(tl.loc("LookingIn", sourceDirectory));
            console.log(tl.loc("SettingVersion", assemblyVersion));
            let allPaths = tl.find(sourceDirectory); // default find options (follow sym links)
            let matchedFiles = tl.match(allPaths, '**\\assemblyinfo.cs', sourceDirectory); // default match options
            if (matchedFiles.length == 0) {
                tl.setResult(tl.TaskResult.Failed, tl.loc("NoProjectsFound"));
                return;
            }
            var replacementSectionExpression = new RegExp(/\[assembly: AssemblyVersion\(\".*\"\)\]/gi);
            matchedFiles.forEach((file) => {
                fs.readFile(file, "utf8", function (err, data) {
                    //Perform replacements
                    if (!replacementSectionExpression.test(data)) {
                        tl.warning(tl.loc('UnableToFindVersion', file));
                    }
                    else {
                        var updatedData = data.replace(replacementSectionExpression, '[assembly: AssemblyVersion(\"' + assemblyVersion + '\")]');
                        fs.writeFile(file, updatedData, function (err) {
                            if (err) {
                                tl.setResult(tl.TaskResult.Failed, err.message);
                                return;
                            }
                            //Notify 
                            console.log(tl.loc("FilePatched", file));
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
