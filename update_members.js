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

    const maxMembersPerRow = 10; // Show a maximum of 10 members per row

    // Create the avatar and username rows
    for (let i = 0; i < members.length; i += maxMembersPerRow) {
      const rowMembers = members.slice(i, i + maxMembersPerRow); // Get the next set of members

      // Create a row for avatars
      content += '|'; // Start of a new row for avatars
      for (const member of rowMembers) {
        const avatar_url = member.avatar_url;
        content += ` ![${member.login}](${avatar_url}?s=36) |`; // Using Markdown syntax for images
      }
      content += '\n'; // End of the row for avatars

      // Create a row for usernames
      content += '|'; // Start of a new row for usernames
      for (const member of rowMembers) {
        const login = member.login;
        const link = `https://github.com/${login}`;
        content += ` [@${login}](${link}) |`; // Using Markdown syntax for links
      }
      content += '\n\n'; // End of the row for usernames
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
