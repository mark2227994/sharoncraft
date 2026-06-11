$ErrorActionPreference = "Stop"
Set-Location "C:\Users\USER\Desktop\projects\bead VN2"
& "C:\Program Files\nodejs\npm.cmd" run dev -- --port 3004 *> "product-refactor-dev.log"
