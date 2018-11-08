import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import fs = require('fs');
	
async function run() {
    try {
		
        let sourceDirectory: string = tl.getInput('sourceDirectory', true);
		let manifestVersion: string = tl.getInput('moduleVersion', true);
		
		//Cleanup our source directory
		sourceDirectory = path.normalize(sourceDirectory);
		
		//Validate manifestVersion
		var versionNumberExpression = new RegExp('[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}$');
		if(!versionNumberExpression.test(manifestVersion))
		{
			tl.setResult(tl.TaskResult.Failed, 'Module Version Must be ##.##.## or #.#.#');
            return;
		}
		
        console.log('Looking in ', sourceDirectory);
        console.log('Setting version ', manifestVersion);
		
		let allPaths: string[] = tl.find(sourceDirectory); // default find options (follow sym links)
		let matchedPaths: string[] = tl.match(allPaths, '**/*.dnn', sourceDirectory); // default match options
		if(matchedPaths.length == 0){
			tl.warning('No DNN manifest files found');
			tl.setResult(tl.TaskResult.SucceededWithIssues, "Job completed but no work found");
			return;
		}

		matchedPaths.forEach((file: string) => {
			fs.readFile(file, "utf8", function(err, data) {

				//Perform replacements
				var updatedData = data.replace('version="xx\.xx\.xx"', 'version="' + manifestVersion + '"');
				updatedData = updatedData.replace('version=\"00\.00\.00\"', 'version="' + manifestVersion + '"');

				//validate that we found it to replace
				if(updatedData == data)
				{
					tl.warning('Unable to find version for replacement in file: ' + file);
				}
				else{
					fs.writeFile(file, updatedData, function(err){
						if(err){
							tl.setResult(tl.TaskResult.Failed, err.message);
							return;
						}
						
						//Notify 
						console.log('    ' + file + ' updated successfully');
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