# .NET Core Pipeline Tasks by IowaComputerGurus, Inc.
This collection of tasks includes helpful Azure DevOps pipeline utilities that will assist with CI/CD when working with .NET Core applications of all types, including ASP.NET Core.

## Included Tasks

* [Set Assembly Version](#set-assembly-version)
* [Script EF Core Migrations](#script-ef-core-migrations)

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


## Script EF Core Migrations

This task will automatically call dotnet ef to create a migration script for you and prepare the script in the Build Artifacts Staging directory.  Additional options exist to support muliple project types.

### Options

This task was designed to be as flexible as possible for the caller but limiting the need for setup project-to-project.  

Setting | Purpose | Required | Default
--- | --- | --- | --- | ---
DB Context Project Directory | The directory path to your project containing the DBContext | Yes | (Not Set)
Startup Project Directory | Optional directory to use for startup, helpful for complex projects with settings in a different project | No | (Not Set)
Script Target Location | Where the generated script will be placed, and what it is named | Yes | $(build.artifactstagingdirectory)\Migrations\script.sql
Create as Idempotent Script | If this is set to true the script will be created as idempotent, or re-runnable | No | True
Patch Generated Script for Index Bug | If creating an idempotent script this applies a fix for Bug #12911 where indexes break the scripts ability to re-run | No | True

### Publishing of Artifacts

Don't forget to add a Publish Artifacts or other task to store the artifact after generated.

