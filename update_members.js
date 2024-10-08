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
  
  let content = ""; // Initialize content for the Markdown file

  for (const team of teams) {
    const membersUrl = team.members_url.replace("{/member}", ""); // Remove the placeholder
    const members = await fetchTeamMembers(membersUrl);

    content += `### ${team.name}\n\n`;

    const maxMembersPerRow = 10; // Limit to a maximum of 10 members per row
    const memberCount = Math.min(members.length, maxMembersPerRow); // Limit to actual member count

    // Markdown table header
    content += '| :construction_worker: '.repeat(memberCount) + '|\n';
    content += '|:-------------------:'.repeat(memberCount) + '|\n';

    const avatarsRow = [];
    const namesRow = [];
    
    // Populate the table with member data
    for (let i = 0; i < memberCount; i++) {
      const member = members[i];
      const login = member.login;
      const avatar_url = member.avatar_url;
      const link = `https://github.com/${login}`;
      
      // Use Markdown syntax for images and links
      avatarsRow.push(`![${login}](${avatar_url})`); // Using Markdown syntax for images
      namesRow.push(`[@${login}](${link})`); // Using Markdown syntax for links
    }

    content += '|' + avatarsRow.join('|') + '|\n'; // Join avatars row with pipes
    content += '|' + namesRow.join('|') + '|\n';   // Join names row with pipes

    content += '\n'; // Add a new line after each team for better readability
  }

  fs.writeFileSync('README.md', content);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
