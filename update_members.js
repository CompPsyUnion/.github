import fetch from 'node-fetch';
import fs from 'fs';

async function fetchTeams() {
  const response = await fetch(`https://api.github.com/orgs/CompPsyUnion/teams`, {
    headers: {
      'Authorization': `token ${process.env.PAT_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    console.error(`Error fetching teams: ${response.statusText}`);
    return [];
  }

  return await response.json();
}

async function fetchTeamMembers(membersUrl) {
  const response = await fetch(membersUrl, {
    headers: {
      'Authorization': `token ${process.env.PAT_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    console.error(`Error fetching team members: ${response.statusText}`);
    return [];
  }

  return await response.json();
}

async function main() {
  const teams = await fetchTeams();
  
  const teamMembers = {};

  for (const team of teams) {
    const membersUrl = team.members_url.replace("{/member}", ""); // Remove the placeholder
    const members = await fetchTeamMembers(membersUrl);
    
    teamMembers[team.name] = members.map(member => ({
      login: member.login,
      avatar_url: member.avatar_url
    }));
  }

  let content = "# Organization Members\n";

  for (const team in teamMembers) {
    content += `## ${team}\n`;
    content += "|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|:construction_worker:|\n";
    content += "|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|:-------------------:|\n";

    const membersRow = teamMembers[team].map(member => {
      return `${member.login}|<img height='48' width='48' src='${member.avatar_url}'>`;
    });

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
