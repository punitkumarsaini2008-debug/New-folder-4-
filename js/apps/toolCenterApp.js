// ==============================================================================
// Multi-OS Cybersecurity Platform - Centralized Cybersecurity Tool Center
// Houses all 34 tools across Network, Web, OSINT, Passwords, Forensics, & Dev
// ==============================================================================

class ToolCenterApp {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.initToolsDatabase();
  }

  initToolsDatabase() {
    this.tools = [
      // 1. NETWORK TOOLS
      {
        id: 'nmap',
        name: 'Nmap',
        category: 'network',
        catLabel: 'Network Tools',
        desc: 'Industry standard network exploration tool and security port scanner.',
        status: 'Installed',
        installed: true,
        cli: 'nmap -sV -sC -T4 <target>',
        docs: 'https://nmap.org/book/man.html',
        action: () => window.openNmapApp()
      },
      {
        id: 'masscan',
        name: 'Masscan',
        category: 'network',
        catLabel: 'Network Tools',
        desc: 'High-speed asynchronous TCP port scanner transmitting SYN packets at line rate.',
        status: 'Installed',
        installed: true,
        cli: 'masscan -p80,443 192.168.1.0/24 --rate=1000',
        docs: 'https://github.com/robertdavidgraham/masscan',
        action: () => this.openToolRunnerModal('Masscan', 'masscan -p80,443,22 192.168.1.0/24', 'Scanning 256 hosts...\nDiscovered open port 80/tcp on 192.168.1.100\nDiscovered open port 22/tcp on 192.168.1.100\nDiscovered open port 443/tcp on 192.168.1.100\nRate: 1000 pps, 100% complete.')
      },
      {
        id: 'netcat',
        name: 'Netcat (nc)',
        category: 'network',
        catLabel: 'Network Tools',
        desc: 'Networking utility for reading from and writing to network connections using TCP/UDP.',
        status: 'Installed',
        installed: true,
        cli: 'nc -zv 192.168.1.100 20-80',
        docs: 'https://nmap.org/ncat/',
        action: () => this.openToolRunnerModal('Netcat (nc)', 'nc -zv 192.168.1.100 80', '(UNKNOWN) [192.168.1.100] 80 (http) open\nConnection to 192.168.1.100 port 80 [tcp/http] succeeded!')
      },
      {
        id: 'wireshark',
        name: 'Wireshark',
        category: 'network',
        catLabel: 'Network Tools',
        desc: 'World foremost network protocol analyzer for packet capture and deep inspection.',
        status: 'Installed',
        installed: true,
        cli: 'tshark -i eth0 -f "tcp port 80"',
        docs: 'https://www.wireshark.org/docs/',
        action: () => window.openWiresharkApp()
      },
      {
        id: 'traceroute',
        name: 'Traceroute',
        category: 'network',
        catLabel: 'Network Tools',
        desc: 'Diagnostic tool for displaying the route path and measuring transit delays of packets across an IP network.',
        status: 'Installed',
        installed: true,
        cli: 'traceroute 192.168.1.100',
        docs: 'https://linux.die.net/man/8/traceroute',
        action: () => this.openToolRunnerModal('Traceroute', 'traceroute 192.168.1.100', 'traceroute to 192.168.1.100 (192.168.1.100), 30 hops max, 60 byte packets\n 1  192.168.1.1 (gateway)  0.312 ms  0.284 ms  0.270 ms\n 2  192.168.1.100 (target-node)  0.412 ms  0.395 ms  0.380 ms')
      },
      {
        id: 'ping',
        name: 'Ping',
        category: 'network',
        catLabel: 'Network Tools',
        desc: 'ICMP echo utility to test reachability of a host on an IP network and round-trip time.',
        status: 'Installed',
        installed: true,
        cli: 'ping -c 4 192.168.1.100',
        docs: 'https://linux.die.net/man/8/ping',
        action: () => this.openToolRunnerModal('Ping', 'ping -c 4 192.168.1.100', 'PING 192.168.1.100 (192.168.1.100) 56(84) bytes of data.\n64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=0.038 ms\n64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=0.041 ms\n64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=0.039 ms\n64 bytes from 192.168.1.100: icmp_seq=4 ttl=64 time=0.042 ms\n--- 192.168.1.100 ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss')
      },

      // 2. WEB SECURITY
      {
        id: 'burpsuite',
        name: 'Burp Suite Community',
        category: 'web',
        catLabel: 'Web Security',
        desc: 'Leading web application proxy, request repeater, intruder, and vulnerability auditor.',
        status: 'Installed',
        installed: true,
        cli: 'burpsuite --project-file=lab.burp',
        docs: 'https://portswigger.net/burp/documentation',
        action: () => window.openBurpSuiteApp()
      },
      {
        id: 'owasp-zap',
        name: 'OWASP ZAP',
        category: 'web',
        catLabel: 'Web Security',
        desc: 'Zed Attack Proxy: open-source automated web application vulnerability scanner.',
        status: 'Installed',
        installed: true,
        cli: 'zap.sh -cmd -quickurl http://192.168.1.100',
        docs: 'https://www.zaproxy.org/docs/',
        action: () => window.openOwaspZapApp()
      },
      {
        id: 'nikto',
        name: 'Nikto',
        category: 'web',
        catLabel: 'Web Security',
        desc: 'Web server assessment tool scanning for 6700+ dangerous files, outdated servers, and CGI vulnerabilities.',
        status: 'Installed',
        installed: true,
        cli: 'nikto -h http://192.168.1.100',
        docs: 'https://cirt.net/Nikto2',
        action: () => this.openToolRunnerModal('Nikto Web Scanner', 'nikto -h http://192.168.1.100', '- Nikto v2.5.0\n+ Target IP: 192.168.1.100\n+ Server: Apache/2.4.52 (Debian)\n+ The anti-clickjacking X-Frame-Options header is not present.\n+ Root directory contains /robots.txt with disallowed entry: /admin/\n+ /admin/config.php: Found sensitive configuration file leaking credentials.')
      },
      {
        id: 'gobuster',
        name: 'Gobuster',
        category: 'web',
        catLabel: 'Web Security',
        desc: 'High-speed directory, DNS subdomain, and virtual host brute-forcing utility written in Go.',
        status: 'Installed',
        installed: true,
        cli: 'gobuster dir -u http://192.168.1.100 -w common.txt',
        docs: 'https://github.com/OJ/gobuster',
        action: () => this.openToolRunnerModal('Gobuster', 'gobuster dir -u http://192.168.1.100 -w /usr/share/wordlists/dirb/common.txt', '===============================================================\nGobuster v3.6 - Fast Directory Brute Forcer\n===============================================================\n[+] Url:         http://192.168.1.100\n[+] Threads:     10\n[+] Wordlist:    common.txt\n===============================================================\n/admin                (Status: 301) [Size: 312] [--> /admin/]\n/css                  (Status: 301) [Size: 310]\n/images               (Status: 301) [Size: 313]\n/index.html           (Status: 200) [Size: 1042]\n/robots.txt           (Status: 200) [Size: 64]\n===============================================================')
      },
      {
        id: 'whatweb',
        name: 'WhatWeb',
        category: 'web',
        catLabel: 'Web Security',
        desc: 'Next generation web scanner recognizing web technologies including CMS, blogging platforms, and JS libraries.',
        status: 'Installed',
        installed: true,
        cli: 'whatweb http://192.168.1.100',
        docs: 'https://github.com/urbanadventurer/WhatWeb',
        action: () => this.openToolRunnerModal('WhatWeb', 'whatweb http://192.168.1.100', 'http://192.168.1.100 [200 OK] Apache[2.4.52], Country[RESERVED], HTML5, HTTPServer[Debian Linux][Apache/2.4.52 (Debian)], IP[192.168.1.100], PHP[8.1.2], Script[text/javascript], Title[Vulnerable Lab Dashboard]')
      },
      {
        id: 'wapiti',
        name: 'Wapiti',
        category: 'web',
        catLabel: 'Web Security',
        desc: 'Web application vulnerability auditor performing black-box scans to inject payloads into scripts.',
        status: 'Installed',
        installed: true,
        cli: 'wapiti -u http://192.168.1.100/ --flush-session',
        docs: 'https://wapiti.sourceforge.io/',
        action: () => this.openToolRunnerModal('Wapiti Web Scanner', 'wapiti -u http://192.168.1.100/ -m sql,xss', 'Wapiti 3.1.6 (wapiti.sourceforge.io)\n[*] Loading modules: sql, xss\n[*] Crawling target: http://192.168.1.100/\n[!] SQL Injection vulnerability discovered in parameter "username" on /admin/auth.php\n[!] Reflected XSS vulnerability in parameter "q" on /search.php\nReport generated: wapiti_report.html')
      },

      // 3. OSINT TOOLS
      {
        id: 'whois',
        name: 'WHOIS',
        category: 'osint',
        catLabel: 'OSINT',
        desc: 'Client for the WHOIS protocol querying databases storing registered users or assignees of Internet resources.',
        status: 'Installed',
        installed: true,
        cli: 'whois scanme.nmap.org',
        docs: 'https://www.iana.org/whois',
        action: () => this.openToolRunnerModal('WHOIS Lookup', 'whois scanme.nmap.org', 'Domain Name: NMAP.ORG\nRegistry Domain ID: 5219989_DOMAIN_ORG-VRSN\nRegistrar: Namecheap, Inc.\nCreation Date: 1999-09-02T16:15:13Z\nRegistrar Abuse Contact Email: abuse@namecheap.com\nName Server: NS1.LINODE.COM\nDNSSEC: unsigned')
      },
      {
        id: 'theharvester',
        name: 'theHarvester',
        category: 'osint',
        catLabel: 'OSINT',
        desc: 'E-mails, subdomains, IPs, and employee names gatherer using multiple public search engines.',
        status: 'Installed',
        installed: true,
        cli: 'theHarvester -d example.com -l 100 -b google',
        docs: 'https://github.com/laramies/theHarvester',
        action: () => this.openToolRunnerModal('theHarvester OSINT', 'theHarvester -d example.com -b duckduckgo', '[*] Target: example.com\n[*] Searching DuckDuckGo...\n[*] Emails found: 4\n    security@example.com\n    admin@example.com\n    support@example.com\n[*] Hosts found: 3\n    api.example.com: 93.184.216.34\n    mail.example.com: 93.184.216.35')
      },
      {
        id: 'sherlock',
        name: 'Sherlock',
        category: 'osint',
        catLabel: 'OSINT',
        desc: 'Hunt down social media accounts by username across more than 400 social networks and platforms.',
        status: 'Installed',
        installed: true,
        cli: 'sherlock <username> --timeout 5',
        docs: 'https://sherlock-project.github.io/',
        action: () => this.openToolRunnerModal('Sherlock Username OSINT', 'sherlock target_dev', '[*] Checking username target_dev on:\n[+] GitHub: https://github.com/target_dev\n[+] GitLab: https://gitlab.com/target_dev\n[+] Reddit: https://www.reddit.com/user/target_dev\n[+] HackerNews: https://news.ycombinator.com/user?id=target_dev\n[*] Search completed in 3.4s across 410 platforms.')
      },
      {
        id: 'amass',
        name: 'OWASP Amass',
        category: 'osint',
        catLabel: 'OSINT',
        desc: 'In-depth attack surface mapping and external asset discovery using open source information.',
        status: 'Installed',
        installed: true,
        cli: 'amass enum -d target.com',
        docs: 'https://owasp.org/www-project-amass/',
        action: () => this.openToolRunnerModal('OWASP Amass', 'amass enum -d target.com -passive', '[Amass v4.2.0] Attack Surface Enumeration\nportal.target.com (FQDN) --> a:target.com (FQDN)\napi-v1.target.com (FQDN) --> a:target.com (FQDN)\nvpn.target.com (FQDN) --> 192.168.1.5 (IPv4)\nDiscoveries: 12 subdomains mapped.')
      },
      {
        id: 'subfinder',
        name: 'Subfinder',
        category: 'osint',
        catLabel: 'OSINT',
        desc: 'Fast passive subdomain discovery tool built for high-throughput reconnaissance.',
        status: 'Installed',
        installed: true,
        cli: 'subfinder -d target.com -silent',
        docs: 'https://github.com/projectdiscovery/subfinder',
        action: () => this.openToolRunnerModal('Subfinder', 'subfinder -d target.com', 'admin.target.com\nauth.target.com\ncdn.target.com\nmail.target.com\nstaging.target.com\n[INF] Found 5 subdomains for target.com in 1.14 seconds')
      },
      {
        id: 'dnsenum',
        name: 'DNSenum',
        category: 'osint',
        catLabel: 'OSINT',
        desc: 'Multithreaded script to enumerate DNS information of a domain and discover non-contiguous ip blocks.',
        status: 'Installed',
        installed: true,
        cli: 'dnsenum target.com',
        docs: 'https://github.com/fwaeytens/dnsenum',
        action: () => this.openToolRunnerModal('DNSenum', 'dnsenum target.com', 'Host\'s addresses:\n target.com. 300 IN A 93.184.216.34\nName Servers:\n ns1.target.com. 300 IN A 93.184.216.10\nTrying Zone Transfer for target.com on ns1.target.com ...\nAXFR query refused (Good: Secure config).')
      },

      // 4. PASSWORD AUDITING
      {
        id: 'john',
        name: 'John the Ripper',
        category: 'password',
        catLabel: 'Password Auditing',
        desc: 'Fast password cracker supporting Unix crypt, Windows LM/NTLM, Kerberos, and custom hashes.',
        status: 'Installed',
        installed: true,
        cli: 'john --wordlist=rockyou.txt hashes.txt',
        docs: 'https://www.openwall.com/john/',
        action: () => this.openToolRunnerModal('John the Ripper', 'john --format=raw-md5 hashes.txt', 'Loaded 1 password hash (Raw-MD5 [128/128 AVX 4x3])\nWill run 4 OpenMP threads\nPress \'q\' or Ctrl-C to abort\npassword123      (admin)\n1g 0:00:00:00 DONE 2/3 (2026-11-20 08:52) 100.0g/s 4520Kp/s\nSession completed')
      },
      {
        id: 'hashcat',
        name: 'Hashcat',
        category: 'password',
        catLabel: 'Password Auditing',
        desc: 'World fastest and most advanced password recovery utility supporting GPU acceleration and rules.',
        status: 'Installed',
        installed: true,
        cli: 'hashcat -m 0 -a 0 hash.txt wordlist.txt',
        docs: 'https://hashcat.net/hashcat/',
        action: () => this.openToolRunnerModal('Hashcat', 'hashcat -m 0 hashes.txt -a 0 wordlist.txt', 'hashcat (v6.2.6) starting in benchmark mode...\n5d41402abc4b2a76b9719d911017c592:hello\nSession..........: hashcat\nStatus...........: Cracked\nHash.Mode........: 0 (MD5)\nSpeed.#1.........: 1245.2 MH/s')
      },
      {
        id: 'hydra',
        name: 'Hydra (THC)',
        category: 'password',
        catLabel: 'Password Auditing',
        desc: 'Fast network logon cracker supporting many protocols including SSH, FTP, Telnet, HTTP, SMB.',
        status: 'Installed',
        installed: true,
        cli: 'hydra -l admin -P wordlist.txt ssh://192.168.1.100',
        docs: 'https://github.com/vanhauser-thc/thc-hydra',
        action: () => this.openToolRunnerModal('Hydra', 'hydra -l admin -P sample_passwords.txt ssh://192.168.1.100', 'Hydra v9.5 (c) 2026 by van Hauser / THC\n[DATA] max 16 tasks per target, 1 target\n[ATTEMPT] target 192.168.1.100 - login "admin" - pass "admin"\n[22][ssh] host: 192.168.1.100   login: admin   password: password123\n1 of 1 target successfully completed, 1 valid password found')
      },
      {
        id: 'hash-id',
        name: 'Hash Identifier',
        category: 'password',
        catLabel: 'Password Auditing',
        desc: 'Tool to identify the algorithm used to create a hash from over 100 known cryptographic hashes.',
        status: 'Installed',
        installed: true,
        cli: 'hashid "5d41402abc4b2a76b9719d911017c592"',
        docs: 'https://github.com/psypanda/hashID',
        action: () => this.openToolRunnerModal('Hash Identifier', 'hashid 5d41402abc4b2a76b9719d911017c592', 'Analyzing "5d41402abc4b2a76b9719d911017c592"...\n[+] MD5\n[+] MD4\n[+] NTLM\n[+] Domain Cached Credentials (DCC)')
      },
      {
        id: 'pass-analyzer',
        name: 'Password Strength Analyzer',
        category: 'password',
        catLabel: 'Password Auditing',
        desc: 'Shannon entropy and dictionary resistance tester to evaluate credential resistance against dictionary attacks.',
        status: 'Installed',
        installed: true,
        cli: 'pwquality-check',
        docs: 'https://linux.die.net/man/1/pwscore',
        action: () => this.openToolRunnerModal('Password Strength Analyzer', 'audit_password "P@ssw0rd2026!"', 'Length: 13 characters\nEntropy: 78.4 bits (Strong)\nCharacter classes: 4/4 (Lowercase, Uppercase, Digits, Symbols)\nDictionary check: No common wordlist matches\nEstimated cracking time: 42,000 centuries (at 100 GH/s)')
      },

      // 5. DIGITAL FORENSICS
      {
        id: 'autopsy',
        name: 'Autopsy Forensics',
        category: 'forensics',
        catLabel: 'Digital Forensics',
        desc: 'Digital forensics platform and graphical interface to The Sleuth Kit for disk image investigations.',
        status: 'Installed',
        installed: true,
        cli: 'autopsy',
        docs: 'https://www.autopsy.com/documentation/',
        action: () => this.openToolRunnerModal('Autopsy Forensics', 'autopsy --case=Case_001_Investigation', '[*] Initializing SleuthKit Forensic Engine...\n[*] Ingesting disk image: evidence_drive.raw\n[+] Discovered deleted files in unallocated clusters: 14\n[+] Flagged sensitive documents: confidential_payroll.xlsx\n[*] Timeline analysis generated: 4,120 events indexed.')
      },
      {
        id: 'exiftool',
        name: 'ExifTool',
        category: 'forensics',
        catLabel: 'Digital Forensics',
        desc: 'Independent library and application for reading, writing and manipulating image, PDF, and video metadata.',
        status: 'Installed',
        installed: true,
        cli: 'exiftool evidence.jpg',
        docs: 'https://exiftool.org/',
        action: () => this.openToolRunnerModal('ExifTool Metadata Extractor', 'exiftool evidence.jpg', 'ExifTool Version Number         : 12.76\nFile Name                       : evidence.jpg\nCamera Model Name               : CyberCam Mark II\nDate/Time Original              : 2026:11:18 14:22:10\nGPS Latitude                    : 37 deg 46\' 29.88" N\nGPS Longitude                   : 122 deg 25\' 9.84" W\nCreator Tool                    : ParrotCloud Camera OS')
      },
      {
        id: 'binwalk',
        name: 'Binwalk',
        category: 'forensics',
        catLabel: 'Digital Forensics',
        desc: 'Fast, easy to use tool for analyzing, reverse engineering, and extracting firmware images.',
        status: 'Installed',
        installed: true,
        cli: 'binwalk -e firmware.bin',
        docs: 'https://github.com/ReFirmLabs/binwalk',
        action: () => this.openToolRunnerModal('Binwalk Firmware Analyzer', 'binwalk firmware.bin', 'DECIMAL       HEXADECIMAL     DESCRIPTION\n--------------------------------------------------------------------------------\n0             0x0             TRX firmware header, load address: 0x80001000\n28            0x1C            gzip compressed data, maximum compression\n1048576       0x100000        Squashfs filesystem, little endian, version 4.0\n[+] Extracted rootfs filesystem to _firmware.bin.extracted/')
      },
      {
        id: 'foremost',
        name: 'Foremost',
        category: 'forensics',
        catLabel: 'Digital Forensics',
        desc: 'Console program to recover files based on their headers, footers, and internal data structures.',
        status: 'Installed',
        installed: true,
        cli: 'foremost -t jpg,pdf,png -i memory.raw',
        docs: 'https://foremost.sourceforge.net/',
        action: () => this.openToolRunnerModal('Foremost File Carver', 'foremost -i memory_dump.raw -o carved_files/', 'Foremost version 1.5.7 by Jesse Kornblum & Kris Kendall\nProcessing: memory_dump.raw\n|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|\nFiles carved successfully:\n  jpg: 6 files\n  pdf: 2 documents\n  zip: 1 archive')
      },
      {
        id: 'volatility',
        name: 'Volatility 3',
        category: 'forensics',
        catLabel: 'Digital Forensics',
        desc: 'Advanced memory forensics framework for incident response and RAM dump artifact extraction.',
        status: 'Installed',
        installed: true,
        cli: 'vol -f mem.dmp windows.pslist',
        docs: 'https://volatilityfoundation.org/',
        action: () => this.openToolRunnerModal('Volatility 3 Memory Forensics', 'vol -f memory.raw linux.pslist', 'Volatility 3 Framework 2.5.0\nPID    PPID   ImageFileName    Offset(V)          Threads\n1      0      systemd          0xffff880002140000 1\n420    1      sshd             0xffff880004182000 1\n1337   420    malicious_shell  0xffff88000921a000 2 [HIDDEN PROCESS]')
      },

      // 6. DEVELOPMENT & LAB TOOLS
      {
        id: 'python-ide',
        name: 'Python IDE',
        category: 'dev',
        catLabel: 'Development',
        desc: 'Full-featured Python programming IDE with interactive execution console, code editor, and script tester.',
        status: 'Installed',
        installed: true,
        cli: 'python3 -i script.py',
        docs: 'https://docs.python.org/3/',
        action: () => window.openPythonIdeApp()
      },
      {
        id: 'c-ide',
        name: 'C Compiler & IDE',
        category: 'dev',
        catLabel: 'Development',
        desc: 'C programming workspace with GCC compilation simulation, syntax verification, and execution output.',
        status: 'Installed',
        installed: true,
        cli: 'gcc -Wall -O2 main.c -o app && ./app',
        docs: 'https://gcc.gnu.org/onlinedocs/',
        action: () => window.openCIdeApp()
      },
      {
        id: 'ghidra-sre',
        name: 'Ghidra',
        category: 'dev',
        catLabel: 'Development',
        desc: 'NSA software reverse engineering framework with binary decompiler and x86_64 disassembler.',
        status: 'Installed',
        installed: true,
        cli: 'ghidraRun',
        docs: 'https://ghidra-sre.org/',
        action: () => window.openGhidraApp()
      },
      {
        id: 'git-manager',
        name: 'Git Manager',
        category: 'dev',
        catLabel: 'Development',
        desc: 'Version control system managing commits, branching, and repository forensic history.',
        status: 'Installed',
        installed: true,
        cli: 'git status',
        docs: 'https://git-scm.com/doc',
        action: () => this.openToolRunnerModal('Git Manager', 'git log --oneline -n 5', '26e98f8 Initial commit: Multi-OS Cybersecurity Platform\na1b2c3d Add 5 independent OS profiles & centralized tool suite\n98f7e6d Configure safe educational cybersecurity labs\n45b6c7d Implement report center with PDF export')
      },
      {
        id: 'docker-lab',
        name: 'Docker Learning Lab',
        category: 'dev',
        catLabel: 'Development',
        desc: 'Container management studio to monitor isolated user containers and cgroup resource quotas.',
        status: 'Installed',
        installed: true,
        cli: 'docker ps --all',
        docs: 'https://docs.docker.com/',
        action: () => this.openToolRunnerModal('Docker Container Manager', 'docker ps -a', 'CONTAINER ID   IMAGE                 COMMAND                  STATUS         PORTS\n4a1b2c3d4e5f   parrotcloud:debian12  "node /app/server..."   Up 3 hours     0.0.0.0:3000->3000/tcp\nQuotas: 2.0 vCPU | 2048 MB RAM | Network: parrot-net (bridge isolated)')
      },
      {
        id: 'sqlmap',
        name: 'SQLMap',
        category: 'dev',
        catLabel: 'Development',
        desc: 'Automatic SQL injection and database takeover tool detecting and exploiting flaws.',
        status: 'Installed',
        installed: true,
        cli: 'sqlmap -u "http://192.168.1.100/admin/auth.php" --dbs',
        docs: 'https://sqlmap.org/',
        action: () => this.openToolRunnerModal('SQLMap Automator', 'sqlmap -u "http://192.168.1.100/admin/auth.php" --dbs --batch', '[*] testing connection to the target URL\n[+] GET parameter \'id\' is vulnerable: Boolean-based blind / Error-based\n[*] fetching database names\navailable databases [3]:\n[*] information_schema\n[*] lab_production\n[*] mysql')
      },
      {
        id: 'metasploit',
        name: 'Metasploit Learning Lab',
        category: 'dev',
        catLabel: 'Development',
        desc: 'Educational simulator for the world most used penetration testing framework.',
        status: 'Installed',
        installed: true,
        cli: 'msfconsole -q',
        docs: 'https://docs.metasploit.com/',
        action: () => this.openToolRunnerModal('Metasploit Learning Lab', 'msfconsole -q', '       =[ metasploit v6.3.50-dev                          ]\n+ -- --=[ 2380 exploits - 1240 auxiliary - 410 post       ]\nmsf6 > use exploit/multi/http/apache_mod_cgi_bash_env\nmsf6 exploit(apache_mod_cgi_bash_env) > set RHOSTS 192.168.1.100\nmsf6 exploit(apache_mod_cgi_bash_env) > check\n[+] 192.168.1.100:80 - The target is vulnerable. (Educational Simulation)')
      }
    ];
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-center-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:14px; font-weight:700; color:var(--parrot-cyan);">Cybersecurity Application Center</span>
          <span style="color:#8b949e; font-size:11px;">(${this.tools.length} Tools Available Across All 5 OS)</span>
        </div>
        <div class="tool-center-search">
          <svg style="width:14px;height:14px;color:#8b949e;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="tc-search-input" placeholder="Search tool by name or keyword..." />
        </div>
      </div>

      <div class="tool-cat-tabs">
        <div class="tool-cat-tab active" data-cat="all">All Tools (${this.tools.length})</div>
        <div class="tool-cat-tab" data-cat="network">Network Tools (6)</div>
        <div class="tool-cat-tab" data-cat="web">Web Security (6)</div>
        <div class="tool-cat-tab" data-cat="osint">OSINT (6)</div>
        <div class="tool-cat-tab" data-cat="password">Password Auditing (5)</div>
        <div class="tool-cat-tab" data-cat="forensics">Digital Forensics (5)</div>
        <div class="tool-cat-tab" data-cat="dev">Development & Labs (6)</div>
      </div>

      <div class="tools-cards-grid" id="tc-cards-grid"></div>
    `;

    window.windowManager.createWindow({
      id: 'tool-center',
      title: 'Cybersecurity Application Center - 34 Tools',
      icon: iconSvg,
      width: 880,
      height: 560,
      content: container
    });

    this.bindEvents(container);
    this.renderCards(container);
  }

  bindEvents(container) {
    const searchInput = container.querySelector('#tc-search-input');
    const tabs = container.querySelectorAll('.tool-cat-tab');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderCards(container);
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentCategory = tab.dataset.cat;
        this.renderCards(container);
      });
    });
  }

  renderCards(container) {
    const grid = container.querySelector('#tc-cards-grid');
    grid.innerHTML = '';

    const filtered = this.tools.filter(t => {
      const matchesCat = this.currentCategory === 'all' || t.category === this.currentCategory;
      const matchesSearch = !this.searchQuery || 
        t.name.toLowerCase().includes(this.searchQuery) ||
        t.desc.toLowerCase().includes(this.searchQuery) ||
        t.catLabel.toLowerCase().includes(this.searchQuery);
      return matchesCat && matchesSearch;
    });

    filtered.forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tool-item-card';
      card.innerHTML = `
        <div class="tool-card-top">
          <div class="tool-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          </div>
          <div>
            <div class="tool-card-title">${tool.name}</div>
            <div class="tool-card-cat">${tool.catLabel}</div>
          </div>
        </div>
        <div class="tool-card-desc">${tool.desc}</div>
        <div style="background:#090d14; border:1px solid #30363d; border-radius:4px; padding:4px 8px; font-family:var(--font-mono); font-size:10.5px; color:#56e6ff; margin-bottom:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          $ ${tool.cli}
        </div>
        <div class="tool-card-footer">
          <div class="tool-status-pill">
            <span class="tool-status-dot"></span>
            <span>Ready (Sandbox)</span>
          </div>
          <div style="display:flex; gap:6px;">
            <a href="${tool.docs}" target="_blank" rel="noopener noreferrer" class="tool-btn" style="padding:3px 7px; font-size:10.5px; text-decoration:none;">Docs</a>
            <button class="tool-btn primary" id="btn-launch-${tool.id}" style="padding:3px 10px; font-size:10.5px;">Launch</button>
          </div>
        </div>
      `;

      card.querySelector(`#btn-launch-${tool.id}`).addEventListener('click', () => {
        tool.action();
      });

      grid.appendChild(card);
    });
  }

  openToolRunnerModal(toolName, defaultCmd, sampleOutput) {
    const modalId = `tool-run-${Date.now()}`;
    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131822;">
        <span style="font-weight:700; color:var(--parrot-cyan);">${toolName} Execution Interface</span>
        <span style="color:#8b949e;">|</span>
        <span class="risk-badge risk-info" style="font-size:10px;">[SIMULATED ENVIRONMENT - Educational Target]</span>
      </div>
      <div style="padding:10px 14px; background:#182232; border-bottom:1px solid rgba(0,229,255,0.15); display:flex; gap:8px;">
        <input type="text" class="nmap-input" id="tr-input-${modalId}" value="${defaultCmd}" style="flex:1;" />
        <button class="tool-btn primary" id="tr-run-${modalId}">Run Command</button>
      </div>
      <div style="flex:1; background:#080b10; color:#7ee787; font-family:var(--font-mono); font-size:12px; padding:12px; overflow-y:auto; white-space:pre-wrap;" id="tr-output-${modalId}">${sampleOutput}</div>
    `;

    window.windowManager.createWindow({
      id: modalId,
      title: `${toolName} - CLI Runner`,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
      width: 700,
      height: 420,
      content: container
    });

    const runBtn = container.querySelector(`#tr-run-${modalId}`);
    const inputEl = container.querySelector(`#tr-input-${modalId}`);
    const outputEl = container.querySelector(`#tr-output-${modalId}`);

    runBtn.onclick = () => {
      outputEl.textContent = `[SIMULATED EXECUTION - Educational Sandbox]\n$ ${inputEl.value}\n[+] Processing request...\n\n` + sampleOutput;
      window.notifications.show(toolName, 'Command executed in sandbox', 'info');
    };
  }
}

window.toolCenterApp = new ToolCenterApp();
window.openToolCenterApp = () => window.toolCenterApp.open();
