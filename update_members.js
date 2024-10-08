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
  
  let content = ""; // 去掉大标题，不需要初始的标题文本

  for (const team of teams) {
    const membersUrl = team.members_url.replace("{/member}", ""); // Remove the placeholder
    const members = await fetchTeamMembers(membersUrl);

    content += `### ${team.name}\n`;

    const maxMembersPerRow = 10;
    const memberCount = members.length < maxMembersPerRow ? members.length : maxMembersPerRow; // Limit to actual member count

    // Add the header for the Markdown table based on actual member count
    content += '|:construction_worker:'.repeat(memberCount) + '|\n';
    content += '|:-------------------:'.repeat(memberCount) + '|\n';

    const avatarsRow = [];
    const namesRow = [];
    
    // Populate the table with member data, but limit to actual member count
    for (let i = 0; i < memberCount; i++) {
      const member = members[i];
      const login = member.login;
      const avatar_url = member.avatar_url;
      const link = `https://github.com/${login}`;
      avatarsRow.push(`<img height='48' width='48' src='${avatar_url}'>`);
      namesRow.push(`[@${login}](${link})`);
    }

    content += '|' + avatarsRow.join('|') + '|\n'; // Join avatars row with pipes
    content += '|' + namesRow.join('|') + '|\n';   // Join names row with pipes

    content += '\n'; // Add a new line after each team for better readability
  }

  fs.writeFileSync('members.md', content);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
