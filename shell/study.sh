#!/usr/bin/env bash

a=3
b=4

if [ ! ${a} -eq ${b} ];
then
    echo "a is not equal to b"
else
    echo "a is equal to b"
fi