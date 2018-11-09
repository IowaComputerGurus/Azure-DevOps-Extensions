# .NET Core Pipeline Tasks by IowaComputerGurus, Inc.
This collection of tasks includes helpful Azure DevOps pipeline utilities that will assist with CI/CD when working with .NET Core applications of all types, including ASP.NET Core.

## Included Tasks

* [Set Assembly Version](#set-assembly-version)

## Set Assembly Version

This task was created to recursively search the source directory and identify all .csproj files included as part of .NET Core applications and to update the Version Number as provided by the build environment.

Once all .csproj files have been identified the task will look for a default 0.0.0 version declaration, as follows, and will update it with the proper version number and resave the file

~~~ xml
   <PropertyGroup>
    <Version>0.0.0</Version>
  </PropertyGroup>
~~~

This task should be used before compilation to ensure that .NET Core will include your version number in the compiled assemblies.

### Failure Conditions

This task assumes that at least one .csproj file exists inside the source tree.  If no .csproj files are located the task will fail.

### Warning Conditions

This task assumes that it will be able to replace the version number on all assemblies.  If it is unable to replace the version number, a warning will be logged, but the task will succeed.


