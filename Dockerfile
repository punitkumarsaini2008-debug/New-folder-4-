# ==============================================================================
# ParrotCloud OS - Cloud Cybersecurity Desktop Platform Container
# Provides: Real Bash PTY, TigerVNC/Xvfb Graphical Desktop, noVNC, & Cyber Tools
# Compatible with: Render Free Tier (512MB RAM), VPS Docker, & Local Docker
# ==============================================================================

FROM node:20-bookworm-slim

# Prevent interactive configuration prompts during apt installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TERM=xterm-256color
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PORT=10000

# Install verified system tools, networking, coreutils, security tools & X11 display servers
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
    xvfb \
    x11vnc \
    openbox \
    xterm \
    novnc \
    websockify \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged 'parrot' user (uid 1000) with safe sudo privileges
RUN useradd -m -s /bin/bash -u 1000 parrot && \
    echo "parrot:parrot" | chpasswd && \
    usermod -aG sudo parrot && \
    echo "parrot ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/parrot

# Configure custom Parrot-styled Bash prompt and aliases
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

# Set application directory and install Node.js dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure entrypoint script has executable permissions
RUN chmod +x /app/docker/entrypoint.sh

# Render injects PORT=10000 dynamically; expose 10000 and standard 3000
EXPOSE 10000 3000

# Execute entrypoint which starts Xvfb, Openbox, x11vnc, and Node.js server
CMD ["/bin/bash", "/app/docker/entrypoint.sh"]
