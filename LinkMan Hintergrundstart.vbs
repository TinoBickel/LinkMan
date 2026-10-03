Option Explicit

Dim fileSystem, shell, projectDirectory, serverScript, nodeExecutable, command
Set fileSystem = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

projectDirectory = fileSystem.GetParentFolderName(WScript.ScriptFullName)
serverScript = fileSystem.BuildPath(projectDirectory, "server.js")
nodeExecutable = "node.exe"
If WScript.Arguments.Count > 0 Then
    nodeExecutable = WScript.Arguments(0)
End If
command = Chr(34) & nodeExecutable & Chr(34) & " " & Chr(34) & serverScript & Chr(34)

shell.Run command, 0, False
