// update_members.js

(async () => {
  const fetch = (await import('node-fetch')).default; // 动态导入 node-fetch
  const fs = require('fs');

  async function fetchTeams() {
    const response = await fetch(`https://api.github.com/orgs/CompPsyUnion/teams`, {
      headers: {
        'Authorization': `token ${process.env.PAT_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return await response.json();
  }

  async function fetchMembers() {
    const response = await fetch(`https://api.github.com/orgs/CompPsyUnion/members`, {
      headers: {
        'Authorization': `token ${process.env.PAT_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return await response.json();
  }

  async function fetchUserTeams(login) {
    const response = await fetch(`https://api.github.com/orgs/CompPsyUnion/members/${login}/teams`, {
      headers: {
        'Authorization': `token ${process.env.PAT_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return await response.json();
  }

  async function main() {
    const teams = await fetchTeams();
    const members = await fetchMembers();

    const teamMembers = {};
    for (const team of teams) {
      teamMembers[team.name] = [];
    }

    for (const member of members) {
      const login = member.login;
      const avatar_url = member.avatar_url;
      const userTeams = await fetchUserTeams(login);

      userTeams.forEach(team => {
        const teamName = team.name;
        teamMembers[teamName].push(`${login}|<img height='48' width='48' src='${avatar_url}'>`);
      });
    }

    let content = "# Organization Members\n";

    for (const team in teamMembers) {
      content += `## ${team}\n`;
      content += "|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|\n";
      content += "|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|\n";

      const membersRow = teamMembers[team];
      while (membersRow.length > 0) {
        const row = membersRow.splice(0, 6).join('|');
        content += row + '\n';
      }
    }

    fs.writeFileSync('members.md', content);
  }

  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
})();
