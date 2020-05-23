pushd $PSScriptRoot
code .\pennywize-client &
code .\PennywizeServer &

if ($args.Length -gt 0 -And $args[0] -eq '-t')
{
    code .\PennywizeServer.Test &
}

popd