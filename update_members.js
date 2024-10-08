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

    content += `## ${team.name}\n`;
    
    // Define the number of columns
    const columns = 6; // Fixed number of columns for table layout
    const rows = Math.ceil(members.length / columns);
    
    // Add the header for the Markdown table
    content += '| ' + ' | '.repeat(columns) + '|\n';
    content += '|:-------------------:|' + '|:-------------------:|'.repeat(columns - 1) + '\n';

    // Populate the table with member data
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const row = [];
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        const memberIndex = rowIndex * columns + colIndex;
        if (memberIndex < members.length) {
          const member = members[memberIndex];
          const login = member.login;
          const avatar_url = member.avatar_url;
          const link = `https://github.com/${login}`;
          row.push(`<img height='48' width='48' src='${avatar_url}'><br>@[${login}](${link})`);
        } else {
          row.push(''); // Empty cell for any remaining empty spots
        }
      }
      content += '|' + row.join('|') + '|\n'; // Join row content with pipes
    }
    content += '\n'; // Add a new line after each team for better readability
  }

  fs.writeFileSync('members.md', content);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
