#!/bin/bash

# Helper script to Build, Install and Launch the Android App

# Pre-flight checks
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$PATH"

if ! command -v javac &> /dev/null; then
    echo "[-] Error: Java Compiler (javac) not found."
    echo "    Please verify JAVA_HOME is set correctly: $JAVA_HOME"
    exit 1
fi

# Check for Windows path in local.properties
if [ -f "local.properties" ] && grep -q "C:" local.properties; then
    echo "[-] Warning: local.properties seems to contain a Windows path."
    echo "    Please update sdk.dir to your Linux Android SDK path."
fi

# Try to add adb to PATH if not found
if ! command -v adb &> /dev/null; then
    if [ -d "$HOME/Android/Sdk/platform-tools" ]; then
        export PATH="$PATH:$HOME/Android/Sdk/platform-tools"
    fi
fi

echo "[*] Building and Installing..."

# Build and Install
# Using installDebug task
if ./gradlew installDebug; then
    echo "[+] Build Successful"
else
    echo "[-] Build Failed"
    exit 1
fi

# Launch and Log
# Only allow launch if adb is available
if command -v adb &> /dev/null; then
    echo "[+] Launching App..."
    adb shell am start -n com.example.portoflio_android.debug/com.example.portoflio_android.MainActivity
    
    echo "[*] Showing Logs (Ctrl+C to stop)..."
    adb logcat -c || true
    adb logcat | grep -E "com.example.portoflio_android|OkHttp"
else
    echo "[-] adb not found. Cannot launch app automatically."
    echo "    Ensure Android SDK platform-tools are installed and in PATH."
fi
