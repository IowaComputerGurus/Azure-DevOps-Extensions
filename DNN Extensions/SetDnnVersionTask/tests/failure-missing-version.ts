import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let samplePath = path.join(__dirname, 'sampleFolder');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('sourceDirectory', samplePath);
tmr.setInput('moduleVersion', '');

tmr.run();