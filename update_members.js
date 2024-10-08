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

    content += `### ${team.name}\n\n`; // Markdown for headings
    content += '| :construction_worker: | :construction_worker: | :construction_worker: |\n';
    content += '|:-------------------:|:-------------------:|:-------------------:|\n';

    const maxMembersPerRow = 3; // Show 3 members per row for better layout

    for (let i = 0; i < members.length; i += maxMembersPerRow) {
      content += '|'; // Start of a new row
      for (let j = 0; j < maxMembersPerRow; j++) {
        if (i + j < members.length) {
          const member = members[i + j];
          const login = member.login;
          const avatar_url = member.avatar_url;
          const link = `https://github.com/${login}`;
          
          // Image with size query parameter ?s=36 for reduced size
          content += ` ![${login}](${avatar_url}?s=36) [@${login}](${link}) |`;
        } else {
          content += '   |'; // Empty cell if row is incomplete
        }
      }
      content += '\n'; // End of row
    }

    content += '\n'; // Separate sections with newlines
  }

  // Write members section to members.md
  fs.writeFileSync('members.md', content);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
