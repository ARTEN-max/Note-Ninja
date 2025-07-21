#!/bin/bash

OLD_EMAIL="tafadzwachiwazvo@gmail.com"
CORRECT_NAME="Abdul Rahman"
CORRECT_EMAIL="arlnu@uwaterloo.ca"

git filter-branch --env-filter '
if [ "$GIT_COMMITTER_EMAIL" = "'""'" ]
then
    export GIT_COMMITTER_NAME="'""'"
    export GIT_COMMITTER_EMAIL="'""'"
fi
if [ "$GIT_AUTHOR_EMAIL" = "'""'" ]
then
    export GIT_AUTHOR_NAME="'""'"
    export GIT_AUTHOR_EMAIL="'""'"
fi
' --tag-name-filter cat -- --branches --tags
