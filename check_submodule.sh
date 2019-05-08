#!/bin/bash
### Script will check FairExchange-GUI submodule in gui folder. 
### If you used git clone without --recursive option this is way to go.

PWD=`pwd`
SIZE=`du -sk gui/FairExchange-GUI`

echo "Checking FairExchange-GUI folder."
cd gui/FairExchange-GUI && \
git submodule update --recursive && \
cd ../.. && \
echo "Folder looks fine." || \
echo "Some problem with cloning submodule FairExchange-GUI." 
echo
