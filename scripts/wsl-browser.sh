#!/usr/bin/env bash
# Open a URL in the Windows Chrome browser from inside WSL.
#
# gcloud (and other CLIs) call $BROWSER with the auth URL as $1. Point BROWSER
# at this script so the login page opens in the host browser:
#
#   export BROWSER="$PWD/scripts/wsl-browser.sh"
#   gcloud auth application-default login
#
# The URL is passed straight through; Chrome on Windows can reach the WSL
# localhost redirect that gcloud listens on.
exec "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" "$@"
