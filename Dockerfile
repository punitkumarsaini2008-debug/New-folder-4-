FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV TERM=xterm-256color
ENV LANG=C.UTF-8

# Update package lists and install system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    bash \
    coreutils \
    procps \
    psmisc \
    iproute2 \
    net-tools \
    iputils-ping \
    dnsutils \
    traceroute \
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
    nikto \
    tcpdump \
    socat \
    netcat-openbsd \
    nodejs \
    npm \
    tigervnc-standalone-server \
    novnc \
    websockify \
    openbox \
    xterm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create user
RUN useradd -m -s /bin/bash -u 1000 parrot && \
    echo "parrot:parrot" | chpasswd && \
    usermod -aG sudo parrot && \
    echo "parrot ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/parrot && \
    chmod 0440 /etc/sudoers.d/parrot

# Configure terminal
RUN echo 'export PS1="\[\e[1;36m\]parrot\[\e[0m\]@\[\e[1;32m\]parrotcloud\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\$ "' >> /home/parrot/.bashrc && \
    mkdir -p /home/parrot/Desktop /home/parrot/Documents /home/parrot/Tools /home/parrot/Labs && \
    chown -R parrot:parrot /home/parrot

WORKDIR /app

COPY package*.json ./

RUN if [ -f package.json ]; then npm install --omit=dev; fi

COPY . .

EXPOSE 3000 4000 6080

USER parrot

CMD ["node", "/app/index.js"]