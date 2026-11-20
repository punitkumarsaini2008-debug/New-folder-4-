// ==============================================================================
// Multi-OS Cybersecurity Platform - POSIX / Bash Linux Shell Engine
// Provides authentic terminal execution, Linux utilities, pipes, & file manipulation
// Supports Parrot, Ubuntu, Kali, Linux Mint, & Fedora environments
// Clearly distinguishes simulated sandbox outputs from remote Linux execution
// ==============================================================================

class LinuxShellEngine {
  constructor() {
    this.vfs = JSON.parse(JSON.stringify(window.INITIAL_VFS || {}));
    this.activeOs = 'parrot';
    this.cwd = '/home/parrot';
    this.currentUser = 'parrot';
    this.isRoot = false;
    this.history = [];
    this.env = {
      USER: 'parrot',
      HOME: '/home/parrot',
      SHELL: '/bin/bash',
      TERM: 'xterm-256color',
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      LANG: 'en_US.UTF-8',
      HOSTNAME: 'parrotcloud'
    };
    this.sudoActive = false;
  }

  // Update shell environment when user switches operating systems
  setEnvironment(osProfile) {
    if (!osProfile) return;
    this.activeOs = osProfile.id;
    this.currentUser = osProfile.user;
    this.cwd = osProfile.homeDir;
    this.env.USER = osProfile.user;
    this.env.HOME = osProfile.homeDir;
    this.env.HOSTNAME = osProfile.hostname;
    this.isRoot = false;
  }

  // Resolve path (handles relative, absolute, ~, ..)
  resolvePath(inputPath) {
    if (!inputPath || inputPath === '~') return this.env.HOME;
    if (inputPath.startsWith('~/')) {
      inputPath = this.env.HOME + inputPath.substring(1);
    }
    const isAbsolute = inputPath.startsWith('/');
    const baseSegments = isAbsolute ? [] : this.cwd.split('/').filter(Boolean);
    const inputSegments = inputPath.split('/').filter(Boolean);

    for (const seg of inputSegments) {
      if (seg === '.') continue;
      if (seg === '..') {
        if (baseSegments.length > 0) baseSegments.pop();
      } else {
        baseSegments.push(seg);
      }
    }
    const resolved = '/' + baseSegments.join('/');
    return resolved === '//' ? '/' : resolved;
  }

  // Get file or directory node from VFS
  getNode(path) {
    const resolved = this.resolvePath(path);
    return this.vfs[resolved] || null;
  }

  // Parse command line into command and pipe stages
  async execute(commandLine) {
    if (!commandLine || !commandLine.trim()) return '';
    const trimmed = commandLine.trim();
    this.history.push(trimmed);

    // Support pipeline: cmd1 | cmd2 | cmd3
    if (trimmed.includes('|')) {
      const stages = trimmed.split('|').map(s => s.trim());
      let inputData = '';
      for (const stage of stages) {
        inputData = await this.executeSingle(stage, inputData);
      }
      return inputData;
    }

    // Support output redirection: cmd > file or cmd >> file
    if (trimmed.includes('>') || trimmed.includes('>>')) {
      const isAppend = trimmed.includes('>>');
      const parts = trimmed.split(isAppend ? '>>' : '>');
      const cmdPart = parts[0].trim();
      const filePart = parts[1].trim();

      const output = await this.executeSingle(cmdPart, '');
      const filePath = this.resolvePath(filePart);
      const parentDir = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
      const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

      if (this.vfs[parentDir] && this.vfs[parentDir].type === 'dir') {
        let existing = this.vfs[filePath];
        if (existing && existing.type === 'file') {
          existing.content = isAppend ? existing.content + output : output;
        } else {
          this.vfs[filePath] = {
            type: 'file',
            perms: 'rw-r--r--',
            owner: this.currentUser,
            group: this.currentUser,
            content: output
          };
          if (!this.vfs[parentDir].children.includes(fileName)) {
            this.vfs[parentDir].children.push(fileName);
          }
        }
        return '';
      } else {
        return `bash: ${filePart}: No such file or directory\n`;
      }
    }

    return await this.executeSingle(trimmed, '');
  }

  // Execute single command stage
  async executeSingle(cmdStr, stdin) {
    const tokens = this.tokenize(cmdStr);
    if (tokens.length === 0) return '';
    const cmd = tokens[0];
    const args = tokens.slice(1);

    switch (cmd) {
      case 'pwd':
        return this.cwd + '\n';

      case 'whoami':
        return (this.isRoot ? 'root' : this.currentUser) + '\n';

      case 'clear':
        return '\u001b[2J\u001b[H';

      case 'cd':
        return this.cmdCd(args);

      case 'ls':
        return this.cmdLs(args);

      case 'cat':
        return this.cmdCat(args, stdin);

      case 'mkdir':
        return this.cmdMkdir(args);

      case 'touch':
        return this.cmdTouch(args);

      case 'cp':
        return this.cmdCp(args);

      case 'mv':
        return this.cmdMv(args);

      case 'rm':
        return this.cmdRm(args);

      case 'grep':
        return this.cmdGrep(args, stdin);

      case 'find':
        return this.cmdFind(args);

      case 'echo':
        return args.join(' ') + '\n';

      case 'uname':
        return this.cmdUname(args);

      case 'ip':
      case 'ifconfig':
        return this.cmdIp(args);

      case 'ping':
        return await this.cmdPing(args);

      case 'nmap':
        return await this.cmdNmap(args);

      case 'nikto':
        return await this.cmdNikto(args);

      case 'sudo':
        return await this.cmdSudo(args, stdin);

      case 'neofetch':
      case 'sysinfo':
        return this.cmdNeofetch();

      case 'ps':
        return this.cmdPs(args);

      case 'date':
        return new Date().toUTCString() + '\n';

      case 'uptime':
        return ` 08:55:00 up 14 days, 3:22,  2 users,  load average: 0.14, 0.08, 0.05\n`;

      case 'df':
        return `Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/sda1       51474440  12480320  36357492  26% /\nudev             4024840         0   4024840   0% /dev\ntmpfs             808384      1240    807144   1% /run\n`;

      case 'free':
        return `               total        used        free      shared  buff/cache   available\nMem:         8167664     2456120     3984124      142856     1727420     5324688\nSwap:        2097148           0     2097148\n`;

      case 'curl':
      case 'wget':
        return `\u001b[1;33m[SIMULATED - Educational Sandbox]\u001b[0m\n[+] Connecting to ${args[0] || 'target'}...\nHTTP/1.1 200 OK\nServer: Apache/2.4.52 (Debian)\nContent-Type: text/html; charset=UTF-8\nTransfer-Encoding: chunked\n\n<!DOCTYPE html><html><head><title>Target Web Application</title></head><body><h1>Target Active</h1></body></html>\n`;

      case 'history':
        return this.history.map((h, i) => `  ${i + 1}  ${h}`).join('\n') + '\n';

      case 'help':
        return this.cmdHelp();

      default:
        return `bash: ${cmd}: command not found\n`;
    }
  }

  // Tokenize shell input respecting single and double quotes
  tokenize(str) {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      tokens.push(match[1] || match[2] || match[0]);
    }
    return tokens;
  }

  // cd command
  cmdCd(args) {
    const target = args[0] || '~';
    const resolved = this.resolvePath(target);
    const node = this.vfs[resolved];
    if (!node) return `bash: cd: ${target}: No such file or directory\n`;
    if (node.type !== 'dir') return `bash: cd: ${target}: Not a directory\n`;
    this.cwd = resolved;
    return '';
  }

  // ls command
  cmdLs(args) {
    const showAll = args.some(a => a.startsWith('-') && a.includes('a'));
    const longFormat = args.some(a => a.startsWith('-') && a.includes('l'));
    const targetArg = args.find(a => !a.startsWith('-')) || '.';
    const resolved = this.resolvePath(targetArg);
    const node = this.vfs[resolved];

    if (!node) return `ls: cannot access '${targetArg}': No such file or directory\n`;

    if (node.type === 'file') {
      return `${node.perms} 1 ${node.owner} ${node.group} ${node.content.length} ${targetArg}\n`;
    }

    let children = [...node.children];
    if (showAll) {
      children = ['.', '..', ...children];
    } else {
      children = children.filter(c => !c.startsWith('.'));
    }

    if (!longFormat) {
      return children.map(c => {
        const childPath = resolved === '/' ? `/${c}` : `${resolved}/${c}`;
        const childNode = this.vfs[childPath];
        if (childNode && childNode.type === 'dir') {
          return `\u001b[1;34m${c}\u001b[0m`;
        }
        return c;
      }).join('  ') + '\n';
    }

    const lines = [`total ${children.length * 4}`];
    for (const c of children) {
      const childPath = resolved === '/' ? `/${c}` : `${resolved}/${c}`;
      const childNode = this.vfs[childPath] || { perms: 'rwxr-xr-x', owner: this.currentUser, group: this.currentUser, type: 'dir' };
      const isDir = childNode.type === 'dir';
      const perms = (isDir ? 'd' : '-') + (childNode.perms || 'rw-r--r--');
      const size = childNode.content ? childNode.content.length : 4096;
      const name = isDir ? `\u001b[1;34m${c}\u001b[0m` : `\u001b[0m${c}`;
      lines.push(`${perms} 1 ${childNode.owner || this.currentUser} ${childNode.group || this.currentUser} ${String(size).padStart(6, ' ')} Nov 20 08:45 ${name}`);
    }
    return lines.join('\n') + '\n';
  }

  // cat command
  cmdCat(args, stdin) {
    if (args.length === 0) return stdin;
    const outputs = [];
    for (const arg of args) {
      const resolved = this.resolvePath(arg);
      const node = this.vfs[resolved];
      if (!node) {
        outputs.push(`cat: ${arg}: No such file or directory`);
      } else if (node.type === 'dir') {
        outputs.push(`cat: ${arg}: Is a directory`);
      } else {
        if (resolved === '/etc/shadow' && !this.isRoot) {
          outputs.push(`cat: ${arg}: Permission denied`);
        } else {
          outputs.push(node.content);
        }
      }
    }
    return outputs.join('\n');
  }

  // mkdir command
  cmdMkdir(args) {
    const target = args.find(a => !a.startsWith('-'));
    if (!target) return 'mkdir: missing operand\n';
    const resolved = this.resolvePath(target);
    if (this.vfs[resolved]) return `mkdir: cannot create directory '${target}': File exists\n`;

    const parentDir = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const dirName = resolved.substring(resolved.lastIndexOf('/') + 1);

    if (!this.vfs[parentDir]) return `mkdir: cannot create directory '${target}': No such file or directory\n`;

    this.vfs[resolved] = {
      type: 'dir',
      perms: 'rwxr-xr-x',
      owner: this.currentUser,
      group: this.currentUser,
      children: []
    };
    if (!this.vfs[parentDir].children.includes(dirName)) {
      this.vfs[parentDir].children.push(dirName);
    }
    return '';
  }

  // touch command
  cmdTouch(args) {
    const target = args[0];
    if (!target) return 'touch: missing file operand\n';
    const resolved = this.resolvePath(target);
    if (!this.vfs[resolved]) {
      const parentDir = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
      const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);
      if (!this.vfs[parentDir]) return `touch: cannot touch '${target}': No such file or directory\n`;

      this.vfs[resolved] = {
        type: 'file',
        perms: 'rw-r--r--',
        owner: this.currentUser,
        group: this.currentUser,
        content: ''
      };
      if (!this.vfs[parentDir].children.includes(fileName)) {
        this.vfs[parentDir].children.push(fileName);
      }
    }
    return '';
  }

  // cp command (copy files)
  cmdCp(args) {
    const cleanArgs = args.filter(a => !a.startsWith('-'));
    if (cleanArgs.length < 2) return 'cp: missing destination file operand\n';
    const src = this.resolvePath(cleanArgs[0]);
    const dest = this.resolvePath(cleanArgs[1]);

    const srcNode = this.vfs[src];
    if (!srcNode) return `cp: cannot stat '${cleanArgs[0]}': No such file or directory\n`;

    let destPath = dest;
    const destNode = this.vfs[dest];
    if (destNode && destNode.type === 'dir') {
      const srcName = src.substring(src.lastIndexOf('/') + 1);
      destPath = dest === '/' ? `/${srcName}` : `${dest}/${srcName}`;
    }

    const parentDir = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
    const fileName = destPath.substring(destPath.lastIndexOf('/') + 1);

    if (!this.vfs[parentDir] || this.vfs[parentDir].type !== 'dir') {
      return `cp: cannot create regular file '${cleanArgs[1]}': No such file or directory\n`;
    }

    this.vfs[destPath] = JSON.parse(JSON.stringify(srcNode));
    if (!this.vfs[parentDir].children.includes(fileName)) {
      this.vfs[parentDir].children.push(fileName);
    }
    return '';
  }

  // mv command (move/rename files)
  cmdMv(args) {
    const cleanArgs = args.filter(a => !a.startsWith('-'));
    if (cleanArgs.length < 2) return 'mv: missing destination file operand\n';
    const src = this.resolvePath(cleanArgs[0]);
    const dest = this.resolvePath(cleanArgs[1]);

    const srcNode = this.vfs[src];
    if (!srcNode) return `mv: cannot stat '${cleanArgs[0]}': No such file or directory\n`;

    let destPath = dest;
    const destNode = this.vfs[dest];
    if (destNode && destNode.type === 'dir') {
      const srcName = src.substring(src.lastIndexOf('/') + 1);
      destPath = dest === '/' ? `/${srcName}` : `${dest}/${srcName}`;
    }

    const srcParent = src.substring(0, src.lastIndexOf('/')) || '/';
    const srcName = src.substring(src.lastIndexOf('/') + 1);
    const destParent = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
    const destName = destPath.substring(destPath.lastIndexOf('/') + 1);

    if (!this.vfs[destParent] || this.vfs[destParent].type !== 'dir') {
      return `mv: cannot move to '${cleanArgs[1]}': No such file or directory\n`;
    }

    this.vfs[destPath] = srcNode;
    delete this.vfs[src];

    if (this.vfs[srcParent]) {
      this.vfs[srcParent].children = this.vfs[srcParent].children.filter(c => c !== srcName);
    }
    if (!this.vfs[destParent].children.includes(destName)) {
      this.vfs[destParent].children.push(destName);
    }
    return '';
  }

  // rm command
  cmdRm(args) {
    const target = args.find(a => !a.startsWith('-'));
    if (!target) return 'rm: missing operand\n';
    const resolved = this.resolvePath(target);
    const node = this.vfs[resolved];
    if (!node) return `rm: cannot remove '${target}': No such file or directory\n`;

    const parentDir = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const name = resolved.substring(resolved.lastIndexOf('/') + 1);

    delete this.vfs[resolved];
    if (this.vfs[parentDir]) {
      this.vfs[parentDir].children = this.vfs[parentDir].children.filter(c => c !== name);
    }
    return '';
  }

  // grep command
  cmdGrep(args, stdin) {
    const pattern = args.find(a => !a.startsWith('-'));
    if (!pattern) return '';
    const fileArg = args.filter(a => !a.startsWith('-'))[1];
    let contentToSearch = stdin;

    if (fileArg) {
      const resolved = this.resolvePath(fileArg);
      const node = this.vfs[resolved];
      if (!node) return `grep: ${fileArg}: No such file or directory\n`;
      contentToSearch = node.content;
    }

    const lines = (contentToSearch || '').split('\n');
    const matched = lines.filter(l => l.includes(pattern));
    return matched.join('\n') + (matched.length > 0 ? '\n' : '');
  }

  // find command
  cmdFind(args) {
    const targetDir = this.resolvePath(args[0] || '.');
    const results = [];
    const recurse = (path) => {
      results.push(path);
      const node = this.vfs[path];
      if (node && node.type === 'dir') {
        for (const child of node.children) {
          const childPath = path === '/' ? `/${child}` : `${path}/${child}`;
          recurse(childPath);
        }
      }
    };
    recurse(targetDir);
    return results.join('\n') + '\n';
  }

  // uname command
  cmdUname(args) {
    const profile = window.MULTIOS_PROFILES ? window.MULTIOS_PROFILES[this.activeOs] : null;
    const kernel = profile ? profile.kernel : 'Linux cyberplatform 6.8.0-generic #1 SMP x86_64';
    if (args.includes('-a')) {
      return `${kernel}\n`;
    }
    return 'Linux\n';
  }

  // ip / ifconfig command
  cmdIp(args) {
    return [
      '\u001b[1;33m[SIMULATED ENVIRONMENT - Educational Sandbox]\u001b[0m',
      '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000',
      '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
      '    inet 127.0.0.1/8 scope host lo',
      '       valid_lft forever preferred_lft forever',
      '    inet6 ::1/128 scope host',
      '       valid_lft forever preferred_lft forever',
      '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000',
      '    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff',
      '    inet 192.168.1.105/24 brd 192.168.1.255 scope global dynamic eth0',
      '       valid_lft 86320sec preferred_lft 86320sec',
      '    inet6 fe80::42:acff:fe11:2/64 scope link',
      '       valid_lft forever preferred_lft forever\n'
    ].join('\n');
  }

  // ping command
  async cmdPing(args) {
    const host = args.find(a => !a.startsWith('-')) || '127.0.0.1';
    const lines = [
      `\u001b[1;33m[SIMULATED - Educational Sandbox]\u001b[0m`,
      `PING ${host} (${host}) 56(84) bytes of data.`,
      `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.042 ms`,
      `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.038 ms`,
      `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.045 ms`,
      `64 bytes from ${host}: icmp_seq=4 ttl=64 time=0.040 ms`,
      ``,
      `--- ${host} ping statistics ---`,
      `4 packets transmitted, 4 received, 0% packet loss, time 3060ms`,
      `rtt min/avg/max/mdev = 0.038/0.041/0.045/0.002 ms\n`
    ];
    return lines.join('\n');
  }

  // nmap network scanner command
  async cmdNmap(args) {
    const target = args.find(a => !a.startsWith('-')) || '192.168.1.100';
    return [
      `\u001b[1;33m[SIMULATED ENVIRONMENT - Educational Target Authorized]\u001b[0m`,
      `Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-20 08:50 UTC`,
      `Nmap scan report for ${target}`,
      `Host is up (0.00042s latency).`,
      `Not shown: 996 closed tcp ports (reset)`,
      `PORT     STATE SERVICE       VERSION`,
      `22/tcp   open  ssh           OpenSSH 9.2p1 Debian (protocol 2.0)`,
      `80/tcp   open  http          Apache httpd 2.4.52 ((Debian))`,
      `443/tcp  open  ssl/http      Apache httpd 2.4.52`,
      `3306/tcp open  mysql         MySQL 5.7.38-log`,
      `MAC Address: 02:42:AC:11:00:03 (Virtual vNIC)`,
      `Device type: general purpose`,
      `Running: Linux 5.X|6.X`,
      `OS details: Linux Kernel 6.5 (Debian/Parrot/Ubuntu Core)`,
      ``,
      `Nmap done: 1 IP address (1 host up) scanned in 1.48 seconds\n`
    ].join('\n');
  }

  // nikto web server scanner command
  async cmdNikto(args) {
    const target = args.find(a => !a.startsWith('-') && !a.startsWith('http')) || 'http://192.168.1.100';
    return [
      `\u001b[1;33m[SIMULATED ENVIRONMENT - Educational Target Authorized]\u001b[0m`,
      `- Nikto v2.5.0`,
      `---------------------------------------------------------------------------`,
      `+ Target IP:          192.168.1.100`,
      `+ Target Hostname:    ${target}`,
      `+ Target Port:        80`,
      `+ Start Time:         2026-11-20 08:51:14 (GMT0)`,
      `---------------------------------------------------------------------------`,
      `+ Server: Apache/2.4.52 (Debian)`,
      `+ /: The anti-clickjacking X-Frame-Options header is not present.`,
      `+ /: The X-Content-Type-Options header is not set.`,
      `+ /robots.txt: Entry '/admin/' discovered.`,
      `+ /admin/config.php: Found readable configuration file containing credentials.`,
      `+ 6748 requests: 0 error(s) and 4 item(s) reported on remote host`,
      `+ End Time:           2026-11-20 08:51:22 (GMT0) (8 seconds)\n`
    ].join('\n');
  }

  // sudo command handler
  async cmdSudo(args, stdin) {
    if (args.length === 0) return 'usage: sudo command\n';
    if (args[0] === 'su' || args[0] === '-i') {
      this.isRoot = true;
      this.currentUser = 'root';
      this.env.USER = 'root';
      this.env.HOME = '/root';
      return '';
    }
    const previousRoot = this.isRoot;
    this.isRoot = true;
    const subCmd = args.join(' ');
    const result = await this.executeSingle(subCmd, stdin);
    this.isRoot = previousRoot;
    return result;
  }

  // neofetch system info banner (dynamically changes per active OS)
  cmdNeofetch() {
    const profile = window.MULTIOS_PROFILES ? window.MULTIOS_PROFILES[this.activeOs] : null;
    const osName = profile ? `${profile.name} ${profile.version}` : 'Multi-OS Cybersecurity Platform';
    const kernel = profile ? profile.kernel : 'Linux 6.8.0-generic';
    const user = this.isRoot ? 'root' : this.currentUser;
    const host = this.env.HOSTNAME;

    if (this.activeOs === 'ubuntu') {
      return [
        '\u001b[1;31m',
        '         _---_        \u001b[1;32m' + user + '\u001b[0m@\u001b[1;31m' + host + '\u001b[0m',
        '        /     \\       \u001b[0m-------------------------',
        '       | () () |      \u001b[1;33mOS\u001b[0m: ' + osName,
        '        \\  _  /       \u001b[1;33mHost\u001b[0m: Ubuntu Noble Numbat 24.04 LTS',
        '         `---`        \u001b[1;33mKernel\u001b[0m: ' + kernel,
        '                      \u001b[1;33mDE\u001b[0m: GNOME 46 (Yaru-Dark)',
        '                      \u001b[1;33mShell\u001b[0m: bash 5.2.21',
        '                      \u001b[1;33mTerminal\u001b[0m: gnome-terminal',
        '                      \u001b[1;33mCPU\u001b[0m: AMD EPYC 7763 64-Core (4)',
        '                      \u001b[1;33mMemory\u001b[0m: 2310MiB / 8192MiB',
        '\u001b[0m'
      ].join('\n') + '\n';
    }

    if (this.activeOs === 'kali') {
      return [
        '\u001b[1;34m',
        '      ..............  \u001b[1;34m' + user + '\u001b[0m@\u001b[1;36m' + host + '\u001b[0m',
        '    .::::::::::::::   \u001b[0m-------------------------',
        '   .:::::::  :::::::  \u001b[1;34mOS\u001b[0m: ' + osName,
        '  .::::::    ::::::.  \u001b[1;34mHost\u001b[0m: Kali Linux Rolling 2024.3',
        ' .::::::.   .::::::.  \u001b[1;34mKernel\u001b[0m: ' + kernel,
        '                      \u001b[1;34mDE\u001b[0m: XFCE 4.18',
        '                      \u001b[1;34mShell\u001b[0m: zsh / bash 5.2.15',
        '                      \u001b[1;34mTools\u001b[0m: Metasploit, Nmap, Burp, Wireshark',
        '\u001b[0m'
      ].join('\n') + '\n';
    }

    if (this.activeOs === 'mint') {
      return [
        '\u001b[1;32m',
        '   MMMMMMMMMMMMMMMMM  \u001b[1;32m' + user + '\u001b[0m@\u001b[1;37m' + host + '\u001b[0m',
        '   MMMMMMMMMMMMMMMMM  \u001b[0m-------------------------',
        '   MM   MMMMMM   MMM  \u001b[1;32mOS\u001b[0m: ' + osName,
        '   MM   MMMMMM   MMM  \u001b[1;32mHost\u001b[0m: Linux Mint 22 (Wilma)',
        '   MM   MMMMMM   MMM  \u001b[1;32mKernel\u001b[0m: ' + kernel,
        '   MMMMMMMMMMMMMMMMM  \u001b[1;32mDE\u001b[0m: Cinnamon 6.2',
        '                      \u001b[1;32mTheme\u001b[0m: Mint-Y-Dark-Green',
        '\u001b[0m'
      ].join('\n') + '\n';
    }

    if (this.activeOs === 'fedora') {
      return [
        '\u001b[1;34m',
        '          /:-------------:\\          \u001b[1;34m' + user + '\u001b[0m@\u001b[1;36m' + host + '\u001b[0m',
        '       :-------------------::        \u001b[0m-------------------------',
        '     :-----------/shhOHbmp---:\\      \u001b[1;34mOS\u001b[0m: ' + osName,
        '   /-----------omMMMNNNMMD  ---:     \u001b[1;34mKernel\u001b[0m: ' + kernel,
        '  :-----------sMMMMNMNMP.    ---:    \u001b[1;34mDE\u001b[0m: GNOME 47 / XFCE',
        '  :-----------:MMMdP-------    ---\\  \u001b[1;34mSecurity Lab\u001b[0m: Forensics & Audit',
        '\u001b[0m'
      ].join('\n') + '\n';
    }

    // Default: Parrot Security OS
    return [
      '\u001b[1;36m',
      '      .---.        \u001b[1;36m' + user + '\u001b[0m@\u001b[1;32m' + host + '\u001b[0m',
      '     /     \\       \u001b[0m---------------------',
      '    | () () |      \u001b[1;34mOS\u001b[0m: ' + osName,
      '     \\  _  /       \u001b[1;34mHost\u001b[0m: Cloud Container (Debian 12 Bookworm Core)',
      '      `---`        \u001b[1;34mKernel\u001b[0m: ' + kernel,
      '    /       \\      \u001b[1;34mDE\u001b[0m: Parrot MATE 1.26',
      '   |         |     \u001b[1;34mShell\u001b[0m: bash 5.2.15',
      '   `--...---`      \u001b[1;34mMemory\u001b[0m: 2456MiB / 8167MiB',
      '\u001b[0m'
    ].join('\n') + '\n';
  }

  // ps aux command
  cmdPs(args) {
    return [
      `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND`,
      `root         1  0.0  0.1  21544  3200 ?        Ss   08:30   0:01 /sbin/init`,
      `root       142  0.0  0.2  45120  4800 ?        Ss   08:30   0:00 /usr/sbin/sshd -D`,
      `${this.currentUser}     420  0.1  0.5 125600 18400 pts/0    Ss   08:45   0:00 -bash`,
      `${this.currentUser}     512  0.2  1.2 342100 45200 ?        Sl   08:46   0:02 node /app/server/index.js`,
      `${this.currentUser}     890  0.0  0.1  18450  2100 pts/0    R+   08:52   0:00 ps aux\n`
    ].join('\n');
  }

  // help command
  cmdHelp() {
    return [
      `\u001b[1;36mMulti-OS Cybersecurity Linux Command Reference\u001b[0m`,
      `-------------------------------------------------------------------`,
      `  \u001b[1;32mpwd\u001b[0m               Print current working directory`,
      `  \u001b[1;32mls [-la]\u001b[0m          List directory contents`,
      `  \u001b[1;32mcd <dir>\u001b[0m          Change directory`,
      `  \u001b[1;32mmkdir <dir>\u001b[0m       Create new folder`,
      `  \u001b[1;32mtouch <file>\u001b[0m      Create empty file`,
      `  \u001b[1;32mcp <src> <dest>\u001b[0m   Copy files or directories`,
      `  \u001b[1;32mmv <src> <dest>\u001b[0m   Move or rename files`,
      `  \u001b[1;32mrm <file>\u001b[0m         Remove file or folder`,
      `  \u001b[1;32mcat <file>\u001b[0m        Display file contents`,
      `  \u001b[1;32mnano <file>\u001b[0m       Open interactive visual editor in terminal`,
      `  \u001b[1;32mgrep <pat> [f]\u001b[0m    Search text matching pattern`,
      `  \u001b[1;32mfind [dir]\u001b[0m        Search files in directory tree`,
      `  \u001b[1;32mwhoami\u001b[0m            Print current active user`,
      `  \u001b[1;32muname -a\u001b[0m          Print kernel & system architecture`,
      `  \u001b[1;32mip addr\u001b[0m           Show network interfaces & IP routing`,
      `  \u001b[1;32mping <host>\u001b[0m       Send ICMP ECHO_REQUEST to network hosts`,
      `  \u001b[1;32mnmap <target>\u001b[0m     Network exploration tool & port scanner`,
      `  \u001b[1;32mnikto <host>\u001b[0m      Web server security vulnerability scanner`,
      `  \u001b[1;32msudo <cmd>\u001b[0m        Execute command with superuser privileges`,
      `  \u001b[1;32mneofetch\u001b[0m          Show system specifications and OS banner`,
      `  \u001b[1;32mclear\u001b[0m             Clear terminal screen buffer`,
      `  \u001b[1;32mhistory\u001b[0m           Display command history list`,
      `-------------------------------------------------------------------`,
      `\u001b[1;33m[Note: Commands run in local sandbox simulation unless connected to a live cloud Docker node.]\u001b[0m\n`
    ].join('\n');
  }
}

window.LinuxShellEngine = LinuxShellEngine;
