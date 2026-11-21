# ==============================================================================
# Online Cyber Lab - Linux Mint (Cinnamon Environment) Lab
# ==============================================================================

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    coreutils \
    iproute2 \
    iputils-ping \
    netcat-openbsd \
    nmap \
    curl \
    wget \
    nano \
    python3 \
    gcc \
    git \
    dnsutils \
    procps \
    sudo \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1000 hacker && \
    useradd -m -u 1000 -g hacker -s /bin/bash hacker

RUN echo "FLAG{linux_hidden_files_discovered_4829}" > /home/hacker/.secret_flag.txt && \
    echo "Welcome to Linux Mint Cyber Lab! Cinnamon-styled environment." > /home/hacker/README.txt && \
    chown -R hacker:hacker /home/hacker

RUN echo 'PS1="\[\033[1;32m\]hacker@mint-lab\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ "' >> /home/hacker/.bashrc && \
    echo 'export TERM=xterm-256color' >> /home/hacker/.bashrc

USER hacker
WORKDIR /home/hacker

CMD ["/bin/bash"]
