#!/bin/bash
# Script to build gui for Safewallet App

[ -d ${WORKSPACE}/gui/FairExchange-GUI ] && cd ${WORKSPACE}/gui/FairExchange-GUI
[ -d ../gui/FairExchange-GUI ] && cd ../gui/FairExchange-GUI
[ -d gui/FairExchange-GUI ] && cd gui/FairExchange-GUI

echo "Building Safewallet-GUI"
echo "Actual directory is: ${PWD}"

echo "Checkout to master branch."
git checkout master
git pull origin master

[ -d react ] && cd react || echo "!!! I can't find react"
echo "Actual directory is: ${PWD}"
echo "Installing nodejs modules."
npm install 
npm install webpack

echo "Building Safewallet-GUI app."
npm run build 
echo "Safewallet-GUI is built!"
