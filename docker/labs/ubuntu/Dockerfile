# ==============================================================================
# Online Cyber Lab - Ubuntu 24.04 LTS Hacking Environment
# Non-root user, cgroup-constrained, with core ethical hacking tools
# ==============================================================================

FROM ubuntu:24.04

# Avoid interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential CLI & cybersecurity utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    coreutils \
    iproute2 \
    iputils-ping \
    net-tools \
    netcat-openbsd \
    nmap \
    tcpdump \
    curl \
    wget \
    nano \
    vim-tiny \
    python3 \
    python3-pip \
    gcc \
    make \
    git \
    dnsutils \
    procps \
    ca-certificates \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged hacker user (uid: 1000, gid: 1000)
RUN groupadd -g 1000 hacker && \
    useradd -m -u 1000 -g hacker -s /bin/bash hacker

# Configure restricted sudo (allow only basic commands without password)
RUN echo "hacker ALL=(ALL) NOPASSWD: /usr/bin/nmap, /usr/bin/tcpdump, /usr/bin/apt update" >> /etc/sudoers

# Seed Beginner CTF Challenges
RUN mkdir -p /var/log/challenges && \
    echo "FLAG{permission_read_audit_success_7102}" > /var/log/challenges/secret.txt && \
    chown root:hacker /var/log/challenges/secret.txt && \
    chmod 640 /var/log/challenges/secret.txt

# Seed Hidden File Challenge in user home
RUN echo "FLAG{linux_hidden_files_discovered_4829}" > /home/hacker/.secret_flag.txt && \
    mkdir -p /home/hacker/challenges && \
    echo "Welcome to the Ubuntu Cyber Lab! Try listing hidden files with 'ls -la'." > /home/hacker/README.txt && \
    chown -R hacker:hacker /home/hacker

# Set custom cyber hacker bash prompt
RUN echo 'PS1="\\[\\033[1;32m\\]hacker@ubuntu-lab\\[\\033[0m\\]:\\[\\033[1;34m\\]\\w\\[\\033[0m\\]\\$ "' >> /home/hacker/.bashrc && \
    echo 'export TERM=xterm-256color' >> /home/hacker/.bashrc

USER hacker
WORKDIR /home/hacker

CMD ["/bin/bash"]
