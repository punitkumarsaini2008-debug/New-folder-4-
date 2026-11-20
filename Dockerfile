# ==============================================================================
# ParrotCloud OS - Debian/Parrot-inspired Cybersecurity Docker Container
# Provides real Bash terminal execution, isolated sessions, & security tools
# ==============================================================================

FROM debian:bookworm-slim

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TERM=xterm-256color
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Install base system tools, networking, coreutils, and cybersecurity utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
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
    tshark \
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

# Create unprivileged 'parrot' user with safe sudo privileges for lab environments
RUN useradd -m -s /bin/bash -u 1000 parrot && \
    echo "parrot:parrot" | chpasswd && \
    usermod -aG sudo parrot && \
    echo "parrot ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/parrot

# Configure custom Parrot-styled Bash prompt for the user
RUN echo 'export PS1="\[\e[1;36m\]parrot\[\e[0m\]@\[\e[1;32m\]parrotcloud\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\$ "' >> /home/parrot/.bashrc && \
    echo 'alias ll="ls -la --color=auto"' >> /home/parrot/.bashrc && \
    echo 'alias ls="ls --color=auto"' >> /home/parrot/.bashrc && \
    echo 'alias grep="grep --color=auto"' >> /home/parrot/.bashrc

# Set up sample cybersecurity lab files in user's home directory
RUN mkdir -p /home/parrot/Desktop /home/parrot/Documents /home/parrot/Tools /home/parrot/Labs && \
    echo "# Welcome to ParrotCloud OS (Debian 12 Bookworm Core)" > /home/parrot/Desktop/README.txt && \
    echo "This is an authorized, isolated Linux container environment for cybersecurity education." >> /home/parrot/Desktop/README.txt && \
    echo "Installed tools: nmap, nikto, tshark, tcpdump, python3, bash, coreutils." >> /home/parrot/Desktop/README.txt && \
    chown -R parrot:parrot /home/parrot

# Copy application files into container
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev || true
COPY . .

# Expose HTTP web interface, WebSocket terminal port, and noVNC display port
EXPOSE 3000 4000 6080

# Switch to parrot user for runtime execution
USER parrot
WORKDIR /home/parrot

# Launch ParrotCloud OS Gateway and Web Terminal
CMD ["node", "/app/server/index.js"]
