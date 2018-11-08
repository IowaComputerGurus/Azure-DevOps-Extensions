# DNN Pipeline Tasks by IowaComputerGurus, Inc.
This collection of tasks includes helpful Azure DevOps pipeline utilities that will assist with CI/CD for DNN Extension Development.  Below we will describe the available tasks.

## Set DNN Module Version

This task was created to recursively search a directory and identify all .dnn manifest files.  For each found monifest file it will look for a version number definition and will update.  It must find the version number in one of the following formats.

* xx.xx.xx
* 00.00.00

This allows you to explicitly set versions on modules that need to not be updated.

### Warnings Only

This task was implemented with a desire to only warn, not stop build, if a replacement token was not found.  Therefore, if no dnn manifests are found, or if no replacements are found, it simply warns.

### Future Changes

Future releases of this task might include an "expected count" of files or otherwise that would allow a failure to be identified.