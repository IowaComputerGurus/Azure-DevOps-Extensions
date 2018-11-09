import fs = require('fs');
import path = require('path');
import os = require('os');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
var uuidV4 = require('uuid/v4');

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Get inputs.
        let createAsIdempotent = tl.getBoolInput('createAsIdempotent', true);
        let contextProjectDirectory  = tl.getPathInput('contextProjectDirectory ', /*required*/ true, /*check*/ true);
        let startupProjectDirectory  = tl.getPathInput('startupProjectDirectory ', /*required*/ false, /*check*/ true);
        let scriptTargetLocation  = tl.getPathInput('scriptTargetLocation ', /*required*/ true, /*check*/ true);
        
        //Echo Commands
        console.log(tl.loc("EchoInputs", 'contextProjectDirectory', contextProjectDirectory));
        console.log(tl.loc("EchoInputs", 'startupProjectDirectory', startupProjectDirectory));
        console.log(tl.loc("EchoInputs", 'scriptTargetLocation', scriptTargetLocation));
        console.log(tl.loc("EchoInputs", 'createAsIdempotent', createAsIdempotent));


        //Build the script
        console.log(tl.loc('GeneratingScript'));
        var script = 'dotnet ef migrations script -p ' + contextProjectDirectory + ' -o ' + scriptTargetLocation;
        if(startupProjectDirectory != null)
            script = script + ' --startup-project ' + startupProjectDirectory;
        if(createAsIdempotent)
            script = script + ' -i';
        console.log(tl.loc('ScriptText', script));

        // Write the script to disk.
        tl.assertAgent('2.115.0');
        let tempDirectory = tl.getVariable('agent.tempDirectory');
        tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
        let filePath = path.join(tempDirectory, uuidV4() + '.sh');
        await fs.writeFileSync(
            filePath,
            script, // Don't add a BOM. It causes the script to fail on some operating systems (e.g. on Ubuntu 14).
            { encoding: 'utf8' });
        }

        // Create the tool runner.
        let bash = tl.tool(tl.which('bash', true))
            .arg('--noprofile')
            .arg(`--norc`)
            .arg(filePath);
        let options = <tr.IExecOptions>{
            cwd: workingDirectory,
            failOnStdErr: false,
            errStream: process.stdout, // Direct all output to STDOUT, otherwise the output may appear out
            outStream: process.stdout, // of order since Node buffers it's own STDOUT but not STDERR.
            ignoreReturnCode: true
        };

        // Listen for stderr.
        let stderrFailure = false;
        if (failOnStderr) {
            bash.on('stderr', (data) => {
                stderrFailure = true;
            });
        }

        // Run bash.
        let exitCode: number = await bash.exec(options);

        let result = tl.TaskResult.Succeeded;

        // Fail on exit code.
        if (exitCode !== 0) {
            tl.error(tl.loc('JS_ExitCode', exitCode));
            result = tl.TaskResult.Failed;
        }

        // Fail on stderr.
        if (stderrFailure) {
            tl.error(tl.loc('JS_Stderr'));
            result = tl.TaskResult.Failed;
        }

        tl.setResult(result, null, true);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed', true);
    }
}

run();
