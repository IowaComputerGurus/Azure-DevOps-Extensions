# C# Pipeline Tasks by IowaComputerGurus, Inc.
This collection of tasks includes helpful Azure DevOps pipeline utilities that will assist with CI/CD when working with C# applications of all types, including ASP.NET.

## Included Tasks

* [Patch Assembly Info Task](#patch-assembly-info)

## Patch Assembly Info Task

This task was created to recursively search the source directory and identify all assemblyinfo.cs files included as part of source tree and to update the Version Number as provided by the build environment.

This task only requires that the project contain a default declaration for AssemblyVersion included in the solution, the specifically set version does not matter.

_This task should be used before compilation to ensure that .NET Core will include your version number in the compiled assemblies._

### Errors & Warnings

Condition | Result | Detail
--- | --- | ---
Unable to find at least 1 AssemblyInfo.cs | Error | The task assumes that by including it at least 1 file should be patched.
Unable to update AssemblyVersion | Warning | This notifies that it was able to find an AssemblyInfo.cs file, but could not patch it.
Unable to write file | Error | It is possible for an error to exist if the process was unable to update the file, very rare unless parallel processing enabled.
