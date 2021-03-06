#!/bin/sh

cd src/services

for file in ./*
do
    if test -d $file
    then
        cd $file

        if [ -f package.json ]
        then
            npm install
        fi

        cd ..
    fi
done

cd ../..
