[CmdletBinding()]
param()

Trace-VstsEnteringInvocation $MyInvocation
try {
    Import-VstsLocStrings "$PSScriptRoot\task.json"

    # Get inputs.
    $input_createAsIdempotent = Get-VstsInput -Name 'createAsIdempotent' -AsBool -Require
    $input_contextProjectDirectory = Get-VstsInput -Name 'contextProjectDirectory' -Require
    $input_scriptTargetLocation = Get-VstsInput -Name 'scriptTargetLocation' -Require
    $input_startupProjectDirectory = Get-VstsInput -Name 'startupProjectDirectory'
    $input_patchForIdempotentIndexBug = Get-VstsInput -Name 'patchForIdempotentIndexBug' -Require

    #Verify that items needed are directories
    Assert-VstsPath -LiteralPath $input_contextProjectDirectory -PathType 'Container'

    if($input_startupProjectDirectory){
        Assert-VstsPath -LiteralPath $input_startupProjectDirectory -PathType 'Container'
    }

    #Write out items
    Write-Host -Message (Get-VstsLocString -Key 'EchoInputs' -ArgumentList 'contextProjectDirectory', $input_contextProjectDirectory)
    Write-Host -Message (Get-VstsLocString -Key 'EchoInputs' -ArgumentList 'scriptTargetLocation', $input_scriptTargetLocation)
    Write-Host -Message (Get-VstsLocString -Key 'EchoInputs' -ArgumentList 'startupProjectDirectory', $input_startupProjectDirectory)
    Write-Host -Message (Get-VstsLocString -Key 'EchoInputs' -ArgumentList 'createAsIdempotent', $input_createAsIdempotent)

    # Generate the script contents.
    Write-Host (Get-VstsLocString -Key 'GeneratingScript')
    $contents = "dotnet ef migrations script -p " + $input_contextProjectDirectory + " -o " + $input_scriptTargetLocation;
        if($input_startupProjectDirectory){
            $contents = $contents + " --startup-project " + $input_startupProjectDirectory;
        }
        if($input_createAsIdempotent){
            $contents = $contents + " -i"
        }

    #Echo out script
    Write-Host (Get-VstsLocString -Key 'ScriptContents')
    Write-Host $contents

    # Prepend @echo off instead of using the /Q command line switch. When /Q is used, echo can't be turned on.
    $contents = "@echo off`r`n$contents"

    # Write the script to disk.
    Assert-VstsAgent -Minimum '2.115.0'
    $tempDirectory = Get-VstsTaskVariable -Name 'agent.tempDirectory' -Require
    Assert-VstsPath -LiteralPath $tempDirectory -PathType 'Container'
    $filePath = [System.IO.Path]::Combine($tempDirectory, "$([System.Guid]::NewGuid()).cmd")
    $null = [System.IO.File]::WriteAllText(
        $filePath,
        $contents.ToString(),
        ([System.Console]::OutputEncoding))

    # Prepare the external command values.
    $cmdPath = $env:ComSpec
    Assert-VstsPath -LiteralPath $cmdPath -PathType Leaf
    # Command line switches:
    # /D     Disable execution of AutoRun commands from registry.
    # /E:ON  Enable command extensions. Note, command extensions are enabled
    #        by default, unless disabled via registry.
    # /V:OFF Disable delayed environment expansion. Note, delayed environment
    #        expansion is disabled by default, unless enabled via registry.
    # /S     Will cause first and last quote after /C to be stripped.
    #
    # Note, use CALL otherwise if a script ends with "goto :eof" the errorlevel
    # will not bubble as the exit code of cmd.exe.
    $arguments = "/D /E:ON /V:OFF /S /C `"CALL `"$filePath`"`""
    $splat = @{
        'FileName' = $cmdPath
        'Arguments' = $arguments
        #'WorkingDirectory' = $input_workingDirectory
    }

    # Switch to "Continue".
    $global:ErrorActionPreference = 'Continue'
    $failed = $false

    # Run the script.
    Invoke-VstsTool @splat
     

    # Fail on $LASTEXITCODE
    if (!(Test-Path -LiteralPath 'variable:\LASTEXITCODE')) {
        $failed = $true
        Write-Verbose "Unable to determine exit code"
        Write-VstsTaskError -Message (Get-VstsLocString -Key 'PS_UnableToDetermineExitCode')
    } else {
        if ($LASTEXITCODE -ne 0) {
            $failed = $true
            Write-VstsTaskError -Message (Get-VstsLocString -Key 'PS_ExitCode' -ArgumentList $LASTEXITCODE)
        }
    }

    # Fail if any errors.
    if ($failed) {
        Write-VstsSetResult -Result 'Failed' -Message "Error detected" -DoNotThrow
    }
    
    if($input_createAsIdempotent -and $input_patchForIdempotentIndexBug)
    {
        <#

        Replace all 
        CREATE UNIQUE INDEX [...]
        with 
        EXEC('CREATE UNIQUE INDEX [...]')
        in script.sql

        #>
        Write-Host (Get-VstsLocString -Key 'PatchingIdempotent')
        $regexA = '\s*(CREATE UNIQUE INDEX.+)'
        $encoding = New-Object System.Text.UTF8Encoding
        $invocation = (Get-Variable MyInvocation).Value
        Get-ChildItem  $input_scriptTargetLocation | % {
        $c = (Get-Content $_.FullName) -replace $regexA,'EXEC(''$0'')' -join "`r`n"
        [IO.File]::WriteAllText($input_scriptTargetLocation, $c, $encoding)
        }
        Write-Host ("Fix Applied for Bug #12911")
    }
}
finally {
    Trace-VstsLeavingInvocation $MyInvocation
}