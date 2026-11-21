# ==============================================================================
# Online Cyber Lab - Fedora Security Lab Environment
# ==============================================================================

FROM fedora:40

RUN dnf -y update && dnf -y install \
    bash \
    coreutils \
    iproute \
    iputils \
    nc \
    nmap \
    curl \
    wget \
    nano \
    python3 \
    gcc \
    git \
    bind-utils \
    procps-ng \
    sudo \
    && dnf clean all

RUN groupadd -g 1000 hacker && \
    useradd -m -u 1000 -g hacker -s /bin/bash hacker

RUN echo "FLAG{linux_hidden_files_discovered_4829}" > /home/hacker/.secret_flag.txt && \
    echo "Welcome to Fedora Security Lab! Powered by Fedora 40 (RPM ecosystem)." > /home/hacker/README.txt && \
    chown -R hacker:hacker /home/hacker

RUN echo 'PS1="\[\033[1;34m\]hacker@fedora-lab\[\033[0m\]:\[\033[1;32m\]\w\[\033[0m\]\$ "' >> /home/hacker/.bashrc && \
    echo 'export TERM=xterm-256color' >> /home/hacker/.bashrc

USER hacker
WORKDIR /home/hacker

CMD ["/bin/bash"]
