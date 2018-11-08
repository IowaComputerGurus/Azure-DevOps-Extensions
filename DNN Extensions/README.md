# DNN Pipeline Tasks by IowaComputerGurus, Inc.
This collection of tasks includes helpful Azure DevOps pipeline utilities that will assist with CI/CD for DNN Extension Development.  Below we will describe the available tasks.

## Included Tasks

* [Set DNN Module Version](#set-dnn-module-version)
* [Copy DNN Extension Artifacts](#copy-dnn-extension-artifacts)

## Set DNN Module Version

This task was created to recursively search a directory and identify all .dnn manifest files.  For each found monifest file it will look for a version number definition and will update.  It must find the version number in one of the following formats.

* xx.xx.xx
* 00.00.00

This allows you to explicitly set versions on modules that need to not be updated.

### Warnings Only

This task was implemented with a desire to only warn, not stop build, if a replacement token was not found.  Therefore, if no dnn manifests are found, or if no replacements are found, it simply warns.

### Future Changes

Future releases of this task might include an "expected count" of files or otherwise that would allow a failure to be identified.

## Copy DNN Extension Artifacts

This task was created as an extension of the default Windows Azure "Copy Files" task to help find DNN Extension Installation packages and move them to the Build Artifact Staging Directory.  

The goal of this task was to ensure that files were copied, as we expect to have files to copy.  As such, the key difference between this task and the default Copy Files task is that it will fail if no files are found.  Out of the box this task is usable with one of the extension package pattern types, but can also work for others with minor changes.

### Settings & Defaults 

The settings are the same as the Microsoft provided items, and retain the help links,  
* Source Directory: Repository Root
* Contents: **\packages\*_install.zip (This translates to all files in folders called packages with a suffix of _install.zip.  You might need to adjust if your build places the files in a different location.)
* Target Directory: $(build.artifactstagingdirectory)
* Clean Target Folder: True
* Overwrite: False
* Flatten Folders: True (This places all extensions in the root of the folder, regardless of source directory)

