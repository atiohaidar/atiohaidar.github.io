# Helper script to Build, Install and Launch the Android App
Write-Host "[*] Building and Installing..." -ForegroundColor Yellow

# Build and Install
./gradlew installDebug

# Check if build succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] Launching App..." -ForegroundColor Green
    adb shell am start -n com.example.portoflio_android.debug/com.example.portoflio_android.MainActivity
    
    Write-Host "[*] Showing Logs (Ctrl+C to stop)..." -ForegroundColor Cyan
    # Clear old logs
    adb logcat -c
    # Stream logs filtered by package name or OkHttp (API logs)
    adb logcat | Select-String "com.example.portoflio_android", "OkHttp"
} else {
    Write-Host "[-] Build Failed" -ForegroundColor Red
}
