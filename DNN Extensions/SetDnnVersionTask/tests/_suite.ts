import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('DNN Module Version Tests', function () {

    before(() => {

    });

    after(() => {

    });

    //Temporarily not able to run
    it.skip('should succeed with warnings if given proper inputs', (done: MochaDone) => {
        this.timeout(1000);
    
        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.warningIssues.length, 2, "should have 1 warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");
        done();
    });

    it('it should fail if the sourceDirectory is missing', (done: MochaDone) => {
        this.timeout(1000);
    
        let tp = path.join(__dirname, 'failure-missing-source.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.equal(tr.errorIssues[0], 'Input required: sourceDirectory', 'Missing Source Directory Input');
        assert.equal(tr.stdout.indexOf('Processing'), -1, "Should not display processing");
    
        done();
    });   

    it('it should fail if the moduleVersion is missing', (done: MochaDone) => {
        this.timeout(1000);
    
        let tp = path.join(__dirname, 'failure-missing-version.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.equal(tr.errorIssues[0], 'Input required: moduleVersion', 'Missing Module Version Input');
        assert.equal(tr.stdout.indexOf('Processing'), -1, "Should not display processing");
    
        done();
    });   

    it('it should fail if the moduleVersion is incorrectly formatted', (done: MochaDone) => {
        this.timeout(1000);
    
        let tp = path.join(__dirname, 'failure-version-invalid.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.warningIssues, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.equal(tr.errorIssues[0], 'Module Version Must be ##.##.## or #.#.#', 'Module version incorrect');
        assert.equal(tr.stdout.indexOf('Processing'), -1, "Should not display processing");
    
        done();
    });   
});