"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const ttm = __importStar(require("azure-pipelines-task-lib/mock-test"));
describe('Set .NET Core Assembly Tests', function () {
    before(() => {
    });
    after(() => {
    });
    //Temporarily not able to run
    it.skip('should succeed with warnings if given proper inputs', (done) => {
        this.timeout(1000);
        let tp = path.join(__dirname, 'success.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.warningIssues.length, 2, "should have 1 warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");
        done();
    });
    it('it should fail if the sourceDirectory is missing', (done) => {
        this.timeout(1000);
        let tp = path.join(__dirname, 'failure-missing-source.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.equal(tr.errorIssues[0], 'Input required: sourceDirectory', 'Missing Source Directory Input');
        assert.equal(tr.stdout.indexOf('Processing'), -1, "Should not display processing");
        done();
    });
    it('it should fail if the assemblyVersion is missing', (done) => {
        this.timeout(1000);
        let tp = path.join(__dirname, 'failure-missing-version.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.equal(tr.errorIssues[0], 'Input required: assemblyVersion', 'Missing Assembly Version # Input');
        assert.equal(tr.stdout.indexOf('Processing'), -1, "Should not display processing");
        done();
    });
    it('it should fail if the assemblyVersion is incorrectly formatted', (done) => {
        this.timeout(1000);
        let tp = path.join(__dirname, 'failure-version-invalid.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.equal(tr.errorIssues[0], 'loc_mock_InvalidVersion testing', 'Module version incorrect');
        assert.equal(tr.stdout.indexOf('Processing'), -1, "Should not display processing");
        done();
    });
});
