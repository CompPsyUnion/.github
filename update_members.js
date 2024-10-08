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
  
  let content = "# Organization Members\n";

  for (const team of teams) {
    const membersUrl = team.members_url.replace("{/member}", ""); // Remove the placeholder
    const members = await fetchTeamMembers(membersUrl);

    content += `### ${team.name}\n`;
    
    // Set the maximum number of members per row
    const maxMembersPerRow = 10; 

    // Add the header for the Markdown table
    content += '|:construction_worker:'.repeat(maxMembersPerRow) + '|\n';
    content += '|:-------------------:'.repeat(maxMembersPerRow) + '|\n';

    // Populate the table with member data
    for (let i = 0; i < members.length; i += maxMembersPerRow) {
      const avatarsRow = [];
      const namesRow = [];
      
      for (let j = 0; j < maxMembersPerRow; j++) {
        const memberIndex = i + j;
        if (memberIndex < members.length) {
          const member = members[memberIndex];
          const login = member.login;
          const avatar_url = member.avatar_url;
          const link = `https://github.com/${login}`;
          avatarsRow.push(`<img height='48' width='48' src='${avatar_url}'>`);
          namesRow.push(`[@${login}](${link})`);
        } else {
          avatarsRow.push(''); // Empty cell for any remaining empty spots
          namesRow.push('');   // Empty cell for names
        }
      }

      content += '|' + avatarsRow.join('|') + '|\n'; // Join avatars row with pipes
      content += '|' + namesRow.join('|') + '|\n';   // Join names row with pipes
    }
    content += '\n'; // Add a new line after each team for better readability
  }

  fs.writeFileSync('members.md', content);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
