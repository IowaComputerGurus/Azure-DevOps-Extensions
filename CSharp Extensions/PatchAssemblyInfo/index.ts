import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import fs = require('fs');


async function run() {
    try {
		
		tl.setResourcePath(path.join(__dirname, 'task.json'));

        let sourceDirectory: string = tl.getInput('sourceDirectory', true);
		let assemblyVersion: string = tl.getInput('assemblyVersion', true);
		
		//Cleanup our source directory
		sourceDirectory = path.normalize(sourceDirectory);
		
		//Validate manifestVersion
		var versionNumberExpression = new RegExp('^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}(\.[0-9]{1,2}){0,1}$');
		if(!versionNumberExpression.test(assemblyVersion))
		{
			tl.setResult(tl.TaskResult.Failed, tl.loc("InvalidVersion", assemblyVersion));
            return;
		}
		
		//Display progress
		console.log(tl.loc("LookingIn", sourceDirectory));
		console.log(tl.loc("SettingVersion", assemblyVersion));
		
		let allPaths: string[] = tl.find(sourceDirectory); // default find options (follow sym links)
		let matchedFiles: string[] = tl.match(allPaths, '**\\assemblyinfo.cs', sourceDirectory); // default match options
		if(matchedFiles.length == 0){
			tl.setResult(tl.TaskResult.Failed, tl.loc("NoProjectsFound"));
			return;
		}

		var replacementSectionExpression = new RegExp(/\[assembly: AssemblyVersion\(\".*\"\)\]/gi);
		matchedFiles.forEach((file: string) => {
			fs.readFile(file, "utf8", function(err, data) {

				//Perform replacements
				if(!replacementSectionExpression.test(data)){
					tl.warning(tl.loc('UnableToFindVersion', file));
				}
				else{
					var updatedData = data.replace(replacementSectionExpression, '[assembly: AssemblyVersion(\"' + assemblyVersion + '\")]');
							
					fs.writeFile(file, updatedData, function(err){
						if(err){
							tl.setResult(tl.TaskResult.Failed, err.message);
							return;
						}
						
						//Notify 
						console.log(tl.loc("FilePatched", file));
					})
				}
			}); 
		});

		tl.setResult(tl.TaskResult.Succeeded, "success");
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();