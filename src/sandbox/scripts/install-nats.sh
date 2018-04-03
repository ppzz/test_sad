NATS_VERSION=1.0.4

wget https://github.com/nats-io/gnatsd/releases/download/v${NATS_VERSION}/gnatsd-v${NATS_VERSION}-linux-amd64.zip
unzip -p gnatsd-v${NATS_VERSION}-linux-amd64.zip gnatsd-v${NATS_VERSION}-linux-amd64/gnatsd > gnatsd
chmod +x gnatsd
mv gnatsd /bin