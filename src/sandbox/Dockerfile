FROM ubuntu:16.04

WORKDIR /root

COPY scripts scripts

RUN bash scripts/setup-os.sh
RUN bash scripts/install-nodejs.sh
RUN bash scripts/install-eslint.sh
RUN bash scripts/install-mongodb.sh
RUN bash scripts/install-nats.sh

CMD ["bash"]