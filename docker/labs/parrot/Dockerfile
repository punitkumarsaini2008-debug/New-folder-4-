# ==============================================================================
# Online Cyber Lab - Parrot Security OS Hacking Environment
# ==============================================================================

FROM parrotsec/core:latest

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
    traceroute \
    sudo \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 -s /bin/bash hacker

RUN echo "FLAG{linux_hidden_files_discovered_4829}" > /home/hacker/.secret_flag.txt && \
    echo "Welcome to Parrot Security Cyber Lab! Ready for reconnaissance." > /home/hacker/README.txt && \
    chown -R hacker:hacker /home/hacker

RUN echo 'PS1="\\[\\033[1;36m\\]hacker@parrot-lab\\[\\033[0m\\]:\\[\\033[1;32m\\]\\w\\[\\033[0m\\]\\$ "' >> /home/hacker/.bashrc && \
    echo 'export TERM=xterm-256color' >> /home/hacker/.bashrc

USER hacker
WORKDIR /home/hacker

CMD ["/bin/bash"]
