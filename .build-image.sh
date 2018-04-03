#!/usr/bin/env bash


buildImage(){
  SERVICE_DIR=$1

--  SERVICE_DIR="$(cd $(dirname $SERVICE_DIR); pwd)/$(basename $SERVICE_DIR)"
  SERVICE_DIR="$(cd $(dirname $SERVICE_DIR); pwd)"
  PACKAGE_JSON_PATH="$SERVICE_DIR/package.json"
  SERVICE_NAME=$(grep '"name":' $PACKAGE_JSON_PATH | cut -d\" -f4)

  VERSION=$(grep '"version":' $PACKAGE_JSON_PATH | cut -d\" -f4)

  IMAGE_NAME="penng/$SERVICE_NAME:$VERSION"

  echo $SERVICE_NAME
  echo $VERSION
  echo $IMAGE_NAME
  docker build -t $IMAGE_NAME .

  if docker build -t $IMAGE_NAME .
  then
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    docker push $IMAGE_NAME
  fi
}

cd src/services

for dir in ./*
do
    if test -d $dir
    then
        cd $dir

        if [ -f package.json ]
        then
            buildImage $dir
        fi

        cd ..
    fi
done

cd ../..
