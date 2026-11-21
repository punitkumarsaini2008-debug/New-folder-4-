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
RUN apt-get update -o Acquire::Retries=3 && apt-get install -y --no-install-recommends \
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
    tcpdump \
    socat \
    netcat-openbsd \
    xvfb \
    x11vnc \
    openbox \
    xterm \
    novnc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# The official node:20 base image includes a pre-existing 'node' user (UID 1000).
# Remove 'node' user and group first so UID/GID 1000 is cleanly assigned to 'parrot' without exit code 4:
RUN (userdel -r node 2>/dev/null || true) && \
    (groupdel node 2>/dev/null || true) && \
    useradd -m -s /bin/bash -u 1000 -U parrot && \
    echo "parrot:parrot" | chpasswd && \
    usermod -aG sudo parrot && \
    echo "parrot ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/parrot && \
    chmod 0440 /etc/sudoers.d/parrot

# Configure custom Parrot-styled Bash prompt and aliases
RUN echo 'export PS1="\[\e[1;36m\]parrot\[\e[0m\]@\[\e[1;32m\]parrotcloud\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\$ "' >> /home/parrot/.bashrc && \
    echo 'alias ll="ls -la --color=auto"' >> /home/parrot/.bashrc && \
    echo 'alias ls="ls --color=auto"' >> /home/parrot/.bashrc && \
    echo 'alias grep="grep --color=auto"' >> /home/parrot/.bashrc

# Set up sample cybersecurity lab files in user's home directory
RUN mkdir -p /home/parrot/Desktop /home/parrot/Documents /home/parrot/Tools /home/parrot/Labs /tmp/.X11-unix && \
    chmod 1777 /tmp/.X11-unix && \
    echo "# Welcome to ParrotCloud OS (Debian 12 Bookworm Core)" > /home/parrot/Desktop/README.txt && \
    echo "This is an authorized, isolated Linux container environment for cybersecurity education." >> /home/parrot/Desktop/README.txt && \
    echo "Installed tools: nmap, tcpdump, socat, netcat, python3, bash, coreutils." >> /home/parrot/Desktop/README.txt && \
    chown -R parrot:parrot /home/parrot

# Set application directory and install Node.js dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure line endings are Unix LF and entrypoint is executable
RUN sed -i 's/\r$//' /app/docker/entrypoint.sh && chmod +x /app/docker/entrypoint.sh

# Render injects PORT=10000 dynamically; expose 10000 and standard 3000
EXPOSE 10000 3000

# Execute entrypoint which starts Xvfb, Openbox, x11vnc, and Node.js server
CMD ["/bin/bash", "/app/docker/entrypoint.sh"]
