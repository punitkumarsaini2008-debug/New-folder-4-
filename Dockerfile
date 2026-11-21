FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV TERM=xterm-256color
ENV LANG=C.UTF-8

RUN set -eux; \
    apt-get update -o Acquire::Retries=3; \
    apt-get install -y --no-install-recommends \
        bash \
        coreutils \
        procps \
        psmisc \
        iproute2 \
        net-tools \
        iputils-ping \
        dnsutils \
        curl \
        wget \
        nano \
        vim-tiny \
        git \
        sudo \
        ca-certificates \
        python3 \
        python3-pip \
        tar \
        unzip \
        less \
        file \
        tree \
        nmap \
        tcpdump \
        netcat-openbsd \
        nodejs \
        npm; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    apt-get update -o Acquire::Retries=3; \
    apt-get install -y --no-install-recommends \
        tigervnc-standalone-server \
        novnc \
        websockify \
        openbox \
        xterm; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash -u 1000 parrot

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 3000 4000 6080

CMD ["node", "/app/index.js"]